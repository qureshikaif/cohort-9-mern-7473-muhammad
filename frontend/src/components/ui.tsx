import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';

const base =
  'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm cursor-pointer ' +
  'transition-[transform,box-shadow,background-color] duration-150 ease-paper ' +
  'disabled:cursor-not-allowed disabled:opacity-50 ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';

const variants = {
  primary:
    'bg-accent text-white border border-transparent shadow-sm hover:-translate-y-px hover:shadow-md',
  secondary:
    'bg-sheet text-ink border border-edge shadow-sm hover:-translate-y-px hover:shadow-md',
  ghost: 'bg-transparent text-ink-soft hover:bg-ink/5 hover:text-ink',
  danger: 'bg-transparent text-danger border border-danger/30 hover:bg-danger/10',
} as const;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
}

export function Button({ variant = 'secondary', className = '', ...rest }: ButtonProps) {
  return <button className={`${base} ${variants[variant]} ${className}`} {...rest} />;
}

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;
  hint?: string;
}

export function Field({ label, error, hint, id, className = '', ...rest }: FieldProps) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className="mb-4">
      <label
        htmlFor={id}
        className="mb-1.5 block text-xs tracking-wider uppercase text-ink-soft"
      >
        {label}
      </label>

      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={
          'w-full rounded-lg border border-edge bg-sheet px-3 py-2.5 ' +
          'transition-[border-color,box-shadow] duration-150 ease-paper ' +
          'focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-soft ' +
          `aria-invalid:border-danger ${className}`
        }
        {...rest}
      />

      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-danger">
          {error}
        </p>
      ) : null}

      {!error && hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-ink-soft">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function Alert({ children }: { children: ReactNode }) {
  return (
    <p
      role="alert"
      className="mb-4 animate-nudge rounded-lg border-l-4 border-danger bg-danger/10 px-3.5 py-2.5 text-sm"
    >
      {children}
    </p>
  );
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div
      role="status"
      aria-label={label ?? 'Loading'}
      className="grid place-items-center gap-3 py-20 text-ink-soft"
    >
      <div className="size-5 animate-spin rounded-full border-2 border-ink/20 border-t-accent" />
      {label ? <p className="text-sm">{label}</p> : null}
    </div>
  );
}
