import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { readShared, writeShared } from '../lib/api';
import { useSharedSync } from '../lib/useSharedSync';
import type { Note } from '../lib/types';
import { RichTextEditor } from '../components/RichTextEditor';
import { Alert, Spinner } from '../components/ui';

export function SharedNotePage() {
  const { token } = useParams<{ token: string }>();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loadedToken, setLoadedToken] = useState<string>();
  const [failed, setFailed] = useState('');
  const [status, setStatus] = useState('');

  const lastSaved = useRef('');
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    readShared(token)
      .then(({ note }) => {
        if (cancelled) return;
        setTitle(note.title);
        setContent(note.content);
        lastSaved.current = note.content;
        setLoadedToken(token);
      })
      .catch(() => {
        if (!cancelled) setFailed('This link is not active anymore.');
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const onRemote = useCallback((note: Note) => {
    if (note.content === lastSaved.current) return;

    lastSaved.current = note.content;
    setTitle(note.title);
    setContent(note.content);
    setStatus('Updated by someone else');
  }, []);

  useSharedSync(loadedToken ?? null, onRemote);

  function save(next: { title?: string; content?: string }) {
    if (!token) return;

    clearTimeout(timer.current);
    setStatus('Saving...');

    timer.current = setTimeout(() => {
      writeShared(token, next)
        .then(({ note }) => {
          lastSaved.current = note.content;
          setStatus('Saved');
        })
        .catch(() => setStatus('Could not save'));
    }, 700);
  }

  if (failed) {
    return (
      <div className="mx-auto max-w-lg px-5 py-20">
        <Alert>{failed}</Alert>
      </div>
    );
  }

  if (loadedToken !== token) {
    return <Spinner label="Opening the shared note..." />;
  }

  return (
    <div className="desk-glow min-h-screen px-4 py-8 sm:px-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-4 flex items-center gap-3">
          <span className="font-serif text-lg">Shared note</span>
          <span className="text-xs text-ink-soft">{status}</span>
        </div>

        <div className="rounded-xs border border-edge bg-sheet px-5 py-6 shadow-lg sm:px-12 sm:py-10">
          <input
            value={title}
            aria-label="Note title"
            placeholder="Untitled note"
            onChange={(e) => {
              setTitle(e.target.value);
              save({ title: e.target.value });
            }}
            className="mb-1.5 w-full border-none bg-transparent py-1 font-serif text-3xl font-medium placeholder:text-ink-faint focus:outline-none sm:text-4xl"
          />

          <RichTextEditor
            value={content}
            onChange={(html) => {
              setContent(html);
              save({ content: html });
            }}
          />
        </div>

        <p className="mt-4 text-center text-xs text-ink-faint">
          Changes are saved automatically and shown to everyone with this link.
        </p>
      </div>
    </div>
  );
}
