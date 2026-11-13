import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, Max, IsString } from 'class-validator';

export class LeaderboardQueryDto {
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
    description: 'Number of items per page',
    default: 50,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 50;

  @ApiPropertyOptional({
    description: 'Filter scope: global | college | batch',
    default: 'global',
  })
  @IsOptional()
  @IsString()
  scope?: string = 'global';

  @ApiPropertyOptional({
    description: 'Division tier filter: all | Legend | Guardian | Knight | Specialist | Pupil',
    default: 'all',
  })
  @IsOptional()
  @IsString()
  tier?: string = 'all';

  @ApiPropertyOptional({
    description: 'Timeframe: weekly | monthly | all-time',
    default: 'all-time',
  })
  @IsOptional()
  @IsString()
  timeframe?: string = 'all-time';

  @ApiPropertyOptional({
    description: 'Search string for user name, college, or handle',
  })
  @IsOptional()
  @IsString()
  search?: string;
}

