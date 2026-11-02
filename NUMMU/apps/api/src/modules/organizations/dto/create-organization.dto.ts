import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsOptional,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateOrganizationDto {
  @ApiProperty({
    example: 'Vellore Institute of Technology',
    description: 'Human-readable organization or college name',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  name!: string;

  @ApiProperty({
    example: 'vit-chennai',
    description: 'Unique URL slug (lowercase alphanumeric and hyphens)',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug must be lowercase alphanumeric characters and hyphens only',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.toLowerCase().trim() : value,
  )
  slug!: string;

  @ApiPropertyOptional({ example: 'Chennai campus engineering department' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  description?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/org-logo.png' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  logoUrl?: string;
}
