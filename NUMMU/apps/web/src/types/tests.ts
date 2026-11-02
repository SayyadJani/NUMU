export type TestStatus = 'ongoing' | 'upcoming' | 'past';

export interface TestCase {
  input: string;
  expectedOutput: string;
}

export interface ProblemExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface TestQuestion {
  id: string;
  number: number;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  type: 'coding' | 'mcq';
  tags: string[];
  description: string;
  examples: ProblemExample[];
  constraints: string[];
  boilerplate: Record<string, string>;
  testCases: TestCase[];
  mcqOptions?: { id: string; text: string }[];
}

export interface TestItem {
  id: string;
  title: string;
  status: TestStatus;
  dateBadge: string;
  fullDate: string;
  questionsCount: number;
  durationMinutes: number;
  typeBadge: string;
  passPercentage: number;
  syllabusTags: string[];
  endsIn?: string | undefined;
  startsIn?: string | undefined;
  score?: number | undefined;
  userRank?: number | undefined;
  questions: TestQuestion[];
}

export interface UserQuestionAnswer {
  questionNumber: number;
  code?: string;
  language?: string;
  mcqOptionId?: string;
  status: 'answered' | 'marked' | 'unanswered';
  timeSpentSeconds: number;
  isMarkedForReview?: boolean;
  isSubmitted?: boolean;
  verdict?: string | null;
  testsPassed?: number;
  totalTests?: number;
  marksAwarded?: number;
}

export interface AttemptQuestion {
  id: string;
  number: number;
  problemId: string;
  slug: string;
  title: string;
  difficulty: string;
  marks: number;
  description: string;
  constraints: string[];
  hints: string[];
  boilerplate: Record<string, string>;
  topics: string[];
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  testCases: {
    input: string;
    expectedOutput: string;
  }[];
}

export interface TestAttemptState {
  attemptId: string;
  test: {
    id: string;
    slug: string;
    title: string;
    durationMinutes: number;
    passPercentage: number;
    totalMarks: number;
    totalQuestions: number;
  };
  startedAt: string;
  expiresAt: string;
  totalSecondsLeft: number;
  currentQuestion: number;
  status: 'IN_PROGRESS' | 'SUBMITTED' | 'EXPIRED';
  questions: AttemptQuestion[];
  answers: Record<number, {
    code: string;
    language: string;
    isMarkedForReview: boolean;
    isSubmitted: boolean;
    status: string;
    verdict?: string | null;
    testsPassed?: number;
    totalTests?: number;
    marksAwarded?: number;
    timeSpentSeconds?: number;
  }>;
}

export interface AutosaveAnswerPayload {
  problemSlug: string;
  code: string;
  language: string;
  isMarkedForReview?: boolean;
  timeSpentSeconds?: number;
  currentQuestionIndex?: number;
}

export interface RunTestCodePayload {
  problemSlug: string;
  language: string;
  code: string;
  customInput?: string;
}

export interface SubmitQuestionPayload {
  problemSlug: string;
  language: string;
  code: string;
}

export interface QuestionSubmissionResult {
  submissionId: string;
  verdict: string;
  testsPassed: number;
  totalTests: number;
  runtimeMs: number;
  memoryKb: number;
  marksAwarded: number;
  maxMarks: number;
  compileError?: string;
  stdout?: string;
  stderr?: string;
}

export interface FinalizeTestResult {
  attemptId: string;
  testId: string;
  testSlug: string;
  testTitle: string;
  status: string;
  score: number;
  totalMarks: number;
  percentage: number;
  passed: boolean;
  submittedAt: string;
  totalMinutesSpent?: number;
  stats?: {
    totalQuestions: number;
    correctCount: number;
    partialCount: number;
    incorrectCount: number;
    unattemptedCount: number;
  };
  questions?: {
    number: number;
    title: string;
    slug: string;
    difficulty: string;
    maxMarks: number;
    marksAwarded: number;
    status: string;
    verdict?: string | null;
    testsPassed: number;
    totalTests: number;
    code?: string | null;
    language: string;
    timeSpentSeconds: number;
  }[];
}
