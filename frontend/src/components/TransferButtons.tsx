import { useRef, useState } from 'react';
import { exportNotes, importNotes, type ExportFormat } from '../lib/api';
import { parseImportFile } from '../lib/importFile';
import { useDismiss } from '../lib/useDismiss';
import { Button } from './ui';

const formats = [
  { key: 'json', label: 'JSON', note: 'can be imported back' },
  { key: 'md', label: 'Markdown', note: 'headings and lists kept' },
  { key: 'txt', label: 'Plain text', note: 'no formatting' },
  { key: 'html', label: 'HTML', note: 'opens in a browser' },
] as const;

interface Props {
  onImported: (count: number) => void;
  onError: (message: string) => void;
}

export function TransferButtons({ onImported, onError }: Props) {
  const fileInput = useRef<HTMLInputElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState<'export' | 'import' | null>(null);
  const [open, setOpen] = useState(false);

  useDismiss(open, menu, setOpen);

  async function download(format: ExportFormat, extension: string) {
    setOpen(false);
    setBusy('export');

    try {
      const { body, filename } = await exportNotes(format);
      const url = URL.createObjectURL(new Blob([body]));

      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `notes.${extension}`;
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
      const notes = parseImportFile(file.name, await file.text());
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
      <div className="relative" ref={menu}>
        <Button
          variant="ghost"
          onClick={() => setOpen((current) => !current)}
          disabled={busy !== null}
          aria-haspopup="menu"
          aria-expanded={open}
        >
          {busy === 'export' ? 'Exporting...' : 'Export'}
        </Button>

        {open ? (
          <div
            role="menu"
            className="absolute right-0 z-30 mt-2 w-56 animate-card-in overflow-hidden rounded-lg border border-edge bg-sheet shadow-lg"
          >
            {formats.map((format) => (
              <button
                key={format.key}
                type="button"
                role="menuitem"
                onClick={() => void download(format.key, format.key)}
                className="block w-full cursor-pointer border-b border-edge px-4 py-2.5 text-left transition-colors duration-150 last:border-b-0 hover:bg-ink/5"
              >
                <span className="block text-sm text-ink">{format.label}</span>
                <span className="block text-xs text-ink-soft">{format.note}</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <Button variant="ghost" onClick={() => fileInput.current?.click()} disabled={busy !== null}>
        {busy === 'import' ? 'Importing...' : 'Import'}
      </Button>

      <input
        ref={fileInput}
        type="file"
        accept=".json,.txt,.md,application/json,text/plain,text/markdown"
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
