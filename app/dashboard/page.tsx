'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase, Trade } from '@/lib/supabase';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { StatsBoxes } from '@/components/StatsBoxes';
import { ProfessionalTradeCard } from '@/components/ProfessionalTradeCard';
import { useRouter } from 'next/navigation';

type FilterType = 'all' | 'open' | 'closed' | 'winning' | 'losing';

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [stats, setStats] = useState({
    totalTrades: 0,
    winRate: 0,
    totalPnL: 0,
    compliance: 0,
    avgWin: 0,
    avgLoss: 0,
    bestTrade: 0,
    worstTrade: 0,
  });

  useEffect(() => {
    if (!user) return;

    const fetchTrades = async () => {
      try {
        const { data, error } = await supabase
          .from('trades')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setTrades(data || []);
        calculateStats(data || []);
      } catch (err) {
        console.error('Error fetching trades:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrades();
  }, [user]);

  const calculateStats = (allTrades: Trade[]) => {
    const totalTrades = allTrades.length;
    const closedTrades = allTrades.filter((t) => t.status === 'closed');
    const winningTrades = closedTrades.filter((t) => (t.profit_loss ?? 0) > 0);
    const losingTrades = closedTrades.filter((t) => (t.profit_loss ?? 0) < 0);

    const totalPnL = closedTrades.reduce((sum, t) => sum + (t.profit_loss ?? 0), 0);
    const avgWin = winningTrades.length > 0 ? winningTrades.reduce((sum, t) => sum + (t.profit_loss ?? 0), 0) / winningTrades.length : 0;
    const avgLoss = losingTrades.length > 0 ? losingTrades.reduce((sum, t) => sum + (t.profit_loss ?? 0), 0) / losingTrades.length : 0;
    const bestTrade = closedTrades.length > 0 ? Math.max(...closedTrades.map((t) => t.profit_loss ?? 0)) : 0;
    const worstTrade = closedTrades.length > 0 ? Math.min(...closedTrades.map((t) => t.profit_loss ?? 0)) : 0;

    setStats({
      totalTrades,
      winRate: closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0,
      totalPnL,
      compliance: totalTrades > 0 ? (allTrades.filter((t) => t.checklist_completed).length / totalTrades) * 100 : 0,
      avgWin,
      avgLoss,
      bestTrade,
      worstTrade,
    });
  };

  const getFilteredTrades = () => {
    let filtered = trades;

    switch (filter) {
      case 'open':
        return filtered.filter((t) => t.status === 'open');
      case 'closed':
        return filtered.filter((t) => t.status === 'closed');
      case 'winning':
        return filtered.filter((t) => t.status === 'closed' && (t.profit_loss ?? 0) > 0);
      case 'losing':
        return filtered.filter((t) => t.status === 'closed' && (t.profit_loss ?? 0) < 0);
      default:
        return filtered;
    }
  };

  const filteredTrades = getFilteredTrades();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p style={{ color: 'var(--text-secondary)' }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f1117 0%, #161b22 50%, #0f1117 100%)' }}>
      {/* Sidebar */}
      <DashboardSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div
          className="p-6 border-b flex items-center justify-between"
          style={{
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(10px)',
            borderColor: 'var(--glass-border)',
          }}
        >
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)' }}>
            Dashboard Overview
          </h1>

          <div className="flex gap-2">
            {(['all', 'open', 'closed', 'winning', 'losing'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-4 py-2 rounded-xl transition-all"
                style={{
                  background: filter === f ? 'var(--accent-blue)' : 'var(--bg-secondary)',
                  color: filter === f ? 'var(--bg-primary)' : 'var(--text-secondary)',
                  border: filter === f ? '1px solid var(--accent-blue)' : '1px solid var(--border-color)',
                  fontSize: '12px',
                  fontWeight: '600',
                  textTransform: 'capitalize',
                  cursor: 'pointer',
                }}
              >
                {f === 'all' ? 'All' : f === 'open' ? 'Open' : f === 'closed' ? 'Closed' : f === 'winning' ? 'Winners' : 'Losers'}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* Stats Row */}
          <StatsBoxes
            totalTrades={stats.totalTrades}
            winRate={stats.winRate}
            totalPnL={stats.totalPnL}
            compliance={stats.compliance}
          />

          {/* Main Grid */}
          <div className="grid grid-cols-3 gap-8">
            {/* Trades List - Takes 2 columns */}
            <div className="col-span-2">
              <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '16px', color: 'var(--text-primary)' }}>
                {filter === 'all' ? 'All Trades' : filter === 'open' ? 'Open Trades' : filter === 'closed' ? 'Closed Trades' : filter === 'winning' ? 'Winning Trades' : 'Losing Trades'}
              </div>

              {filteredTrades.length === 0 ? (
                <div
                  className="p-12 rounded-xl text-center"
                  style={{
                    background: 'var(--glass-bg)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid var(--glass-border)',
                  }}
                >
                  <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }}>📭</div>
                  <div style={{ color: 'var(--text-secondary)' }}>No trades found</div>
                </div>
              ) : (
                <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                  {filteredTrades.map((trade) => (
                    <ProfessionalTradeCard key={trade.id} trade={trade} />
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar Widgets - Right Column */}
            <div className="space-y-4">
              {/* Statistics Widget */}
              <div
                className="p-4 rounded-xl"
                style={{
                  background: 'var(--glass-bg)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid var(--glass-border)',
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
                  Statistics
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Avg Win</span>
                    <span style={{ color: 'var(--accent-green)', fontWeight: '700' }}>
                      {stats.avgWin.toFixed(2)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Avg Loss</span>
                    <span style={{ color: 'var(--accent-red)', fontWeight: '700' }}>
                      {stats.avgLoss.toFixed(2)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Best Trade</span>
                    <span style={{ color: 'var(--accent-green)', fontWeight: '700' }}>
                      +{stats.bestTrade.toFixed(2)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Worst Trade</span>
                    <span style={{ color: 'var(--accent-red)', fontWeight: '700' }}>
                      {stats.worstTrade.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recent Activity Widget */}
              <div
                className="p-4 rounded-xl"
                style={{
                  background: 'var(--glass-bg)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid var(--glass-border)',
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
                  Recent Activity
                </div>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {trades.slice(0, 5).map((trade) => (
                    <div
                      key={trade.id}
                      onClick={() => router.push(`/dashboard/trade/${trade.id}`)}
                      className="p-2 rounded-lg cursor-pointer transition-all"
                      style={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        fontSize: '11px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>
                          {trade.symbol}
                        </span>
                        <span
                          style={{
                            color: trade.status === 'open' ? 'var(--text-tertiary)' : (trade.profit_loss ?? 0) > 0 ? 'var(--accent-green)' : 'var(--accent-red)',
                            fontWeight: '700',
                            fontFamily: "'Outfit', monospace",
                          }}
                        >
                          {trade.status === 'open' ? 'OPEN' : (trade.profit_loss ?? 0) > 0 ? '+' : ''}
                          {trade.status === 'open' ? '' : trade.profit_loss?.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
