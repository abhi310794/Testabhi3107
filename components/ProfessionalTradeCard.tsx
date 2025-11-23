'use client';

import { Trade } from '@/lib/supabase';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

interface ProfessionalTradeCardProps {
  trade: Trade;
}

export function ProfessionalTradeCard({ trade }: ProfessionalTradeCardProps) {
  const router = useRouter();
  const pnl = trade.profit_loss ?? 0;
  const isWinning = pnl > 0;
  const isOpen = trade.status === 'open';

  const riskPercentage = isOpen ? 0 : Math.min(100, Math.max(0, (((Math.abs(pnl) / Math.abs(pnl + 10)) * 100))));

  const cardClass = isOpen ? 'border-blue-500' : isWinning ? 'border-green-500' : 'border-red-500';
  const bgClass = isOpen ? 'hover:bg-blue-500/5' : isWinning ? 'hover:bg-green-500/5' : 'hover:bg-red-500/5';

  return (
    <div
      onClick={() => router.push(`/dashboard/trade/${trade.id}`)}
      className={`p-4 rounded-xl transition-all cursor-pointer ${cardClass} ${bgClass}`}
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(10px)',
        border: `1px solid var(--glass-border)`,
        borderLeft: `4px solid ${isOpen ? 'var(--accent-blue)' : isWinning ? 'var(--accent-green)' : 'var(--accent-red)'}`,
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <div style={{ fontFamily: "'Outfit'", fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>
            {trade.symbol}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', background: 'var(--bg-secondary)', padding: '4px 10px', borderRadius: '6px', marginTop: '4px', display: 'inline-block' }}>
            {trade.asset_class.toUpperCase()}
          </div>
        </div>
        <span
          style={{
            display: 'inline-flex',
            padding: '4px 12px',
            borderRadius: '16px',
            fontSize: '10px',
            fontWeight: '700',
            textTransform: 'uppercase',
            background: isOpen ? 'rgba(88, 166, 255, 0.2)' : isWinning ? 'rgba(63, 185, 80, 0.2)' : 'rgba(248, 81, 73, 0.2)',
            color: isOpen ? 'var(--accent-blue)' : isWinning ? 'var(--accent-green)' : 'var(--accent-red)',
          }}
        >
          {isOpen ? 'OPEN' : isWinning ? '✓ WIN' : '✗ LOSS'}
        </span>
      </div>

      {/* Meta Info */}
      <div className="grid grid-cols-3 gap-3 mb-3" style={{ fontSize: '12px' }}>
        <div>
          <div style={{ color: 'var(--text-tertiary)', fontSize: '10px', fontWeight: '600', marginBottom: '2px' }}>
            Entry
          </div>
          <div style={{ color: 'var(--text-primary)', fontFamily: "'Outfit', monospace", fontWeight: '700' }}>
            {trade.entry_price.toFixed(5)}
          </div>
        </div>
        <div>
          <div style={{ color: 'var(--text-tertiary)', fontSize: '10px', fontWeight: '600', marginBottom: '2px' }}>
            Exit
          </div>
          <div style={{ color: 'var(--text-primary)', fontFamily: "'Outfit', monospace", fontWeight: '700' }}>
            {trade.exit_price ? trade.exit_price.toFixed(5) : '—'}
          </div>
        </div>
        <div>
          <div style={{ color: 'var(--text-tertiary)', fontSize: '10px', fontWeight: '600', marginBottom: '2px' }}>
            R:R
          </div>
          <div style={{ color: 'var(--text-primary)', fontFamily: "'Outfit', monospace", fontWeight: '700' }}>
            {trade.risk_reward_ratio}
          </div>
        </div>
      </div>

      {/* Date & P&L */}
      <div className="flex justify-between items-center pt-3 border-t" style={{ borderColor: 'var(--glass-border)' }}>
        <div style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>
          {format(new Date(trade.trade_date), 'MMM dd, yyyy')}
        </div>
        {!isOpen && (
          <div
            style={{
              fontFamily: "'Outfit', monospace",
              fontSize: '12px',
              fontWeight: '700',
              color: isWinning ? 'var(--accent-green)' : 'var(--accent-red)',
            }}
          >
            {isWinning ? '+' : ''}{pnl.toFixed(5)}
          </div>
        )}
      </div>
    </div>
  );
}
