'use client';

import { usePathname } from 'next/navigation';

export default function ShareBar({ text }: { text: string }) {
  const pathname = usePathname();
  const url = typeof window !== 'undefined' ? `${window.location.origin}/` : '/';
  const enc = encodeURIComponent(url);

  const links = [
    {
      key: 'facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${enc}`,
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5h1.65V3.6c-.3-.04-1.3-.12-2.45-.12-2.4 0-4.05 1.46-4.05 4.15v2.27H7.5V13h2.7v8h3.3z" />
        </svg>
      ),
    },
    {
      key: 'x',
      href: `https://twitter.com/intent/tweet?url=${enc}`,
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path d="M18.9 2H22l-6.77 7.74L23.2 22h-6.23l-4.88-6.38L6.5 22H3.37l7.24-8.28L1.6 2h6.39l4.41 5.83L18.9 2zm-1.1 18.1h1.73L6.6 3.8H4.75L17.8 20.1z" />
        </svg>
      ),
    },
    {
      key: 'linkedin',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc}`,
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path d="M4.98 3.5A2.49 2.49 0 1 1 5 8.48a2.49 2.49 0 0 1-.02-4.98zM3 9.75h4v11.5H3V9.75zm6.5 0h3.83v1.57h.05c.53-1 1.84-2.06 3.79-2.06 4.05 0 4.8 2.67 4.8 6.14v5.85h-4v-5.19c0-1.24-.02-2.83-1.72-2.83-1.72 0-1.99 1.35-1.99 2.74v5.28h-3.99V9.75h-.77z" />
        </svg>
      ),
    },
  ];
  void pathname;

  return (
    <section className="bg-navy px-6 py-10">
      <p className="text-center text-xl font-semibold text-white md:text-2xl">{text}</p>
      <div className="mt-6 flex items-center justify-center gap-8 text-white">
        {links.map((l) => (
          <a key={l.key} href={l.href} target="_blank" rel="noopener noreferrer" aria-label={l.key} className="hover:opacity-75">
            {l.icon}
          </a>
        ))}
      </div>
    </section>
  );
}
