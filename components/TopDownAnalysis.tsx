'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface AnalysisData {
  daily_trend: 'uptrend' | 'downtrend' | 'sideways';
  four_hour_trend: 'uptrend' | 'downtrend' | 'sideways';
  two_hour_trend: 'uptrend' | 'downtrend' | 'sideways';
  key_levels: string;
  bias: 'bullish' | 'bearish' | 'neutral';
  notes: string;
}

interface TopDownAnalysisProps {
  onChange?: (data: AnalysisData) => void;
}

export function TopDownAnalysis({ onChange }: TopDownAnalysisProps) {
  const [analysis, setAnalysis] = useState<AnalysisData>({
    daily_trend: 'sideways',
    four_hour_trend: 'sideways',
    two_hour_trend: 'sideways',
    key_levels: '',
    bias: 'neutral',
    notes: '',
  });

  const handleChange = (key: keyof AnalysisData, value: string) => {
    const updated = { ...analysis, [key]: value };
    setAnalysis(updated);
    onChange?.(updated);
  };

  const TrendIcon = ({ trend }: { trend: string }) => {
    switch (trend) {
      case 'uptrend':
        return <TrendingUp className="w-5 h-5 text-green-400" />;
      case 'downtrend':
        return <TrendingDown className="w-5 h-5 text-red-400" />;
      default:
        return <Minus className="w-5 h-5 text-yellow-400" />;
    }
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
      <h2 className="text-2xl font-bold mb-6">Top-Down Analysis</h2>

      <div className="space-y-6">
        {/* Daily Trend */}
        <div>
          <label className="block text-sm font-medium mb-3">Daily Trend</label>
          <div className="flex gap-3">
            {(['uptrend', 'downtrend', 'sideways'] as const).map((trend) => (
              <button
                key={trend}
                onClick={() => handleChange('daily_trend', trend)}
                className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all flex items-center justify-center gap-2 ${
                  analysis.daily_trend === trend
                    ? 'bg-blue-900/40 border-blue-600'
                    : 'bg-slate-700/30 border-slate-600 hover:border-slate-500'
                }`}
              >
                <TrendIcon trend={trend} />
                {trend.charAt(0).toUpperCase() + trend.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* 4-Hour Trend */}
        <div>
          <label className="block text-sm font-medium mb-3">4-Hour Trend</label>
          <div className="flex gap-3">
            {(['uptrend', 'downtrend', 'sideways'] as const).map((trend) => (
              <button
                key={trend}
                onClick={() => handleChange('four_hour_trend', trend)}
                className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all flex items-center justify-center gap-2 ${
                  analysis.four_hour_trend === trend
                    ? 'bg-blue-900/40 border-blue-600'
                    : 'bg-slate-700/30 border-slate-600 hover:border-slate-500'
                }`}
              >
                <TrendIcon trend={trend} />
                {trend.charAt(0).toUpperCase() + trend.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* 2-Hour Trend */}
        <div>
          <label className="block text-sm font-medium mb-3">2-Hour Trend</label>
          <div className="flex gap-3">
            {(['uptrend', 'downtrend', 'sideways'] as const).map((trend) => (
              <button
                key={trend}
                onClick={() => handleChange('two_hour_trend', trend)}
                className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all flex items-center justify-center gap-2 ${
                  analysis.two_hour_trend === trend
                    ? 'bg-blue-900/40 border-blue-600'
                    : 'bg-slate-700/30 border-slate-600 hover:border-slate-500'
                }`}
              >
                <TrendIcon trend={trend} />
                {trend.charAt(0).toUpperCase() + trend.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Bias */}
        <div>
          <label className="block text-sm font-medium mb-3">Trading Bias</label>
          <div className="flex gap-3">
            {(['bullish', 'bearish', 'neutral'] as const).map((bias) => (
              <button
                key={bias}
                onClick={() => handleChange('bias', bias)}
                className={`flex-1 py-2 px-4 rounded-lg border-2 font-medium transition-all ${
                  analysis.bias === bias
                    ? 'bg-blue-900/40 border-blue-600'
                    : 'bg-slate-700/30 border-slate-600 hover:border-slate-500'
                }`}
              >
                {bias.charAt(0).toUpperCase() + bias.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Key Levels */}
        <div>
          <label className="block text-sm font-medium mb-2">Key Levels</label>
          <input
            type="text"
            value={analysis.key_levels}
            onChange={(e) => handleChange('key_levels', e.target.value)}
            placeholder="e.g., Support: 1.0500, Resistance: 1.0650"
            className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 focus:border-blue-500 focus:outline-none transition"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium mb-2">Analysis Notes</label>
          <textarea
            value={analysis.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Document your top-down analysis findings..."
            rows={4}
            className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 focus:border-blue-500 focus:outline-none transition resize-none"
          />
        </div>
      </div>
    </div>
  );
}
