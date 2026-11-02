import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTopicDto {
  @ApiProperty({ example: 'Arrays', description: 'Name of the topic' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ example: 'arrays', description: 'Custom unique URL slug (auto-generated if omitted)' })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiPropertyOptional({ example: 'Contiguous memory layout and two-pointer techniques', description: 'Topic description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: '▦', description: 'Topic icon identifier or emoji' })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiPropertyOptional({ example: 1, description: 'Display ordering index' })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;
}
