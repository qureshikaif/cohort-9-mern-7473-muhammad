import { useEffect, type RefObject } from 'react';

// The sidebar menu and the export menu both needed this, so it lives here now.
export function useDismiss(
  open: boolean,
  box: RefObject<HTMLDivElement | null>,
  setOpen: (open: boolean) => void
) {
  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!box.current?.contains(event.target as Node)) setOpen(false);
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
  }, [open, box, setOpen]);
}
