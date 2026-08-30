import pdfParse from 'pdf-parse';

export interface ParsedPage {
  page_number: number;
  text: string;
}

export interface ParsedDocument {
  filename: string;
  pageCount: number;
  pages: ParsedPage[];
}

export async function parseDocument(fileBuffer: Buffer, filename: string): Promise<ParsedDocument> {
  const extension = filename.split('.').pop()?.toLowerCase() || '';

  if (extension === 'pdf') {
    try {
      const pdfData = await pdfParse(fileBuffer);
      const fullText = pdfData.text || '';
      
      // Attempt splitting by form feed or page delimiters if available
      let pageTexts = fullText.split(/\f/);
      if (pageTexts.length <= 1) {
        // Fallback: split by double newlines or chunks of ~1500 chars to estimate pages
        const pageSize = 1500;
        pageTexts = [];
        for (let i = 0; i < fullText.length; i += pageSize) {
          pageTexts.push(fullText.slice(i, i + pageSize));
        }
      }

      const pages: ParsedPage[] = pageTexts
        .map((t) => t.trim())
        .filter((t) => t.length > 0)
        .map((text, idx) => ({
          page_number: idx + 1,
          text,
        }));

      return {
        filename,
        pageCount: pdfData.numpages || pages.length || 1,
        pages: pages.length > 0 ? pages : [{ page_number: 1, text: fullText.trim() }],
      };
    } catch (err) {
      console.error('Error parsing PDF buffer:', err);
      // Fallback text extraction if binary parse fails
      const textContent = fileBuffer.toString('utf-8');
      return {
        filename,
        pageCount: 1,
        pages: [{ page_number: 1, text: textContent }],
      };
    }
  }

  // Handle plain text or markdown files (.txt, .md)
  const textContent = fileBuffer.toString('utf-8');
  // Split long markdown/text into ~1200 char logical sections/pages
  const sectionSize = 1200;
  const pages: ParsedPage[] = [];
  let pageNum = 1;

  if (textContent.length === 0) {
    pages.push({ page_number: 1, text: '' });
  } else {
    for (let i = 0; i < textContent.length; i += sectionSize) {
      const slice = textContent.slice(i, i + sectionSize).trim();
      if (slice) {
        pages.push({ page_number: pageNum++, text: slice });
      }
    }
  }

  return {
    filename,
    pageCount: pages.length || 1,
    pages,
  };
}
