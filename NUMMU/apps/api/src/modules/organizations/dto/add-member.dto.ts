import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { OrganizationRole } from '@prisma/client';

export class AddMemberDto {
  @ApiProperty({
    example: 'cmv95frgq0000vhrgfrv04x18',
    description: 'Target User CUID to add to organization',
  })
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @ApiProperty({
    enum: OrganizationRole,
    default: OrganizationRole.MEMBER,
    description: 'Role within the organization',
  })
  @IsEnum(OrganizationRole)
  role!: OrganizationRole;
}
