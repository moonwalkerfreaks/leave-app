'use client';

import { useState, useEffect } from 'react';

export default function CancelLeave() {
  const [employee, setEmployee] = useState('');
  const [leaves, setLeaves] = useState<LeaveType[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function fetchLeaves(emp: string) {
    if (!emp) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/get-leaves?employee=${encodeURIComponent(emp)}`);
      const data = await res.json();
      if (res.ok) {
        setLeaves(data.leaves);
        setMessage('');
      } else {
        setLeaves([]);
        setMessage(data.error || 'Error fetching leaves');
      }
    } catch {
      setLeaves([]);
      setMessage('Network error fetching leaves');
    }
    setLoading(false);
  }

  useEffect(() => {
    if (employee) {
      fetchLeaves(employee);
    } else {
      setLeaves([]);
    }
  }, [employee]);

  async function handleCancel(timestamp: string) {
    if (!employee) return;
    if (!confirm('Are you sure you want to cancel this leave?')) return;

    try {
      const res = await fetch('/api/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employee, timestamp }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Leave cancelled successfully');
        // Refresh the leave list after cancellation
        fetchLeaves(employee);
      } else {
        setMessage(data.error || 'Error cancelling leave');
      }
    } catch {
      setMessage('Network error cancelling leave');
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Cancel Leave</h1>

      <label className="block mb-4">
        Select Employee:
        <select
          value={employee}
          onChange={(e) => setEmployee(e.target.value)}
          className="block w-full border p-2 rounded"
        >
          <option value="">-- Select Employee --</option>
          {/* Add all 20 employees here */}
          <option value="John Doe">John Doe</option>
          <option value="Jane Smith">Jane Smith</option>
          {/* ... */}
        </select>
      </label>

      {loading && <p>Loading leaves...</p>}

      {!loading && leaves.length === 0 && <p>No leaves applied.</p>}

      {!loading && leaves.length > 0 && (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 p-2">From Date</th>
              <th className="border border-gray-300 p-2">To Date / Time</th>
              <th className="border border-gray-300 p-2">Leave Type</th>
              <th className="border border-gray-300 p-2">Status</th>
              <th className="border border-gray-300 p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {leaves.map((leave) => (
              <tr key={leave.Timestamp}>
                <td className="border border-gray-300 p-2">{leave.FromDate}</td>
                <td className="border border-gray-300 p-2">
                  {leave.DayOrHour === 'Day' ? leave.ToDate : `${leave.FromTime} - ${leave.ToTime}`}
                </td>
                <td className="border border-gray-300 p-2">{leave.LeaveType}</td>
                <td className="border border-gray-300 p-2">{leave.Status}</td>
                <td className="border border-gray-300 p-2">
                  {leave.Status === 'Pending' ? (
                    <button
                      onClick={() => handleCancel(leave.Timestamp)}
                      className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                    >
                      Cancel
                    </button>
                  ) : (
                    'N/A'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {message && <p className="mt-4">{message}</p>}
    </div>
  );
}

