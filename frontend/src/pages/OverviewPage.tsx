import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { listNotes } from '../lib/api';
import type { Note } from '../lib/types';
import { ActivityChart } from '../components/ActivityChart';
import { TransferButtons } from '../components/TransferButtons';
import { Alert, Button, Spinner } from '../components/ui';

const dayName = new Intl.DateTimeFormat(undefined, { weekday: 'narrow' });
const fullDay = new Intl.DateTimeFormat(undefined, { weekday: 'long', day: 'numeric', month: 'short' });
const shortDate = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short' });

function plainText(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function words(note: Note): number {
  const text = plainText(note.content);
  return text ? text.split(' ').length : 0;
}

function lastSevenDays(notes: Note[]) {
  const days = [];

  for (let back = 6; back >= 0; back -= 1) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - back);

    const next = new Date(date);
    next.setDate(next.getDate() + 1);

    days.push({
      label: dayName.format(date),
      full: fullDay.format(date),
      count: notes.filter((note) => {
        const edited = new Date(note.updatedAt);
        return edited >= date && edited < next;
      }).length,
    });
  }

  return days;
}

export function OverviewPage() {
  const navigate = useNavigate();

  const [notes, setNotes] = useState<Note[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    listNotes('', 50)
      .then((result) => {
        if (cancelled) return;
        setNotes(result.items);
        setTotal(result.total);
        setError('');
      })
      .catch(() => {
        if (!cancelled) setError('Could not load your notes. Is the API running?');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  if (loading) return <Spinner label="Opening your notebook..." />;

  const totalWords = notes.reduce((sum, note) => sum + words(note), 0);
  const longest = notes.reduce<Note | null>(
    (best, note) => (best === null || words(note) > words(best) ? note : best),
    null
  );
  const days = lastSevenDays(notes);
  const editedThisWeek = days.reduce((sum, day) => sum + day.count, 0);
  const recent = [...notes].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5);

  const tiles = [
    { value: String(total), label: total === 1 ? 'note' : 'notes' },
    { value: totalWords.toLocaleString(), label: 'words written' },
    { value: String(editedThisWeek), label: 'edited this week' },
    { value: longest ? words(longest).toLocaleString() : '0', label: 'longest note' },
  ];

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end gap-4">
        <div>
          <h1 className="font-serif text-3xl font-medium">Overview</h1>
          <p className="mt-1 text-sm text-ink-soft">A quick look at your notebook.</p>
        </div>

        <div className="flex-1" />

        <TransferButtons
          onError={setError}
          onImported={() => {
            setError('');
            setReloadKey((key) => key + 1);
          }}
        />
      </div>

      {error ? <Alert>{error}</Alert> : null}

      <section className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((tile) => (
          <div
            key={tile.label}
            className="animate-card-in rounded-xs border border-edge bg-sheet px-5 py-4 shadow-sm"
          >
            <p className="font-serif text-3xl leading-none">{tile.value}</p>
            <p className="mt-1.5 text-xs tracking-wider text-ink-soft uppercase">{tile.label}</p>
          </div>
        ))}
      </section>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
        <section className="rounded-xs border border-edge bg-sheet px-5 py-5 shadow-sm">
          <ActivityChart days={days} />
        </section>

        <section className="rounded-xs border border-edge bg-sheet px-5 py-5 shadow-sm">
          <h2 className="mb-4 text-xs tracking-wider text-ink-soft uppercase">Recently edited</h2>

          {recent.length === 0 ? (
            <div className="py-6 text-center">
              <p className="mb-4 text-sm text-ink-soft">Nothing written yet.</p>
              <Button variant="primary" onClick={() => navigate('/notes/new')}>
                Write your first note
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-edge">
              {recent.map((note) => (
                <li key={note.id}>
                  <Link
                    to={`/notes/${note.id}`}
                    className="flex items-baseline gap-3 py-2.5 no-underline"
                  >
                    <span className="flex-1 truncate font-serif text-base text-ink">
                      {note.title}
                    </span>
                    <span className="text-xs text-ink-faint">
                      {shortDate.format(new Date(note.updatedAt))}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <Link
            to="/notes"
            className="mt-4 inline-block text-sm text-accent no-underline hover:underline"
          >
            All notes &rarr;
          </Link>
        </section>
      </div>
    </>
  );
}
