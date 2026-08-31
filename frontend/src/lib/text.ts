export function plainText(html: string): string {
  let out = '';
  let at = 0;

  while (at < html.length) {
    if (html[at] === '<') {
      const close = html.indexOf('>', at + 1);

      if (close === -1) {
        out += html.slice(at);
        break;
      }

      out += ' ';
      at = close + 1;
      continue;
    }

    out += html[at];
    at += 1;
  }

  return out.replace(/\s+/g, ' ').trim();
}
