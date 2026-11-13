'use client';

import React, { useState, useEffect } from 'react';
import {
  ChevronRight,
  CheckCircle2,
  Layers,
  Server,
  Database,
  Network,
  Cpu,
  BookOpen,
} from 'lucide-react';
import { practiceService } from '@/services';

interface SystemDesignTopic {
  id: string;
  slug: string;
  name: string;
  category: 'Fundamentals' | 'HLD' | 'LLD' | 'Case Studies';
  questions: {
    id: string;
    title: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    completed: boolean;
    duration: string;
  }[];
}

const SYSTEM_DESIGN_TOPICS: SystemDesignTopic[] = [
  {
    id: 'sd-1',
    slug: 'scalability-fundamentals',
    name: '1. Scalability, Load Balancing & Caching',
    category: 'Fundamentals',
    questions: [
      { id: 'q1', title: 'Horizontal vs Vertical Scaling & Stateless Services', difficulty: 'Easy', completed: true, duration: '15 min' },
      { id: 'q2', title: 'Consistent Hashing & Load Balancer Algorithms (L4 vs L7)', difficulty: 'Medium', completed: true, duration: '25 min' },
      { id: 'q3', title: 'Distributed Caching Strategies (Write-Through, Write-Back, Eviction)', difficulty: 'Medium', completed: false, duration: '20 min' },
    ],
  },
  {
    id: 'sd-2',
    slug: 'databases-sharding-replication',
    name: '2. Database Sharding, Replication & CAP Theorem',
    category: 'Fundamentals',
    questions: [
      { id: 'q4', title: 'CAP Theorem, PACELC & Eventual Consistency', difficulty: 'Easy', completed: true, duration: '15 min' },
      { id: 'q5', title: 'Leader-Follower vs Multi-Leader Replication', difficulty: 'Medium', completed: false, duration: '20 min' },
      { id: 'q6', title: 'Range-Based vs Hash-Based Database Sharding', difficulty: 'Hard', completed: false, duration: '30 min' },
    ],
  },
  {
    id: 'sd-3',
    slug: 'message-queues-event-driven',
    name: '3. Message Queues, Kafka & Event-Driven Architecture',
    category: 'HLD',
    questions: [
      { id: 'q7', title: 'Pub/Sub vs Point-to-Point Queues (Kafka vs RabbitMQ)', difficulty: 'Medium', completed: false, duration: '25 min' },
      { id: 'q8', title: 'Idempotency, Dead Letter Queues & Exactly-Once Delivery', difficulty: 'Hard', completed: false, duration: '30 min' },
    ],
  },
  {
    id: 'sd-4',
    slug: 'lld-solid-design-patterns',
    name: '4. Low-Level Design (LLD): SOLID & GoF Design Patterns',
    category: 'LLD',
    questions: [
      { id: 'q9', title: 'SOLID Principles with Production TypeScript/Java Examples', difficulty: 'Easy', completed: true, duration: '20 min' },
      { id: 'q10', title: 'Factory, Builder, Singleton & Strategy Patterns', difficulty: 'Medium', completed: false, duration: '25 min' },
      { id: 'q11', title: 'Design a Parking Lot & Elevator Control System (LLD)', difficulty: 'Hard', completed: false, duration: '40 min' },
    ],
  },
  {
    id: 'sd-5',
    slug: 'real-world-hld-case-studies',
    name: '5. Real-World HLD Case Studies (URL Shortener, Chat, Feed)',
    category: 'Case Studies',
    questions: [
      { id: 'q12', title: 'Design a Distributed URL Shortener (TinyURL) at 100M DAU', difficulty: 'Medium', completed: false, duration: '35 min' },
      { id: 'q13', title: 'Design WhatsApp / Real-Time WebSocket Chat System', difficulty: 'Hard', completed: false, duration: '45 min' },
      { id: 'q14', title: 'Design a Code Execution Engine (Judge0 / LeetCode Sandbox)', difficulty: 'Hard', completed: false, duration: '45 min' },
    ],
  },
];

const DIFF_CLS: Record<string, string> = {
  Easy: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  Medium: 'text-amber-700 bg-amber-50 border-amber-200',
  Hard: 'text-red-600 bg-red-50 border-red-200',
};

export default function SystemDesignPage() {
  const [topics, setTopics] = useState<SystemDesignTopic[]>(SYSTEM_DESIGN_TOPICS);
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({
    'scalability-fundamentals': true,
  });

  useEffect(() => {
    let mounted = true;
    practiceService.getSystemDesignTopics().then((backendTopics) => {
      if (!mounted || !backendTopics || backendTopics.length === 0) return;
      const mappedTopics: SystemDesignTopic[] = backendTopics.map((t) => ({
        id: t.id,
        slug: t.slug,
        name: t.name,
        category: (t.category as any) || 'Fundamentals',
        questions: (t.questions || []).map((q: any) => ({
          id: q.id,
          title: q.title,
          difficulty: q.difficulty === 'HARD' ? 'Hard' : q.difficulty === 'EASY' ? 'Easy' : 'Medium',
          completed: false,
          duration: q.duration || '20 min',
        })),
      }));
      setTopics(mappedTopics);
      const firstSlug = mappedTopics[0]?.slug;
      if (firstSlug) {
        setExpandedTopics((prev) => ({ ...prev, [firstSlug]: true }));
      }
    }).catch((err) => {
      console.warn('Failed to load system design topics from API', err);
    });

    return () => {
      mounted = false;
    };
  }, []);

  const toggleTopic = (slug: string) => {
    setExpandedTopics((prev) => ({ ...prev, [slug]: !prev[slug] }));
  };

  const toggleQuestionComplete = (topicId: string, qId: string) => {
    setTopics((prev) =>
      prev.map((t) =>
        t.id !== topicId
          ? t
          : {
              ...t,
              questions: t.questions.map((q) =>
                q.id === qId ? { ...q, completed: !q.completed } : q,
              ),
            },
      ),
    );
  };

  const totalQuestions = topics.reduce((acc, t) => acc + t.questions.length, 0);
  const completedQuestions = topics.reduce(
    (acc, t) => acc + t.questions.filter((q) => q.completed).length,
    0,
  );
  const overallPct =
    totalQuestions > 0 ? Math.round((completedQuestions / totalQuestions) * 100) : 0;

  return (
    <div className="p-5 space-y-5">
      {/* KPI Header Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              System Design Progress
            </div>
            <div className="text-xl font-extrabold text-slate-900">
              {completedQuestions} / {totalQuestions}{' '}
              <span className="text-xs font-bold text-emerald-600">({overallPct}%)</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              High-Level Design (HLD)
            </div>
            <div className="text-sm font-extrabold text-slate-900">
              Distributed Systems &amp; Scale
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Low-Level Design (LLD)
            </div>
            <div className="text-sm font-extrabold text-slate-900">
              SOLID, OOD &amp; Machine Coding
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Architecture Case Studies
            </div>
            <div className="text-sm font-extrabold text-slate-900">
              Production Blueprints
            </div>
          </div>
        </div>
      </div>

      {/* Expandable System Design Curriculum Accordion */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-700 shrink-0">
              <Layers className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-extrabold text-slate-900">
                  System Design (HLD &amp; LLD) Curriculum
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {completedQuestions} / {totalQuestions} Completed ({overallPct}%)
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Click any System Design module below to view and track HLD/LLD interview topics.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2.5">
          {topics.map((topic) => {
            const isExpanded = Boolean(expandedTopics[topic.slug]);
            const solvedInTopic = topic.questions.filter((q) => q.completed).length;
            const totalInTopic = topic.questions.length;
            const pct = totalInTopic > 0 ? Math.round((solvedInTopic / totalInTopic) * 100) : 0;

            return (
              <div
                key={topic.id}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isExpanded
                    ? 'border-emerald-300 bg-white shadow-xs'
                    : 'border-slate-200/80 bg-slate-50/60 hover:bg-slate-100/70'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleTopic(topic.slug)}
                  className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left cursor-pointer group select-none"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <ChevronRight
                      className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                        isExpanded
                          ? 'rotate-90 text-emerald-600'
                          : 'text-slate-400 group-hover:text-slate-700'
                      }`}
                    />
                    <span className="text-sm sm:text-[15px] font-bold text-slate-800 truncate">
                      {topic.name}
                    </span>
                    <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                      {topic.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="w-28 sm:w-52 h-1.5 bg-slate-200/90 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-slate-600 tabular-nums min-w-[46px] text-right">
                      {solvedInTopic} / {totalInTopic}
                    </span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-slate-100 bg-white px-4 sm:px-6 py-3 divide-y divide-slate-100">
                    {topic.questions.map((q, idx) => (
                      <div
                        key={q.id}
                        className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-xl transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-xs font-semibold text-slate-400 w-5 text-right shrink-0">
                            {idx + 1}.
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleQuestionComplete(topic.id, q.id)}
                            className="cursor-pointer shrink-0"
                          >
                            {q.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <span className="w-4 h-4 rounded-full border-2 border-slate-300 inline-block" />
                            )}
                          </button>
                          <span className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                            {q.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0">
                          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-400">
                            <BookOpen className="w-3 h-3" />
                            {q.duration}
                          </span>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                              DIFF_CLS[q.difficulty]
                            }`}
                          >
                            {q.difficulty}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleQuestionComplete(topic.id, q.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                              q.completed
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-[#0b5c39] text-white hover:bg-[#08482c]'
                            }`}
                          >
                            {q.completed ? 'Completed ✓' : 'Mark Done'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

