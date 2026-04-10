import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';

import '@/app/globals.css';

const plusJakarta = Plus_Jakarta_Sans({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Semantic Search Engine',
  description: 'Production-ready semantic search with RAG chat over PDFs',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' className='dark'>
      <body className={plusJakarta.className}>{children}</body>
    </html>
  );
}
