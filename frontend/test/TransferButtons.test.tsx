import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TransferButtons } from '../src/components/TransferButtons';
import { exportNotes, importNotes } from '../src/lib/api';

jest.mock('../src/lib/api', () => ({
  exportNotes: jest.fn(),
  importNotes: jest.fn(),
}));

const download = exportNotes as jest.Mock;
const upload = importNotes as jest.Mock;

function renderButtons() {
  const onImported = jest.fn();
  const onError = jest.fn();
  render(<TransferButtons onImported={onImported} onError={onError} />);
  return { onImported, onError };
}

function fileInput() {
  return document.querySelector('input[type="file"]') as HTMLInputElement;
}

describe('TransferButtons', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    download.mockResolvedValue({ body: 'the notes', filename: 'notes-2026-08-28.md' });
    upload.mockResolvedValue({ imported: 2 });

    URL.createObjectURL = jest.fn(() => 'blob:fake');
    URL.revokeObjectURL = jest.fn();
    jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  });

  it('shows both buttons', () => {
    renderButtons();

    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Import' })).toBeInTheDocument();
  });

  it('the export menu lists the four formats', async () => {
    renderButtons();

    await userEvent.click(screen.getByRole('button', { name: 'Export' }));

    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByText('JSON')).toBeInTheDocument();
    expect(screen.getByText('Markdown')).toBeInTheDocument();
    expect(screen.getByText('Plain text')).toBeInTheDocument();
    expect(screen.getByText('HTML')).toBeInTheDocument();
  });

  it('picking markdown asks the api for markdown', async () => {
    renderButtons();

    await userEvent.click(screen.getByRole('button', { name: 'Export' }));
    await userEvent.click(screen.getByText('Markdown'));

    await waitFor(() => expect(download).toHaveBeenCalledWith('md'));
  });

  it('picking json asks the api for json', async () => {
    renderButtons();

    await userEvent.click(screen.getByRole('button', { name: 'Export' }));
    await userEvent.click(screen.getByText('JSON'));

    await waitFor(() => expect(download).toHaveBeenCalledWith('json'));
  });

  it('the menu closes after you pick one', async () => {
    renderButtons();

    await userEvent.click(screen.getByRole('button', { name: 'Export' }));
    await userEvent.click(screen.getByText('HTML'));

    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
  });

  it('escape closes the menu', async () => {
    renderButtons();

    await userEvent.click(screen.getByRole('button', { name: 'Export' }));
    await userEvent.keyboard('{Escape}');

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('clicking away closes the menu', async () => {
    renderButtons();

    await userEvent.click(screen.getByRole('button', { name: 'Export' }));
    await userEvent.click(document.body);

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('tells you when the export breaks', async () => {
    download.mockRejectedValue(new Error('nope'));
    const { onError } = renderButtons();

    await userEvent.click(screen.getByRole('button', { name: 'Export' }));
    await userEvent.click(screen.getByText('JSON'));

    await waitFor(() => expect(onError).toHaveBeenCalledWith('Could not export your notes'));
  });

  it('imports a text file', async () => {
    const { onImported } = renderButtons();
    const file = new File(['Milk and bread'], 'shopping.txt', { type: 'text/plain' });

    fireEvent.change(fileInput(), { target: { files: [file] } });

    await waitFor(() => expect(onImported).toHaveBeenCalledWith(2));
    expect(upload).toHaveBeenCalledWith([
      { title: 'shopping', content: '<p>Milk and bread</p>' },
    ]);
  });

  it('imports a json file', async () => {
    const { onImported } = renderButtons();
    const body = JSON.stringify({ notes: [{ title: 'Standup', content: '<p>ship it</p>' }] });
    const file = new File([body], 'notes.json', { type: 'application/json' });

    fireEvent.change(fileInput(), { target: { files: [file] } });

    await waitFor(() => expect(onImported).toHaveBeenCalledWith(2));
    expect(upload).toHaveBeenCalledWith([{ title: 'Standup', content: '<p>ship it</p>' }]);
  });

  it('complains about a file with nothing in it', async () => {
    const { onError } = renderButtons();
    const file = new File([''], 'empty.txt', { type: 'text/plain' });

    fireEvent.change(fileInput(), { target: { files: [file] } });

    await waitFor(() =>
      expect(onError).toHaveBeenCalledWith('No notes with a title were found in that file')
    );
    expect(upload).not.toHaveBeenCalled();
  });

  it('tells you when the import is rejected', async () => {
    upload.mockRejectedValue(new Error('too many notes'));
    const { onError } = renderButtons();
    const file = new File(['Milk'], 'shopping.txt', { type: 'text/plain' });

    fireEvent.change(fileInput(), { target: { files: [file] } });

    await waitFor(() => expect(onError).toHaveBeenCalledWith('too many notes'));
  });
});
