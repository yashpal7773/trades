# AI Trading Battle Arena

A production-grade FinTech application featuring multi-agent reinforcement learning where 4 AI agents (ChatGPT, Gemini, Grok, DeepSeek) collaboratively debate and vote on stock trading decisions.

## Overview

The AI Trading Battle Arena is a paper trading platform that simulates real market trading using AI-powered decision making. The system features:

- **Multi-Agent Debate System**: 4 AI agents propose, debate, and vote on trading decisions
- **Real-Time Market Data**: Live candlestick charts using Alpha Vantage API
- **Paper Trading**: Risk-free simulated trading with $100,000 starting balance
- **Three-Weight Voting System**: Each AI agent has separate weights for stock selection, strategy, and trading decisions
- **Deep Ocean Dark UI**: Professional trading terminal aesthetic

## Tech Stack

- **Frontend**: React + Vite + TypeScript
- **Backend**: Express.js + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: Zustand (client), In-memory storage (server)
- **Real-time**: WebSocket for live updates
- **AI Integrations**: OpenAI (ChatGPT), Google Gemini, xAI (Grok)
- **Market Data**: Alpha Vantage API

## Project Structure

```
├── client/                    # Frontend React application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── app-sidebar.tsx        # Navigation sidebar
│   │   │   ├── candlestick-chart.tsx  # TradingView-style chart
│   │   │   ├── control-panel.tsx      # Trading controls
│   │   │   ├── debate-arena.tsx       # AI agent debate display
│   │   │   ├── voting-panel.tsx       # Weight voting interface
│   │   │   └── ui/                    # shadcn components
│   │   ├── lib/
│   │   │   ├── queryClient.ts         # React Query setup
│   │   │   └── store.ts               # Zustand state store
│   │   ├── pages/
│   │   │   ├── dashboard.tsx          # Main overview page
│   │   │   ├── portfolio.tsx          # Positions & P&L
│   │   │   ├── trading.tsx            # AI Trading arena
│   │   │   ├── graphs.tsx             # Analytics & charts
│   │   │   └── account.tsx            # Settings & preferences
│   │   └── App.tsx                    # Main app with routing
├── server/
│   ├── routes.ts              # API endpoints & WebSocket
│   ├── storage.ts             # In-memory data storage
│   ├── ai-agents.ts           # AI API integrations
│   └── market-data.ts         # Alpha Vantage integration
├── shared/
│   └── schema.ts              # Type definitions
└── design_guidelines.md       # Deep Ocean theme specs
```

## Key Features

### AI Trading Cycle
1. **Stock Selection Phase**: All 4 AI agents propose a stock ticker with justification
2. **Strategy Debate Phase**: Agents propose trading strategies for the winning stock
3. **Weighted Voting**: Votes are weighted by each agent's historical performance
4. **Trade Execution**: System executes the winning strategy as a paper trade

### Real-Time Updates
- WebSocket connection at `/ws` for live data streaming
- Price updates every 5 seconds during market hours
- Instant broadcast of debate messages and trade executions

### Portfolio Management
- Track open positions with real-time P&L
- View trade history with full details
- Paper balance management (top-up, reset)

## API Endpoints

### Portfolio
- `GET /api/portfolio` - Get portfolio summary
- `POST /api/portfolio/topup` - Add funds
- `POST /api/portfolio/reset` - Reset to default

### Market Data
- `GET /api/market/candles/:ticker` - Get candlestick data
- `GET /api/market/quote/:ticker` - Get current quote

### Trading
- `GET /api/trading/state` - Get cycle state
- `POST /api/trading/start-cycle` - Start AI debate
- `POST /api/trading/stop-cycle` - Emergency stop

### AI Agents
- `GET /api/ai/weights` - Get agent weights
- `POST /api/ai/weights/:agent` - Update agent weights

## Environment Variables

Required secrets:
- `OPENAI_API_KEY` - For ChatGPT agent
- `GEMINI_API_KEY` - For Gemini agent  
- `XAI_API_KEY` - For Grok agent
- `ALPHA_VANTAGE_API_KEY` - For market data

## Design System

The app uses a "Deep Ocean" dark theme:
- **Background**: `#0B1026` (deep navy)
- **Cards/Surfaces**: `#0F172A` with subtle borders
- **Profit Green**: `#00FF94` 
- **Loss Red**: `#FF4B4B`
- **Primary Accent**: Cyan/teal tones

## Running the App

The application runs on port 5000 with:
- Frontend served via Vite dev server
- Backend Express API
- WebSocket for real-time updates

Start command: `npm run dev`
