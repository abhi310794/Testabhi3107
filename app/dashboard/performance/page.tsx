'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase, Trade } from '@/lib/supabase';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Target, Award } from 'lucide-react';

interface ChartData {
  date: string;
  profit: number;
  cumulative: number;
}

export default function PerformancePage() {
  const { user } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [stats, setStats] = useState({
    totalTrades: 0,
    winningTrades: 0,
    losingTrades: 0,
    winRate: 0,
    avgWin: 0,
    avgLoss: 0,
    profitFactor: 0,
    totalProfit: 0,
    largestWin: 0,
    largestLoss: 0,
  });

  useEffect(() => {
    if (!user) return;

    const fetchTrades = async () => {
      try {
        const { data, error } = await supabase
          .from('trades')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'closed')
          .order('trade_date', { ascending: true });

        if (error) throw error;

        setTrades(data || []);

        // Calculate statistics
        const closed = data || [];
        const winning = closed.filter((t) => (t.profit_loss ?? 0) > 0);
        const losing = closed.filter((t) => (t.profit_loss ?? 0) < 0);
        const winProfit = winning.reduce((sum, t) => sum + (t.profit_loss ?? 0), 0);
        const lossProfit = losing.reduce((sum, t) => sum + (t.profit_loss ?? 0), 0);

        const newStats = {
          totalTrades: closed.length,
          winningTrades: winning.length,
          losingTrades: losing.length,
          winRate: closed.length > 0 ? (winning.length / closed.length) * 100 : 0,
          avgWin: winning.length > 0 ? winProfit / winning.length : 0,
          avgLoss: losing.length > 0 ? lossProfit / losing.length : 0,
          profitFactor: lossProfit !== 0 ? Math.abs(winProfit / lossProfit) : 0,
          totalProfit: winProfit + lossProfit,
          largestWin: winning.length > 0 ? Math.max(...winning.map((t) => t.profit_loss ?? 0)) : 0,
          largestLoss:
            losing.length > 0 ? Math.min(...losing.map((t) => t.profit_loss ?? 0)) : 0,
        };

        setStats(newStats);

        // Prepare chart data
        let cumulative = 0;
        const chartPoints: ChartData[] = closed.map((trade) => {
          const profit = trade.profit_loss ?? 0;
          cumulative += profit;
          return {
            date: new Date(trade.trade_date).toLocaleDateString(),
            profit: profit,
            cumulative: cumulative,
          };
        });

        setChartData(chartPoints);
      } catch (err) {
        console.error('Error fetching trades:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrades();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-700 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Calculating performance...</p>
        </div>
      </div>
    );
  }

  const assetCounts = trades.reduce(
    (acc, t) => {
      acc[t.asset_class] = (acc[t.asset_class] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const assetChartData = Object.entries(assetCounts).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  const COLORS = ['#3b82f6', '#f59e0b', '#ef4444'];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Performance Analytics</h1>
        <p className="text-slate-400">Track your trading performance and metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400 text-sm">Win Rate</p>
            <Award className="w-5 h-5 text-yellow-500 opacity-30" />
          </div>
          <p className="text-3xl font-bold">{stats.winRate.toFixed(1)}%</p>
          <p className="text-xs text-slate-400 mt-2">
            {stats.winningTrades}W / {stats.losingTrades}L
          </p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400 text-sm">Total Profit</p>
            <TrendingUp className="w-5 h-5 text-green-500 opacity-30" />
          </div>
          <p className={`text-3xl font-bold ${stats.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {stats.totalProfit >= 0 ? '+' : ''}{stats.totalProfit.toFixed(2)}
          </p>
          <p className="text-xs text-slate-400 mt-2">{stats.totalTrades} trades</p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400 text-sm">Avg Win / Loss</p>
            <Target className="w-5 h-5 text-cyan-500 opacity-30" />
          </div>
          <p className="text-3xl font-bold">{stats.avgWin.toFixed(2)} / {Math.abs(stats.avgLoss).toFixed(2)}</p>
          <p className="text-xs text-slate-400 mt-2">Per trade average</p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400 text-sm">Profit Factor</p>
            <TrendingDown className="w-5 h-5 text-orange-500 opacity-30" />
          </div>
          <p className="text-3xl font-bold">{stats.profitFactor.toFixed(2)}</p>
          <p className="text-xs text-slate-400 mt-2">Wins vs Losses ratio</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Cumulative P&L */}
        <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">Cumulative P&L</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #475569',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="cumulative"
                  stroke="#3b82f6"
                  dot={{ fill: '#3b82f6', r: 4 }}
                  name="Cumulative P&L"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-slate-400">
              No data available
            </div>
          )}
        </div>

        {/* Asset Distribution */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">Trades by Asset</h2>
          {assetChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={assetChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {assetChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-slate-400">
              No data available
            </div>
          )}
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4">Detailed Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-slate-300 mb-3">Trade Results</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Trades:</span>
                <span className="font-medium">{stats.totalTrades}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Winning Trades:</span>
                <span className="font-medium text-green-400">{stats.winningTrades}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Losing Trades:</span>
                <span className="font-medium text-red-400">{stats.losingTrades}</span>
              </div>
              <div className="flex justify-between border-t border-slate-700 pt-2 mt-2">
                <span className="text-slate-400">Win Rate:</span>
                <span className="font-medium">{stats.winRate.toFixed(2)}%</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-slate-300 mb-3">Trade Extremes</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Largest Win:</span>
                <span className="font-medium text-green-400">+{stats.largestWin.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Largest Loss:</span>
                <span className="font-medium text-red-400">{stats.largestLoss.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Avg Win:</span>
                <span className="font-medium text-green-400">+{stats.avgWin.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-700 pt-2 mt-2">
                <span className="text-slate-400">Avg Loss:</span>
                <span className="font-medium text-red-400">{stats.avgLoss.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
