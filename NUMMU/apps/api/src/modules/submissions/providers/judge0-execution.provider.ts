import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ExecutionProvider,
  ExecutionJob,
  ExecutionResult,
} from './execution-provider.interface';
import { SubmissionVerdict } from '@numu/types';
import { LanguageRegistry } from '../registry/language.registry';
import { DriverRegistry } from '../registry/driver.registry';

/**
 * Judge0 language ID mapping verified against Judge0 CE v1.13.1.
 */
const LANGUAGE_ID_MAP: Record<string, number> = {
  python: 71, // Python 3.8.1
  python3: 71,
  cpp: 54, // C++ (GCC 9.2.0)
  'cpp-gcc9': 54,
  'cpp-gcc7': 52, // C++ (GCC 7.4.0)
  java: 62, // Java (OpenJDK 13.0.1)
  javascript: 63, // JavaScript (Node.js 12.14.0)
  js: 63,
  node: 63,
  typescript: 74, // TypeScript (3.7.4)
  ts: 74,
};

interface Judge0Status {
  id: number;
  description: string;
}

interface Judge0Response {
  token: string;
  status_id?: number;
  status?: Judge0Status;
  stdout?: string | null;
  stderr?: string | null;
  compile_output?: string | null;
  message?: string | null;
  exit_code?: number | null;
  time?: string | null;
  memory?: number | null;
}

@Injectable()
export class Judge0ExecutionProvider implements ExecutionProvider {
  private readonly logger = new Logger(Judge0ExecutionProvider.name);

  private readonly baseUrl: string;
  private readonly authToken: string;
  private readonly timeoutMs: number;
  private readonly pollIntervalMs: number;
  private readonly maxPollAttempts: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly languageRegistry: LanguageRegistry,
    private readonly driverRegistry: DriverRegistry,
  ) {
    this.baseUrl = (
      this.configService.get<string>('JUDGE0_BASE_URL') || 'http://127.0.0.1:2358'
    ).replace(/\/+$/, '');
    this.authToken = this.configService.get<string>('JUDGE0_AUTH_TOKEN') || '';
    this.timeoutMs = Number(this.configService.get<number>('JUDGE0_TIMEOUT_MS')) || 15000;
    this.pollIntervalMs =
      Number(this.configService.get<number>('JUDGE0_POLL_INTERVAL_MS')) || 500;
    this.maxPollAttempts =
      Number(this.configService.get<number>('JUDGE0_MAX_POLL_ATTEMPTS')) || 60;
  }

  /**
   * Executes a single test case (used for 'Run Code' or ad-hoc runs).
   */
  async runSingle(job: ExecutionJob): Promise<ExecutionResult> {
    const token = await this.dispatchSubmission(job);
    return this.pollUntilTerminal(token, job.expectedOutput);
  }

  /**
   * Submits a batch of test cases for evaluation (used for formal 'Submit Code').
   * Dispatches all test case jobs concurrently.
   */
  async submitBatch(jobs: ExecutionJob[]): Promise<{ tokens: string[] }> {
    const tokens: string[] = [];
    for (const job of jobs) {
      try {
        const token = await this.dispatchSubmission(job);
        tokens.push(token);
      } catch (err) {
        this.logger.error(`Failed to dispatch batch job: ${err}`);
        tokens.push(`error_dispatch_${Date.now()}`);
      }
    }

    return { tokens };
  }

  /**
   * Retrieves results for a batch of previously dispatched jobs in parallel.
   */
  async getBatchResults(
    tokens: string[],
  ): Promise<{ isComplete: boolean; results: ExecutionResult[] }> {
    const results = await Promise.all(
      tokens.map(async (token) => {
        if (token.startsWith('error_dispatch_')) {
          return {
            stdout: null,
            stderr: 'Failed to dispatch job to Judge0 execution engine',
            compileOutput: null,
            runtimeMs: null,
            memoryKb: null,
            statusId: 13,
            verdict: 'INTERNAL_ERROR' as const,
          };
        }

        return this.pollUntilTerminal(token);
      }),
    );

    return { isComplete: true, results };
  }

  /**
   * Dispatches a single code execution job to Judge0 with Base64 encoding.
   */
  private async dispatchSubmission(job: ExecutionJob): Promise<string> {
    const langConfig = this.languageRegistry.get(job.language);
    const languageId = langConfig?.judge0Id ?? this.resolveLanguageId(job.language);
    const prepared = this.driverRegistry.prepareCode(job.language, job.sourceCode);
    const base64Source = Buffer.from(prepared.sourceCode, 'utf-8').toString('base64');
    const base64Stdin = job.stdin
      ? Buffer.from(job.stdin, 'utf-8').toString('base64')
      : '';

    const cpuTimeLimit = job.cpuTimeLimitMs ? job.cpuTimeLimitMs / 1000 : (langConfig?.defaultCpuLimitMs ? langConfig.defaultCpuLimitMs / 1000 : 2.0);
    const memoryLimit = job.memoryLimitKb ?? (langConfig?.defaultMemoryLimitKb ?? 262144);

    const payload: Record<string, any> = {
      language_id: languageId,
      source_code: base64Source,
      stdin: base64Stdin,
      cpu_time_limit: cpuTimeLimit,
      memory_limit: memoryLimit,
    };

    if (prepared.compilerOptions) {
      payload['compiler_options'] = prepared.compilerOptions;
    }

    const url = `${this.baseUrl}/submissions?base64_encoded=true&wait=false`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    if (this.authToken) {
      headers['X-Auth-Token'] = this.authToken;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(this.timeoutMs),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Judge0 submission creation failed with HTTP ${response.status}: ${errorText}`,
      );
    }

    const data = (await response.json()) as { token: string };
    if (!data.token) {
      throw new Error('Judge0 response missing submission token');
    }

    return data.token;
  }

  /**
   * Bounded polling loop querying Judge0 until a terminal status is returned.
   */
  private async pollUntilTerminal(
    token: string,
    expectedOutput?: string,
  ): Promise<ExecutionResult> {
    const url = `${this.baseUrl}/submissions/${token}?base64_encoded=true`;
    const headers: Record<string, string> = {
      Accept: 'application/json',
    };

    if (this.authToken) {
      headers['X-Auth-Token'] = this.authToken;
    }

    for (let attempt = 1; attempt <= this.maxPollAttempts; attempt++) {
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers,
          signal: AbortSignal.timeout(this.timeoutMs),
        });

        if (!response.ok) {
          throw new Error(`Judge0 poll returned HTTP ${response.status}`);
        }

        const data = (await response.json()) as Judge0Response;
        const statusId = data.status?.id ?? data.status_id ?? 1;

        // Status ID >= 3 indicates terminal state
        if (statusId >= 3) {
          return this.normalizeResult(data, expectedOutput);
        }
      } catch (err) {
        this.logger.warn(`Polling attempt ${attempt} for token ${token} failed: ${err}`);
      }

      await new Promise((resolve) => setTimeout(resolve, this.pollIntervalMs));
    }

    // Polling deadline exceeded
    return {
      stdout: null,
      stderr: `Execution timed out waiting for result after ${
        this.maxPollAttempts * this.pollIntervalMs
      }ms`,
      compileOutput: null,
      runtimeMs: null,
      memoryKb: null,
      statusId: 5,
      verdict: 'TIME_LIMIT_EXCEEDED',
    };
  }

  /**
   * Decodes Base64 outputs and normalizes Judge0 status into NUMU ExecutionResult.
   */
  private normalizeResult(
    raw: Judge0Response,
    expectedOutput?: string,
  ): ExecutionResult {
    const statusId = raw.status?.id ?? raw.status_id ?? 13;

    const stdout = raw.stdout
      ? Buffer.from(raw.stdout, 'base64').toString('utf-8')
      : null;
    const stderr = raw.stderr
      ? Buffer.from(raw.stderr, 'base64').toString('utf-8')
      : null;
    const compileOutput = raw.compile_output
      ? Buffer.from(raw.compile_output, 'base64').toString('utf-8')
      : null;

    const runtimeMs = raw.time ? Math.round(parseFloat(raw.time) * 1000) : null;
    const memoryKb = raw.memory ?? null;

    let verdict: SubmissionVerdict;

    switch (statusId) {
      case 3: // Accepted
        if (expectedOutput !== undefined && expectedOutput !== null && expectedOutput.trim() !== '') {
          const cleanUser = stdout ? stdout.trim() : '';
          const cleanExpected = expectedOutput.trim();
          verdict = cleanUser === cleanExpected ? 'ACCEPTED' : 'WRONG_ANSWER';
        } else {
          verdict = 'ACCEPTED';
        }
        break;
      case 4:
        verdict = 'WRONG_ANSWER';
        break;
      case 5:
        verdict = 'TIME_LIMIT_EXCEEDED';
        break;
      case 6:
        verdict = 'COMPILATION_ERROR';
        break;
      case 7:
      case 8:
      case 9:
      case 10:
      case 11:
      case 12:
        verdict = 'RUNTIME_ERROR';
        break;
      case 13:
      default:
        verdict = 'INTERNAL_ERROR';
        break;
    }

    return {
      stdout,
      stderr,
      compileOutput,
      runtimeMs,
      memoryKb,
      statusId,
      verdict,
    };
  }

  /**
   * Resolves NUMU language slug to Judge0 ID.
   */
  private resolveLanguageId(slug: string): number {
    const normalized = slug.toLowerCase().trim();
    const id = LANGUAGE_ID_MAP[normalized];
    if (!id) {
      throw new Error(`Unsupported language slug: "${slug}"`);
    }
    return id;
  }

  /**
   * Prepares and adapts source code for target execution runtime via DriverRegistry.
   */
  private prepareSourceCode(job: ExecutionJob): string {
    return this.driverRegistry.prepareCode(job.language, job.sourceCode).sourceCode;
  }
}


