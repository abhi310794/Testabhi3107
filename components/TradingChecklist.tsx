'use client';

import { useState } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  checked: boolean;
}

interface TradingChecklistProps {
  onChange?: (checklist: ChecklistItem[]) => void;
}

export function TradingChecklist({ onChange }: TradingChecklistProps) {
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    {
      id: 'trendline',
      label: 'Trendline Identified',
      description: 'Clear trendline on 2H chart is visible and valid',
      checked: false,
    },
    {
      id: 'trend_direction',
      label: 'Trend Direction Confirmed',
      description: 'Higher timeframe (4H/Daily) confirms trend direction',
      checked: false,
    },
    {
      id: 'support_resistance',
      label: 'Support/Resistance Levels Marked',
      description: 'Key levels identified and marked on chart',
      checked: false,
    },
    {
      id: 'higher_timeframe',
      label: 'Higher Timeframe Alignment',
      description: 'Trade aligns with higher timeframe trend (Daily/4H)',
      checked: false,
    },
    {
      id: 'entry_signal',
      label: 'Entry Signal Confirmed',
      description: 'Clear entry signal at trendline retest or breakout',
      checked: false,
    },
    {
      id: 'risk_management',
      label: 'Risk Management Set',
      description: 'Stop loss placed below support/above resistance',
      checked: false,
    },
    {
      id: 'risk_reward',
      label: 'Risk-Reward Ratio Acceptable',
      description: 'Risk to Reward ratio is at least 1:2 or better',
      checked: false,
    },
    {
      id: 'leverage',
      label: 'Leverage Verified',
      description: 'Leverage set to 1:30 as per plan',
      checked: false,
    },
  ]);

  const handleToggle = (id: string) => {
    const updated = checklist.map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    setChecklist(updated);
    onChange?.(updated);
  };

  const completedCount = checklist.filter((item) => item.checked).length;
  const progress = Math.round((completedCount / checklist.length) * 100);

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Pre-Trade Checklist</h2>
        <p className="text-slate-400 mb-4">Trendline Strategy - 2H Timeframe</p>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Completion</span>
            <span className="text-sm font-bold text-blue-400">{progress}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-600 to-cyan-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {checklist.map((item) => (
          <button
            key={item.id}
            onClick={() => handleToggle(item.id)}
            className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
              item.checked
                ? 'bg-blue-900/20 border-blue-600 shadow-lg shadow-blue-500/10'
                : 'bg-slate-700/30 border-slate-600 hover:border-slate-500'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-1">
                {item.checked ? (
                  <CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-500 flex-shrink-0" />
                )}
              </div>
              <div className="flex-1">
                <div className={`font-medium ${item.checked ? 'text-blue-300' : 'text-white'}`}>
                  {item.label}
                </div>
                <div className="text-sm text-slate-400 mt-1">{item.description}</div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {completedCount === checklist.length && (
        <div className="mt-6 p-4 bg-green-900/20 border border-green-700 rounded-lg text-green-300 text-center font-medium">
          ✓ All checks complete! You're ready to trade.
        </div>
      )}
    </div>
  );
}
