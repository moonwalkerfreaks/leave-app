'use client';

import { useState, useEffect } from 'react';

const MANAGER_PASSWORD = 'your_password_here'; // TODO: Replace with secure storage or env var in production

type LeaveEntry = {
  Timestamp: string;
  FromDate: string;
  ToDate?: string;
  FromTime?: string;
  ToTime?: string;
  LeaveType: string;
  Status: 'Pending' | 'Approved' | 'Rejected';
  DayOrHour: 'Day' | 'Hour';
};

export default function ManagerDashboard() {
  const [password, setPassword] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [employee, setEmployee] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [leaves, setLeaves] = useState<LeaveEntry[]>([]);
  const [message, setMessage] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === MANAGER_PASSWORD) {
      setIsAuthorized(true);
      setMessage('');
    } else {
      setMessage('❌ Incorrect password. Try again.');
    }
  };

  const fetchLeaves = async () => {
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
        setMessage(data.error || '❌ Error fetching leaves.');
      }
    } catch (error) {
      setLeaves([]);
      setMessage('❌ Network error fetching leaves.');
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      fetchLeaves();
    }
  }, [employee, fromDate, toDate, isAuthorized]);

  const handleReview = async (timestamp: string, action: 'Approved' | 'Rejected') => {
    try {
      const res = await fetch('/api/manager-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employee, timestamp, action }),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage(`✅ Leave ${action.toLowerCase()} successfully.`);
        fetchLeaves();
      } else {
        setMessage(data.error || '❌ Error updating leave.');
      }
    } catch {
      setMessage('❌ Network error updating leave.');
    }
  };

  if (!isAuthorized) {
    return (
      <div className="max-w-md mx-auto p-6 mt-10 bg-white shadow-lg rounded">
        <h1 className="text-2xl font-bold mb-6">Manager Login</h1>
        <form onSubmit={handleLogin}>
          <label className="block mb-4">
            <span className="text-sm">Password:</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="block w-full border p-2 rounded mt-1"
            />
          </label>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Login
          </button>
        </form>
        {message && <p className="mt-4 text-red-600">{message}</p>}
      </div>
    );
  }

  const unapprovedLeaves = leaves.filter((l) => l.Status === 'Pending');
  const approvedLeaves = leaves.filter((l) => l.Status === 'Approved');

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Manager Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <label>
          <span className="block mb-1">Select Employee:</span>
          <select
            value={employee}
            onChange={(e) => setEmployee(e.target.value)}
            className="block w-full border p-2 rounded"
          >
            <option value="">-- Select Employee --</option>
            <option value="John Doe">John Doe</option>
            <option value="Jane Smith">Jane Smith</option>
            {/* TODO: Add remaining 18 employees */}
          </select>
        </label>

        <label>
          <span className="block mb-1">From Date:</span>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="block w-full border p-2 rounded"
          />
        </label>

        <label>
          <span className="block mb-1">To Date:</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="block w-full border p-2 rounded"
          />
        </label>
      </div>

      {message && <p className="mb-4 text-red-600">{message}</p>}

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Pending Leaves</h2>
        {unapprovedLeaves.length === 0 ? (
          <p>No pending leaves in this timeframe.</p>
        ) : (
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="border p-2">From Date</th>
                <th className="border p-2">To Date / Time</th>
                <th className="border p-2">Leave Type</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {unapprovedLeaves.map((leave) => (
                <tr key={leave.Timestamp}>
                  <td className="border p-2">{leave.FromDate}</td>
                  <td className="border p-2">
                    {leave.DayOrHour === 'Day'
                      ? leave.ToDate
                      : `${leave.FromTime} - ${leave.ToTime}`}
                  </td>
                  <td className="border p-2">{leave.LeaveType}</td>
                  <td className="border p-2 space-x-2">
                    <button
                      onClick={() => handleReview(leave.Timestamp, 'Approved')}
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReview(leave.Timestamp, 'Rejected')}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
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
        {approvedLeaves.length === 0 ? (
          <p>No approved leaves in this timeframe.</p>
        ) : (
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="border p-2">From Date</th>
                <th className="border p-2">To Date / Time</th>
                <th className="border p-2">Leave Type</th>
              </tr>
            </thead>
            <tbody>
              {approvedLeaves.map((leave) => (
                <tr key={leave.Timestamp}>
                  <td className="border p-2">{leave.FromDate}</td>
                  <td className="border p-2">
                    {leave.DayOrHour === 'Day'
                      ? leave.ToDate
                      : `${leave.FromTime} - ${leave.ToTime}`}
                  </td>
                  <td className="border p-2">{leave.LeaveType}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

