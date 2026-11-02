import { SubmissionVerdict } from '@numu/types';

export interface ExecutionJob {
  sourceCode: string;
  language: string;
  stdin: string;
  expectedOutput?: string;
  cpuTimeLimitMs?: number;
  memoryLimitKb?: number;
}

export interface ExecutionResult {
  stdout: string | null;
  stderr: string | null;
  compileOutput: string | null;
  runtimeMs: number | null;
  memoryKb: number | null;
  statusId: number;
  verdict: SubmissionVerdict;
}

export const EXECUTION_PROVIDER = Symbol('EXECUTION_PROVIDER');

export interface ExecutionProvider {
  /**
   * Executes a single test case (used for 'Run Code' or ad-hoc runs).
   */
  runSingle(job: ExecutionJob): Promise<ExecutionResult>;

  /**
   * Submits a batch of test cases for evaluation (used for formal 'Submit Code').
   */
  submitBatch(jobs: ExecutionJob[]): Promise<{ tokens: string[] }>;

  /**
   * Retrieves results for a batch of previously dispatched jobs.
   */
  getBatchResults(tokens: string[]): Promise<{ isComplete: boolean; results: ExecutionResult[] }>;
}
