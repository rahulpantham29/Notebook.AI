# NotebookAI - Grounded 3D RAG Application

NotebookAI is a state-of-the-art Retrieval-Augmented Generation (RAG) web application featuring 3D interactive visuals, multi-provider LLM support (Google Gemini & OpenAI), and page-level document citation verification.

## 🌟 Key Features

- 📄 **Document Synthesis & Vector Indexing**: Upload PDFs, TXT, or Markdown documents with automatic text chunking and cosine similarity vector matching.
- ⚡ **Multi-Provider AI Pipeline**: Seamless streaming integration with Google Gemini (`gemini-1.5-flash`) and OpenAI (`gpt-4o-mini`), backed by an offline local grounded synthesizer.
- 🎯 **Anti-Hallucination & Citations**: Every answer includes clickable inline source citations (`[Source: filename, Page: X]`) with an interactive citation drawer.
- 📊 **PDF Analysis & Summarization**: Dedicated intent detection for executive summaries, document overviews, and key takeaway extractions.
- 🎨 **Modern Aesthetics**: Glassmorphic dark theme, ambient WebGL glow, and responsive desktop/mobile UI.

## 🛠️ Technology Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Styling**: Tailwind CSS + Glassmorphism
- **Icons**: Lucide React
- **AI Libraries**: `@google/generative-ai`, OpenAI API, `pdf-parse`
- **Language**: TypeScript

## 🚀 Quick Start

### 1. Installation

```bash
npm install
```

### 2. Configure Environment Variables

Create `.env.local` in the project root:

```env
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key

# RAG Pipeline Hyperparameters
CHUNK_SIZE=1000
CHUNK_OVERLAP=150
TOP_K=4
```

### 3. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🌐 Deployment

NotebookAI can be deployed with one click on [Vercel](https://vercel.com). Make sure to configure `GEMINI_API_KEY` and `OPENAI_API_KEY` in your Vercel Project Environment Variables.

---
*Built with Next.js 14 and Tailwind CSS.*
