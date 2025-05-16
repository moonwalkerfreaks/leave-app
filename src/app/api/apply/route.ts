import { NextRequest, NextResponse } from 'next/server';
import { Leave } from '@/types/leave';
import { fetchCSV, updateCSV } from '@/lib/githubCsv';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      employee,
      leaveType,
      dayOrHour,
      fromDate,
      toDate,
      fromTime,
      toTime,
    } = body;

    // Basic validation for required fields
    if (
      !employee ||
      !leaveType ||
      !dayOrHour ||
      !fromDate ||
      (dayOrHour === 'Day' && !toDate)
    ) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Fetch current CSV data and type it as Leave[]
    const { content: currentData } = await fetchCSV() as { content: Leave[] };

    // Create a new record typed as Leave
    const newRecord: Leave = {
      Employee: employee,
      LeaveType: leaveType,
      DayOrHour: dayOrHour,
      FromDate: fromDate,
      ToDate: dayOrHour === 'Day' ? toDate : '',
      FromTime: dayOrHour === 'Hour' ? fromTime : '',
      ToTime: dayOrHour === 'Hour' ? toTime : '',
      Status: 'Pending',
      Timestamp: new Date().toISOString(),
    };

    currentData.push(newRecord);

    await updateCSV(currentData);

    return NextResponse.json({ message: 'Leave application submitted', timestamp: newRecord.Timestamp }, { status: 201 });
  } catch (error) {
    // Use unknown here and then safely check error message to avoid 'any'
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(errorMessage);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

