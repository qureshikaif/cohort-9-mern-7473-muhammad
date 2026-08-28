import { plainText } from '../lib/text';
import type { Note } from '../lib/types';

const formatter = new Intl.DateTimeFormat(undefined, {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

function toExcerpt(html: string): string {
  return plainText(html) || 'Empty note';
}

interface Props {
  note: Note;
  index: number;
  onOpen: () => void;
  onDelete?: () => void;
}

export function NoteCard({ note, index, onOpen, onDelete }: Readonly<Props>) {
  return (
    <button
      type="button"
      onClick={onOpen}
      style={{ animationDelay: `${Math.min(index, 12) * 45}ms` }}
      className="ruled group relative flex min-h-48 animate-card-in cursor-pointer flex-col rounded-l-xs rounded-r-lg border border-edge bg-sheet bg-[position:0_46px] pt-5 pr-5 pb-4 pl-8 text-left shadow-sm transition-[transform,box-shadow] duration-200 ease-paper hover:-translate-y-1 hover:-rotate-[0.5deg] hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <span className="absolute inset-y-0 left-5 w-px bg-margin-line/70" />

      {onDelete ? (
        <span
          role="button"
          tabIndex={0}
          aria-label={`Delete ${note.title}`}
          onClick={(event) => {
            event.stopPropagation();
            onDelete();
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.stopPropagation();
              event.preventDefault();
              onDelete();
            }
          }}
          className="absolute top-3 right-3 grid size-7 cursor-pointer place-items-center rounded-full text-ink-faint opacity-0 transition-all duration-150 group-hover:opacity-100 hover:bg-danger/10 hover:text-danger focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-accent"
        >
          &times;
        </span>
      ) : null}

      <h2 className="mb-2.5 font-serif text-lg leading-7 font-medium">{note.title}</h2>

      <p className="line-clamp-4 flex-1 text-sm leading-7 text-ink-soft">
        {toExcerpt(note.content)}
      </p>

      <span className="mt-3.5 text-xs tracking-wider text-ink-faint uppercase">
        {formatter.format(new Date(note.updatedAt))}
      </span>
    </button>
  );
}
