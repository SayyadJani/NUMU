import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { type CreateUserDto } from './dto/create-user.dto';
import { type UpdateProfileDto } from './dto/update-profile.dto';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retrieves public profile for a user by username.
   * Strips private fields like email, internal flags, and tokens.
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
      // Update name on User model if provided
      if (name !== undefined) {
        await tx.user.update({
          where: { id: userId },
          data: { name },
        });
      }

      // Upsert profile data
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
   * Lists users with pagination for administrative/trainer operations.
   */
  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
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
          createdAt: true,
          profile: {
            select: {
              avatarUrl: true,
              college: true,
              headline: true,
            },
          },
        },
      }),
      this.prisma.user.count(),
    ]);

    return {
      data: users,
      pagination: {
        page,
        pageSize: limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Retrieves single user by internal ID.
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
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    return user;
  }

  /**
   * Admin or internal creation of user.
   */
  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException(`User with email "${dto.email}" already exists`);
    }

    return this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        role: Role.STUDENT,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
  }

  /**
   * Removes user by ID.
   */
  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
