'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ProfileSidebar } from '@/components/profile/ProfileSidebar';
import { ProfileStatsBar } from '@/components/profile/ProfileStatsBar';
import { ProfileTabsNav } from '@/components/profile/ProfileTabsNav';
import { ProfileSkeleton } from '@/components/profile/ProfileSkeleton';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/contexts/auth-context';
import dynamic from 'next/dynamic';
import { OverviewTab } from '@/components/profile/tabs/OverviewTab';
import { Skeleton } from '@/components/ui/loading-state';

const TabSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-2">
          <div className="flex justify-between items-center">
            <Skeleton className="w-16 h-3 rounded" />
            <Skeleton className="w-4 h-4 rounded-full" />
          </div>
          <Skeleton className="w-20 h-7 rounded" />
          <Skeleton className="w-28 h-3 rounded" />
        </div>
      ))}
    </div>
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4">
      <div className="flex justify-between items-center pb-2 border-b border-slate-100">
        <Skeleton className="w-36 h-5 rounded" />
        <Skeleton className="w-24 h-4 rounded" />
      </div>
      <Skeleton className="w-full h-44 rounded-xl" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
      </div>
    </div>
  </div>
);

const DsaTab = dynamic(
  () => import('@/components/profile/tabs/DsaTab').then((m) => m.DsaTab),
  { loading: TabSkeleton }
);
const DevelopmentTab = dynamic(
  () => import('@/components/profile/tabs/DevelopmentTab').then((m) => m.DevelopmentTab),
  { loading: TabSkeleton }
);
const ProjectsTab = dynamic(
  () => import('@/components/profile/tabs/ProjectsTab').then((m) => m.ProjectsTab),
  { loading: TabSkeleton }
);
const TestsTab = dynamic(
  () => import('@/components/profile/tabs/TestsTab').then((m) => m.TestsTab),
  { loading: TabSkeleton }
);
const ActivityTab = dynamic(
  () => import('@/components/profile/tabs/ActivityTab').then((m) => m.ActivityTab),
  { loading: TabSkeleton }
);
const EditProfileModal = dynamic(
  () => import('@/components/profile/EditProfileModal').then((m) => m.EditProfileModal)
);

import { profileService, getEmptyProfile } from '@/services/profile-service';
import type {
  UserProfile,
  ProfileTab,
  Project,
  DsaStatistics,
  DevSkill,
  ActivityData,
  TestResult,
} from '@/types/profile';
import {
  LayoutDashboard,
  Code2,
  Cpu,
  FolderGit2,
  Trophy,
  Flame,
} from 'lucide-react';

interface TabConfig {
  id: ProfileTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

export default function ProfilePage() {
  const params = useParams();
  const { user } = useAuth();
  const rawUsername = params ? (params['username'] as string | undefined) : undefined;
  const username = rawUsername ? decodeURIComponent(rawUsername) : user?.username || '';
  const isOwnProfile = !user || user.username === username;

  const { success, error } = useToast();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ProfileTab>('Overview');
  const [profile, setProfile] = useState<UserProfile>(() => getEmptyProfile(username || ''));
  const [projects, setProjects] = useState<Project[]>([]);
  const [dsaStats, setDsaStats] = useState<DsaStatistics>({
    solved: { easy: 0, medium: 0, hard: 0, total: 0 },
    topTopics: [],
    acceptanceRate: '0.0%',
    totalSubmissions: 0,
    globalRank: 1,
    recentSubmissions: [],
  });
  const [skills, setSkills] = useState<DevSkill[]>([]);
  const [activity, setActivity] = useState<ActivityData>({
    contributions: 0,
    longestStreak: 0,
    totalLearningHours: 0,
    currentStreak: 0,
    activeDaysCount: 0,
    heatmapRows: Array.from({ length: 7 }, () => Array(52).fill(false)),
    heatmapDays: Array.from({ length: 7 }, () => Array(52)),
    timeline: [],
  });
  const [tests, setTests] = useState<TestResult[]>([]);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Load profile & all associated live data on mount and when username changes
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      if (!username) return;
      setLoading(true);
      try {
        const [
          loadedProfile,
          loadedProjects,
          loadedDsaStats,
          loadedActivity,
          loadedSkills,
          loadedTests,
        ] = await Promise.all([
          profileService.getProfile(username),
          profileService.getProjects(username),
          profileService.getDsaStats(username),
          profileService.getActivity(username),
          profileService.getDevSkills(username),
          profileService.getTests(username),
        ]);

        if (isMounted) {
          setProfile(loadedProfile);
          setProjects(loadedProjects);
          setDsaStats(loadedDsaStats);
          setActivity(loadedActivity);
          setSkills(loadedSkills);
          setTests(loadedTests);
        }
      } catch (err) {
        console.error('Failed to load profile data:', err);
        if (isMounted) {
          setProfile((prev) => (prev.username ? prev : getEmptyProfile(username)));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [username]);

  const handleSaveProfile = async (updatedFields: Partial<UserProfile>) => {
    try {
      const updated = await profileService.updateProfile(updatedFields);
      setProfile(updated);
      success('Profile updated successfully!', 'Profile Saved');
    } catch (err) {
      console.error('Failed to save profile:', err);
      error('Failed to save profile. Please try again.', 'Update Failed');
    }
  };

  const handleSkillsChange = (newSkills: DevSkill[]) => {
    setSkills(newSkills);
  };

  const handleProjectsChange = (newProjects: Project[]) => {
    setProjects(newProjects);
    setProfile((prev) => ({
      ...prev,
      stats: {
        ...prev.stats,
        projectsCompleted: newProjects.length,
      },
    }));
  };

  const tabs: TabConfig[] = [
    { id: 'Overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'DSA', label: 'DSA', icon: Code2, badge: dsaStats.solved.total },
    { id: 'Development', label: 'Development', icon: Cpu, badge: skills.length },
    { id: 'Projects', label: 'Projects', icon: FolderGit2, badge: projects.length },
    { id: 'Tests', label: 'Tests', icon: Trophy, badge: profile.stats.testsAttended ?? tests.length },
    { id: 'Activity', label: 'Activity', icon: Flame, badge: `${activity.currentStreak}d` },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-[#061e14] flex flex-col">
        <Header />
        <ProfileSkeleton />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#061e14] flex flex-col selection:bg-emerald-100 dark:selection:bg-emerald-900 selection:text-emerald-900 dark:selection:text-emerald-100">
      {/* ── Global Unified Header ── */}
      <Header />

      {/* ── Ambient Top Banner ── */}
      <div className="relative h-28 sm:h-36 w-full overflow-hidden bg-gradient-to-r from-slate-950 via-[#072417] to-slate-900 border-b border-emerald-950/40">
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, #10b981 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between pb-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 text-xs font-semibold backdrop-blur-md shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>NUMU Verified Developer &amp; Competitive Profile</span>
          </div>

          <div className="hidden sm:inline-flex items-center gap-2.5 text-xs text-slate-300 font-mono">
            <span className="px-3 py-1.5 rounded-xl bg-slate-950/70 border border-emerald-500/30 shadow-xs font-semibold">
              Rank #{profile.stats.globalRank ?? 1}
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-slate-950/70 border border-emerald-500/30 shadow-xs font-semibold">
              Rating {profile.stats.contestRating ?? 1200}
            </span>
          </div>
        </div>
      </div>

      {/* ── Main 2-Column Layout ── */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 sm:-mt-16 pb-16 w-full relative z-10">
        <div className="flex flex-col lg:flex-row items-start gap-6">
          {/* Left Column: Profile Card Sidebar */}
          <ProfileSidebar
            profile={profile}
            onEditProfile={isOwnProfile ? () => setIsEditModalOpen(true) : undefined}
          />

          {/* Right Column: Key Stats, Horizontal Tabs & Active Tab View */}
          <section className="flex-1 min-w-0 w-full space-y-6">
            {/* Upper Div: Redesigned Key Stats Bar (no truncations, clean vertical cards) */}
            <ProfileStatsBar stats={profile.stats} quote={profile.quote} />

            {/* Horizontal Tabs Bar placed between Stats and Content */}
            <ProfileTabsNav
              tabs={tabs}
              activeTab={activeTab}
              onSelectTab={setActiveTab}
            />

            {/* Dynamic Content changing accordingly below the tabs */}
            <div className="transition-all duration-200">
              {activeTab === 'Overview' && (
                <OverviewTab
                  dsaStats={dsaStats}
                  skills={skills}
                  activity={activity}
                  projects={projects}
                  tests={tests}
                  onSelectTab={setActiveTab}
                />
              )}

              {activeTab === 'DSA' && (
                <DsaTab dsaStats={dsaStats} />
              )}

              {activeTab === 'Development' && (
                <DevelopmentTab
                  skills={skills}
                  onSkillsChange={handleSkillsChange}
                />
              )}

              {activeTab === 'Projects' && (
                <ProjectsTab
                  projects={projects}
                  username={username}
                  onProjectsChange={handleProjectsChange}
                />
              )}

              {activeTab === 'Tests' && (
                <TestsTab
                  tests={tests}
                  rating={profile.stats.contestRating ?? 1200}
                  stats={profile.stats}
                />
              )}

              {activeTab === 'Activity' && (
                <ActivityTab activity={activity} />
              )}
            </div>
          </section>
        </div>
      </main>

      {/* ── Edit Profile Modal ── */}
      {isEditModalOpen && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          profile={profile}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveProfile}
        />
      )}

      {/* ── Global Unified Footer ── */}
      <Footer />
    </div>
  );
}
