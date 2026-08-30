export interface DocumentMetadata {
  id: string;
  filename: string;
  fileType: string;
  size: number;
  pageCount: number;
  chunkCount: number;
  uploadDate: string;
  status: 'processing' | 'indexed' | 'error';
}

export interface DocumentChunk {
  id: string;
  doc_id: string;
  filename: string;
  page_number: number;
  text_snippet: string;
  embedding?: number[];
}

export interface Citation {
  id: string;
  doc_id: string;
  filename: string;
  page_number: number;
  text_snippet: string;
  similarity: number;
}

export interface QueryResult {
  answer: string;
  sources: Citation[];
  isGrounded: boolean;
}

export interface UploadResponse {
  success: boolean;
  document?: DocumentMetadata;
  chunksCreated?: number;
  error?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  citations?: Citation[];
  isGrounded?: boolean;
}
