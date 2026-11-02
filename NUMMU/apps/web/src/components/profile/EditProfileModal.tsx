'use client';

import React, { useState } from 'react';
import {
  X,
  Plus,
  GraduationCap,
  MapPin,
  Quote,
  Sparkles,
  Save,
  Globe,
} from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '@/components/ui/icons';
import { Spinner } from '@/components/ui/loading-state';
import { CharacterAvatar, type CharacterStickerType } from '@/components/ui/character-avatar';
import type { UserProfile, SocialLink } from '@/types/profile';

const AVATAR_OPTIONS: { id: CharacterStickerType; label: string; desc: string }[] = [
  { id: 'male', label: 'Male Dev', desc: 'Tech hoodie & DEV badge' },
  { id: 'female', label: 'Female Dev', desc: 'Code headset & </> tag' },
  { id: 'cyber', label: 'Cyber Lead', desc: 'Cyber visor & neon suit' },
  { id: 'mascot', label: 'Coder Mascot', desc: 'Glasses cat hacker' },
];

interface EditProfileModalProps {
  isOpen: boolean;
  profile: UserProfile;
  onClose: () => void;
  onSave: (updated: Partial<UserProfile>) => Promise<void> | void;
}

export function EditProfileModal({
  isOpen,
  profile,
  onClose,
  onSave,
}: EditProfileModalProps) {
  const [avatarUrl, setAvatarUrl] = useState<string>(profile.avatarUrl || 'male');
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [bio, setBio] = useState(profile.bio);
  const [college, setCollege] = useState(profile.college);
  const [department, setDepartment] = useState(profile.department);
  const [batch, setBatch] = useState(profile.batch);
  const [location, setLocation] = useState(profile.location || '');
  const [quote, setQuote] = useState(profile.quote);

  // Socials
  const [githubUrl, setGithubUrl] = useState(
    profile.socials.find((s) => s.platform === 'github')?.url || ''
  );
  const [linkedinUrl, setLinkedinUrl] = useState(
    profile.socials.find((s) => s.platform === 'linkedin')?.url || ''
  );
  const [websiteUrl, setWebsiteUrl] = useState(
    profile.socials.find((s) => s.platform === 'website')?.url || ''
  );

  // Tags
  const [tags, setTags] = useState<string[]>(profile.tags || []);
  const [newTagInput, setNewTagInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleAddTag = () => {
    const trimmed = newTagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleKeyDownTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const socials: SocialLink[] = [
      ...(githubUrl
        ? [
            {
              platform: 'github' as const,
              label: githubUrl.replace(/^https?:\/\/(www\.)?/, ''),
              url: githubUrl.startsWith('http') ? githubUrl : `https://${githubUrl}`,
            },
          ]
        : []),
      ...(linkedinUrl
        ? [
            {
              platform: 'linkedin' as const,
              label: linkedinUrl.replace(/^https?:\/\/(www\.)?/, ''),
              url: linkedinUrl.startsWith('http') ? linkedinUrl : `https://${linkedinUrl}`,
            },
          ]
        : []),
      ...(websiteUrl
        ? [
            {
              platform: 'website' as const,
              label: websiteUrl.replace(/^https?:\/\/(www\.)?/, ''),
              url: websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`,
            },
          ]
        : []),
    ];

    try {
      await onSave({
        displayName,
        bio,
        avatarUrl,
        college,
        department,
        batch,
        location,
        quote,
        tags,
        socials,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4 text-emerald-700" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 leading-tight">Edit Profile</h3>
              <p className="text-xs text-slate-500">Update your public identity on NUMU</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Character Sticker Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Profile Character Sticker
            </label>
            <p className="text-[11px] text-slate-500 mb-3">
              Choose your developer character sticker avatar for your profile.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {AVATAR_OPTIONS.map((opt) => {
                const isSelected =
                  avatarUrl === opt.id ||
                  (opt.id === 'male' && (!avatarUrl || avatarUrl === ''));
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setAvatarUrl(opt.id)}
                    className={`p-2.5 rounded-2xl border-2 transition-all flex flex-col items-center text-center cursor-pointer ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-600/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-white'
                    }`}
                  >
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#0b5c39] p-0.5 mb-2 shadow-xs">
                      <CharacterAvatar type={opt.id} className="w-full h-full" />
                    </div>
                    <span className="text-xs font-bold text-slate-800">{opt.label}</span>
                    <span className="text-[10px] text-slate-500 leading-tight mt-0.5">{opt.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Display Name</label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              placeholder="e.g. Jani Pasha"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Bio</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 leading-relaxed"
              placeholder="Write a brief intro about yourself..."
            />
          </div>

          {/* Academic Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                <span>College / University</span>
              </label>
              <input
                type="text"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                placeholder="e.g. B.V. Raju Institute of Tech"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Batch / Class</label>
              <input
                type="text"
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                placeholder="2022 – 2026"
              />
            </div>
          </div>

          {/* Department & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                placeholder="e.g. AI & Data Science"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Location</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                placeholder="e.g. Hyderabad, India"
              />
            </div>
          </div>

          {/* Motto / Quote */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Quote className="w-3.5 h-3.5 text-slate-400" />
              <span>Personal Motto / Quote</span>
            </label>
            <input
              type="text"
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
              placeholder='"Small steps everyday lead to extraordinary results."'
            />
          </div>

          {/* Social Profiles */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="text-xs font-bold text-slate-700 mb-1">Social Profiles & Portfolios</div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                <GithubIcon className="w-4 h-4 text-slate-700" />
              </div>
              <input
                type="text"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                placeholder="https://github.com/your-username"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                <LinkedinIcon className="w-4 h-4 text-slate-700" />
              </div>
              <input
                type="text"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                placeholder="https://linkedin.com/in/your-username"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                <Globe className="w-4 h-4 text-slate-700" />
              </div>
              <input
                type="text"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                placeholder="https://yourwebsite.com"
              />
            </div>
          </div>

          {/* Areas of Focus / Tags */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Areas of Focus &amp; Skills Chips
            </label>

            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium"
                >
                  <span>#{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-red-600 text-emerald-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={handleKeyDownTag}
                className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                placeholder="Type tag and hit enter (e.g. Distributed Systems)..."
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-[#0b5c39] hover:bg-[#094d2f] text-white text-xs font-bold transition-all shadow-md shadow-emerald-950/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? <Spinner className="w-4 h-4 text-white" /> : <Save className="w-4 h-4" />}
              <span>{isSaving ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
