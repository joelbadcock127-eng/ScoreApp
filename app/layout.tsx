import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'The AI Opportunity Assessment',
  description:
    'Find your business’s most valuable AI opportunity in under 3 minutes. Get tailored, practical results you can act on immediately.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white text-ink antialiased`}>{children}</body>
    </html>
  );
}
