import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteNote, listNotes } from '../lib/api';
import { useNoteEvents } from '../lib/useNoteEvents';
import { plainText } from '../lib/text';
import type { Note } from '../lib/types';
import { NoteCard } from '../components/NoteCard';
import { TransferButtons } from '../components/TransferButtons';
import { Alert, Button, Spinner } from '../components/ui';

type SortKey = 'recent' | 'oldest' | 'title';
type View = 'grid' | 'list';

const sortOptions: { key: SortKey; label: string }[] = [
  { key: 'recent', label: 'Newest' },
  { key: 'oldest', label: 'Oldest' },
  { key: 'title', label: 'A-Z' },
];

const dayFormat = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short' });

function EmptyState({
  search,
  onClear,
  onNew,
}: Readonly<{ search: string; onClear: () => void; onNew: () => void }>) {
  if (search) {
    return (
      <div className="rounded-xs border border-dashed border-edge px-6 py-16 text-center">
        <p className="font-serif text-xl">Nothing matches "{search}"</p>
        <p className="mt-1 mb-5 text-sm text-ink-soft">Try a different word, or clear the search.</p>
        <Button onClick={onClear}>Clear search</Button>
      </div>
    );
  }

  return (
    <div className="rounded-xs border border-dashed border-edge px-6 py-16 text-center">
      <p className="font-serif text-xl">Your notebook is empty</p>
      <p className="mt-1 mb-5 text-sm text-ink-soft">Press n to start writing.</p>
      <Button variant="primary" onClick={onNew}>
        Write your first note
      </Button>
    </div>
  );
}

export function NotesPage() {
  const navigate = useNavigate();
  const searchBox = useRef<HTMLInputElement>(null);

  const [notes, setNotes] = useState<Note[]>([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('recent');
  const [view, setView] = useState<View>('grid');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const timer = setTimeout(
      () => {
        listNotes(search)
          .then((result) => {
            if (cancelled) return;
            setNotes(result.items);
            setError('');
          })
          .catch(() => {
            if (!cancelled) setError('Could not load your notes. Is the API running?');
          })
          .finally(() => {
            if (!cancelled) setLoading(false);
          });
      },
      search ? 300 : 0
    );

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [search, reloadKey]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const typing = document.activeElement?.tagName === 'INPUT';

      if (event.key === '/' && !typing) {
        event.preventDefault();
        searchBox.current?.focus();
      }

      if (event.key === 'n' && !typing) navigate('/notes/new');
    }

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [navigate]);

  const handlers = useMemo(
    () => ({
      onCreated: (note: Note) => {
        setNotes((current) =>
          current.some((n) => n.id === note.id) ? current : [note, ...current]
        );
      },
      onUpdated: (note: Note) => {
        setNotes((current) => current.map((n) => (n.id === note.id ? note : n)));
      },
      onDeleted: (id: string) => {
        setNotes((current) => current.filter((n) => n.id !== id));
      },
    }),
    []
  );

  useNoteEvents(handlers);

  const visible = useMemo(() => {
    const copy = [...notes];

    if (sort === 'title') return copy.sort((a, b) => a.title.localeCompare(b.title));
    if (sort === 'oldest') return copy.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    return copy.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [notes, sort]);

  async function handleDelete(note: Note) {
    if (!window.confirm(`Delete "${note.title}"?`)) return;

    setNotes((current) => current.filter((n) => n.id !== note.id));

    try {
      await deleteNote(note.id);
      setNotice(`Deleted "${note.title}"`);
    } catch {
      setNotes((current) => (current.some((n) => n.id === note.id) ? current : [...current, note]));
      setError('Could not delete that note');
    }
  }

  const query = search.trim();
  const showGrid = !loading && visible.length > 0 && view === 'grid';
  const showList = !loading && visible.length > 0 && view === 'list';
  const showEmpty = !loading && visible.length === 0;
  const counted = `${notes.length} ${notes.length === 1 ? 'note' : 'notes'}`;

  return (
    <>
      <div className="mb-5">
        <h1 className="font-serif text-3xl font-medium">Your notes</h1>
        <p className="mt-1 text-sm text-ink-soft">
          {counted}
          {query ? ' matching' : ' in the notebook'}
        </p>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-3 border-y border-edge py-3">
        <div className="relative">
          <input
            ref={searchBox}
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes    /"
            aria-label="Search notes"
            className="w-full rounded-full border border-edge bg-sheet py-2 pr-9 pl-3.5 transition-shadow duration-150 ease-paper focus:border-accent focus:ring-2 focus:ring-accent-soft focus:outline-none sm:w-72"
          />
          {search ? (
            <button
              type="button"
              onClick={() => setSearch('')}
              aria-label="Clear search"
              className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-ink-soft hover:text-ink"
            >
              &times;
            </button>
          ) : null}
        </div>

        <div className="flex items-center gap-1" role="group" aria-label="Sort notes">
          {sortOptions.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setSort(option.key)}
              aria-pressed={sort === option.key}
              className="cursor-pointer rounded-md px-2.5 py-1 text-sm text-ink-soft transition-colors duration-150 hover:bg-ink/5 hover:text-ink aria-pressed:bg-accent-soft aria-pressed:text-accent"
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1" role="group" aria-label="Layout">
          {(['grid', 'list'] as View[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setView(option)}
              aria-pressed={view === option}
              aria-label={`${option} view`}
              className="cursor-pointer rounded-md px-2.5 py-1 text-sm text-ink-soft transition-colors duration-150 hover:bg-ink/5 hover:text-ink aria-pressed:bg-accent-soft aria-pressed:text-accent"
            >
              {option === 'grid' ? '▦' : '☰'}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        <TransferButtons
          onError={setError}
          onImported={(count) => {
            setError('');
            setNotice(`Imported ${count} ${count === 1 ? 'note' : 'notes'}`);
            setReloadKey((key) => key + 1);
          }}
        />

        <Button variant="primary" onClick={() => navigate('/notes/new')}>
          New note
        </Button>
      </div>

      {error ? <Alert>{error}</Alert> : null}

      {notice ? (
        <p className="mb-4 flex items-center gap-3 rounded-lg border-l-4 border-accent bg-accent/10 px-3.5 py-2.5 text-sm">
          {notice}
          <button
            type="button"
            onClick={() => setNotice('')}
            aria-label="Dismiss"
            className="ml-auto cursor-pointer text-ink-soft hover:text-ink"
          >
            &times;
          </button>
        </p>
      ) : null}

      {loading ? <Spinner label="Opening your notebook..." /> : null}

      {showGrid ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-5">
          {visible.map((note, index) => (
            <NoteCard
              key={note.id}
              note={note}
              index={index}
              onOpen={() => navigate(`/notes/${note.id}`)}
              onDelete={() => void handleDelete(note)}
            />
          ))}
        </div>
      ) : null}

      {showList ? (
        <ul className="divide-y divide-edge rounded-xs border border-edge bg-sheet">
          {visible.map((note) => (
            <li key={note.id} className="group flex items-center gap-4 px-5 py-3.5">
              <button
                type="button"
                onClick={() => navigate(`/notes/${note.id}`)}
                className="min-w-0 flex-1 cursor-pointer text-left"
              >
                <span className="block truncate font-serif text-lg">{note.title}</span>
                <span className="mt-0.5 block truncate text-sm text-ink-soft">
                  {plainText(note.content) || 'Empty note'}
                </span>
              </button>

              <span className="hidden shrink-0 text-xs tracking-wider text-ink-faint uppercase sm:inline">
                {dayFormat.format(new Date(note.updatedAt))}
              </span>

              <button
                type="button"
                onClick={() => void handleDelete(note)}
                aria-label={`Delete ${note.title}`}
                className="shrink-0 cursor-pointer rounded-full px-2 py-1 text-ink-faint opacity-0 transition-opacity duration-150 group-hover:opacity-100 hover:text-danger focus-visible:opacity-100"
              >
                &times;
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {showEmpty ? (
        <EmptyState
          search={query}
          onClear={() => setSearch('')}
          onNew={() => navigate('/notes/new')}
        />
      ) : null}
    </>
  );
}
