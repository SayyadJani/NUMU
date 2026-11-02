import React from 'react';
import {
  DashboardGreeting,
  QuickStatsRow,
  DsaProgressCard,
  DevProgressCard,
  CurrentLearningPath,
  ContinueLearningBanner,
  DailyChallenge,
  UpcomingContest,
  UpcomingTest,
  TodaysTasks,
  CurrentProject,
  RecommendedPractice,
  RecentActivity,
  MotivationStats,
  YourGoals,
} from '@/components/dashboard';

export default function DashboardPage() {
  return (
    <main className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
      {/* Row 1: Greeting + Streak + Activity */}
      <DashboardGreeting />

      {/* Row 1.5: Quick Metrics Overview */}
      <QuickStatsRow />

      {/* Row 2: DSA Progress | Dev Progress | Current Learning Path */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <DsaProgressCard />
        <DevProgressCard />
        <CurrentLearningPath />
      </div>

      {/* Row 3: Continue Learning Banner (full width) */}
      <ContinueLearningBanner />

      {/* Row 4: Daily Challenge | Upcoming Contest | Upcoming Test */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DailyChallenge />
        <UpcomingContest />
        <UpcomingTest />
      </div>

      {/* Row 5: Today's Tasks | Current Project | Recommended Practice */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TodaysTasks />
        <CurrentProject />
        <RecommendedPractice />
      </div>

      {/* Row 6: Recent Activity | Motivation Quote+Stats | Your Goals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <RecentActivity />
        <MotivationStats />
        <YourGoals />
      </div>
    </main>
  );
}
