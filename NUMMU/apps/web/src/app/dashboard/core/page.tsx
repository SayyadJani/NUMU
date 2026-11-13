'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  ChevronRight,
  CheckCircle2,
  Database,
  Cpu,
  Network,
  Code2,
  Layers,
} from 'lucide-react';
import { practiceService } from '@/services';

interface CoreTopic {
  id: string;
  slug: string;
  name: string;
  subject: 'dbms' | 'os' | 'cn' | 'oops';
  subjectLabel: string;
  questions: {
    id: string;
    title: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    completed: boolean;
  }[];
}

const CORE_CS_TOPICS: CoreTopic[] = [
  {
    id: 'core-dbms',
    slug: 'dbms',
    name: '1. DBMS & SQL (Indexing, ACID, Normalization & Joins)',
    subject: 'dbms',
    subjectLabel: 'DBMS & SQL',
    questions: [
      { id: 'c1', title: 'ACID Properties, Isolation Levels & Concurrency Control', difficulty: 'Easy', completed: true },
      { id: 'c2', title: 'B-Trees vs B+ Trees Indexing & Query Execution Plans', difficulty: 'Medium', completed: true },
      { id: 'c3', title: '1NF, 2NF, 3NF & BCNF Database Normalization', difficulty: 'Medium', completed: false },
      { id: 'c4', title: 'SQL Window Functions (ROW_NUMBER, RANK, DENSE_RANK)', difficulty: 'Medium', completed: false },
    ],
  },
  {
    id: 'core-os',
    slug: 'os',
    name: '2. Operating Systems (Processes, Threads, Deadlocks & Memory)',
    subject: 'os',
    subjectLabel: 'Operating Systems',
    questions: [
      { id: 'c5', title: 'Process vs Thread, Context Switching & PCB', difficulty: 'Easy', completed: true },
      { id: 'c6', title: 'CPU Scheduling Algorithms (FCFS, SJF, Round Robin, Priority)', difficulty: 'Medium', completed: false },
      { id: 'c7', title: 'Deadlock Conditions, Banker’s Algorithm & Semaphores/Mutex', difficulty: 'Hard', completed: false },
      { id: 'c8', title: 'Virtual Memory, Paging, TLB & Page Replacement (LRU, Optimal)', difficulty: 'Medium', completed: false },
    ],
  },
  {
    id: 'core-cn',
    slug: 'cn',
    name: '3. Computer Networks (OSI, TCP/IP, HTTP/3, DNS & TLS)',
    subject: 'cn',
    subjectLabel: 'Computer Networks',
    questions: [
      { id: 'c9', title: 'OSI 7-Layer Model vs TCP/IP Protocol Suite', difficulty: 'Easy', completed: true },
      { id: 'c10', title: 'TCP 3-Way Handshake, Flow Control & Congestion Control', difficulty: 'Medium', completed: false },
      { id: 'c11', title: 'What Happens When You Type a URL in the Browser (DNS + TLS + HTTP)', difficulty: 'Medium', completed: false },
    ],
  },
  {
    id: 'core-oops',
    slug: 'oops',
    name: '4. Object-Oriented Programming (Encapsulation, Polymorphism & VTables)',
    subject: 'oops',
    subjectLabel: 'OOPs Concepts',
    questions: [
      { id: 'c12', title: '4 Pillars of OOP: Encapsulation, Abstraction, Inheritance, Polymorphism', difficulty: 'Easy', completed: true },
      { id: 'c13', title: 'Compile-Time vs Run-Time Polymorphism & Virtual Tables (vtable)', difficulty: 'Medium', completed: true },
      { id: 'c14', title: 'Abstract Classes vs Interfaces & Composition over Inheritance', difficulty: 'Easy', completed: false },
    ],
  },
];

const DIFF_CLS: Record<string, string> = {
  Easy: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  Medium: 'text-amber-700 bg-amber-50 border-amber-200',
  Hard: 'text-red-600 bg-red-50 border-red-200',
};

export default function CoreCsPage() {
  const searchParams = useSearchParams();
  const [topics, setTopics] = useState<CoreTopic[]>(CORE_CS_TOPICS);
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({
    dbms: true,
  });

  useEffect(() => {
    let mounted = true;
    practiceService.getCoreSubjects().then((subjects) => {
      if (!mounted || !subjects || subjects.length === 0) return;
      const mapped: CoreTopic[] = [];
      subjects.forEach((subj: any) => {
        (subj.topics || []).forEach((t: any) => {
          mapped.push({
            id: t.id,
            slug: subj.slug,
            name: t.title,
            subject: subj.slug as any,
            subjectLabel: subj.name,
            questions: (t.questions || []).map((q: any) => ({
              id: q.id,
              title: q.title,
              difficulty: q.difficulty === 'HARD' ? 'Hard' : q.difficulty === 'EASY' ? 'Easy' : 'Medium',
              completed: false,
            })),
          });
        });
      });
      if (mapped.length > 0) {
        setTopics(mapped);
      }
    }).catch((err) => {
      console.warn('Failed to load core subjects from API', err);
    });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const subj = searchParams.get('subject');
    if (subj) {
      setExpandedTopics((prev) => ({ ...prev, [subj]: true }));
    }
  }, [searchParams]);

  const toggleTopic = (slug: string) => {
    setExpandedTopics((prev) => ({ ...prev, [slug]: !prev[slug] }));
  };

  const toggleComplete = (topicId: string, qId: string) => {
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
      {/* Core Subjects Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => toggleTopic('dbms')}
          className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex items-center gap-3.5 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              DBMS &amp; SQL
            </div>
            <div className="text-sm font-extrabold text-slate-900">
              Indexing, Joins &amp; ACID
            </div>
          </div>
        </div>

        <div
          onClick={() => toggleTopic('os')}
          className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex items-center gap-3.5 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Operating Systems
            </div>
            <div className="text-sm font-extrabold text-slate-900">
              Threads, Paging &amp; Locks
            </div>
          </div>
        </div>

        <div
          onClick={() => toggleTopic('cn')}
          className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex items-center gap-3.5 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Computer Networks
            </div>
            <div className="text-sm font-extrabold text-slate-900">
              TCP/IP, DNS &amp; HTTP/3
            </div>
          </div>
        </div>

        <div
          onClick={() => toggleTopic('oops')}
          className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex items-center gap-3.5 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 shrink-0">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              OOPs Concepts
            </div>
            <div className="text-sm font-extrabold text-slate-900">
              Polymorphism &amp; SOLID
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Core CS Accordion */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-700 shrink-0">
              <Layers className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-extrabold text-slate-900">
                  Core CS Fundamentals (DBMS, OS, CN, OOPs)
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {completedQuestions} / {totalQuestions} Completed ({overallPct}%)
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Click any Core CS subject below to expand interview questions and track your preparation.
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
                            onClick={() => toggleComplete(topic.id, q.id)}
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
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                              DIFF_CLS[q.difficulty]
                            }`}
                          >
                            {q.difficulty}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleComplete(topic.id, q.id)}
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

