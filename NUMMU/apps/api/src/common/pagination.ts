import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Reusable query DTO for paginated + searchable admin list endpoints.
 */
export class PaginationQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Free-text search' })
  @IsString()
  @IsOptional()
  search?: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function toSkipTake(query: PaginationQueryDto) {
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  return { page, limit, skip: (page - 1) * limit, take: limit };
}

export function paginated<T>(items: T[], total: number, page: number, limit: number): Paginated<T> {
  return { items, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) };
}

/** Case-insensitive `contains` filter across several string fields. */
export function searchFilter<K extends string>(search: string | undefined, fields: K[]) {
  const term = search?.trim();
  if (!term) return undefined;
  return fields.map((field) => ({ [field]: { contains: term, mode: 'insensitive' as const } })) as Array<
    Record<K, { contains: string; mode: 'insensitive' }>
  >;
}

