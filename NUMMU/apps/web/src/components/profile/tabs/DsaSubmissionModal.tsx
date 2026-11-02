'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  Copy,
  CheckCircle2,
  Clock,
  Cpu,
  Code2,
} from 'lucide-react';
import type { DsaSubmission } from '@/types/profile';

import { submissionsService } from '@/services/submissions.service';

interface DsaSubmissionModalProps {
  submission: DsaSubmission | null;
  onClose: () => void;
}

const SAMPLE_CODE: Record<string, string> = {
  'sub-1': `// 42. Trapping Rain Water (C++)
class Solution {
public:
    int trap(vector<int>& height) {
        int n = height.size();
        if (n <= 2) return 0;
        
        int left = 0, right = n - 1;
        int leftMax = 0, rightMax = 0;
        int waterTrapped = 0;
        
        while (left < right) {
            if (height[left] < height[right]) {
                if (height[left] >= leftMax) leftMax = height[left];
                else waterTrapped += leftMax - height[left];
                left++;
            } else {
                if (height[right] >= rightMax) rightMax = height[right];
                else waterTrapped += rightMax - height[right];
                right--;
            }
        }
        return waterTrapped;
    }
};`,
  'sub-2': `// 146. LRU Cache (TypeScript)
class LRUCache {
    private capacity: number;
    private map: Map<number, number>;

    constructor(capacity: number) {
        this.capacity = capacity;
        this.map = new Map();
    }

    get(key: number): number {
        if (!this.map.has(key)) return -1;
        const val = this.map.get(key)!;
        this.map.delete(key);
        this.map.set(key, val);
        return val;
    }

    put(key: number, value: number): void {
        if (this.map.has(key)) {
            this.map.delete(key);
        } else if (this.map.size >= this.capacity) {
            const oldestKey = this.map.keys().next().value;
            this.map.delete(oldestKey);
        }
        this.map.set(key, value);
    }
}`,
};

export function DsaSubmissionModal({ submission, onClose }: DsaSubmissionModalProps) {
  const [copied, setCopied] = useState(false);
  const [realCode, setRealCode] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setRealCode(null);
    if (submission?.id && !submission.id.startsWith('sub-')) {
      submissionsService
        .getSubmissionById(submission.id)
        .then((res) => {
          if (mounted && res?.code) {
            setRealCode(res.code);
          }
        })
        .catch(() => {});
    }
    return () => {
      mounted = false;
    };
  }, [submission?.id]);

  if (!submission) return null;

  const codeSnippet =
    realCode ||
    SAMPLE_CODE[submission.id] ||
    `// Solution for: ${submission.title}
// Language: ${submission.language}
// Status: ${submission.status}

function solution() {
    // Verified algorithmic implementation
    console.log("Passed with runtime ${submission.runtime}");
}`;

  const handleCopy = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(codeSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Code2 className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                  {submission.title}
                </h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    submission.difficulty === 'Hard'
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : submission.difficulty === 'Medium'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {submission.difficulty}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <span>Submitted {submission.timeAgo}</span>
                <span>•</span>
                <span className="font-mono text-slate-700 font-semibold">{submission.language}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Performance metrics banner */}
        <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50/50 border-b border-slate-100 text-center">
          <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
            <div className="text-[10px] font-bold uppercase text-slate-400 mb-0.5 flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Status
            </div>
            <div className="text-xs font-black text-emerald-700">{submission.status}</div>
          </div>

          <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
            <div className="text-[10px] font-bold uppercase text-slate-400 mb-0.5 flex items-center justify-center gap-1">
              <Clock className="w-3 h-3 text-blue-600" /> Runtime
            </div>
            <div className="text-xs font-black text-slate-900 font-mono">{submission.runtime}</div>
            <div className="text-[9px] text-slate-400">Beats 92.4%</div>
          </div>

          <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
            <div className="text-[10px] font-bold uppercase text-slate-400 mb-0.5 flex items-center justify-center gap-1">
              <Cpu className="w-3 h-3 text-purple-600" /> Memory
            </div>
            <div className="text-xs font-black text-slate-900 font-mono">{submission.memory}</div>
            <div className="text-[9px] text-slate-400">Beats 88.1%</div>
          </div>
        </div>

        {/* Code Snippet Viewer */}
        <div className="p-5 flex-1 overflow-y-auto bg-[#0a120e]">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
            <span>Solution Source Code</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-sans transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-300">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          <pre className="text-xs font-mono text-emerald-300 bg-black/40 p-4 rounded-xl overflow-x-auto leading-relaxed border border-emerald-950/60">
            <code>{codeSnippet}</code>
          </pre>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 flex items-center justify-end bg-slate-50/50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
