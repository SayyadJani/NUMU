import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitQuestionDto {
  @ApiProperty({ description: 'Problem unique slug (e.g., two-sum)' })
  @IsString()
  @IsNotEmpty()
  problemSlug!: string;

  @ApiProperty({ description: 'Programming language (e.g., python, cpp, java)' })
  @IsString()
  @IsNotEmpty()
  language!: string;

  @ApiProperty({ description: 'User source code to evaluate' })
  @IsString()
  @IsNotEmpty()
  code!: string;
}
