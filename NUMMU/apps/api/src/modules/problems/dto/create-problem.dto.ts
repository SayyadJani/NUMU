import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  IsObject,
  ValidateNested,
  IsInt,
  IsBoolean,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Difficulty, ContentStatus, ExecutionMode } from '@prisma/client';

export class ProblemTestCaseInputDto {
  @ApiProperty({ example: '[2,7,11,15]\n9' })
  @IsString()
  @IsNotEmpty()
  input!: string;

  @ApiProperty({ example: '[0,1]' })
  @IsString()
  @IsNotEmpty()
  expectedOutput!: string;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isHidden?: boolean = true;

  @ApiPropertyOptional({ default: 0 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  orderIndex?: number;

  @ApiPropertyOptional({ default: 2000 })
  @Type(() => Number)
  @IsInt()
  @Min(100)
  @IsOptional()
  timeLimitMs?: number = 2000;

  @ApiPropertyOptional({ default: 262144 })
  @Type(() => Number)
  @IsInt()
  @Min(16384)
  @IsOptional()
  memoryLimitKb?: number = 262144;
}

export class ProblemExampleInputDto {
  @ApiProperty({ example: 'nums = [2,7,11,15], target = 9' })
  @IsString()
  @IsNotEmpty()
  input!: string;

  @ApiProperty({ example: '[0,1]' })
  @IsString()
  @IsNotEmpty()
  output!: string;

  @ApiPropertyOptional({ example: 'Because nums[0] + nums[1] == 9, we return [0, 1].' })
  @IsString()
  @IsOptional()
  explanation?: string;

  @ApiPropertyOptional({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  order?: number;
}

export class CreateProblemDto {
  @ApiProperty({ example: 'Two Sum', description: 'Problem title' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({ example: 'two-sum', description: 'Custom unique URL slug (auto-generated if omitted)' })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty({ enum: Difficulty, example: Difficulty.EASY })
  @IsEnum(Difficulty)
  difficulty!: Difficulty;

  @ApiPropertyOptional({ enum: ContentStatus, default: ContentStatus.DRAFT })
  @IsEnum(ContentStatus)
  @IsOptional()
  status?: ContentStatus = ContentStatus.DRAFT;

  @ApiProperty({ description: 'Detailed problem statement in Markdown' })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiPropertyOptional({ example: ['2 <= nums.length <= 10^4'], type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  constraints?: string[];

  @ApiPropertyOptional({ example: ['Consider using a hash map'], type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  hints?: string[];

  @ApiPropertyOptional({ description: 'Markdown editorial guide' })
  @IsString()
  @IsOptional()
  editorial?: string;

  @ApiPropertyOptional({ example: { python: 'def twoSum(): pass' } })
  @IsObject()
  @IsOptional()
  boilerplate?: Record<string, string>;

  @ApiProperty({ example: ['arrays', 'two-pointers'], description: 'List of topic slugs' })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  topicSlugs!: string[];

  @ApiPropertyOptional({ example: 'arrays', description: 'Primary topic slug' })
  @IsString()
  @IsOptional()
  primaryTopicSlug?: string;

  @ApiPropertyOptional({ type: [ProblemExampleInputDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProblemExampleInputDto)
  @IsOptional()
  examples?: ProblemExampleInputDto[];

  @ApiPropertyOptional({ type: [ProblemTestCaseInputDto], description: 'Judge test cases (sample & hidden)' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProblemTestCaseInputDto)
  @IsOptional()
  testCases?: ProblemTestCaseInputDto[];

  @ApiPropertyOptional({ enum: ExecutionMode, default: ExecutionMode.FUNCTION })
  @IsEnum(ExecutionMode)
  @IsOptional()
  executionMode?: ExecutionMode;
}
