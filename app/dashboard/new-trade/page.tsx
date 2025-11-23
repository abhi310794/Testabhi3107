'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { TradingChecklist } from '@/components/TradingChecklist';
import { TopDownAnalysis } from '@/components/TopDownAnalysis';
import { TradeForm } from '@/components/TradeForm';
import { DashboardSidebar } from '@/components/DashboardSidebar';
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

    // Validation
    if (!formData.symbol) {
      setError('Please select a trading symbol');
      setIsSubmitting(false);
      return;
    }

    if (!formData.entry_price) {
      setError('Please enter an entry price');
      setIsSubmitting(false);
      return;
    }

    if (checklist.length === 0) {
      setError('Please complete the trading checklist first');
      setIsSubmitting(false);
      return;
    }

    const checklistCompleted = checklist.every((item) => item.checked);
    if (!checklistCompleted) {
      setError('⚠️ Warning: Not all checklist items are checked');
      setIsSubmitting(false);
      return;
    }

    try {
      if (!user) throw new Error('Not authenticated. Please log in first.');

      console.log('📝 Submitting trade form with data:', {
        symbol: formData.symbol,
        asset_class: formData.asset_class,
        entry_price: formData.entry_price,
        user_id: user.id,
      });

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

      if (tradeError) {
        console.error('❌ Trade insert error:', tradeError);
        throw tradeError;
      }

      console.log('✅ Trade created successfully:', tradeData);

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

        if (checklistError) {
          console.error('❌ Checklist insert error:', checklistError);
          throw checklistError;
        }

        console.log('✅ Checklist saved successfully');
      }

      setSuccess('Trade saved successfully! Redirecting...');
      setTimeout(() => {
        router.push(`/dashboard/trade/${tradeData?.id}`);
      }, 1000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save trade';
      console.error('❌ Trade submission error:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

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
            Create New Trade
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Follow the checklist and complete your pre-trade analysis
          </p>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Alerts */}
          {error && (
            <div className="mb-6 p-4 rounded-lg flex items-start gap-3" style={{ background: 'rgba(248, 81, 73, 0.15)', border: '1px solid var(--accent-red)' }}>
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div style={{ color: 'var(--accent-red)' }}>{error}</div>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-lg flex items-start gap-3" style={{ background: 'rgba(63, 185, 80, 0.15)', border: '1px solid var(--accent-green)' }}>
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div style={{ color: 'var(--accent-green)' }}>{success}</div>
            </div>
          )}

          {/* Layout - Checklist, Analysis, Form */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
        </div>
      </div>
    </div>
  );
}
