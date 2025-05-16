'use client';

import { useState, useEffect } from 'react';

const MANAGER_PASSWORD = 'your_password_here'; // Replace with your real password (or better: use env variables)

export default function ManagerDashboard() {
  const [password, setPassword] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [employee, setEmployee] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [leaves, setLeaves] = useState<any[]>([]);
  const [message, setMessage] = useState('');

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (password === MANAGER_PASSWORD) {
      setIsAuthorized(true);
      setMessage('');
    } else {
      setMessage('Incorrect password');
    }
  }

  async function fetchLeaves() {
    if (!employee || !fromDate || !toDate) {
      setLeaves([]);
      return;
    }
    try {
      const res = await fetch(
        `/api/get-leaves?employee=${encodeURIComponent(employee)}&fromDate=${fromDate}&toDate=${toDate}`
      );
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
  }

  useEffect(() => {
    if (isAuthorized) {
      fetchLeaves();
    }
  }, [employee, fromDate, toDate, isAuthorized]);

  async function handleReview(timestamp: string, action: 'Approved' | 'Rejected') {
    try {
      const res = await fetch('/api/manager-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employee, timestamp, action }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`Leave ${action.toLowerCase()} successfully`);
        fetchLeaves(); // Refresh list
      } else {
        setMessage(data.error || 'Error updating leave');
      }
    } catch {
      setMessage('Network error updating leave');
    }
  }

  if (!isAuthorized) {
    return (
      <div className="max-w-md mx-auto p-4">
        <h1 className="text-xl font-bold mb-4">Manager Login</h1>
        <form onSubmit={handleLogin}>
          <label className="block mb-2">
            Password:
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="block w-full border p-2 rounded"
            />
          </label>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Login
          </button>
          {message && <p className="mt-4 text-red-600">{message}</p>}
        </form>
      </div>
    );
  }

  // Split leaves into unapproved and approved lists
  const unapprovedLeaves = leaves.filter((l) => l.Status === 'Pending');
  const approvedLeaves = leaves.filter((l) => l.Status === 'Approved');

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Manager Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <label>
          Select Employee:
          <select
            value={employee}
            onChange={(e) => setEmployee(e.target.value)}
            className="block w-full border p-2 rounded"
          >
            <option value="">-- Select Employee --</option>
            {/* Add your 20 employees here */}
            <option value="John Doe">John Doe</option>
            <option value="Jane Smith">Jane Smith</option>
            {/* ... */}
          </select>
        </label>

        <label>
          From Date:
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="block w-full border p-2 rounded"
          />
        </label>

        <label>
          To Date:
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="block w-full border p-2 rounded"
          />
        </label>
      </div>

      {message && <p className="mb-4">{message}</p>}

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Unapproved Leaves</h2>
        {unapprovedLeaves.length === 0 && <p>No unapproved leaves in this timeframe.</p>}
        {unapprovedLeaves.length > 0 && (
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 p-2">From Date</th>
                <th className="border border-gray-300 p-2">To Date / Time</th>
                <th className="border border-gray-300 p-2">Leave Type</th>
                <th className="border border-gray-300 p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {unapprovedLeaves.map((leave) => (
                <tr key={leave.Timestamp}>
                  <td className="border border-gray-300 p-2">{leave.FromDate}</td>
                  <td className="border border-gray-300 p-2">
                    {leave.DayOrHour === 'Day' ? leave.ToDate : `${leave.FromTime} - ${leave.ToTime}`}
                  </td>
                  <td className="border border-gray-300 p-2">{leave.LeaveType}</td>
                  <td className="border border-gray-300 p-2 space-x-2">
                    <button
                      onClick={() => handleReview(leave.Timestamp, 'Approved')}
                      className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReview(leave.Timestamp, 'Rejected')}
                      className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">Approved Leaves</h2>
        {approvedLeaves.length === 0 && <p>No approved leaves in this timeframe.</p>}
        {approvedLeaves.length > 0 && (
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 p-2">From Date</th>
                <th className="border border-gray-300 p-2">To Date / Time</th>
                <th className="border border-gray-300 p-2">Leave Type</th>
              </tr>
            </thead>
            <tbody>
              {approvedLeaves.map((leave) => (
                <tr key={leave.Timestamp}>
                  <td className="border border-gray-300 p-2">{leave.FromDate}</td>
                  <td className="border border-gray-300 p-2">
                    {leave.DayOrHour === 'Day' ? leave.ToDate : `${leave.FromTime} - ${leave.ToTime}`}
                  </td>
                  <td className="border border-gray-300 p-2">{leave.LeaveType}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

