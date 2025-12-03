import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { fetchIntradayCandles, fetchQuote, generateLiveCandle } from "./market-data";
import { getStockProposal, getStrategyProposal, getCritique } from "./ai-agents";
import { AI_AGENTS, type AIAgentType, AGENT_NAMES } from "@shared/schema";

const clients = new Set<WebSocket>();
let priceUpdateInterval: NodeJS.Timeout | null = null;
let currentTicker = "AAPL";

function broadcast(message: object) {
  const data = JSON.stringify(message);
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // WebSocket setup
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  wss.on("connection", (ws) => {
    clients.add(ws);
    console.log("WebSocket client connected");

    // Send initial data
    storage.getCycleState().then((state) => {
      ws.send(JSON.stringify({ type: "cycle_status", data: state, timestamp: new Date().toISOString() }));
    });

    ws.on("close", () => {
      clients.delete(ws);
      console.log("WebSocket client disconnected");
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
      clients.delete(ws);
    });
  });

  // Start price update interval
  if (!priceUpdateInterval) {
    let lastCandle: any = null;
    priceUpdateInterval = setInterval(async () => {
      if (clients.size > 0) {
        try {
          const candles = await fetchIntradayCandles(currentTicker);
          if (candles.length > 0) {
            lastCandle = candles[candles.length - 1];
          }
          // Add a new live candle
          const newCandle = generateLiveCandle(lastCandle, currentTicker);
          candles.push(newCandle);
          lastCandle = newCandle;

          broadcast({
            type: "price_update",
            data: { ticker: currentTicker, candles: candles.slice(-100) },
            timestamp: new Date().toISOString(),
          });
        } catch (error) {
          console.error("Price update error:", error);
        }
      }
    }, 5000);
  }

  // === API Routes ===

  // Portfolio endpoints
  app.get("/api/portfolio", async (req, res) => {
    try {
      const portfolio = await storage.getPortfolio();
      res.json(portfolio);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch portfolio" });
    }
  });

  app.post("/api/portfolio/topup", async (req, res) => {
    try {
      const { amount } = req.body;
      const portfolio = await storage.getPortfolio();
      const updated = await storage.updatePortfolio({
        cashBalance: portfolio.cashBalance + amount,
        totalValue: portfolio.totalValue + amount,
      });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update portfolio" });
    }
  });

  app.post("/api/portfolio/reset", async (req, res) => {
    try {
      const updated = await storage.updatePortfolio({
        cashBalance: 100000,
        totalValue: 100000,
        todayPnL: 0,
        todayPnLPercent: 0,
        lifetimePnL: 0,
        lifetimePnLPercent: 0,
      });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to reset portfolio" });
    }
  });

  // Market data endpoints
  app.get("/api/market/candles/:ticker", async (req, res) => {
    try {
      const { ticker } = req.params;
      currentTicker = ticker.toUpperCase();
      const candles = await fetchIntradayCandles(currentTicker);
      res.json({ ticker: currentTicker, candles });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch candles" });
    }
  });

  app.get("/api/market/quote/:ticker", async (req, res) => {
    try {
      const { ticker } = req.params;
      const quote = await fetchQuote(ticker.toUpperCase());
      res.json(quote);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch quote" });
    }
  });

  // Trading cycle endpoints
  app.get("/api/trading/state", async (req, res) => {
    try {
      const state = await storage.getCycleState();
      res.json(state);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch cycle state" });
    }
  });

  app.post("/api/trading/start-cycle", async (req, res) => {
    try {
      const { ticker } = req.body;
      currentTicker = ticker || "AAPL";

      // Clear previous debate
      await storage.clearDebateMessages();

      // Update cycle state
      await storage.updateCycleState({
        status: "stock_selection",
        stockVotes: {},
        strategyVotes: {},
        selectedTicker: undefined,
        selectedStrategy: undefined,
      });

      broadcast({
        type: "cycle_status",
        data: { status: "stock_selection" },
        timestamp: new Date().toISOString(),
      });

      // Start AI debate asynchronously
      runTradingCycle();

      res.json({ success: true, status: "stock_selection" });
    } catch (error) {
      res.status(500).json({ error: "Failed to start trading cycle" });
    }
  });

  app.post("/api/trading/stop-cycle", async (req, res) => {
    try {
      await storage.updateCycleState({
        status: "stopped",
      });

      broadcast({
        type: "cycle_status",
        data: { status: "stopped" },
        timestamp: new Date().toISOString(),
      });

      res.json({ success: true, status: "stopped" });
    } catch (error) {
      res.status(500).json({ error: "Failed to stop trading cycle" });
    }
  });

  // Trade endpoints
  app.get("/api/trades", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const trades = await storage.getTrades(limit);
      res.json(trades);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch trades" });
    }
  });

  // AI weights endpoints
  app.get("/api/ai/weights", async (req, res) => {
    try {
      const weights = await storage.getAgentWeights();
      res.json(weights);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch AI weights" });
    }
  });

  app.post("/api/ai/weights/:agent", async (req, res) => {
    try {
      const { agent } = req.params;
      const updates = req.body;
      const updated = await storage.updateAgentWeight(agent as AIAgentType, updates);
      if (!updated) {
        return res.status(404).json({ error: "Agent not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update AI weights" });
    }
  });

  // Debate messages endpoints
  app.get("/api/debate/messages", async (req, res) => {
    try {
      const messages = await storage.getDebateMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch debate messages" });
    }
  });

  // Settings endpoints
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.post("/api/settings", async (req, res) => {
    try {
      const updated = await storage.updateSettings(req.body);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update settings" });
    }
  });

  return httpServer;
}

// Trading cycle logic
async function runTradingCycle() {
  try {
    // Phase 1: Stock Selection
    const stockProposals: Record<string, number> = {};
    const weights = await storage.getAgentWeights();

    // Get stock proposals from all agents
    for (const agent of AI_AGENTS) {
      const state = await storage.getCycleState();
      if (state.status === "stopped") return;

      try {
        const proposal = await getStockProposal(agent);
        const weight = weights.find((w) => w.agentType === agent);
        const stockWeight = weight?.stockWeight || 1.0;

        // Add vote
        stockProposals[proposal.ticker] = (stockProposals[proposal.ticker] || 0) + stockWeight;

        // Create debate message
        const message = await storage.createDebateMessage({
          agentType: agent,
          message: `I propose ${proposal.ticker}. ${proposal.justification}`,
          messageType: "proposal",
          ticker: proposal.ticker,
          timestamp: new Date().toISOString(),
        });

        broadcast({
          type: "debate_message",
          data: message,
          timestamp: new Date().toISOString(),
        });

        // Update cycle state with votes
        await storage.updateCycleState({
          stockVotes: { ...stockProposals },
        });

        broadcast({
          type: "cycle_status",
          data: { status: "stock_selection", stockVotes: stockProposals },
          timestamp: new Date().toISOString(),
        });

        // Small delay between agents
        await new Promise((r) => setTimeout(r, 1000));
      } catch (error) {
        console.error(`Error getting proposal from ${agent}:`, error);
      }
    }

    // Determine winning stock
    const winningStock = Object.entries(stockProposals).sort(([, a], [, b]) => b - a)[0]?.[0] || "AAPL";

    await storage.updateCycleState({
      status: "strategy_debate",
      selectedTicker: winningStock,
    });

    broadcast({
      type: "cycle_status",
      data: { status: "strategy_debate", selectedTicker: winningStock, stockVotes: stockProposals },
      timestamp: new Date().toISOString(),
    });

    // Phase 2: Strategy Debate
    const strategyProposals: Record<string, number> = {};

    for (const agent of AI_AGENTS) {
      const state = await storage.getCycleState();
      if (state.status === "stopped") return;

      try {
        const proposal = await getStrategyProposal(agent, winningStock);
        const weight = weights.find((w) => w.agentType === agent);
        const stratWeight = weight?.strategyWeight || 1.0;

        strategyProposals[proposal.strategy] = (strategyProposals[proposal.strategy] || 0) + stratWeight;

        const message = await storage.createDebateMessage({
          agentType: agent,
          message: `For ${winningStock}, I suggest ${proposal.strategy}: ${proposal.description}`,
          messageType: "proposal",
          strategy: proposal.strategy,
          timestamp: new Date().toISOString(),
        });

        broadcast({
          type: "debate_message",
          data: message,
          timestamp: new Date().toISOString(),
        });

        await storage.updateCycleState({
          strategyVotes: { ...strategyProposals },
        });

        broadcast({
          type: "cycle_status",
          data: { status: "strategy_debate", selectedTicker: winningStock, strategyVotes: strategyProposals },
          timestamp: new Date().toISOString(),
        });

        await new Promise((r) => setTimeout(r, 1000));
      } catch (error) {
        console.error(`Error getting strategy from ${agent}:`, error);
      }
    }

    // Determine winning strategy
    const winningStrategy = Object.entries(strategyProposals).sort(([, a], [, b]) => b - a)[0]?.[0] || "Momentum Trading";

    await storage.updateCycleState({
      status: "trading",
      selectedStrategy: winningStrategy,
    });

    broadcast({
      type: "cycle_status",
      data: { 
        status: "trading", 
        selectedTicker: winningStock, 
        selectedStrategy: winningStrategy,
        stockVotes: stockProposals,
        strategyVotes: strategyProposals
      },
      timestamp: new Date().toISOString(),
    });

    // Phase 3: Execute a demo trade
    const quote = await fetchQuote(winningStock);
    const trade = await storage.createTrade({
      ticker: winningStock,
      action: "BUY",
      quantity: 10,
      price: quote.price,
      strategy: winningStrategy,
      timestamp: new Date().toISOString(),
    });

    broadcast({
      type: "trade_executed",
      data: trade,
      timestamp: new Date().toISOString(),
    });

    // Update AI weights based on outcome
    const winningAgents = AI_AGENTS.filter((agent) => {
      const proposal = stockProposals[winningStock];
      return proposal && proposal > 0;
    });

    for (const agent of AI_AGENTS) {
      const isWinner = winningAgents.includes(agent);
      const weight = weights.find((w) => w.agentType === agent);
      if (weight) {
        await storage.updateAgentWeight(agent, {
          stockWeight: weight.stockWeight + (isWinner ? 0.05 : -0.02),
          strategyWeight: weight.strategyWeight + (isWinner ? 0.10 : -0.05),
        });
      }
    }

  } catch (error) {
    console.error("Trading cycle error:", error);
    await storage.updateCycleState({ status: "stopped" });
    broadcast({
      type: "cycle_status",
      data: { status: "stopped" },
      timestamp: new Date().toISOString(),
    });
  }
}
