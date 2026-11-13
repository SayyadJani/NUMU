/**
 * NUMU Ed-Tech platform landing content.
 * Tailored specifically to NUMU's 4 Practice tracks (DSA, Development, System Design, Core CS),
 * Judge0 IDE, XP/Streak gamification, Timed Mock Assessments, Verified Profiles, and College TPO tools.
 */

export const WITHOUT_NUMU = [
  { strong: 'Jumping between', rest: 'YouTube playlists, random spreadsheets & PDFs' },
  { strong: 'Memorising solutions', rest: 'instead of learning reusable DSA patterns' },
  { strong: 'Tutorial hell', rest: '— watching hours of video without shipping projects' },
  { strong: 'Skipping System Design', rest: '& Core CS (DBMS, OS, CN, OOPs) until the night before' },
  { strong: 'Disconnected compilers', rest: 'with no saved notes or submission history' },
  { strong: 'No timed practice', rest: 'for company-specific online assessments (OAs)' },
  { strong: 'Broken consistency', rest: 'with no streak tracking or batch accountability' },
  { strong: 'Static resumes', rest: 'with zero verified proof of problems or projects solved' },
] as const;

export const WITH_NUMU = [
  'unified workspace for DSA, Development, System Design & Core CS',
  'pattern-first DSA curriculum with an integrated Judge0 code runner',
  'guided full-stack project milestones with architecture & code checks',
  'structured HLD, LLD, DBMS, OS, CN & OOPs interview modules',
  'in-editor personal revision notes & bookmarked problem sheets',
  'proctored timed mock tests & weekly campus leaderboard contests',
  'live 21-day activity matrix, daily streaks, XP & developer levels',
  'verified public developer profile you can share with recruiters',
] as const;

export const PILLARS = [
  {
    id: 'dsa',
    badge: 'TRACK 01 · ALGORITHMS & JUDGE0 IDE',
    title: 'Pattern-First DSA Curriculum',
    body: 'Instead of dumping 1,000 unsorted problems on you, NUMU organizes DSA into expandable topic accordions and core algorithmic patterns. Write, test, and submit code in C++, Java, Python, or JavaScript with instant Judge0 execution and complexity feedback.',
    highlights: ['Expandable topic-wise accordions', 'Multi-language Judge0 sandbox', 'Inline revision notes & bookmarks'],
    quote:
      'Having the topic progress bars, pattern tags, and Judge0 compiler in one place doubled my daily solving speed.',
    author: 'Aarav Sharma',
    role: 'Level 4 Developer · 140+ Problems Solved',
    org: 'CSE Batch of 2026',
  },
  {
    id: 'dev',
    badge: 'TRACK 02 · FULL-STACK ENGINEERING',
    title: 'Project-Driven Development',
    body: 'Move beyond passive video watching. Progress through Frontend, Backend, and Full-Stack roadmaps by building production-grade applications step by step, submitting repositories, and showcasing deployed work on your NUMU profile.',
    highlights: ['HTML/CSS, JS, React, Node & Databases', 'Milestone-based project submissions', 'Portfolio-ready verification'],
    quote:
      'Building real projects along the roadmap gave me concrete architecture stories to discuss in my technical interviews.',
    author: 'Sneha Reddy',
    role: 'Full-Stack Track · 6 Projects Built',
    org: 'IT Batch of 2026',
  },
  {
    id: 'sys-core',
    badge: 'TRACK 03 & 04 · ARCHITECTURE & FUNDAMENTALS',
    title: 'System Design & Core CS Hub',
    body: 'Technical interviews test more than just coding. Master High-Level Design (HLD), Low-Level Design (LLD), Distributed Systems, DBMS & SQL, Operating Systems, Computer Networks, and OOPs through structured, interactive modules.',
    highlights: ['HLD, LLD & Distributed Systems', 'DBMS, OS, Computer Networks & OOPs', 'Topic-by-topic mastery tracking'],
    quote:
      'Most of my peers lost marks in DBMS, OS, and LLD rounds. The Core CS and System Design hubs on NUMU made those my strongest rounds.',
    author: 'Rahul Verma',
    role: 'SDE Intern Offer',
    org: 'Final-Year ECE',
  },
  {
    id: 'tests',
    badge: 'ASSESSMENTS & GAMIFIED ANALYTICS',
    title: 'Timed Mock Tests, Streaks & Public Profiles',
    body: 'Simulate real placement pressure with timed assessments and weekly contests. Every accepted submission updates your 21-day PostgreSQL activity matrix, awards XP, levels up your developer rank, and builds your verified public profile.',
    highlights: ['Timed company-style mock tests', 'XP levels, badges & batch leaderboards', 'Shareable verified developer profile'],
    quote:
      'The 21-day streak matrix and campus leaderboard kept our entire hostel wing competing every single evening.',
    author: 'Ananya Iyer',
    role: 'Knight Tier · Top 2% on Leaderboard',
    org: '3rd-Year CSE',
  },
] as const;

export const AFTER_SIGNUP = [
  {
    title: '21-Day Activity Matrix & Streaks',
    body: 'Every Judge0 submission and completed module lights up your live activity heatmap and extends your daily practice streak.',
    bg: 'bg-flx-pastel-yellow',
  },
  {
    title: 'Deep Topic Mastery Analytics',
    body: 'See your Easy/Medium/Hard split, Judge0 accuracy rate, and per-topic completion percentages updated in real time.',
    bg: 'bg-flx-pastel-pearl',
  },
  {
    title: 'Live Campus & Global Leaderboards',
    body: 'Earn XP for every problem solved, test completed, and project built. Climb your college batch and global rankings.',
    bg: 'bg-flx-pastel-lavender',
  },
  {
    title: 'In-Editor Notes & Bookmarks',
    body: 'Jot down intuition, time complexity, and edge cases right beside the code editor for fast last-minute interview revision.',
    bg: 'bg-flx-pastel-red',
  },
  {
    title: 'Verified Developer Profile',
    body: 'Showcase your solved problems, test ratings, deployed projects, and earned badges on a clean public URL (`/profile/you`).',
    bg: 'bg-flx-pastel-green',
  },
  {
    title: 'Dark & Light Workspace Themes',
    body: 'Switch seamlessly between crisp daylight mode and eye-friendly dark mode across your dashboard, IDE, and profile.',
    bg: 'bg-flx-pastel-blue',
  },
] as const;

export const PLANS = [
  {
    ideal: 'Self-paced learners',
    pre: 'Start with',
    name: 'Student Free',
    tagline: 'Everything you need to start solving and building today.',
    points: [
      'Complete 8-topic core DSA roadmap & Judge0 IDE.',
      'Core CS Fundamentals & foundational System Design modules.',
      '21-day streak tracker, XP progression & public profile.',
    ],
    cta: 'Create Free Account',
    href: '/register',
    featured: false,
  },
  {
    ideal: 'Placement preparation',
    pre: 'Accelerate with',
    name: 'NUMU Pro',
    tagline: 'Full access to all 4 practice tracks, mocks, and reviews.',
    points: [
      '150+ pattern-tagged DSA problems & company-wise sheets.',
      'Full-Stack Development projects + HLD/LLD System Design.',
      'Unlimited timed mock tests, analytics & priority reviews.',
    ],
    cta: 'Start Pro Trial',
    href: '/register',
    featured: true,
  },
  {
    ideal: 'Universities & TPOs',
    pre: 'Deploy',
    name: 'NUMU Campus',
    tagline: 'Measurable placement readiness across your entire institution.',
    points: [
      'Admin & trainer portal to monitor batch-wise progress.',
      'Custom proctored placement tests & department leaderboards.',
      'Exportable NAAC / TPO placement readiness analytics.',
    ],
    cta: 'Partner With NUMU',
    href: '#colleges',
    featured: false,
  },
] as const;

export const FUNNEL = [
  {
    value: '4 Tracks',
    title: 'Unified Curriculum Architecture',
    body: 'DSA, Full-Stack Development, System Design (HLD/LLD) & Core CS in one workspace',
  },
  {
    value: '150+',
    title: 'High-Yield Interview Patterns',
    body: 'Curated problems grouped by Sliding Window, Two Pointers, Graphs, DP & more',
  },
  {
    value: 'Judge0',
    title: 'Real-Time Code Execution & Verification',
    body: 'Instant test-case validation, runtime benchmarks, and memory profiling',
  },
  {
    value: 'Timed OAs',
    title: 'Simulated Company Assessments',
    body: 'Topic tests and full-length mock drives that pinpoint weak areas automatically',
  },
  {
    value: '100%',
    title: 'Verified Placement Readiness',
    body: 'A shareable developer profile proving your consistency, skills, and projects',
  },
] as const;

export const TRACKS = [
  'Arrays & Hashing',
  'Two Pointers',
  'Sliding Window',
  'Stacks & Queues',
  'Trees & Tries',
  'Graphs & Shortest Path',
  'Dynamic Programming',
  'React & Next.js',
  'Node.js & REST APIs',
  'High-Level Design (HLD)',
  'Low-Level Design (LLD)',
  'Distributed Systems',
  'DBMS & SQL Indexing',
  'Operating Systems',
  'Computer Networks',
  'OOPs & Design Patterns',
] as const;

export const TIMELINE = [
  {
    when: 'DAYS 1 - 7',
    title: 'Personalize Your Track & Solve Day-1 Problems',
    body: 'Set your target role and graduation year during onboarding. Jump straight into the interactive DSA topic accordions and run your first solution in the browser IDE.',
    you: 'Pick your track and solve 2–3 problems daily',
    we: 'Configure your roadmap, Judge0 workspace & streak tracker',
  },
  {
    when: 'WEEKS 2 - 6',
    title: 'Master Patterns & Build Real Projects',
    body: 'Work systematically through Arrays, Strings, Linked Lists, Trees, and DP while building hands-on modules in the Development hub.',
    you: 'Complete topic accordions & push project milestones',
    we: 'Track topic coverage, award XP & validate test cases',
  },
  {
    when: 'WEEKS 7 - 10',
    title: 'Conquer System Design, Core CS & Timed Mocks',
    body: 'Strengthen your interview foundations with HLD, LLD, DBMS, OS, CN, and OOPs modules, then test yourself under pressure with timed assessments.',
    you: 'Attempt weekly mock tests & review Core CS modules',
    we: 'Generate accuracy breakdowns & highlight revision topics',
  },
  {
    when: 'PLACEMENT SEASON',
    title: 'Share Your Verified Profile & Crack Interviews',
    body: 'Walk into campus drives and off-campus interviews with a verified NUMU developer profile showcasing your streak, rating, solved problems, and projects.',
    you: 'Share your NUMU profile link & ace your interviews',
    we: 'Keep you sharp with weekly contests & revision notes',
  },
] as const;

export const COMPARISON = {
  columns: ['NUMU Platform', 'YouTube Playlists', 'Static DSA Sheets'],
  rows: [
    {
      label: '4-in-1 Practice Hub',
      values: ['DSA, Dev, System Design & Core CS', 'Scattered across channels', 'DSA links only'],
    },
    {
      label: 'Code Execution Engine',
      values: ['Built-in Judge0 IDE + test cases', 'Watch-only videos', 'Redirects to external sites'],
    },
    {
      label: 'Topic Organization',
      values: ['Interactive expandable accordions', 'Long unindexed playlists', 'Flat spreadsheet rows'],
    },
    {
      label: 'System Design & Core CS',
      values: ['Dedicated HLD, LLD, DBMS, OS, CN, OOPs', 'Inconsistent coverage', 'Not included'],
    },
    {
      label: 'Timed Mock Assessments',
      values: ['Built-in test engine & ratings', 'Not available', 'Not available'],
    },
    {
      label: 'Progress & Gamification',
      values: ['21-day heatmap, XP, levels & badges', 'Watch history only', 'Manual checkboxes'],
    },
    {
      label: 'Developer Portfolio',
      values: ['Verified public profile (/profile/you)', 'None', 'None'],
    },
  ],
} as const;

export const CASE_STUDIES = [
  {
    org: 'CSE & IT Placement Cell',
    meta: ['Autonomous Campus', '650+ Students'],
    stat: '3.2x Solving Velocity',
    subtitle: 'Unified DSA + Core CS tracking',
    title: 'How final-year batches replaced scattered spreadsheets with NUMU’s unified practice workspace',
  },
  {
    org: 'University Training Division',
    meta: ['Multi-Department', '1,200+ Students'],
    stat: '85% Automated OAs',
    subtitle: 'Proctored tests & instant leaderboards',
    title: 'How faculty trainers automated weekly coding assessments and identified at-risk students early',
  },
  {
    org: 'Student Developer Club',
    meta: ['Peer Learning Cohort', '400+ Members'],
    stat: '21-Day Streak Culture',
    subtitle: 'Gamified XP & public profiles',
    title: 'How daily streak heatmaps and campus leaderboards turned placement prep into a team sport',
  },
] as const;

export const FAQS = [
  {
    q: 'What makes NUMU different from a standard coding practice site?',
    a: 'NUMU brings all four pillars of technical interview preparation—DSA with an integrated Judge0 IDE, Full-Stack Development, System Design (HLD & LLD), and Core CS (DBMS, OS, CN, OOPs)—into one cohesive dashboard with live streak tracking and a verified developer profile.',
  },
  {
    q: 'Can I write and run code directly inside NUMU?',
    a: 'Yes! Every DSA problem opens in our full-screen coding workspace powered by Judge0. You can write code, run custom inputs, validate against hidden test cases, and save personal notes right next to the problem.',
  },
  {
    q: 'Is NUMU suitable for first- and second-year college students?',
    a: 'Absolutely. The curriculum starts from foundational topics (Arrays, Strings, HTML/CSS, OOPs) and progressively unlocks intermediate and advanced modules like Dynamic Programming, Full-Stack Apps, and Distributed Systems.',
  },
  {
    q: 'What is included in the System Design and Core CS sections?',
    a: 'The System Design hub covers High-Level Design (scalability, caching, load balancing, sharding), Low-Level Design (SOLID, design patterns, object modeling), and Distributed Systems. The Core CS hub covers DBMS & SQL, Operating Systems, Computer Networks, and OOPs.',
  },
  {
    q: 'How does the Verified Developer Profile work?',
    a: 'As you solve problems, attend mock tests, and build projects, your public profile (/profile/username) automatically updates with your live stats, topic mastery breakdown, streak record, and earned badges—giving recruiters verifiable proof of your skills.',
  },
  {
    q: 'Do you offer an admin portal for colleges and training partners?',
    a: 'Yes. NUMU includes a dedicated Admin & Trainer portal for managing problems, creating timed assessments, monitoring student submissions, and exporting batch-level placement readiness reports.',
  },
] as const;
