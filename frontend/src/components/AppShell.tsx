import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/authContext';
import { Button } from './ui';

export function AppShell() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate('/login', { replace: true });
  }

  return (
    <div className="desk-glow flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-edge bg-paper/80 px-4 py-3.5 backdrop-blur-md sm:px-10">
        <Link to="/" className="group flex items-center gap-2.5 font-serif text-xl text-ink no-underline">
          <span className="h-7 w-6 -rotate-4 rounded-l-xs rounded-r-md border border-edge border-l-[3px] border-l-accent bg-sheet shadow-sm transition-transform duration-300 ease-paper group-hover:rotate-3" />
          Notes
        </Link>

        <div className="flex-1" />

        {user ? (
          <>
            <span className="hidden text-sm text-ink-soft sm:inline">{user.name}</span>
            <Button variant="ghost" onClick={handleSignOut}>
              Sign out
            </Button>
          </>
        ) : null}
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 animate-page-in px-4 pt-6 pb-20 sm:px-10">
        <Outlet />
      </main>
    </div>
  );
}
