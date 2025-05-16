// src/types/leaveRecord.ts

export interface LeaveRecord {
  Timestamp: string;        // ISO date string when record was created
  EmployeeName: string;
  DayOrHour: 'Day' | 'Hour';
  FromDate: string;         // Date string, e.g. "2025-05-16"
  ToDate: string;           // Date string, can be empty string if not applicable
  FromTime: string;         // Time string, empty if Day type
  ToTime: string;           // Time string, empty if Day type
  LeaveType: string;
  Status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  AppliedAt: string;
  CancelledAt: string;      // empty string if not cancelled
  ManagerActionAt: string;  // empty string if no action yet
}
