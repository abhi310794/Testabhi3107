'use client';

import { useState } from 'react';

interface TradeFormData {
  symbol: string;
  asset_class: 'forex' | 'commodity' | 'index';
  entry_price: string;
  exit_price: string;
  risk_reward_ratio: string;
  leverage: string;
  trade_date: string;
  notes: string;
}

interface TradeFormProps {
  onChange?: (data: TradeFormData) => void;
  onSubmit?: (data: TradeFormData) => Promise<void>;
  isSubmitting?: boolean;
}

const FOREX_SYMBOLS = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'NZDUSD', 'USDCAD', 'USDCHF'];
const COMMODITY_SYMBOLS = ['GOLD', 'SILVER', 'OIL', 'NATGAS', 'COPPER', 'WHEAT'];
const INDEX_SYMBOLS = ['SP500', 'NASDAQ', 'DAX', 'FTSE', 'NIKKEI', 'ASX200'];

export function TradeForm({ onChange, onSubmit, isSubmitting }: TradeFormProps) {
  const [formData, setFormData] = useState<TradeFormData>({
    symbol: '',
    asset_class: 'forex',
    entry_price: '',
    exit_price: '',
    risk_reward_ratio: '1:2',
    leverage: '1.30',
    trade_date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const handleChange = (key: keyof TradeFormData, value: string) => {
    const updated = { ...formData, [key]: value };
    setFormData(updated);
    onChange?.(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit?.(formData);
  };

  const getSymbols = () => {
    switch (formData.asset_class) {
      case 'commodity':
        return COMMODITY_SYMBOLS;
      case 'index':
        return INDEX_SYMBOLS;
      default:
        return FOREX_SYMBOLS;
    }
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
      <h2 className="text-2xl font-bold mb-6">Trade Details</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Trade Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Trade Date</label>
            <input
              type="date"
              value={formData.trade_date}
              onChange={(e) => handleChange('trade_date', e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 focus:border-blue-500 focus:outline-none transition"
              required
            />
          </div>

          {/* Asset Class */}
          <div>
            <label className="block text-sm font-medium mb-2">Asset Class</label>
            <select
              value={formData.asset_class}
              onChange={(e) => {
                handleChange('asset_class', e.target.value as any);
                handleChange('symbol', '');
              }}
              className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 focus:border-blue-500 focus:outline-none transition"
            >
              <option value="forex">Forex</option>
              <option value="commodity">Commodity</option>
              <option value="index">Index</option>
            </select>
          </div>
        </div>

        {/* Symbol */}
        <div>
          <label className="block text-sm font-medium mb-2">Symbol</label>
          <select
            value={formData.symbol}
            onChange={(e) => handleChange('symbol', e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 focus:border-blue-500 focus:outline-none transition"
            required
          >
            <option value="">Select {formData.asset_class}...</option>
            {getSymbols().map((symbol) => (
              <option key={symbol} value={symbol}>
                {symbol}
              </option>
            ))}
          </select>
        </div>

        {/* Prices */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Entry Price</label>
            <input
              type="number"
              step="0.00001"
              value={formData.entry_price}
              onChange={(e) => handleChange('entry_price', e.target.value)}
              placeholder="0.00000"
              className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 focus:border-blue-500 focus:outline-none transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Exit Price (Optional)</label>
            <input
              type="number"
              step="0.00001"
              value={formData.exit_price}
              onChange={(e) => handleChange('exit_price', e.target.value)}
              placeholder="0.00000"
              className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 focus:border-blue-500 focus:outline-none transition"
            />
          </div>
        </div>

        {/* Risk & Leverage */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Risk-Reward Ratio</label>
            <input
              type="text"
              value={formData.risk_reward_ratio}
              onChange={(e) => handleChange('risk_reward_ratio', e.target.value)}
              placeholder="1:2"
              className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 focus:border-blue-500 focus:outline-none transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Leverage</label>
            <input
              type="number"
              step="0.01"
              value={formData.leverage}
              onChange={(e) => handleChange('leverage', e.target.value)}
              placeholder="1.30"
              className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 focus:border-blue-500 focus:outline-none transition"
              required
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium mb-2">Trade Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Document your trade setup, reasoning, and entry conditions..."
            rows={3}
            className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 focus:border-blue-500 focus:outline-none transition resize-none"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !formData.symbol || !formData.entry_price}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-slate-600 disabled:to-slate-600 rounded-lg font-bold transition disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving Trade...' : 'Save Trade'}
        </button>
      </form>
    </div>
  );
}
