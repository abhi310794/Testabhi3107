'use client';

import { useEffect, useState } from 'react';
import { supabase, Trade } from '@/lib/supabase';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import { TrendingUp, TrendingDown, Lock } from 'lucide-react';

export default function SharedTradePage() {
  const params = useParams();
  const tradeId = params.id as string;

  const [trade, setTrade] = useState<Trade | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!tradeId) return;

    const fetchTrade = async () => {
      try {
        const { data, error } = await supabase
          .from('trades')
          .select('*')
          .eq('id', tradeId)
          .single();

        if (error) throw error;
        setTrade(data);
      } catch (err) {
        console.error('Error fetching trade:', err);
        setError('Trade not found or has been removed');
      } finally {
        setLoading(false);
      }
    };

    fetchTrade();
  }, [tradeId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center text-white">
          <div className="w-12 h-12 border-4 border-slate-700 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading trade...</p>
        </div>
      </div>
    );
  }

  if (error || !trade) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="text-center">
          <Lock className="w-16 h-16 mx-auto mb-4 text-slate-400" />
          <h1 className="text-2xl font-bold mb-2">Trade Not Found</h1>
          <p className="text-slate-400">{error}</p>
        </div>
      </div>
    );
  }

  const profitLoss = trade.profit_loss ?? 0;
  const isProfit = profitLoss > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">{trade.symbol}</h1>
          <p className="text-slate-400">Shared Trade - {format(new Date(trade.trade_date), 'MMMM dd, yyyy')}</p>
        </div>

        {/* Main Card */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 backdrop-blur-sm">
          {/* Trade Result */}
          {trade.status === 'closed' && (
            <div className={`mb-8 p-6 rounded-xl flex items-center justify-between ${
              isProfit
                ? 'bg-green-900/20 border border-green-700'
                : 'bg-red-900/20 border border-red-700'
            }`}>
              <div className="flex items-center gap-4">
                {isProfit ? (
                  <TrendingUp className={`w-8 h-8 ${isProfit ? 'text-green-400' : 'text-red-400'}`} />
                ) : (
                  <TrendingDown className={`w-8 h-8 ${isProfit ? 'text-green-400' : 'text-red-400'}`} />
                )}
                <div>
                  <p className="text-slate-400 text-sm">Trade Result</p>
                  <p className={`text-3xl font-bold ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                    {isProfit ? '+' : ''}{profitLoss.toFixed(5)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Trade Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8 pb-8 border-b border-slate-700">
            <div>
              <p className="text-slate-400 text-sm mb-1">Asset Class</p>
              <p className="text-lg font-semibold">
                {trade.asset_class.charAt(0).toUpperCase() + trade.asset_class.slice(1)}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-sm mb-1">Timeframe</p>
              <p className="text-lg font-semibold">{trade.timeframe}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm mb-1">Leverage</p>
              <p className="text-lg font-semibold">1:{trade.leverage.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm mb-1">Entry Price</p>
              <p className="text-lg font-semibold">{trade.entry_price.toFixed(5)}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm mb-1">Exit Price</p>
              <p className="text-lg font-semibold">
                {trade.exit_price ? trade.exit_price.toFixed(5) : 'Open'}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-sm mb-1">Risk-Reward</p>
              <p className="text-lg font-semibold">{trade.risk_reward_ratio}</p>
            </div>
            <div className="col-span-2 md:col-span-1">
              <p className="text-slate-400 text-sm mb-1">Status</p>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  trade.status === 'open'
                    ? 'bg-blue-900/30 text-blue-300'
                    : trade.status === 'closed'
                    ? 'bg-green-900/30 text-green-300'
                    : 'bg-red-900/30 text-red-300'
                }`}
              >
                {trade.status.charAt(0).toUpperCase() + trade.status.slice(1)}
              </span>
            </div>
          </div>

          {/* Analysis & Notes */}
          {(trade.top_down_analysis || trade.notes) && (
            <div className="space-y-6">
              {trade.top_down_analysis && (
                <div>
                  <h2 className="font-bold text-lg mb-3">Top-Down Analysis</h2>
                  <div className="bg-slate-700/30 rounded-lg p-4 text-slate-300">
                    {typeof trade.top_down_analysis === 'string'
                      ? JSON.parse(trade.top_down_analysis).notes ||
                        JSON.stringify(JSON.parse(trade.top_down_analysis), null, 2)
                      : JSON.stringify(trade.top_down_analysis, null, 2)}
                  </div>
                </div>
              )}

              {trade.notes && (
                <div>
                  <h2 className="font-bold text-lg mb-3">Trade Notes</h2>
                  <div className="bg-slate-700/30 rounded-lg p-4 text-slate-300 whitespace-pre-wrap">
                    {trade.notes}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-slate-400 text-sm">
          <p>This is a shared view of a trade. To create and manage your own trades, visit the full app.</p>
        </div>
      </div>
    </div>
  );
}
