import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Judge0ExecutionProvider } from './judge0-execution.provider';
import { LanguageRegistry } from '../registry/language.registry';
import { DriverRegistry } from '../registry/driver.registry';

describe('Judge0ExecutionProvider', () => {
  let provider: Judge0ExecutionProvider;
  let mockFetch: jest.Mock;

  beforeEach(async () => {
    mockFetch = jest.fn();
    global.fetch = mockFetch;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        Judge0ExecutionProvider,
        LanguageRegistry,
        DriverRegistry,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string, defaultVal?: any) => {
              switch (key) {
                case 'JUDGE0_BASE_URL':
                  return 'http://127.0.0.1:2358';
                case 'JUDGE0_AUTH_TOKEN':
                  return '';
                case 'JUDGE0_TIMEOUT_MS':
                  return 1000;
                case 'JUDGE0_POLL_INTERVAL_MS':
                  return 10;
                case 'JUDGE0_MAX_POLL_ATTEMPTS':
                  return 3;
                default:
                  return defaultVal;
              }
            }),
          },
        },
      ],
    }).compile();

    provider = module.get<Judge0ExecutionProvider>(Judge0ExecutionProvider);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('runSingle', () => {
    it('should dispatch submission and poll until terminal status Accepted (3)', async () => {
      // 1. Dispatch response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ token: 'mock-uuid-token-1' }),
      });

      // 2. Poll response: Processing (2)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          token: 'mock-uuid-token-1',
          status: { id: 2, description: 'Processing' },
        }),
      });

      // 3. Poll response: Accepted (3)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          token: 'mock-uuid-token-1',
          status: { id: 3, description: 'Accepted' },
          stdout: Buffer.from('Hello NUMU\n').toString('base64'),
          stderr: null,
          compile_output: null,
          time: '0.045',
          memory: 8192,
        }),
      });

      const result = await provider.runSingle({
        sourceCode: 'print("Hello NUMU")',
        language: 'python',
        stdin: '',
      });

      expect(result.statusId).toBe(3);
      expect(result.verdict).toBe('ACCEPTED');
      expect(result.stdout).toBe('Hello NUMU\n');
      expect(result.runtimeMs).toBe(45);
      expect(result.memoryKb).toBe(8192);
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it('should assign WRONG_ANSWER if output does not match expected output', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ token: 'mock-uuid-token-2' }),
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          token: 'mock-uuid-token-2',
          status: { id: 3, description: 'Accepted' },
          stdout: Buffer.from('40\n').toString('base64'),
          time: '0.05',
          memory: 4000,
        }),
      });

      const result = await provider.runSingle({
        sourceCode: 'print(40)',
        language: 'python',
        stdin: '',
        expectedOutput: '42',
      });

      expect(result.statusId).toBe(3);
      expect(result.verdict).toBe('WRONG_ANSWER');
      expect(result.stdout).toBe('40\n');
    });

    it('should decode compile error output on Status 6', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ token: 'mock-token-ce' }),
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          token: 'mock-token-ce',
          status: { id: 6, description: 'Compilation Error' },
          stdout: null,
          stderr: null,
          compile_output: Buffer.from('error: missing semicolon').toString('base64'),
        }),
      });

      const result = await provider.runSingle({
        sourceCode: 'int main() { return 0 }',
        language: 'cpp',
        stdin: '',
      });

      expect(result.statusId).toBe(6);
      expect(result.verdict).toBe('COMPILATION_ERROR');
      expect(result.compileOutput).toBe('error: missing semicolon');
    });

    it('should throw error for unsupported language slug', async () => {
      await expect(
        provider.runSingle({
          sourceCode: 'program test',
          language: 'pascal',
          stdin: '',
        }),
      ).rejects.toThrow('Unsupported language slug: "pascal"');
    });
  });

  describe('submitBatch and getBatchResults', () => {
    it('should submit batch and retrieve normalized results for each token', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ token: 'batch-token-1' }),
      });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ token: 'batch-token-2' }),
      });

      const batch = await provider.submitBatch([
        { sourceCode: 'print(1)', language: 'python', stdin: '1' },
        { sourceCode: 'print(2)', language: 'python', stdin: '2' },
      ]);

      expect(batch.tokens).toEqual(['batch-token-1', 'batch-token-2']);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          token: 'batch-token-1',
          status: { id: 3, description: 'Accepted' },
          stdout: Buffer.from('1\n').toString('base64'),
        }),
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          token: 'batch-token-2',
          status: { id: 3, description: 'Accepted' },
          stdout: Buffer.from('2\n').toString('base64'),
        }),
      });

      const batchResult = await provider.getBatchResults(batch.tokens);
      expect(batchResult.isComplete).toBe(true);
      expect(batchResult.results.length).toBe(2);
      expect(batchResult.results[0]?.verdict).toBe('ACCEPTED');
      expect(batchResult.results[1]?.verdict).toBe('ACCEPTED');
    });
  });
});
