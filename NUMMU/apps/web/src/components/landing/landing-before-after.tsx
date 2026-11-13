'use client';

import React from 'react';
import {
  BookOpen,
  Code2,
  Cpu,
  Database,
  FileSpreadsheet,
  FileText,
  Laptop,
  Play,
  StickyNote,
  Terminal,
  Trophy,
} from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { WITHOUT_NUMU, WITH_NUMU } from '@/data/landing-content';

const WAVY_PATH =
  'M63.3 105.5C63.4 97.6 59.5 83.8 66.8 73.6C71.7 66.8 76.4 63.9 84.3 61.3C91.3 59 98 59.1 103 60.2C107.1 61.2 107.6 66.1 109.8 77.7C111.8 88.4 114.8 108.7 117.1 121.1C121.2 143.4 126.8 148.6 132.8 153.1C138.3 157.3 146.7 158.8 173.8 160.7C184 161.5 191.7 158.5 200.8 154.5C206.3 152.2 212.9 148.1 219.9 143C234.3 132.4 244.1 121.3 249.4 114.3C256 105.6 258 96.1 259.2 82C260.1 71.8 252.3 64.3 246.5 58.4C241.5 53.4 235.4 51.8 224.4 51C213.4 50.3 202.7 60.3 194 67.9C187.4 73.7 186.8 83.3 186.5 92.6C186.3 97.7 189.3 105.9 193.5 116.3C197.3 125.8 201.5 131.7 206.3 137.2C221.6 154.8 228 156.2 235.5 157.3C245.4 158.7 256.8 153.4 267.9 147.5C280.1 141 288.1 127.3 291.6 119.4C296.8 107.9 293.8 98 289.8 91.1C283.7 80.8 277 78.1 272.2 75.7C268 73.6 262.7 73.9 257.5 75.5C254.3 76.5 252.4 81 250.3 85.6C248.1 90.7 246.9 103.4 245.1 119.2C244.2 127.8 241.7 133.9 238.8 140C237 144 234.1 146 226.4 149.3C220.2 152 208.7 155.3 195.8 157.9C182.9 160.6 168.6 162 160.4 162.6C150.3 163.4 146.7 162.1 143.5 160.4C137.4 157.1 134.4 148.9 132.7 138.1C132 133.9 132.5 127.6 134.2 116.5C135.9 105.5 139.2 89.8 141.1 78.2C144 59.7 143.6 51.5 144.4 49.8C146.4 46 162.8 44.8 173.1 49.2C181.1 52.7 186.3 59.2 189.5 64.4C190.8 66.5 190.9 68.9 190.9 71.2C190.9 76.2 184 81.2 174.3 86.8C171.6 88.3 168.4 89.3 156.8 92.1C145.2 95 125.1 99.4 111.8 102.9C84.1 110.2 78.4 116.5 73.9 122.4C67.4 131 67.7 152 68.5 165C69 173.9 74.6 180.6 79.8 185.9C85 191.2 99.2 195 99.2 195C99.2 195 124.3 202.9 138.7 197.3C149.8 192.9 162.1 177.4 162.1 177.4C162.1 177.4 174.3 157.6 178.7 149.1C182.4 142 187.6 140.5 191.6 138.9C197.6 136.7 205.9 139.1 210.4 141.9C212.6 143.3 217.2 149.8 224.7 160.9C237.3 179.7 236.6 189 235.6 195.5C234.5 202 225.1 205.4 217.7 209.1C211.2 212.4 202.7 211.6 197.4 209.6C195 208.6 196 204.4 196.3 201.6C196.6 198.3 199 194.5 203.5 188.9C210.4 180.1 221.8 171.5 233.7 163.5C244.5 156.2 254.5 152.6 264 148.4C287.4 138 292.3 135.3 301.9 134.9C305.7 134.7 309.1 136 317.2 141C335.1 152.1 346.8 162.1 348.8 164.2C352.5 168.3 354.3 174.9 354.9 181.5C355.2 184.2 353.1 186 351.5 187.2C345.8 191.3 334.5 192.8 322.1 193.4C315.2 193.7 311.1 189.7 308.2 186.2C303.6 180.8 303 173.8 302.4 160.2C302.2 156.2 304 153.9 305.9 151.7C310.2 146.6 322.3 143.2 341.9 134.4C354 129 369.4 119.1 378.6 113.3C390.6 105.8 393.6 102.5 394.9 100.7C398.1 95.9 395.8 86.6 393.9 80.7C392.2 75.3 388.3 71.8 384.7 68.7C380.9 65.5 368 65 358.6 65.4C351.5 65.7 345.5 70.2 337.4 77.2C328.8 84.7 326 91.9 321.5 94.5C315.7 97.9 306.2 96.5 290.4 91.3C281.4 88.3 267.4 79.1 258.1 73.6C239.5 62.6 237.7 57.9 236.3 53.6C234.8 49.1 241.9 45.1 247.9 41.5C257.4 35.8 276.1 39 287.2 43C300 47.7 310.8 53.5 318.6 55C333.9 58 340 54.7 348 49.8C354.4 45.9 358.7 39.4 361.1 35.5C363.3 31.9 362.4 26.1 359.3 18.8C355.9 10.4 348.2 6.2 341.8 3.7C334.7 1 321.8 6.5 311 13C301.7 18.6 295.5 26.2 290.8 32.3C284.3 40.7 281.2 47.6 280.5 50.7C278.8 59.4 285.4 73.2 289.2 84.6C291.2 90.5 290 96.2 288.8 99.8C286.4 107.2 276 110.8 266.8 113.8C255.6 117.5 240 115.1 224.5 111.5C220.7 110.6 217.3 108.7 210.2 102.8C203.2 96.8 192.6 86.4 185.5 72.7C178.4 58.9 181 46.7 172 33C169.2 28.8 168.1 25.7 164 22.7C153.5 14.9 139.8 21.6 130.8 25.6C126.3 27.7 123.6 35.6 120.4 45.3C114.7 62.8 120 73.2 124.1 81.1C128 88.7 136.9 92.3 146.5 95.6C153.7 98.1 163 97.9 171.3 97.6C175 97.5 177.6 96.7 189.9 91.5C202.2 86.3 224 76.4 242.7 69.4C261.5 62.5 276.4 58.8 296.2 56.6C315.9 54.4 340 53.7 353.8 53.6C375.6 53.5 384.6 58.4 392 62.8C400.1 67.8 404.9 78.9 409.6 89.5C411.8 94.6 412.1 100.5 412.9 107.7C414.5 122.9 410.4 131.6 411.5 146.8C411.5 146.8 411.1 150.8 412.1 153C413.3 155.5 415.1 156.3 417.6 157.6C425.9 162.2 441.1 160 450 157C459.1 154 463.5 144.5 465.1 136.4C467.5 123.7 467.7 118 463.8 107.3C460 96.6 455.7 90.1 446.1 84C434.9 76.9 422.2 69.9 412.5 78.9C406.4 84.5 407.6 90.9 405.9 98.9C402.5 114 404.8 125.8 405 138.5C405.3 158.9 406.9 168.5 406.7 172C406.2 179.2 395.2 186.8 386.4 192C378.9 196.3 368.1 195.5 355.7 194.8C343.6 194.1 332.2 193.1 327.3 182C325.7 178.4 325.8 176 325.4 172.1C323.8 158.8 327.3 151.9 330.8 138.3C334.6 123.8 339.3 119.8 342.6 117.4C347.7 113.7 358.3 116.2 364.1 118.5C371.2 121.2 373.7 128.5 377.6 139.9C380.8 149.2 384.9 166 387.8 175.6C391.3 187.6 393.4 190.5 395 192.2C396.8 194.2 399.5 194.8 401.7 194.9C407.1 195.2 417.2 186.5 426.1 177.1C434 168.6 435.3 155.3 436.6 139.4C437.1 133.9 435.3 130.1 433 126.5C425.9 115.4 409.1 108.4 400.4 106.2C392 104 383.8 109.5 374.2 117.2C368.7 121.6 364.3 127.9 358.7 137C355.1 142.9 351.1 151.8 346.7 162.2C337.6 184.1 332.7 198.2 330.5 201.6C325.3 209.3 317.4 214 312.6 215.8C304.6 218.9 291.9 215.6 284.4 213.2C279.5 211.6 272.2 205.5 262 196.3C256.6 191.4 251.7 184.8 242.6 177C233.6 169.1 220.9 159.9 213.2 154.5C205.6 149.1 203.3 148 187.6 142.8C171.9 137.5 142.8 128.3 118.9 122.7C95.1 117 77.5 115.2 65.6 114.3C48.1 112.9 40.8 114 37.9 115C35 115.9 32.9 117.9 30.8 120.4C28.6 122.9 19.6 131.7 17.2 141C13.7 154.6 18.2 164.9 25.7 176C31 183.9 37.5 186.4 45.8 190C50 191.7 64.5 192.5 86.1 193.1C95.6 193.3 101.9 192.3 116.1 187.7C130.3 183.2 152.2 174.9 164.4 170C178.8 164.3 184.2 160.1 190.9 154.5C196.9 149.4 199.9 144.9 201.3 142.6C202.6 140.5 206.1 126.4 211.1 106.3C213.2 97.9 217.5 91.6 223.5 82.9C227.2 77.6 230.8 75 237.1 71.5C248.4 65.1 259.8 62.1 267.5 60.6C277.2 58.6 284.9 59.5 289.7 60.7C306.9 69.1 323 79.4 328.5 80.5C330.3 80.7 332.4 80.7 334.6 80.8';

const CHAOS_TILES = [
  { label: 'Videos', Icon: Play, cls: 'bg-[#ef4444] text-white', top: '7%', left: '19%' },
  { label: '450 Sheet', Icon: FileSpreadsheet, cls: 'bg-[#16a34a] text-white', top: '9%', left: '44%' },
  { label: 'PDFs', Icon: FileText, cls: 'bg-[#2563eb] text-white', top: '18%', left: '68%' },
  { label: 'Notes', Icon: StickyNote, cls: 'bg-white text-[#1a1a1a]', top: '38%', left: '9%' },
  { label: 'Compiler', Icon: Terminal, cls: 'bg-[#f59e0b] text-[#1a1a1a]', top: '46%', left: '31%' },
  { label: 'SQL Docs', Icon: Database, cls: 'bg-[#7c3aed] text-white', top: '58%', left: '72%' },
  { label: 'Theory', Icon: BookOpen, cls: 'bg-[#0891b2] text-white', top: '71%', left: '17%' },
  { label: 'Quizzes', Icon: Trophy, cls: 'bg-white text-[#082c1c]', top: '75%', left: '40%' },
] as const;

const UNIFIED_SPOKES = [
  { label: 'DSA + Judge0', Icon: Code2, pos: 'top-4 left-5' },
  { label: 'Development', Icon: Laptop, pos: 'top-4 right-5' },
  { label: 'System Design', Icon: Cpu, pos: 'bottom-4 left-5' },
  { label: 'Core CS + OAs', Icon: Database, pos: 'bottom-4 right-5' },
] as const;

export function BeforeAfterSection() {
  return (
    <section className="py-20 lg:py-28 bg-flx-surface">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <h2 className="font-heading font-bold text-flx-text text-[1.75rem] leading-[2.25rem] sm:text-[2.5rem] sm:leading-[3rem] tracking-[-0.01em] mx-auto mb-12 max-w-4xl text-center">
          Every student wants to crack placements.
          <br />
          Few have a system that replaces the chaos.
        </h2>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* ── Without NUMU ── */}
          <div className="bg-flx-muted text-flx-text rounded-2xl p-6 sm:p-8 border border-flx-border/60">
            <h3 className="font-heading font-bold text-flx-text text-[1.25rem] leading-[1.75rem] mb-6 text-center">
              Scattered Prep (Without NUMU)
            </h3>

            <div className="relative h-72 mb-6 overflow-hidden rounded-xl bg-[#e5e5e5]">
              <div className="absolute inset-0 flex items-center justify-center p-2">
                <div className="relative w-full aspect-[478/245]">
                  <svg className="absolute inset-0 size-full" viewBox="0 0 478 245" fill="none">
                    <path
                      d={WAVY_PATH}
                      stroke="#b0b0b0"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                  {CHAOS_TILES.map(({ label, Icon, cls, top, left }) => (
                    <div
                      key={label}
                      className="absolute transition-transform duration-300 hover:scale-105"
                      style={{ top, left }}
                    >
                      <div
                        className={`flex size-14 flex-col items-center justify-center gap-0.5 rounded-xl shadow-md border border-black/5 ${cls}`}
                      >
                        <Icon className="size-5" />
                        <span className="text-[0.58rem] font-bold tracking-tight">{label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <ul className="flex flex-col gap-3">
              {WITHOUT_NUMU.map((item) => (
                <li key={item.strong} className="flex items-start gap-3">
                  <span className="mt-0.5 shrink-0">
                    <svg className="text-[#dc2626] size-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor">
                      <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm37.66,130.34a8,8,0,0,1-11.32,11.32L128,139.31l-26.34,26.35a8,8,0,0,1-11.32-11.32L116.69,128,90.34,101.66a8,8,0,0,1,11.32-11.32L128,116.69l26.34-26.35a8,8,0,0,1,11.32,11.32L139.31,128Z" />
                    </svg>
                  </span>
                  <span className="text-base text-flx-text-muted">
                    <strong className="font-semibold text-flx-text">{item.strong}</strong> {item.rest}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* ── With NUMU ── */}
          <div className="bg-flx-primary text-white rounded-2xl p-6 sm:p-8 shadow-xl">
            <h3 className="font-heading font-bold text-flx-accent text-[1.25rem] leading-[1.75rem] mb-6 text-center">
              Unified Workspace (With NUMU)
            </h3>

            <div className="relative h-72 mb-6 overflow-hidden rounded-xl bg-flx-secondary/45 flex items-center justify-center p-4">
              {/* Connector lines from corners to center */}
              <svg className="pointer-events-none absolute inset-0 size-full text-flx-accent/25" viewBox="0 0 400 260" fill="none">
                <line x1="80" y1="50" x2="200" y2="130" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
                <line x1="320" y1="50" x2="200" y2="130" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
                <line x1="80" y1="210" x2="200" y2="130" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
                <line x1="320" y1="210" x2="200" y2="130" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
              </svg>

              {/* 4 Corner Practice Track Pills */}
              {UNIFIED_SPOKES.map(({ label, Icon, pos }) => (
                <div
                  key={label}
                  className={`absolute ${pos} inline-flex items-center gap-1.5 rounded-full border border-flx-accent/30 bg-flx-primary/90 px-3 py-1.5 text-xs font-semibold text-white shadow-sm`}
                >
                  <Icon className="size-3.5 text-flx-accent" />
                  {label}
                </div>
              ))}

              {/* Center NUMU Original Logo Card */}
              <div className="relative z-10 flex flex-col items-center justify-center rounded-2xl bg-flx-surface px-7 py-4 shadow-[0_12px_36px_rgba(0,0,0,0.35)] ring-4 ring-flx-accent/40">
                <Logo size="md" theme="light" />
              </div>
            </div>

            <ul className="flex flex-col gap-3">
              {WITH_NUMU.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 shrink-0">
                    <svg className="text-flx-accent size-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor">
                      <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm45.66,85.66-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35a8,8,0,0,1,11.32,11.32Z" />
                    </svg>
                  </span>
                  <span className="text-base text-white/85">
                    <strong className="font-semibold text-white">One</strong> {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
