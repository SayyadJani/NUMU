import { IsString, IsOptional, IsBoolean, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AutosaveAnswerDto {
  @ApiProperty({ description: 'Problem unique slug' })
  @IsString()
  problemSlug!: string;

  @ApiProperty({ description: 'Current code buffer' })
  @IsString()
  code!: string;

  @ApiProperty({ description: 'Programming language identifier' })
  @IsString()
  language!: string;

  @ApiPropertyOptional({ description: 'Mark for review flag' })
  @IsOptional()
  @IsBoolean()
  isMarkedForReview?: boolean;

  @ApiPropertyOptional({ description: 'Current question index in test' })
  @IsOptional()
  @IsInt()
  @Min(0)
  currentQuestionIndex?: number;

  @ApiPropertyOptional({ description: 'Time spent on this question in seconds' })
  @IsOptional()
  @IsInt()
  @Min(0)
  timeSpentSeconds?: number;
}
