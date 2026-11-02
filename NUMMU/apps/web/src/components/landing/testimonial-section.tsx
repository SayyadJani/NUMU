import React from 'react';

interface StatPillProps {
  value: string;
  label: string;
}

function StatPill({ value, label }: StatPillProps) {
  return (
    <div className="text-center">
      <span className="block text-2xl font-extrabold text-slate-900 tracking-tight">{value}</span>
      <span className="block text-xs text-slate-500 mt-0.5">{label}</span>
    </div>
  );
}

export function TestimonialSection() {
  return (
    <section className="py-10 lg:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-slate-50 border border-slate-200/80 p-6 sm:p-8 lg:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Quote */}
            <div className="lg:col-span-7 text-left">
              <blockquote className="relative">
                <span className="absolute -top-4 -left-2 text-6xl text-emerald-200 font-serif leading-none select-none">&ldquo;</span>
                <p className="text-slate-700 text-base sm:text-lg leading-relaxed font-medium relative pl-4">
                  &ldquo;NUMU has completely changed the way we track and improve our students&apos; technical skills. The structure, projects and analytics are exactly what we needed.&rdquo;
                </p>
              </blockquote>

              <div className="mt-6 flex items-center gap-3.5 pl-4">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 text-white flex items-center justify-center font-extrabold text-base shrink-0 shadow-sm">
                  P
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-900">Dr. Priya Nair</p>
                  <p className="text-xs text-slate-500">HOD, CSE · VIT University</p>
                </div>
              </div>
            </div>

            {/* Stat Pills */}
            <div className="lg:col-span-5">
              <div className="grid grid-cols-3 gap-4 divide-x divide-slate-200">
                <StatPill value="200+" label="Partner Colleges" />
                <div className="pl-4">
                  <StatPill value="95%" label="Student Engagement" />
                </div>
                <div className="pl-4">
                  <StatPill value="4.8/5" label="College Rating" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
