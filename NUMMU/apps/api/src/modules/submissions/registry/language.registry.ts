import { Injectable, Logger } from '@nestjs/common';
import { ExecutionMode } from '@numu/types';

export interface LanguageConfig {
  slug: string;
  displayName: string;
  judge0Id: number;
  version: string;
  sourceFilename: string;
  supportedModes: ExecutionMode[];
  isEnabled: boolean;
  compilerOptions?: string;
  jvmFlags?: string;
  defaultCpuLimitMs: number;
  defaultMemoryLimitKb: number;
  lastSmokeTestAt?: string;
  smokeTestStatus?: 'PASS' | 'FAIL' | 'UNTESTED';
}

const DEFAULT_LANGUAGES: LanguageConfig[] = [
  {
    slug: 'python',
    displayName: 'Python (3.8.1)',
    judge0Id: 71,
    version: '3.8.1',
    sourceFilename: 'solution.py',
    supportedModes: ['FUNCTION_HARNESS', 'STANDALONE_IO'],
    isEnabled: true,
    defaultCpuLimitMs: 2000,
    defaultMemoryLimitKb: 262144,
    smokeTestStatus: 'PASS',
  },
  {
    slug: 'cpp',
    displayName: 'C++ (GCC 9.2.0)',
    judge0Id: 54,
    version: '9.2.0',
    sourceFilename: 'main.cpp',
    supportedModes: ['FUNCTION_HARNESS', 'STANDALONE_IO'],
    isEnabled: true,
    compilerOptions: '-O1 -std=c++17',
    defaultCpuLimitMs: 2000,
    defaultMemoryLimitKb: 262144,
    smokeTestStatus: 'UNTESTED',
  },
  {
    slug: 'java',
    displayName: 'Java (OpenJDK 13.0.1)',
    judge0Id: 62,
    version: '13.0.1',
    sourceFilename: 'Main.java',
    supportedModes: ['FUNCTION_HARNESS', 'STANDALONE_IO'],
    isEnabled: true,
    jvmFlags: '-Xmx128m -Xms32m -XX:-UseCompressedOops',
    defaultCpuLimitMs: 3000,
    defaultMemoryLimitKb: 512000,
    smokeTestStatus: 'UNTESTED',
  },
  {
    slug: 'typescript',
    displayName: 'TypeScript (3.7.4)',
    judge0Id: 74,
    version: '3.7.4',
    sourceFilename: 'solution.ts',
    supportedModes: ['FUNCTION_HARNESS', 'STANDALONE_IO'],
    isEnabled: true,
    defaultCpuLimitMs: 3000,
    defaultMemoryLimitKb: 2097152,
    smokeTestStatus: 'UNTESTED',
  },
  {
    slug: 'javascript',
    displayName: 'JavaScript (Node.js 12.14.0)',
    judge0Id: 63,
    version: '12.14.0',
    sourceFilename: 'solution.js',
    supportedModes: ['FUNCTION_HARNESS', 'STANDALONE_IO'],
    isEnabled: true,
    defaultCpuLimitMs: 3000,
    defaultMemoryLimitKb: 2097152,
    smokeTestStatus: 'UNTESTED',
  },
  {
    slug: 'go',
    displayName: 'Go (1.13.5)',
    judge0Id: 60,
    version: '1.13.5',
    sourceFilename: 'main.go',
    supportedModes: ['STANDALONE_IO'],
    isEnabled: true,
    defaultCpuLimitMs: 2000,
    defaultMemoryLimitKb: 262144,
    smokeTestStatus: 'UNTESTED',
  },
  {
    slug: 'rust',
    displayName: 'Rust (1.40.0)',
    judge0Id: 73,
    version: '1.40.0',
    sourceFilename: 'main.rs',
    supportedModes: ['STANDALONE_IO'],
    isEnabled: false,
    defaultCpuLimitMs: 3000,
    defaultMemoryLimitKb: 262144,
    smokeTestStatus: 'UNTESTED',
  },
  {
    slug: 'csharp',
    displayName: 'C# (Mono 6.6.0.161)',
    judge0Id: 51,
    version: '6.6.0.161',
    sourceFilename: 'Main.cs',
    supportedModes: ['STANDALONE_IO'],
    isEnabled: false,
    defaultCpuLimitMs: 3000,
    defaultMemoryLimitKb: 262144,
    smokeTestStatus: 'UNTESTED',
  },
];

@Injectable()
export class LanguageRegistry {
  private readonly logger = new Logger(LanguageRegistry.name);
  private languages: Map<string, LanguageConfig> = new Map();

  constructor() {
    for (const lang of DEFAULT_LANGUAGES) {
      this.languages.set(lang.slug.toLowerCase(), { ...lang });
    }
  }

  getAll(): LanguageConfig[] {
    return Array.from(this.languages.values());
  }

  getEnabled(): LanguageConfig[] {
    return this.getAll().filter((l) => l.isEnabled);
  }

  get(slug: string): LanguageConfig | undefined {
    const key = slug.toLowerCase().trim();
    // Support common aliases
    if (key === 'py' || key === 'python3') return this.languages.get('python');
    if (key === 'js' || key === 'node') return this.languages.get('javascript');
    if (key === 'ts') return this.languages.get('typescript');
    if (key === 'c++') return this.languages.get('cpp');
    if (key === 'cs') return this.languages.get('csharp');
    if (key === 'golang') return this.languages.get('go');
    return this.languages.get(key);
  }

  update(slug: string, patch: Partial<LanguageConfig>): LanguageConfig {
    const key = slug.toLowerCase().trim();
    const existing = this.languages.get(key);
    if (!existing) {
      throw new Error(`Language "${slug}" not found in registry`);
    }

    const updated = { ...existing, ...patch, slug: existing.slug };
    this.languages.set(key, updated);
    this.logger.log(`Updated language configuration for "${key}"`);
    return updated;
  }

  recordSmokeTestResult(slug: string, status: 'PASS' | 'FAIL'): void {
    const existing = this.get(slug);
    if (existing) {
      existing.smokeTestStatus = status;
      existing.lastSmokeTestAt = new Date().toISOString();
    }
  }
}
