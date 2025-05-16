import { NextRequest, NextResponse } from 'next/server';
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

    if (!employee || !leaveType || !dayOrHour || !fromDate || (!toDate && dayOrHour === 'Day')) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { content: currentData } = await fetchCSV();

    const timestamp = new Date().toISOString();

    const newRecord = {
      Employee: employee,
      LeaveType: leaveType,
      DayOrHour: dayOrHour,
      FromDate: fromDate,
      ToDate: dayOrHour === 'Day' ? toDate : '',
      FromTime: dayOrHour === 'Hour' ? fromTime : '',
      ToTime: dayOrHour === 'Hour' ? toTime : '',
      Status: 'Pending',
      Timestamp: timestamp,
    };

    currentData.push(newRecord);

    await updateCSV(currentData);

    return NextResponse.json({ message: 'Leave application submitted', timestamp }, { status: 201 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
