import { NextRequest, NextResponse } from 'next/server';
import { Leave } from '@/types/leave';
import { fetchCSV, updateCSV } from '@/lib/githubCsv';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { employee, timestamp } = body;

    if (!employee || !timestamp) {
      return NextResponse.json({ error: 'Employee and timestamp are required' }, { status: 400 });
    }

    // Explicitly type fetched data
    const { content: data } = await fetchCSV() as { content: Leave[] };

    let found = false;

    const updated = data.map((entry) => {
      if (
        entry.Employee.toLowerCase() === employee.toLowerCase() &&
        entry.Timestamp === timestamp &&
        entry.Status === 'Pending'
      ) {
        found = true;
        return {
          ...entry,
          Status: 'Cancelled',
        };
      }
      return entry;
    });

    if (!found) {
      return NextResponse.json({ error: 'No matching pending leave found for cancellation' }, { status: 404 });
    }

    await updateCSV(updated);

    return NextResponse.json({ message: 'Leave cancelled successfully' }, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(errorMessage);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

