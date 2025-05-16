export interface Leave {
  Timestamp: string;
  EmployeeName: string;
  DayOrHour: 'Day' | 'Hour';
  FromDate: string;
  ToDate: string;
  FromTime?: string;
  ToTime?: string;
  LeaveType: string;
  Status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  AppliedAt: string;
  CancelledAt?: string;
  ManagerActionAt?: string;
}
