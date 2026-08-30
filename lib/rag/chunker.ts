import { ParsedDocument } from './parser';
import { DocumentChunk } from './types';

interface ChunkingOptions {
  chunkSize?: number;
  chunkOverlap?: number;
}

/**
 * Recursive Character Splitting algorithm.
 * Splitting priority: Paragraphs ("\n\n"), Lines ("\n"), Sentences (". "), Words (" "), Characters ("")
 */
export function chunkDocument(
  doc: ParsedDocument,
  docId: string,
  options: ChunkingOptions = {}
): DocumentChunk[] {
  const chunkSize = options.chunkSize || 1000;
  const chunkOverlap = options.chunkOverlap || 150;
  const chunks: DocumentChunk[] = [];
  let chunkIndex = 0;

  for (const page of doc.pages) {
    const pageText = page.text;
    if (!pageText.trim()) continue;

    const pageChunks = recursiveSplitText(pageText, chunkSize, chunkOverlap);

    for (const snippet of pageChunks) {
      if (snippet.trim()) {
        chunks.push({
          id: `${docId}_chk_${chunkIndex++}`,
          doc_id: docId,
          filename: doc.filename,
          page_number: page.page_number,
          text_snippet: snippet.trim(),
        });
      }
    }
  }

  return chunks;
}

function recursiveSplitText(text: string, chunkSize: number, chunkOverlap: number): string[] {
  const separators = ['\n\n', '\n', '. ', '? ', '! ', '; ', ' ', ''];
  return splitHelper(text, chunkSize, chunkOverlap, separators);
}

function splitHelper(
  text: string,
  chunkSize: number,
  chunkOverlap: number,
  separators: string[]
): string[] {
  if (text.length <= chunkSize) {
    return [text];
  }

  const separator = separators.find((sep) => text.includes(sep)) ?? '';
  const splits = separator !== '' ? text.split(separator) : text.split('');

  const result: string[] = [];
  let currentChunk = '';

  for (let i = 0; i < splits.length; i++) {
    const part = splits[i];
    const candidate = currentChunk
      ? currentChunk + (separator || '') + part
      : part;

    if (candidate.length <= chunkSize) {
      currentChunk = candidate;
    } else {
      if (currentChunk) {
        result.push(currentChunk);
        // Overlap logic: keep last overlap characters from current chunk
        const overlapStart = Math.max(0, currentChunk.length - chunkOverlap);
        currentChunk = currentChunk.slice(overlapStart) + (separator || '') + part;
      } else {
        // Single split is larger than chunkSize, recurse with finer separator
        const subSeparators = separators.slice(separators.indexOf(separator) + 1);
        if (subSeparators.length > 0) {
          const subChunks = splitHelper(part, chunkSize, chunkOverlap, subSeparators);
          result.push(...subChunks);
        } else {
          result.push(part.slice(0, chunkSize));
        }
      }
    }
  }

  if (currentChunk.trim()) {
    result.push(currentChunk);
  }

  return result;
}
