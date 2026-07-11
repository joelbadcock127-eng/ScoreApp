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
        style={{ ['--primary' as string]: primary, ['--secondary' as string]: secondary }}
      >
        {children}
      </body>
    </html>
  );
}
