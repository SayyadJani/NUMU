import React from 'react';
import { Code, Laptop, Box, Trophy, FileText, BarChart3 } from 'lucide-react';
import { CORE_FEATURES, type FeatureItem } from '@/data/landing-data';

export function FeaturesGrid() {
  const getIcon = (name: FeatureItem['iconName']) => {
    switch (name) {
      case 'code':
        return <Code className="w-5 h-5 text-emerald-600" />;
      case 'laptop':
        return <Laptop className="w-5 h-5 text-emerald-600" />;
      case 'box':
        return <Box className="w-5 h-5 text-emerald-600" />;
      case 'trophy':
        return <Trophy className="w-5 h-5 text-emerald-600" />;
      case 'file-text':
        return <FileText className="w-5 h-5 text-emerald-600" />;
      case 'bar-chart':
        return <BarChart3 className="w-5 h-5 text-emerald-600" />;
    }
  };

  return (
    <section className="py-12 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          {CORE_FEATURES.map((feature) => (
            <div
              key={feature.id}
              className="group p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all duration-200 text-left flex flex-col justify-between min-h-[160px]"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50/90 border border-emerald-100 flex items-center justify-center mb-4 transition-transform group-hover:scale-105">
                  {getIcon(feature.iconName)}
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1.5 group-hover:text-[#0b5c39] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
