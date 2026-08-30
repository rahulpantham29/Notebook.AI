'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { DocumentMetadata } from '@/lib/rag/types';

interface FileUploadProps {
  onUploadSuccess: (doc: DocumentMetadata) => void;
}

export default function FileUpload({ onUploadSuccess }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'txt', 'md'].includes(ext || '')) {
      setErrorMessage('Supported file formats: PDF, TXT, MD.');
      return;
    }

    setErrorMessage(null);
    setUploading(true);
    setProgress(15);
    setStatusMessage(`Parsing document structure...`);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Simulate step-by-step extraction & chunking progress for smooth UX
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 85) {
            clearInterval(progressInterval);
            return 85;
          }
          return prev + 15;
        });
      }, 200);

      setStatusMessage('Extracting pages & recursive character chunking...');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Upload failed');
      }

      const data = await res.json();
      setProgress(100);
      setStatusMessage('Document indexed into vector store!');

      setTimeout(() => {
        setUploading(false);
        setProgress(0);
        setStatusMessage(null);
        if (data.document) {
          onUploadSuccess(data.document);
        }
      }, 600);
    } catch (err) {
      setUploading(false);
      setProgress(0);
      setStatusMessage(null);
      setErrorMessage(err instanceof Error ? err.message : 'Upload failed.');
    }
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`relative overflow-hidden rounded-xl p-5 border-2 border-dashed transition-all cursor-pointer group flex flex-col items-center justify-center text-center ${
          isDragging
            ? 'border-primary bg-primary/10 scale-[1.02]'
            : 'border-primary/40 bg-surface-container/60 hover:border-primary hover:bg-surface-container-high'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt,.md"
          onChange={handleFileChange}
          className="hidden"
          disabled={uploading}
        />

        {uploading ? (
          <div className="w-full flex flex-col items-center py-2">
            <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
            <span className="text-xs font-semibold text-primary mb-1">
              {statusMessage || 'Processing document...'}
            </span>
            <div className="w-full bg-surface-container-lowest rounded-full h-2 overflow-hidden mt-2 border border-white/5">
              <div
                className="bg-gradient-to-r from-primary via-secondary to-primary h-full transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[10px] text-outline mt-1 font-mono">{progress}% Complete</span>
          </div>
        ) : (
          <>
            <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-glow">
              <UploadCloud className="w-6 h-6 text-primary" />
            </div>
            <span className="font-semibold text-sm text-primary group-hover:text-primary-fixed transition-colors">
              Upload Document
            </span>
            <span className="text-xs text-on-surface-variant mt-1">
              Drag & drop lecture notes, PDFs, or TXT
            </span>
            <span className="text-[10px] text-outline mt-2 px-2.5 py-0.5 rounded-md bg-surface-container-lowest border border-white/5">
              Supports .pdf, .txt, .md (up to 50MB)
            </span>
          </>
        )}
      </div>

      {errorMessage && (
        <div className="mt-3 p-3 rounded-lg bg-red-950/40 border border-red-500/30 flex items-center gap-2 text-xs text-red-300">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
