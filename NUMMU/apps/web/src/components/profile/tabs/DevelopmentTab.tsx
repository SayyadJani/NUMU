'use client';

import React, { useState } from 'react';
import {
  Layers,
  GitBranch,
  Star,
  GitPullRequest,
  Terminal,
  CheckCircle,
  Cpu,
  Database,
  Cloud,
  Code,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
} from 'lucide-react';
import type { DevSkill } from '@/types/profile';
import { profileService } from '@/services/profile-service';
import { useToast } from '@/components/ui/toast';

interface DevelopmentTabProps {
  skills: DevSkill[];
  onSkillsChange?: (skills: DevSkill[]) => void;
}

const LEVEL_BADGE: Record<string, string> = {
  Advanced: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Intermediate: 'bg-amber-50 text-amber-700 border-amber-200',
  Beginner: 'bg-slate-100 text-slate-600 border-slate-200',
};

export function DevelopmentTab({ skills: initialSkills, onSkillsChange }: DevelopmentTabProps) {
  const [skills, setSkills] = useState<DevSkill[]>(initialSkills);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<DevSkill | null>(null);
  const { success } = useToast();

  // Form state
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<DevSkill['category']>('Frontend');
  const [formLevel, setFormLevel] = useState<DevSkill['level']>('Intermediate');
  const [formPct, setFormPct] = useState(80);
  const [formIcon, setFormIcon] = useState('⚡');

  const categories = [
    { title: 'Frontend Development', icon: Code, key: 'Frontend' },
    { title: 'Backend & APIs', icon: Cpu, key: 'Backend' },
    { title: 'Databases & Storage', icon: Database, key: 'Database' },
    { title: 'DevOps, Cloud & Tools', icon: Cloud, key: 'Cloud & Tools' },
  ];

  const handleOpenAdd = () => {
    setEditingSkill(null);
    setFormName('');
    setFormCategory('Frontend');
    setFormLevel('Intermediate');
    setFormPct(80);
    setFormIcon('⚡');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (skill: DevSkill) => {
    setEditingSkill(skill);
    setFormName(skill.name);
    setFormCategory(skill.category);
    setFormLevel(skill.level);
    setFormPct(skill.pct);
    setFormIcon(skill.icon);
    setIsModalOpen(true);
  };

  const handleSaveSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    let updated: DevSkill[];
    if (editingSkill) {
      updated = skills.map((s) =>
        s.name === editingSkill.name
          ? {
              ...s,
              name: formName.trim(),
              category: formCategory,
              level: formLevel,
              pct: formPct,
              icon: formIcon,
            }
          : s
      );
      success(`Updated skill: ${formName.trim()}`, 'Skill Saved');
    } else {
      const newSkill: DevSkill = {
        name: formName.trim(),
        category: formCategory,
        level: formLevel,
        pct: formPct,
        icon: formIcon,
        color: 'text-emerald-600',
      };
      updated = [...skills, newSkill];
      success(`Added skill: ${formName.trim()}`, 'Skill Added');
    }

    setSkills(updated);
    if (onSkillsChange) onSkillsChange(updated);
    await profileService.saveDevSkills(updated);
    setIsModalOpen(false);
  };

  const handleDeleteSkill = async (name: string) => {
    const updated = skills.filter((s) => s.name !== name);
    setSkills(updated);
    if (onSkillsChange) onSkillsChange(updated);
    await profileService.saveDevSkills(updated);
    success(`Removed skill: ${name}`, 'Skill Removed');
  };

  const filteredCategories = categories.filter(
    (cat) => activeCategory === 'All' || cat.key === activeCategory
  );

  return (
    <div className="space-y-6">
      {/* ── GitHub Developer Footprint ── */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-[#072417] rounded-3xl p-6 sm:p-7 text-white border border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
              <Terminal className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Open Source &amp; Git Footprint</h3>
              <p className="text-xs text-slate-400">Verified development activity, public repos and contributions</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {skills.length} Technical Skills Verified
            </span>
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Skill</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <GitBranch className="w-3.5 h-3.5 text-emerald-400" />
              <span>Public Repos</span>
            </div>
            <div className="text-2xl font-black text-white">24</div>
            <div className="text-[10px] text-slate-400 mt-0.5">3 production apps</div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span>Total Commits</span>
            </div>
            <div className="text-2xl font-black text-white">640+</div>
            <div className="text-[10px] text-slate-400 mt-0.5">In the past 12 months</div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <GitPullRequest className="w-3.5 h-3.5 text-purple-400" />
              <span>PRs Merged</span>
            </div>
            <div className="text-2xl font-black text-white">38</div>
            <div className="text-[10px] text-slate-400 mt-0.5">14 in open-source orgs</div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <Star className="w-3.5 h-3.5 text-amber-400" />
              <span>Stars Earned</span>
            </div>
            <div className="text-2xl font-black text-white">73</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Across all repositories</div>
          </div>
        </div>
      </div>

      {/* ── Category Filter Bar ── */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900">Verified Technical Competencies</h4>
          <p className="text-xs text-slate-500">Filter skills by software domain or add custom proficiencies</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {['All', 'Frontend', 'Backend', 'Database', 'Cloud & Tools'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeCategory === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Grouped Skill Categories ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCategories.map((cat) => {
          const CategoryIcon = cat.icon;
          const catSkills = skills.filter((s) => s.category === cat.key);

          return (
            <div
              key={cat.key}
              className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                      <CategoryIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{cat.title}</h4>
                      <p className="text-[11px] text-slate-400">{catSkills.length} skills verified</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3.5">
                  {catSkills.length > 0 ? (
                    catSkills.map((skill) => (
                      <div
                        key={skill.name}
                        className="p-3 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 transition-all group"
                      >
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-base shrink-0">{skill.icon}</span>
                            <span className="font-bold text-slate-800 truncate">{skill.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                                LEVEL_BADGE[skill.level]
                              }`}
                            >
                              {skill.level}
                            </span>
                            <span className="font-mono text-slate-500 text-[11px] font-bold">
                              {skill.pct}%
                            </span>

                            {/* Actions on hover */}
                            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                              <button
                                onClick={() => handleOpenEdit(skill)}
                                className="p-1 hover:text-emerald-700 text-slate-400 transition-colors"
                                title="Edit Skill"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteSkill(skill.name)}
                                className="p-1 hover:text-rose-600 text-slate-400 transition-colors"
                                title="Delete Skill"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="h-1.5 w-full bg-slate-200/80 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                            style={{ width: `${skill.pct}%` }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-center text-slate-400 text-xs">
                      No skills added in this category yet.
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => {
                  setEditingSkill(null);
                  setFormName('');
                  setFormCategory(cat.key as any);
                  setFormLevel('Intermediate');
                  setFormPct(80);
                  setFormIcon('⚡');
                  setIsModalOpen(true);
                }}
                className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add {cat.key} Skill</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* ── Engineering Practices & Standards ── */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm">
        <h4 className="text-base font-bold text-slate-900 mb-1">
          Engineering Practices &amp; Best Standards
        </h4>
        <p className="text-xs text-slate-500 mb-4">
          Core methodologies applied in real production software development
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              title: 'Clean Architecture',
              desc: 'Modular decoupled service layers, domain entities & DI patterns.',
            },
            {
              title: 'REST & OpenAPI 3.0',
              desc: 'Strict OpenAPI schemas, validation, rate limiting & error handling.',
            },
            {
              title: 'CI/CD Automation',
              desc: 'Automated GitHub Actions with linting, testing & zero-downtime deploys.',
            },
            {
              title: 'Database Optimization',
              desc: 'Relational indexes, connection pooling, and Prisma migrations.',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="p-3.5 sm:p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-emerald-200 transition-all"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{item.title}</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Add / Edit Skill Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingSkill ? 'Edit Skill Proficiency' : 'Add Technical Skill'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1 leading-none"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSkill} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Skill Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Next.js, Docker, Go, Redis"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-emerald-600"
                  >
                    <option value="Frontend">Frontend</option>
                    <option value="Backend">Backend</option>
                    <option value="Database">Database</option>
                    <option value="Cloud & Tools">Cloud &amp; Tools</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mastery Level</label>
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
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Proficiency ({formPct}%)</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={formPct}
                  onChange={(e) => setFormPct(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Icon / Emoji</label>
                <div className="flex items-center gap-2">
                  {['⚛️', '▲', 'TS', 'JS', '🟢', '🐘', '🐳', '⚡', '💎', '🎨'].map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setFormIcon(ic)}
                      className={`w-8 h-8 rounded-lg border text-sm flex items-center justify-center transition-all ${
                        formIcon === ic
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-700 font-bold'
                          : 'border-slate-200 bg-slate-50 hover:bg-white'
                      }`}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-xs"
                >
                  {editingSkill ? 'Save Changes' : 'Add Skill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
