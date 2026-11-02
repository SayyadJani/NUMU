import React from 'react';
import { BookOpen, Code2, Box, FileText, Trophy, ArrowUpRight } from 'lucide-react';

interface PathNode {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  badgeBorder?: string;
}

const PATH_NODES: PathNode[] = [
  {
    title: 'Learn',
    subtitle: 'Structured roadmaps',
    icon: <BookOpen className="w-4 h-4" />,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-700',
    badgeBorder: 'border-emerald-300',
  },
  {
    title: 'Practice',
    subtitle: 'Solve problems and exercises',
    icon: <Code2 className="w-4 h-4" />,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-700',
    badgeBorder: 'border-emerald-300',
  },
  {
    title: 'Build',
    subtitle: 'Work on real projects',
    icon: <Box className="w-4 h-4" />,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-700',
    badgeBorder: 'border-emerald-300',
  },
  {
    title: 'Test',
    subtitle: 'Assess your knowledge',
    icon: <FileText className="w-4 h-4" />,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-700',
    badgeBorder: 'border-emerald-300',
  },
  {
    title: 'Compete',
    subtitle: 'Participate and grow',
    icon: <Trophy className="w-4 h-4" />,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-700',
    badgeBorder: 'border-emerald-300',
  },
  {
    title: 'Get Hired',
    subtitle: 'Turn your skills into opportunities',
    icon: <ArrowUpRight className="w-4 h-4" />,
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-800',
    badgeBorder: 'border-emerald-500',
  },
];

export function AuthPathPreview() {
  return (
    <div className="relative w-full max-w-xl my-4 py-2">
      {/* SVG Connecting Curved Path Line */}
      <div className="relative flex flex-col gap-5 sm:gap-6 pl-4 sm:pl-8">
        {/* Subtle decorative curved line behind nodes */}
        <div className="absolute left-[31px] sm:left-[47px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-emerald-500 via-emerald-400 to-emerald-300 rounded-full" />

        {PATH_NODES.map((node, idx) => {
          // Calculate an offset to create the gentle sweeping diagonal curve seen in the mockup
          const curveOffset = Math.sin((idx / (PATH_NODES.length - 1)) * (Math.PI / 1.6)) * 40;

          return (
            <div
              key={node.title}
              className="relative flex items-center gap-3 sm:gap-4 transition-transform hover:translate-x-1 duration-200"
              style={{
                marginLeft: `${curveOffset}px`,
              }}
            >
              {/* Circular Node Icon */}
              <div
                className={`
                  relative z-10 w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center shrink-0
                  ${node.iconBg} ${node.iconColor} border-2 ${node.badgeBorder || 'border-emerald-400'}
                  shadow-sm shadow-emerald-600/10 ring-4 ring-white
                `}
              >
                {node.icon}
              </div>

              {/* Step Info Card */}
              <div className="bg-white/95 backdrop-blur-xs border border-slate-200/80 hover:border-emerald-300/80 rounded-xl px-3.5 py-2 shadow-xs transition-all hover:shadow-sm">
                <div className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                  {node.title}
                </div>
                <div className="text-[11px] sm:text-xs text-slate-500 leading-tight mt-0.5">
                  {node.subtitle}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Decorative Hand-drawn style note in bottom right */}
      <div className="absolute right-2 sm:right-6 bottom-4 flex flex-col items-center select-none pointer-events-none opacity-90">
        <span className="font-serif italic font-medium text-emerald-800 text-sm sm:text-base leading-snug rotate-[-6deg]">
          Learn
          <br />
          Build
          <br />
          Grow
        </span>
        <svg
          className="w-10 h-10 text-emerald-700 mt-1 rotate-[-15deg]"
          viewBox="0 0 50 50"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10 40C16 30 25 18 38 12"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="2 3"
          />
          <path
            d="M28 10L40 12L38 24"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}
