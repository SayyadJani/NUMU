/**
 * DSA Problem Contracts & Data Shapes
 */

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type ContentStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface ProblemExampleDto {
  id?: string;
  input: string;
  output: string;
  explanation?: string | null;
  order?: number;
}

export interface ProblemTopicDto {
  slug: string;
  name: string;
  isPrimary?: boolean;
}

export interface ProblemAuthorDto {
  id: string;
  name: string | null;
  username: string | null;
}

export interface ProblemListItem {
  id: string;
  slug: string;
  title: string;
  difficulty: Difficulty;
  status: ContentStatus;
  acceptanceRate: number;
  primaryTopic: {
    slug: string;
    name: string;
  } | null;
  topics: Array<{
    slug: string;
    name: string;
  }>;
  createdAt: string | Date;
}

export interface PaginatedProblemsResult {
  items: ProblemListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ProblemSolutionDto {
  id: string;
  problemId: string;
  language: string;
  code: string;
  title?: string | null;
  explanation?: string | null;
  timeComplexity?: string | null;
  spaceComplexity?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface ProblemDetail {
  id: string;
  slug: string;
  title: string;
  difficulty: Difficulty;
  status: ContentStatus;
  description: string;
  constraints: string[];
  hints: string[];
  editorial: string | null;
  boilerplate: Record<string, string>;
  solutions?: ProblemSolutionDto[];
  acceptanceRate: number;
  topics: Array<{
    slug: string;
    name: string;
    isPrimary: boolean;
  }>;
  examples: ProblemExampleDto[];
  author: ProblemAuthorDto;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface ProblemFilterQuery {
  page?: number | undefined;
  limit?: number | undefined;
  difficulty?: Difficulty | undefined;
  topic?: string | undefined;
  search?: string | undefined;
  sortBy?: ('newest' | 'difficulty' | 'acceptance' | 'popularity') | undefined;
  status?: ContentStatus | undefined;
}

export interface CreateProblemInput {
  title: string;
  slug?: string;
  difficulty: Difficulty;
  status?: ContentStatus;
  description: string;
  constraints?: string[];
  hints?: string[];
  editorial?: string;
  boilerplate?: Record<string, string>;
  topicSlugs: string[];
  primaryTopicSlug?: string;
  examples?: Array<{
    input: string;
    output: string;
    explanation?: string;
    order?: number;
  }>;
}

export interface UpdateProblemInput {
  title?: string;
  slug?: string;
  difficulty?: Difficulty;
  status?: ContentStatus;
  description?: string;
  constraints?: string[];
  hints?: string[];
  editorial?: string;
  boilerplate?: Record<string, string>;
  topicSlugs?: string[];
  primaryTopicSlug?: string;
  examples?: Array<{
    input: string;
    output: string;
    explanation?: string;
    order?: number;
  }>;
}
