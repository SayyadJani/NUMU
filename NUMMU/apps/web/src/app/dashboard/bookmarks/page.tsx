'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingState } from '@/components/ui/loading-state';
import { bookmarksService, type BookmarkItem } from '@/services/bookmarks.service';
import { Bookmark, Search, Trash2, ArrowRight, Code2, Layers, BookOpen, ExternalLink } from 'lucide-react';

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookmarksService.getBookmarks(filterType).then((items) => {
      setBookmarks(items);
      setLoading(false);
    });
  }, [filterType]);

  const handleRemove = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = await bookmarksService.removeBookmark(id);
    setBookmarks(updated);
  };

  const filtered = bookmarks.filter((b) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return b.title.toLowerCase().includes(q) || b.subtitle.toLowerCase().includes(q) || b.tag.toLowerCase().includes(q);
  });

  const getTypeIcon = (type: BookmarkItem['type']) => {
    switch (type) {
      case 'problem':
        return <Code2 className="w-4 h-4 text-emerald-600" />;
      case 'pattern':
        return <Layers className="w-4 h-4 text-blue-600" />;
      case 'project':
        return <ExternalLink className="w-4 h-4 text-purple-600" />;
      default:
        return <BookOpen className="w-4 h-4 text-amber-600" />;
    }
  };

  return (
    <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl w-full mx-auto space-y-6">
          <PageHeader
            title="Saved & Bookmarks"
            description="Quick access to all your saved problems, algorithmic patterns, project templates, and study notes."
            breadcrumbs={[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Bookmarks' },
            ]}
          />

          {/* Filter Bar & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {[
                { id: 'all', label: 'All Items' },
                { id: 'problem', label: 'Problems' },
                { id: 'pattern', label: 'Patterns' },
                { id: 'project', label: 'Projects' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterType(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    filterType === tab.id
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search bookmarks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:outline-none focus:bg-white focus:border-emerald-500 transition-all"
              />
            </div>
          </div>

          {/* Bookmarks List */}
          {loading ? (
            <LoadingState message="Loading your bookmarks..." />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={Bookmark}
              title="No bookmarks found"
              description="You haven't bookmarked any items in this category yet. Click the bookmark icon on any problem or project to save it here."
              actionLabel="Explore DSA Problems"
              onAction={() => {
                window.location.href = '/dashboard/dsa/problems';
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                          {getTypeIcon(item.type)}
                        </div>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${item.tagColor || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                          {item.tag}
                        </span>
                      </div>
                      <button
                        onClick={(e) => handleRemove(item.id, e)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        title="Remove bookmark"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors mb-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {item.subtitle}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 text-xs">
                    <span className="text-slate-400 text-[11px]">Saved {item.savedAt}</span>
                    <Link
                      href={item.href as React.ComponentProps<typeof Link>['href']}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
                    >
                      <span>Open item</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
  );
}
