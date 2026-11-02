'use client';

import React, { useState, useMemo } from 'react';
import { Flame, Calendar, Clock, ChevronRight } from 'lucide-react';
import type { ActivityData, HeatmapDay } from '@/types/profile';

interface ContributionHeatmapProps {
  activity: ActivityData;
  title?: string;
  subtitle?: string;
  showTimelineLink?: boolean;
  onTimelineClick?: () => void;
  className?: string;
}

export function ContributionHeatmap({
  activity,
  title = 'Learning Activity & Heatmap',
  subtitle,
  showTimelineLink = false,
  onTimelineClick,
  className = '',
}: ContributionHeatmapProps) {
  const [hoveredCell, setHoveredCell] = useState<{
    date: string;
    count: number;
    dayOfWeek: string;
  } | null>(null);

  // Build a GitHub-style grid: columns are weeks (Sun → Sat), last column contains today.
  const { weeks, monthLabels } = useMemo(() => {
    const toKey = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Index incoming data by date (supports rich days and legacy boolean rows)
    const dayMap = new Map<string, HeatmapDay>();
    activity.heatmapDays?.forEach((row) =>
      row?.forEach((day) => {
        if (day?.date) dayMap.set(day.date, day);
      })
    );
    if (dayMap.size === 0 && activity.heatmapRows?.length) {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 52; c++) {
          if (!activity.heatmapRows[r]?.[c]) continue;
          const d = new Date(today);
          d.setDate(d.getDate() - ((51 - c) * 7 + (6 - r)));
          dayMap.set(toKey(d), { date: toKey(d), count: 1, level: 2 });
        }
      }
    }

    // 2. Start on the Sunday ~52 weeks ago so the grid ends on the current week
    const start = new Date(today);
    start.setDate(start.getDate() - 52 * 7);
    start.setDate(start.getDate() - start.getDay());

    const calculatedWeeks: { days: HeatmapDay[]; weekIndex: number }[] = [];
    const labels: { weekIndex: number; monthName: string; span: number }[] = [];
    const cursor = new Date(start);
    let weekIndex = 0;

    while (cursor <= today) {
      const days: HeatmapDay[] = [];
      for (let r = 0; r < 7; r++) {
        const key = toKey(cursor);
        const existing = dayMap.get(key);
        const isFuture = cursor > today;

        // Month label goes on the week containing the 1st of the month (GitHub rule)
        if (cursor.getDate() === 1 && !isFuture) {
          labels.push({
            weekIndex,
            monthName: cursor.toLocaleDateString('en-US', { month: 'short' }),
            span: 0,
          });
        }

        days.push({
          date: key,
          count: isFuture ? 0 : existing?.count ?? 0,
          level: isFuture ? 0 : existing?.level ?? 0,
          ...(existing?.solvedCount !== undefined && { solvedCount: existing.solvedCount }),
          isCurrentYear: cursor.getFullYear() === today.getFullYear(),
          isFuture,
        });
        cursor.setDate(cursor.getDate() + 1);
      }
      calculatedWeeks.push({ days, weekIndex });
      weekIndex++;
    }

    // Label the leading partial month too, if there is room before the next label
    const firstLabelWeek = labels[0]?.weekIndex ?? calculatedWeeks.length;
    if (firstLabelWeek >= 2) {
      labels.unshift({
        weekIndex: 0,
        monthName: start.toLocaleDateString('en-US', { month: 'short' }),
        span: 0,
      });
    }

    // Each label spans until the next label; drop labels too narrow to fit text
    labels.forEach((l, i) => {
      l.span = (labels[i + 1]?.weekIndex ?? calculatedWeeks.length) - l.weekIndex;
    });

    return { weeks: calculatedWeeks, monthLabels: labels.filter((l) => l.span >= 2) };
  }, [activity.heatmapDays, activity.heatmapRows]);

  const getCellColor = (level: HeatmapDay['level'] = 0, count: number = 0) => {
    if (count === 0 || level === 0) {
      return 'bg-slate-100/90 border border-slate-200/50 hover:bg-slate-200/80 hover:border-slate-300';
    }
    if (level === 1) {
      return 'bg-emerald-200 border border-emerald-300/70 hover:bg-emerald-300';
    }
    if (level === 2) {
      return 'bg-emerald-400 border border-emerald-500/70 hover:bg-emerald-500';
    }
    if (level === 3) {
      return 'bg-emerald-600 border border-emerald-700/70 hover:bg-emerald-700';
    }
    return 'bg-[#0b5c39] border border-[#08482c] hover:bg-[#073d25]';
  };

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]!, 10), parseInt(parts[1]!, 10) - 1, parseInt(parts[2]!, 10));
        return d.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const defaultSubtitle = `${activity.contributions} total contributions in the last 12 months`;

  return (
    <div className={`bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs ${className}`}>
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500">{subtitle || defaultSubtitle}</p>
        </div>

        {showTimelineLink && onTimelineClick && (
          <button
            onClick={onTimelineClick}
            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors cursor-pointer"
          >
            <span>Activity History &amp; Timeline</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* ── Hover Status Bar ── */}
      <div className="h-6 flex items-center mb-1 text-[11px] font-medium">
        {hoveredCell ? (
          <span className="text-emerald-900 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-md animate-in fade-in duration-100">
            <strong>{hoveredCell.count}</strong> {hoveredCell.count === 1 ? 'contribution' : 'contributions'} on{' '}
            {formatDisplayDate(hoveredCell.date)}
          </span>
        ) : (
          <span className="text-slate-400">Hover over any square to view daily coding activity</span>
        )}
      </div>

      {/* ── Heatmap Grid Container ── */}
      <div className="overflow-x-auto pb-1">
        {/* Single CSS grid: column 1 = day labels, columns 2..N+1 = weeks.
            Month labels share the same columns, so they always line up with the cells. */}
        <div
          className="grid gap-[3px] min-w-[620px] select-none"
          style={{ gridTemplateColumns: `28px repeat(${weeks.length}, minmax(0, 1fr))` }}
        >
          {/* Months Row */}
          {monthLabels.map((label) => (
            <span
              key={`m-${label.weekIndex}`}
              className="row-start-1 text-[10px] leading-4 text-slate-400 font-mono whitespace-nowrap overflow-hidden"
              style={{ gridColumn: `${label.weekIndex + 2} / span ${label.span}` }}
            >
              {label.monthName}
            </span>
          ))}

          {/* Day Labels (GitHub style: Mon / Wed / Fri on Sun-first rows) */}
          {['', 'Mon', '', 'Wed', '', 'Fri', ''].map((name, rIdx) => (
            <span
              key={`d-${rIdx}`}
              className="col-start-1 text-[9px] text-slate-400 font-mono flex items-center"
              style={{ gridRow: rIdx + 2 }}
            >
              {name}
            </span>
          ))}

          {/* Day cells */}
          {weeks.map(({ days, weekIndex }) =>
            days.map((day, rIdx) => (
              <div
                key={`${weekIndex}-${rIdx}`}
                style={{ gridColumn: weekIndex + 2, gridRow: rIdx + 2 }}
                onMouseEnter={
                  day.isFuture
                    ? undefined
                    : () =>
                        setHoveredCell({
                          date: day.date,
                          count: day.count,
                          dayOfWeek: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][rIdx] || '',
                        })
                }
                onMouseLeave={() => setHoveredCell(null)}
                className={`aspect-square w-full rounded-[2px] transition-colors duration-100 ${
                  day.isFuture ? 'invisible' : getCellColor(day.level, day.count)
                }`}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Footer: Streaks, Total Hours & Legend ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-4 pt-4 border-t border-slate-100">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-slate-500">
              Current Streak: <strong className="text-slate-800 font-semibold">{activity.currentStreak} days</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-500" />
            <span className="text-slate-500">
              Longest Streak: <strong className="text-slate-800 font-semibold">{activity.longestStreak} days</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span className="text-slate-500">
              Total Hours: <strong className="text-slate-800 font-semibold">{activity.totalLearningHours} hrs</strong>
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono select-none">
          <span>Less</span>
          <span className="w-2.5 h-2.5 rounded-[2px] bg-slate-100/90 border border-slate-200/50" />
          <span className="w-2.5 h-2.5 rounded-[2px] bg-emerald-200 border border-emerald-300/70" />
          <span className="w-2.5 h-2.5 rounded-[2px] bg-emerald-400 border border-emerald-500/70" />
          <span className="w-2.5 h-2.5 rounded-[2px] bg-emerald-600 border border-emerald-700/70" />
          <span className="w-2.5 h-2.5 rounded-[2px] bg-[#0b5c39] border border-[#08482c]" />
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
