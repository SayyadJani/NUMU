import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, type AuthenticatedUser } from '../auth/decorators/current-user.decorator';
import { type Role } from '@prisma/client';

@ApiTags('Organizations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly orgService: OrganizationsService) {}

  @Get()
  @ApiOperation({ summary: "List current user's organization memberships" })
  @ApiResponse({ status: 200, description: 'User organization memberships' })
  listUserOrganizations(@CurrentUser() user: AuthenticatedUser) {
    return this.orgService.listUserOrganizations(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new organization (User becomes OWNER)' })
  @ApiResponse({ status: 201, description: 'Organization created successfully' })
  @ApiResponse({ status: 409, description: 'Organization slug already exists' })
  createOrganization(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateOrganizationDto,
  ) {
    return this.orgService.createOrganization(user.id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get organization details (Member or Platform Admin only)' })
  @ApiParam({ name: 'id', description: 'Organization CUID' })
  @ApiResponse({ status: 200, description: 'Organization details with member roster' })
  @ApiResponse({ status: 403, description: 'Forbidden: Requester is not an active member' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  getOrganization(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.orgService.getOrganization(user.id, user.role as Role, id);
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Add a user to an organization (OWNER or ADMIN only)' })
  @ApiParam({ name: 'id', description: 'Organization CUID' })
  @ApiResponse({ status: 201, description: 'Member added successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden: Insufficient membership role' })
  @ApiResponse({ status: 409, description: 'User is already a member' })
  addMember(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: AddMemberDto,
  ) {
    return this.orgService.addMember(user.id, user.role as Role, id, dto);
  }

  @Delete(':id/members/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove a member from an organization' })
  @ApiParam({ name: 'id', description: 'Organization CUID' })
  @ApiParam({ name: 'userId', description: 'Target user ID' })
  @ApiResponse({ status: 200, description: 'Member removed successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  removeMember(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Param('userId') userId: string,
  ) {
    return this.orgService.removeMember(user.id, user.role as Role, id, userId);
  }
}
