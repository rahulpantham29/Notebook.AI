'use client';

import React from 'react';
import { Menu, Bot, Sparkles } from 'lucide-react';

interface HeaderProps {
  onToggleDrawer: () => void;
  documentCount: number;
}

export default function Header({ onToggleDrawer, documentCount }: HeaderProps) {
  return (
    <header className="fixed top-0 w-full bg-background/80 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-4 md:px-6 h-16 z-40">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleDrawer}
          className="text-on-surface-variant hover:bg-white/10 hover:text-white transition-colors active:scale-95 p-2 rounded-full flex items-center justify-center"
          title="Toggle Navigation & Documents"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-primary/40 shadow-glow relative bg-surface-container flex items-center justify-center shrink-0">
            <img src="/logo.png" alt="NotebookAI Logo" className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-300" />
          </div>
          <div>
            <h1 className="font-bold text-lg md:text-xl text-primary tracking-tight flex items-center gap-1.5">
              NotebookAI
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary-container/40 text-secondary border border-secondary/30 flex items-center gap-1 font-medium">
                <Sparkles className="w-3 h-3 text-secondary animate-pulse" />
                RAG 3D
              </span>
            </h1>
            <p className="text-[11px] text-outline font-medium hidden sm:block">
              Intelligent PDF Synthesis & Context Extraction
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container border border-white/10 text-xs text-on-surface-variant">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{documentCount} {documentCount === 1 ? 'Doc' : 'Docs'} Indexed</span>
        </div>

        <button className="w-9 h-9 rounded-full bg-surface-container-high border border-white/15 overflow-hidden p-0.5 hover:border-primary transition-colors flex items-center justify-center">
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-primary/30 to-secondary/30 flex items-center justify-center text-xs font-bold text-primary">
            RA
          </div>
        </button>
      </div>
    </header>
  );
}
