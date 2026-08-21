import { Link, Outlet } from 'react-router-dom';
import { UserMenu } from './UserMenu';

export function AppShell() {
  return (
    <div className="desk-glow flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-edge bg-paper/80 px-4 py-3 backdrop-blur-md sm:px-10">
        <Link to="/" className="group flex items-center gap-2.5 font-serif text-xl text-ink no-underline">
          <span className="h-7 w-6 -rotate-3 rounded-l-xs rounded-r-md border border-edge border-l-2 border-l-accent bg-sheet shadow-sm transition-transform duration-300 ease-paper group-hover:rotate-3" />
          Notes
        </Link>

        <div className="flex-1" />

        <UserMenu />
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 animate-page-in px-4 pt-6 pb-20 sm:px-10">
        <Outlet />
      </main>
    </div>
  );
}
