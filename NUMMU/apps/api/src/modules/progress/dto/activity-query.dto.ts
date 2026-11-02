import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, IsInt, Min, Max, Matches } from 'class-validator';

export class ActivityQueryDto {
  @ApiPropertyOptional({
    description: 'Start date in YYYY-MM-DD or ISO 8601 format',
    example: '2026-07-21',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/, {
    message: 'startDate must be in YYYY-MM-DD or ISO 8601 format',
  })
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date in YYYY-MM-DD or ISO 8601 format',
    example: '2026-10-19',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/, {
    message: 'endDate must be in YYYY-MM-DD or ISO 8601 format',
  })
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Timezone offset in minutes from UTC (e.g., 0 for UTC, -330 for IST)',
    default: 0,
    minimum: -840,
    maximum: 840,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(-840)
  @Max(840)
  tzOffsetMinutes?: number = 0;
}
