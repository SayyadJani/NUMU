'use client';

import React, { useState } from 'react';
import {
  Star,
  GitFork,
  Sparkles,
  ArrowUpRight,
  FolderGit2,
  Plus,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { GithubIcon } from '@/components/ui/icons';
import type { Project } from '@/types/profile';
import { ProjectDetailModal } from './ProjectDetailModal';
import { profileService } from '@/services/profile-service';
import { useToast } from '@/components/ui/toast';

interface ProjectsTabProps {
  projects: Project[];
  username?: string;
  onProjectsChange?: (projects: Project[]) => void;
}

export function ProjectsTab({
  projects: initialProjects,
  username,
  onProjectsChange,
}: ProjectsTabProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [activeFilter, setActiveFilter] = useState<'All' | 'Featured' | 'Next.js' | 'AI'>('All');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { success } = useToast();

  // New project form state
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formTags, setFormTags] = useState('Next.js 15, TypeScript, Tailwind CSS');
  const [formLevel, setFormLevel] = useState<Project['level']>('Advanced');
  const [formLiveUrl, setFormLiveUrl] = useState('');
  const [formGithubUrl, setFormGithubUrl] = useState('');
  const [formBg, setFormBg] = useState('from-emerald-900 to-slate-900');
  const [formFeatured, setFormFeatured] = useState(false);

  const filteredProjects = projects.filter((project) => {
    if (activeFilter === 'Featured') return project.featured;
    if (activeFilter === 'Next.js') return project.tags.some((t) => t.toLowerCase().includes('next'));
    if (activeFilter === 'AI') return project.title.toLowerCase().includes('ai') || project.description.toLowerCase().includes('ai');
    return true;
  });

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDesc.trim()) return;

    const newProj = await profileService.addProject({
      title: formTitle.trim(),
      description: formDesc.trim(),
      tags: formTags.split(',').map((t) => t.trim()).filter(Boolean),
      level: formLevel,
      stars: 1,
      forks: 0,
      liveUrl: formLiveUrl.trim() || 'https://github.com',
      githubUrl: formGithubUrl.trim() || undefined,
      previewBg: formBg,
      featured: formFeatured,
    });

    const updated = [newProj, ...projects];
    setProjects(updated);
    if (onProjectsChange) onProjectsChange(updated);
    success(`Added project "${formTitle.trim()}"`, 'Project Created');
    setIsAddModalOpen(false);

    // Reset form
    setFormTitle('');
    setFormDesc('');
    setFormLiveUrl('');
    setFormGithubUrl('');
  };

  const handleDeleteProject = async (id: string, title: string) => {
    const updated = projects.filter((p) => p.id !== id);
    setProjects(updated);
    if (onProjectsChange) onProjectsChange(updated);
    await profileService.deleteProject(id);
    success(`Deleted project "${title}"`, 'Project Removed');
  };

  return (
    <div className="space-y-6">
      {/* ── Top Header & Filter ── */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Featured &amp; Personal Projects</h3>
          <p className="text-xs text-slate-500">
            Open-source software, full-stack applications and developer tools built by @{username || 'developer'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(['All', 'Featured', 'Next.js', 'AI'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeFilter === filter
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {filter}
            </button>
          ))}

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs ml-2 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Project</span>
          </button>
        </div>
      </div>

      {/* ── Projects Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            className="flex flex-col rounded-3xl border border-slate-200/90 bg-white overflow-hidden shadow-sm hover:border-emerald-300 hover:shadow-lg transition-all group"
          >
            {/* Project Preview Banner */}
            <div
              className={`h-40 bg-gradient-to-br ${project.previewBg} p-5 flex flex-col justify-between relative overflow-hidden`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-black/40 text-white backdrop-blur-md border border-white/10">
                    {project.level}
                  </span>
                  {project.featured && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/80 text-white backdrop-blur-md">
                      <Sparkles className="w-2.5 h-2.5" /> Featured
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-white/90 text-xs font-mono">
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{project.stars}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <GitFork className="w-3.5 h-3.5" />
                    <span>{project.forks}</span>
                  </span>
                </div>
              </div>

              <div className="z-10">
                <h4 className="text-lg font-bold text-white tracking-wide leading-tight group-hover:text-emerald-200 transition-colors">
                  {project.title}
                </h4>
              </div>
            </div>

            {/* Content Details */}
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {project.description}
                </p>

                {/* Tech Chips */}
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] font-semibold px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200/60"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedProject(project)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-emerald-700 transition-colors cursor-pointer"
                  >
                    <FolderGit2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Inspect Details</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteProject(project.id, project.title)}
                    className="p-1 text-slate-300 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                    title="Delete Project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
                      title="GitHub Repository"
                    >
                      <GithubIcon className="w-3.5 h-3.5" />
                    </a>
                  )}

                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-all border border-emerald-200/80"
                  >
                    <span>Preview</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Project Detail Modal ── */}
      <ProjectDetailModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />

      {/* ── Add Project Modal ── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">Add Project to Profile</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1 leading-none"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddProject} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Project Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CloudIDE — Collaborative Cloud Editor"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Summarize project capabilities, architecture, and value proposition..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-emerald-600 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Level</label>
                  <select
                    value={formLevel}
                    onChange={(e) => setFormLevel(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-emerald-600"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Banner Gradient</label>
                  <select
                    value={formBg}
                    onChange={(e) => setFormBg(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-emerald-600"
                  >
                    <option value="from-emerald-900 to-slate-900">Emerald Dark</option>
                    <option value="from-blue-900 to-indigo-950">Blue Indigo</option>
                    <option value="from-teal-900 to-slate-950">Teal Midnight</option>
                    <option value="from-purple-950 to-slate-900">Purple Velvet</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Technologies / Tags (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="Next.js 15, TypeScript, Tailwind, Docker"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Live Demo URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formLiveUrl}
                    onChange={(e) => setFormLiveUrl(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">GitHub Repo URL</label>
                  <input
                    type="url"
                    placeholder="https://github.com/..."
                    value={formGithubUrl}
                    onChange={(e) => setFormGithubUrl(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="featuredToggle"
                  checked={formFeatured}
                  onChange={(e) => setFormFeatured(e.target.checked)}
                  className="accent-emerald-600 rounded"
                />
                <label htmlFor="featuredToggle" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Pin as Featured Project
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-xs"
                >
                  Publish Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
