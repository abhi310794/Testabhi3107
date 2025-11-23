'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase, Trade } from '@/lib/supabase';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { TrendingUp, TrendingDown, Filter } from 'lucide-react';

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-700 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading trades...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Trade History</h1>
        <p className="text-slate-400">View and manage all your trades</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-slate-400" />
          <span className="text-slate-400 font-medium">Filter:</span>
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 focus:border-blue-500 focus:outline-none transition"
        >
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
        </select>

        <select
          value={filterAsset}
          onChange={(e) => setFilterAsset(e.target.value as any)}
          className="px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 focus:border-blue-500 focus:outline-none transition"
        >
          <option value="all">All Assets</option>
          <option value="forex">Forex</option>
          <option value="commodity">Commodity</option>
          <option value="index">Index</option>
        </select>
      </div>

      {/* Trades Table */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
        {trades.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400">No trades found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-700/30 border-b border-slate-700">
                  <th className="text-left py-4 px-6 font-semibold">Symbol</th>
                  <th className="text-left py-4 px-6 font-semibold">Asset</th>
                  <th className="text-left py-4 px-6 font-semibold">Date</th>
                  <th className="text-left py-4 px-6 font-semibold">Entry</th>
                  <th className="text-left py-4 px-6 font-semibold">Exit</th>
                  <th className="text-left py-4 px-6 font-semibold">R:R</th>
                  <th className="text-left py-4 px-6 font-semibold">Status</th>
                  <th className="text-right py-4 px-6 font-semibold">P&L</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((trade, idx) => (
                  <tr
                    key={trade.id}
                    onClick={() => router.push(`/dashboard/trade/${trade.id}`)}
                    className={`border-b border-slate-700 hover:bg-slate-700/30 transition cursor-pointer ${
                      idx % 2 === 0 ? 'bg-slate-800/20' : ''
                    }`}
                  >
                    <td className="py-4 px-6 font-medium">{trade.symbol}</td>
                    <td className="py-4 px-6 text-slate-300">
                      {trade.asset_class.charAt(0).toUpperCase() + trade.asset_class.slice(1)}
                    </td>
                    <td className="py-4 px-6 text-slate-400">
                      {format(new Date(trade.trade_date), 'MMM dd, yyyy')}
                    </td>
                    <td className="py-4 px-6">{trade.entry_price.toFixed(5)}</td>
                    <td className="py-4 px-6">
                      {trade.exit_price ? trade.exit_price.toFixed(5) : '—'}
                    </td>
                    <td className="py-4 px-6 font-medium">{trade.risk_reward_ratio}</td>
                    <td className="py-4 px-6">
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
                    <td className={`py-4 px-6 text-right font-semibold flex items-center justify-end gap-1 ${
                      (trade.profit_loss ?? 0) > 0
                        ? 'text-green-400'
                        : (trade.profit_loss ?? 0) < 0
                        ? 'text-red-400'
                        : 'text-slate-300'
                    }`}>
                      {(trade.profit_loss ?? 0) > 0 && <TrendingUp className="w-4 h-4" />}
                      {(trade.profit_loss ?? 0) < 0 && <TrendingDown className="w-4 h-4" />}
                      {trade.profit_loss
                        ? (trade.profit_loss >= 0 ? '+' : '') + trade.profit_loss.toFixed(2)
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {trades.length > 0 && (
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <p className="text-slate-400 text-sm mb-1">Total Trades</p>
            <p className="text-2xl font-bold">{trades.length}</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <p className="text-slate-400 text-sm mb-1">Closed Trades</p>
            <p className="text-2xl font-bold">{trades.filter((t) => t.status === 'closed').length}</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <p className="text-slate-400 text-sm mb-1">Open Trades</p>
            <p className="text-2xl font-bold">{trades.filter((t) => t.status === 'open').length}</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <p className="text-slate-400 text-sm mb-1">Total P&L</p>
            <p className={`text-2xl font-bold ${
              trades.reduce((sum, t) => sum + (t.profit_loss ?? 0), 0) >= 0
                ? 'text-green-400'
                : 'text-red-400'
            }`}>
              {trades.reduce((sum, t) => sum + (t.profit_loss ?? 0), 0) >= 0 ? '+' : ''}
              {trades.reduce((sum, t) => sum + (t.profit_loss ?? 0), 0).toFixed(2)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
