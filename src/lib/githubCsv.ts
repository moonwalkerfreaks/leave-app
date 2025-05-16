import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

// GitHub API endpoint for your raw CSV file
const token = process.env.GITHUB_TOKEN!;
const apiBase = `https://api.github.com/repos/moonwalkerfreaks/leave-app-data/contents/data/leave-log.csv?ref=main`;

// Define the structure of each leave record
export interface LeaveRecord {
  name: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
  timestamp: string;
}

// Fetch and decode CSV from GitHub
export async function fetchCSV(): Promise<{ content: LeaveRecord[]; sha: string }> {
  const res = await fetch(apiBase, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch CSV: ${res.status} ${res.statusText}`);
  }

  const data: {
    content: string;
    sha: string;
  } = await res.json();

  const csvContent = Buffer.from(data.content, 'base64').toString('utf-8');

  const records: LeaveRecord[] = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
  });

  return { content: records, sha: data.sha };
}

// Update CSV file on GitHub
export async function updateCSV(records: LeaveRecord[]): Promise<void> {
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

  if (!res.ok) {
    throw new Error(`Failed to update CSV on GitHub: ${res.status} ${res.statusText}`);
  }
}

