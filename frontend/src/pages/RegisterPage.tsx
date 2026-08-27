import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/authContext';
import { ApiError } from '../lib/api';
import { AuthLayout } from '../components/AuthLayout';
import { Alert, Button, Field } from '../components/ui';
import {
  NAME_MAX,
  NAME_MIN,
  PASSWORD_MAX_BYTES,
  PASSWORD_MIN,
  passwordBytes,
  validateEmail,
  validateName,
  validatePassword,
  type FormErrors,
} from '../lib/validate';

type FieldName = 'name' | 'email' | 'password';

export function RegisterPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState<Record<FieldName, boolean>>({
    name: false,
    email: false,
    password: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const [serverErrors, setServerErrors] = useState<FormErrors>({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const errors: FormErrors = {
    name: validateName(name),
    email: validateEmail(email),
    password: validatePassword(password),
  };

  const hasErrors = Boolean(errors.name || errors.email || errors.password);

  function shown(field: FieldName): string | undefined {
    if (serverErrors[field]) return serverErrors[field];
    return touched[field] || submitted ? errors[field] : undefined;
  }

  function markTouched(field: FieldName) {
    setTouched((current) => ({ ...current, [field]: true }));
  }

  const rules = [
    { label: `At least ${PASSWORD_MIN} characters`, met: password.length >= PASSWORD_MIN },
    {
      label: `No more than ${PASSWORD_MAX_BYTES} bytes`,
      met: password.length > 0 && passwordBytes(password) <= PASSWORD_MAX_BYTES,
    },
  ];

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitted(true);
    setError('');
    setServerErrors({});

    if (hasErrors) return;

    setBusy(true);

    try {
      await signUp(name, email, password);
      navigate('/', { replace: true });
    } catch (cause) {
      if (cause instanceof ApiError) {
        setError(cause.message);
        setServerErrors({
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
        error={shown('name')}
        hint={`${NAME_MIN} to ${NAME_MAX} characters`}
        onBlur={() => markTouched('name')}
        onChange={(e) => {
          setName(e.target.value);
          setServerErrors((current) => ({ ...current, name: undefined }));
        }}
      />

      <Field
        id="email"
        label="Email"
        type="email"
        autoComplete="email"
        value={email}
        error={shown('email')}
        hint="You will sign in with this"
        onBlur={() => markTouched('email')}
        onChange={(e) => {
          setEmail(e.target.value);
          setServerErrors((current) => ({ ...current, email: undefined }));
        }}
      />

      <Field
        id="password"
        label="Password"
        type="password"
        autoComplete="new-password"
        value={password}
        error={shown('password')}
        onBlur={() => markTouched('password')}
        onChange={(e) => {
          setPassword(e.target.value);
          setServerErrors((current) => ({ ...current, password: undefined }));
        }}
      />

      <ul className="mb-4 grid gap-1">
        {rules.map((rule) => (
          <li
            key={rule.label}
            className={`flex items-center gap-2 text-xs ${rule.met ? 'text-accent' : 'text-ink-soft'}`}
          >
            <span aria-hidden="true">{rule.met ? '✓' : '○'}</span>
            {rule.label}
          </li>
        ))}
      </ul>

      <Button type="submit" variant="primary" disabled={busy} className="mt-2 w-full">
        {busy ? 'Creating...' : 'Create account'}
      </Button>
    </AuthLayout>
  );
}
