import Image from 'next/image';

export default function Footer({ copyright }: { copyright: string }) {
  return (
    <footer className="mx-auto flex max-w-6xl items-center justify-between px-6 py-12">
      <Image src="/images/logo.png" alt="Acceso AI" width={120} height={120} className="h-20 w-auto" />
      <p className="text-lg text-muted">{copyright}</p>
    </footer>
  );
}
