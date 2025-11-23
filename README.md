# Trading Journal - Trendline Strategy Tracker

A beautiful, professional trading journal application for beginners following the **trendline strategy** on 2H timeframes. Built with **Next.js**, **TypeScript**, **Tailwind CSS**, and **Supabase** for cloud persistence.

## 🎯 Features

### Core Features
- **Pre-Trade Checklist**: 8-point checklist for trendline strategy validation
- **Top-Down Analysis**: Analyze trends across multiple timeframes (Daily, 4H, 2H)
- **Trade Logging**: Record entry, exit, risk-reward ratios, and leverage
- **Performance Dashboard**: Track win rate, profit/loss, and trading statistics
- **Trade History**: Browse all trades with filtering by asset class and status
- **Real-Time Sync**: Cloud-based persistence with Supabase

### Supported Assets
- **Forex**: EURUSD, GBPUSD, USDJPY, AUDUSD, NZDUSD, USDCAD, USDCHF
- **Commodities**: GOLD, SILVER, OIL, NATGAS, COPPER, WHEAT
- **Indices**: SP500, NASDAQ, DAX, FTSE, NIKKEI, ASX200

### Trading Parameters
- **Timeframe**: 2-hour (2H) candles
- **Leverage**: Fixed at 1:30
- **Strategy**: Trendline retest and breakout

### Sharing & Collaboration
- **Shareable Links**: Generate public links to share individual trades
- **Read-Only View**: Others can view your trades without authentication
- **Privacy**: Control who sees your trading journal

### Analytics
- Win/Loss ratio tracking
- Profit/Loss analysis by asset class
- Cumulative P&L charts
- Trade performance metrics
- Average win/loss calculations
- Profit factor analysis

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account (free tier available)
- Vercel account (optional, for deployment)

### 1. Clone & Install
```bash
npm install
```

### 2. Set Up Supabase

#### Create a Supabase Project
1. Visit [supabase.com](https://supabase.com)
2. Sign up and create a new project
3. Go to **Settings > API** and copy:
   - **Project URL** (NEXT_PUBLIC_SUPABASE_URL)
   - **Anon Key** (NEXT_PUBLIC_SUPABASE_ANON_KEY)

#### Create Database Schema
1. Go to **SQL Editor** in Supabase Dashboard
2. Run the SQL commands from `SUPABASE_SETUP.md`
3. Enable Email/Password authentication in **Authentication > Providers**

### 3. Configure Environment Variables
Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Run the Application
```bash
npm run dev
```

Visit `http://localhost:3000`

## 📁 Project Structure

```
├── app/
│   ├── layout.tsx
│   ├── page.tsx              # Auth page
│   ├── dashboard/            # Dashboard pages
│   └── share/[id]/           # Public trade sharing
├── components/               # Reusable components
├── lib/                      # Utilities & Supabase setup
└── SUPABASE_SETUP.md        # Database setup guide
```

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
vercel deploy
```

Set environment variables in Vercel Project Settings.

### Environment Variables Needed
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 📊 Key Features

- 8-point pre-trade checklist
- Top-down analysis across timeframes
- Beautiful performance analytics
- Shareable trade links
- Mobile-responsive design
- Dark mode UI
- Real-time cloud sync

## 🔐 Security

- Row-level security (RLS) on all database tables
- User-specific data isolation
- No sensitive data in frontend

## 💡 Trading Approach

Optimized for:
- **Trendline strategy** on 2H timeframes
- **Daily/4H confirmation** for entries
- **1:30 leverage** for risk management
- **1:2+ R:R ratios** for profitability

## 📝 License

Educational & personal trading use.

---

**Start tracking your trading journey today!**
