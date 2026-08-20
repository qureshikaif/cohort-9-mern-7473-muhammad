import { useRef, useState } from 'react';
import { exportNotes, importNotes } from '../lib/api';
import { Button } from './ui';

interface ImportedNote {
  title?: unknown;
  content?: unknown;
}

function readNotes(parsed: unknown): { title: string; content: string }[] {
  const raw = Array.isArray(parsed) ? parsed : ((parsed as { notes?: unknown })?.notes ?? []);

  if (!Array.isArray(raw)) {
    throw new Error('That file does not contain a list of notes');
  }

  const notes = raw
    .filter((n): n is ImportedNote => typeof n === 'object' && n !== null)
    .map((n) => ({
      title: typeof n.title === 'string' ? n.title.trim() : '',
      content: typeof n.content === 'string' ? n.content : '',
    }))
    .filter((n) => n.title.length > 0);

  if (notes.length === 0) {
    throw new Error('No notes with a title were found in that file');
  }

  return notes;
}

interface Props {
  onImported: (count: number) => void;
  onError: (message: string) => void;
}

export function TransferButtons({ onImported, onError }: Props) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<'export' | 'import' | null>(null);

  async function handleExport() {
    setBusy('export');

    try {
      const payload = await exportNotes();
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `notes-${payload.exportedAt.slice(0, 10)}.json`;
      link.click();

      URL.revokeObjectURL(url);
    } catch {
      onError('Could not export your notes');
    } finally {
      setBusy(null);
    }
  }

  async function handleFile(file: File) {
    setBusy('import');

    try {
      const notes = readNotes(JSON.parse(await file.text()));
      const { imported } = await importNotes(notes);
      onImported(imported);
    } catch (cause) {
      onError(cause instanceof Error ? cause.message : 'Could not read that file');
    } finally {
      setBusy(null);
      if (fileInput.current) fileInput.current.value = '';
    }
  }

  return (
    <div className="flex gap-2">
      <Button variant="ghost" onClick={handleExport} disabled={busy !== null}>
        {busy === 'export' ? 'Exporting...' : 'Export'}
      </Button>

      <Button
        variant="ghost"
        onClick={() => fileInput.current?.click()}
        disabled={busy !== null}
      >
        {busy === 'import' ? 'Importing...' : 'Import'}
      </Button>

      <input
        ref={fileInput}
        type="file"
        accept="application/json,.json"
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />
    </div>
  );
}
