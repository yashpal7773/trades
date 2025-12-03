import { z } from "zod";

// AI Agent types
export const AI_AGENTS = ["chatgpt", "gemini", "grok", "deepseek"] as const;
export type AIAgentType = typeof AI_AGENTS[number];

// Agent colors for UI
export const AGENT_COLORS: Record<AIAgentType, string> = {
  chatgpt: "#10A37F",
  gemini: "#8E75B2", 
  grok: "#1DA1F2",
  deepseek: "#FF6B35"
};

export const AGENT_NAMES: Record<AIAgentType, string> = {
  chatgpt: "ChatGPT",
  gemini: "Gemini",
  grok: "Grok",
  deepseek: "DeepSeek"
};

// User schema
export const userSchema = z.object({
  id: z.string(),
  username: z.string(),
  avatar: z.string().optional(),
  badge: z.string().default("Pro Trader"),
  paperBalance: z.number().default(100000),
  createdAt: z.string()
});

export type User = z.infer<typeof userSchema>;
export const insertUserSchema = userSchema.omit({ id: true, createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;

// AI Agent weights schema
export const aiAgentWeightsSchema = z.object({
  id: z.string(),
  agentType: z.enum(AI_AGENTS),
  stockWeight: z.number().default(1.0),
  strategyWeight: z.number().default(1.0),
  tradingWeight: z.number().default(1.0)
});

export type AIAgentWeights = z.infer<typeof aiAgentWeightsSchema>;

// Portfolio position schema
export const positionSchema = z.object({
  id: z.string(),
  ticker: z.string(),
  quantity: z.number(),
  entryPrice: z.number(),
  currentPrice: z.number(),
  entryTime: z.string()
});

export type Position = z.infer<typeof positionSchema>;
export const insertPositionSchema = positionSchema.omit({ id: true });
export type InsertPosition = z.infer<typeof insertPositionSchema>;

// Trade schema
export const tradeSchema = z.object({
  id: z.string(),
  ticker: z.string(),
  action: z.enum(["BUY", "SELL", "HOLD"]),
  quantity: z.number(),
  price: z.number(),
  strategy: z.string(),
  pnl: z.number().optional(),
  timestamp: z.string()
});

export type Trade = z.infer<typeof tradeSchema>;
export const insertTradeSchema = tradeSchema.omit({ id: true });
export type InsertTrade = z.infer<typeof insertTradeSchema>;

// Debate message schema
export const debateMessageSchema = z.object({
  id: z.string(),
  agentType: z.enum(AI_AGENTS),
  message: z.string(),
  messageType: z.enum(["proposal", "critique", "vote"]),
  ticker: z.string().optional(),
  strategy: z.string().optional(),
  timestamp: z.string()
});

export type DebateMessage = z.infer<typeof debateMessageSchema>;
export const insertDebateMessageSchema = debateMessageSchema.omit({ id: true });
export type InsertDebateMessage = z.infer<typeof insertDebateMessageSchema>;

// Candlestick data schema
export const candlestickSchema = z.object({
  time: z.number(),
  open: z.number(),
  high: z.number(),
  low: z.number(),
  close: z.number(),
  volume: z.number().optional()
});

export type Candlestick = z.infer<typeof candlestickSchema>;

// Trading cycle state
export const tradingCycleStateSchema = z.object({
  status: z.enum(["idle", "stock_selection", "strategy_debate", "trading", "stopped"]),
  selectedTicker: z.string().optional(),
  selectedStrategy: z.string().optional(),
  stockVotes: z.record(z.string(), z.number()).optional(),
  strategyVotes: z.record(z.string(), z.number()).optional()
});

export type TradingCycleState = z.infer<typeof tradingCycleStateSchema>;

// Settings schema
export const settingsSchema = z.object({
  marketDataApiKey: z.string().optional(),
  openaiApiKey: z.string().optional(),
  geminiApiKey: z.string().optional(),
  grokApiKey: z.string().optional(),
  deepseekApiKey: z.string().optional()
});

export type Settings = z.infer<typeof settingsSchema>;

// Portfolio summary
export const portfolioSummarySchema = z.object({
  totalValue: z.number(),
  cashBalance: z.number(),
  todayPnL: z.number(),
  todayPnLPercent: z.number(),
  lifetimePnL: z.number(),
  lifetimePnLPercent: z.number(),
  positions: z.array(positionSchema)
});

export type PortfolioSummary = z.infer<typeof portfolioSummarySchema>;

// Stock proposal from AI
export const stockProposalSchema = z.object({
  agentType: z.enum(AI_AGENTS),
  ticker: z.string(),
  justification: z.string()
});

export type StockProposal = z.infer<typeof stockProposalSchema>;

// Strategy proposal from AI
export const strategyProposalSchema = z.object({
  agentType: z.enum(AI_AGENTS),
  strategy: z.string(),
  description: z.string()
});

export type StrategyProposal = z.infer<typeof strategyProposalSchema>;

// WebSocket message types
export type WSMessageType = 
  | "price_update"
  | "trade_executed"
  | "debate_message"
  | "cycle_status"
  | "position_update";

export const wsMessageSchema = z.object({
  type: z.string(),
  data: z.any(),
  timestamp: z.string()
});

export type WSMessage = z.infer<typeof wsMessageSchema>;

// Trade marker for chart
export const tradeMarkerSchema = z.object({
  time: z.number(),
  position: z.enum(["aboveBar", "belowBar"]),
  color: z.string(),
  shape: z.enum(["arrowUp", "arrowDown", "circle"]),
  text: z.string()
});

export type TradeMarker = z.infer<typeof tradeMarkerSchema>;
