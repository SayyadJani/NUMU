'use client';

import React from 'react';
import Link from 'next/link';
import type { TestItem } from '@/types/tests';
import {
  Clock,
  HelpCircle,
  FileCode2,
  CheckSquare2,
  Target,
  Repeat,
  Terminal,
  Monitor,
  ShieldAlert,
  ShieldCheck,
  ArrowRight,
  X,
} from 'lucide-react';

interface TestInstructionsModalProps {
  test: TestItem;
  isOpen: boolean;
  onClose: () => void;
}

export function TestInstructionsModal({
  test,
  isOpen,
  onClose,
}: TestInstructionsModalProps) {
  if (!isOpen) return null;

  const instructionItems = [
    {
      label: 'Duration',
      value: `${test.durationMinutes} minutes`,
      icon: Clock,
    },
    {
      label: 'Total Questions',
      value: `${test.questionsCount || 50}`,
      icon: HelpCircle,
    },
    {
      label: 'Question Types',
      value: 'Multiple choice and coding',
      icon: FileCode2,
    },
    {
      label: 'Scoring',
      value: '+4 for correct, -1 for incorrect (MCQ)\nFull score for correct code (Coding)',
      icon: CheckSquare2,
    },
    {
      label: 'Passing Score',
      value: `${test.passPercentage}%`,
      icon: Target,
    },
    {
      label: 'Multiple Submissions',
      value: 'Allowed (last submission considered)',
      icon: Repeat,
    },
    {
      label: 'Language Support',
      value: 'C++, Java, Python, JavaScript, TypeScript',
      icon: Terminal,
    },
    {
      label: 'Environment',
      value: 'Similar to real interview environment with Monaco Code Editor',
      icon: Monitor,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">{test.title}</h2>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Ongoing
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {test.questionsCount} questions • {test.durationMinutes} mins • {test.typeBadge} • {test.passPercentage}% pass
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close instructions modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-5 text-xs">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-0.5">Test Instructions</h3>
            <p className="text-slate-500 text-[11px]">
              Review all examination parameters and rules before initiating your timer
            </p>
          </div>

          {/* Key Guidelines Grid */}
          <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
            {instructionItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1"
                >
                  <div className="flex items-center gap-2 text-slate-600 font-semibold sm:w-48 shrink-0">
                    <Icon className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  <div className="text-slate-900 font-medium whitespace-pre-line text-left sm:text-right flex-1 text-[11px]">
                    {item.value}
                  </div>
                </div>
              );
            })}

            {/* Rules */}
            <div className="py-2.5 flex flex-col sm:flex-row sm:items-start justify-between gap-1">
              <div className="flex items-center gap-2 text-slate-600 font-semibold sm:w-48 shrink-0">
                <ShieldAlert className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Rules</span>
              </div>
              <ul className="text-slate-700 text-[11px] space-y-0.5 list-disc list-inside text-left sm:text-right flex-1">
                <li>Do not switch tabs frequently</li>
                <li>Do not use unauthorized help</li>
                <li>Timer will not stop once initiated</li>
                <li>Test will be auto-submitted on timeout</li>
              </ul>
            </div>
          </div>

          {/* Agreement Notice */}
          <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 flex items-start gap-2.5 text-emerald-900 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed text-[11px]">
              By starting this test, you agree to follow the rules and maintain academic integrity.
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 px-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-white transition-all"
          >
            Cancel
          </button>

          <Link
            href={`/tests/${test.id}/attempt` as any}
            className="inline-flex items-center gap-2 px-6 py-2 rounded-xl bg-[#0b5c39] hover:bg-[#094d2f] text-white text-xs font-bold transition-all shadow-sm hover:shadow"
          >
            <span>Start Test</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
