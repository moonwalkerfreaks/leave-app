'use client';

import { useState } from 'react';

export default function ApplyLeave() {
  const [employee, setEmployee] = useState('');
  const [dayOrHour, setDayOrHour] = useState('Day');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [fromTime, setFromTime] = useState('');
  const [toTime, setToTime] = useState('');
  const [leaveType, setLeaveType] = useState('Sick Leave');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const payload = {
      employee,
      dayOrHour,
      fromDate,
      toDate: dayOrHour === 'Day' ? toDate : fromDate,
      fromTime: dayOrHour === 'Hour' ? fromTime : '',
      toTime: dayOrHour === 'Hour' ? toTime : '',
      leaveType,
    };

    try {
      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Leave applied successfully');
        // Reset form or keep values
      } else {
        setMessage(data.error || 'Error applying leave');
      }
    } catch (error) {
      setMessage('Network error');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Apply for Leave</h1>

      <label className="block mb-2">
        Employee Name:
        <select
          value={employee}
          onChange={(e) => setEmployee(e.target.value)}
          required
          className="block w-full border p-2 rounded"
        >
          {/* Populate options with your 20 employee names */}
          <option value="">Select Employee</option>
          <option value="John Doe">John Doe</option>
          <option value="Jane Smith">Jane Smith</option>
          {/* Add all employees here */}
        </select>
      </label>

      <label className="block mb-2">
        Leave for:
        <select
          value={dayOrHour}
          onChange={(e) => setDayOrHour(e.target.value)}
          className="block w-full border p-2 rounded"
        >
          <option value="Day">Day</option>
          <option value="Hour">Hour</option>
        </select>
      </label>

      <label className="block mb-2">
        From Date:
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          required
          className="block w-full border p-2 rounded"
        />
      </label>

      {dayOrHour === 'Day' && (
        <label className="block mb-2">
          To Date:
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            required
            className="block w-full border p-2 rounded"
          />
        </label>
      )}

      {dayOrHour === 'Hour' && (
        <>
          <label className="block mb-2">
            From Time:
            <input
              type="time"
              value={fromTime}
              onChange={(e) => setFromTime(e.target.value)}
              required
              className="block w-full border p-2 rounded"
            />
          </label>
          <label className="block mb-2">
            To Time:
            <input
              type="time"
              value={toTime}
              onChange={(e) => setToTime(e.target.value)}
              required
              className="block w-full border p-2 rounded"
            />
          </label>
        </>
      )}

      <label className="block mb-2">
        Leave Type:
        <select
          value={leaveType}
          onChange={(e) => setLeaveType(e.target.value)}
          className="block w-full border p-2 rounded"
        >
          <option value="Sick Leave">Sick Leave</option>
          <option value="Casual Leave">Casual Leave</option>
          <option value="Earned Leave">Earned Leave</option>
          {/* Add more types as needed */}
        </select>
      </label>

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Apply
      </button>

      {message && <p className="mt-4">{message}</p>}
    </form>
  );
}

