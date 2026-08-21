export type ExportFormat = 'json' | 'md' | 'txt' | 'html';

export interface FormatNote {
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const entities: [RegExp, string][] = [
  [/&nbsp;/g, ' '],
  [/&lt;/g, '<'],
  [/&gt;/g, '>'],
  [/&quot;/g, '"'],
  [/&#3[49];/g, "'"],
  [/&amp;/g, '&'],
];

function decode(text: string): string {
  return entities.reduce((out, [pattern, char]) => out.replace(pattern, char), text);
}

function tidy(text: string): string {
  return text.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

function listItems(block: string, marker: (index: number) => string): string {
  const items = [...block.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g)];

  return items.map((item, index) => `${marker(index)} ${item[1].trim()}`).join('\n');
}

export function htmlToMarkdown(html: string): string {
  let out = html;

  out = out.replace(/<(strong|b)>([\s\S]*?)<\/\1>/g, '**$2**');
  out = out.replace(/<(em|i)>([\s\S]*?)<\/\1>/g, '*$2*');
  out = out.replace(/<code>([\s\S]*?)<\/code>/g, '`$1`');
  out = out.replace(/<s>([\s\S]*?)<\/s>/g, '~~$1~~');

  out = out.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/g, (_all, inner: string) => {
    return `\n${listItems(inner, () => '-')}\n\n`;
  });
  out = out.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/g, (_all, inner: string) => {
    return `\n${listItems(inner, (index) => `${index + 1}.`)}\n\n`;
  });

  out = out.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/g, (_all, inner: string) => {
    const lines = inner.replace(/<[^>]+>/g, '').trim().split('\n');
    return `\n${lines.map((line) => `> ${line.trim()}`).join('\n')}\n\n`;
  });

  out = out.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/g, '\n# $1\n\n');
  out = out.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/g, '\n## $1\n\n');
  out = out.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/g, '\n### $1\n\n');

  out = out.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/g, '\n```\n$1\n```\n\n');
  out = out.replace(/<hr[^>]*\/?>/g, '\n---\n\n');
  out = out.replace(/<br[^>]*\/?>/g, '\n');
  out = out.replace(/<\/p>/g, '\n\n');
  out = out.replace(/<[^>]+>/g, '');

  return tidy(decode(out));
}

export function htmlToText(html: string): string {
  let out = html;

  out = out.replace(/<li[^>]*>([\s\S]*?)<\/li>/g, '- $1\n');
  out = out.replace(/<(h[1-3]|p|blockquote|pre)[^>]*>/g, '');
  out = out.replace(/<\/(h[1-3]|p|blockquote|pre|ul|ol)>/g, '\n\n');
  out = out.replace(/<br[^>]*\/?>/g, '\n');
  out = out.replace(/<[^>]+>/g, '');

  return tidy(decode(out));
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const contentTypes: Record<ExportFormat, string> = {
  json: 'application/json; charset=utf-8',
  md: 'text/markdown; charset=utf-8',
  txt: 'text/plain; charset=utf-8',
  html: 'text/html; charset=utf-8',
};

export function contentTypeFor(format: ExportFormat): string {
  return contentTypes[format];
}

export function renderExport(
  notes: FormatNote[],
  exportedAt: string,
  format: ExportFormat
): string {
  if (format === 'json') {
    return JSON.stringify({ exportedAt, version: 1, notes }, null, 2);
  }

  if (format === 'md') {
    const parts = notes.map((note) => {
      const body = htmlToMarkdown(note.content);
      const date = note.updatedAt.toISOString().slice(0, 10);
      return `# ${note.title}\n\n_Last edited ${date}_\n\n${body}`.trim();
    });

    return `${parts.join('\n\n---\n\n')}\n`;
  }

  if (format === 'txt') {
    const parts = notes.map((note) => {
      const body = htmlToText(note.content);
      const date = note.updatedAt.toISOString().slice(0, 10);
      return `${note.title}\n${'='.repeat(note.title.length)}\nLast edited ${date}\n\n${body}`.trim();
    });

    return `${parts.join('\n\n----------\n\n')}\n`;
  }

  const articles = notes
    .map((note) => {
      const date = note.updatedAt.toISOString().slice(0, 10);
      return `    <article>\n      <h1>${escapeHtml(note.title)}</h1>\n      <p class="meta">Last edited ${date}</p>\n      ${note.content}\n    </article>`;
    })
    .join('\n');

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Notes</title>
    <style>
      body { max-width: 40rem; margin: 3rem auto; padding: 0 1rem; font-family: Georgia, serif; line-height: 1.6; }
      article { border-bottom: 1px solid #ddd; padding-bottom: 2rem; margin-bottom: 2rem; }
      .meta { color: #777; font-size: 0.85rem; }
    </style>
  </head>
  <body>
${articles}
  </body>
</html>
`;
}
