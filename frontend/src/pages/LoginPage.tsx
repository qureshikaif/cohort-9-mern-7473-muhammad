import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/authContext';
import { ApiError } from '../lib/api';
import { AuthLayout } from '../components/AuthLayout';
import { Alert, Button, Field } from '../components/ui';
import { validateEmail, validatePassword, type FormErrors } from '../lib/validate';

export function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');

    const found: FormErrors = {
      email: validateEmail(email),
      password: validatePassword(password),
    };

    if (found.email || found.password) {
      setFieldErrors(found);
      return;
    }

    setFieldErrors({});
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
        error={fieldErrors.email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <Field
        id="password"
        label="Password"
        type="password"
        autoComplete="current-password"
        value={password}
        error={fieldErrors.password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <Button type="submit" variant="primary" disabled={busy} className="mt-2 w-full">
        {busy ? 'Signing in...' : 'Sign in'}
      </Button>
    </AuthLayout>
  );
}
