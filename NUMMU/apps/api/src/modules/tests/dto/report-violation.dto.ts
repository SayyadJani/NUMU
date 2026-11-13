import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { TestViolationType } from '@prisma/client';

export class ReportViolationDto {
  @ApiProperty({ enum: TestViolationType, example: TestViolationType.TAB_SWITCH })
  @IsEnum(TestViolationType)
  type!: TestViolationType;
}

export class FinalizeAttemptDto {
  @ApiPropertyOptional({ description: 'Whether attempt was auto-submitted by proctoring or timer' })
  @IsOptional()
  @IsBoolean()
  autoSubmitted?: boolean;

  @ApiPropertyOptional({ description: 'Reason for termination if auto-submitted' })
  @IsOptional()
  @IsString()
  terminationReason?: string;
}

