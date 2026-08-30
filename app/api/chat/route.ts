import { NextRequest, NextResponse } from 'next/server';
import { processRAGQuery } from '@/lib/rag/query-pipeline';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Valid query parameter is required.' }, { status: 400 });
    }

    const { result, stream } = await processRAGQuery(query, 4);

    const citationsJson = JSON.stringify(result.sources || []);
    const encodedCitations = Buffer.from(citationsJson).toString('base64');

    if (stream) {
      return new Response(stream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'X-Citations': encodedCitations,
          'X-Is-Grounded': String(result.isGrounded),
        },
      });
    }

    return NextResponse.json(
      {
        answer: result.answer,
        citations: result.sources,
        isGrounded: result.isGrounded,
      },
      {
        headers: {
          'X-Citations': encodedCitations,
        },
      }
    );
  } catch (err) {
    console.error('Error in chat API route:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
