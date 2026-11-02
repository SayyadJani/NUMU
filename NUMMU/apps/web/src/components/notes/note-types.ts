import { Layers, Code2, Server, Sparkles, FileText } from 'lucide-react';
import type { NoteCategory, NoteColor } from '@/services/notes.service';

export const CATEGORIES: { id: NoteCategory; label: string; icon: React.ElementType }[] = [
  { id: 'all', label: 'All Notes', icon: Layers },
  { id: 'dsa', label: 'DSA & Algorithms', icon: Code2 },
  { id: 'system-design', label: 'System Design', icon: Server },
  { id: 'web-dev', label: 'Web Dev & Fullstack', icon: Layers },
  { id: 'interview', label: 'Interview Prep', icon: Sparkles },
  { id: 'cheatsheet', label: 'Cheatsheets', icon: FileText },
];

export const COLOR_MAP: Record<
  NoteColor,
  {
    border: string;
    bg: string;
    badgeBg: string;
    badgeText: string;
    accent: string;
    dot: string;
  }
> = {
  emerald: {
    border: 'border-emerald-200 hover:border-emerald-300',
    bg: 'bg-white hover:bg-emerald-50/20',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-800 border-emerald-200',
    accent: 'bg-emerald-500',
    dot: 'bg-emerald-500',
  },
  blue: {
    border: 'border-blue-200 hover:border-blue-300',
    bg: 'bg-white hover:bg-blue-50/20',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-800 border-blue-200',
    accent: 'bg-blue-500',
    dot: 'bg-blue-500',
  },
  purple: {
    border: 'border-purple-200 hover:border-purple-300',
    bg: 'bg-white hover:bg-purple-50/20',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-800 border-purple-200',
    accent: 'bg-purple-500',
    dot: 'bg-purple-500',
  },
  amber: {
    border: 'border-amber-200 hover:border-amber-300',
    bg: 'bg-white hover:bg-amber-50/20',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-800 border-amber-200',
    accent: 'bg-amber-500',
    dot: 'bg-amber-500',
  },
  rose: {
    border: 'border-rose-200 hover:border-rose-300',
    bg: 'bg-white hover:bg-rose-50/20',
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-800 border-rose-200',
    accent: 'bg-rose-500',
    dot: 'bg-rose-500',
  },
  slate: {
    border: 'border-slate-200 hover:border-slate-300',
    bg: 'bg-white hover:bg-slate-50/50',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-800 border-slate-200',
    accent: 'bg-slate-500',
    dot: 'bg-slate-500',
  },
};
