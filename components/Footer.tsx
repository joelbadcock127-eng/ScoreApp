/* eslint-disable @next/next/no-img-element */
export default function Footer({
  copyright,
  logoUrl,
  logoHref,
}: {
  copyright: string;
  logoUrl: string;
  logoHref?: string;
}) {
  const logo = <img src={logoUrl} alt="Logo" className="h-20 w-auto" />;
  return (
    <footer className="mx-auto flex max-w-6xl items-center justify-between px-6 py-12">
      {logoHref ? (
        <a href={logoHref} target="_blank" rel="noopener noreferrer">
          {logo}
        </a>
      ) : (
        logo
      )}
      <p className="text-lg text-muted">{copyright}</p>
    </footer>
  );
}
