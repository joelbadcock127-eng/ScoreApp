import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { getConfig } from '@/lib/server/config';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'The AI Opportunity Assessment',
  description:
    'Find your business’s most valuable AI opportunity in under 3 minutes. Get tailored, practical results you can act on immediately.',
};

export const dynamic = 'force-dynamic';

// "28 120 254" form so Tailwind opacity modifiers (bg-primary/10 …) work.
function hexToRgbTriple(hex: string, fallback: string): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return fallback;
  const n = parseInt(m[1], 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let primary = '#1c78fe';
  let secondary = '#152042';
  try {
    const config = await getConfig();
    primary = config.branding.primaryColor || primary;
    secondary = config.branding.secondaryColor || secondary;
  } catch {
    // Missing env/db at build time: fall back to defaults.
  }
  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-white text-ink antialiased`}
        style={{
          ['--primary' as string]: primary,
          ['--secondary' as string]: secondary,
          ['--primary-rgb' as string]: hexToRgbTriple(primary, '28 120 254'),
          ['--secondary-rgb' as string]: hexToRgbTriple(secondary, '21 32 66'),
        }}
      >
        {children}
      </body>
    </html>
  );
}
