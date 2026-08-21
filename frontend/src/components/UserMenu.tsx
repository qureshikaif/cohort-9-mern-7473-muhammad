import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/authContext';

export function UserMenu() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!wrapper.current?.contains(event.target as Node)) setOpen(false);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  if (!user) return null;

  const initials = user.name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  async function handleSignOut() {
    setOpen(false);
    await signOut();
    navigate('/login', { replace: true });
  }

  return (
    <div className="relative" ref={wrapper}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex cursor-pointer items-center gap-2.5 rounded-full border border-edge bg-sheet py-1 pr-3 pl-1 text-sm transition-shadow duration-150 ease-paper hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <span className="grid size-7 place-items-center rounded-full bg-accent/20 font-serif text-accent">
          {initials}
        </span>
        <span className="hidden sm:inline">{user.name}</span>
        <span aria-hidden="true" className="text-ink-faint">
          {open ? '▴' : '▾'}
        </span>
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-2 w-56 animate-card-in overflow-hidden rounded-lg border border-edge bg-sheet shadow-lg"
        >
          <div className="border-b border-edge px-4 py-3">
            <p className="font-serif text-base">{user.name}</p>
            <p className="truncate text-xs text-ink-soft">{user.email}</p>
          </div>

          <Link
            to="/profile"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-sm text-ink no-underline transition-colors duration-150 hover:bg-ink/5"
          >
            Your profile
          </Link>

          <button
            type="button"
            role="menuitem"
            onClick={handleSignOut}
            className="block w-full cursor-pointer border-t border-edge px-4 py-2.5 text-left text-sm text-danger transition-colors duration-150 hover:bg-danger/10"
          >
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}
