import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ApiError, createNote, deleteNote, getNote, updateNote } from '../lib/api';
import { useSharedSync } from '../lib/useSharedSync';
import type { Note } from '../lib/types';
import { RichTextEditor } from '../components/RichTextEditor';
import { SharePanel } from '../components/SharePanel';
import { Alert, Button, Spinner } from '../components/ui';

export function NoteEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === undefined;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loadedId, setLoadedId] = useState<string>();
  const [failed, setFailed] = useState<{ id: string; message: string }>();
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [remoteNotice, setRemoteNotice] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadedContent = useRef('');
  const draft = useRef('');
  const loadedTitle = useRef('');

  useEffect(() => {
    if (isNew || !id) return;

    let cancelled = false;

    getNote(id)
      .then(({ note }) => {
        if (cancelled) return;
        setTitle(note.title);
        setContent(note.content);
        setLoadedId(id);
        setShareToken(note.shareToken);
        loadedContent.current = note.content;
        loadedTitle.current = note.title;
        draft.current = note.content;
      })
      .catch((cause: unknown) => {
        if (cancelled) return;
        const message = cause instanceof ApiError ? cause.message : 'Could not load this note';
        setFailed({ id, message });
      });

    return () => {
      cancelled = true;
    };
  }, [id, isNew]);

  const loadFailed = !isNew && failed?.id === id;
  const loading = !isNew && !loadFailed && loadedId !== id;

  const onRemote = useCallback((note: Note) => {
    if (note.content === loadedContent.current && note.title === loadedTitle.current) return;

    if (draft.current !== loadedContent.current) {
      setRemoteNotice('Someone edited this note through the share link. Reload to see it.');
      return;
    }

    loadedContent.current = note.content;
    loadedTitle.current = note.title;
    draft.current = note.content;
    setTitle(note.title);
    setContent(note.content);
    setRemoteNotice('Updated through the share link.');
  }, []);

  useSharedSync(shareToken, onRemote);

  async function handleSave() {
    if (!title.trim()) {
      setError('Give the note a title before saving');
      return;
    }

    setError('');
    setSaving(true);

    try {
      if (isNew) {
        await createNote(title, content);
      } else if (id) {
        await updateNote(id, title, content);
      }
      navigate('/');
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'Could not save this note');
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!id || !window.confirm('Delete this note? This cannot be undone.')) return;

    try {
      await deleteNote(id);
      navigate('/');
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'Could not delete this note');
    }
  }

  if (loading) {
    return <Spinner label="Finding your note..." />;
  }

  if (loadFailed) {
    return (
      <>
        <Alert>{failed?.message ?? 'Could not load this note'}</Alert>
        <Button variant="ghost" onClick={() => navigate('/')}>
          Back to notes
        </Button>
      </>
    );
  }

  return (
    <div className="animate-sheet-in rounded-xs border border-edge bg-sheet px-5 py-6 shadow-lg sm:px-12 sm:py-10">
      {error ? <Alert>{error}</Alert> : null}

      {remoteNotice ? (
        <p className="mb-4 rounded-lg border-l-4 border-accent bg-accent/10 px-3.5 py-2.5 text-sm">
          {remoteNotice}
        </p>
      ) : null}

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Untitled note"
        aria-label="Note title"
        className="mb-1.5 w-full border-none bg-transparent py-1 font-serif text-3xl font-medium placeholder:text-ink-faint focus:outline-none sm:text-4xl"
      />

      <RichTextEditor
        value={content}
        onChange={(html) => {
          draft.current = html;
          setContent(html);
        }}
      />

      <div className="mt-5 flex items-center gap-2.5 border-t border-edge pt-4">
        <Button variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save note'}
        </Button>

        <Button variant="ghost" onClick={() => navigate('/')} disabled={saving}>
          Cancel
        </Button>

        <div className="flex-1" />

        {!isNew ? (
          <Button variant="danger" onClick={handleDelete} disabled={saving}>
            Delete
          </Button>
        ) : null}
      </div>

      {!isNew && id ? (
        <div className="mt-4">
          <SharePanel
            noteId={id}
            token={shareToken}
            onChange={setShareToken}
            onError={setError}
          />
        </div>
      ) : null}
    </div>
  );
}
