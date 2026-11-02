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

  // Pre-calculate 52 weeks x 7 days grid with robust fallback
  const { weeks, monthPositions } = useMemo(() => {
    const now = new Date();
    const calculatedWeeks: { days: HeatmapDay[]; weekIndex: number }[] = [];
    const positions: { weekIndex: number; monthName: string }[] = [];
    let lastMonth = -1;

    for (let c = 0; c < 52; c++) {
      const days: HeatmapDay[] = [];
      for (let r = 0; r < 7; r++) {
        const existingDay = activity.heatmapDays?.[r]?.[c];
        if (existingDay && existingDay.date) {
          days.push(existingDay);
        } else {
          const daysAgo = (51 - c) * 7 + (6 - r);
          const d = new Date(now);
          d.setDate(d.getDate() - daysAgo);
          const dateStr = d.toISOString().split('T')[0]!;
          const isActive = Boolean(activity.heatmapRows?.[r]?.[c]);
          days.push({
            date: dateStr,
            count: isActive ? 1 : 0,
            level: isActive ? 2 : 0,
            isCurrentYear: d.getFullYear() === now.getFullYear(),
            isFuture: d > now,
          });
        }
      }

      calculatedWeeks.push({ days, weekIndex: c });

      // Determine month for header labeling based on middle of the week
      const midDayDate = new Date(days[3]?.date || days[0]?.date || now);
      const monthIndex = midDayDate.getMonth();
      if (monthIndex !== lastMonth) {
        positions.push({
          weekIndex: c,
          monthName: midDayDate.toLocaleDateString('en-US', { month: 'short' }),
        });
        lastMonth = monthIndex;
      }
    }

    return { weeks: calculatedWeeks, monthPositions: positions };
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
      <div className="overflow-x-auto pb-2 -mx-1 px-1">
        <div className="inline-block min-w-full">
          {/* Months Row (aligned to exact week columns) */}
          <div className="flex text-[10px] text-slate-400 font-mono mb-1.5 pl-6 select-none relative h-4">
            {monthPositions.map((pos, idx) => {
              // Only render if not colliding with next/previous
              const nextPos = monthPositions[idx + 1];
              if (nextPos && nextPos.weekIndex - pos.weekIndex < 3) return null;
              return (
                <span
                  key={pos.weekIndex}
                  className="absolute"
                  style={{ left: `${pos.weekIndex * 14 + 24}px` }}
                >
                  {pos.monthName}
                </span>
              );
            })}
          </div>

          {/* Grid: Day Labels + 52 Week Columns */}
          <div className="flex items-start gap-[3px]">
            {/* Day Labels Column (aligned directly with 7 rows) */}
            <div className="flex flex-col gap-[3px] pr-1.5 text-[9px] text-slate-400 font-mono select-none">
              <div className="w-5 h-[11px] sm:h-3 flex items-center">Mon</div>
              <div className="w-5 h-[11px] sm:h-3" />
              <div className="w-5 h-[11px] sm:h-3 flex items-center">Wed</div>
              <div className="w-5 h-[11px] sm:h-3" />
              <div className="w-5 h-[11px] sm:h-3 flex items-center">Fri</div>
              <div className="w-5 h-[11px] sm:h-3" />
              <div className="w-5 h-[11px] sm:h-3" />
            </div>

            {/* 52 Week Columns */}
            <div className="flex gap-[3px]">
              {weeks.map(({ days, weekIndex }) => (
                <div key={weekIndex} className="flex flex-col gap-[3px]">
                  {days.map((day, rIdx) => {
                    const colorClass = getCellColor(day.level, day.count);
                    return (
                      <div
                        key={`${weekIndex}-${rIdx}`}
                        onMouseEnter={() =>
                          setHoveredCell({
                            date: day.date,
                            count: day.count,
                            dayOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][rIdx] || '',
                          })
                        }
                        onMouseLeave={() => setHoveredCell(null)}
                        className={`w-[11px] h-[11px] sm:w-3 sm:h-3 rounded-[2px] transition-all duration-100 ${colorClass}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
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
