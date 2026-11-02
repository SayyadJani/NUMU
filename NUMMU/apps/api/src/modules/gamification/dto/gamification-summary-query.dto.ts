import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, Max } from 'class-validator';

export class GamificationSummaryQueryDto {
  @ApiPropertyOptional({
    description: 'Timezone offset in minutes from UTC (e.g. 0 for UTC, -330 for IST)',
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
