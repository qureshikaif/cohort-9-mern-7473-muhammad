import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/authContext';
import { ApiError } from '../lib/api';
import { AuthLayout } from '../components/AuthLayout';
import { Alert, Button, Field } from '../components/ui';
import { validateEmail, type FormErrors } from '../lib/validate';

type FieldName = 'email' | 'password';

export function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState<Record<FieldName, boolean>>({
    email: false,
    password: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const errors: FormErrors = {
    email: validateEmail(email),
    password: password ? undefined : 'Password is required',
  };

  const hasErrors = Boolean(errors.email || errors.password);

  function shown(field: FieldName): string | undefined {
    return touched[field] || submitted ? errors[field] : undefined;
  }

  function markTouched(field: FieldName) {
    setTouched((current) => ({ ...current, [field]: true }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitted(true);
    setError('');

    if (hasErrors) return;

    setBusy(true);

    try {
      await signIn(email, password);
      const from = (location.state as { from?: string } | null)?.from;
      navigate(from ?? '/', { replace: true });
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'Could not reach the server');
      setBusy(false);
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Pick up where you left off."
      onSubmit={handleSubmit}
      footer={<>No account yet? <Link to="/register">Create one</Link></>}
    >
      {error ? <Alert>{error}</Alert> : null}

      <Field
        id="email"
        label="Email"
        type="email"
        autoComplete="email"
        value={email}
        error={shown('email')}
        onBlur={() => markTouched('email')}
        onChange={(e) => setEmail(e.target.value)}
      />

      <Field
        id="password"
        label="Password"
        type="password"
        autoComplete="current-password"
        value={password}
        error={shown('password')}
        onBlur={() => markTouched('password')}
        onChange={(e) => setPassword(e.target.value)}
      />

      <Button type="submit" variant="primary" disabled={busy} className="mt-2 w-full">
        {busy ? 'Signing in...' : 'Sign in'}
      </Button>
    </AuthLayout>
  );
}
