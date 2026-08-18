import { useState } from 'react';
import type { FormEvent } from 'react';
import { Alert, Button, Field } from './components/ui';

export default function Login({ onLogin }: { onLogin: (token: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setBusy(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message ?? 'Could not sign in');
        return;
      }

      onLogin(data.accessToken);
    } catch {
      setError('Could not reach the server');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center px-5">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-xs border border-edge bg-sheet px-8 py-9 shadow-lg"
      >
        <h1 className="mb-1 font-serif text-3xl font-medium">Notes</h1>
        <p className="mb-6 text-sm text-ink-soft">Sign in to get to your notes.</p>

        {error ? <Alert>{error}</Alert> : null}

        <Field
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Field
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button type="submit" variant="primary" className="w-full" disabled={busy}>
          {busy ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>
    </div>
  );
}
