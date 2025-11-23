'use client';

interface StatsBoxesProps {
  totalTrades: number;
  winRate: number;
  totalPnL: number;
  compliance: number;
}

export function StatsBoxes({ totalTrades, winRate, totalPnL, compliance }: StatsBoxesProps) {
  const stats = [
    {
      label: 'Total Trades',
      value: totalTrades.toString(),
      id: 'totalTrades',
    },
    {
      label: 'Win Rate',
      value: `${winRate.toFixed(0)}%`,
      id: 'winRate',
    },
    {
      label: 'Total P&L',
      value: totalPnL.toFixed(2),
      id: 'totalPnL',
      isPositive: totalPnL >= 0,
    },
    {
      label: 'Rules Compliance',
      value: `${compliance.toFixed(0)}%`,
      id: 'compliance',
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-4 mb-8">
      {stats.map((stat) => (
        <div
          key={stat.id}
          className="p-5 rounded-xl transition-all hover:border-blue-500"
          style={{
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(10px)',
            border: '1px solid var(--glass-border)',
          }}
        >
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
            {stat.label}
          </div>
          <div
            style={{
              fontFamily: "'Outfit', monospace",
              fontSize: '24px',
              fontWeight: '700',
              color: stat.isPositive === false ? 'var(--accent-red)' : stat.isPositive === true ? 'var(--accent-green)' : 'var(--text-primary)',
            }}
          >
            {stat.label === 'Total P&L' && totalPnL >= 0 ? '+' : ''}
            {stat.value}
          </div>
        </div>
      ))}
    </div>
  );
}
