import { useState, type SyntheticEvent } from 'react';
import { ApiError, changePassword } from '../lib/api';
import { Alert, Button, Field } from './ui';

export function PasswordForm() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  function localError(): string {
    if (!current) return 'Fill in your current password';
    if (next.length < 8) return 'The new password must be at least 8 characters';
    if (next === current) return 'Pick something other than your old password';
    if (next !== confirm) return 'The two new passwords do not match';
    return '';
  }

  async function handleSubmit(event: SyntheticEvent) {
    event.preventDefault();
    setDone(false);

    const found = localError();

    if (found) {
      setError(found);
      return;
    }

    setError('');
    setBusy(true);

    try {
      await changePassword(current, next);
      setCurrent('');
      setNext('');
      setConfirm('');
      setDone(true);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'Could not change your password');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl rounded-xs border border-edge bg-sheet px-6 py-6 shadow-md sm:px-9"
    >
      <h2 className="mb-1 font-serif text-xl">Change password</h2>
      <p className="mb-5 text-sm text-ink-soft">At least 8 characters.</p>

      {error ? <Alert>{error}</Alert> : null}

      {done ? (
        <p className="mb-4 rounded-lg border-l-4 border-accent bg-accent/10 px-3.5 py-2.5 text-sm">
          Your password has been changed.
        </p>
      ) : null}

      <Field
        id="current-password"
        label="Current password"
        type="password"
        autoComplete="current-password"
        value={current}
        onChange={(e) => setCurrent(e.target.value)}
      />

      <Field
        id="new-password"
        label="New password"
        type="password"
        autoComplete="new-password"
        value={next}
        onChange={(e) => setNext(e.target.value)}
      />

      <Field
        id="confirm-password"
        label="Repeat new password"
        type="password"
        autoComplete="new-password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
      />

      <Button type="submit" variant="primary" disabled={busy} className="mt-2">
        {busy ? 'Saving...' : 'Change password'}
      </Button>
    </form>
  );
}
