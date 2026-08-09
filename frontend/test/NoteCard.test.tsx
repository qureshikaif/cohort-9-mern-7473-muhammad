import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NoteCard } from '../src/components/NoteCard';
import type { Note } from '../src/lib/types';

const note: Note = {
  id: 'n1',
  title: 'Shopping list',
  content: '<p>Milk and <strong>bread</strong></p>',
  createdAt: '2026-08-01T10:00:00.000Z',
  updatedAt: '2026-08-02T10:00:00.000Z',
};

describe('NoteCard', () => {
  it('shows the title', () => {
    render(<NoteCard note={note} index={0} onOpen={() => {}} />);

    expect(screen.getByText('Shopping list')).toBeInTheDocument();
  });

  it('renders the preview as plain text so stored HTML cannot inject markup', () => {
    render(<NoteCard note={note} index={0} onOpen={() => {}} />);

    expect(screen.getByText(/Milk and bread/)).toBeInTheDocument();
    expect(document.querySelector('strong')).toBeNull();
  });

  it('does not execute markup hidden in a note', () => {
    const hostile: Note = { ...note, content: '<img src=x onerror="alert(1)">stay calm' };
    render(<NoteCard note={hostile} index={0} onOpen={() => {}} />);

    expect(document.querySelector('img')).toBeNull();
    expect(screen.getByText(/stay calm/)).toBeInTheDocument();
  });

  it('falls back to a placeholder when the note is empty', () => {
    render(<NoteCard note={{ ...note, content: '<p></p>' }} index={0} onOpen={() => {}} />);

    expect(screen.getByText('Empty note')).toBeInTheDocument();
  });

  it('calls onOpen when clicked', async () => {
    const onOpen = jest.fn();
    render(<NoteCard note={note} index={0} onOpen={onOpen} />);

    await userEvent.click(screen.getByRole('button'));

    expect(onOpen).toHaveBeenCalledTimes(1);
  });
});
