'use client';

import React from 'react';
import { FolderGit2, Plus, ExternalLink, Star, GitFork, Sparkles } from 'lucide-react';
import { GithubIcon } from '@/components/ui/icons';
import type { Project } from '@/types/profile';

interface ProfileFeaturedProjectsCardProps {
  projects: Project[];
  isOwnProfile?: boolean;
  onAddProject?: () => void;
  onViewAll?: () => void;
}

export function ProfileFeaturedProjectsCard({
  projects,
  isOwnProfile = true,
  onAddProject,
  onViewAll,
}: ProfileFeaturedProjectsCardProps) {
  const hasProjects = projects && projects.length > 0;
  const displayProjects = projects.slice(0, 3);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-[11px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500">
          Featured Projects
        </h2>
        <div className="flex items-center gap-3">
          {hasProjects && onViewAll && (
            <button
              onClick={onViewAll}
              className="text-xs font-semibold text-slate-400 hover:text-white dark:hover:text-emerald-400 cursor-pointer transition-colors"
            >
              View all ({projects.length})
            </button>
          )}
          {isOwnProfile && onAddProject && (
            <button
              onClick={onAddProject}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Plus className="w-3 h-3" />
              <span>Add</span>
            </button>
          )}
        </div>
      </div>

      <div className="rounded-2xl bg-[#111827] dark:bg-[#0c1f17] border border-slate-800 dark:border-emerald-950/60 p-5 sm:p-6 shadow-xs transition-colors">
        {hasProjects ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayProjects.map((project) => (
              <div
                key={project.id}
                className="group p-4 rounded-xl bg-slate-900/60 dark:bg-[#082218] border border-slate-800 dark:border-emerald-900/40 hover:border-slate-700 dark:hover:border-emerald-700/60 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors truncate">
                      {project.title}
                    </h3>
                    <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                      {project.level}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                    {project.description}
                  </p>
                </div>

                <div>
                  {/* Tech Stack Chips */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {project.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/80 dark:bg-[#061811] text-slate-300 dark:text-emerald-300 border border-slate-700/60 dark:border-emerald-950"
                      >
                        {tag}
                      </span>
                    ))}
                    {project.tags.length > 3 && (
                      <span className="text-[10px] text-slate-500">
                        +{project.tags.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Links & Metrics */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 dark:border-emerald-950/50 text-xs text-slate-400">
                    <div className="flex items-center gap-3">
                      {project.stars > 0 && (
                        <span className="flex items-center gap-1 text-[11px]">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          {project.stars}
                        </span>
                      )}
                      {project.forks > 0 && (
                        <span className="flex items-center gap-1 text-[11px]">
                          <GitFork className="w-3 h-3 text-slate-400" />
                          {project.forks}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded-md hover:bg-slate-800 dark:hover:bg-[#0c2f21] hover:text-white transition-colors"
                          title="View Source on GitHub"
                        >
                          <GithubIcon className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded-md hover:bg-slate-800 dark:hover:bg-[#0c2f21] hover:text-white transition-colors"
                          title="View Live App"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty state matching takeUforward screenshot exactly */
          <div className="border border-dashed border-slate-700/60 dark:border-emerald-900/40 rounded-xl p-8 sm:p-10 text-center bg-slate-900/30 dark:bg-[#082218]/30">
            <div className="w-9 h-9 rounded-full bg-slate-800/80 dark:bg-[#0a271c] border border-slate-700 dark:border-emerald-800/40 flex items-center justify-center mx-auto mb-2.5 text-slate-400">
              <FolderGit2 className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">No projects added yet</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Showcase your full-stack applications, open source contributions or dev tools
            </p>
            {isOwnProfile && onAddProject && (
              <button
                onClick={onAddProject}
                className="mt-3.5 inline-flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300 dark:text-emerald-400 dark:hover:text-emerald-300 cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add project</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
