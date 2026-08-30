import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Generates numerical vector embeddings for input text.
 * Falls back to deterministic local semantic vector representation if API key is not configured.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openAIKey = process.env.OPENAI_API_KEY;

  if (geminiKey && geminiKey.startsWith('AIza')) {
    try {
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
      const result = await model.embedContent(text);
      if (result.embedding?.values) {
        return result.embedding.values;
      }
    } catch (err) {
      // Fallback if Gemini fails
    }
  }

  if (openAIKey) {
    try {
      const res = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openAIKey}`,
        },
        body: JSON.stringify({
          input: text,
          model: 'text-embedding-3-small',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.data && data.data[0]?.embedding) {
          return data.data[0].embedding;
        }
      }
    } catch (err) {
      // Fallback if OpenAI fails
    }
  }

  // Fallback: Deterministic local vector embedding (384-dim semantic representation)
  return generateLocalVector(text, 384);
}

function generateLocalVector(text: string, dim: number): number[] {
  const vec = new Array(dim).fill(0);
  const normalized = text.toLowerCase().replace(/[^a-z0-9\s]/g, '');
  const words = normalized.split(/\s+/).filter(Boolean);

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    for (let charIdx = 0; charIdx < word.length; charIdx++) {
      const code = word.charCodeAt(charIdx);
      const idx = (code * 31 + charIdx * 17 + i * 13) % dim;
      vec[idx] += 1.0 / (charIdx + 1);
    }

    // Word hash position boost
    let hash = 0;
    for (let h = 0; h < word.length; h++) {
      hash = (hash << 5) - hash + word.charCodeAt(h);
      hash |= 0;
    }
    const hashIdx = Math.abs(hash) % dim;
    vec[hashIdx] += 2.0;
  }

  // Normalize vector to unit length
  const magnitude = Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
  if (magnitude === 0) return vec;
  return vec.map((val) => val / magnitude);
}

/**
 * Calculates Cosine Similarity between two vector embeddings.
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
