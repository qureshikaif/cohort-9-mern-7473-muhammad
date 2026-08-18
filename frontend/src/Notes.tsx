import { useEffect, useState } from 'react';
import { Alert, Button, Spinner } from './components/ui';

interface Note {
  id: string;
  title: string;
  updatedAt: string;
}

export default function Notes({ token, onLogout }: { token: string; onLogout: () => void }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/notes', {
          headers: { Authorization: 'Bearer ' + token },
        });
        const data = await res.json();

        if (!res.ok) {
          setError(data.message ?? 'Could not load your notes');
          return;
        }

        setNotes(data.items);
      } catch {
        setError('Could not reach the server');
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [token]);

  return (
    <div className="mx-auto w-full max-w-3xl">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-3xl font-medium">Notes</h1>
        <Button onClick={onLogout}>Sign out</Button>
      </header>

      {error ? <Alert>{error}</Alert> : null}

      {loading ? <Spinner label="Loading your notes" /> : null}

      {!loading && notes.length === 0 && !error ? (
        <p className="text-sm text-ink-soft">Nothing here yet.</p>
      ) : null}

      <ul className="grid gap-3">
        {notes.map((note) => (
          <li
            key={note.id}
            className="rounded-xs border border-edge bg-sheet px-5 py-4 shadow-sm"
          >
            <h2 className="font-serif text-lg">{note.title}</h2>
            <p className="mt-1 text-xs text-ink-soft">
              {new Date(note.updatedAt).toLocaleDateString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
