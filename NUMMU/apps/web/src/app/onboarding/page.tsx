'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Code2,
  Laptop,
  Sparkles,
  Check,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  Target,
  Layers,
  Network,
} from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { Badge } from '@/components/ui/badge';

type PathChoice = 'dsa' | 'dev' | 'both';

const ROADMAP_STAGES = [
  {
    id: 1,
    title: 'DSA Foundations',
    subtitle: 'Arrays, Strings, Complexity',
    duration: '4 wks',
    icon: <Code2 className="w-3.5 h-3.5 text-emerald-600" />,
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
  },
  {
    id: 2,
    title: 'Algorithms & Patterns',
    subtitle: 'Trees, Graphs, DP, Sliding Window',
    duration: '8 wks',
    icon: <Network className="w-3.5 h-3.5 text-teal-600" />,
    bg: 'bg-teal-50',
    border: 'border-teal-200',
  },
  {
    id: 3,
    title: 'Modern Fullstack Core',
    subtitle: 'React, Next.js, Node.js, SQL',
    duration: '8 wks',
    icon: <Laptop className="w-3.5 h-3.5 text-blue-600" />,
    bg: 'bg-blue-50',
    border: 'border-blue-200',
  },
  {
    id: 4,
    title: 'Production Project Lab',
    subtitle: 'Build & deploy real-world apps',
    duration: '6 wks',
    icon: <Layers className="w-3.5 h-3.5 text-purple-600" />,
    bg: 'bg-purple-50',
    border: 'border-purple-200',
  },
  {
    id: 5,
    title: 'Placement & Mock Interviews',
    subtitle: 'Company-specific prep & tests',
    duration: 'Ongoing',
    icon: <Sparkles className="w-3.5 h-3.5 text-amber-600" />,
    bg: 'bg-amber-50',
    border: 'border-amber-200',
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [selectedPath, setSelectedPath] = useState<PathChoice>('both');
  const [currentStep, setCurrentStep] = useState<number>(1);

  const steps = [
    { num: 1, title: 'Choose Path', desc: 'Select your learning focus' },
    { num: 2, title: 'Your Level', desc: 'Current technical comfort' },
    { num: 3, title: 'Your Goal', desc: 'Target company or role' },
    { num: 4, title: 'Your Plan', desc: 'Personalized curriculum' },
  ];

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((c) => c + 1);
    } else {
      router.push('/dashboard');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((c) => c - 1);
    } else {
      router.push('/login');
    }
  };

  return (
    <div className="h-screen max-h-screen w-full bg-[#f8fafc] flex flex-col text-slate-900 overflow-hidden select-none">
      {/* ── Top Header Bar (52px Fixed) ── */}
      <header className="h-13 bg-white border-b border-slate-200/90 px-6 sm:px-8 flex items-center justify-between shrink-0 shadow-2xs z-20">
        <div className="flex items-center gap-3">
          <Link href="/" className="shrink-0">
            <Logo size="sm" />
          </Link>
          <div className="h-4 w-px bg-slate-200 hidden sm:block" />
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 hidden sm:inline-block">
            Personalization Setup
          </span>
        </div>

        {/* Step progress pills in header */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700">
            Step {currentStep} of {steps.length}:
          </span>
          <span className="text-xs font-semibold text-emerald-700">
            {steps[currentStep - 1]?.title}
          </span>
          <div className="w-24 sm:w-32 h-1.5 rounded-full bg-slate-100 overflow-hidden ml-1">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* User profile avatar lockup */}
        <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
          <div className="w-7 h-7 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-xs shadow-2xs">
            J
          </div>
          <span className="text-xs font-bold text-slate-800 hidden md:inline">Jani Pasha</span>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-[11px] font-semibold text-slate-400 hover:text-slate-700 ml-2 cursor-pointer"
          >
            Skip to Dashboard
          </button>
        </div>
      </header>

      {/* ── Main Workspace: Fixed 3-Column Grid Fitted to Single Viewport ── */}
      <div className="flex-1 p-4 sm:p-6 lg:p-7 flex items-center justify-center overflow-hidden">
        <div className="w-full max-w-6xl h-full max-h-[580px] grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
          {/* ── 1. Left Column: Step Guide (3 cols) ── */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/90 p-5 flex flex-col justify-between shadow-2xs">
            <div className="space-y-5 text-left">
              <div>
                <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                  Getting Started
                </div>
                <h2 className="text-base font-extrabold text-slate-900 mt-0.5">
                  Your Journey
                </h2>
              </div>

              {/* Step indicator items */}
              <div className="space-y-4">
                {steps.map((st, idx) => {
                  const isActive = st.num === currentStep;
                  const isPast = st.num < currentStep;

                  return (
                    <div key={st.num} className="relative flex items-start gap-3">
                      {idx < steps.length - 1 && (
                        <div
                          className={`absolute left-3 top-6 bottom-0 w-0.5 -mb-4 transition-colors ${
                            isPast ? 'bg-emerald-600' : 'bg-slate-200'
                          }`}
                        />
                      )}

                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 z-10 transition-colors ${
                          isActive
                            ? 'bg-[#0b5c39] text-white ring-2 ring-emerald-200'
                            : isPast
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 text-slate-400 border border-slate-200'
                        }`}
                      >
                        {isPast ? <Check className="w-3 h-3 stroke-[3]" /> : st.num}
                      </div>

                      <div>
                        <div
                          className={`text-xs font-bold leading-tight ${
                            isActive ? 'text-slate-900' : isPast ? 'text-emerald-900' : 'text-slate-400'
                          }`}
                        >
                          {st.title}
                        </div>
                        <div className="text-[10px] text-slate-400 leading-tight mt-0.5">
                          {st.desc}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Quote & Motivation */}
            <div className="pt-4 border-t border-slate-100 text-left space-y-2">
              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 text-left">
                <p className="text-[11px] text-emerald-900 italic font-medium leading-relaxed">
                  &ldquo;A structured learning path today compounds into a brighter tomorrow.&rdquo;
                </p>
                <div className="text-[10px] font-bold text-emerald-700 mt-1 uppercase tracking-wide">
                  — NUMU Team
                </div>
              </div>
            </div>
          </div>

          {/* ── 2. Middle Column: Interactive Path Selector (5 cols) ── */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 flex flex-col justify-between shadow-2xs text-left">
            <div className="space-y-4">
              <div>
                <Badge variant="mint">STEP {currentStep} OF 4</Badge>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1.5">
                  What do you want to improve?
                </h1>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Choose your primary track. You can explore or combine both at any time.
                </p>
              </div>

              {/* 3 Selectable Track Options */}
              <div className="space-y-2.5">
                {/* Track 1: DSA */}
                <button
                  type="button"
                  onClick={() => setSelectedPath('dsa')}
                  className={`w-full p-3.5 rounded-xl text-left flex items-center justify-between border transition-all cursor-pointer ${
                    selectedPath === 'dsa'
                      ? 'border-emerald-600 bg-emerald-50/40 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                      <Code2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        Data Structures & Algorithms
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Arrays, Trees, DP & 500+ LeetCode patterns
                      </div>
                    </div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                      selectedPath === 'dsa'
                        ? 'bg-emerald-700 text-white'
                        : 'border border-slate-300'
                    }`}
                  >
                    {selectedPath === 'dsa' && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </button>

                {/* Track 2: Development */}
                <button
                  type="button"
                  onClick={() => setSelectedPath('dev')}
                  className={`w-full p-3.5 rounded-xl text-left flex items-center justify-between border transition-all cursor-pointer ${
                    selectedPath === 'dev'
                      ? 'border-emerald-600 bg-emerald-50/40 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
                      <Laptop className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        Full Stack Development
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        React, Node, SQL & real-world production projects
                      </div>
                    </div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                      selectedPath === 'dev'
                        ? 'bg-emerald-700 text-white'
                        : 'border border-slate-300'
                    }`}
                  >
                    {selectedPath === 'dev' && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </button>

                {/* Track 3: Both (Recommended) */}
                <button
                  type="button"
                  onClick={() => setSelectedPath('both')}
                  className={`w-full p-3.5 rounded-xl text-left flex items-center justify-between border transition-all cursor-pointer relative ${
                    selectedPath === 'both'
                      ? 'border-emerald-600 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-600/30'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-800 flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5 text-emerald-700" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <span>Both (DSA + Development)</span>
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-600 text-white">
                          RECOMMENDED
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Balanced mastery: crack coding rounds & build portfolios
                      </div>
                    </div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                      selectedPath === 'both'
                        ? 'bg-emerald-700 text-white'
                        : 'border border-slate-300'
                    }`}
                  >
                    {selectedPath === 'both' && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </button>
              </div>

              {/* Pro-Tip Box */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5">
                <Target className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div className="text-[11px] text-slate-600 leading-relaxed">
                  <strong className="text-slate-800">Recommendation:</strong> 85% of placed students select the combined track to master problem solving while building capstone projects.
                </div>
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2 rounded-xl bg-[#0b5c39] hover:bg-[#094d2f] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <span>{currentStep === 4 ? 'Finish & Launch' : 'Continue to Step 2'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* ── 3. Right Column: Roadmap Preview (4 cols) ── */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 p-5 flex flex-col justify-between shadow-2xs text-left">
            <div className="space-y-3">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Roadmap Snapshot
                </div>
                <h3 className="text-sm font-extrabold text-slate-900 mt-0.5">
                  See What&rsquo;s Ahead
                </h3>
              </div>

              {/* Stage chips */}
              <div className="space-y-2">
                {ROADMAP_STAGES.map((st) => (
                  <div
                    key={st.id}
                    className="p-2.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-white flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-lg ${st.bg} border ${st.border} flex items-center justify-center shrink-0`}>
                        {st.icon}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800 leading-tight">
                          {st.title}
                        </div>
                        <div className="text-[10px] text-slate-400 leading-tight mt-0.5">
                          {st.subtitle}
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 shrink-0">
                      {st.duration}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Dark Callout */}
            <div className="p-3 rounded-xl bg-[#08281a] text-white flex items-center justify-between shadow-xs">
              <div>
                <div className="text-xs font-bold flex items-center gap-1.5 text-emerald-300">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Self-Paced & Structured</span>
                </div>
                <div className="text-[10px] text-emerald-100/70 mt-0.5">
                  Real projects • Assessments • Contests
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
