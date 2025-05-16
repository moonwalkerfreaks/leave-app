// src/app/page.tsx

import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-6">Welcome to Leave Application App</h1>
      <nav className="space-x-4">
        <Link href="/apply" className="text-blue-600 underline">Apply for Leave</Link>
        <Link href="/cancel" className="text-blue-600 underline">Cancel Leave</Link>
        <Link href="/manager" className="text-blue-600 underline">Manager Dashboard</Link>
      </nav>
    </main>
  );
}

