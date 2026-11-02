import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsIn, MaxLength, IsOptional } from 'class-validator';
import type { SupportedLanguage } from '@numu/types';

export class RunCodeDto {
  @ApiProperty({
    description: 'Unique slug of the problem being tested',
    example: 'two-sum',
  })
  @IsString()
  @IsNotEmpty()
  problemSlug!: string;

  @ApiProperty({
    description: 'Programming language identifier',
    enum: ['python', 'javascript', 'typescript', 'cpp', 'java'],
    example: 'python',
  })
  @IsString()
  @IsIn(['python', 'javascript', 'typescript', 'cpp', 'java'], {
    message: 'language must be one of: python, javascript, typescript, cpp, java',
  })
  language!: SupportedLanguage;

  @ApiProperty({
    description: 'Source code of the user solution (max 64KB)',
    example: 'class Solution:\n    def twoSum(self, nums, target):\n        return [0, 1]',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(65535, {
    message: 'code must be shorter than or equal to 65535 characters',
  })
  code!: string;

  @ApiPropertyOptional({
    description: 'Optional custom standard input to pass to the program (max 10KB)',
    example: 'nums = [2,7,11,15], target = 9',
  })
  @IsOptional()
  @IsString()
  @MaxLength(10000, {
    message: 'customInput must be shorter than or equal to 10000 characters',
  })
  customInput?: string;
}
