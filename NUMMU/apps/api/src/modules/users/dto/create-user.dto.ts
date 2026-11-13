import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({ example: 'alex@example.com', description: 'User unique email address' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiPropertyOptional({ example: 'Alex Morgan', description: 'Display name of the user' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'alexmorgan', description: 'Unique username handle' })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiPropertyOptional({ example: 'Student@123', description: 'Initial password (min 8 chars)' })
  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;

  @ApiPropertyOptional({ enum: Role, default: Role.STUDENT })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 'IIT Hyderabad' })
  @IsString()
  @IsOptional()
  college?: string;

  @ApiPropertyOptional({ example: 2027 })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  gradYear?: number;
}

export class AdminUpdateUserDto {
  @ApiPropertyOptional()
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  username?: string;

  @ApiPropertyOptional({ description: 'Optional new password to reset account credentials' })
  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;

  @ApiPropertyOptional({ enum: Role })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  college?: string;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  gradYear?: number;
}
