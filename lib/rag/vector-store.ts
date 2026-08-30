import { DocumentChunk, DocumentMetadata, Citation } from './types';
import { cosineSimilarity, generateEmbedding } from './embeddings';

class VectorStoreManager {
  private chunks: DocumentChunk[] = [];
  private documents: Map<string, DocumentMetadata> = new Map();

  constructor() {
    this.seedDefaultDocument();
  }

  /**
   * Seed default demo document so the user can query immediately out of the box!
   */
  private async seedDefaultDocument() {
    const docId = 'doc_demo_q3_report';
    const filename = 'Q3_Financial_Report.pdf';
    
    this.documents.set(docId, {
      id: docId,
      filename,
      fileType: 'pdf',
      size: 2516582, // 2.4 MB
      pageCount: 42,
      chunkCount: 3,
      uploadDate: new Date().toISOString(),
      status: 'indexed',
    });

    const sampleChunks: Array<{ page: number; text: string }> = [
      {
        page: 12,
        text: 'In Q3 2026, the APAC region achieved a remarkable 15% year-over-year revenue growth, outperforming initial fiscal targets by 4%. The strongest contributors were Japan and South Korea, driven by enterprise AI adoption.',
      },
      {
        page: 15,
        text: 'Supply chain friction slightly disrupted hardware delivery cycles during Q2, leading to a temporary inventory rollover into early Q3. However, software subscriptions grew by 28% across all commercial tiers.',
      },
      {
        page: 22,
        text: 'Operating margins expanded to 34.5% in Q3, up from 31.2% in Q2. R&D expenditure remained focused on autonomous RAG data synthesis pipelines and next-generation WebGL user interfaces.',
      },
    ];

    for (let i = 0; i < sampleChunks.length; i++) {
      const item = sampleChunks[i];
      const chunkObj: DocumentChunk = {
        id: `${docId}_chk_${i}`,
        doc_id: docId,
        filename,
        page_number: item.page,
        text_snippet: item.text,
      };
      this.chunks.push(chunkObj);
      generateEmbedding(item.text).then((emb) => {
        chunkObj.embedding = emb;
      });
    }
  }

  public async addDocument(metadata: DocumentMetadata, chunks: DocumentChunk[]) {
    this.documents.set(metadata.id, metadata);

    for (const chunk of chunks) {
      if (!chunk.embedding) {
        chunk.embedding = await generateEmbedding(chunk.text_snippet);
      }
      this.chunks.push(chunk);
    }
  }

  public getDocuments(): DocumentMetadata[] {
    return Array.from(this.documents.values());
  }

  public deleteDocument(docId: string): boolean {
    const existed = this.documents.delete(docId);
    this.chunks = this.chunks.filter((c) => c.doc_id !== docId);
    return existed;
  }

  public async similaritySearch(query: string, topK: number = 4): Promise<Citation[]> {
    if (this.chunks.length === 0) return [];

    const queryVec = await generateEmbedding(query);
    const scored = this.chunks.map((chunk) => {
      const similarity = chunk.embedding
        ? cosineSimilarity(queryVec, chunk.embedding)
        : 0;
      return { chunk, similarity };
    });

    // Also calculate token overlap matching score for keyword precision
    const queryTokens = query.toLowerCase().split(/\s+/).filter(b => b.length > 2);
    
    scored.forEach((item) => {
      const textLower = item.chunk.text_snippet.toLowerCase();
      let matchCount = 0;
      queryTokens.forEach((token) => {
        if (textLower.includes(token)) matchCount++;
      });
      const keywordScore = queryTokens.length > 0 ? matchCount / queryTokens.length : 0;
      // Combined similarity score
      item.similarity = item.similarity * 0.7 + keywordScore * 0.3;
    });

    scored.sort((a, b) => b.similarity - a.similarity);

    const results = scored.slice(0, topK).map(({ chunk, similarity }) => ({
      id: chunk.id,
      doc_id: chunk.doc_id,
      filename: chunk.filename,
      page_number: chunk.page_number,
      text_snippet: chunk.text_snippet,
      similarity: parseFloat(similarity.toFixed(4)),
    }));

    return results;
  }

  public getSummaryChunks(docId?: string, topK: number = 8): Citation[] {
    let targetChunks = this.chunks;
    if (docId) {
      targetChunks = this.chunks.filter((c) => c.doc_id === docId);
    }
    if (targetChunks.length === 0) targetChunks = this.chunks;

    return targetChunks.slice(0, topK).map((chunk) => ({
      id: chunk.id,
      doc_id: chunk.doc_id,
      filename: chunk.filename,
      page_number: chunk.page_number,
      text_snippet: chunk.text_snippet,
      similarity: 0.95,
    }));
  }
}

// Global Singleton Instance
const globalForVectorStore = global as unknown as { vectorStore?: VectorStoreManager };

if (!globalForVectorStore.vectorStore || typeof globalForVectorStore.vectorStore.getSummaryChunks !== 'function') {
  globalForVectorStore.vectorStore = new VectorStoreManager();
}

export const vectorStore = globalForVectorStore.vectorStore;

if (process.env.NODE_ENV !== 'production') {
  globalForVectorStore.vectorStore = vectorStore;
}
