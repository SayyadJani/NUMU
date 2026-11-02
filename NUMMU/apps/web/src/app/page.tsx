import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { HeroSection } from '@/components/landing/hero-section';
import { FeaturesGrid } from '@/components/landing/features-grid';
import { JourneySection } from '@/components/landing/journey-section';
import { DualShowcase } from '@/components/landing/dual-showcase';
import { CollegeSection } from '@/components/landing/college-section';
import { TestimonialSection } from '@/components/landing/testimonial-section';
import { CtaSection } from '@/components/landing/cta-section';

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
      {/* 1. Hero with Dashboard Mockup */}
      <HeroSection />

      {/* 2. 6-column Feature Cards */}
      <FeaturesGrid />

      {/* 3. Learning Journey Step-Flow */}
      <JourneySection />

      {/* 4. DSA + Development dark showcase cards */}
      <DualShowcase />

      {/* 5. College / Trainer section */}
      <CollegeSection />

      {/* 6. Testimonial + Stats band */}
      <TestimonialSection />

      {/* 7. Dark green CTA Banner */}
      <CtaSection />
    </main>
    <Footer />
  </>
  );
}
