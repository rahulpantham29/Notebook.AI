import { NextRequest, NextResponse } from 'next/server';
import { parseDocument } from '@/lib/rag/parser';
import { chunkDocument } from '@/lib/rag/chunker';
import { vectorStore } from '@/lib/rag/vector-store';
import { DocumentMetadata, UploadResponse } from '@/lib/rag/types';

export async function POST(req: NextRequest): Promise<NextResponse<UploadResponse>> {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file uploaded.' },
        { status: 400 }
      );
    }

    const filename = file.name;
    const size = file.size;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Parse document
    const parsedDoc = await parseDocument(buffer, filename);

    // 2. Chunk document (chunk_size: 1000, chunk_overlap: 150)
    const docId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const chunkSize = Number(process.env.CHUNK_SIZE) || 1000;
    const chunkOverlap = Number(process.env.CHUNK_OVERLAP) || 150;

    const chunks = chunkDocument(parsedDoc, docId, { chunkSize, chunkOverlap });

    // 3. Create metadata
    const metadata: DocumentMetadata = {
      id: docId,
      filename,
      fileType: filename.split('.').pop() || 'file',
      size,
      pageCount: parsedDoc.pageCount,
      chunkCount: chunks.length,
      uploadDate: new Date().toISOString(),
      status: 'indexed',
    };

    // 4. Store vectors
    await vectorStore.addDocument(metadata, chunks);

    return NextResponse.json({
      success: true,
      document: metadata,
      chunksCreated: chunks.length,
    });
  } catch (err) {
    console.error('Error during file ingestion:', err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to ingest file.',
      },
      { status: 500 }
    );
  }
}
