'use client';

import React, { useState, useEffect } from 'react';
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { LoadingState } from '@/components/ui/loading-state';
import { EmptyState } from '@/components/ui/empty-state';
import { profileService } from '@/services/profile-service';
import type { Project } from '@/types/profile';
import {
  FolderGit2,
  ExternalLink,
  Star,
  GitFork,
  Plus,
  Search,
} from 'lucide-react';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // New Project modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [level, setLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [tags, setTags] = useState('React, Node.js, PostgreSQL');
  const [liveUrl, setLiveUrl] = useState('');

  useEffect(() => {
    profileService.getProjects('johnny_dev').then((data) => {
      setProjects(data);
      setLoading(false);
    });
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const tagsList = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const created = await profileService.addProject({
      title: title.trim(),
      description: description.trim(),
      tags: tagsList,
      level,
      stars: 0,
      forks: 0,
      liveUrl: liveUrl.trim() || 'https://github.com',
      previewBg: 'bg-gradient-to-br from-emerald-900 to-slate-900',
    });

    setProjects([created, ...projects]);
    setTitle('');
    setDescription('');
    setLiveUrl('');
    setIsModalOpen(false);
  };

  const filtered = projects.filter((p) => {
    if (levelFilter !== 'all' && p.level !== levelFilter) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-[#fbfcfd] flex">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 pt-[80px] max-w-7xl w-full mx-auto space-y-6">
          <PageHeader
            title="Projects & Capstone Hub"
            description="Build real-world, industry-standard portfolio systems with step-by-step milestones, code reviews, and live previews."
            breadcrumbs={[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Projects' },
            ]}
            actions={
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => setIsModalOpen(true)}
              >
                Create Project Sprint
              </Button>
            }
          />

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {[
                { id: 'all', label: 'All Projects' },
                { id: 'Beginner', label: 'Beginner' },
                { id: 'Intermediate', label: 'Intermediate' },
                { id: 'Advanced', label: 'Advanced Capstones' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setLevelFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    levelFilter === tab.id
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:outline-none focus:bg-white focus:border-emerald-500 transition-all"
              />
            </div>
          </div>

          {/* Projects Grid */}
          {loading ? (
            <LoadingState message="Loading projects portfolio..." />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={FolderGit2}
              title="No projects in this category"
              description="Start a new guided sprint or explore fullstack roadmaps in development."
              actionLabel="New Project Sprint"
              onAction={() => setIsModalOpen(true)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  {/* Visual Header Banner */}
                  <div className={`h-24 ${item.previewBg || 'bg-gradient-to-r from-emerald-800 to-teal-900'} p-4 flex items-start justify-between text-white relative`}>
                    <div className="flex items-center gap-2">
                      <FolderGit2 className="w-5 h-5 text-emerald-300" />
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-xs">
                        {item.level}
                      </span>
                    </div>
                    {item.featured && (
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                        Featured
                      </span>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors mb-1">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1 pt-2">
                      {item.tags.map((t) => (
                        <span key={t} className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 border border-slate-100">
                          {t}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
                      <div className="flex items-center gap-3 text-slate-500 font-mono text-[11px]">
                        <span className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          <span>{item.stars}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <GitFork className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.forks}</span>
                        </span>
                      </div>

                      <a
                        href={item.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
                      >
                        <span>Demo / Code</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* New Project Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Start New Project Sprint"
        description="Configure your project scope, level, and repository."
        maxWidth="md"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Project Title"
            placeholder="e.g. Distributed Task Queue in Go & Redis"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold text-slate-700">Difficulty Level</label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value as 'Beginner' | 'Intermediate' | 'Advanced')}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-500"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold text-slate-700">Description</label>
            <textarea
              rows={3}
              placeholder="What problem does this project solve? List key features..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-emerald-500"
              required
            />
          </div>

          <Input
            label="Tech Stack (comma-separated)"
            placeholder="React, Next.js, PostgreSQL"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />

          <Input
            label="Live URL / GitHub Repository"
            placeholder="https://github.com/username/project"
            value={liveUrl}
            onChange={(e) => setLiveUrl(e.target.value)}
          />

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Create Project
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
