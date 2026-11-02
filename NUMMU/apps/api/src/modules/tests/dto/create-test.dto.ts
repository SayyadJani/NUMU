import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsEnum,
  IsArray,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ContentStatus } from '@prisma/client';

export class CreateTestDto {
  @ApiProperty({ description: 'Test title', example: 'Weekly DSA Test - 12' })
  @IsString()
  title!: string;

  @ApiPropertyOptional({ description: 'Unique slug', example: 'weekly-dsa-12' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ description: 'Test description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Week number', example: 12 })
  @IsOptional()
  @IsInt()
  @Min(1)
  weekNumber?: number;

  @ApiPropertyOptional({ description: 'Test instructions & rules' })
  @IsOptional()
  @IsString()
  instructions?: string;

  @ApiPropertyOptional({ description: 'Duration in minutes', example: 90, default: 90 })
  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(360)
  durationMinutes?: number;

  @ApiPropertyOptional({ description: 'Passing percentage', example: 60, default: 60 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  passPercentage?: number;

  @ApiPropertyOptional({ description: 'Total marks', example: 100, default: 100 })
  @IsOptional()
  @IsInt()
  @Min(1)
  totalMarks?: number;

  @ApiPropertyOptional({ enum: ContentStatus, default: ContentStatus.DRAFT })
  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;

  @ApiPropertyOptional({ description: 'Start time availability' })
  @IsOptional()
  @IsDateString()
  startTime?: string;

  @ApiPropertyOptional({ description: 'End time availability' })
  @IsOptional()
  @IsDateString()
  endTime?: string;

  @ApiPropertyOptional({ description: 'List of problem slugs or IDs to assign', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  problemSlugs?: string[];
}
