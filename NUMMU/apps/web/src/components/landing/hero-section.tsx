import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DashboardMockup } from '@/components/landing/dashboard-mockup';
import { HERO_STATS } from '@/data/landing-data';

export function HeroSection() {
  return (
    <section className="relative pt-10 pb-16 lg:pt-16 lg:pb-24 overflow-hidden">
      {/* Subtle organic emerald gradient glow behind the hero */}
      <div className="pointer-events-none absolute -top-24 right-1/4 w-[600px] h-[600px] bg-emerald-100/40 rounded-full blur-[140px] -z-10" />
      <div className="pointer-events-none absolute top-40 right-10 w-[400px] h-[400px] bg-teal-100/30 rounded-full blur-[120px] -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headline & Value Prop */}
          <div className="lg:col-span-5 text-left">
            {/* Pill Badge */}
            <div className="mb-5">
              <Badge variant="mint" className="tracking-wider">
                THE COMPLETE DEVELOPER LEARNING PLATFORM
              </Badge>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl sm:text-6xl xl:text-7xl font-black tracking-tight text-slate-950 leading-[1.08] mb-6">
              Learn.
              <br />
              Build.
              <br />
              <span className="text-[#0b5c39]">Grow.</span>
            </h1>

            {/* Descriptive Subtext */}
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-lg mb-8 font-normal">
              A structured learning platform to help you master DSA, build real-world projects, crack interviews and become industry ready.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 mb-14">
              <Button variant="primary" size="lg" withArrow>
                Start Learning
              </Button>
              <Button variant="secondary" size="lg">
                Explore Roadmaps
              </Button>
            </div>

            {/* Platform Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-slate-200/80">
              {HERO_STATS.map((stat) => (
                <div key={stat.label} className="text-left">
                  <span className="block text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {stat.value}
                  </span>
                  <span className="block text-xs font-medium text-slate-500 mt-1">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Floating Dashboard Mockup */}
          <div className="lg:col-span-7 relative">
            <div className="relative mx-auto max-w-2xl lg:max-w-none transform lg:scale-[1.02] xl:scale-105 transition-transform duration-300">
              <DashboardMockup />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
