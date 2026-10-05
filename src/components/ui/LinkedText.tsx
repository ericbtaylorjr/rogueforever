/** Plain text with the given phrases turned into external links. */
export function LinkedText({ text, links }: { text: string; links?: Record<string, string> }) {
  if (!links) return <>{text}</>;
  const phrases = Object.keys(links);
  const pattern = new RegExp(`(${phrases.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`);
  return (
    <>
      {text.split(pattern).map((part, i) =>
        links[part] ? (
          <a
            key={i}
            href={links[part]}
            target="_blank"
            rel="noreferrer"
            className="whitespace-nowrap text-accent underline underline-offset-2"
          >
            {part}
          </a>
        ) : (
          part
        ),
      )}
    </>
  );
}
