import React from 'react';
import {
  DashboardGreeting,
  QuickStatsRow,
  DsaProgressCard,
  DevProgressCard,
  CurrentLearningPath,
  ContinueLearningBanner,
  DailyChallenge,
  UpcomingTest,
  TodaysTasks,
  RecommendedPractice,
  RecentActivity,
  YourGoals,
} from '@/components/dashboard';

export default function DashboardPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* 1. Top Greeting, Level XP Bar, Live Streak & 21-Day Activity Matrix */}
      <DashboardGreeting />

      {/* 2. Quick Stats Overview (4 Live PostgreSQL KPI Cards) */}
      <QuickStatsRow />

      {/* 3. Progress Section: DSA Mastery + Topic Coverage + Shared 8-Topic Curriculum Path */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DsaProgressCard />
        <DevProgressCard />
        <CurrentLearningPath />
      </div>

      {/* 4. Full-Width Continue Learning Banner (Live Current Topic & Next Problem) */}
      <ContinueLearningBanner />

      {/* 5. Action Zone: Daily Challenge, Proctored Assessment, Curriculum Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DailyChallenge />
        <UpcomingTest />
        <TodaysTasks />
      </div>

      {/* 6. Practice & Submissions Zone: Curriculum Problems, Recent Judge0 Submissions, Milestone Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecommendedPractice />
        <RecentActivity />
        <YourGoals />
      </div>
    </div>
  );
}
