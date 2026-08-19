import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/authContext';
import { ApiError } from '../lib/api';
import { AuthLayout } from '../components/AuthLayout';
import { Alert, Button, Field } from '../components/ui';

export function RegisterPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setFieldErrors({});
    setBusy(true);

    try {
      await signUp(name, email, password);
      navigate('/', { replace: true });
    } catch (cause) {
      if (cause instanceof ApiError) {
        setError(cause.message);
        setFieldErrors(cause.fieldErrors);
      } else {
        setError('Could not reach the server');
      }
      setBusy(false);
    }
  }

  return (
    <AuthLayout
      title="Start a notebook"
      subtitle="It takes about ten seconds."
      onSubmit={handleSubmit}
      footer={<>Already have one? <Link to="/login">Sign in</Link></>}
    >
      {error ? <Alert>{error}</Alert> : null}

      <Field
        id="name"
        label="Name"
        autoComplete="name"
        required
        value={name}
        error={fieldErrors.name?.[0]}
        onChange={(e) => setName(e.target.value)}
      />

      <Field
        id="email"
        label="Email"
        type="email"
        autoComplete="email"
        required
        value={email}
        error={fieldErrors.email?.[0]}
        onChange={(e) => setEmail(e.target.value)}
      />

      <Field
        id="password"
        label="Password"
        type="password"
        autoComplete="new-password"
        required
        value={password}
        error={fieldErrors.password?.[0]}
        onChange={(e) => setPassword(e.target.value)}
      />

      <Button type="submit" variant="primary" disabled={busy} className="mt-2 w-full">
        {busy ? 'Creating...' : 'Create account'}
      </Button>
    </AuthLayout>
  );
}
