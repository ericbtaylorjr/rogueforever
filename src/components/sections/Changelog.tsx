import { useState } from 'react';
import { changelog } from '../../content/content';
import { SectionHeading } from '../ui/SectionHeading';

const PAGE_SIZE = 5;

export function Changelog() {
  const [page, setPage] = useState(0);
  const pageCount = Math.ceil(changelog.length / PAGE_SIZE);
  const entries = changelog.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <section id="changelog" aria-label="Changelog">
      <SectionHeading id="changelog" />

      <div className="flex flex-col">
        {entries.map((c) => (
          <div
            key={c.date}
            className="grid gap-x-[16px] gap-y-[4px] border-t border-line py-[14px] sm:grid-cols-[120px_minmax(0,1fr)]"
          >
            <span className="t-num text-[12px] text-accent">{c.date}</span>
            <p className="text-[13.5px] leading-[1.6] text-prose">{c.text}</p>
          </div>
        ))}
      </div>

      {pageCount > 1 && (
        <nav aria-label="Changelog pages" className="mt-[18px] flex items-center justify-center gap-[14px]">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="rounded-[7px] border border-line px-[12px] py-[6px] text-[12px] font-semibold text-mute transition-colors disabled:opacity-30"
          >
            Prev
          </button>
          <span role="status" className="t-num text-[11.5px] text-faint">
            <span className="sr-only">Page </span>
            {page + 1} / {pageCount}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            disabled={page === pageCount - 1}
            className="rounded-[7px] border border-line px-[12px] py-[6px] text-[12px] font-semibold text-mute transition-colors disabled:opacity-30"
          >
            Next
          </button>
        </nav>
      )}
    </section>
  );
}
