'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { LoadingState } from '@/components/ui/loading-state';
import { EmptyState } from '@/components/ui/empty-state';
import { communityService, type CommunityPost } from '@/services/community.service';
import { Users, ThumbsUp, MessageSquare, Plus, Tag } from 'lucide-react';

export default function CommunityPage() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [category, setCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // New post modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postCategory, setPostCategory] = useState<'dsa' | 'development' | 'interview' | 'general'>('dsa');
  const [postTags, setPostTags] = useState('');

  useEffect(() => {
    communityService.getPosts(category).then((data) => {
      setPosts(data);
      setLoading(false);
    });
  }, [category]);

  const handleUpvote = async (id: string) => {
    const updated = await communityService.toggleUpvote(id);
    setPosts(updated);
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) return;

    const tagsArray = postTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    await communityService.createPost({
      author: {
        name: 'Johnny',
        username: 'johnny_dev',
        avatar: 'J',
        college: 'VIT Vellore',
        badge: 'Knight',
      },
      title: postTitle.trim(),
      content: postContent.trim(),
      tags: tagsArray.length > 0 ? tagsArray : ['Discussion'],
      category: postCategory,
    });

    const refreshed = await communityService.getPosts(category);
    setPosts(refreshed);
    setPostTitle('');
    setPostContent('');
    setPostTags('');
    setIsModalOpen(false);
  };

  return (
    <>
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl w-full mx-auto space-y-6">
          <PageHeader
            title="Developer Community"
            description="Discuss algorithms, share fullstack architecture tips, organize study circles, and prep with peers."
            breadcrumbs={[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Community' },
            ]}
            actions={
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => setIsModalOpen(true)}
              >
                Start Discussion
              </Button>
            }
          />

          {/* Category Filter Bar */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
            {[
              { id: 'all', label: 'All Discussions' },
              { id: 'dsa', label: 'DSA & Algorithms' },
              { id: 'development', label: 'Fullstack & Dev' },
              { id: 'interview', label: 'Interview Experiences' },
              { id: 'general', label: 'General / Campus' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCategory(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  category === tab.id
                    ? 'bg-[#0b5c39] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Posts List */}
          {loading ? (
            <LoadingState message="Loading community discussions..." />
          ) : posts.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No discussions found"
              description="Be the first to share an insight, question, or study tip in this category!"
              actionLabel="Start a Discussion"
              onAction={() => setIsModalOpen(true)}
            />
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all space-y-3"
                >
                  {/* Author Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                        {post.author.avatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{post.author.name}</span>
                          {post.author.badge && (
                            <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                              {post.author.badge}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400">{post.author.college} • {post.createdAt}</span>
                      </div>
                    </div>
                  </div>

                  {/* Title & Content */}
                  <div>
                    <h2 className="text-base font-bold text-slate-900 tracking-tight hover:text-emerald-700 transition-colors cursor-pointer">
                      {post.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                      {post.content}
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600"
                      >
                        <Tag className="w-3 h-3 text-slate-400" />
                        <span>{tag}</span>
                      </span>
                    ))}
                  </div>

                  {/* Footer Actions */}
                  <div className="flex items-center gap-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
                    <button
                      onClick={() => handleUpvote(post.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                        post.isUpvoted
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'hover:bg-slate-100 text-slate-600'
                      }`}
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${post.isUpvoted ? 'fill-emerald-600' : ''}`} />
                      <span>{post.upvotes} Upvotes</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                      <span>{post.repliesCount} Replies</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </main>

      {/* New Post Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Start a Community Discussion"
        description="Share a problem breakdown, architecture question, or interview tip with peers."
        maxWidth="lg"
      >
        <form onSubmit={handleCreatePost} className="space-y-4">
          <Input
            label="Title"
            placeholder="e.g. Best practices for optimizing MongoDB indexing in NestJS"
            value={postTitle}
            onChange={(e) => setPostTitle(e.target.value)}
            required
          />

          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold text-slate-700">Category</label>
            <select
              value={postCategory}
              onChange={(e) => setPostCategory(e.target.value as 'dsa' | 'development' | 'interview' | 'general')}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-500"
            >
              <option value="dsa">DSA & Algorithms</option>
              <option value="development">Fullstack & Development</option>
              <option value="interview">Interview Experiences</option>
              <option value="general">General & Campus</option>
            </select>
          </div>

          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold text-slate-700">Content</label>
            <textarea
              rows={4}
              placeholder="Provide context, code snippets, or discussion questions..."
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-emerald-500"
              required
            />
          </div>

          <Input
            label="Tags (comma-separated)"
            placeholder="e.g. Next.js, Architecture, Redis"
            value={postTags}
            onChange={(e) => setPostTags(e.target.value)}
          />

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Publish Discussion
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
