import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { NotesPage } from '../src/pages/NotesPage';
import { deleteNote, listNotes } from '../src/lib/api';
import type { Note } from '../src/lib/types';

jest.mock('../src/lib/api', () => ({
  listNotes: jest.fn(),
  deleteNote: jest.fn(),
  exportNotes: jest.fn(),
  importNotes: jest.fn(),
}));

jest.mock('../src/lib/useNoteEvents', () => ({
  useNoteEvents: () => {},
}));

const shopping: Note = {
  id: 'abc123',
  title: 'Shopping list',
  content: '<p>Milk and bread</p>',
  shareToken: null,
  createdAt: '2026-08-01T09:00:00.000Z',
  updatedAt: '2026-08-06T09:00:00.000Z',
};

const assignment: Note = {
  id: 'def456',
  title: 'Assignment notes',
  content: '<p>Finish the report</p>',
  shareToken: null,
  createdAt: '2026-08-02T09:00:00.000Z',
  updatedAt: '2026-08-03T09:00:00.000Z',
};

const list = listNotes as jest.Mock;
const remove = deleteNote as jest.Mock;

function renderNotes() {
  return render(
    <MemoryRouter>
      <NotesPage />
    </MemoryRouter>
  );
}

function titles() {
  return screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
}

describe('NotesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    list.mockResolvedValue({ items: [shopping, assignment], total: 2 });
    remove.mockResolvedValue(undefined);
  });

  it('shows the notes it loaded', async () => {
    renderNotes();

    expect(await screen.findByText('Shopping list')).toBeInTheDocument();
    expect(screen.getByText('Assignment notes')).toBeInTheDocument();
  });

  it('counts them in the subtitle', async () => {
    renderNotes();

    expect(await screen.findByText(/2 notes in the notebook/)).toBeInTheDocument();
  });

  it('one note is not plural', async () => {
    list.mockResolvedValue({ items: [shopping], total: 1 });
    renderNotes();

    expect(await screen.findByText(/1 note in the notebook/)).toBeInTheDocument();
  });

  it('empty notebook shows the placeholder', async () => {
    list.mockResolvedValue({ items: [], total: 0 });
    renderNotes();

    expect(await screen.findByText('Your notebook is empty')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Write your first note' })).toBeInTheDocument();
  });

  it('newest first by default', async () => {
    renderNotes();
    await screen.findByText('Shopping list');

    expect(titles()).toEqual(['Shopping list', 'Assignment notes']);
  });

  it('A-Z sorts by title', async () => {
    renderNotes();
    await screen.findByText('Shopping list');

    await userEvent.click(screen.getByRole('button', { name: 'A-Z' }));

    expect(titles()).toEqual(['Assignment notes', 'Shopping list']);
  });

  it('oldest first flips it round', async () => {
    renderNotes();
    await screen.findByText('Shopping list');

    await userEvent.click(screen.getByRole('button', { name: 'Oldest' }));

    expect(titles()).toEqual(['Shopping list', 'Assignment notes']);
  });

  it('list view shows a row per note', async () => {
    renderNotes();
    await screen.findByText('Shopping list');

    await userEvent.click(screen.getByRole('button', { name: 'list view' }));

    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByText('Milk and bread')).toBeInTheDocument();
  });

  it('searching asks the api again', async () => {
    renderNotes();
    await screen.findByText('Shopping list');

    list.mockResolvedValue({ items: [], total: 0 });
    await userEvent.type(screen.getByLabelText('Search notes'), 'pasta');

    expect(await screen.findByText('Nothing matches "pasta"')).toBeInTheDocument();
    await waitFor(() => expect(list).toHaveBeenCalledWith('pasta'));
  });

  it('the clear button empties the search', async () => {
    renderNotes();
    await screen.findByText('Shopping list');

    const box = screen.getByLabelText('Search notes');
    await userEvent.type(box, 'pasta');
    await userEvent.click(screen.getByLabelText('Clear search'));

    expect(box).toHaveValue('');
  });

  it('asks before deleting', async () => {
    jest.spyOn(window, 'confirm').mockReturnValue(false);
    renderNotes();
    await screen.findByText('Shopping list');

    await userEvent.click(screen.getByLabelText('Delete Shopping list'));

    expect(remove).not.toHaveBeenCalled();
    expect(screen.getByText('Shopping list')).toBeInTheDocument();
  });

  it('deletes the note when you say yes', async () => {
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    renderNotes();
    await screen.findByText('Shopping list');

    await userEvent.click(screen.getByLabelText('Delete Shopping list'));

    await waitFor(() => expect(screen.queryByText('Shopping list')).not.toBeInTheDocument());
    expect(remove).toHaveBeenCalledWith('abc123');
    expect(screen.getByText(/Deleted "Shopping list"/)).toBeInTheDocument();
  });

  it('puts the note back when the delete fails', async () => {
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    remove.mockRejectedValue(new Error('nope'));
    renderNotes();
    await screen.findByText('Shopping list');

    await userEvent.click(screen.getByLabelText('Delete Shopping list'));

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not delete that note');
    expect(screen.getByText('Shopping list')).toBeInTheDocument();
  });

  it('the notice can be dismissed', async () => {
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    renderNotes();
    await screen.findByText('Shopping list');

    await userEvent.click(screen.getByLabelText('Delete Shopping list'));
    await screen.findByText(/Deleted "Shopping list"/);
    await userEvent.click(screen.getByLabelText('Dismiss'));

    expect(screen.queryByText(/Deleted "Shopping list"/)).not.toBeInTheDocument();
  });

  it('shows an error when the notes will not load', async () => {
    list.mockRejectedValue(new Error('down'));
    renderNotes();

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load your notes');
  });
});
