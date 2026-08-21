import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ApiError, createNote, deleteNote, getNote, updateNote } from '../lib/api';
import { RichTextEditor } from '../components/RichTextEditor';
import { Alert, Button, Spinner } from '../components/ui';

export function NoteEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === undefined;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loadedId, setLoadedId] = useState<string>();
  const [failed, setFailed] = useState<{ id: string; message: string }>();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isNew || !id) return;

    let cancelled = false;

    getNote(id)
      .then(({ note }) => {
        if (cancelled) return;
        setTitle(note.title);
        setContent(note.content);
        setLoadedId(id);
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

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Untitled note"
        aria-label="Note title"
        className="mb-1.5 w-full border-none bg-transparent py-1 font-serif text-3xl font-medium placeholder:text-ink-faint focus:outline-none sm:text-4xl"
      />

      <RichTextEditor value={content} onChange={setContent} />

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
    </div>
  );
}
