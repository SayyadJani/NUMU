import { IsString, IsOptional, IsArray, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateNoteDto {
  @ApiPropertyOptional({ example: 'Updated Note Title' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: 'Updated note body content...' })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({ example: 'dsa' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ example: ['Graph', 'BFS'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isPinned?: boolean;

  @ApiPropertyOptional({ example: 'blue' })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiPropertyOptional({ example: { title: 'Rotated Array', href: '/problems/rotated' } })
  @IsOptional()
  linkedProblem?: {
    title: string;
    href: string;
  };
}
