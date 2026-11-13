import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../modules/auth/guards/roles.guard';
import { Roles } from '../../modules/auth/decorators/roles.decorator';

/**
 * Staff roles that may access the admin console.
 * PLATFORM_ADMIN is implicitly allowed everywhere by RolesGuard.
 */
export const STAFF_ROLES: Role[] = [Role.TRAINER, Role.COLLEGE_ADMIN];

/**
 * Single decorator for every admin endpoint: JWT auth + role check + Swagger auth.
 * Defaults to all staff roles; pass explicit roles to narrow access.
 */
export function AdminOnly(...roles: Role[]) {
  return applyDecorators(
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles(...(roles.length > 0 ? roles : STAFF_ROLES)),
    ApiBearerAuth('JWT'),
  );
}

