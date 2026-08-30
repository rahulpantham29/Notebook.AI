import { NextRequest, NextResponse } from 'next/server';
import { vectorStore } from '@/lib/rag/vector-store';

export async function GET() {
  try {
    const docs = vectorStore.getDocuments();
    return NextResponse.json({ success: true, documents: docs });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch documents.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Document ID required.' }, { status: 400 });
    }

    const deleted = vectorStore.deleteDocument(id);
    return NextResponse.json({ success: deleted });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to delete document.' }, { status: 500 });
  }
}
