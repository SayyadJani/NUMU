import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { type CreateOrganizationDto } from './dto/create-organization.dto';
import { type AddMemberDto } from './dto/add-member.dto';
import { Role, OrganizationRole, Prisma } from '@prisma/client';

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retrieves organizations where the user is an active member.
   */
  async listUserOrganizations(userId: string) {
    const memberships = await this.prisma.organizationMember.findMany({
      where: { userId },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            logoUrl: true,
            createdAt: true,
            _count: {
              select: { members: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return memberships.map((m) => ({
      membershipId: m.id,
      role: m.role,
      joinedAt: m.createdAt,
      organization: m.organization,
    }));
  }

  /**
   * Creates a new organization and assigns the creator as OWNER.
   */
  async createOrganization(userId: string, dto: CreateOrganizationDto) {
    const existing = await this.prisma.organization.findUnique({
      where: { slug: dto.slug },
    });

    if (existing) {
      throw new ConflictException(`An organization with slug "${dto.slug}" already exists`);
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const org = await tx.organization.create({
          data: {
            name: dto.name,
            slug: dto.slug,
            description: dto.description || null,
            logoUrl: dto.logoUrl || null,
          },
        });

        await tx.organizationMember.create({
          data: {
            organizationId: org.id,
            userId,
            role: OrganizationRole.OWNER,
          },
        });

        return org;
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException(`An organization with slug "${dto.slug}" already exists`);
      }
      throw err;
    }
  }

  /**
   * Retrieves organization details with membership validation (Tenant Isolation).
   */
  async getOrganization(userId: string, userRole: Role, organizationId: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        members: {
          select: {
            id: true,
            role: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!org) {
      throw new NotFoundException(`Organization with ID "${organizationId}" not found`);
    }

    // Platform admin has universal oversight
    if (userRole === Role.PLATFORM_ADMIN) {
      return org;
    }

    // Enforce tenant boundary: user must be an active member of this organization
    const isMember = org.members.some((m) => m.user.id === userId);
    if (!isMember) {
      throw new ForbiddenException(
        'Access denied: You are not a member of this organization',
      );
    }

    return org;
  }

  /**
   * Adds or invites a member to an organization.
   * Requires OWNER or ADMIN role in the target organization.
   */
  async addMember(
    requesterId: string,
    requesterRole: Role,
    organizationId: string,
    dto: AddMemberDto,
  ) {
    await this.assertCanManageMembers(requesterId, requesterRole, organizationId);

    // Verify target user exists
    const targetUser = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });
    if (!targetUser) {
      throw new NotFoundException(`User with ID "${dto.userId}" not found`);
    }

    // Check if membership already exists
    const existing = await this.prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId: dto.userId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('User is already a member of this organization');
    }

    return this.prisma.organizationMember.create({
      data: {
        organizationId,
        userId: dto.userId,
        role: dto.role,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Removes a member from an organization.
   */
  async removeMember(
    requesterId: string,
    requesterRole: Role,
    organizationId: string,
    targetUserId: string,
  ) {
    // If not removing self, must have management privileges
    if (requesterId !== targetUserId) {
      await this.assertCanManageMembers(requesterId, requesterRole, organizationId);
    }

    const membership = await this.prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId: targetUserId,
        },
      },
    });

    if (!membership) {
      throw new NotFoundException('Membership record not found');
    }

    // Prevent removing the sole OWNER
    if (membership.role === OrganizationRole.OWNER) {
      const ownerCount = await this.prisma.organizationMember.count({
        where: {
          organizationId,
          role: OrganizationRole.OWNER,
        },
      });
      if (ownerCount <= 1) {
        throw new BadRequestException(
          'Cannot remove the only owner of an organization. Transfer ownership first.',
        );
      }
    }

    await this.prisma.organizationMember.delete({
      where: { id: membership.id },
    });

    return { message: 'Member removed successfully' };
  }

  /**
   * Verifies that the requester has administrative authority over the organization.
   */
  private async assertCanManageMembers(
    requesterId: string,
    requesterRole: Role,
    organizationId: string,
  ) {
    if (requesterRole === Role.PLATFORM_ADMIN) {
      return;
    }

    const requesterMembership = await this.prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId: requesterId,
        },
      },
    });

    if (
      !requesterMembership ||
      (requesterMembership.role !== OrganizationRole.OWNER &&
        requesterMembership.role !== OrganizationRole.ADMIN)
    ) {
      throw new ForbiddenException(
        'Access denied: You must be an organization Owner or Admin to manage members',
      );
    }
  }
}
