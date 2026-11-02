import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function CtaSection() {
  return (
    <section className="py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Dark forest green CTA Banner */}
        <div className="relative rounded-3xl bg-[#0a2218] border border-emerald-900/50 overflow-hidden">
          {/* Ambient glow orbs */}
          <div className="pointer-events-none absolute -top-16 left-1/4 w-72 h-72 bg-emerald-500/15 rounded-full blur-[90px]" />
          <div className="pointer-events-none absolute -bottom-16 right-1/4 w-72 h-72 bg-teal-500/10 rounded-full blur-[90px]" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 px-8 sm:px-12 lg:px-16 py-12 lg:py-14">
            {/* Left Text */}
            <div className="text-left max-w-xl">
              <div className="mb-4">
                <Badge variant="mint-dark" className="text-emerald-300 border-emerald-500/30">
                  READY TO BUILD A BRIGHTER YOU?
                </Badge>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight mb-3 leading-tight">
                Start Your Journey with NUMU Today
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Join thousands of students learning, building and growing with NUMU.
              </p>
            </div>

            {/* Right CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <Button variant="emerald" size="lg" withArrow>
                Create Free Account
              </Button>
              <Button variant="dark" size="lg">
                View Pricing
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
