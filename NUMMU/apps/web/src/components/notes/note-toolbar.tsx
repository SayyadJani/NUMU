'use client';

import React from 'react';
import { Search, X, Tag, Grid, List } from 'lucide-react';
import type { NoteCategory } from '@/services/notes.service';
import { CATEGORIES } from './note-types';

interface NoteToolbarProps {
  selectedCategory: NoteCategory;
  onSelectCategory: (category: NoteCategory) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  allTags: string[];
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
  sortBy: 'recent' | 'pinned' | 'title';
  onSortChange: (sort: 'recent' | 'pinned' | 'title') => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

export function NoteToolbar({
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  allTags,
  selectedTag,
  onSelectTag,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
}: NoteToolbarProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3.5">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 lg:pb-0">
          {CATEGORIES.map(({ id, label, icon: Icon }) => {
            const isActive = selectedCategory === id;
            return (
              <button
                key={id}
                onClick={() => onSelectCategory(id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-[#0b5c39] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        {/* Search, Sort & View Controls */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search titles, tags, content..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-emerald-600 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort selector */}
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as 'recent' | 'pinned' | 'title')}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl px-2.5 py-1.5 outline-none focus:border-emerald-600 cursor-pointer"
          >
            <option value="pinned">Pinned First</option>
            <option value="recent">Most Recent</option>
            <option value="title">Alphabetical (A-Z)</option>
          </select>

          {/* Grid / List toggle */}
          <div className="flex items-center border border-slate-200 rounded-xl p-0.5 bg-slate-50 shrink-0">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Grid View"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Tag Pills */}
      {allTags.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-100 text-[11px]">
          <span className="text-slate-400 font-medium flex items-center gap-1">
            <Tag className="w-3 h-3" />
            <span>Popular Tags:</span>
          </span>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => onSelectTag(selectedTag === tag ? null : tag)}
              className={`px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${
                selectedTag === tag
                  ? 'bg-emerald-100 text-emerald-800 font-bold'
                  : 'bg-slate-100/70 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
              }`}
            >
              #{tag}
            </button>
          ))}
          {selectedTag && (
            <button
              onClick={() => onSelectTag(null)}
              className="text-emerald-700 hover:underline font-bold text-[10px] ml-1 cursor-pointer"
            >
              Clear tag
            </button>
          )}
        </div>
      )}
    </div>
  );
}
