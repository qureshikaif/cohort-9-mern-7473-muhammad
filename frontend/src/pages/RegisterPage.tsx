import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/authContext';
import { ApiError } from '../lib/api';
import { AuthLayout } from '../components/AuthLayout';
import { Alert, Button, Field } from '../components/ui';
import { validateEmail, validateName, validatePassword, type FormErrors } from '../lib/validate';

export function RegisterPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');

    const found: FormErrors = {
      name: validateName(name),
      email: validateEmail(email),
      password: validatePassword(password),
    };

    if (found.name || found.email || found.password) {
      setFieldErrors(found);
      return;
    }

    setFieldErrors({});
    setBusy(true);

    try {
      await signUp(name, email, password);
      navigate('/', { replace: true });
    } catch (cause) {
      if (cause instanceof ApiError) {
        setError(cause.message);
        setFieldErrors({
          name: cause.fieldErrors.name?.[0],
          email: cause.fieldErrors.email?.[0],
          password: cause.fieldErrors.password?.[0],
        });
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
        value={name}
        error={fieldErrors.name}
        onChange={(e) => setName(e.target.value)}
      />

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
        autoComplete="new-password"
        value={password}
        error={fieldErrors.password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <Button type="submit" variant="primary" disabled={busy} className="mt-2 w-full">
        {busy ? 'Creating...' : 'Create account'}
      </Button>
    </AuthLayout>
  );
}
