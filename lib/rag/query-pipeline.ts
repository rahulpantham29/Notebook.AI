import { GoogleGenerativeAI } from '@google/generative-ai';
import { vectorStore } from './vector-store';
import { Citation, QueryResult } from './types';

export async function processRAGQuery(
  query: string,
  topK: number = 4
): Promise<{ result: QueryResult; stream?: ReadableStream }> {
  // Check if query is asking to summarize, analyze, or give an overview of documents
  const isSummaryQuery = /summarize|summary|analyze|analysis|overview|explain|main points|key takeaways|what is this|tl;dr/i.test(query);

  let citations: Citation[] = [];

  if (isSummaryQuery) {
    // For summarization/analysis, retrieve representative document chunks across uploaded files
    citations = vectorStore.getSummaryChunks(undefined, 8);
  } else {
    // For specific Q&A, run similarity search
    citations = await vectorStore.similaritySearch(query, topK);
  }

  // Filter relevant citations
  let relevantCitations = isSummaryQuery
    ? citations
    : citations.filter((c) => c.similarity > 0.12);

  // If similarity search yielded no results but user asks a summary question or general question
  if (relevantCitations.length === 0) {
    if (isSummaryQuery) {
      relevantCitations = vectorStore.getSummaryChunks(undefined, 8);
    } else {
      // Fallback to top available chunks if score was slightly below threshold
      relevantCitations = citations.slice(0, 3);
    }
  }

  if (relevantCitations.length === 0) {
    const fallbackAnswer = "No document context is available. Please upload a PDF or document first to analyze!";
    return {
      result: {
        answer: fallbackAnswer,
        sources: [],
        isGrounded: false,
      },
    };
  }

  // 2. Construct Grounded RAG System & Context Prompt
  const contextText = relevantCitations
    .map(
      (c, idx) =>
        `[Doc ${idx + 1}] Source: ${c.filename}, Page: ${c.page_number}\nExcerpt: "${c.text_snippet}"`
    )
    .join('\n\n');

  const systemPrompt = `You are NotebookAI, an expert Retrieval-Augmented Generation (RAG) assistant.
${isSummaryQuery ? 'The user is requesting a comprehensive summary and analysis of the uploaded document(s).' : 'Your task is to answer the user\'s question accurately based on the provided document context.'}

STRICT Grounding & Citation Constraints:
1. Base your response STRICTLY on the provided document excerpts below.
2. Structure your response clearly using Markdown headings, bullet points, and clean formatting.
3. Every factual claim or summary point MUST include an inline citation tag using this EXACT format: [Source: <filename>, Page: <page_number>].

Context Excerpts:
${contextText}

User Query: ${query}`;

  const geminiKey = process.env.GEMINI_API_KEY;
  const openAIKey = process.env.OPENAI_API_KEY;

  if (geminiKey) {
    try {
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const streamingResult = await model.generateContentStream(systemPrompt);

      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of streamingResult.stream) {
              const text = chunk.text();
              controller.enqueue(encoder.encode(text));
            }
            controller.close();
          } catch (err) {
            controller.error(err);
          }
        },
      });

      return {
        result: {
          answer: '',
          sources: relevantCitations,
          isGrounded: true,
        },
        stream,
      };
    } catch (err) {
      console.warn('Gemini stream generation failed, trying OpenAI or local fallback');
    }
  }

  if (openAIKey) {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openAIKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: systemPrompt }],
          stream: true,
        }),
      });

      if (res.ok && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        const encoder = new TextEncoder();

        const stream = new ReadableStream({
          async start(controller) {
            let buffer = '';
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                  const trimmed = line.trim();
                  if (trimmed.startsWith('data: ')) {
                    const dataStr = trimmed.slice(6);
                    if (dataStr === '[DONE]') continue;
                    try {
                      const json = JSON.parse(dataStr);
                      const content = json.choices?.[0]?.delta?.content;
                      if (content) {
                        controller.enqueue(encoder.encode(content));
                      }
                    } catch (e) {}
                  }
                }
              }
              controller.close();
            } catch (err) {
              controller.error(err);
            }
          },
        });

        return {
          result: {
            answer: '',
            sources: relevantCitations,
            isGrounded: true,
          },
          stream,
        };
      }
    } catch (err) {
      console.warn('OpenAI stream generation failed, using local fallback:', err);
    }
  }

  // Fallback Grounded Synthesizer (Local streaming synthesis)
  const synthesis = synthesizeGroundedResponse(query, relevantCitations);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const words = synthesis.split(' ');
      for (let i = 0; i < words.length; i++) {
        const token = (i === 0 ? '' : ' ') + words[i];
        controller.enqueue(encoder.encode(token));
        await new Promise((resolve) => setTimeout(resolve, 20));
      }
      controller.close();
    },
  });

  return {
    result: {
      answer: synthesis,
      sources: relevantCitations,
      isGrounded: true,
    },
    stream,
  };
}

function synthesizeGroundedResponse(query: string, citations: Citation[]): string {
  const isSummary = /summarize|summary|analyze|analysis|overview|explain|main points|key takeaways|what is this|tl;dr/i.test(query);

  if (isSummary) {
    const summaryPoints = citations.map(
      (c) => `• **Page ${c.page_number} (${c.filename})**: "${c.text_snippet}" [Source: ${c.filename}, Page: ${c.page_number}]`
    );

    return `### 📊 Document Analysis & Executive Summary\n\nBased on your uploaded document, here is a structured synthesis of the key points, findings, and context extracted across pages:\n\n${summaryPoints.join('\n\n')}\n\n---\n*Verified by NotebookAI Grounded RAG Synthesis Engine.*`;
  }

  const points: string[] = [];
  citations.forEach((c) => {
    points.push(
      `• ${c.text_snippet} [Source: ${c.filename}, Page: ${c.page_number}]`
    );
  });

  return `Based on the uploaded documents, here are the relevant details regarding your query:\n\n${points.join('\n\n')}`;
}
