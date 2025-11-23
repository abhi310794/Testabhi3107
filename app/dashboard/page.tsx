'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase, Trade } from '@/lib/supabase';
import { TrendingUp, TrendingDown, BarChart3, PlusCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTrades: 0,
    winRate: 0,
    totalProfit: 0,
    openTrades: 0,
  });

  useEffect(() => {
    if (!user) return;

    const fetchTrades = async () => {
      try {
        const { data, error } = await supabase
          .from('trades')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) throw error;

        setTrades(data || []);

        // Calculate stats
        const closedTrades = (data || []).filter((t) => t.status === 'closed');
        const winningTrades = closedTrades.filter((t) => (t.profit_loss ?? 0) > 0);
        const totalProfit = closedTrades.reduce((sum, t) => sum + (t.profit_loss ?? 0), 0);
        const openTrades = (data || []).filter((t) => t.status === 'open');

        setStats({
          totalTrades: data?.length || 0,
          winRate: closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0,
          totalProfit,
          openTrades: openTrades.length,
        });
      } catch (err) {
        console.error('Error fetching trades:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrades();

    // Subscribe to real-time updates
    const subscription = supabase
      .from('trades')
      .on('*', () => {
        fetchTrades();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-700 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Trading Dashboard</h1>
        <p className="text-slate-400">Welcome back, {user?.email?.split('@')[0]}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">Total Trades</p>
              <p className="text-3xl font-bold">{stats.totalTrades}</p>
            </div>
            <BarChart3 className="w-12 h-12 text-blue-500 opacity-20" />
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">Win Rate</p>
              <p className="text-3xl font-bold">{stats.winRate.toFixed(0)}%</p>
            </div>
            <TrendingUp className="w-12 h-12 text-green-500 opacity-20" />
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">Total P&L</p>
              <p className={`text-3xl font-bold ${stats.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {stats.totalProfit >= 0 ? '+' : ''}{stats.totalProfit.toFixed(2)}
              </p>
            </div>
            <TrendingDown className="w-12 h-12 text-orange-500 opacity-20" />
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">Open Trades</p>
              <p className="text-3xl font-bold">{stats.openTrades}</p>
            </div>
            <BarChart3 className="w-12 h-12 text-cyan-500 opacity-20" />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => router.push('/dashboard/new-trade')}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-lg font-bold transition"
        >
          <PlusCircle className="w-5 h-5" />
          New Trade
        </button>
      </div>

      {/* Recent Trades */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-6">Recent Trades</h2>

        {trades.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400 mb-4">No trades recorded yet</p>
            <button
              onClick={() => router.push('/dashboard/new-trade')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
            >
              <PlusCircle className="w-4 h-4" />
              Create Your First Trade
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 font-semibold">Symbol</th>
                  <th className="text-left py-3 px-4 font-semibold">Date</th>
                  <th className="text-left py-3 px-4 font-semibold">Entry</th>
                  <th className="text-left py-3 px-4 font-semibold">Status</th>
                  <th className="text-right py-3 px-4 font-semibold">P&L</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((trade) => (
                  <tr
                    key={trade.id}
                    onClick={() => router.push(`/dashboard/trade/${trade.id}`)}
                    className="border-b border-slate-700 hover:bg-slate-700/30 transition cursor-pointer"
                  >
                    <td className="py-3 px-4 font-medium">{trade.symbol}</td>
                    <td className="py-3 px-4 text-slate-400">
                      {format(new Date(trade.trade_date), 'MMM dd, yyyy')}
                    </td>
                    <td className="py-3 px-4">{trade.entry_price.toFixed(5)}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          trade.status === 'open'
                            ? 'bg-blue-900/30 text-blue-300'
                            : trade.status === 'closed'
                            ? 'bg-green-900/30 text-green-300'
                            : 'bg-red-900/30 text-red-300'
                        }`}
                      >
                        {trade.status.charAt(0).toUpperCase() + trade.status.slice(1)}
                      </span>
                    </td>
                    <td className={`py-3 px-4 text-right font-medium ${
                      (trade.profit_loss ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {trade.profit_loss ? (trade.profit_loss >= 0 ? '+' : '') + trade.profit_loss.toFixed(2) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {trades.length > 0 && (
          <div className="mt-4 text-center">
            <button
              onClick={() => router.push('/dashboard/history')}
              className="text-blue-400 hover:text-blue-300 font-medium transition"
            >
              View All Trades →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
