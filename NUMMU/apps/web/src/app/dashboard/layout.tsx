import React from 'react';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';

export const metadata = {
  title: 'Dashboard | NUMU - Developer Learning Platform',
  description: 'Track your DSA progress, fullstack engineering milestones, contests, assessments, and study notes.',
};

/**
 * Root Dashboard Layout
 * Delegates to DashboardShell to provide persistent sidebar and header
 * on standard dashboard routes, while providing a clean full-screen view
 * on DSA problem practice sessions.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell>{children}</DashboardShell>;
}

