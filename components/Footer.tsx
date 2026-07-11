/* eslint-disable @next/next/no-img-element */
export default function Footer({ copyright, logoUrl }: { copyright: string; logoUrl: string }) {
  return (
    <footer className="mx-auto flex max-w-6xl items-center justify-between px-6 py-12">
      <img src={logoUrl} alt="Logo" className="h-20 w-auto" />
      <p className="text-lg text-muted">{copyright}</p>
    </footer>
  );
}
