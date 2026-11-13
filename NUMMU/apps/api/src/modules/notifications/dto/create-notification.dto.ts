import { IsString, IsNotEmpty, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationCategory, NotificationTag, Role } from '@prisma/client';

export class CreateNotificationDto {
  @ApiProperty({ example: 'Weekly DSA Assessment #3 is Now Live' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'Covers Dynamic Programming and Graphs. Assessment open until Sunday 11:59 PM.' })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({ enum: NotificationCategory, default: NotificationCategory.SYSTEM })
  @IsEnum(NotificationCategory)
  category!: NotificationCategory;

  @ApiProperty({ enum: NotificationTag, default: NotificationTag.System })
  @IsEnum(NotificationTag)
  tag!: NotificationTag;

  @ApiPropertyOptional({ example: '/dashboard/tests?test=weekly-dsa-3' })
  @IsString()
  @IsOptional()
  linkUrl?: string;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isBroadcast?: boolean;

  @ApiPropertyOptional({ enum: Role })
  @IsEnum(Role)
  @IsOptional()
  targetRole?: Role;

  @ApiPropertyOptional({ description: 'Target specific user ID if not broadcast' })
  @IsString()
  @IsOptional()
  userId?: string;
}
