import { expect } from 'chai';
import { contentTypeFor, htmlToMarkdown, htmlToText, renderExport } from '../src/utils/noteFormat.js';

const notes = [
  {
    title: 'Shopping list',
    content: '<p>Milk and <strong>bread</strong></p><ul><li>eggs</li><li>coffee</li></ul>',
    createdAt: new Date('2026-08-01T10:00:00.000Z'),
    updatedAt: new Date('2026-08-02T10:00:00.000Z'),
  },
  {
    title: 'Standup',
    content: '<h2>Monday</h2><p>ship it</p>',
    createdAt: new Date('2026-08-03T10:00:00.000Z'),
    updatedAt: new Date('2026-08-04T10:00:00.000Z'),
  },
];

describe('htmlToMarkdown', () => {
  it('turns bold and italic into asterisks', () => {
    expect(htmlToMarkdown('<p>a <strong>b</strong> and <em>c</em></p>')).to.equal('a **b** and *c*');
  });

  it('turns headings into hashes', () => {
    expect(htmlToMarkdown('<h1>Title</h1><h2>Sub</h2>')).to.equal('# Title\n\n## Sub');
  });

  it('turns a bullet list into dashes', () => {
    expect(htmlToMarkdown('<ul><li>one</li><li>two</li></ul>')).to.equal('- one\n- two');
  });

  it('numbers an ordered list', () => {
    expect(htmlToMarkdown('<ol><li>one</li><li>two</li></ol>')).to.equal('1. one\n2. two');
  });

  it('prefixes a quote', () => {
    expect(htmlToMarkdown('<blockquote><p>quoted</p></blockquote>')).to.equal('> quoted');
  });

  it('wraps inline code in backticks', () => {
    expect(htmlToMarkdown('<p>use <code>npm</code></p>')).to.equal('use `npm`');
  });

  it('decodes entities', () => {
    expect(htmlToMarkdown('<p>a &amp; b &lt; c</p>')).to.equal('a & b < c');
  });

  it('leaves no tags behind', () => {
    const out = htmlToMarkdown('<p>a</p><div><span>b</span></div>');

    expect(out).to.not.match(/<[^>]+>/);
  });
});

describe('htmlToText', () => {
  it('drops the markup', () => {
    expect(htmlToText('<p>Milk and <strong>bread</strong></p>')).to.equal('Milk and bread');
  });

  it('keeps list items on their own lines', () => {
    expect(htmlToText('<ul><li>one</li><li>two</li></ul>')).to.equal('- one\n- two');
  });

  it('separates paragraphs with a blank line', () => {
    expect(htmlToText('<p>one</p><p>two</p>')).to.equal('one\n\ntwo');
  });

  it('has no asterisks from bold text', () => {
    expect(htmlToText('<p><strong>loud</strong></p>')).to.equal('loud');
  });
});

describe('renderExport', () => {
  it('json round trips', () => {
    const parsed = JSON.parse(renderExport(notes, '2026-08-05T00:00:00.000Z', 'json'));

    expect(parsed.version).to.equal(1);
    expect(parsed.notes).to.have.length(2);
    expect(parsed.notes[0].title).to.equal('Shopping list');
  });

  it('markdown has a heading per note and a separator', () => {
    const out = renderExport(notes, '2026-08-05T00:00:00.000Z', 'md');

    expect(out).to.contain('# Shopping list');
    expect(out).to.contain('# Standup');
    expect(out).to.contain('- eggs');
    expect(out).to.contain('\n---\n');
  });

  it('text has no markup at all', () => {
    const out = renderExport(notes, '2026-08-05T00:00:00.000Z', 'txt');

    expect(out).to.contain('Shopping list');
    expect(out).to.not.match(/<[^>]+>/);
    expect(out).to.not.contain('**');
  });

  it('html is a whole document that keeps the formatting', () => {
    const out = renderExport(notes, '2026-08-05T00:00:00.000Z', 'html');

    expect(out).to.contain('<!doctype html>');
    expect(out).to.contain('<strong>bread</strong>');
    expect(out).to.contain('<h1>Shopping list</h1>');
  });

  it('escapes a title that contains markup', () => {
    const hostile = [{ ...notes[0], title: '<img src=x onerror=alert(1)>' }];
    const out = renderExport(hostile, '2026-08-05T00:00:00.000Z', 'html');

    expect(out).to.contain('&lt;img');
    expect(out).to.not.contain('<img src=x');
  });

  it('names the right content type for each format', () => {
    expect(contentTypeFor('json')).to.contain('application/json');
    expect(contentTypeFor('md')).to.contain('text/markdown');
    expect(contentTypeFor('txt')).to.contain('text/plain');
    expect(contentTypeFor('html')).to.contain('text/html');
  });
});
