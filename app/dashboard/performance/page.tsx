'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase, Trade } from '@/lib/supabase';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Target, Award } from 'lucide-react';
import { DashboardSidebar } from '@/components/DashboardSidebar';

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
      <div className="flex h-screen">
        <DashboardSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
            <p style={{ color: 'var(--text-secondary)' }}>Calculating performance...</p>
          </div>
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

  const COLORS = ['#58a6ff', '#3fb950', '#f85149'];

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
            Performance Analytics
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Track your trading performance and metrics
          </p>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div
              className="p-6 rounded-xl"
              style={{
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(10px)',
                border: '1px solid var(--glass-border)',
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>Win Rate</p>
                <Award className="w-5 h-5" style={{ color: 'var(--accent-yellow)', opacity: 0.3 }} />
              </div>
              <p style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)' }}>
                {stats.winRate.toFixed(1)}%
              </p>
              <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '8px' }}>
                {stats.winningTrades}W / {stats.losingTrades}L
              </p>
            </div>

            <div
              className="p-6 rounded-xl"
              style={{
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(10px)',
                border: '1px solid var(--glass-border)',
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>Total Profit</p>
                <TrendingUp className="w-5 h-5" style={{ color: 'var(--accent-green)', opacity: 0.3 }} />
              </div>
              <p
                style={{
                  fontSize: '28px',
                  fontWeight: '700',
                  color: stats.totalProfit >= 0 ? 'var(--accent-green)' : 'var(--accent-red)',
                }}
              >
                {stats.totalProfit >= 0 ? '+' : ''}{stats.totalProfit.toFixed(2)}
              </p>
              <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '8px' }}>
                {stats.totalTrades} trades
              </p>
            </div>

            <div
              className="p-6 rounded-xl"
              style={{
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(10px)',
                border: '1px solid var(--glass-border)',
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>Avg Win / Loss</p>
                <Target className="w-5 h-5" style={{ color: 'var(--accent-blue)', opacity: 0.3 }} />
              </div>
              <p style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)' }}>
                {stats.avgWin.toFixed(2)} / {Math.abs(stats.avgLoss).toFixed(2)}
              </p>
              <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '8px' }}>
                Per trade average
              </p>
            </div>

            <div
              className="p-6 rounded-xl"
              style={{
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(10px)',
                border: '1px solid var(--glass-border)',
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>Profit Factor</p>
                <TrendingDown className="w-5 h-5" style={{ color: 'var(--accent-yellow)', opacity: 0.3 }} />
              </div>
              <p style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)' }}>
                {stats.profitFactor.toFixed(2)}
              </p>
              <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '8px' }}>
                Wins vs Losses ratio
              </p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Cumulative P&L */}
            <div
              className="lg:col-span-2 p-6 rounded-xl"
              style={{
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(10px)',
                border: '1px solid var(--glass-border)',
              }}
            >
              <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: 'var(--text-primary)' }}>
                Cumulative P&L
              </h2>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis dataKey="date" stroke="var(--text-tertiary)" />
                    <YAxis stroke="var(--text-tertiary)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="cumulative"
                      stroke="var(--accent-blue)"
                      dot={{ fill: 'var(--accent-blue)', r: 4 }}
                      name="Cumulative P&L"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center" style={{ color: 'var(--text-secondary)' }}>
                  No data available
                </div>
              )}
            </div>

            {/* Asset Distribution */}
            <div
              className="p-6 rounded-xl"
              style={{
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(10px)',
                border: '1px solid var(--glass-border)',
              }}
            >
              <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: 'var(--text-primary)' }}>
                Trades by Asset
              </h2>
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
                <div className="h-[300px] flex items-center justify-center" style={{ color: 'var(--text-secondary)' }}>
                  No data available
                </div>
              )}
            </div>
          </div>

          {/* Detailed Stats */}
          <div
            className="p-6 rounded-xl"
            style={{
              background: 'var(--glass-bg)',
              backdropFilter: 'blur(10px)',
              border: '1px solid var(--glass-border)',
            }}
          >
            <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: 'var(--text-primary)' }}>
              Detailed Statistics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                  Trade Results
                </h3>
                <div style={{ fontSize: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Total Trades:</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{stats.totalTrades}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Winning Trades:</span>
                    <span style={{ color: 'var(--accent-green)', fontWeight: '600' }}>{stats.winningTrades}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Losing Trades:</span>
                    <span style={{ color: 'var(--accent-red)', fontWeight: '600' }}>{stats.losingTrades}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Win Rate:</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{stats.winRate.toFixed(2)}%</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                  Trade Extremes
                </h3>
                <div style={{ fontSize: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Largest Win:</span>
                    <span style={{ color: 'var(--accent-green)', fontWeight: '600' }}>+{stats.largestWin.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Largest Loss:</span>
                    <span style={{ color: 'var(--accent-red)', fontWeight: '600' }}>{stats.largestLoss.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Avg Win:</span>
                    <span style={{ color: 'var(--accent-green)', fontWeight: '600' }}>+{stats.avgWin.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Avg Loss:</span>
                    <span style={{ color: 'var(--accent-red)', fontWeight: '600' }}>{stats.avgLoss.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
