import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/authContext';
import { getProfile } from '../lib/api';
import type { Profile } from '../lib/types';
import { Alert, Button, Spinner } from '../components/ui';
import { PasswordForm } from '../components/PasswordForm';

const joined = new Intl.DateTimeFormat(undefined, {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-edge py-3 last:border-b-0">
      <span className="text-xs tracking-wider text-ink-soft uppercase">{label}</span>
      <span className="font-serif text-lg">{value}</span>
    </div>
  );
}

export function ProfilePage() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    getProfile()
      .then(({ profile: loaded }) => {
        if (!cancelled) setProfile(loaded);
      })
      .catch(() => {
        if (!cancelled) setError('Could not load your profile');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSignOut() {
    await signOut();
    navigate('/login', { replace: true });
  }

  if (error) return <Alert>{error}</Alert>;
  if (!profile) return <Spinner label="Loading your profile..." />;

  const initials = profile.name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <>
      <h1 className="mb-6 font-serif text-3xl font-medium">Your profile</h1>

      <div className="max-w-2xl animate-sheet-in rounded-xs border border-edge bg-sheet px-6 py-7 shadow-md sm:px-9">
        <div className="mb-6 flex items-center gap-4">
          <span className="grid size-14 place-items-center rounded-full bg-accent/20 font-serif text-xl text-accent">
            {initials}
          </span>
          <div>
            <p className="font-serif text-2xl">{profile.name}</p>
            <p className="text-sm text-ink-soft">{profile.email}</p>
          </div>
        </div>

        <Row label="Notes written" value={String(profile.noteCount)} />
        <Row label="Member since" value={joined.format(new Date(profile.joinedAt))} />

        <div className="mt-7 border-t border-edge pt-5">
          <Button variant="danger" onClick={handleSignOut}>
            Sign out
          </Button>
        </div>
      </div>

      <div className="mt-6">
        <PasswordForm />
      </div>
    </>
  );
}
