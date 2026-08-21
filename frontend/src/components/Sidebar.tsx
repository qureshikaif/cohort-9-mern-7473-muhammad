import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

interface Item {
  to: string;
  label: string;
  icon: string;
}

const items: Item[] = [
  { to: '/', label: 'Overview', icon: 'M3 10.5 12 3l9 7.5M5.5 9.5V20h13V9.5' },
  { to: '/notes', label: 'Notes', icon: 'M6 3h9l4 4v14H6zM15 3v4h4M9 12h7M9 16h5' },
  { to: '/profile', label: 'Profile', icon: 'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21c0-4 3.6-6 8-6s8 2 8 6' },
];

const STORAGE_KEY = 'notes-app.sidebar';

export function Sidebar() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(STORAGE_KEY) === 'collapsed');

  function toggle() {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem(STORAGE_KEY, next ? 'collapsed' : 'open');
  }

  return (
    <aside
      className={`sticky top-0 flex h-screen shrink-0 flex-col border-r border-edge bg-sheet/60 backdrop-blur-sm transition-[width] duration-200 ease-paper ${
        collapsed ? 'w-16' : 'w-56'
      }`}
    >
      <div className="flex items-center gap-2.5 px-4 py-4">
        <span className="h-7 w-6 shrink-0 -rotate-3 rounded-l-xs rounded-r-md border border-edge border-l-2 border-l-accent bg-sheet shadow-sm" />
        {!collapsed ? <span className="font-serif text-xl">Notes</span> : null}
      </div>

      <button
        type="button"
        onClick={() => navigate('/notes/new')}
        title="New note"
        className={`mx-3 mb-4 flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-accent px-3 py-2 text-sm text-white shadow-sm transition-transform duration-150 ease-paper hover:-translate-y-px ${
          collapsed ? 'px-0' : ''
        }`}
      >
        <span aria-hidden="true" className="text-base leading-none">
          +
        </span>
        {!collapsed ? 'New note' : null}
      </button>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            title={item.label}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm no-underline transition-colors duration-150 ${
                isActive
                  ? 'bg-accent-soft text-accent'
                  : 'text-ink-soft hover:bg-ink/5 hover:text-ink'
              } ${collapsed ? 'justify-center px-0' : ''}`
            }
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="size-5 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d={item.icon} />
            </svg>
            {!collapsed ? item.label : null}
          </NavLink>
        ))}
      </nav>

      <button
        type="button"
        onClick={toggle}
        aria-expanded={!collapsed}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="m-3 cursor-pointer rounded-lg border border-edge px-3 py-2 text-sm text-ink-soft transition-colors duration-150 hover:bg-ink/5 hover:text-ink"
      >
        {collapsed ? '»' : '« Collapse'}
      </button>
    </aside>
  );
}
