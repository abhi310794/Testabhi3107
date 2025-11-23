'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to professional dashboard
    router.push('/dashboard/professional');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
        <p style={{ color: 'var(--text-secondary)' }}>Loading dashboard...</p>
      </div>
    </div>
  );
}
