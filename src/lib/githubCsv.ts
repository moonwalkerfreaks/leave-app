import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

const token = process.env.GITHUB_TOKEN!;
const repo = process.env.GITHUB_REPO!;
const owner = process.env.GITHUB_OWNER!;
const filePath = process.env.GITHUB_FILE_PATH!;
const apiBase = `https://api.github.com/repos/moonwalkerfreaks/leave-app-data/contents/data/leave-log.csv?ref=main`;

export async function fetchCSV(): Promise<{ content: any[], sha: string }> {
  const res = await fetch(apiBase, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (!res.ok) throw new Error('Failed to fetch CSV');

  const data = await res.json();
  const csvContent = Buffer.from(data.content, 'base64').toString('utf-8');
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
  });

  return { content: records, sha: data.sha };
}

export async function updateCSV(records: any[]) {
  const csvString = stringify(records, { header: true });
  const { sha } = await fetchCSV();

  const res = await fetch(apiBase, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
    },
    body: JSON.stringify({
      message: 'Update leave-log.csv',
      content: Buffer.from(csvString).toString('base64'),
      sha,
    }),
  });

  if (!res.ok) throw new Error('Failed to update CSV on GitHub');
}
