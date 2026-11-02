import { IsString, IsNotEmpty, IsOptional, IsArray, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNoteDto {
  @ApiProperty({ example: 'Sliding Window Pattern Summary' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Maintain two pointers l and r...' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ example: 'dsa', default: 'dsa' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ example: ['Sliding Window', 'Two Pointers'], default: [] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ example: false, default: false })
  @IsBoolean()
  @IsOptional()
  isPinned?: boolean;

  @ApiPropertyOptional({ example: 'emerald', default: 'emerald' })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiPropertyOptional({ example: { title: 'Two Sum', href: '/problems/two-sum' } })
  @IsOptional()
  linkedProblem?: {
    title: string;
    href: string;
  };
}
