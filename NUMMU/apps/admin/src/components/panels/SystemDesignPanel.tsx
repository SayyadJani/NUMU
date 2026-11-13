'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Cpu,
  Layers,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  BookOpen,
  Network,
  Clock,
  ChevronDown,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { adminApi, type Difficulty } from '@/lib/api';
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

export function SystemDesignPanel({
  onNotify,
}: {
  onNotify: (msg: string, type?: 'success' | 'error') => void;
}) {
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Topic Modal
  const [topicModalOpen, setTopicModalOpen] = useState(false);
  const [savingTopic, setSavingTopic] = useState(false);
  const [topicTitle, setTopicTitle] = useState('');
  const [topicSlug, setTopicSlug] = useState('');
  const [topicCategory, setTopicCategory] = useState<'FUNDAMENTALS' | 'HLD' | 'LLD' | 'CASE_STUDIES'>('FUNDAMENTALS');
  const [topicDesc, setTopicDesc] = useState('');

  // Scenario Modal
  const [scenarioModalOpen, setScenarioModalOpen] = useState(false);
  const [savingScenario, setSavingScenario] = useState(false);
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [scenarioTitle, setScenarioTitle] = useState('');
  const [scenarioDifficulty, setScenarioDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
  const [scenarioDuration, setScenarioDuration] = useState('30 min');
  const [scenarioArchitectureUrl, setScenarioArchitectureUrl] = useState('');

  // Delete Target
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'topic' | 'scenario'; item: any } | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminApi.getSystemDesignTopics();
      setTopics(Array.isArray(data) ? data : []);
      if (Array.isArray(data) && data.length > 0 && !selectedTopicId) {
        setSelectedTopicId(data[0].id);
      }
    } catch (err: any) {
      onNotify(err.message || 'Failed to load System Design topics', 'error');
    } finally {
      setLoading(false);
    }
  }, [onNotify, selectedTopicId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // ── Handlers ──

  const handleSaveTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicTitle || !topicSlug) return;
    try {
      setSavingTopic(true);
      await adminApi.createSystemDesignTopic({
        title: topicTitle,
        slug: topicSlug,
        category: topicCategory,
        description: topicDesc,
        order: topics.length + 1,
      });
      onNotify('System design topic created successfully!');
      setTopicModalOpen(false);
      setTopicTitle('');
      setTopicSlug('');
      setTopicDesc('');
      void loadData();
    } catch (err: any) {
      onNotify(err.message || 'Failed to create topic', 'error');
    } finally {
      setSavingTopic(false);
    }
  };

  const handleSaveScenario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scenarioTitle || !selectedTopicId) return;
    try {
      setSavingScenario(true);
      await adminApi.createSystemDesignQuestion({
        topicId: selectedTopicId,
        title: scenarioTitle,
        difficulty: scenarioDifficulty as Difficulty,
        duration: scenarioDuration,
        architectureUrl: scenarioArchitectureUrl || undefined,
      });
      onNotify('Architectural scenario added to topic!');
      setScenarioModalOpen(false);
      setScenarioTitle('');
      setScenarioArchitectureUrl('');
      void loadData();
    } catch (err: any) {
      onNotify(err.message || 'Failed to add scenario', 'error');
    } finally {
      setSavingScenario(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === 'topic') {
        await adminApi.deleteSystemDesignTopic(deleteTarget.item.id);
        onNotify('Topic deleted');
      } else {
        await adminApi.deleteSystemDesignQuestion(deleteTarget.item.id);
        onNotify('Scenario question deleted');
      }
      setDeleteTarget(null);
      void loadData();
    } catch (err: any) {
      onNotify(err.message || 'Failed to delete', 'error');
    }
  };

  const filteredTopics = categoryFilter === 'ALL'
    ? topics
    : topics.filter((t) => t.category === categoryFilter);

  const totalQuestions = topics.reduce((acc, t) => acc + (t.questions?.length || 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Design (HLD & LLD) Curriculum Studio"
        subtitle="Manage distributed system architectures, Low-Level Design (SOLID/GoF), and real-world case studies for /dashboard/system-design."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              icon={Plus}
              onClick={() => {
                if (topics.length > 0) setSelectedTopicId(topics[0].id);
                setScenarioModalOpen(true);
              }}
            >
              Add Scenario
            </Button>
            <Button icon={Plus} onClick={() => setTopicModalOpen(true)}>
              New Topic
            </Button>
          </div>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={Cpu}
          label="System Design Syllabi Topics"
          value={topics.length}
          sublabel="Fundamentals, HLD, LLD & Case Studies"
        />
        <StatCard
          icon={Network}
          label="Architectural Scenarios"
          value={totalQuestions}
          sublabel="Interactive design challenges"
        />
        <StatCard
          icon={BookOpen}
          label="Case Studies Published"
          value={topics.filter((t) => t.category === 'CASE_STUDIES').length}
          sublabel="TinyURL, Chat, Code Engine..."
        />
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {['ALL', 'FUNDAMENTALS', 'HLD', 'LLD', 'CASE_STUDIES'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              categoryFilter === cat
                ? 'bg-[#0b5c39] text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Topics Accordion List */}
      <div className="space-y-4">
        {filteredTopics.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
            No system design topics found under this category. Click "New Topic" to create one.
          </div>
        ) : (
          filteredTopics.map((topic) => (
            <div
              key={topic.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden"
            >
              {/* Topic Header Bar */}
              <div className="p-4 sm:p-5 flex items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center font-bold text-xs shrink-0">
                    <Cpu className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">{topic.title}</h4>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                        {topic.category.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                      {topic.description || 'No description provided.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                    {topic.questions?.length || 0} scenarios
                  </span>
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={Plus}
                    onClick={() => {
                      setSelectedTopicId(topic.id);
                      setScenarioModalOpen(true);
                    }}
                  >
                    Add Scenario
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    icon={Trash2}
                    onClick={() => setDeleteTarget({ type: 'topic', item: topic })}
                  />
                </div>
              </div>

              {/* Scenarios List */}
              <div className="divide-y divide-slate-100 p-2 sm:p-4 space-y-1">
                {topic.questions?.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No scenarios added to this topic yet. Click "Add Scenario" above.
                  </div>
                ) : (
                  topic.questions?.map((q: any, idx: number) => (
                    <div
                      key={q.id}
                      className="p-3 rounded-xl flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-xs font-mono font-bold text-slate-400 w-5">
                          {idx + 1}.
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {q.title}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                q.difficulty === 'EASY'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : q.difficulty === 'MEDIUM'
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-rose-50 text-rose-700'
                              }`}
                            >
                              {q.difficulty}
                            </span>
                            <span className="text-[10px] text-slate-500 flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5 text-slate-400" />
                              {q.duration || '25 min'}
                            </span>
                          </div>
                          {q.architectureUrl && (
                            <a
                              href={q.architectureUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] text-purple-700 hover:underline mt-0.5"
                            >
                              <ExternalLink className="w-2.5 h-2.5" /> Reference Diagram
                            </a>
                          )}
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="danger"
                        icon={Trash2}
                        onClick={() => setDeleteTarget({ type: 'scenario', item: q })}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Modal: Create Topic ── */}
      <Modal
        open={topicModalOpen}
        onClose={() => setTopicModalOpen(false)}
        title="Create System Design Topic"
        subtitle="Add a new syllabus section (Fundamentals, HLD, LLD, or Case Study)"
      >
        <form onSubmit={handleSaveTopic} className="space-y-4">
          <FormField label="Topic Title" required>
            <Input
              value={topicTitle}
              onChange={(e) => {
                setTopicTitle(e.target.value);
                setTopicSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
              }}
              placeholder="e.g. Distributed Consensus & Raft/Paxos"
              required
            />
          </FormField>

          <FormField label="URL Slug" required>
            <Input
              value={topicSlug}
              onChange={(e) => setTopicSlug(e.target.value)}
              placeholder="distributed-consensus"
              required
            />
          </FormField>

          <FormField label="Category" required>
            <select
              value={topicCategory}
              onChange={(e) => setTopicCategory(e.target.value as any)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:border-[#0b5c39]"
              required
            >
              <option value="FUNDAMENTALS">Fundamentals</option>
              <option value="HLD">High-Level Design (HLD)</option>
              <option value="LLD">Low-Level Design (LLD)</option>
              <option value="CASE_STUDIES">Real-World Case Studies</option>
            </select>
          </FormField>

          <FormField label="Description">
            <Textarea
              value={topicDesc}
              onChange={(e) => setTopicDesc(e.target.value)}
              rows={2}
              placeholder="Leader election, split-brain resolution, quorum writes..."
            />
          </FormField>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setTopicModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={savingTopic}>
              Create Topic
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Modal: Add Scenario Question ── */}
      <Modal
        open={scenarioModalOpen}
        onClose={() => setScenarioModalOpen(false)}
        title="Add System Design Scenario"
        subtitle="Add an architectural problem or case study scenario to this topic"
      >
        <form onSubmit={handleSaveScenario} className="space-y-4">
          <FormField label="Target Topic" required>
            <select
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:border-[#0b5c39]"
              required
            >
              {topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Scenario / Question Title" required>
            <Input
              value={scenarioTitle}
              onChange={(e) => setScenarioTitle(e.target.value)}
              placeholder="e.g. Design Twitter / X Timeline with Fan-Out on Write"
              required
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Difficulty">
              <select
                value={scenarioDifficulty}
                onChange={(e) => setScenarioDifficulty(e.target.value as any)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:border-[#0b5c39]"
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </FormField>

            <FormField label="Estimated Duration">
              <Input
                value={scenarioDuration}
                onChange={(e) => setScenarioDuration(e.target.value)}
                placeholder="30 min"
              />
            </FormField>
          </div>

          <FormField label="Reference Architecture / Diagram URL">
            <Input
              value={scenarioArchitectureUrl}
              onChange={(e) => setScenarioArchitectureUrl(e.target.value)}
              placeholder="https://excalidraw.com/... or image link"
            />
          </FormField>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setScenarioModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={savingScenario}>
              Add Scenario
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={`Delete ${deleteTarget?.type === 'topic' ? 'System Design Topic' : 'Scenario'}?`}
        description={`Are you sure you want to permanently delete "${deleteTarget?.item?.title}"?`}
      />
    </div>
  );
}
