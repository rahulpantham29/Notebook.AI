'use client';

import React from 'react';
import { X, FileText, Bookmark, ExternalLink, Sparkles } from 'lucide-react';
import { Citation } from '@/lib/rag/types';

interface CitationDrawerProps {
  citation: Citation | null;
  onClose: () => void;
}

export default function CitationDrawer({ citation, onClose }: CitationDrawerProps) {
  if (!citation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md transition-all animate-fadeIn">
      <div className="relative w-full max-w-lg bg-surface-container/95 border border-primary/30 rounded-2xl p-6 shadow-2xl overflow-hidden glass-panel ai-glow">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/30">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                {citation.filename}
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary-container/30 text-primary border border-primary/30">
                  Pg {citation.page_number}
                </span>
              </h3>
              <p className="text-[11px] text-outline font-mono">
                Similarity Score: {(citation.similarity * 100).toFixed(1)}%
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-on-surface-variant transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Excerpt Body */}
        <div className="my-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-primary flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-secondary" />
              Grounded Source Excerpt:
            </span>
            <span className="text-[10px] text-outline italic">Exact Vector Match</span>
          </div>

          <div className="bg-surface-container-lowest/90 border border-white/10 rounded-xl p-4 text-xs font-mono text-on-surface leading-relaxed max-h-60 overflow-y-auto custom-scrollbar select-text">
            &ldquo;{citation.text_snippet}&rdquo;
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <span className="text-[10px] text-outline flex items-center gap-1">
            <Bookmark className="w-3 h-3 text-secondary" />
            Citation verified from vector index
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-primary text-on-primary font-semibold text-xs hover:bg-primary-fixed transition-colors"
          >
            Close Excerpt
          </button>
        </div>
      </div>
    </div>
  );
}
