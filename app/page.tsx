'use client';

import React, { useState, useEffect } from 'react';
import AnimatedBackground from '@/components/AnimatedBackground';
import Header from '@/components/Header';
import DocumentSidebar from '@/components/DocumentSidebar';
import ChatInterface from '@/components/ChatInterface';
import CitationDrawer from '@/components/CitationDrawer';
import { ChatMessage, Citation, DocumentMetadata } from '@/lib/rag/types';

export default function Home() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);
  const [activeDocId, setActiveDocId] = useState<string | undefined>();

  // Fetch initial documents on load
  useEffect(() => {
    fetchDocuments();
    // Initialize welcome state message
    setMessages([
      {
        id: 'msg_welcome',
        sender: 'assistant',
        text: "Hello! I'm NotebookAI. I've indexed your initial notes (e.g. Q3_Financial_Report.pdf). Ask me anything about your documents!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: [
          {
            id: 'doc_demo_q3_report_chk_0',
            doc_id: 'doc_demo_q3_report',
            filename: 'Q3_Financial_Report.pdf',
            page_number: 12,
            text_snippet: 'In Q3 2026, the APAC region achieved a remarkable 15% year-over-year revenue growth, outperforming initial fiscal targets by 4%. The strongest contributors were Japan and South Korea, driven by enterprise AI adoption.',
            similarity: 0.94,
          },
        ],
      },
    ]);
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await fetch('/api/documents');
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents || []);
      }
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    }
  };

  const handleUploadSuccess = (doc: DocumentMetadata) => {
    setDocuments((prev) => [doc, ...prev]);
    setActiveDocId(doc.id);
    setDrawerOpen(false);

    // Add notification in chat stream
    const sysMsg: ChatMessage = {
      id: `msg_sys_${Date.now()}`,
      sender: 'assistant',
      text: `Document "${doc.filename}" successfully parsed into ${doc.chunkCount} vector chunks across ${doc.pageCount} ${doc.pageCount === 1 ? 'page' : 'pages'}. You can now query its contents!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, sysMsg]);
  };

  const handleDeleteDocument = async (docId: string) => {
    try {
      const res = await fetch(`/api/documents?id=${docId}`, { method: 'DELETE' });
      if (res.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== docId));
        if (activeDocId === docId) setActiveDocId(undefined);
      }
    } catch (err) {
      console.error('Failed to delete document:', err);
    }
  };

  const handleSendMessage = async (queryText: string) => {
    const userMsg: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      sender: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsGenerating(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryText }),
      });

      if (!response.ok) {
        throw new Error('Failed to retrieve answer from RAG engine.');
      }

      // Decode citations header
      const citationsHeader = response.headers.get('X-Citations');
      let citations: Citation[] = [];
      if (citationsHeader) {
        try {
          const decoded = Buffer.from(citationsHeader, 'base64').toString('utf-8');
          citations = JSON.parse(decoded);
        } catch (e) {
          console.warn('Failed to parse citations header:', e);
        }
      }

      const assistantMsgId = `msg_ast_${Date.now()}`;
      let accumulatedText = '';

      // Initialize empty assistant message
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMsgId,
          sender: 'assistant',
          text: '',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          citations,
        },
      ]);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          accumulatedText += chunk;

          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId ? { ...m, text: accumulatedText } : m
            )
          );
        }
      } else {
        const data = await response.json();
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId ? { ...m, text: data.answer || '' } : m
          )
        );
      }
    } catch (err) {
      console.error('Error handling send message:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg_err_${Date.now()}`,
          sender: 'assistant',
          text: 'I cannot find this information in the uploaded notes due to a system error.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* 3D WebGL Animated Background */}
      <AnimatedBackground />

      {/* Top Header App Bar */}
      <Header
        onToggleDrawer={() => setDrawerOpen((prev) => !prev)}
        documentCount={documents.length}
      />

      {/* Navigation Drawer Sidebar */}
      <DocumentSidebar
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        documents={documents}
        onUploadSuccess={handleUploadSuccess}
        onDeleteDocument={handleDeleteDocument}
        activeDocId={activeDocId}
        onSelectDocument={(id) => setActiveDocId(id)}
      />

      {/* Main Chat Interface */}
      <ChatInterface
        messages={messages}
        onSendMessage={handleSendMessage}
        isGenerating={isGenerating}
        onSelectCitation={(citation) => setSelectedCitation(citation)}
        onOpenUpload={() => setDrawerOpen(true)}
      />

      {/* Citation Detail Modal Drawer */}
      <CitationDrawer
        citation={selectedCitation}
        onClose={() => setSelectedCitation(null)}
      />
    </div>
  );
}
