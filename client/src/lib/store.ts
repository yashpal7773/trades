import { create } from "zustand";
import type { 
  User, 
  Position, 
  Trade, 
  DebateMessage, 
  AIAgentWeights, 
  TradingCycleState,
  Candlestick,
  PortfolioSummary,
  Settings
} from "@shared/schema";

interface TradingStore {
  user: User | null;
  setUser: (user: User | null) => void;
  
  portfolio: PortfolioSummary | null;
  setPortfolio: (portfolio: PortfolioSummary | null) => void;
  
  positions: Position[];
  setPositions: (positions: Position[]) => void;
  
  trades: Trade[];
  setTrades: (trades: Trade[]) => void;
  addTrade: (trade: Trade) => void;
  
  debateMessages: DebateMessage[];
  setDebateMessages: (messages: DebateMessage[]) => void;
  addDebateMessage: (message: DebateMessage) => void;
  clearDebateMessages: () => void;
  
  agentWeights: AIAgentWeights[];
  setAgentWeights: (weights: AIAgentWeights[]) => void;
  
  cycleState: TradingCycleState;
  setCycleState: (state: TradingCycleState) => void;
  
  currentTicker: string;
  setCurrentTicker: (ticker: string) => void;
  
  candlesticks: Candlestick[];
  setCandlesticks: (candles: Candlestick[]) => void;
  addCandlestick: (candle: Candlestick) => void;
  
  settings: Settings;
  setSettings: (settings: Settings) => void;
  
  wsConnected: boolean;
  setWsConnected: (connected: boolean) => void;
}

export const useTradingStore = create<TradingStore>((set) => ({
  user: {
    id: "1",
    username: "Trader",
    badge: "Pro Trader",
    paperBalance: 100000,
    createdAt: new Date().toISOString()
  },
  setUser: (user) => set({ user }),
  
  portfolio: {
    totalValue: 100000,
    cashBalance: 100000,
    todayPnL: 0,
    todayPnLPercent: 0,
    lifetimePnL: 0,
    lifetimePnLPercent: 0,
    positions: []
  },
  setPortfolio: (portfolio) => set({ portfolio }),
  
  positions: [],
  setPositions: (positions) => set({ positions }),
  
  trades: [],
  setTrades: (trades) => set({ trades }),
  addTrade: (trade) => set((state) => ({ trades: [trade, ...state.trades] })),
  
  debateMessages: [],
  setDebateMessages: (debateMessages) => set({ debateMessages }),
  addDebateMessage: (message) => set((state) => ({ 
    debateMessages: [...state.debateMessages, message] 
  })),
  clearDebateMessages: () => set({ debateMessages: [] }),
  
  agentWeights: [
    { id: "1", agentType: "chatgpt", stockWeight: 1.0, strategyWeight: 1.0, tradingWeight: 1.0 },
    { id: "2", agentType: "gemini", stockWeight: 1.0, strategyWeight: 1.0, tradingWeight: 1.0 },
    { id: "3", agentType: "grok", stockWeight: 1.0, strategyWeight: 1.0, tradingWeight: 1.0 },
    { id: "4", agentType: "deepseek", stockWeight: 1.0, strategyWeight: 1.0, tradingWeight: 1.0 }
  ],
  setAgentWeights: (agentWeights) => set({ agentWeights }),
  
  cycleState: { status: "idle" },
  setCycleState: (cycleState) => set({ cycleState }),
  
  currentTicker: "AAPL",
  setCurrentTicker: (currentTicker) => set({ currentTicker }),
  
  candlesticks: [],
  setCandlesticks: (candlesticks) => set({ candlesticks }),
  addCandlestick: (candle) => set((state) => ({ 
    candlesticks: [...state.candlesticks, candle] 
  })),
  
  settings: {},
  setSettings: (settings) => set({ settings }),
  
  wsConnected: false,
  setWsConnected: (wsConnected) => set({ wsConnected })
}));
