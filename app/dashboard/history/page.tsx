'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase, Trade } from '@/lib/supabase';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { TrendingUp, TrendingDown, Filter } from 'lucide-react';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { ProfessionalTradeCard } from '@/components/ProfessionalTradeCard';

export default function HistoryPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'closed'>('all');
  const [filterAsset, setFilterAsset] = useState<'all' | 'forex' | 'commodity' | 'index'>('all');

  useEffect(() => {
    if (!user) return;

    const fetchTrades = async () => {
      try {
        let query = supabase
          .from('trades')
          .select('*')
          .eq('user_id', user.id)
          .order('trade_date', { ascending: false });

        if (filterStatus !== 'all') {
          query = query.eq('status', filterStatus);
        }

        if (filterAsset !== 'all') {
          query = query.eq('asset_class', filterAsset);
        }

        const { data, error } = await query;

        if (error) throw error;
        setTrades(data || []);
      } catch (err) {
        console.error('Error fetching trades:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrades();
  }, [user, filterStatus, filterAsset]);

  if (loading) {
    return (
      <div className="flex h-screen">
        <DashboardSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
            <p style={{ color: 'var(--text-secondary)' }}>Loading trades...</p>
          </div>
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
          className="p-6 border-b"
          style={{
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(10px)',
            borderColor: 'var(--glass-border)',
          }}
        >
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)' }}>
            Trade History
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            View and manage all your trades
          </p>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* Filters */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Filter className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
              <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>Filter:</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <div>
                <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-tertiary)' }}>Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="w-full mt-2 px-4 py-2 rounded-lg transition-all"
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontSize: '12px',
                  }}
                >
                  <option value="all">All Status</option>
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-tertiary)' }}>Asset Class</label>
                <select
                  value={filterAsset}
                  onChange={(e) => setFilterAsset(e.target.value as any)}
                  className="w-full mt-2 px-4 py-2 rounded-lg transition-all"
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontSize: '12px',
                  }}
                >
                  <option value="all">All Assets</option>
                  <option value="forex">Forex</option>
                  <option value="commodity">Commodity</option>
                  <option value="index">Index</option>
                </select>
              </div>
            </div>
          </div>

          {/* Trades Grid */}
          {trades.length === 0 ? (
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {trades.map((trade) => (
                <ProfessionalTradeCard key={trade.id} trade={trade} />
              ))}
            </div>
          )}

          {/* Summary Stats */}
          {trades.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div
                className="p-4 rounded-xl"
                style={{
                  background: 'var(--glass-bg)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid var(--glass-border)',
                }}
              >
                <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: '600', marginBottom: '8px' }}>
                  Total Trades
                </p>
                <p style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)' }}>
                  {trades.length}
                </p>
              </div>
              <div
                className="p-4 rounded-xl"
                style={{
                  background: 'var(--glass-bg)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid var(--glass-border)',
                }}
              >
                <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: '600', marginBottom: '8px' }}>
                  Closed Trades
                </p>
                <p style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)' }}>
                  {trades.filter((t) => t.status === 'closed').length}
                </p>
              </div>
              <div
                className="p-4 rounded-xl"
                style={{
                  background: 'var(--glass-bg)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid var(--glass-border)',
                }}
              >
                <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: '600', marginBottom: '8px' }}>
                  Open Trades
                </p>
                <p style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)' }}>
                  {trades.filter((t) => t.status === 'open').length}
                </p>
              </div>
              <div
                className="p-4 rounded-xl"
                style={{
                  background: 'var(--glass-bg)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid var(--glass-border)',
                }}
              >
                <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: '600', marginBottom: '8px' }}>
                  Total P&L
                </p>
                <p
                  style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: trades.reduce((sum, t) => sum + (t.profit_loss ?? 0), 0) >= 0
                      ? 'var(--accent-green)'
                      : 'var(--accent-red)',
                  }}
                >
                  {trades.reduce((sum, t) => sum + (t.profit_loss ?? 0), 0) >= 0 ? '+' : ''}
                  {trades.reduce((sum, t) => sum + (t.profit_loss ?? 0), 0).toFixed(2)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
