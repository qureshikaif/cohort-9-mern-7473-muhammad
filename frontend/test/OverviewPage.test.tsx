import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { OverviewPage } from '../src/pages/OverviewPage';
import { listNotes } from '../src/lib/api';
import type { Note } from '../src/lib/types';

jest.mock('../src/lib/api', () => ({
  listNotes: jest.fn(),
  exportNotes: jest.fn(),
  importNotes: jest.fn(),
}));

const list = listNotes as jest.Mock;

const today = new Date().toISOString();

const shopping: Note = {
  id: 'abc123',
  title: 'Shopping list',
  content: '<p>Milk and bread</p>',
  shareToken: null,
  createdAt: '2026-08-01T09:00:00.000Z',
  updatedAt: today,
};

const assignment: Note = {
  id: 'def456',
  title: 'Assignment notes',
  content: '<p>Finish the sonarqube report before the sync</p>',
  shareToken: null,
  createdAt: '2026-08-02T09:00:00.000Z',
  updatedAt: today,
};

function tileValue(label: string) {
  const caption = screen.getByText(label);
  return caption.parentElement?.firstElementChild?.textContent;
}

function renderOverview() {
  return render(
    <MemoryRouter>
      <OverviewPage />
    </MemoryRouter>
  );
}

describe('OverviewPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    list.mockResolvedValue({ items: [shopping, assignment], total: 9 });
  });

  it('asks for the first 50 notes', async () => {
    renderOverview();
    await screen.findByText('Overview');

    expect(list).toHaveBeenCalledWith('', 50);
  });

  it('the tiles add up', async () => {
    renderOverview();
    await screen.findByText('Overview');

    expect(tileValue('notes')).toBe('9');
    expect(tileValue('words written')).toBe('10');
    expect(tileValue('longest note')).toBe('7');
    expect(tileValue('edited this week')).toBe('2');
  });

  it('one note is not plural', async () => {
    list.mockResolvedValue({ items: [shopping], total: 1 });
    renderOverview();
    await screen.findByText('Overview');

    expect(screen.getByText('note')).toBeInTheDocument();
  });

  it('says the stats only cover 50 notes', async () => {
    renderOverview();

    expect(await screen.findByText(/50 most recently edited notes/)).toBeInTheDocument();
  });

  it('lists what you edited recently', async () => {
    renderOverview();
    await screen.findByText('Recently edited');

    const rows = screen.getAllByRole('listitem');
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveTextContent('Shopping list');
  });

  it('draws a bar for each of the seven days', async () => {
    renderOverview();
    await screen.findByText('Overview');

    expect(screen.getByText('Notes edited, last 7 days')).toBeInTheDocument();
    expect(document.querySelectorAll('rect')).toHaveLength(7);
  });

  it('nothing written yet offers to start', async () => {
    list.mockResolvedValue({ items: [], total: 0 });
    renderOverview();
    await screen.findByText('Overview');

    expect(screen.getByText('Nothing written yet.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Write your first note' })).toBeInTheDocument();
  });

  it('shows an error when the notes will not load', async () => {
    list.mockRejectedValue(new Error('down'));
    renderOverview();

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load your notes');
  });
});
