import type { FormEvent, ReactNode } from 'react';
import { NotebookArt } from './NotebookArt';

interface Props {
  title: string;
  lede: string;
  onSubmit: (event: FormEvent) => void;
  children: ReactNode;
  footer: ReactNode;
}

export function AuthLayout({ title, lede, onSubmit, children, footer }: Props) {
  return (
    <div className="desk-glow min-h-screen lg:grid lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden border-r border-edge px-12 lg:grid lg:place-items-center">
        <div className="pointer-events-none absolute inset-0 opacity-50 [background-image:radial-gradient(var(--edge)_1px,transparent_1px)] [background-size:22px_22px]" />

        <div className="relative max-w-125">
          <NotebookArt />

          <p className="mt-10 font-serif text-2xl leading-snug">
            Somewhere to put the things you would otherwise forget.
          </p>
          <p className="mt-2 text-sm text-ink-soft">Write it down now, find it later.</p>
        </div>
      </aside>

      <section className="grid min-h-screen place-items-center px-5 py-10 lg:min-h-0">
        <form
          onSubmit={onSubmit}
          className="relative w-full max-w-100 animate-sheet-in rounded-xs border border-edge bg-sheet px-8 pt-9 pb-7 shadow-2xl before:absolute before:-top-3 before:left-1/2 before:h-6 before:w-27 before:-translate-x-1/2 before:-rotate-2 before:border-x before:border-dashed before:border-ink/12 before:bg-accent/15 before:content-['']"
        >
          <NotebookArt className="mx-auto mb-6 max-w-45 lg:hidden" />

          <h1 className="mb-1 font-serif text-3xl font-medium">{title}</h1>
          <p className="mb-6 text-sm text-ink-soft">{lede}</p>

          {children}

          <p className="mt-5 text-center text-sm text-ink-soft">{footer}</p>
        </form>
      </section>
    </div>
  );
}
