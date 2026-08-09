import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listNotes } from '../lib/api';
import { useNoteEvents } from '../lib/useNoteEvents';
import type { Note } from '../lib/types';
import { NoteCard } from '../components/NoteCard';
import { TransferButtons } from '../components/TransferButtons';
import { Alert, Spinner } from '../components/ui';

export function DashboardPage() {
  const navigate = useNavigate();

  const [notes, setNotes] = useState<Note[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(async (term: string) => {
    try {
      const result = await listNotes(term);
      setNotes(result.items);
      setError('');
    } catch {
      setError('Could not load your notes. Is the API running?');
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced so typing in the search box doesn't fire a request per keystroke.
  useEffect(() => {
    const timer = setTimeout(() => void load(search), search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [search, load]);

  // Applied to the list in place rather than refetching, so another tab's edit
  // does not wipe out whatever the user is searching for here.
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

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end gap-4">
        <div>
          <h1 className="font-serif text-3xl font-medium">Your notes</h1>
          <p className="mt-1 text-sm text-ink-soft">
            {notes.length === 0 ? 'Nothing here yet' : `${notes.length} in the notebook`}
          </p>
        </div>

        <div className="flex-1" />

        <TransferButtons
          onError={setError}
          onImported={(count) => {
            setError('');
            setNotice(`Imported ${count} ${count === 1 ? 'note' : 'notes'}`);
            void load(search);
          }}
        />

        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search notes…"
          aria-label="Search notes"
          className="w-full rounded-full border border-edge bg-sheet px-3.5 py-2 transition-shadow duration-150 ease-paper focus:border-accent focus:ring-3 focus:ring-accent-soft focus:outline-none sm:w-70"
        />
      </div>

      {error ? <Alert>{error}</Alert> : null}

      {notice ? (
        <p className="mb-4 rounded-lg border-l-[3px] border-accent bg-accent/8 px-3.5 py-2.5 text-sm">
          {notice}
        </p>
      ) : null}

      {loading ? (
        <Spinner label="Opening your notebook…" />
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-5">
          <button
            type="button"
            onClick={() => navigate('/notes/new')}
            className="grid min-h-48 cursor-pointer place-content-center gap-1.5 rounded-lg border border-dashed border-ink/25 text-sm text-ink-soft transition-colors duration-200 ease-paper hover:border-accent hover:bg-accent/5 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <span className="text-center text-3xl leading-none">+</span>
            New note
          </button>

          {notes.map((note, index) => (
            <NoteCard
              key={note.id}
              note={note}
              index={index}
              onOpen={() => navigate(`/notes/${note.id}`)}
            />
          ))}
        </div>
      )}

      {!loading && notes.length === 0 && search ? (
        <p className="py-10 text-center text-sm text-ink-soft">
          Nothing matches “{search}”.
        </p>
      ) : null}
    </>
  );
}
