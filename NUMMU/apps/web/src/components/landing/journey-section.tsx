import React from 'react';
import { BookOpen, Code, Box, FileText, Trophy, BarChart3, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { JOURNEY_STEPS, type JourneyStep } from '@/data/landing-data';

export function JourneySection() {
  const getStepIcon = (name: JourneyStep['iconName'], _color?: JourneyStep['accentColor']) => {
    const iconClass = 'w-5 h-5';
    switch (name) {
      case 'book-open':
        return <BookOpen className={`${iconClass} text-emerald-600`} />;
      case 'code':
        return <Code className={`${iconClass} text-emerald-600`} />;
      case 'box':
        return <Box className={`${iconClass} text-emerald-600`} />;
      case 'file-text':
        return <FileText className={`${iconClass} text-blue-600`} />;
      case 'trophy':
        return <Trophy className={`${iconClass} text-rose-500`} />;
      case 'bar-chart':
        return <BarChart3 className={`${iconClass} text-amber-500`} />;
    }
  };

  const getCircleBg = (color: JourneyStep['accentColor']) => {
    switch (color) {
      case 'emerald':
        return 'bg-emerald-50 border-emerald-100/90';
      case 'blue':
        return 'bg-blue-50 border-blue-100/90';
      case 'red':
        return 'bg-rose-50 border-rose-100/90';
      case 'amber':
        return 'bg-amber-50 border-amber-100/90';
      default:
        return 'bg-emerald-50 border-emerald-100/90';
    }
  };

  return (
    <section className="py-16 lg:py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with Top Right Annotation */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 relative text-left">
          <div>
            <div className="mb-3">
              <Badge variant="mint">A CLEAR PATH TO YOUR GOALS</Badge>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Your Journey with NUMU
            </h2>
            <p className="text-slate-500 text-sm sm:text-base mt-2">
              From learning to becoming industry ready.
            </p>
          </div>

          {/* Hand-drawn style annotation */}
          <div className="hidden md:flex flex-col items-end pr-6">
            <span className="font-serif italic text-xs font-semibold text-slate-700 tracking-tight">
              A brighter you,
              <br />
              step by step.
            </span>
            <svg
              className="w-14 h-7 text-emerald-600 mt-0.5"
              viewBox="0 0 60 30"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M50 4C40 22 20 25 6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="3 3"
              />
              <path
                d="M10 14L4 18L10 23"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* 6 Step Interactive Horizontal Flow */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 relative">
          {JOURNEY_STEPS.map((step, idx) => (
            <div key={step.title} className="relative flex flex-col items-center text-center group">
              {/* Connector Arrow (visible on desktop between items) */}
              {idx < JOURNEY_STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-7 -right-3.5 z-10 text-slate-300">
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}

              {/* Circular Step Icon */}
              <div
                className={`w-14 h-14 rounded-full border flex items-center justify-center mb-3.5 shadow-2xs transition-transform duration-200 group-hover:scale-110 ${getCircleBg(
                  step.accentColor,
                )}`}
              >
                {getStepIcon(step.iconName, step.accentColor)}
              </div>

              {/* Title & Desc */}
              <h3 className="text-sm font-bold text-slate-900 mb-1 group-hover:text-[#0b5c39] transition-colors">
                {step.title}
              </h3>
              <p className="text-[11.5px] text-slate-500 leading-snug max-w-[130px]">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
