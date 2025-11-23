'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase, Trade } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Copy, CheckCircle2, Edit2, X } from 'lucide-react';

export default function TradeDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const tradeId = params.id as string;

  const [trade, setTrade] = useState<Trade | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [exitPrice, setExitPrice] = useState('');
  const [profitLoss, setProfitLoss] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    if (!user || !tradeId) return;

    const fetchTrade = async () => {
      try {
        const { data, error } = await supabase
          .from('trades')
          .select('*')
          .eq('id', tradeId)
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        setTrade(data);
        setExitPrice(data.exit_price?.toString() || '');
        setProfitLoss(data.profit_loss?.toString() || '');

        // Generate share URL
        setShareUrl(`${window.location.origin}/share/${tradeId}`);
      } catch (err) {
        console.error('Error fetching trade:', err);
        setError('Failed to load trade');
      } finally {
        setLoading(false);
      }
    };

    fetchTrade();
  }, [user, tradeId]);

  const handleCloseTrade = async () => {
    setError('');
    setSuccess('');

    if (!exitPrice) {
      setError('Exit price is required');
      return;
    }

    setIsClosing(true);

    try {
      const exit = parseFloat(exitPrice);
      const entry = trade?.entry_price || 0;
      const pl = exit - entry;

      const { error } = await supabase
        .from('trades')
        .update({
          exit_price: exit,
          profit_loss: pl,
          status: 'closed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', tradeId);

      if (error) throw error;

      setTrade((prev) =>
        prev
          ? {
              ...prev,
              exit_price: exit,
              profit_loss: pl,
              status: 'closed',
            }
          : null
      );

      setSuccess('Trade closed successfully!');
      setTimeout(() => {
        router.push('/dashboard/history');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to close trade');
    } finally {
      setIsClosing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setSuccess('Link copied to clipboard!');
    setTimeout(() => setSuccess(''), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-700 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading trade details...</p>
        </div>
      </div>
    );
  }

  if (!trade) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-slate-400 mb-4">Trade not found</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-blue-400 hover:text-blue-300 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">{trade.symbol}</h1>
          <p className="text-slate-400">{format(new Date(trade.trade_date), 'MMMM dd, yyyy')}</p>
        </div>
        <button
          onClick={() => router.push('/dashboard/history')}
          className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition"
        >
          Back to History
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-700 rounded-lg text-red-300 flex items-center gap-3">
          <X className="w-5 h-5" />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-900/20 border border-green-700 rounded-lg text-green-300 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5" />
          {success}
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Trade Info */}
        <div className="lg:col-span-2">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6">
            <h2 className="text-2xl font-bold mb-6">Trade Information</h2>

            <div className="grid grid-cols-2 gap-6">
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
                <p className="text-slate-400 text-sm mb-1">Entry Price</p>
                <p className="text-lg font-semibold">{trade.entry_price.toFixed(5)}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-1">Leverage</p>
                <p className="text-lg font-semibold">1:{trade.leverage.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-1">Risk-Reward Ratio</p>
                <p className="text-lg font-semibold">{trade.risk_reward_ratio}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-1">Checklist Completed</p>
                <p className="text-lg font-semibold">
                  {trade.checklist_completed ? (
                    <span className="text-green-400">Yes</span>
                  ) : (
                    <span className="text-yellow-400">Partial</span>
                  )}
                </p>
              </div>
            </div>

            {trade.top_down_analysis && (
              <div className="mt-6 pt-6 border-t border-slate-700">
                <p className="text-slate-400 text-sm mb-2">Top-Down Analysis</p>
                <div className="bg-slate-700/30 rounded-lg p-4 text-sm text-slate-300">
                  {typeof trade.top_down_analysis === 'string'
                    ? JSON.parse(trade.top_down_analysis).notes ||
                      JSON.stringify(JSON.parse(trade.top_down_analysis))
                    : JSON.stringify(trade.top_down_analysis)}
                </div>
              </div>
            )}

            {trade.notes && (
              <div className="mt-6 pt-6 border-t border-slate-700">
                <p className="text-slate-400 text-sm mb-2">Trade Notes</p>
                <div className="bg-slate-700/30 rounded-lg p-4 text-sm text-slate-300">
                  {trade.notes}
                </div>
              </div>
            )}
          </div>

          {/* Close Trade Section */}
          {trade.status === 'open' && (
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-6">Close Trade</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Exit Price</label>
                  <input
                    type="number"
                    step="0.00001"
                    value={exitPrice}
                    onChange={(e) => {
                      setExitPrice(e.target.value);
                      const pl = parseFloat(e.target.value) - trade.entry_price;
                      setProfitLoss(pl.toFixed(2));
                    }}
                    placeholder="0.00000"
                    className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 focus:border-blue-500 focus:outline-none transition"
                  />
                </div>

                {exitPrice && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Profit/Loss</label>
                    <div className={`px-4 py-3 rounded-lg border-2 text-center font-bold text-lg ${
                      parseFloat(exitPrice) - trade.entry_price >= 0
                        ? 'bg-green-900/20 border-green-600 text-green-400'
                        : 'bg-red-900/20 border-red-600 text-red-400'
                    }`}>
                      {parseFloat(exitPrice) - trade.entry_price >= 0 ? '+' : ''}
                      {(parseFloat(exitPrice) - trade.entry_price).toFixed(5)}
                    </div>
                  </div>
                )}

                <button
                  onClick={handleCloseTrade}
                  disabled={isClosing || !exitPrice}
                  className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-slate-600 disabled:to-slate-600 rounded-lg font-bold transition"
                >
                  {isClosing ? 'Closing Trade...' : 'Close Trade'}
                </button>
              </div>
            </div>
          )}

          {trade.status === 'closed' && (
            <div className="bg-green-900/20 border border-green-700 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle2 className="w-6 h-6 text-green-400" />
                <h2 className="text-2xl font-bold">Trade Closed</h2>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Exit Price</p>
                  <p className="text-lg font-semibold">{trade.exit_price?.toFixed(5)}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">Profit/Loss</p>
                  <p className={`text-lg font-semibold ${(trade.profit_loss ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {(trade.profit_loss ?? 0) >= 0 ? '+' : ''}
                    {trade.profit_loss?.toFixed(5)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Share & Status */}
        <div>
          {/* Status Card */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6">
            <p className="text-slate-400 text-sm mb-2">Status</p>
            <div className={`px-4 py-2 rounded-lg text-center font-bold ${
              trade.status === 'open'
                ? 'bg-blue-900/30 text-blue-300'
                : trade.status === 'closed'
                ? 'bg-green-900/30 text-green-300'
                : 'bg-red-900/30 text-red-300'
            }`}>
              {trade.status.charAt(0).toUpperCase() + trade.status.slice(1)}
            </div>
          </div>

          {/* Share Card */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="font-bold mb-4">Share Trade</h3>
            <div className="space-y-3">
              <p className="text-sm text-slate-400">
                Share this trade with others via a shareable link
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-sm text-slate-300"
                />
                <button
                  onClick={copyToClipboard}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
