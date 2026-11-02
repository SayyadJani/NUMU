import { Injectable, Logger } from '@nestjs/common';
import {
  ExecutionProvider,
  ExecutionJob,
  ExecutionResult,
} from './execution-provider.interface';

/**
 * MockExecutionProvider
 *
 * Deterministic, offline execution provider for Phase 4B development and automated testing.
 * Does NOT execute arbitrary shell commands or untrusted code in the application process.
 * Inspects deterministic markers or standard test cases to return predictable verdicts.
 */
@Injectable()
export class MockExecutionProvider implements ExecutionProvider {
  private readonly logger = new Logger(MockExecutionProvider.name);

  // In-memory token store for batch results
  private readonly batchStore = new Map<string, ExecutionResult>();

  async runSingle(job: ExecutionJob): Promise<ExecutionResult> {
    return this.evaluateJob(job);
  }

  async submitBatch(jobs: ExecutionJob[]): Promise<{ tokens: string[] }> {
    const tokens: string[] = [];
    for (let i = 0; i < jobs.length; i++) {
      const job = jobs[i]!;
      const token = `mock_tok_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 7)}`;
      const result = this.evaluateJob(job);
      this.batchStore.set(token, result);
      tokens.push(token);
    }
    return { tokens };
  }

  async getBatchResults(tokens: string[]): Promise<{ isComplete: boolean; results: ExecutionResult[] }> {
    const results: ExecutionResult[] = [];
    for (const token of tokens) {
      const res = this.batchStore.get(token);
      if (res) {
        results.push(res);
      } else {
        // Fallback default
        results.push({
          stdout: null,
          stderr: 'Token expired or not found',
          compileOutput: null,
          runtimeMs: null,
          memoryKb: null,
          statusId: 13,
          verdict: 'INTERNAL_ERROR',
        });
      }
    }
    return { isComplete: true, results };
  }

  private evaluateJob(job: ExecutionJob): ExecutionResult {
    const code = job.sourceCode;

    // 1. Explicit trigger markers for testing edge cases
    if (code.includes('SYNTAX_ERROR') || code.includes('error: expected') || code.includes('SyntaxError')) {
      return {
        stdout: null,
        stderr: null,
        compileOutput: 'SyntaxError: Unexpected token or compilation failure',
        runtimeMs: null,
        memoryKb: null,
        statusId: 6,
        verdict: 'COMPILATION_ERROR',
      };
    }

    if (code.includes('TIME_LIMIT_EXCEEDED') || code.includes('while True:') || code.includes('while(true)')) {
      return {
        stdout: null,
        stderr: 'Time limit exceeded after 2000ms',
        compileOutput: null,
        runtimeMs: 2005,
        memoryKb: 16000,
        statusId: 5,
        verdict: 'TIME_LIMIT_EXCEEDED',
      };
    }

    if (code.includes('MEMORY_LIMIT_EXCEEDED') || code.includes('OutOfMemoryError')) {
      return {
        stdout: null,
        stderr: 'Memory limit exceeded (262144KB)',
        compileOutput: null,
        runtimeMs: 450,
        memoryKb: 262200,
        statusId: 12,
        verdict: 'MEMORY_LIMIT_EXCEEDED',
      };
    }

    if (code.includes('RUNTIME_ERROR') || code.includes('ZeroDivisionError') || code.includes('1 / 0')) {
      return {
        stdout: null,
        stderr: 'ZeroDivisionError: division by zero',
        compileOutput: null,
        runtimeMs: 25,
        memoryKb: 14000,
        statusId: 11,
        verdict: 'RUNTIME_ERROR',
      };
    }

    // 2. Canonical matching: If the code is an empty placeholder or returns a wrong constant
    if (code.includes('WRONG_ANSWER') || code.includes('return []') || code.includes('return false') || code.includes('return None')) {
      return {
        stdout: '[]\n',
        stderr: null,
        compileOutput: null,
        runtimeMs: 32,
        memoryKb: 14100,
        statusId: 4,
        verdict: 'WRONG_ANSWER',
      };
    }

    // 3. If code has expected solution logic (e.g. hash map complement, stack matching, or valid logic)
    const expected = (job.expectedOutput || '').trim();
    return {
      stdout: expected ? `${expected}\n` : 'Success\n',
      stderr: null,
      compileOutput: null,
      runtimeMs: 35,
      memoryKb: 14200,
      statusId: 3,
      verdict: 'ACCEPTED',
    };
  }
}
