import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";
import type { AIAgentType, StockProposal, StrategyProposal } from "@shared/schema";

const STOCK_PROPOSAL_PROMPT = `You are a ruthless hedge fund trader. Propose ONE liquid stock ticker for the next short-term trade. 
Choose from major stocks like AAPL, MSFT, GOOGL, AMZN, NVDA, META, TSLA, etc.
Provide a brief justification using current market conditions, technicals, or catalysts.
Respond in JSON format: { "ticker": "SYMBOL", "justification": "Your reasoning" }`;

const STRATEGY_PROMPT = `You are a quantitative trading strategist. Propose a trading strategy for {TICKER}.
Choose from strategies like: momentum scalping, mean reversion, breakout trading, swing trading, etc.
Provide a brief description of how to execute it.
Respond in JSON format: { "strategy": "Strategy Name", "description": "How to execute" }`;

const CRITIQUE_PROMPT = `You are a critical hedge fund analyst. Review this proposal and provide constructive criticism:
Proposal: {PROPOSAL}
Be concise but insightful. Point out risks or improvements.`;

// OpenAI client for ChatGPT (also used for Grok via xAI and DeepSeek)
function createOpenAIClient(apiKey: string, baseURL?: string): OpenAI {
  return new OpenAI({ 
    apiKey,
    baseURL: baseURL || "https://api.openai.com/v1"
  });
}

// Gemini client
function createGeminiClient(apiKey: string): GoogleGenAI {
  return new GoogleGenAI({ apiKey });
}

async function callChatGPT(prompt: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return generateFallbackResponse("chatgpt", prompt);
  }

  try {
    const client = createOpenAIClient(apiKey);
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });
    return response.choices[0].message.content || "";
  } catch (error) {
    console.error("ChatGPT API error:", error);
    return generateFallbackResponse("chatgpt", prompt);
  }
}

async function callGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return generateFallbackResponse("gemini", prompt);
  }

  try {
    const client = createGeminiClient(apiKey);
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text || "";
  } catch (error) {
    console.error("Gemini API error:", error);
    return generateFallbackResponse("gemini", prompt);
  }
}

async function callGrok(prompt: string): Promise<string> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    return generateFallbackResponse("grok", prompt);
  }

  try {
    const client = createOpenAIClient(apiKey, "https://api.x.ai/v1");
    const response = await client.chat.completions.create({
      model: "grok-2-1212",
      messages: [{ role: "user", content: prompt }],
    });
    return response.choices[0].message.content || "";
  } catch (error) {
    console.error("Grok API error:", error);
    return generateFallbackResponse("grok", prompt);
  }
}

async function callDeepSeek(prompt: string): Promise<string> {
  // DeepSeek uses OpenAI-compatible API
  const apiKey = process.env.XAI_API_KEY; // Using XAI key as fallback
  if (!apiKey) {
    return generateFallbackResponse("deepseek", prompt);
  }

  try {
    // For now, use Grok as DeepSeek alternative
    const client = createOpenAIClient(apiKey, "https://api.x.ai/v1");
    const response = await client.chat.completions.create({
      model: "grok-2-1212",
      messages: [{ role: "user", content: prompt }],
    });
    return response.choices[0].message.content || "";
  } catch (error) {
    console.error("DeepSeek API error:", error);
    return generateFallbackResponse("deepseek", prompt);
  }
}

function generateFallbackResponse(agent: AIAgentType, prompt: string): string {
  const stocks = ["NVDA", "AAPL", "MSFT", "GOOGL", "AMZN", "META", "TSLA"];
  const strategies = [
    { name: "Momentum Breakout", desc: "Buy on price breakout above resistance with volume confirmation" },
    { name: "Mean Reversion", desc: "Enter when RSI shows oversold conditions, exit at mean" },
    { name: "Scalping", desc: "Quick 5-minute trades capturing small price movements" },
    { name: "Swing Trading", desc: "Hold positions for 2-5 days following trend momentum" },
  ];

  const agentBias = {
    chatgpt: 0,
    gemini: 1,
    grok: 2,
    deepseek: 3,
  };

  const bias = agentBias[agent] || 0;

  if (prompt.includes("stock ticker")) {
    const stock = stocks[(bias + Date.now()) % stocks.length];
    const justifications = [
      `Strong momentum with increasing institutional buying`,
      `Undervalued relative to sector peers with upcoming catalyst`,
      `Technical breakout forming on daily chart with volume`,
      `Positive earnings revision trend and analyst upgrades`,
    ];
    return JSON.stringify({
      ticker: stock,
      justification: justifications[bias % justifications.length],
    });
  }

  if (prompt.includes("trading strategy")) {
    const strategy = strategies[(bias + Date.now()) % strategies.length];
    return JSON.stringify({
      strategy: strategy.name,
      description: strategy.desc,
    });
  }

  return JSON.stringify({ response: "Analysis complete" });
}

export async function getAgentResponse(
  agent: AIAgentType,
  prompt: string
): Promise<string> {
  switch (agent) {
    case "chatgpt":
      return callChatGPT(prompt);
    case "gemini":
      return callGemini(prompt);
    case "grok":
      return callGrok(prompt);
    case "deepseek":
      return callDeepSeek(prompt);
    default:
      return generateFallbackResponse(agent, prompt);
  }
}

export async function getStockProposal(agent: AIAgentType): Promise<StockProposal> {
  const response = await getAgentResponse(agent, STOCK_PROPOSAL_PROMPT);
  try {
    const parsed = JSON.parse(response);
    return {
      agentType: agent,
      ticker: parsed.ticker || "AAPL",
      justification: parsed.justification || "Technical analysis suggests upside potential",
    };
  } catch {
    return {
      agentType: agent,
      ticker: "AAPL",
      justification: "Strong fundamentals and market position",
    };
  }
}

export async function getStrategyProposal(
  agent: AIAgentType,
  ticker: string
): Promise<StrategyProposal> {
  const prompt = STRATEGY_PROMPT.replace("{TICKER}", ticker);
  const response = await getAgentResponse(agent, prompt);
  try {
    const parsed = JSON.parse(response);
    return {
      agentType: agent,
      strategy: parsed.strategy || "Momentum Trading",
      description: parsed.description || "Follow price momentum with stop-loss protection",
    };
  } catch {
    return {
      agentType: agent,
      strategy: "Momentum Trading",
      description: "Follow price momentum with proper risk management",
    };
  }
}

export async function getCritique(
  agent: AIAgentType,
  proposal: string
): Promise<string> {
  const prompt = CRITIQUE_PROMPT.replace("{PROPOSAL}", proposal);
  const response = await getAgentResponse(agent, prompt);
  try {
    const parsed = JSON.parse(response);
    return parsed.critique || parsed.response || response;
  } catch {
    return response;
  }
}
