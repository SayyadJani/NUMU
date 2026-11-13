import {
  Injectable,
  NotFoundException,
  ConflictException,
  type OnModuleInit,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PasswordService } from '../auth/services/password.service';
import { type CreateUserDto, type AdminUpdateUserDto } from './dto/create-user.dto';
import { type UpdateProfileDto } from './dto/update-profile.dto';
import { Role, type Prisma } from '@prisma/client';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
  ) {}

  async onModuleInit(): Promise<void> {
    try {
      const existing = await this.prisma.user.findUnique({
        where: { email: 'admin@numu.edu' },
      });
      if (!existing) {
        const passwordHash = await this.passwordService.hash('Admin@123');
        const created = await this.prisma.user.create({
          data: {
            email: 'admin@numu.edu',
            username: 'numu_admin',
            name: 'NUMU Platform Admin',
            passwordHash,
            role: Role.PLATFORM_ADMIN,
            isActive: true,
            isEmailVerified: true,
          },
        });
        await this.prisma.profile.create({
          data: {
            userId: created.id,
            headline: 'NUMU Platform Administrator',
            college: 'NUMU EdTech',
          },
        });
      }
    } catch {
      // Ignore if DB is not yet migrated
    }
  }

  /**
   * Retrieves public profile for a user by username.
   */
  async findByUsername(username: string) {
    const cleanUsername = username.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({
      where: { username: cleanUsername },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        createdAt: true,
        profile: {
          select: {
            bio: true,
            headline: true,
            avatarUrl: true,
            college: true,
            gradYear: true,
            githubUrl: true,
            linkedinUrl: true,
            websiteUrl: true,
            location: true,
            skills: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with username "@${cleanUsername}" not found`);
    }

    return user;
  }

  /**
   * Retrieves current authenticated user's complete profile.
   */
  async findMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        isActive: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
        profile: true,
        organizationMembers: {
          select: {
            id: true,
            role: true,
            organization: {
              select: {
                id: true,
                name: true,
                slug: true,
                logoUrl: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    return user;
  }

  /**
   * Updates permissible profile and user fields for current user.
   */
  async updateMe(userId: string, dto: UpdateProfileDto) {
    const {
      name,
      bio,
      headline,
      avatarUrl,
      college,
      gradYear,
      githubUrl,
      linkedinUrl,
      websiteUrl,
      location,
      skills,
    } = dto;

    await this.prisma.$transaction(async (tx) => {
      if (name !== undefined) {
        await tx.user.update({
          where: { id: userId },
          data: { name },
        });
      }

      await tx.profile.upsert({
        where: { userId },
        update: {
          ...(bio !== undefined && { bio }),
          ...(headline !== undefined && { headline }),
          ...(avatarUrl !== undefined && { avatarUrl }),
          ...(college !== undefined && { college }),
          ...(gradYear !== undefined && { gradYear }),
          ...(githubUrl !== undefined && { githubUrl }),
          ...(linkedinUrl !== undefined && { linkedinUrl }),
          ...(websiteUrl !== undefined && { websiteUrl }),
          ...(location !== undefined && { location }),
          ...(skills !== undefined && { skills }),
        },
        create: {
          userId,
          bio: bio || null,
          headline: headline || null,
          avatarUrl: avatarUrl || null,
          college: college || null,
          gradYear: gradYear || null,
          githubUrl: githubUrl || null,
          linkedinUrl: linkedinUrl || null,
          websiteUrl: websiteUrl || null,
          location: location || null,
          skills: skills || [],
        },
      });
    });

    return this.findMe(userId);
  }

  /**
   * Lists users with search, role/status filters, and pagination for administrative operations.
   */
  async findAll(
    page = 1,
    limit = 20,
    filters?: { search?: string; role?: Role; isActive?: string },
  ) {
    const skip = (page - 1) * limit;
    const where: Prisma.UserWhereInput = {};

    if (filters?.role) {
      where.role = filters.role;
    }

    if (filters?.isActive === 'true') {
      where.isActive = true;
    } else if (filters?.isActive === 'false') {
      where.isActive = false;
    }

    if (filters?.search && filters.search.trim().length > 0) {
      const q = filters.search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { username: { contains: q, mode: 'insensitive' } },
        { profile: { college: { contains: q, mode: 'insensitive' } } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          username: true,
          name: true,
          role: true,
          isActive: true,
          isEmailVerified: true,
          createdAt: true,
          _count: {
            select: {
              submissions: true,
              testAttempts: true,
            },
          },
          profile: {
            select: {
              avatarUrl: true,
              college: true,
              gradYear: true,
              headline: true,
            },
          },
          organizationMembers: {
            select: {
              role: true,
              organization: {
                select: { id: true, name: true, slug: true },
              },
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users.map((u) => ({
        ...u,
        submissionsCount: u._count.submissions,
        testAttemptsCount: u._count.testAttempts,
        batches: u.organizationMembers.map((m) => ({
          id: m.organization.id,
          name: m.organization.name,
          slug: m.organization.slug,
          role: m.role,
        })),
      })),
      pagination: {
        page,
        pageSize: limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  /**
   * Retrieves single user by internal ID with recent submissions and test attempts.
   */
  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        isActive: true,
        isEmailVerified: true,
        createdAt: true,
        profile: true,
        organizationMembers: {
          select: {
            id: true,
            role: true,
            createdAt: true,
            organization: {
              select: { id: true, name: true, slug: true, description: true },
            },
          },
        },
        testAttempts: {
          orderBy: { startedAt: 'desc' },
          take: 20,
          select: {
            id: true,
            status: true,
            score: true,
            percentage: true,
            passed: true,
            tabSwitchCount: true,
            fullscreenExitCount: true,
            autoSubmitted: true,
            terminationReason: true,
            startedAt: true,
            submittedAt: true,
            test: {
              select: {
                id: true,
                title: true,
                slug: true,
                totalMarks: true,
              },
            },
          },
        },
        submissions: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          select: {
            id: true,
            language: true,
            verdict: true,
            runtimeMs: true,
            testsPassed: true,
            totalTests: true,
            createdAt: true,
            problem: {
              select: {
                id: true,
                title: true,
                slug: true,
                difficulty: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    return user;
  }

  /**
   * Admin creation of user (student, trainer, or admin) with optional password & profile.
   */
  async create(dto: CreateUserDto) {
    const email = dto.email.toLowerCase().trim();
    const existing = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      throw new ConflictException(`User with email "${email}" already exists`);
    }

    const cleanUsername =
      dto.username?.toLowerCase().trim() ||
      email.split('@')[0]?.replace(/[^a-z0-9_]/g, '') + '_' + Math.floor(100 + Math.random() * 900);

    const passwordHash = dto.password
      ? await this.passwordService.hash(dto.password)
      : await this.passwordService.hash('Student@123');

    return this.prisma.user.create({
      data: {
        email,
        username: cleanUsername,
        name: dto.name?.trim() || cleanUsername,
        passwordHash,
        role: dto.role ?? Role.STUDENT,
        isActive: dto.isActive ?? true,
        isEmailVerified: true,
        profile: {
          create: {
            college: dto.college || null,
            gradYear: dto.gradYear || null,
          },
        },
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        isActive: true,
        profile: true,
        createdAt: true,
      },
    });
  }

  /**
   * Admin update of user account (role, status, credentials, college/profile).
   */
  async adminUpdate(id: string, dto: AdminUpdateUserDto) {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    const passwordHash = dto.password
      ? await this.passwordService.hash(dto.password)
      : undefined;

    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id },
        data: {
          ...(dto.email !== undefined && { email: dto.email.toLowerCase().trim() }),
          ...(dto.name !== undefined && { name: dto.name.trim() }),
          ...(dto.username !== undefined && { username: dto.username.toLowerCase().trim() }),
          ...(dto.role !== undefined && { role: dto.role }),
          ...(dto.isActive !== undefined && { isActive: dto.isActive }),
          ...(passwordHash !== undefined && { passwordHash }),
        },
      });

      if (dto.college !== undefined || dto.gradYear !== undefined) {
        await tx.profile.upsert({
          where: { userId: id },
          update: {
            ...(dto.college !== undefined && { college: dto.college || null }),
            ...(dto.gradYear !== undefined && { gradYear: dto.gradYear || null }),
          },
          create: {
            userId: id,
            college: dto.college || null,
            gradYear: dto.gradYear || null,
          },
        });
      }
    });

    return this.findOne(id);
  }

  /**
   * Removes user by ID.
   * Protects historical assessment attempts, submissions, and authored content:
   * if the user has learning/authoring history, soft-deactivates instead of destructive deletion.
   */
  async remove(id: string) {
    const existing = await this.prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            submissions: true,
            testAttempts: true,
            authoredProblems: true,
            authoredTests: true,
          },
        },
      },
    });

    if (!existing) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    const totalHistory =
      existing._count.submissions +
      existing._count.testAttempts +
      existing._count.authoredProblems +
      existing._count.authoredTests;

    if (totalHistory > 0) {
      await this.prisma.user.update({
        where: { id },
        data: { isActive: false },
      });
      return {
        softDeactivated: true,
        message:
          'User has historical submissions or assessment records and was safely deactivated instead of permanently deleted.',
      };
    }

    await this.prisma.user.delete({
      where: { id },
    });
    return { softDeactivated: false, message: 'User account deleted.' };
  }
}
