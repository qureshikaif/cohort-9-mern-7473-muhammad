import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';

const base =
  'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm cursor-pointer ' +
  'transition-[transform,box-shadow,background-color] duration-150 ease-paper ' +
  'disabled:cursor-not-allowed disabled:opacity-55 ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';

const variants = {
  primary: 'bg-accent text-white border border-transparent shadow-sm hover:-translate-y-px hover:shadow-md',
  secondary:
    'bg-sheet text-ink border border-edge shadow-sm hover:-translate-y-px hover:shadow-md',
  ghost: 'bg-transparent text-ink-soft hover:bg-ink/6 hover:text-ink',
  danger: 'bg-transparent text-danger border border-danger/35 hover:bg-danger/8',
} as const;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
}

export function Button({ variant = 'secondary', className = '', ...rest }: ButtonProps) {
  return <button className={`${base} ${variants[variant]} ${className}`} {...rest} />;
}

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function Field({ label, error, id, className = '', ...rest }: FieldProps) {
  return (
    <label className="mb-4 block" htmlFor={id}>
      <span className="mb-1.5 block text-xs tracking-wider uppercase text-ink-soft">{label}</span>
      <input
        id={id}
        aria-invalid={Boolean(error)}
        className={
          'w-full rounded-lg border border-edge bg-sheet px-3 py-2.5 ' +
          'transition-[border-color,box-shadow] duration-150 ease-paper ' +
          'focus:border-accent focus:outline-none focus:ring-3 focus:ring-accent-soft ' +
          `aria-invalid:border-danger ${className}`
        }
        {...rest}
      />
      {error ? <span className="mt-1.5 block text-xs text-danger">{error}</span> : null}
    </label>
  );
}

export function Alert({ children }: { children: ReactNode }) {
  return (
    <p
      role="alert"
      className="mb-4 animate-nudge rounded-lg border-l-3 border-danger bg-danger/8 px-3.5 py-2.5 text-sm"
    >
      {children}
    </p>
  );
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="grid place-items-center gap-3 py-20 text-ink-soft">
      <div className="size-5 animate-spin rounded-full border-2 border-ink/20 border-t-accent" />
      {label ? <p className="text-sm">{label}</p> : null}
    </div>
  );
}
