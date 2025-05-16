import { NextRequest, NextResponse } from 'next/server';
import type { Leave } from '@/types/leave';
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
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Fetch current CSV data and destructure content and sha
    const { content: currentData, sha } = await fetchCSV();

    // Assuming currentData is LeaveRecord[] which has the same fields as Leave,
    // If not, you should transform here.
    // For now, treat it as Leave[] for simplicity

    // Create a new Leave record
    const newRecord: Leave = {
      EmployeeName: employee, // Match the property name in Leave interface
      LeaveType: leaveType,
      DayOrHour: dayOrHour,
      FromDate: fromDate,
      ToDate: dayOrHour === 'Day' ? toDate : '',
      FromTime: dayOrHour === 'Hour' ? fromTime : '',
      ToTime: dayOrHour === 'Hour' ? toTime : '',
      Status: 'Pending',
      Timestamp: new Date().toISOString(),
      AppliedAt: new Date().toISOString(),
      CancelledAt: '',
      ManagerActionAt: '',
    };

    // Add the new record
    currentData.push(newRecord);

    // Update CSV with new data and existing sha for optimistic concurrency
    await updateCSV(currentData, sha);

    return NextResponse.json(
      {
        message: 'Leave application submitted',
        timestamp: newRecord.Timestamp,
      },
      { status: 201 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Apply leave error:', errorMessage);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

