import { NextRequest, NextResponse } from 'next/server';
import type { Leave } from '@/types/leave';
import type { LeaveRecord } from '@/types/leaveRecord'; // Adjust the path to your LeaveRecord type
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

    // Fetch current CSV data with raw LeaveRecord type
    const { content: leaveRecords, sha } = await fetchCSV() as {
      content: LeaveRecord[];
      sha: string;
    };

    // Transform LeaveRecord[] into Leave[] by adding missing fields with defaults
    const currentData: Leave[] = leaveRecords.map((record) => ({
      EmployeeName: record.EmployeeName || '',
      LeaveType: record.LeaveType || '',
      DayOrHour: record.DayOrHour || '',
      FromDate: record.FromDate || '',
      ToDate: record.ToDate || '',
      FromTime: record.FromTime || '',
      ToTime: record.ToTime || '',
      Status: record.Status || 'Pending',
      Timestamp: record.Timestamp || new Date().toISOString(),
      AppliedAt: record.AppliedAt || '',
      CancelledAt: record.CancelledAt || '',
      ManagerActionAt: record.ManagerActionAt || '',
    }));

    // Create a new Leave record
    const newRecord: Leave = {
      EmployeeName: employee,
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

    currentData.push(newRecord);

    // Update CSV with new data and current sha
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

