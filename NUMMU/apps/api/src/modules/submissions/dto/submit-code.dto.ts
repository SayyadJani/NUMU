import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsIn, MaxLength } from 'class-validator';
import type { SupportedLanguage } from '@numu/types';

export class SubmitCodeDto {
  @ApiProperty({
    description: 'Unique slug of the problem being submitted to',
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
}
