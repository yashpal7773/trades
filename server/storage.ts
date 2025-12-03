import { randomUUID } from "crypto";
import type {
  User,
  Position,
  Trade,
  DebateMessage,
  AIAgentWeights,
  TradingCycleState,
  Candlestick,
  PortfolioSummary,
  Settings,
  AIAgentType,
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: Omit<User, "id" | "createdAt">): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;

  // Portfolio operations
  getPortfolio(): Promise<PortfolioSummary>;
  updatePortfolio(updates: Partial<PortfolioSummary>): Promise<PortfolioSummary>;

  // Position operations
  getPositions(): Promise<Position[]>;
  getPosition(ticker: string): Promise<Position | undefined>;
  createPosition(position: Omit<Position, "id">): Promise<Position>;
  updatePosition(id: string, updates: Partial<Position>): Promise<Position | undefined>;
  deletePosition(id: string): Promise<boolean>;

  // Trade operations
  getTrades(limit?: number): Promise<Trade[]>;
  createTrade(trade: Omit<Trade, "id">): Promise<Trade>;

  // Debate operations
  getDebateMessages(): Promise<DebateMessage[]>;
  createDebateMessage(message: Omit<DebateMessage, "id">): Promise<DebateMessage>;
  clearDebateMessages(): Promise<void>;

  // AI Agent weights
  getAgentWeights(): Promise<AIAgentWeights[]>;
  updateAgentWeight(
    agentType: AIAgentType,
    updates: Partial<AIAgentWeights>
  ): Promise<AIAgentWeights | undefined>;

  // Trading cycle
  getCycleState(): Promise<TradingCycleState>;
  updateCycleState(state: Partial<TradingCycleState>): Promise<TradingCycleState>;

  // Settings
  getSettings(): Promise<Settings>;
  updateSettings(settings: Partial<Settings>): Promise<Settings>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private positions: Map<string, Position>;
  private trades: Trade[];
  private debateMessages: DebateMessage[];
  private agentWeights: Map<AIAgentType, AIAgentWeights>;
  private cycleState: TradingCycleState;
  private portfolio: PortfolioSummary;
  private settings: Settings;

  constructor() {
    this.users = new Map();
    this.positions = new Map();
    this.trades = [];
    this.debateMessages = [];
    this.settings = {};

    // Initialize default user
    const defaultUser: User = {
      id: "default",
      username: "Trader",
      badge: "Pro Trader",
      paperBalance: 100000,
      createdAt: new Date().toISOString(),
    };
    this.users.set(defaultUser.id, defaultUser);

    // Initialize portfolio
    this.portfolio = {
      totalValue: 100000,
      cashBalance: 100000,
      todayPnL: 0,
      todayPnLPercent: 0,
      lifetimePnL: 0,
      lifetimePnLPercent: 0,
      positions: [],
    };

    // Initialize AI agent weights
    this.agentWeights = new Map([
      ["chatgpt", { id: "1", agentType: "chatgpt", stockWeight: 1.0, strategyWeight: 1.0, tradingWeight: 1.0 }],
      ["gemini", { id: "2", agentType: "gemini", stockWeight: 1.0, strategyWeight: 1.0, tradingWeight: 1.0 }],
      ["grok", { id: "3", agentType: "grok", stockWeight: 1.0, strategyWeight: 1.0, tradingWeight: 1.0 }],
      ["deepseek", { id: "4", agentType: "deepseek", stockWeight: 1.0, strategyWeight: 1.0, tradingWeight: 1.0 }],
    ]);

    // Initialize cycle state
    this.cycleState = { status: "idle" };
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((u) => u.username === username);
  }

  async createUser(userData: Omit<User, "id" | "createdAt">): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...userData,
      id,
      createdAt: new Date().toISOString(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updated = { ...user, ...updates };
    this.users.set(id, updated);
    return updated;
  }

  // Portfolio operations
  async getPortfolio(): Promise<PortfolioSummary> {
    return {
      ...this.portfolio,
      positions: Array.from(this.positions.values()),
    };
  }

  async updatePortfolio(updates: Partial<PortfolioSummary>): Promise<PortfolioSummary> {
    this.portfolio = { ...this.portfolio, ...updates };
    return this.getPortfolio();
  }

  // Position operations
  async getPositions(): Promise<Position[]> {
    return Array.from(this.positions.values());
  }

  async getPosition(ticker: string): Promise<Position | undefined> {
    return Array.from(this.positions.values()).find((p) => p.ticker === ticker);
  }

  async createPosition(positionData: Omit<Position, "id">): Promise<Position> {
    const id = randomUUID();
    const position: Position = { ...positionData, id };
    this.positions.set(id, position);
    return position;
  }

  async updatePosition(id: string, updates: Partial<Position>): Promise<Position | undefined> {
    const position = this.positions.get(id);
    if (!position) return undefined;
    const updated = { ...position, ...updates };
    this.positions.set(id, updated);
    return updated;
  }

  async deletePosition(id: string): Promise<boolean> {
    return this.positions.delete(id);
  }

  // Trade operations
  async getTrades(limit?: number): Promise<Trade[]> {
    const trades = [...this.trades].reverse();
    return limit ? trades.slice(0, limit) : trades;
  }

  async createTrade(tradeData: Omit<Trade, "id">): Promise<Trade> {
    const id = randomUUID();
    const trade: Trade = { ...tradeData, id };
    this.trades.push(trade);
    return trade;
  }

  // Debate operations
  async getDebateMessages(): Promise<DebateMessage[]> {
    return [...this.debateMessages];
  }

  async createDebateMessage(messageData: Omit<DebateMessage, "id">): Promise<DebateMessage> {
    const id = randomUUID();
    const message: DebateMessage = { ...messageData, id };
    this.debateMessages.push(message);
    return message;
  }

  async clearDebateMessages(): Promise<void> {
    this.debateMessages = [];
  }

  // AI Agent weights
  async getAgentWeights(): Promise<AIAgentWeights[]> {
    return Array.from(this.agentWeights.values());
  }

  async updateAgentWeight(
    agentType: AIAgentType,
    updates: Partial<AIAgentWeights>
  ): Promise<AIAgentWeights | undefined> {
    const weight = this.agentWeights.get(agentType);
    if (!weight) return undefined;
    const updated = { ...weight, ...updates };
    this.agentWeights.set(agentType, updated);
    return updated;
  }

  // Trading cycle
  async getCycleState(): Promise<TradingCycleState> {
    return { ...this.cycleState };
  }

  async updateCycleState(state: Partial<TradingCycleState>): Promise<TradingCycleState> {
    this.cycleState = { ...this.cycleState, ...state };
    return this.cycleState;
  }

  // Settings
  async getSettings(): Promise<Settings> {
    return { ...this.settings };
  }

  async updateSettings(settings: Partial<Settings>): Promise<Settings> {
    this.settings = { ...this.settings, ...settings };
    return this.settings;
  }
}

export const storage = new MemStorage();
