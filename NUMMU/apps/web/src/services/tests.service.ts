/**
 * Tests & Assessments Service Layer
 * Fully functional API client connecting to NestJS TestsModule endpoints.
 */

import { apiClient } from '@/lib/api/api-client';
import type {
  TestItem,
  TestStatus,
  UserQuestionAnswer,
  TestAttemptState,
  AutosaveAnswerPayload,
  RunTestCodePayload,
  SubmitQuestionPayload,
  QuestionSubmissionResult,
  FinalizeTestResult,
} from '@/types/tests';

export class TestsApiService {
  /**
   * List all published weekly tests.
   */
  async getPublishedTests(): Promise<any[]> {
    return apiClient.get<any[]>('/tests');
  }

  /**
   * Get single test overview, instructions, and syllabus topics.
   */
  async getTestBySlug(slug: string): Promise<any> {
    return apiClient.get<any>(`/tests/${slug}`);
  }

  /**
   * Start or resume an active test attempt (Idempotent).
   */
  async startOrResumeAttempt(slug: string): Promise<TestAttemptState> {
    return apiClient.post<TestAttemptState>(`/tests/${slug}/attempt`);
  }

  /**
   * Autosave current question draft code and state.
   */
  async autosaveAnswer(slug: string, payload: AutosaveAnswerPayload): Promise<{ success: boolean; savedAt: string }> {
    return apiClient.post<{ success: boolean; savedAt: string }>(`/tests/${slug}/attempt/autosave`, payload);
  }

  /**
   * Run code against sample test cases via Judge0.
   */
  async runCode(slug: string, payload: RunTestCodePayload): Promise<any> {
    return apiClient.post<any>(`/tests/${slug}/attempt/run`, payload);
  }

  /**
   * Submit single question answer for evaluation against all test cases.
   */
  async submitQuestion(slug: string, payload: SubmitQuestionPayload): Promise<QuestionSubmissionResult> {
    return apiClient.post<QuestionSubmissionResult>(`/tests/${slug}/attempt/submit-question`, payload);
  }

  /**
   * Finalize the entire test attempt and compute authoritative score.
   */
  async finalizeAttempt(slug: string): Promise<FinalizeTestResult> {
    return apiClient.post<FinalizeTestResult>(`/tests/${slug}/attempt/finalize`);
  }

  /**
   * Get finalized result and submission breakdown for a user.
   */
  async getAttemptResult(slug: string): Promise<FinalizeTestResult> {
    return apiClient.get<FinalizeTestResult>(`/tests/${slug}/attempt/result`);
  }

  // ── Backward Compatible / Legacy Interface Helpers ──
  async getTests(status?: TestStatus): Promise<TestItem[]> {
    try {
      const tests = await this.getPublishedTests();
      if (tests && Array.isArray(tests) && tests.length > 0) {
        return tests.map((t: any) => ({
          id: t.slug || t.id,
          title: t.title,
          status: 'ongoing' as TestStatus,
          dateBadge: 'Weekly',
          fullDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          questionsCount: t.totalQuestions || 5,
          durationMinutes: t.durationMinutes || 90,
          typeBadge: 'Coding',
          passPercentage: t.passPercentage || 60,
          syllabusTags: ['DSA', 'Algorithms', 'Data Structures'],
          score: t.userScore ?? undefined,
          questions: [],
        }));
      }
    } catch {
      // fallback
    }
    return [];
  }

  async getTestById(id: string): Promise<any | null> {
    try {
      return await this.getTestBySlug(id);
    } catch {
      return null;
    }
  }

  async submitTest(testId: string, _answers: Record<number, UserQuestionAnswer>): Promise<{ score: number; userRank: number }> {
    const result = await this.finalizeAttempt(testId);
    return { score: result.score, userRank: 1 };
  }
}

export const testsService = new TestsApiService();
