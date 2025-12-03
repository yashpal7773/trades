import type { Candlestick } from "@shared/schema";

const ALPHA_VANTAGE_BASE = "https://www.alphavantage.co/query";

interface AlphaVantageCandle {
  "1. open": string;
  "2. high": string;
  "3. low": string;
  "4. close": string;
  "5. volume": string;
}

interface AlphaVantageResponse {
  "Time Series (5min)"?: Record<string, AlphaVantageCandle>;
  "Time Series (Daily)"?: Record<string, AlphaVantageCandle>;
  "Global Quote"?: {
    "05. price": string;
    "08. previous close": string;
    "09. change": string;
    "10. change percent": string;
  };
  Note?: string;
  Information?: string;
}

function generateDemoCandles(ticker: string, count: number = 100): Candlestick[] {
  const candles: Candlestick[] = [];
  const basePrice = getBasePrice(ticker);
  const now = Math.floor(Date.now() / 1000);
  const interval = 300; // 5 minutes

  let currentPrice = basePrice;

  for (let i = count - 1; i >= 0; i--) {
    const time = now - i * interval;
    const volatility = basePrice * 0.002; // 0.2% volatility per candle
    const trend = Math.sin(i / 20) * volatility;
    const randomness = (Math.random() - 0.5) * volatility * 2;

    const open = currentPrice;
    const close = open + trend + randomness;
    const high = Math.max(open, close) + Math.random() * volatility;
    const low = Math.min(open, close) - Math.random() * volatility;

    candles.push({
      time,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: Math.floor(Math.random() * 1000000) + 100000,
    });

    currentPrice = close;
  }

  return candles;
}

function getBasePrice(ticker: string): number {
  const prices: Record<string, number> = {
    AAPL: 178.50,
    MSFT: 378.25,
    GOOGL: 141.80,
    AMZN: 178.90,
    NVDA: 495.22,
    META: 505.75,
    TSLA: 248.50,
    AMD: 165.30,
    NFLX: 485.20,
    JPM: 195.40,
  };
  return prices[ticker.toUpperCase()] || 150.0;
}

export async function fetchIntradayCandles(
  ticker: string,
  interval: string = "5min"
): Promise<Candlestick[]> {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;

  if (!apiKey) {
    console.log("No Alpha Vantage API key, using demo data for", ticker);
    return generateDemoCandles(ticker);
  }

  try {
    const url = `${ALPHA_VANTAGE_BASE}?function=TIME_SERIES_INTRADAY&symbol=${ticker}&interval=${interval}&apikey=${apiKey}&outputsize=compact`;
    const response = await fetch(url);
    const data: AlphaVantageResponse = await response.json();

    // Check for rate limiting or errors
    if (data.Note || data.Information) {
      console.log("Alpha Vantage rate limit, using demo data:", data.Note || data.Information);
      return generateDemoCandles(ticker);
    }

    const timeSeries = data["Time Series (5min)"];
    if (!timeSeries) {
      console.log("No time series data, using demo data for", ticker);
      return generateDemoCandles(ticker);
    }

    const candles: Candlestick[] = [];
    const entries = Object.entries(timeSeries).slice(0, 100);

    for (const [dateStr, candle] of entries) {
      const date = new Date(dateStr);
      candles.push({
        time: Math.floor(date.getTime() / 1000),
        open: parseFloat(candle["1. open"]),
        high: parseFloat(candle["2. high"]),
        low: parseFloat(candle["3. low"]),
        close: parseFloat(candle["4. close"]),
        volume: parseInt(candle["5. volume"]),
      });
    }

    // Sort by time ascending
    candles.sort((a, b) => a.time - b.time);
    return candles;
  } catch (error) {
    console.error("Error fetching market data:", error);
    return generateDemoCandles(ticker);
  }
}

export async function fetchQuote(ticker: string): Promise<{
  price: number;
  change: number;
  changePercent: number;
}> {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;

  if (!apiKey) {
    const basePrice = getBasePrice(ticker);
    const change = (Math.random() - 0.5) * 5;
    return {
      price: basePrice + change,
      change,
      changePercent: (change / basePrice) * 100,
    };
  }

  try {
    const url = `${ALPHA_VANTAGE_BASE}?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${apiKey}`;
    const response = await fetch(url);
    const data: AlphaVantageResponse = await response.json();

    if (data.Note || data.Information || !data["Global Quote"]) {
      const basePrice = getBasePrice(ticker);
      const change = (Math.random() - 0.5) * 5;
      return {
        price: basePrice + change,
        change,
        changePercent: (change / basePrice) * 100,
      };
    }

    const quote = data["Global Quote"];
    return {
      price: parseFloat(quote["05. price"]),
      change: parseFloat(quote["09. change"]),
      changePercent: parseFloat(quote["10. change percent"].replace("%", "")),
    };
  } catch (error) {
    console.error("Error fetching quote:", error);
    const basePrice = getBasePrice(ticker);
    const change = (Math.random() - 0.5) * 5;
    return {
      price: basePrice + change,
      change,
      changePercent: (change / basePrice) * 100,
    };
  }
}

export function generateLiveCandle(lastCandle: Candlestick | null, ticker: string): Candlestick {
  const basePrice = lastCandle?.close || getBasePrice(ticker);
  const now = Math.floor(Date.now() / 1000);
  const volatility = basePrice * 0.001;
  const change = (Math.random() - 0.5) * volatility * 2;

  const open = basePrice;
  const close = basePrice + change;
  const high = Math.max(open, close) + Math.random() * volatility;
  const low = Math.min(open, close) - Math.random() * volatility;

  return {
    time: now,
    open: parseFloat(open.toFixed(2)),
    high: parseFloat(high.toFixed(2)),
    low: parseFloat(low.toFixed(2)),
    close: parseFloat(close.toFixed(2)),
    volume: Math.floor(Math.random() * 100000) + 10000,
  };
}
