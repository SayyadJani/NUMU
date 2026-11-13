'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Laptop,
  FolderGit2,
  Layers,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  Star,
  CheckCircle2,
  Sparkles,
  GitBranch,
  Server,
  Database,
  Cloud,
  ChevronRight,
} from 'lucide-react';
import { adminApi, type ContentStatus, type Difficulty } from '@/lib/api';
import {
  PageHeader,
  StatCard,
  Button,
  Modal,
  ConfirmModal,
  FormField,
  Input,
  Textarea,
  StatusBadge,
} from '@/components/ui/primitives';

export function DevelopmentPanel({
  onNotify,
}: {
  onNotify: (msg: string, type?: 'success' | 'error') => void;
}) {
  const [activeTab, setActiveTab] = useState<'projects' | 'tracks'>('projects');
  const [loading, setLoading] = useState(true);

  const [tracks, setTracks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);

  // Project Modal State
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [savingProject, setSavingProject] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projectTitle, setProjectTitle] = useState('');
  const [projectSlug, setProjectSlug] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [projectTrackId, setProjectTrackId] = useState('');
  const [projectStage, setProjectStage] = useState('planning');
  const [projectSprints, setProjectSprints] = useState(5);
  const [projectTechStack, setProjectTechStack] = useState('Next.js, TypeScript, PostgreSQL, Prisma');
  const [projectRepoUrl, setProjectRepoUrl] = useState('');
  const [projectDemoUrl, setProjectDemoUrl] = useState('');
  const [projectXp, setProjectXp] = useState(400);
  const [milestonesText, setMilestonesText] = useState('Setup schema\nAuth implementation\nFeature build\nTesting & review\nDeployment');

  // Track Modal State
  const [trackModalOpen, setTrackModalOpen] = useState(false);
  const [savingTrack, setSavingTrack] = useState(false);
  const [trackTitle, setTrackTitle] = useState('');
  const [trackSlug, setTrackSlug] = useState('');
  const [trackDesc, setTrackDesc] = useState('');
  const [trackIcon, setTrackIcon] = useState('Monitor');
  const [trackColor, setTrackColor] = useState('emerald');
  const [trackOrder, setTrackOrder] = useState(1);

  // Delete Target
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'project' | 'track'; item: any } | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [tRes, pRes] = await Promise.allSettled([
        adminApi.getDevTracks(),
        adminApi.getDevProjects(),
      ]);

      if (tRes.status === 'fulfilled') {
        const tList = tRes.value || [];
        setTracks(tList);
        if (tList.length > 0 && !projectTrackId) {
          setProjectTrackId(tList[0].id);
        }
      }
      if (pRes.status === 'fulfilled') setProjects(pRes.value || []);
    } catch (err: any) {
      onNotify(err.message || 'Failed to load development track data', 'error');
    } finally {
      setLoading(false);
    }
  }, [onNotify, projectTrackId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // ── Project Handlers ──

  const handleOpenNewProject = () => {
    setEditingProjectId(null);
    setProjectTitle('');
    setProjectSlug('');
    setProjectDesc('');
    setProjectStage('planning');
    setProjectSprints(5);
    setProjectTechStack('Next.js, TypeScript, PostgreSQL, Tailwind');
    setProjectRepoUrl('');
    setProjectDemoUrl('');
    setProjectXp(400);
    setMilestonesText('Setup database & schema\nImplement JWT auth\nBuild primary feature UI\nAdd unit & integration tests\nDeploy to production');
    setProjectModalOpen(true);
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectTitle || !projectSlug) return;
    try {
      setSavingProject(true);
      const techArray = projectTechStack.split(',').map((t) => t.trim()).filter(Boolean);
      const milestoneList = milestonesText.split('\n').map((m) => m.trim()).filter(Boolean);

      if (editingProjectId) {
        await adminApi.updateDevProject(editingProjectId, {
          title: projectTitle,
          description: projectDesc,
          trackId: projectTrackId || undefined,
          stage: projectStage,
          totalSprints: Number(projectSprints),
          techStack: techArray,
          starterRepoUrl: projectRepoUrl || undefined,
          demoUrl: projectDemoUrl || undefined,
          xpReward: Number(projectXp),
        });
        onNotify('Capstone project updated successfully!');
      } else {
        await adminApi.createDevProject({
          title: projectTitle,
          slug: projectSlug,
          description: projectDesc,
          trackId: projectTrackId || undefined,
          stage: projectStage,
          totalSprints: Number(projectSprints),
          techStack: techArray,
          starterRepoUrl: projectRepoUrl || undefined,
          demoUrl: projectDemoUrl || undefined,
          xpReward: Number(projectXp),
          milestones: milestoneList,
        });
        onNotify('New capstone project created successfully!');
      }
      setProjectModalOpen(false);
      void loadData();
    } catch (err: any) {
      onNotify(err.message || 'Failed to save project', 'error');
    } finally {
      setSavingProject(false);
    }
  };

  const handleSaveTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackTitle || !trackSlug) return;
    try {
      setSavingTrack(true);
      await adminApi.createDevTrack({
        title: trackTitle,
        slug: trackSlug,
        description: trackDesc,
        icon: trackIcon,
        colorTone: trackColor,
        order: Number(trackOrder),
      });
      onNotify('Development track created successfully!');
      setTrackModalOpen(false);
      void loadData();
    } catch (err: any) {
      onNotify(err.message || 'Failed to create track', 'error');
    } finally {
      setSavingTrack(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === 'project') {
        await adminApi.deleteDevProject(deleteTarget.item.id);
        onNotify('Capstone project deleted');
      } else {
        await adminApi.deleteDevTrack(deleteTarget.item.id);
        onNotify('Development track deleted');
      }
      setDeleteTarget(null);
      void loadData();
    } catch (err: any) {
      onNotify(err.message || 'Failed to delete', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Full-Stack Development Track Management"
        subtitle="Manage official portfolio capstones, tech roadmaps (Frontend, Backend, DevOps, DB), and milestones for /dashboard/development."
        actions={
          activeTab === 'projects' ? (
            <Button icon={Plus} onClick={handleOpenNewProject}>
              Create Capstone Project
            </Button>
          ) : (
            <Button icon={Plus} onClick={() => setTrackModalOpen(true)}>
              Add Tech Track
            </Button>
          )
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={FolderGit2}
          label="Capstone Projects"
          value={projects.length}
          sublabel="Active in student development hub"
        />
        <StatCard
          icon={Layers}
          label="Curriculum Tracks"
          value={tracks.length}
          sublabel="Frontend, Backend, DB, Cloud..."
        />
        <StatCard
          icon={Sparkles}
          label="Total Learning Milestones"
          value={projects.reduce((acc, p) => acc + (p.milestones?.length || 0), 0)}
          sublabel="Granular PR deliverables"
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('projects')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'projects'
              ? 'bg-[#0b5c39] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FolderGit2 className="w-3.5 h-3.5" />
          <span>Capstone Projects ({projects.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('tracks')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'tracks'
              ? 'bg-[#0b5c39] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Curriculum Tracks ({tracks.length})</span>
        </button>
      </div>

      {/* ── Tab 1: Capstone Projects List ── */}
      {activeTab === 'projects' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.length === 0 ? (
            <div className="col-span-2 p-12 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
              No capstone projects created yet. Click "Create Capstone Project" to add one.
            </div>
          ) : (
            projects.map((proj) => (
              <div
                key={proj.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 flex flex-col justify-between hover:border-slate-300 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                        {proj.track?.title || 'Fullstack'}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-1.5">{proj.title}</h4>
                    </div>
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full shrink-0">
                      +{proj.xpReward} XP
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
                    {proj.description}
                  </p>

                  {/* Tech stack badges */}
                  <div className="flex items-center gap-1.5 flex-wrap mb-4">
                    {proj.techStack?.map((t: string) => (
                      <span
                        key={t}
                        className="text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* Milestones list */}
                  <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-3 mb-4 space-y-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Sprint Deliverables ({proj.milestones?.length || 0})
                    </div>
                    {proj.milestones?.slice(0, 3).map((m: any, idx: number) => (
                      <div key={m.id} className="flex items-center gap-1.5 text-xs text-slate-700 truncate">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        <span className="truncate">{m.title}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                  <span className="text-[11px] text-slate-400 font-mono">
                    Total Sprints: {proj.totalSprints}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setEditingProjectId(proj.id);
                        setProjectTitle(proj.title);
                        setProjectSlug(proj.slug);
                        setProjectDesc(proj.description);
                        setProjectTrackId(proj.trackId || '');
                        setProjectStage(proj.stage);
                        setProjectSprints(proj.totalSprints);
                        setProjectTechStack(proj.techStack?.join(', ') || '');
                        setProjectRepoUrl(proj.starterRepoUrl || '');
                        setProjectDemoUrl(proj.demoUrl || '');
                        setProjectXp(proj.xpReward);
                        setMilestonesText(proj.milestones?.map((m: any) => m.title).join('\n') || '');
                        setProjectModalOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      icon={Trash2}
                      onClick={() => setDeleteTarget({ type: 'project', item: proj })}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Tab 2: Curriculum Tracks List ── */}
      {activeTab === 'tracks' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs divide-y divide-slate-100 overflow-hidden">
          {tracks.map((track) => (
            <div key={track.id} className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-700 shrink-0">
                  <Laptop className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-slate-900">{track.title}</h4>
                    <span className="text-[10px] font-mono text-slate-400">/{track.slug}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{track.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500">
                  {track.projects?.length || 0} projects • {track.modules?.length || 0} modules
                </span>
                <Button
                  size="sm"
                  variant="danger"
                  icon={Trash2}
                  onClick={() => setDeleteTarget({ type: 'track', item: track })}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Modal: Create / Edit Capstone Project ── */}
      <Modal
        open={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
        title={editingProjectId ? 'Edit Capstone Project' : 'Create Capstone Project'}
        subtitle="Configure the fullstack project requirements, deliverables, and student XP reward"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveProject} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Project Title" required>
              <Input
                value={projectTitle}
                onChange={(e) => {
                  setProjectTitle(e.target.value);
                  if (!editingProjectId) {
                    setProjectSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                  }
                }}
                placeholder="Fullstack AI Code Reviewer SaaS"
                required
              />
            </FormField>

            <FormField label="URL Slug" required>
              <Input
                value={projectSlug}
                onChange={(e) => setProjectSlug(e.target.value)}
                placeholder="fullstack-ai-code-reviewer"
                required
              />
            </FormField>
          </div>

          <FormField label="Associated Curriculum Track" required>
            <select
              value={projectTrackId}
              onChange={(e) => setProjectTrackId(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:border-[#0b5c39]"
              required
            >
              {tracks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Description & Overview" required>
            <Textarea
              value={projectDesc}
              onChange={(e) => setProjectDesc(e.target.value)}
              rows={3}
              placeholder="Production-grade application architecture details..."
              required
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Tech Stack (comma separated)">
              <Input
                value={projectTechStack}
                onChange={(e) => setProjectTechStack(e.target.value)}
                placeholder="Next.js 15, TypeScript, PostgreSQL, Prisma, Docker"
              />
            </FormField>

            <FormField label="Completion XP Reward">
              <Input
                type="number"
                value={projectXp}
                onChange={(e) => setProjectXp(Number(e.target.value))}
                placeholder="500"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Starter GitHub Template URL">
              <Input
                value={projectRepoUrl}
                onChange={(e) => setProjectRepoUrl(e.target.value)}
                placeholder="https://github.com/numu-org/starter-repo"
              />
            </FormField>

            <FormField label="Live Demo URL">
              <Input
                value={projectDemoUrl}
                onChange={(e) => setProjectDemoUrl(e.target.value)}
                placeholder="https://demo.vercel.app"
              />
            </FormField>
          </div>

          {!editingProjectId && (
            <FormField label="Sprint Deliverable Milestones (one per line)">
              <Textarea
                value={milestonesText}
                onChange={(e) => setMilestonesText(e.target.value)}
                rows={4}
                placeholder="Setup database & schema&#10;Implement JWT auth&#10;Deploy to production"
              />
            </FormField>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setProjectModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={savingProject}>
              {editingProjectId ? 'Update Project' : 'Create Project'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Modal: Add Track ── */}
      <Modal
        open={trackModalOpen}
        onClose={() => setTrackModalOpen(false)}
        title="Add Development Curriculum Track"
        subtitle="Create a new specialization track for students"
      >
        <form onSubmit={handleSaveTrack} className="space-y-4">
          <FormField label="Track Title" required>
            <Input
              value={trackTitle}
              onChange={(e) => {
                setTrackTitle(e.target.value);
                setTrackSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
              }}
              placeholder="Mobile & Cross-Platform Engineering"
              required
            />
          </FormField>

          <FormField label="Slug" required>
            <Input
              value={trackSlug}
              onChange={(e) => setTrackSlug(e.target.value)}
              placeholder="mobile-engineering"
              required
            />
          </FormField>

          <FormField label="Description">
            <Textarea
              value={trackDesc}
              onChange={(e) => setTrackDesc(e.target.value)}
              rows={2}
              placeholder="React Native, Expo, offline storage and native bridging..."
            />
          </FormField>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setTrackModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={savingTrack}>
              Create Track
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <ConfirmModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={`Delete ${deleteTarget?.type === 'project' ? 'Capstone Project' : 'Track'}?`}
        description={`Are you sure you want to permanently delete "${deleteTarget?.item?.title}"?`}
      />
    </div>
  );
}
