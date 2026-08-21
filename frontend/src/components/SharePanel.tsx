import { useState } from 'react';
import { shareNote, unshareNote } from '../lib/api';
import { Button } from './ui';

interface Props {
  noteId: string;
  token: string | null;
  onChange: (token: string | null) => void;
  onError: (message: string) => void;
}

export function SharePanel({ noteId, token, onChange, onError }: Props) {
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const link = token ? `${window.location.origin}/shared/${token}` : '';

  async function create() {
    setBusy(true);

    try {
      const result = await shareNote(noteId);
      onChange(result.token);
    } catch {
      onError('Could not create a share link');
    } finally {
      setBusy(false);
    }
  }

  async function revoke() {
    setBusy(true);

    try {
      await unshareNote(noteId);
      onChange(null);
      setCopied(false);
    } catch {
      onError('Could not revoke the link');
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    await navigator.clipboard.writeText(link);
    setCopied(true);
  }

  if (!token) {
    return (
      <Button onClick={create} disabled={busy}>
        {busy ? 'Creating...' : 'Share'}
      </Button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-edge bg-paper px-3 py-2">
      <span className="text-xs tracking-wider text-ink-soft uppercase">Anyone with the link</span>

      <input
        readOnly
        value={link}
        aria-label="Share link"
        onFocus={(e) => e.currentTarget.select()}
        className="min-w-0 flex-1 rounded-md border border-edge bg-sheet px-2 py-1 text-xs"
      />

      <Button onClick={copy} disabled={busy}>
        {copied ? 'Copied' : 'Copy'}
      </Button>

      <Button variant="danger" onClick={revoke} disabled={busy}>
        Revoke
      </Button>
    </div>
  );
}
