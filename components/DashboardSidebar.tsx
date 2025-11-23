'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { TrendingUp, BarChart3, BarChart2, CheckCircle2, Calendar, LogOut } from 'lucide-react';

const navItems = [
  { label: 'Overview', icon: '📈', path: '/dashboard', section: 'Dashboard' },
  { label: 'All Trades', icon: '📋', path: '/dashboard/history', section: 'Dashboard' },
  { label: 'Analytics', icon: '📊', path: '/dashboard/performance', section: 'Dashboard' },
  { label: 'Rules Tracker', icon: '✓', path: '/dashboard/rules', section: 'Tools' },
  { label: 'Calendar', icon: '📅', path: '/dashboard/calendar', section: 'Tools' },
];

export function DashboardSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  const dashboardItems = navItems.filter(item => item.section === 'Dashboard');
  const toolItems = navItems.filter(item => item.section === 'Tools');

  return (
    <div className="w-[280px] h-screen flex flex-col" style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(10px)', borderRight: '1px solid var(--glass-border)' }}>
      {/* Header */}
      <div className="p-6 border-b" style={{ borderColor: 'var(--glass-border)' }}>
        <div className="mb-2">
          <div style={{ fontSize: '20px', fontWeight: '800', background: 'linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-green) 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            📊 TradeLogger
          </div>
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: '500' }}>
          Trendline + Rules
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-4 space-y-8">
        {/* Dashboard Section */}
        <div>
          <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', paddingLeft: '8px' }}>
            Dashboard
          </div>
          <div className="space-y-2">
            {dashboardItems.map((item) => (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
                style={{
                  color: pathname === item.path ? 'var(--accent-blue)' : 'var(--text-secondary)',
                  background: pathname === item.path ? 'var(--bg-secondary)' : 'transparent',
                  border: pathname === item.path ? '1px solid var(--accent-blue)' : '1px solid transparent',
                  fontSize: '13px',
                  fontWeight: '500',
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tools Section */}
        <div>
          <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', paddingLeft: '8px' }}>
            Tools
          </div>
          <div className="space-y-2">
            {toolItems.map((item) => (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
                style={{
                  color: pathname === item.path ? 'var(--accent-blue)' : 'var(--text-secondary)',
                  background: pathname === item.path ? 'var(--bg-secondary)' : 'transparent',
                  border: pathname === item.path ? '1px solid var(--accent-blue)' : '1px solid transparent',
                  fontSize: '13px',
                  fontWeight: '500',
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 space-y-3 border-t" style={{ borderColor: 'var(--glass-border)' }}>
        <button
          onClick={() => router.push('/dashboard/new-trade')}
          className="w-full py-3 px-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-all"
          style={{
            background: 'linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-green) 100%)',
            color: 'var(--bg-primary)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 16px rgba(88, 166, 255, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          + Log Trade
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl transition-all"
          style={{
            color: 'var(--text-secondary)',
            borderBottom: '1px solid var(--glass-border)',
            fontSize: '12px',
            fontWeight: '500',
          }}
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
