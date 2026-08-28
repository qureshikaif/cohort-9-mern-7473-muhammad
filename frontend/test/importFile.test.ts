import { parseImportFile } from '../src/lib/importFile';

describe('parseImportFile', () => {
  it('reads our own json export', () => {
    const file = JSON.stringify({
      exportedAt: '2026-08-05T00:00:00.000Z',
      version: 1,
      notes: [{ title: 'Groceries', content: '<p>milk</p>' }],
    });

    expect(parseImportFile('notes-2026-08-05.json', file)).toEqual([
      { title: 'Groceries', content: '<p>milk</p>' },
    ]);
  });

  it('reads a bare json array too', () => {
    const file = JSON.stringify([{ title: 'One', content: '' }]);

    expect(parseImportFile('notes.json', file)).toHaveLength(1);
  });

  it('turns a plain txt file into one note named after the file', () => {
    const notes = parseImportFile('shopping.txt', 'milk\nbread\n\nand coffee');

    expect(notes).toHaveLength(1);
    expect(notes[0].title).toBe('shopping');
    expect(notes[0].content).toBe('<p>milk bread</p><p>and coffee</p>');
  });

  it('splits a markdown file on its headings', () => {
    const file = ['# First', '', 'one', '', '---', '', '# Second', '', 'two'].join('\n');
    const notes = parseImportFile('export.md', file);

    expect(notes.map((n) => n.title)).toEqual(['First', 'Second']);
    expect(notes[0].content).toBe('<p>one</p>');
    expect(notes[1].content).toBe('<p>two</p>');
  });

  it('escapes markup found in a text file', () => {
    const notes = parseImportFile('hostile.txt', '<img src=x onerror=alert(1)>');

    expect(notes[0].content).toContain('&lt;img');
    expect(notes[0].content).not.toContain('<img');
  });

  it('reads back a markdown file exactly as the exporter writes it', () => {
    const exported = [
      '# Shopping list',
      '',
      '_Last edited 2026-08-21_',
      '',
      'Milk and **bread**',
      '',
      '- eggs',
      '- coffee',
      '',
      '---',
      '',
      '# Standup',
      '',
      '_Last edited 2026-08-21_',
      '',
      'ship it',
      '',
    ].join('\n');

    const notes = parseImportFile('notes-2026-08-21.md', exported);

    expect(notes.map((n) => n.title)).toEqual(['Shopping list', 'Standup']);
    expect(notes[0].content).not.toContain('Last edited');
    expect(notes[0].content).toContain('Milk and **bread**');
    expect(notes[1].content).toBe('<p>ship it</p>');
  });

  it('complains about an empty file', () => {
    expect(() => parseImportFile('empty.txt', '   ')).toThrow(/No notes/);
  });

  it('complains when json is not a list of notes', () => {
    expect(() => parseImportFile('bad.json', '{"nope":true}')).toThrow(/No notes/);
  });

  it('skips notes with no title', () => {
    const file = JSON.stringify({ notes: [{ title: '', content: 'x' }, { title: 'Keep', content: '' }] });

    expect(parseImportFile('notes.json', file)).toEqual([{ title: 'Keep', content: '' }]);
  });
});
