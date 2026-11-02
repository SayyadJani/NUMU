export interface NavLink {
  label: string;
  href: string;
  isActive?: boolean;
  hasDropdown?: boolean;
}

export interface MetricStat {
  value: string;
  label: string;
}

export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  iconName: 'code' | 'laptop' | 'box' | 'trophy' | 'file-text' | 'bar-chart';
}

export interface JourneyStep {
  step: number;
  title: string;
  description: string;
  iconName: 'book-open' | 'code' | 'box' | 'file-text' | 'trophy' | 'bar-chart';
  accentColor: 'emerald' | 'blue' | 'purple' | 'red' | 'amber';
}

export interface DsaTopic {
  id: number;
  name: string;
  solved: number;
  total: number;
  status: 'completed' | 'in-progress' | 'upcoming';
}

export interface DevModule {
  id: string;
  title: string;
  iconType: 'html' | 'js' | 'react' | 'node' | 'mongo';
  status: 'Completed' | 'In Progress' | 'Upcoming';
  statusType: 'completed' | 'in-progress' | 'upcoming';
}

export interface StudentRow {
  rank: number;
  name: string;
  dsa: number;
  dev: number;
  projects: number;
  status: 'Active' | 'Needs Help';
}

export const NAV_LINKS: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'DSA', href: '/dashboard/dsa' },
  { label: 'Development', href: '/dashboard/development' },
  { label: 'Tests', href: '/dashboard/tests' },
  { label: 'For Colleges', href: '/#colleges' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'Resources', href: '#resources', hasDropdown: true },
];

export const HERO_STATS: MetricStat[] = [
  { value: '10K+', label: 'Students' },
  { value: '200+', label: 'Colleges' },
  { value: '500K+', label: 'Problems Solved' },
  { value: '50K+', label: 'Projects Built' },
];

export const CORE_FEATURES: FeatureItem[] = [
  {
    id: 'dsa',
    title: 'DSA Learning',
    description: 'Structured roadmap, curated problems, patterns and practice.',
    iconName: 'code',
  },
  {
    id: 'dev',
    title: 'Development',
    description: 'Learn modern tech by building real projects step by step.',
    iconName: 'laptop',
  },
  {
    id: 'projects',
    title: 'Real-world Projects',
    description: 'Build, submit and get reviewed. Create a portfolio that stands out.',
    iconName: 'box',
  },
  {
    id: 'contests',
    title: 'Weekly Contests',
    description: 'Compete, improve and climb the leaderboard.',
    iconName: 'trophy',
  },
  {
    id: 'assessments',
    title: 'Assessments',
    description: 'Track your understanding with topic tests and mock exams.',
    iconName: 'file-text',
  },
  {
    id: 'progress',
    title: 'Progress Tracking',
    description: 'Detailed analytics, streaks and achievements.',
    iconName: 'bar-chart',
  },
];

export const JOURNEY_STEPS: JourneyStep[] = [
  {
    step: 1,
    title: 'Learn',
    description: 'Structured concept learning',
    iconName: 'book-open',
    accentColor: 'emerald',
  },
  {
    step: 2,
    title: 'Practice',
    description: 'Solve curated problems and exercises',
    iconName: 'code',
    accentColor: 'emerald',
  },
  {
    step: 3,
    title: 'Build',
    description: 'Work on real-world projects',
    iconName: 'box',
    accentColor: 'emerald',
  },
  {
    step: 4,
    title: 'Test',
    description: 'Assess your knowledge with tests',
    iconName: 'file-text',
    accentColor: 'blue',
  },
  {
    step: 5,
    title: 'Compete',
    description: 'Participate in contests and events',
    iconName: 'trophy',
    accentColor: 'red',
  },
  {
    step: 6,
    title: 'Improve',
    description: 'Get insights and level up.',
    iconName: 'bar-chart',
    accentColor: 'amber',
  },
];

export const DSA_ROADMAP_ITEMS: DsaTopic[] = [
  { id: 1, name: 'Arrays', solved: 12, total: 12, status: 'completed' },
  { id: 2, name: 'Strings', solved: 8, total: 10, status: 'completed' },
  { id: 3, name: 'Searching', solved: 6, total: 12, status: 'in-progress' },
  { id: 4, name: 'Sorting', solved: 0, total: 14, status: 'upcoming' },
  { id: 5, name: 'Linked List', solved: 0, total: 16, status: 'upcoming' },
];

export const DEV_MODULES: DevModule[] = [
  { id: 'html-css', title: 'HTML & CSS', iconType: 'html', status: 'Completed', statusType: 'completed' },
  { id: 'js', title: 'JavaScript', iconType: 'js', status: 'Completed', statusType: 'completed' },
  { id: 'react', title: 'React', iconType: 'react', status: 'In Progress', statusType: 'in-progress' },
  { id: 'node', title: 'Node.js', iconType: 'node', status: 'Upcoming', statusType: 'upcoming' },
  { id: 'mongo', title: 'MongoDB', iconType: 'mongo', status: 'Upcoming', statusType: 'upcoming' },
];

export const COLLEGE_STUDENT_DATA: StudentRow[] = [
  { rank: 1, name: 'Aarav Sharma', dsa: 82, dev: 76, projects: 8, status: 'Active' },
  { rank: 2, name: 'Sneha Reddy', dsa: 68, dev: 54, projects: 5, status: 'Active' },
  { rank: 3, name: 'Rohan Mehta', dsa: 41, dev: 38, projects: 2, status: 'Needs Help' },
];

export const FOOTER_LINKS = [
  { label: 'About', href: '#' },
  { label: 'Features', href: '#' },
  { label: 'For Colleges', href: '#' },
  { label: 'Pricing', href: '#' },
  { label: 'Blog', href: '#' },
  { label: 'Contact', href: '#' },
];
