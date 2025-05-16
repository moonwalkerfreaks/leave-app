import { NextRequest, NextResponse } from 'next/server';
import { Leave } from '@/types/leave';
import { fetchCSV, updateCSV } from '@/lib/githubCsv';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { employee, timestamp, action } = body;

    if (!employee || !timestamp || !action) {
      return NextResponse.json(
        { error: 'Employee, timestamp, and action are required' },
        { status: 400 }
      );
    }

    if (!['Approved', 'Rejected'].includes(action)) {
      return NextResponse.json(
        { error: 'Action must be either Approved or Rejected' },
        { status: 400 }
      );
    }

    const { content: data } = (await fetchCSV()) as { content: Leave[] };

    let found = false;

    const updated = data.map((entry: Leave) => {
      if (
        entry.Employee.toLowerCase() === employee.toLowerCase() &&
        entry.Timestamp === timestamp &&
        entry.Status === 'Pending'
      ) {
        found = true;
        return {
          ...entry,
          Status: action,
        };
      }
      return entry;
    });

    if (!found) {
      return NextResponse.json(
        { error: 'No matching pending leave found for review' },
        { status: 404 }
      );
    }

    await updateCSV(updated);

    return NextResponse.json(
      { message: `Leave ${action.toLowerCase()} successfully` },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(errorMessage);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

