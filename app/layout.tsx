import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NotebookAI - 3D Interactive RAG Web App",
  description: "Production-ready Full-Stack RAG application for document synthesis and question answering with precise source citations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background text-on-background min-h-screen overflow-x-hidden relative flex flex-col antialiased">
        {children}
      </body>
    </html>
  );
}
