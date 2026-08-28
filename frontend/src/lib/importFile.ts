export interface ParsedNote {
  title: string;
  content: string;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function toParagraphs(lines: string[]): string {
  const blocks: string[] = [];
  let current: string[] = [];

  for (const line of lines) {
    if (line.trim() === '') {
      if (current.length) blocks.push(current.join(' '));
      current = [];
    } else {
      current.push(line.trim());
    }
  }

  if (current.length) blocks.push(current.join(' '));

  return blocks.map((block) => `<p>${escapeHtml(block)}</p>`).join('');
}

function fromJson(text: string): ParsedNote[] {
  const parsed: unknown = JSON.parse(text);
  const raw = Array.isArray(parsed) ? parsed : ((parsed as { notes?: unknown })?.notes ?? []);

  if (!Array.isArray(raw)) {
    throw new Error('That file does not contain a list of notes');
  }

  return raw
    .filter((note): note is { title?: unknown; content?: unknown } => typeof note === 'object' && note !== null)
    .map((note) => ({
      title: typeof note.title === 'string' ? note.title.trim() : '',
      content: typeof note.content === 'string' ? note.content : '',
    }))
    .filter((note) => note.title.length > 0);
}

// A text or markdown file becomes one note per "# heading", or one note for the
// whole file when it has no headings.
function fromText(text: string, fallbackTitle: string): ParsedNote[] {
  const lines = text.split(/\r?\n/);
  const headingAt = lines.findIndex((line) => /^#\s+\S/.test(line));

  if (headingAt === -1) {
    const body = toParagraphs(lines);
    return body ? [{ title: fallbackTitle, content: body }] : [];
  }

  const notes: ParsedNote[] = [];
  let title = '';
  let buffer: string[] = [];

  function flush() {
    if (!title) return;
    notes.push({ title, content: toParagraphs(buffer) });
    buffer = [];
  }

  for (const line of lines.slice(headingAt)) {
    const heading = /^#\s+(.*\S)/.exec(line);

    if (heading) {
      flush();
      title = heading[1].trim();
    } else if (!/^-{3,}\s*$/.test(line) && !/^_Last edited .*_$/.test(line.trim())) {
      buffer.push(line);
    }
  }

  flush();

  return notes.filter((note) => note.title.length > 0);
}

export function parseImportFile(name: string, text: string): ParsedNote[] {
  const fallbackTitle = name.replace(/\.[^.]+$/, '').trim() || 'Imported note';
  const notes = /\.json$/i.test(name) ? fromJson(text) : fromText(text, fallbackTitle);

  if (notes.length === 0) {
    throw new Error('No notes with a title were found in that file');
  }

  return notes;
}
