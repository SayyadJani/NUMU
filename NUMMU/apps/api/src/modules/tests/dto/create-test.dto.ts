import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsEnum,
  IsArray,
  IsDateString,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ContentStatus } from '@prisma/client';

export class TestQuestionItemDto {
  @ApiProperty({ description: 'Problem ID or slug' })
  @IsString()
  problemIdOrSlug!: string;

  @ApiPropertyOptional({ description: 'Marks for this question', default: 20 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  marks?: number;

  @ApiPropertyOptional({ description: '1-based display order index' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  orderIndex?: number;
}

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
  @Type(() => Number)
  @IsInt()
  @Min(1)
  weekNumber?: number;

  @ApiPropertyOptional({ description: 'Test instructions & rules' })
  @IsOptional()
  @IsString()
  instructions?: string;

  @ApiPropertyOptional({ description: 'Duration in minutes', example: 90, default: 90 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(5)
  @Max(360)
  durationMinutes?: number;

  @ApiPropertyOptional({ description: 'Passing percentage', example: 60, default: 60 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  passPercentage?: number;

  @ApiPropertyOptional({ description: 'Total marks', example: 100, default: 100 })
  @IsOptional()
  @Type(() => Number)
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

  @ApiPropertyOptional({ description: 'Max allowed tab switches before auto-submit', default: 3 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  maxTabSwitches?: number;

  @ApiPropertyOptional({ description: 'Require fullscreen mode during test', default: true })
  @IsOptional()
  @IsBoolean()
  requireFullscreen?: boolean;

  @ApiPropertyOptional({ description: 'Disable copy and paste during test', default: true })
  @IsOptional()
  @IsBoolean()
  disableCopyPaste?: boolean;

  @ApiPropertyOptional({ description: 'List of problem slugs or IDs to assign', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  problemSlugs?: string[];

  @ApiPropertyOptional({
    description: 'Ordered question assignments with custom marks per question',
    type: [TestQuestionItemDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TestQuestionItemDto)
  questions?: TestQuestionItemDto[];
}
