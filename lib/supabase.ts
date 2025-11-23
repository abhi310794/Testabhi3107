import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database
export interface Trade {
  id: string;
  user_id: string;
  trade_date: string;
  symbol: string;
  asset_class: 'forex' | 'commodity' | 'index';
  timeframe: '2h';
  entry_price: number;
  exit_price?: number;
  leverage: number;
  risk_reward_ratio: number;
  status: 'open' | 'closed' | 'cancelled';
  profit_loss?: number;
  checklist_completed: boolean;
  top_down_analysis: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface TradingChecklist {
  id: string;
  trade_id: string;
  trendline_identified: boolean;
  trend_direction: 'uptrend' | 'downtrend' | 'sideways';
  support_resistance_checked: boolean;
  higher_timeframe_aligned: boolean;
  entry_signal_confirmed: boolean;
  risk_management_set: boolean;
  tp_sl_ratio_acceptable: boolean;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  trading_style: string;
  created_at: string;
}
