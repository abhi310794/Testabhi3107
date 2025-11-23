# Supabase Setup Guide for Trading Journal

## Step 1: Create a Supabase Account
1. Go to [supabase.com](https://supabase.com)
2. Sign up with your email
3. Create a new project
4. Copy your Project URL and Anon Key
5. Paste them into `.env.local`

## Step 2: Create Database Schema

Run these SQL commands in your Supabase SQL Editor:

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  trading_style TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create trades table
CREATE TABLE IF NOT EXISTS trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  trade_date DATE NOT NULL,
  symbol TEXT NOT NULL,
  asset_class TEXT NOT NULL CHECK (asset_class IN ('forex', 'commodity', 'index')),
  timeframe TEXT DEFAULT '2h',
  entry_price DECIMAL(20, 5) NOT NULL,
  exit_price DECIMAL(20, 5),
  leverage DECIMAL(3, 2) DEFAULT 1.30,
  risk_reward_ratio DECIMAL(3, 2) NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'cancelled')),
  profit_loss DECIMAL(20, 5),
  checklist_completed BOOLEAN DEFAULT FALSE,
  top_down_analysis TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create trading_checklist table
CREATE TABLE IF NOT EXISTS trading_checklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_id UUID NOT NULL REFERENCES trades(id) ON DELETE CASCADE,
  trendline_identified BOOLEAN DEFAULT FALSE,
  trend_direction TEXT CHECK (trend_direction IN ('uptrend', 'downtrend', 'sideways')),
  support_resistance_checked BOOLEAN DEFAULT FALSE,
  higher_timeframe_aligned BOOLEAN DEFAULT FALSE,
  entry_signal_confirmed BOOLEAN DEFAULT FALSE,
  risk_management_set BOOLEAN DEFAULT FALSE,
  tp_sl_ratio_acceptable BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_trades_user_id ON trades(user_id);
CREATE INDEX idx_trades_date ON trades(trade_date);
CREATE INDEX idx_trades_status ON trades(status);
CREATE INDEX idx_checklist_trade_id ON trading_checklist(trade_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE trading_checklist ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Users can only access their own data" ON users
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can only access their own trades" ON trades
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access checklists for their trades" ON trading_checklist
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM trades WHERE trades.id = trading_checklist.trade_id
      AND trades.user_id = auth.uid()
    )
  );

-- Enable Auth
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

## Step 3: Enable Authentication
1. Go to Authentication > Providers
2. Enable Email/Password
3. Configure redirect URLs in Authentication > URL Configuration

## Step 4: Update Environment Variables
Add to `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Step 5: Test Connection
Run `npm run dev` and check the console for connection success.
