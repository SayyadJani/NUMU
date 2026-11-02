import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { Difficulty, ContentStatus } from '@prisma/client';

export class ProblemQueryDto {
  @ApiPropertyOptional({ example: 1, default: 1, description: 'Page number' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, default: 20, description: 'Page size limit (max 100)' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 20;

  @ApiPropertyOptional({ enum: Difficulty, description: 'Filter by difficulty' })
  @IsEnum(Difficulty)
  @IsOptional()
  difficulty?: Difficulty;

  @ApiPropertyOptional({ example: 'arrays', description: 'Filter by topic slug' })
  @IsString()
  @IsOptional()
  topic?: string;

  @ApiPropertyOptional({ example: 'two sum', description: 'Search query for title and slug' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ enum: ['newest', 'difficulty', 'acceptance', 'popularity'], default: 'newest' })
  @IsString()
  @IsOptional()
  sortBy?: 'newest' | 'difficulty' | 'acceptance' | 'popularity' = 'newest';

  @ApiPropertyOptional({ enum: ContentStatus, description: 'Filter by publication status (Admins/Trainers only)' })
  @IsEnum(ContentStatus)
  @IsOptional()
  status?: ContentStatus;
}
