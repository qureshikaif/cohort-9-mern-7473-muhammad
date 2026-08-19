import notebook from '../assets/notebook.svg';

export function NotebookArt({ className = '' }: { className?: string }) {
  return (
    <img
      src={notebook}
      alt="An open notebook with a pencil and sticky notes"
      className={`w-full ${className}`}
    />
  );
}
