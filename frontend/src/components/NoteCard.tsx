import type { Note } from '../lib/types';

const formatter = new Intl.DateTimeFormat(undefined, {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

// Notes are stored as the editor's HTML. The preview strips the tags instead of
// rendering them, so a note can never inject markup into the dashboard.
function toExcerpt(html: string): string {
  const text = html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return text || 'Empty note';
}

interface Props {
  note: Note;
  index: number;
  onOpen: () => void;
}

export function NoteCard({ note, index, onOpen }: Props) {
  return (
    <button
      type="button"
      onClick={onOpen}
      // Staggered so the grid deals itself out like a hand of cards, capped so a
      // long list does not leave the last rows waiting.
      style={{ animationDelay: `${Math.min(index, 12) * 45}ms` }}
      className="ruled group relative flex min-h-48 animate-card-in cursor-pointer flex-col rounded-l-xs rounded-r-lg border border-edge bg-sheet bg-[position:0_46px] pt-5 pr-5 pb-4 pl-8 text-left shadow-sm transition-[transform,box-shadow] duration-200 ease-paper hover:-translate-y-1 hover:-rotate-[0.5deg] hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <span className="absolute inset-y-0 left-5 w-px bg-margin-line/75" />

      <h2 className="mb-2.5 font-serif text-lg leading-7 font-medium">{note.title}</h2>

      <p className="line-clamp-4 flex-1 text-sm leading-7 text-ink-soft">
        {toExcerpt(note.content)}
      </p>

      <span className="mt-3.5 text-[0.72rem] tracking-wider text-ink-faint uppercase">
        {formatter.format(new Date(note.updatedAt))}
      </span>
    </button>
  );
}
