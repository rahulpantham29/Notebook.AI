'use client';

import React, { useState } from 'react';
import {
  X,
  FileText,
  Trash2,
  FolderOpen,
  History,
  Share2,
  Settings,
  ShieldCheck,
  Search,
  CheckCircle,
  Clock,
} from 'lucide-react';
import FileUpload from './FileUpload';
import { DocumentMetadata } from '@/lib/rag/types';

interface DocumentSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  documents: DocumentMetadata[];
  onUploadSuccess: (doc: DocumentMetadata) => void;
  onDeleteDocument: (docId: string) => void;
  activeDocId?: string;
  onSelectDocument?: (docId: string) => void;
}

export default function DocumentSidebar({
  isOpen,
  onClose,
  documents,
  onUploadSuccess,
  onDeleteDocument,
  activeDocId,
  onSelectDocument,
}: DocumentSidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDocs = documents.filter((doc) =>
    doc.filename.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <>
      {/* Overlay Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"
        />
      )}

      {/* Navigation Drawer Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-[300px] sm:w-[320px] bg-surface-container/95 border-r border-white/10 shadow-2xl flex flex-col h-full z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-5 flex flex-col h-full overflow-y-auto custom-scrollbar">
          {/* Top User Account Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-primary/40 shadow-glow relative bg-surface-container flex items-center justify-center shrink-0">
                <img src="/logo.png" alt="NotebookAI Logo" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sm text-primary flex items-center gap-1">
                  NotebookAI RAG
                  <ShieldCheck className="w-3.5 h-3.5 text-secondary" />
                </span>
                <span className="text-[11px] text-on-surface-variant font-medium">Pro Workspace</span>
                <span className="text-[10px] text-outline mt-0.5 font-mono">
                  Vector DB Active
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-on-surface-variant transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Upload Zone Component */}
          <div className="mb-5">
            <FileUpload onUploadSuccess={onUploadSuccess} />
          </div>

          {/* Document Section Title & Search */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-primary">
              <FolderOpen className="w-4 h-4" />
              <span>My Documents ({documents.length})</span>
            </div>
          </div>

          <div className="relative mb-3">
            <Search className="w-3.5 h-3.5 text-outline absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Filter notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-surface-container-lowest border border-white/10 rounded-lg text-xs text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-all"
            />
          </div>

          {/* Document List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {filteredDocs.length === 0 ? (
              <div className="text-center py-8 text-xs text-outline italic">
                No documents found. Upload lecture notes to begin!
              </div>
            ) : (
              filteredDocs.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => onSelectDocument && onSelectDocument(doc.id)}
                  className={`group p-3 rounded-xl border transition-all cursor-pointer flex items-start justify-between ${
                    activeDocId === doc.id
                      ? 'bg-primary-container/20 border-primary shadow-glow'
                      : 'bg-surface-container-low/70 border-white/5 hover:border-white/20 hover:bg-surface-container-high'
                  }`}
                >
                  <div className="flex items-start gap-2.5 overflow-hidden">
                    <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 shrink-0 mt-0.5">
                      <FileText className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-medium text-on-surface truncate group-hover:text-primary transition-colors">
                        {doc.filename}
                      </span>
                      <span className="text-[10px] text-outline mt-0.5 font-mono">
                        {doc.pageCount} {doc.pageCount === 1 ? 'page' : 'pages'} • {formatFileSize(doc.size)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-secondary/15 text-secondary border border-secondary/30 flex items-center gap-1">
                      <CheckCircle className="w-2.5 h-2.5 text-secondary" />
                      Indexed
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteDocument(doc.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 text-red-400 transition-all"
                      title="Delete Document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Quick Actions Footer */}
          <nav className="pt-4 border-t border-white/10 flex flex-col gap-1 mt-auto">
            <button className="flex items-center gap-3 px-3 py-2 text-xs text-on-surface-variant hover:bg-white/5 rounded-lg transition-all">
              <History className="w-4 h-4 text-primary" />
              <span>Recent Research</span>
            </button>
            <button className="flex items-center gap-3 px-3 py-2 text-xs text-on-surface-variant hover:bg-white/5 rounded-lg transition-all">
              <Share2 className="w-4 h-4 text-primary" />
              <span>Shared Collections</span>
            </button>
            <button className="flex items-center gap-3 px-3 py-2 text-xs text-on-surface-variant hover:bg-white/5 rounded-lg transition-all">
              <Settings className="w-4 h-4 text-primary" />
              <span>Pipeline Settings</span>
            </button>
          </nav>
        </div>
      </aside>
    </>
  );
}
