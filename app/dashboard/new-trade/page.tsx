'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { TradingChecklist } from '@/components/TradingChecklist';
import { TopDownAnalysis } from '@/components/TopDownAnalysis';
import { TradeForm } from '@/components/TradeForm';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface ChecklistItem {
  id: string;
  checked: boolean;
}

export default function NewTradePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [analysis, setAnalysis] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChecklistChange = (items: any[]) => {
    setChecklist(items);
  };

  const handleAnalysisChange = (data: any) => {
    setAnalysis(data);
  };

  const handleTradeSubmit = async (formData: any) => {
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    if (checklist.length === 0) {
      setError('Please complete the trading checklist first');
      setIsSubmitting(false);
      return;
    }

    const checklistCompleted = checklist.every((item) => item.checked);
    if (!checklistCompleted) {
      setError('Warning: Not all checklist items are checked. Continue anyway?');
      // Allow submission but warn the user
    }

    try {
      if (!user) throw new Error('Not authenticated');

      // Insert trade
      const { data: tradeData, error: tradeError } = await supabase
        .from('trades')
        .insert({
          user_id: user.id,
          symbol: formData.symbol,
          asset_class: formData.asset_class,
          timeframe: '2h',
          trade_date: formData.trade_date,
          entry_price: parseFloat(formData.entry_price),
          exit_price: formData.exit_price ? parseFloat(formData.exit_price) : null,
          leverage: parseFloat(formData.leverage),
          risk_reward_ratio: formData.risk_reward_ratio,
          checklist_completed: checklistCompleted,
          top_down_analysis: JSON.stringify(analysis),
          notes: formData.notes,
          status: 'open',
        })
        .select()
        .single();

      if (tradeError) throw tradeError;

      // Insert checklist
      if (tradeData) {
        const { error: checklistError } = await supabase.from('trading_checklist').insert({
          trade_id: tradeData.id,
          trendline_identified: checklist.find((c) => c.id === 'trendline')?.checked ?? false,
          trend_direction: (analysis as any)?.two_hour_trend || 'sideways',
          support_resistance_checked:
            checklist.find((c) => c.id === 'support_resistance')?.checked ?? false,
          higher_timeframe_aligned:
            checklist.find((c) => c.id === 'higher_timeframe')?.checked ?? false,
          entry_signal_confirmed:
            checklist.find((c) => c.id === 'entry_signal')?.checked ?? false,
          risk_management_set:
            checklist.find((c) => c.id === 'risk_management')?.checked ?? false,
          tp_sl_ratio_acceptable:
            checklist.find((c) => c.id === 'risk_reward')?.checked ?? false,
        });

        if (checklistError) throw checklistError;
      }

      setSuccess('Trade saved successfully!');
      setTimeout(() => {
        router.push(`/dashboard/trade/${tradeData?.id}`);
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save trade');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Create New Trade</h1>
        <p className="text-slate-400">Follow the checklist and complete your pre-trade analysis</p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-700 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="text-red-300">{error}</div>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-900/20 border border-green-700 rounded-lg flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
          <div className="text-green-300">{success}</div>
        </div>
      )}

      {/* Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left Column - Checklist */}
        <div className="lg:col-span-1">
          <TradingChecklist onChange={handleChecklistChange} />
        </div>

        {/* Right Column - Analysis & Form */}
        <div className="lg:col-span-2 space-y-6">
          <TopDownAnalysis onChange={handleAnalysisChange} />
          <TradeForm onChange={() => {}} onSubmit={handleTradeSubmit} isSubmitting={isSubmitting} />
        </div>
      </div>

      {/* Mobile: Stacked Layout */}
      <style jsx>{`
        @media (max-width: 1024px) {
          /* Checklist, then Analysis, then Form */
        }
      `}</style>
    </div>
  );
}
