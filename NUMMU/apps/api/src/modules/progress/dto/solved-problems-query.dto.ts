import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, Max, IsString, IsIn } from 'class-validator';
import { Difficulty } from '@prisma/client';

export class SolvedProblemsQueryDto {
  @ApiPropertyOptional({
    description: 'Page number (1-based)',
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page (max 100)',
    default: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Filter by problem difficulty',
    enum: Difficulty,
  })
  @IsOptional()
  @IsString()
  @IsIn([Difficulty.EASY, Difficulty.MEDIUM, Difficulty.HARD])
  difficulty?: Difficulty;

  @ApiPropertyOptional({
    description: 'Filter by topic slug',
    example: 'arrays-and-hashing',
  })
  @IsOptional()
  @IsString()
  topic?: string;
}
