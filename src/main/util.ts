/* eslint import/prefer-default-export: off */
import { URL } from 'url';
import path from 'path';

export function resolveHtmlPath(htmlFileName: string) {
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || 1212;
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    return url.href;
  }
  return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
}

export function csvJSON(text: string, quoteChar = '"', delimiter = ',') {
  const rows = text.split('\n');
  const headers = rows[0].split(',');

  const regex = new RegExp(
    `\\s*(${quoteChar})?(.*?)\\1\\s*(?:${delimiter}|$)`,
    'gs',
  );

  const match = (line: any) =>
    [...line.matchAll(regex)].map((m) => m[2]).slice(0, -1);

  let lines = text.split('\n');
  const heads = headers ?? match(lines.shift());
  lines = lines.slice(1);

  return lines.map((line) => {
    return match(line).reduce((acc, cur, i) => {
      // replace blank matches with `null`
      const val = cur.length <= 0 ? null : Number(cur) || cur;
      const key = heads[i] ?? `{i}`;
      return { ...acc, [key]: val };
    }, {});
  });
}
