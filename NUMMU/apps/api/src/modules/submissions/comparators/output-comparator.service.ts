import { Injectable } from '@nestjs/common';
import { ComparatorType } from '@numu/types';

export interface ComparisonContext {
  problemSlug?: string;
  comparatorType?: ComparatorType;
  floatTolerance?: number;
}

export interface ComparisonResult {
  isMatch: boolean;
  userOutput: string | null;
  expectedOutput: string;
  details?: string;
}

@Injectable()
export class OutputComparatorService {
  /**
   * Compares user output against expected output according to declared or inferred comparator semantics.
   */
  compare(
    actual: string | null | undefined,
    expected: string | null | undefined,
    context?: ComparisonContext,
  ): ComparisonResult {
    const cleanExpected = expected ? expected.trim() : '';

    if (!cleanExpected) {
      return {
        isMatch: true,
        userOutput: actual ? actual.trim() : null,
        expectedOutput: cleanExpected,
      };
    }

    if (actual === undefined || actual === null) {
      return {
        isMatch: false,
        userOutput: null,
        expectedOutput: cleanExpected,
        details: 'Actual output is null or undefined',
      };
    }

    const cleanActual = actual.trim();
    if (cleanActual === cleanExpected) {
      return {
        isMatch: true,
        userOutput: cleanActual,
        expectedOutput: cleanExpected,
      };
    }

    // Try parsing as JSON for structured comparison
    let parsedActual: any;
    let parsedExpected: any;
    let isJson = false;

    try {
      parsedActual = JSON.parse(cleanActual);
      parsedExpected = JSON.parse(cleanExpected);
      isJson = true;
    } catch {
      isJson = false;
    }

    // 1. JSON Array Comparison (handles Two Sum unordered pairs and nested arrays)
    if (isJson) {
      // Check exact JSON equivalence
      if (JSON.stringify(parsedActual) === JSON.stringify(parsedExpected)) {
        return {
          isMatch: true,
          userOutput: cleanActual,
          expectedOutput: cleanExpected,
        };
      }

      // Check unordered array equivalence (e.g. [0, 1] vs [1, 0] for Two Sum)
      const isUnordered =
        context?.comparatorType === 'UNORDERED_ARRAY' ||
        (context?.problemSlug === 'two-sum' && Array.isArray(parsedActual) && Array.isArray(parsedExpected)) ||
        (context?.problemSlug === '3sum' && Array.isArray(parsedActual) && Array.isArray(parsedExpected));

      if (isUnordered && Array.isArray(parsedActual) && Array.isArray(parsedExpected)) {
        if (this.compareUnorderedArrays(parsedActual, parsedExpected)) {
          return {
            isMatch: true,
            userOutput: cleanActual,
            expectedOutput: cleanExpected,
          };
        }
      }

      // Check float tolerance if numbers
      if (typeof parsedActual === 'number' && typeof parsedExpected === 'number') {
        const tol = context?.floatTolerance ?? 1e-5;
        if (Math.abs(parsedActual - parsedExpected) <= tol) {
          return {
            isMatch: true,
            userOutput: cleanActual,
            expectedOutput: cleanExpected,
          };
        }
      }
    }

    // 2. Case-insensitive boolean comparison (handles Python True vs JS true)
    if (cleanActual.toLowerCase() === cleanExpected.toLowerCase()) {
      return {
        isMatch: true,
        userOutput: cleanActual,
        expectedOutput: cleanExpected,
      };
    }

    // 3. Multi-line comparison with whitespace normalization
    if (context?.comparatorType === 'LINES' || cleanExpected.includes('\n')) {
      const actualLines = cleanActual.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
      const expectedLines = cleanExpected.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);

      if (actualLines.length === expectedLines.length) {
        const allMatch = actualLines.every((line, idx) => line === expectedLines[idx]);
        if (allMatch) {
          return {
            isMatch: true,
            userOutput: cleanActual,
            expectedOutput: cleanExpected,
          };
        }
      }
    }

    return {
      isMatch: false,
      userOutput: cleanActual,
      expectedOutput: cleanExpected,
      details: `Output mismatch: expected "${cleanExpected}" but received "${cleanActual}"`,
    };
  }

  /**
   * Recursively compares arrays regardless of order if configured.
   */
  private compareUnorderedArrays(a: any[], b: any[]): boolean {
    if (a.length !== b.length) return false;

    // For 1D primitive array (e.g. [0, 1] vs [1, 0] for Two Sum)
    if (a.every((x) => typeof x !== 'object' || x === null)) {
      const sortedA = [...a].sort();
      const sortedB = [...b].sort();
      return JSON.stringify(sortedA) === JSON.stringify(sortedB);
    }

    // For 2D nested arrays (e.g. 3Sum list of triplets [[-1,-1,2],[-1,0,1]])
    if (a.every((x) => Array.isArray(x))) {
      const normA = a.map((sub: any[]) => [...sub].sort()).map((sub) => JSON.stringify(sub)).sort();
      const normB = b.map((sub: any[]) => [...sub].sort()).map((sub) => JSON.stringify(sub)).sort();
      return JSON.stringify(normA) === JSON.stringify(normB);
    }

    return false;
  }
}
