You are an expert Full-Stack AI Engineer specializing in Retrieval-Augmented Generation (RAG) applications.

Build a full-stack, production-ready web application where users can:
1. Upload lecture notes, text files, and PDF documents.
2. Ask natural language questions.
3. Receive accurate, grounded answers strictly derived from their uploaded documents, complete with precise source citations (page numbers and excerpt snippets).
4. Website should look 3D animated Interactive and smooth.
### TECH STACK & REQUIREMENTS

1. Frontend:
   - Framework: Next.js 14+ (App Router, TypeScript).
   - UI / Styling: Tailwind CSS, Lucide Icons, Shadcn UI.
   - Features: Drag-and-drop file upload zone with progress bars, chat interface with streaming text responses, sidebar showing uploaded documents, and expandable source citation drawers.

2. Backend & API:
   - Framework: FastAPI (Python) or Next.js API Routes (Node.js/TypeScript).
   - PDF Processing: `pypdf` / `pdfplumber` (Python) or `pdf-parse` (TypeScript). Extract text along with metadata (`page_number`, `document_name`).
   - Chunking Strategy: Recursive Character Splitting (`chunk_size: 1000`, `chunk_overlap: 150`).

3. Vector Database & Embeddings:
   - Embeddings: OpenAI `text-embedding-3-small` or Google Gemini `text-embedding-004`.
   - Vector Store: Pinecone / Supabase pgvector / Qdrant. Store embeddings with metadata payload: `{ doc_id, filename, page_number, text_snippet }`.

4. RAG Retrieval & Prompt Pipeline:
   - Retrieve top-k (k=4) most relevant chunks using Cosine Similarity.
   - System Prompt constraints: Strictly avoid hallucination. If the answer cannot be deduced from the provided context, state clearly: "I cannot find this information in the uploaded notes."
   - Citation Format: Always append `[Source: <filename>, Page: <page_number>]` to claims.

### DELIVERABLES NEEDED:

1. `schema & setup`: Environment variables configuration (`.env.example`) and vector DB initialization script.
2. `ingestion_pipeline`: Full document parsing, chunking, embedding generation, and vector upsert script.
3. `query_pipeline`: Similarity search retriever, prompt constructor, and LLM query handler with streaming response.
4. `frontend_ui`: Next.js pages/components for:
   - `FileUpload.tsx`: Handles PDF uploads with progress and status feedback.
   - `ChatInterface.tsx`: Handles message history, markdown rendering, streaming tokens, and source citation chips.

Provide clean, modular, production-ready code with complete type safety and error handling.