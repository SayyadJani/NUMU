import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, Max, IsString, IsIn } from 'class-validator';
import type { SubmissionVerdict } from '@numu/types';

export class SubmissionQueryDto {
  @ApiPropertyOptional({
    description: 'Page number (1-based)',
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number | undefined = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page (max 50)',
    default: 20,
    minimum: 1,
    maximum: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number | undefined = 20;

  @ApiPropertyOptional({
    description: 'Filter submissions by problem slug',
    example: 'two-sum',
  })
  @IsOptional()
  @IsString()
  problemSlug?: string | undefined;

  @ApiPropertyOptional({
    description: 'Filter submissions by verdict',
    enum: [
      'PENDING',
      'ACCEPTED',
      'WRONG_ANSWER',
      'TIME_LIMIT_EXCEEDED',
      'MEMORY_LIMIT_EXCEEDED',
      'COMPILATION_ERROR',
      'RUNTIME_ERROR',
      'INTERNAL_ERROR',
    ],
  })
  @IsOptional()
  @IsString()
  @IsIn([
    'PENDING',
    'ACCEPTED',
    'WRONG_ANSWER',
    'TIME_LIMIT_EXCEEDED',
    'MEMORY_LIMIT_EXCEEDED',
    'COMPILATION_ERROR',
    'RUNTIME_ERROR',
    'INTERNAL_ERROR',
  ])
  verdict?: SubmissionVerdict | undefined;
}
