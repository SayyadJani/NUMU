import { LandingNav } from '@/components/landing/landing-nav';
import { LandingHero } from '@/components/landing/landing-hero';
import {
  AfterSignupSection,
  CaseStudiesSection,
  ComparisonSection,
  FaqSection,
  FunnelSection,
  PillarsSection,
  PlansSection,
  TimelineSection,
  TracksSection,
} from '@/components/landing/landing-sections';
import { BeforeAfterSection } from '@/components/landing/landing-before-after';
import { LandingFooter } from '@/components/landing/landing-footer';

export default function HomePage() {
  return (
    <div className="bg-flx-surface font-sans text-flx-text">
      <LandingNav />
      <main>
        {/* 1. Dark green hero + company strip */}
        <LandingHero />
        {/* 2. Without vs With NUMU */}
        <BeforeAfterSection />
        {/* 3. Meet NUMU – pillars + testimonials */}
        <PillarsSection />
        {/* 4. Post-signup features carousel */}
        <AfterSignupSection />
        {/* 5. Plans */}
        <PlansSection />
        {/* 6. Curation funnel */}
        <FunnelSection />
        {/* 7. Tracks marquee */}
        <TracksSection />
        {/* 8. Timeline */}
        <TimelineSection />
        {/* 9. Comparison table */}
        <ComparisonSection />
        {/* 10. College case studies */}
        <CaseStudiesSection />
        {/* 11. FAQ */}
        <FaqSection />
      </main>
      {/* 12. Lime CTA + dark footer */}
      <LandingFooter />
    </div>
  );
}
