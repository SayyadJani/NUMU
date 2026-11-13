'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Database,
  Cpu,
  Network,
  Code2,
  Plus,
  Trash2,
  Edit3,
  BookOpen,
  HelpCircle,
  ChevronRight,
  Layers,
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

export function CoreCsPanel({
  onNotify,
}: {
  onNotify: (msg: string, type?: 'success' | 'error') => void;
}) {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubjectId, setActiveSubjectId] = useState<string>('');

  // Question Modal State
  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [savingQuestion, setSavingQuestion] = useState(false);
  const [targetTopicId, setTargetTopicId] = useState('');
  const [questionTitle, setQuestionTitle] = useState('');
  const [questionDiff, setQuestionDiff] = useState<'EASY' | 'MEDIUM' | 'HARD'>('EASY');
  const [questionExplanation, setQuestionExplanation] = useState('');

  // Topic Modal State
  const [topicModalOpen, setTopicModalOpen] = useState(false);
  const [savingTopic, setSavingTopic] = useState(false);
  const [topicTitle, setTopicTitle] = useState('');
  const [topicSlug, setTopicSlug] = useState('');

  // Delete Target
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'topic' | 'question'; item: any } | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminApi.getCoreSubjects();
      setSubjects(Array.isArray(data) ? data : []);
      if (Array.isArray(data) && data.length > 0 && !activeSubjectId) {
        setActiveSubjectId(data[0].id);
      }
    } catch (err: any) {
      onNotify(err.message || 'Failed to load Core CS data', 'error');
    } finally {
      setLoading(false);
    }
  }, [onNotify, activeSubjectId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Active Subject
  const activeSubject = subjects.find((s) => s.id === activeSubjectId) || subjects[0];

  // ── Handlers ──

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionTitle || !targetTopicId) return;
    try {
      setSavingQuestion(true);
      await adminApi.createCoreQuestion({
        topicId: targetTopicId,
        title: questionTitle,
        difficulty: questionDiff as Difficulty,
        explanation: questionExplanation || undefined,
      });
      onNotify('Core CS interview question added successfully!');
      setQuestionModalOpen(false);
      setQuestionTitle('');
      setQuestionExplanation('');
      void loadData();
    } catch (err: any) {
      onNotify(err.message || 'Failed to create question', 'error');
    } finally {
      setSavingQuestion(false);
    }
  };

  const handleSaveTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicTitle || !topicSlug || !activeSubject) return;
    try {
      setSavingTopic(true);
      await adminApi.createCoreTopic({
        subjectId: activeSubject.id,
        title: topicTitle,
        slug: topicSlug,
        order: (activeSubject.topics?.length || 0) + 1,
      });
      onNotify('Syllabus topic added to subject!');
      setTopicModalOpen(false);
      setTopicTitle('');
      setTopicSlug('');
      void loadData();
    } catch (err: any) {
      onNotify(err.message || 'Failed to create topic', 'error');
    } finally {
      setSavingTopic(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === 'topic') {
        await adminApi.deleteCoreTopic(deleteTarget.item.id);
        onNotify('Topic deleted');
      } else {
        await adminApi.deleteCoreQuestion(deleteTarget.item.id);
        onNotify('Question deleted');
      }
      setDeleteTarget(null);
      void loadData();
    } catch (err: any) {
      onNotify(err.message || 'Failed to delete', 'error');
    }
  };

  const totalQuestions = subjects.reduce(
    (acc, s) =>
      acc + (s.topics?.reduce((tAcc: number, t: any) => tAcc + (t.questions?.length || 0), 0) || 0),
    0,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Core CS (DBMS, OS, CN, OOPs) Knowledge Bank"
        subtitle="Manage fundamental subject syllabi and interview questions for /dashboard/core."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              icon={Plus}
              onClick={() => {
                if (activeSubject?.topics?.length > 0) {
                  setTargetTopicId(activeSubject.topics[0].id);
                }
                setQuestionModalOpen(true);
              }}
            >
              Add Question
            </Button>
            <Button icon={Plus} onClick={() => setTopicModalOpen(true)}>
              Add Topic
            </Button>
          </div>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={Database}
          label="Core Subjects"
          value={subjects.length}
          sublabel="DBMS, OS, CN & OOPs"
        />
        <StatCard
          icon={Layers}
          label="Total Syllabi Topics"
          value={subjects.reduce((acc, s) => acc + (s.topics?.length || 0), 0)}
          sublabel="Structured topic outlines"
        />
        <StatCard
          icon={HelpCircle}
          label="Interview Questions Bank"
          value={totalQuestions}
          sublabel="Core interview prep items"
        />
      </div>

      {/* Subject Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
        {subjects.map((sub) => {
          const isActive = sub.id === activeSubjectId;
          return (
            <button
              key={sub.id}
              onClick={() => setActiveSubjectId(sub.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[#0b5c39] text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {sub.type === 'DBMS' && <Database className="w-3.5 h-3.5" />}
              {sub.type === 'OS' && <Cpu className="w-3.5 h-3.5" />}
              {sub.type === 'CN' && <Network className="w-3.5 h-3.5" />}
              {sub.type === 'OOPS' && <Code2 className="w-3.5 h-3.5" />}
              <span>{sub.title}</span>
            </button>
          );
        })}
      </div>

      {/* Active Subject Content Area */}
      {activeSubject && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">{activeSubject.title}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{activeSubject.description}</p>
            </div>
            <Button size="sm" icon={Plus} onClick={() => setTopicModalOpen(true)}>
              Add Topic to {activeSubject.type}
            </Button>
          </div>

          {/* Topics and Questions */}
          <div className="space-y-4">
            {activeSubject.topics?.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
                No syllabus topics added yet for this subject. Click "Add Topic" to create one.
              </div>
            ) : (
              activeSubject.topics?.map((topic: any) => (
                <div
                  key={topic.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden"
                >
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-emerald-700" />
                      <h4 className="text-xs font-bold text-slate-900">{topic.title}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">
                        ({topic.questions?.length || 0} questions)
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={Plus}
                        onClick={() => {
                          setTargetTopicId(topic.id);
                          setQuestionModalOpen(true);
                        }}
                      >
                        Add Question
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        icon={Trash2}
                        onClick={() => setDeleteTarget({ type: 'topic', item: topic })}
                      />
                    </div>
                  </div>

                  <div className="divide-y divide-slate-100 p-2 sm:p-3">
                    {topic.questions?.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400">
                        No questions in this topic yet.
                      </div>
                    ) : (
                      topic.questions?.map((q: any, idx: number) => (
                        <div
                          key={q.id}
                          className="p-3 flex items-center justify-between gap-3 hover:bg-slate-50 rounded-xl transition-colors"
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
                              </div>
                              {q.explanation && (
                                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                                  {q.explanation}
                                </p>
                              )}
                            </div>
                          </div>

                          <Button
                            size="sm"
                            variant="danger"
                            icon={Trash2}
                            onClick={() => setDeleteTarget({ type: 'question', item: q })}
                          />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── Modal: Add Interview Question ── */}
      <Modal
        open={questionModalOpen}
        onClose={() => setQuestionModalOpen(false)}
        title="Add Core CS Interview Question"
        subtitle="Add a conceptual or technical question to the interview bank"
      >
        <form onSubmit={handleSaveQuestion} className="space-y-4">
          <FormField label="Target Syllabus Topic" required>
            <select
              value={targetTopicId}
              onChange={(e) => setTargetTopicId(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:border-[#0b5c39]"
              required
            >
              {activeSubject?.topics?.map((t: any) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Question / Concept Title" required>
            <Input
              value={questionTitle}
              onChange={(e) => setQuestionTitle(e.target.value)}
              placeholder="e.g. Explain 2-Phase Locking (2PL) and Strict 2PL in DBMS"
              required
            />
          </FormField>

          <FormField label="Difficulty">
            <select
              value={questionDiff}
              onChange={(e) => setQuestionDiff(e.target.value as any)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:border-[#0b5c39]"
            >
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </FormField>

          <FormField label="Model Explanation / Key Talking Points">
            <Textarea
              value={questionExplanation}
              onChange={(e) => setQuestionExplanation(e.target.value)}
              rows={3}
              placeholder="Key concepts, ACID transaction guarantees, serializability..."
            />
          </FormField>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setQuestionModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={savingQuestion}>
              Save Question
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Modal: Add Topic ── */}
      <Modal
        open={topicModalOpen}
        onClose={() => setTopicModalOpen(false)}
        title={`Add Topic to ${activeSubject?.type || 'Subject'}`}
        subtitle="Create a new syllabus grouping"
      >
        <form onSubmit={handleSaveTopic} className="space-y-4">
          <FormField label="Topic Title" required>
            <Input
              value={topicTitle}
              onChange={(e) => {
                setTopicTitle(e.target.value);
                setTopicSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
              }}
              placeholder="e.g. Query Optimization & EXPLAIN ANALYZE"
              required
            />
          </FormField>

          <FormField label="Slug" required>
            <Input
              value={topicSlug}
              onChange={(e) => setTopicSlug(e.target.value)}
              placeholder="query-optimization"
              required
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

      {/* Delete Confirmation */}
      <ConfirmModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={`Delete ${deleteTarget?.type === 'topic' ? 'Syllabus Topic' : 'Question'}?`}
        description={`Are you sure you want to delete "${deleteTarget?.item?.title}"?`}
      />
    </div>
  );
}
