/**
 * Code Submission & Execution Contracts
 */

export type SubmissionStatus = 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export type SubmissionVerdict =
  | 'PENDING'
  | 'ACCEPTED'
  | 'WRONG_ANSWER'
  | 'TIME_LIMIT_EXCEEDED'
  | 'MEMORY_LIMIT_EXCEEDED'
  | 'COMPILATION_ERROR'
  | 'RUNTIME_ERROR'
  | 'INTERNAL_ERROR';

export type ExecutionMode = 'FUNCTION_HARNESS' | 'STANDALONE_IO';

export type ComparatorType = 'EXACT' | 'UNORDERED_ARRAY' | 'FLOAT_TOLERANCE' | 'LINES';

export type SupportedLanguage =
  | 'python'
  | 'javascript'
  | 'typescript'
  | 'cpp'
  | 'java'
  | 'go'
  | 'rust'
  | 'csharp'
  | (string & {});

export interface SubmitCodeInput {
  problemSlug: string;
  language: SupportedLanguage;
  code: string;
}

export interface RunCodeInput {
  problemSlug: string;
  language: SupportedLanguage;
  code: string;
  customInput?: string | undefined;
}

export interface TestCaseRunResult {
  index: number;
  input: string;
  expectedOutput: string;
  userOutput: string | null;
  status: SubmissionVerdict;
  isMatch: boolean;
  runtimeMs?: number | null;
  memoryKb?: number | null;
  stdout?: string | null;
  stderr?: string | null;
}

export interface RunResult {
  status: SubmissionStatus;
  verdict: SubmissionVerdict;
  runtimeMs: number | null;
  memoryKb: number | null;
  stdout: string | null;
  stderr: string | null;
  compileError: string | null;
  expectedOutput: string | null;
  userOutput: string | null;
  isMatch: boolean;
  testCases?: TestCaseRunResult[];
  totalTests?: number;
  testsPassed?: number;
}

export interface SubmissionListItem {
  id: string;
  problemSlug: string;
  problemTitle: string;
  language: string;
  status: SubmissionStatus;
  verdict: SubmissionVerdict;
  runtimeMs: number | null;
  memoryKb: number | null;
  testsPassed: number;
  totalTests: number;
  createdAt: string | Date;
}

export interface SubmissionDetail {
  id: string;
  problemSlug: string;
  problemTitle: string;
  language: string;
  code: string;
  status: SubmissionStatus;
  verdict: SubmissionVerdict;
  runtimeMs: number | null;
  memoryKb: number | null;
  testsPassed: number;
  totalTests: number;
  compileError: string | null;
  stdout?: string | null | undefined;
  stderr?: string | null | undefined;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface PaginatedSubmissionsResult {
  items: SubmissionListItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface SubmissionQuery {
  page?: number | undefined;
  limit?: number | undefined;
  problemSlug?: string | undefined;
  verdict?: SubmissionVerdict | undefined;
}

export interface ProblemTestCaseDto {
  id?: string | undefined;
  input: string;
  expectedOutput: string;
  isHidden?: boolean | undefined;
  orderIndex?: number | undefined;
}
