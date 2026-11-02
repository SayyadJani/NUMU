import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RunTestCodeDto {
  @ApiProperty({ description: 'Problem unique slug (e.g., two-sum)' })
  @IsString()
  @IsNotEmpty()
  problemSlug!: string;

  @ApiProperty({ description: 'Programming language (e.g., python, cpp, java)' })
  @IsString()
  @IsNotEmpty()
  language!: string;

  @ApiProperty({ description: 'User source code to execute' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiPropertyOptional({ description: 'Optional custom stdin input' })
  @IsString()
  @IsOptional()
  customInput?: string;
}
