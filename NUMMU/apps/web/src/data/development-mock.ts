/**
 * DUMMY DATA — Development Page
 * ─────────────────────────────────────────────────────────────────────────────
 * Replace each export with a real API fetch when the backend is ready.
 * Shape of every object is designed to match a REST/GraphQL response directly.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type ProjectStatus = 'active' | 'review' | 'completed' | 'paused';
export type ProjectStage  = 'planning' | 'building' | 'testing' | 'deployed';
export type SkillLevel    = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface DevProject {
  id: string;
  title: string;
  description: string;
  type: 'fullstack' | 'frontend' | 'backend' | 'api' | 'mobile';
  status: ProjectStatus;
  stage: ProjectStage;
  sprint: string;            // e.g. "Sprint 3 of 5"
  progressPct: number;
  techStack: string[];       // tech names — icons rendered separately
  githubUrl: string;
  liveUrl?: string;
  stars: number;
  lastCommit: string;        // relative time
  nextMilestone: string;
  reviewsPending: number;
  xpReward: number;
}

export interface TechTrack {
  id: string;
  label: string;
  description: string;
  icon: string;              // lucide icon name reference — rendered in page
  color: string;             // tailwind color key
  masteryPct: number;
  modulesCompleted: number;
  modulesTotal: number;
  currentModule: string;
  isActive: boolean;
}

export interface DevModule {
  id: string;
  title: string;
  track: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  durationMin: number;
  completedLessons: number;
  totalLessons: number;
  progressPct: number;
  tags: string[];
  isNew?: boolean;
  isRecommended?: boolean;
}

export interface DevCommit {
  id: string;
  message: string;
  repo: string;
  branch: string;
  time: string;
  additions: number;
  deletions: number;
  filesChanged: number;
}

export interface TechSkill {
  name: string;
  slug: string;
  level: SkillLevel;
  masteryPct: number;
  color: string;             // tailwind color class
}

export interface DevMilestone {
  id: string;
  projectTitle: string;
  task: string;
  dueIn: string;
  priority: 'high' | 'medium' | 'low';
  done: boolean;
}

export interface DevTopic {
  id: string;
  title: string;
  subtitle: string;
  icon: string;              // emoji fallback
  color: string;
  problemCount: number;
  slug: string;
}

// ─── Overview Stats ───────────────────────────────────────────────────────────

export const DEV_STATS = {
  projectsBuilt:    3,
  projectsTarget:   8,
  projectsInReview: 1,
  currentStreak:    12,      // days
  linesWritten:     24_680,
  commitsThisWeek:  18,
  skillsLearned:    9,
  skillsTarget:     15,
  readinessPct:     68,      // overall dev readiness
  frontendPct:      85,
  backendPct:       62,
  devOpsPct:        34,
};

// ─── Active Projects ──────────────────────────────────────────────────────────

export const DEV_PROJECTS: DevProject[] = [
  {
    id: 'proj-1',
    title: 'Fullstack Expense & Budget SaaS',
    description: 'Production-grade Next.js 15 SaaS with Server Actions, PostgreSQL, Prisma ORM, Stripe billing, and JWT auth.',
    type: 'fullstack',
    status: 'active',
    stage: 'building',
    sprint: 'Sprint 3 of 5',
    progressPct: 65,
    techStack: ['Next.js', 'TypeScript', 'PostgreSQL', 'Prisma', 'Stripe', 'Tailwind'],
    githubUrl: 'https://github.com/johnny/numu-expense-tracker',
    liveUrl: 'https://expense-tracker-demo.vercel.app',
    stars: 12,
    lastCommit: '2h ago',
    nextMilestone: 'Setup Refresh Token Rotation & Session Invalidation',
    reviewsPending: 1,
    xpReward: 500,
  },
  {
    id: 'proj-2',
    title: 'REST API: Task Management System',
    description: 'Node.js & Express REST API with Redis caching, rate limiting, Swagger docs, and Docker deployment.',
    type: 'backend',
    status: 'review',
    stage: 'testing',
    sprint: 'Sprint 5 of 5',
    progressPct: 94,
    techStack: ['Node.js', 'Express', 'Redis', 'MongoDB', 'Docker', 'Swagger'],
    githubUrl: 'https://github.com/johnny/task-api',
    stars: 7,
    lastCommit: '1 day ago',
    nextMilestone: 'Final reviewer sign-off & deployment',
    reviewsPending: 2,
    xpReward: 300,
  },
  {
    id: 'proj-3',
    title: 'React Portfolio & Blog',
    description: 'Personal portfolio with MDX blog, dark mode, animations, and optimized Lighthouse score.',
    type: 'frontend',
    status: 'completed',
    stage: 'deployed',
    sprint: 'Sprint 3 of 3',
    progressPct: 100,
    techStack: ['React', 'Next.js', 'MDX', 'Tailwind', 'Framer Motion'],
    githubUrl: 'https://github.com/johnny/portfolio',
    liveUrl: 'https://johnny.dev',
    stars: 34,
    lastCommit: '3 days ago',
    nextMilestone: 'All milestones completed',
    reviewsPending: 0,
    xpReward: 200,
  },
];

// ─── Tech Tracks ─────────────────────────────────────────────────────────────

export const DEV_TRACKS: TechTrack[] = [
  {
    id: 'track-fe',
    label: 'Frontend & UI',
    description: 'React, Next.js, TypeScript, animations & accessibility',
    icon: 'Monitor',
    color: 'blue',
    masteryPct: 85,
    modulesCompleted: 17,
    modulesTotal: 20,
    currentModule: 'Advanced React Patterns & Server Components',
    isActive: true,
  },
  {
    id: 'track-be',
    label: 'Backend & APIs',
    description: 'Node.js, Express, REST, GraphQL, auth & databases',
    icon: 'Server',
    color: 'emerald',
    masteryPct: 62,
    modulesCompleted: 10,
    modulesTotal: 18,
    currentModule: 'JWT Auth & Refresh Token Strategy',
    isActive: true,
  },
  {
    id: 'track-db',
    label: 'Databases',
    description: 'PostgreSQL, MongoDB, Redis, query optimization',
    icon: 'Database',
    color: 'purple',
    masteryPct: 55,
    modulesCompleted: 8,
    modulesTotal: 14,
    currentModule: 'Indexing Strategies & Query Planning',
    isActive: false,
  },
  {
    id: 'track-devops',
    label: 'DevOps & Cloud',
    description: 'Docker, CI/CD, AWS, Vercel, monitoring & deployment',
    icon: 'Cloud',
    color: 'orange',
    masteryPct: 34,
    modulesCompleted: 4,
    modulesTotal: 12,
    currentModule: 'Docker Compose & Container Networking',
    isActive: false,
  },
  {
    id: 'track-sys',
    label: 'System Design',
    description: 'Scalability, caching, load balancing, microservices',
    icon: 'GitBranch',
    color: 'rose',
    masteryPct: 28,
    modulesCompleted: 3,
    modulesTotal: 10,
    currentModule: 'CAP Theorem & Distributed Systems Basics',
    isActive: false,
  },
];

// ─── Recommended Modules ──────────────────────────────────────────────────────

export const DEV_MODULES: DevModule[] = [
  {
    id: 'mod-1',
    title: 'JWT Auth & Refresh Token Rotation',
    track: 'Backend & APIs',
    difficulty: 'Intermediate',
    durationMin: 45,
    completedLessons: 3,
    totalLessons: 8,
    progressPct: 38,
    tags: ['Node.js', 'Security', 'Auth'],
    isRecommended: true,
  },
  {
    id: 'mod-2',
    title: 'Advanced React Server Components',
    track: 'Frontend & UI',
    difficulty: 'Advanced',
    durationMin: 60,
    completedLessons: 0,
    totalLessons: 10,
    progressPct: 0,
    tags: ['React', 'Next.js', 'RSC'],
    isNew: true,
  },
  {
    id: 'mod-3',
    title: 'PostgreSQL Indexing & Query Optimization',
    track: 'Databases',
    difficulty: 'Intermediate',
    durationMin: 40,
    completedLessons: 2,
    totalLessons: 6,
    progressPct: 33,
    tags: ['PostgreSQL', 'Performance'],
  },
  {
    id: 'mod-4',
    title: 'Docker & Docker Compose for Node Apps',
    track: 'DevOps & Cloud',
    difficulty: 'Beginner',
    durationMin: 35,
    completedLessons: 0,
    totalLessons: 7,
    progressPct: 0,
    tags: ['Docker', 'DevOps'],
  },
];

// ─── Recent Commits ───────────────────────────────────────────────────────────

export const DEV_COMMITS: DevCommit[] = [
  {
    id: 'c1',
    message: 'feat: implement JWT refresh token rotation middleware',
    repo: 'numu-expense-tracker',
    branch: 'feature/jwt-auth',
    time: '2h ago',
    additions: 148,
    deletions: 12,
    filesChanged: 4,
  },
  {
    id: 'c2',
    message: 'fix: resolve race condition in session invalidation logic',
    repo: 'numu-expense-tracker',
    branch: 'feature/jwt-auth',
    time: '5h ago',
    additions: 34,
    deletions: 28,
    filesChanged: 2,
  },
  {
    id: 'c3',
    message: 'chore: add Redis cache layer for user session lookup',
    repo: 'task-api',
    branch: 'feat/redis-cache',
    time: '1 day ago',
    additions: 210,
    deletions: 5,
    filesChanged: 6,
  },
  {
    id: 'c4',
    message: 'test: add integration tests for /api/auth endpoints',
    repo: 'task-api',
    branch: 'feat/redis-cache',
    time: '1 day ago',
    additions: 88,
    deletions: 0,
    filesChanged: 3,
  },
  {
    id: 'c5',
    message: 'style: improve dashboard responsive layout for tablets',
    repo: 'portfolio',
    branch: 'main',
    time: '3 days ago',
    additions: 55,
    deletions: 22,
    filesChanged: 5,
  },
];

// ─── Tech Skills ──────────────────────────────────────────────────────────────

export const DEV_SKILLS: TechSkill[] = [
  { name: 'React',       slug: 'react',      level: 'advanced',      masteryPct: 88, color: 'bg-blue-500' },
  { name: 'Next.js',     slug: 'nextjs',     level: 'advanced',      masteryPct: 82, color: 'bg-slate-800' },
  { name: 'TypeScript',  slug: 'typescript', level: 'intermediate',  masteryPct: 74, color: 'bg-blue-600' },
  { name: 'Node.js',     slug: 'nodejs',     level: 'intermediate',  masteryPct: 66, color: 'bg-green-600' },
  { name: 'PostgreSQL',  slug: 'postgresql', level: 'intermediate',  masteryPct: 58, color: 'bg-blue-400' },
  { name: 'MongoDB',     slug: 'mongodb',    level: 'intermediate',  masteryPct: 55, color: 'bg-green-500' },
  { name: 'Docker',      slug: 'docker',     level: 'beginner',      masteryPct: 38, color: 'bg-cyan-500' },
  { name: 'Redis',       slug: 'redis',      level: 'beginner',      masteryPct: 32, color: 'bg-red-500' },
  { name: 'Tailwind',    slug: 'tailwind',   level: 'expert',        masteryPct: 95, color: 'bg-teal-500' },
];

// ─── Upcoming Milestones ──────────────────────────────────────────────────────

export const DEV_MILESTONES: DevMilestone[] = [
  { id: 'm1', projectTitle: 'Expense SaaS', task: 'Refresh token rotation middleware', dueIn: 'Today', priority: 'high', done: false },
  { id: 'm2', projectTitle: 'Expense SaaS', task: 'Stripe webhook integration', dueIn: 'Tomorrow', priority: 'high', done: false },
  { id: 'm3', projectTitle: 'Task API',     task: 'Final code review sign-off', dueIn: '2 days', priority: 'medium', done: false },
  { id: 'm4', projectTitle: 'Task API',     task: 'Write deployment docs & README', dueIn: '3 days', priority: 'low', done: false },
  { id: 'm5', projectTitle: 'Portfolio',    task: 'Add case study for Expense SaaS', dueIn: 'Next week', priority: 'low', done: true },
];

// ─── Dev Topics to Explore ────────────────────────────────────────────────────

export const DEV_TOPICS: DevTopic[] = [
  { id: 'dt1', title: 'REST API Design',    subtitle: '24 modules', icon: '🔗', color: 'bg-blue-50 border-blue-100',   problemCount: 24, slug: 'rest-api' },
  { id: 'dt2', title: 'Auth & Security',    subtitle: '18 modules', icon: '🔐', color: 'bg-red-50 border-red-100',     problemCount: 18, slug: 'auth' },
  { id: 'dt3', title: 'Databases',          subtitle: '20 modules', icon: '🗄️', color: 'bg-purple-50 border-purple-100', problemCount: 20, slug: 'databases' },
  { id: 'dt4', title: 'React Patterns',     subtitle: '16 modules', icon: '⚛️', color: 'bg-cyan-50 border-cyan-100',   problemCount: 16, slug: 'react-patterns' },
  { id: 'dt5', title: 'System Design',      subtitle: '12 modules', icon: '🏗️', color: 'bg-amber-50 border-amber-100', problemCount: 12, slug: 'system-design' },
  { id: 'dt6', title: 'Docker & CI/CD',     subtitle: '14 modules', icon: '🐳', color: 'bg-sky-50 border-sky-100',     problemCount: 14, slug: 'devops' },
  { id: 'dt7', title: 'Testing',            subtitle: '10 modules', icon: '🧪', color: 'bg-green-50 border-green-100', problemCount: 10, slug: 'testing' },
  { id: 'dt8', title: 'Web Performance',    subtitle: '11 modules', icon: '⚡', color: 'bg-yellow-50 border-yellow-100', problemCount: 11, slug: 'performance' },
];

// ─── Heatmap (21 days commit activity) ───────────────────────────────────────

export interface CommitDay { date: string; commits: number; level: 0|1|2|3|4; }

export const DEV_HEATMAP: CommitDay[] = [
  { date: 'Sep 19', commits: 2, level: 1 },
  { date: 'Sep 20', commits: 5, level: 3 },
  { date: 'Sep 21', commits: 0, level: 0 },
  { date: 'Sep 22', commits: 4, level: 3 },
  { date: 'Sep 23', commits: 3, level: 2 },
  { date: 'Sep 24', commits: 6, level: 4 },
  { date: 'Sep 25', commits: 2, level: 1 },
  { date: 'Sep 26', commits: 7, level: 4 },
  { date: 'Sep 27', commits: 1, level: 1 },
  { date: 'Sep 28', commits: 0, level: 0 },
  { date: 'Sep 29', commits: 4, level: 3 },
  { date: 'Sep 30', commits: 5, level: 3 },
  { date: 'Oct 01', commits: 3, level: 2 },
  { date: 'Oct 02', commits: 2, level: 1 },
  { date: 'Oct 03', commits: 6, level: 4 },
  { date: 'Oct 04', commits: 4, level: 3 },
  { date: 'Oct 05', commits: 1, level: 1 },
  { date: 'Oct 06', commits: 5, level: 3 },
  { date: 'Oct 07', commits: 3, level: 2 },
  { date: 'Oct 08', commits: 7, level: 4 },
  { date: 'Oct 09', commits: 4, level: 3 },
];
