import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { UserMenu } from './UserMenu';

export function AppShell() {
  return (
    <div className="desk-glow flex min-h-screen">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-edge bg-paper/80 px-4 py-3 backdrop-blur-md sm:px-8">
          <div className="flex-1" />
          <UserMenu />
        </header>

        <main className="w-full flex-1 animate-page-in px-4 pt-6 pb-16 sm:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
