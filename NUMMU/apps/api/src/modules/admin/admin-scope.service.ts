import { ForbiddenException, Injectable } from '@nestjs/common';
import { OrganizationRole, Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { type AuthenticatedUser } from '../auth/decorators/current-user.decorator';

/** Organization roles that grant management rights over a batch's students. */
const MANAGING_ORG_ROLES: OrganizationRole[] = [
  OrganizationRole.OWNER,
  OrganizationRole.ADMIN,
  OrganizationRole.TRAINER,
];

/**
 * Central data-scoping rules for the admin console (enforced server-side).
 *
 * - PLATFORM_ADMIN: unrestricted (scope = null).
 * - TRAINER / COLLEGE_ADMIN: only students belonging to organizations (batches)
 *   where they hold an OWNER / ADMIN / TRAINER membership.
 */
@Injectable()
export class AdminScopeService {
  constructor(private readonly prisma: PrismaService) {}

  isPlatformAdmin(user: AuthenticatedUser): boolean {
    return user.role === Role.PLATFORM_ADMIN;
  }

  /** Organization IDs the requester may manage, or null for unrestricted. */
  async getManagedOrgIds(user: AuthenticatedUser): Promise<string[] | null> {
    if (this.isPlatformAdmin(user)) return null;
    const memberships = await this.prisma.organizationMember.findMany({
      where: { userId: user.id, role: { in: MANAGING_ORG_ROLES } },
      select: { organizationId: true },
    });
    return memberships.map((m) => m.organizationId);
  }

  /** User IDs the requester may view, or null for unrestricted. */
  async getScopedUserIds(user: AuthenticatedUser): Promise<string[] | null> {
    const orgIds = await this.getManagedOrgIds(user);
    if (orgIds === null) return null;
    if (orgIds.length === 0) return [];
    const members = await this.prisma.organizationMember.findMany({
      where: { organizationId: { in: orgIds } },
      select: { userId: true },
      distinct: ['userId'],
    });
    return members.map((m) => m.userId);
  }

  /** Prisma `where` fragment restricting a userId column to the requester's scope. */
  async userIdFilter(user: AuthenticatedUser): Promise<{ userId?: { in: string[] } }> {
    const ids = await this.getScopedUserIds(user);
    return ids === null ? {} : { userId: { in: ids } };
  }

  async assertCanAccessUser(user: AuthenticatedUser, targetUserId: string): Promise<void> {
    const ids = await this.getScopedUserIds(user);
    if (ids !== null && !ids.includes(targetUserId)) {
      throw new ForbiddenException('You can only access students in batches you manage');
    }
  }

  async assertCanManageOrg(user: AuthenticatedUser, orgId: string): Promise<void> {
    const ids = await this.getManagedOrgIds(user);
    if (ids !== null && !ids.includes(orgId)) {
      throw new ForbiddenException('You do not manage this batch');
    }
  }
}

