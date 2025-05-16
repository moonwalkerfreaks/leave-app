import { NextRequest, NextResponse } from 'next/server';
import { fetchCSV } from '@/lib/githubCsv';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const employee = searchParams.get('employee');
    const status = searchParams.get('status');
    const from = searchParams.get('from'); // optional date string
    const to = searchParams.get('to');     // optional date string

    if (!employee) {
      return NextResponse.json({ error: 'Employee name is required' }, { status: 400 });
    }

    const { content } = await fetchCSV();

    // Filter based on query
    const filtered = content.filter((entry: any) => {
      const isEmployeeMatch = entry.Employee.toLowerCase() === employee.toLowerCase();
      const isStatusMatch = status ? entry.Status === status : true;

      const entryDate = new Date(entry.FromDate);
      const isFromMatch = from ? entryDate >= new Date(from) : true;
      const isToMatch = to ? entryDate <= new Date(to) : true;

      return isEmployeeMatch && isStatusMatch && isFromMatch && isToMatch;
    });

    return NextResponse.json({ leaves: filtered }, { status: 200 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
