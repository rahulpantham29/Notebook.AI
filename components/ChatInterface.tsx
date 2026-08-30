'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, PlusCircle, Sparkles, FileText, Code2, AlertTriangle, ArrowUp } from 'lucide-react';
import { ChatMessage, Citation } from '@/lib/rag/types';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (query: string) => void;
  isGenerating: boolean;
  onSelectCitation: (citation: Citation) => void;
  onOpenUpload: () => void;
}

export default function ChatInterface({
  messages,
  onSendMessage,
  isGenerating,
  onSelectCitation,
  onOpenUpload,
}: ChatInterfaceProps) {
  const [inputQuery, setInputQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputQuery.trim() || isGenerating) return;
    onSendMessage(inputQuery.trim());
    setInputQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleQuickChip = (promptText: string) => {
    onSendMessage(promptText);
  };

  return (
    <main className="flex-1 mt-16 pb-[140px] overflow-y-auto relative z-10 px-4 md:px-6 py-6 flex flex-col gap-6 w-full max-w-[850px] mx-auto custom-scrollbar">
      {/* Messages Stream */}
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary-container via-secondary-container to-primary flex items-center justify-center shadow-glow mb-4">
            <Bot className="w-8 h-8 text-on-primary-container" />
          </div>
          <h2 className="text-xl font-bold text-primary tracking-tight mb-2">
            Welcome to NotebookAI RAG
          </h2>
          <p className="text-sm text-on-surface-variant max-w-md mb-6 leading-relaxed">
            Upload your lecture notes, PDFs, or research papers. Ask questions and get grounded answers with precise page citations!
          </p>

          <div className="flex flex-wrap gap-2 justify-center max-w-lg">
            <button
              onClick={() => handleQuickChip('Summarize the key findings in the uploaded document.')}
              className="px-4 py-2 rounded-full border border-white/10 bg-surface-container/60 hover:border-primary/50 hover:bg-surface-container-high text-xs text-on-surface transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-secondary" />
              Summarize Document
            </button>
            <button
              onClick={() => handleQuickChip('What are the key takeaways regarding revenue growth in the APAC region?')}
              className="px-4 py-2 rounded-full border border-white/10 bg-surface-container/60 hover:border-primary/50 hover:bg-surface-container-high text-xs text-on-surface transition-all flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-primary" />
              APAC Revenue Growth
            </button>
            <button
              onClick={() => handleQuickChip('Extract main action items and metrics.')}
              className="px-4 py-2 rounded-full border border-white/10 bg-surface-container/60 hover:border-primary/50 hover:bg-surface-container-high text-xs text-on-surface transition-all flex items-center gap-1.5"
            >
              <Code2 className="w-3.5 h-3.5 text-tertiary" />
              Extract Metrics
            </button>
          </div>
        </div>
      ) : (
        messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.sender === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-surface-container border border-primary/30 flex items-center justify-center shrink-0 shadow-glow">
                <Bot className="w-4 h-4 text-primary" />
              </div>
            )}

            <div
              className={`max-w-[88%] sm:max-w-[82%] rounded-2xl p-4 text-sm leading-relaxed transition-all ${
                msg.sender === 'user'
                  ? 'bg-primary text-on-primary rounded-tr-sm shadow-lg font-medium'
                  : 'glass-panel text-on-surface rounded-tl-sm border border-white/10 shadow-lg'
              }`}
            >
              <div className="whitespace-pre-wrap font-sans">{msg.text}</div>

              {/* Render Source Citation Chips */}
              {msg.sender === 'assistant' && msg.citations && msg.citations.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-white/10">
                  <span className="text-[11px] font-semibold text-primary/80 flex items-center gap-1 w-full mb-1">
                    <FileText className="w-3 h-3" /> Source Citations:
                  </span>
                  {msg.citations.map((citation) => (
                    <button
                      key={citation.id}
                      onClick={() => onSelectCitation(citation)}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container-high/80 border border-white/10 hover:border-primary/60 hover:bg-surface-bright transition-all group cursor-pointer"
                      title="Click to view full text excerpt"
                    >
                      <FileText className="w-3 h-3 text-primary group-hover:scale-110 transition-transform" />
                      <span className="text-[11px] font-mono text-on-surface group-hover:text-primary transition-colors">
                        [{citation.filename}, Pg {citation.page_number}]
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))
      )}

      {/* AI Generating Indicator */}
      {isGenerating && (
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-surface-container border border-primary/40 flex items-center justify-center shrink-0">
            <Bot className="w-4 h-4 text-primary animate-pulse" />
          </div>
          <div className="glass-panel p-4 rounded-2xl rounded-tl-sm w-full max-w-[82%] ai-glow border border-primary/50 flex items-center gap-3">
            <div className="flex gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-secondary animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-tertiary animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-xs text-primary font-medium">
              Searching vector embeddings & synthesizing answer...
            </span>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />

      {/* Bottom Sticky Input Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-background via-background/95 to-transparent pt-6 pb-4">
        <div className="max-w-[850px] mx-auto px-4 md:px-6 flex flex-col gap-3">
          {/* Quick Action Chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide w-full">
            <button
              onClick={() => handleQuickChip('Summarize key points from notes.')}
              className="whitespace-nowrap px-3.5 py-1.5 rounded-full border border-white/10 bg-surface-container/60 backdrop-blur-md text-xs text-on-surface-variant hover:text-primary hover:border-primary/50 hover:bg-surface-container-high transition-all flex items-center gap-1"
            >
              Summarize
            </button>
            <button
              onClick={() => handleQuickChip('What are the key takeaways?')}
              className="whitespace-nowrap px-3.5 py-1.5 rounded-full border border-white/10 bg-surface-container/60 backdrop-blur-md text-xs text-on-surface-variant hover:text-primary hover:border-primary/50 hover:bg-surface-container-high transition-all flex items-center gap-1"
            >
              Key Takeaways
            </button>
            <button
              onClick={() => handleQuickChip('Extract insights and metrics.')}
              className="whitespace-nowrap px-3.5 py-1.5 rounded-full border border-white/10 bg-surface-container/60 backdrop-blur-md text-xs text-on-surface-variant hover:text-primary hover:border-primary/50 hover:bg-surface-container-high transition-all flex items-center gap-1"
            >
              Extract Insights
            </button>
          </div>

          {/* Text input container */}
          <form
            onSubmit={handleSubmit}
            className="relative glass-panel rounded-2xl flex items-center p-2 border border-primary/30 focus-within:ai-glow focus-within:border-primary transition-all shadow-xl"
          >
            <button
              type="button"
              onClick={onOpenUpload}
              className="p-2.5 text-on-surface-variant hover:text-primary transition-colors shrink-0 flex items-center justify-center rounded-xl hover:bg-white/5"
              title="Upload New Document"
            >
              <PlusCircle className="w-5 h-5" />
            </button>

            <textarea
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask natural language questions about your uploaded documents..."
              rows={1}
              className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-sm text-on-surface placeholder:text-outline resize-none max-h-32 py-2 px-3 custom-scrollbar"
            />

            <button
              type="submit"
              disabled={!inputQuery.trim() || isGenerating}
              className={`p-2.5 rounded-xl transition-all shrink-0 flex items-center justify-center ml-1 ${
                inputQuery.trim() && !isGenerating
                  ? 'bg-primary text-on-primary hover:bg-primary-fixed shadow-glow'
                  : 'bg-white/5 text-outline cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center">
            <span className="text-[10px] text-outline">
              NotebookAI RAG Engine strictly enforces anti-hallucination constraints with source page verification.
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
