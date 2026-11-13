'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Check,
  ChevronDown,
  Code2,
  Cpu,
  Filter,
  FolderGit2,
  Sparkles,
  Trophy,
  UserCheck,
} from 'lucide-react';
import {
  AFTER_SIGNUP,
  CASE_STUDIES,
  COMPARISON,
  FAQS,
  FUNNEL,
  PILLARS,
  PLANS,
  TIMELINE,
  TRACKS,
} from '@/data/landing-content';
import {
  LANDING_BENTO_IMAGES,
  LANDING_CAMPUS_IMAGES,
  LANDING_PILLAR_IMAGES,
} from '@/lib/constants/assets';
import { Logo } from '@/components/ui/logo';

type Href = React.ComponentProps<typeof Link>['href'];

const CONTAINER = 'mx-auto w-full max-w-6xl px-5 sm:px-8';
const SECTION = 'py-16 lg:py-22';
const H2 =
  'font-heading font-bold text-flx-text text-[1.6rem] leading-[2.1rem] sm:text-[2.2rem] sm:leading-[2.7rem] tracking-[-0.01em]';

function RedCircleX({ className = 'size-5 text-[#dc2626]' }: { className?: string }) {
  return (
    <svg className={`shrink-0 ${className}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor">
      <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm37.66,130.34a8,8,0,0,1-11.32,11.32L128,139.31l-26.34,26.35a8,8,0,0,1-11.32-11.32L116.69,128,90.34,101.66a8,8,0,0,1,11.32-11.32L128,116.69l26.34-26.35a8,8,0,0,1,11.32,11.32L139.31,128Z" />
    </svg>
  );
}

function GreenCircleCheck({ className = 'size-5 text-[#10b981]' }: { className?: string }) {
  return (
    <svg className={`shrink-0 ${className}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor">
      <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm45.66,85.66-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35a8,8,0,0,1,11.32,11.32Z" />
    </svg>
  );
}

/* ─── 2. Meet NUMU – Sticky Stacking Pastel Cards ───────────────── */
const PILLAR_PASTELS = [
  'bg-flx-pastel-yellow',
  'bg-flx-pastel-lavender',
  'bg-flx-pastel-green',
  'bg-flx-pastel-pearl',
] as const;

export function PillarsSection() {
  return (
    <section className={`${SECTION} bg-flx-surface`}>
      <div className={`${CONTAINER} mb-12 text-center`}>
        {/* 3 Red-X Comparison Pills */}
        <div className="mb-5 flex flex-wrap items-center justify-center gap-2">
          {['Not just a static DSA sheet.', 'Not just passive video lectures.', 'Not just a quiz portal.'].map(
            (pill) => (
              <span
                key={pill}
                className="inline-flex items-center gap-1.5 rounded-full border border-flx-border bg-flx-muted px-3.5 py-1 text-xs font-medium text-flx-text-muted sm:text-sm"
              >
                <RedCircleX className="size-3.5 text-[#dc2626]" />
                {pill}
              </span>
            )
          )}
        </div>

        <h2 className={`${H2} mx-auto max-w-3xl`}>
          Meet NUMU: <span className="flx-highlight select-none">the 4-in-1 workspace</span> built for engineering
          careers.
        </h2>

        <p className="mx-auto mt-3 max-w-2xl text-sm text-flx-text-muted sm:mt-4 sm:text-base">
          Everything in your NUMU workspace works together—from expandable DSA topic accordions and our Judge0 IDE
          to Full-Stack Development, System Design, Core CS, and proctored assessments.
        </p>

        <div className="mt-6">
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-flx-primary px-7 py-3 text-sm font-semibold text-flx-accent transition-colors hover:bg-flx-secondary"
          >
            Explore the NUMU Workspace
          </Link>
        </div>
      </div>

      {/* 4 Sticky Stacking Pastel Cards */}
      <div className={`${CONTAINER} flex flex-col gap-6`}>
        {PILLARS.map((p, idx) => (
          <div
            key={p.id}
            className="md:sticky"
            style={{ top: `calc(5rem + ${idx * 0.85}rem)`, zIndex: 10 + idx }}
          >
            <div className={`overflow-hidden rounded-2xl border border-flx-border/60 shadow-sm ${PILLAR_PASTELS[idx % PILLAR_PASTELS.length]}`}>
              <div className="grid lg:grid-cols-12 lg:items-center">
                {/* Left Visual Box (5 cols) */}
                <div className="relative flex items-center justify-center p-5 sm:p-7 lg:col-span-5 lg:p-8">
                  <div className="relative flex aspect-[4/3] w-full max-w-[380px] items-center justify-center overflow-hidden rounded-xl bg-flx-primary shadow-md border border-black/10">
                    <img
                      src={LANDING_PILLAR_IMAGES[idx % LANDING_PILLAR_IMAGES.length]}
                      alt={p.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>

                {/* Right Copy + Highlights + Quote (7 cols) */}
                <div className="flex flex-col justify-center px-5 pb-6 sm:px-7 sm:pb-8 lg:col-span-7 lg:px-10 lg:py-8">
                  <span className="mb-2 inline-block w-fit rounded-full bg-flx-surface/80 px-3 py-0.5 text-[0.68rem] font-extrabold uppercase tracking-wider text-flx-text border border-flx-border/50">
                    {p.badge}
                  </span>
                  <h3 className="mb-2 font-heading text-xl font-bold text-flx-text sm:text-[1.75rem] sm:leading-[2.2rem]">
                    {p.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-flx-text-muted sm:text-[0.95rem]">{p.body}</p>

                  {/* Feature highlight chips */}
                  <div className="mt-3.5 flex flex-wrap gap-2">
                    {p.highlights.map((h) => (
                      <span
                        key={h}
                        className="inline-flex items-center gap-1.5 rounded-full bg-flx-surface/90 px-3 py-1 text-xs font-semibold text-flx-text border border-flx-border/60"
                      >
                        <Check className="size-3.5 text-[#10b981]" strokeWidth={3} />
                        {h}
                      </span>
                    ))}
                  </div>

                  <div className="mt-5 border-t border-flx-border/50 pt-4">
                    <p className="text-xs sm:text-sm italic leading-relaxed text-flx-text-muted">
                      &ldquo;{p.quote}&rdquo;
                    </p>
                    <div className="mt-2.5 flex items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-flx-primary font-heading text-xs font-bold text-flx-accent">
                        {p.author
                          .split(' ')
                          .map((w) => w[0])
                          .join('')}
                      </div>
                      <div>
                        <p className="font-heading text-xs sm:text-sm font-bold text-flx-text">{p.author}</p>
                        <p className="text-[11px] text-flx-text-muted">
                          {p.role} · {p.org}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── 3. Built for Daily Consistency (Dark Green Bento) ─────────── */
function BentoCard({
  title,
  body,
  bg,
  image,
}: {
  title: string;
  body: string;
  bg: string;
  image: string;
}) {
  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-flx-border bg-flx-surface shadow-sm">
      <div className={`relative flex h-44 w-full items-center justify-center overflow-hidden p-3.5 ${bg}`}>
        <img
          src={image}
          alt={title}
          className="h-full w-full rounded-xl bg-white object-contain shadow-xs border border-black/5"
          loading="lazy"
        />
      </div>
      <div className="flex flex-col gap-1 bg-flx-surface px-5 pt-3.5 pb-4">
        <h3 className="font-heading text-lg font-bold text-flx-text">{title}</h3>
        <p className="text-xs leading-relaxed text-flx-text-muted sm:text-sm">{body}</p>
      </div>
    </div>
  );
}

export function AfterSignupSection() {
  const c0 = AFTER_SIGNUP[0]!;
  const c1 = AFTER_SIGNUP[1]!;
  const c2 = AFTER_SIGNUP[2]!;
  const c3 = AFTER_SIGNUP[3]!;
  const c4 = AFTER_SIGNUP[4]!;
  const c5 = AFTER_SIGNUP[5]!;

  return (
    <section className={`${SECTION} bg-flx-primary flex flex-col gap-10`}>
      <div className={`${CONTAINER} flex flex-col items-center gap-2.5 text-center`}>
        <h2 className="font-heading text-[1.6rem] font-bold leading-[2.1rem] text-white sm:text-[2.2rem] sm:leading-[2.7rem]">
          Engineered to keep you consistent every single day.
        </h2>
        <p className="max-w-xl text-sm text-white/75 sm:text-base">
          Signing up is easy; staying consistent for 12 weeks is hard.
          <br />
          Every tool inside your NUMU dashboard is built to turn daily practice into a habit.
        </p>
      </div>

      <div className={CONTAINER}>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* Col 1 */}
          <div className="flex flex-col gap-5">
            <BentoCard title={c0.title} body={c0.body} bg="bg-flx-pastel-yellow" image={LANDING_BENTO_IMAGES[0]} />
            <BentoCard title={c1.title} body={c1.body} bg="bg-flx-pastel-pearl" image={LANDING_BENTO_IMAGES[1]} />
          </div>

          {/* Col 2 */}
          <div className="flex flex-col gap-5">
            <BentoCard title={c2.title} body={c2.body} bg="bg-flx-pastel-lavender" image={LANDING_BENTO_IMAGES[2]} />
            <BentoCard title={c3.title} body={c3.body} bg="bg-flx-pastel-red" image={LANDING_BENTO_IMAGES[3]} />
            <Link
              href="/register"
              className="inline-flex w-full items-center justify-between rounded-2xl bg-flx-accent px-5 py-4 font-heading text-lg font-bold text-[#082c1c] transition-colors hover:brightness-95"
            >
              <span>Launch your developer dashboard</span>
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#082c1c] text-white">
                <ArrowRight className="size-5" />
              </span>
            </Link>
          </div>

          {/* Col 3 */}
          <div className="flex flex-col gap-5">
            <BentoCard title={c4.title} body={c4.body} bg="bg-flx-pastel-green" image={LANDING_BENTO_IMAGES[4]} />
            <BentoCard title={c5.title} body={c5.body} bg="bg-flx-pastel-blue" image={LANDING_BENTO_IMAGES[5]} />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── 4. Plans for Students & Campuses (Dark Frame + Pastel Inner) */
const PLAN_PASTELS = ['bg-flx-pastel-blue', 'bg-flx-pastel-green', 'bg-flx-pastel-yellow'] as const;

export function PlansSection() {
  return (
    <section id="pricing" className={`${SECTION} scroll-mt-24 bg-flx-surface`}>
      <div className={`${CONTAINER} flex flex-col items-center gap-10`}>
        <h2 className={`${H2} text-center`}>Flexible plans for students &amp; colleges.</h2>

        <div className="mx-auto grid w-full grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {PLANS.map((plan, idx) => (
            <div
              key={plan.name}
              className="flex flex-col gap-2 rounded-xl bg-flx-primary pb-1 pl-1 pr-1 pt-2"
            >
              <span className="text-center text-xs text-white/75">
                Built for <strong className="font-semibold text-white">{plan.ideal}</strong>
              </span>

              <div
                className={`flex flex-1 flex-col justify-between gap-6 rounded-xl p-6 sm:p-7 ${
                  PLAN_PASTELS[idx % PLAN_PASTELS.length]
                }`}
              >
                <div className="flex flex-col gap-3">
                  <h3 className="font-heading text-2xl font-bold tracking-tight text-flx-text sm:text-3xl">
                    {plan.name}
                  </h3>
                  <p className="text-sm font-medium text-flx-text-muted sm:text-base">{plan.tagline}</p>

                  <div className="mt-3 flex flex-col gap-2.5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-flx-text-subtle">
                      Included in this track:
                    </p>
                    <ul className="flex flex-col gap-2.5">
                      {plan.points.map((pt) => (
                        <li key={pt} className="flex items-start gap-2.5 text-sm text-flx-text">
                          <span className="mt-1.5 size-2.5 shrink-0 rounded-full bg-[#10b981]" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {plan.href.startsWith('#') ? (
                  <a
                    href={plan.href}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-flx-secondary py-3 text-sm font-semibold text-white transition-colors hover:bg-flx-primary"
                  >
                    {plan.cta}
                    <ArrowRight className="size-4" />
                  </a>
                ) : (
                  <Link
                    href={plan.href as Href}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-flx-secondary py-3 text-sm font-semibold text-white transition-colors hover:bg-flx-primary"
                  >
                    {plan.cta}
                    <ArrowRight className="size-4" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── 5. Structured Learning Funnel ────────────────────────────── */
const FUNNEL_WIDTHS = ['w-full md:w-[92%]', 'w-[96%] md:w-[82%]', 'w-[92%] md:w-[72%]', 'w-[88%] md:w-[62%]'];
const FUNNEL_ICONS = [Filter, Sparkles, Code2, UserCheck];

export function FunnelSection() {
  const steps = FUNNEL.slice(0, 4);
  return (
    <section className={`${SECTION} bg-flx-primary`}>
      <div className={`${CONTAINER} flex flex-col items-center gap-10`}>
        <div className="flex flex-col items-center gap-2.5 text-center">
          <h2 className="font-heading text-[1.6rem] font-bold leading-[2.1rem] text-white sm:text-[2.2rem] sm:leading-[2.7rem]">
            How NUMU turns practice into
            <br />
            verified placement readiness
          </h2>
          <p className="max-w-xl text-sm text-white/75 sm:text-base">
            Instead of overwhelming you with thousands of unorganized questions, our curriculum narrows your focus to
            the exact patterns and skills tested in technical rounds.
          </p>
        </div>

        <div className="flex w-full max-w-4xl flex-col items-center gap-3.5">
          {steps.map((step, i) => {
            const Icon = FUNNEL_ICONS[i % FUNNEL_ICONS.length]!;
            return (
              <div
                key={step.title}
                className={`flex flex-row items-center gap-3 rounded-xl border border-flx-border bg-flx-surface p-2.5 text-left shadow-sm sm:gap-4 sm:p-3.5 ${FUNNEL_WIDTHS[i]}`}
              >
                <span className="flex shrink-0 items-center self-stretch rounded-lg border border-flx-accent/40 bg-flx-pastel-green px-3 font-heading text-base font-bold text-flx-text sm:px-4 sm:text-lg">
                  {step.value}
                </span>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="font-heading text-sm font-bold text-flx-text sm:text-base">{step.title}</span>
                  <span className="text-xs text-flx-text-muted">{step.body}</span>
                </div>
                <span className="hidden size-9 shrink-0 items-center justify-center rounded-lg border border-flx-accent/40 bg-flx-pastel-green sm:flex">
                  <Icon className="size-4.5 text-flx-text" />
                </span>
              </div>
            );
          })}

          {/* Final Gold Outcome Card */}
          <div className="flex w-[80%] flex-row items-center gap-3 rounded-xl bg-flx-gold p-3 text-left sm:gap-4 sm:p-3.5 md:w-[46%]">
            <span className="shrink-0 rounded-lg border border-[#082c1c]/20 bg-[#082c1c] px-3 py-1.5 text-center font-heading text-sm font-bold leading-tight text-flx-gold sm:px-3.5 sm:text-base">
              <span className="block">Offer</span>
              <span className="block">Ready</span>
            </span>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="font-heading text-sm font-bold text-[#082c1c] sm:text-base">
                Verified Placement Readiness
              </span>
              <span className="text-xs text-[#082c1c]/80">
                Backed by your live NUMU portfolio &amp; test rating
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-2.5">
          {['Judge0 sandbox execution', '4-track unified curriculum', 'Shareable /profile/username'].map((b) => (
            <span
              key={b}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-white sm:text-sm"
            >
              <Check className="size-3.5 text-flx-accent" strokeWidth={3} />
              {b}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── 6. Curriculum Topics Marquee ─────────────────────────────── */
export function TracksSection() {
  const rows = [TRACKS, [...TRACKS].reverse()];
  return (
    <section id="tracks" className={`${SECTION} scroll-mt-24 overflow-hidden bg-flx-surface`}>
      <div className="flex flex-col items-center gap-8">
        <h2 className={`${H2} text-center`}>Topics &amp; modules across your 4 practice hubs.</h2>

        <div className="flex w-full flex-col gap-3.5">
          {rows.map((row, r) => (
            <div
              key={r}
              className="w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]"
            >
              <div
                className="flx-marquee flex w-max gap-3"
                style={r === 1 ? { animationDirection: 'reverse', animationDuration: '50s' } : undefined}
              >
                {[...row, ...row, ...row].map((t, i) => (
                  <span
                    key={`${t}-${i}`}
                    className="whitespace-nowrap rounded-full bg-flx-pastel-green px-4 py-2 text-sm font-semibold text-flx-text border border-flx-border/50"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── 7. Step-by-Step Student Journey (Dark Green + 01..04 Tabs) ─ */
export function TimelineSection() {
  const [active, setActive] = React.useState(0);
  const step = TIMELINE[active] ?? TIMELINE[0];
  const icons = [Code2, FolderGit2, Cpu, Trophy];
  const StepIcon = icons[active % icons.length]!;

  return (
    <section className={`${SECTION} bg-flx-primary`}>
      <div className={CONTAINER}>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
          {/* Left Column */}
          <div className="flex flex-col gap-6 lg:col-span-7">
            <h2 className="font-heading text-[1.6rem] font-bold leading-[2.1rem] text-white sm:text-[2.2rem] sm:leading-[2.7rem]">
              Your roadmap from day one
              <br />
              to placement offer.
            </h2>

            {/* 4 Numbered Tabs */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {TIMELINE.map((t, i) => {
                const isActive = i === active;
                return (
                  <button
                    key={t.when}
                    type="button"
                    onClick={() => setActive(i)}
                    className="group flex cursor-pointer items-start gap-2 text-left"
                  >
                    <span
                      className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition-colors ${
                        isActive
                          ? 'border-flx-accent bg-flx-accent text-[#082c1c]'
                          : 'border-white/30 text-white/50'
                      }`}
                    >
                      0{i + 1}
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                      <span
                        className={`text-xs font-semibold uppercase tracking-wider transition-colors ${
                          isActive ? 'text-white' : 'text-white/50'
                        }`}
                      >
                        {t.when}
                      </span>
                      <div className="h-0.5 w-full overflow-hidden rounded-full bg-white/10">
                        <div className={`h-full rounded-full bg-flx-accent transition-all duration-500 ${isActive ? 'w-full' : 'w-0'}`} />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active Step Copy */}
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <h3 className="font-heading text-lg font-bold text-white sm:text-xl">{step.title}</h3>
                <p className="max-w-xl text-sm leading-relaxed text-white/75 sm:text-base">{step.body}</p>
              </div>

              <div className="flex flex-col gap-1.5 text-sm">
                <div className="flex gap-2.5">
                  <span className="shrink-0 font-bold text-white">Your action:</span>
                  <span className="text-white/75">{step.you}</span>
                </div>
                <div className="flex gap-2.5">
                  <span className="shrink-0 font-bold text-white">NUMU workspace:</span>
                  <span className="text-white/75">{step.we}</span>
                </div>
              </div>

              <Link
                href="/register"
                className="inline-flex w-fit items-center justify-center gap-2 rounded-full bg-flx-accent px-7 py-3 text-sm font-bold text-[#082c1c] transition-colors hover:brightness-95"
              >
                Start Your Roadmap
              </Link>
            </div>
          </div>

          {/* Right Column Visual Card */}
          <div className="lg:col-span-5">
            <div className="relative flex min-h-[280px] items-center justify-center overflow-hidden rounded-2xl bg-flx-pastel-green p-6">
              <div className="w-full rounded-2xl bg-flx-surface p-5 shadow-xl border border-flx-border">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-flx-accent text-[#082c1c]">
                    <StepIcon className="size-5" />
                  </span>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-flx-text-subtle">{step.when}</span>
                    <p className="font-heading text-base font-bold text-flx-text">{step.title}</p>
                  </div>
                </div>
                <div className="space-y-2 border-t border-flx-border pt-3.5 text-xs text-flx-text-muted">
                  <div className="flex items-center justify-between gap-2 rounded-lg bg-flx-muted px-3 py-2">
                    <span className="font-semibold text-flx-text">Student Focus</span>
                    <span className="text-right">{step.you}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 rounded-lg bg-flx-pastel-green px-3 py-2">
                    <span className="font-semibold text-flx-text">NUMU Platform</span>
                    <span className="text-right font-semibold text-flx-text">{step.we}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── 8. Comparison Table (Original NUMU Logo in Lime Column) ──── */
export function ComparisonSection() {
  return (
    <section className={`${SECTION} bg-flx-surface`}>
      <div className={`${CONTAINER} flex flex-col items-center gap-10`}>
        <h2 className={`${H2} text-center`}>Why engineering students switch to NUMU?</h2>

        <div className="w-full overflow-x-auto pb-4">
          <table className="w-full min-w-[660px] border-separate border-spacing-0 text-left text-sm">
            <thead>
              <tr>
                <th className="px-4 py-3.5 font-heading text-base font-bold text-flx-text sm:px-5 sm:text-lg">
                  Platform Capability
                </th>
                <th className="rounded-t-xl bg-flx-accent px-4 pt-4 pb-3 text-center sm:px-5">
                  <div className="inline-flex items-center justify-center rounded-xl bg-white px-3.5 py-1.5 shadow-xs">
                    <Logo size="sm" theme="light" />
                  </div>
                </th>
                <th className="px-4 py-3.5 font-heading text-base font-bold text-flx-text sm:px-5 sm:text-lg">
                  {COMPARISON.columns[1]}
                </th>
                <th className="px-4 py-3.5 font-heading text-base font-bold text-flx-text sm:px-5 sm:text-lg">
                  {COMPARISON.columns[2]}
                </th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.rows.map((row, idx) => {
                const isFirst = idx === 0;
                const isLast = idx === COMPARISON.rows.length - 1;
                return (
                  <tr key={row.label}>
                    <td
                      className={`border-t border-white/10 bg-flx-primary px-4 py-3.5 font-semibold text-white sm:px-5 ${
                        isFirst ? 'rounded-tl-xl' : ''
                      } ${isLast ? 'rounded-bl-xl' : ''}`}
                    >
                      {row.label}
                    </td>
                    <td
                      className={`border-t border-[#082c1c]/10 bg-flx-accent px-4 py-3.5 font-semibold text-[#082c1c] sm:px-5 ${
                        isLast ? 'rounded-b-xl' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <GreenCircleCheck className="size-4.5 text-[#082c1c]" />
                        <span>{row.values[0]}</span>
                      </div>
                    </td>
                    <td className="border-t border-white/10 bg-flx-primary px-4 py-3.5 text-white/75 sm:px-5">
                      <div className="flex items-center gap-2">
                        <RedCircleX className="size-4.5 text-[#dc2626]" />
                        <span>{row.values[1]}</span>
                      </div>
                    </td>
                    <td
                      className={`border-t border-white/10 bg-flx-primary px-4 py-3.5 text-white/75 sm:px-5 ${
                        isFirst ? 'rounded-tr-xl' : ''
                      } ${isLast ? 'rounded-br-xl' : ''}`}
                    >
                      <div className="flex items-center gap-2">
                        <RedCircleX className="size-4.5 text-[#dc2626]" />
                        <span>{row.values[2]}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

/* ─── 9. Campus & Cohort Impact Stories ────────────────────────── */
const CS_PASTELS = ['bg-flx-pastel-green', 'bg-flx-pastel-blue', 'bg-flx-pastel-yellow'] as const;

export function CaseStudiesSection() {
  return (
    <section id="colleges" className={`${SECTION} scroll-mt-24 bg-flx-surface`}>
      <div className={CONTAINER}>
        <h2 className={`${H2} mx-auto mb-10 max-w-3xl text-center`}>
          How colleges &amp; developer cohorts scale placement prep with NUMU.
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {CASE_STUDIES.map((cs, idx) => (
            <article key={cs.title} className="flex flex-col gap-4 rounded-2xl border border-flx-border bg-flx-muted/40 p-4">
              {/* 4:3 Banner Card */}
              <div
                className={`relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-flx-border ${
                  CS_PASTELS[idx % CS_PASTELS.length]
                }`}
              >
                <img
                  src={LANDING_CAMPUS_IMAGES[idx % LANDING_CAMPUS_IMAGES.length]}
                  alt={cs.title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                <div className="absolute bottom-2.5 left-2.5 rounded-lg bg-[#082c1c]/90 px-3 py-1 backdrop-blur-xs">
                  <p className="font-heading text-xs font-bold text-flx-accent">{cs.stat}</p>
                </div>
              </div>

              {/* Org Info */}
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-flx-border bg-flx-surface font-heading text-sm font-bold text-flx-text">
                  {cs.org[0]}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-flx-text">{cs.org}</span>
                  <div className="flex items-center gap-1.5 text-xs text-flx-text-subtle">
                    <span>{cs.meta[0]}</span>
                    <span className="size-1 rounded-full bg-flx-text-subtle" />
                    <span>{cs.meta[1]}</span>
                  </div>
                </div>
              </div>

              {/* Title */}
              <h3 className="font-heading text-base font-bold leading-snug text-flx-text sm:text-lg">
                {cs.title}
              </h3>

              {/* CTA */}
              <Link
                href="/register"
                className="mt-auto w-fit rounded-full bg-flx-secondary px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-flx-primary"
              >
                Explore platform
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── 10. FAQ Section ──────────────────────────────────────────── */
export function FaqSection() {
  const [open, setOpen] = React.useState<number | null>(0);
  const half = Math.ceil(FAQS.length / 2);
  const cols = [FAQS.slice(0, half), FAQS.slice(half)];

  return (
    <section className={`${SECTION} bg-flx-surface`}>
      <div className={`${CONTAINER} flex flex-col items-center gap-8`}>
        <h2 className={`${H2} text-center`}>Frequently asked questions.</h2>
        <div className="grid w-full grid-cols-1 items-start gap-x-12 lg:grid-cols-2">
          {cols.map((col, cIdx) => (
            <div key={cIdx} className="flex flex-col divide-y divide-flx-border">
              {col.map((item, rIdx) => {
                const idx = cIdx * half + rIdx;
                const isOpen = open === idx;
                return (
                  <div key={item.q} className="py-4">
                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? null : idx)}
                      className="flex w-full cursor-pointer items-center justify-between gap-4 text-left"
                      aria-expanded={isOpen}
                    >
                      <span className="font-heading text-base font-bold text-flx-text">{item.q}</span>
                      <ChevronDown
                        className={`size-4.5 shrink-0 text-flx-text-muted transition-transform duration-200 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <p className="mt-2.5 text-sm leading-relaxed text-flx-text-muted">{item.a}</p>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
