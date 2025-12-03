import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTradingStore } from "@/lib/store";
import { TrendingUp, TrendingDown, Bot, DollarSign, Activity } from "lucide-react";
import { AGENT_NAMES, type AIAgentType } from "@shared/schema";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPercent(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export default function Dashboard() {
  const { user, portfolio, trades, agentWeights } = useTradingStore();

  const recentTrades = trades.slice(0, 5);
  const activeAgents = agentWeights.filter(
    (a) => a.stockWeight > 0 || a.strategyWeight > 0 || a.tradingWeight > 0
  ).length;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Badge variant="outline" className="text-sm">
          Paper Trading Mode
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card data-testid="card-user-profile">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-primary">
                <AvatarFallback className="bg-primary/20 text-xl font-bold text-primary">
                  {user?.username?.slice(0, 2).toUpperCase() || "TR"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1">
                <span className="text-xl font-semibold">
                  {user?.username || "Trader"}
                </span>
                <Badge 
                  variant="outline" 
                  className="w-fit border-primary text-primary"
                >
                  {user?.badge || "Pro Trader"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-net-worth">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Net Worth
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">
              {formatCurrency(portfolio?.totalValue || 0)}
            </div>
            <div className="flex items-center gap-1 text-sm">
              {(portfolio?.todayPnLPercent || 0) >= 0 ? (
                <>
                  <TrendingUp className="h-4 w-4 text-profit" />
                  <span className="text-profit">
                    {formatPercent(portfolio?.todayPnLPercent || 0)}
                  </span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-4 w-4 text-loss" />
                  <span className="text-loss">
                    {formatPercent(portfolio?.todayPnLPercent || 0)}
                  </span>
                </>
              )}
              <span className="text-muted-foreground">today</span>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-today-pnl">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Today's P&L
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div 
              className={`text-2xl font-bold font-mono ${
                (portfolio?.todayPnL || 0) >= 0 ? "text-profit" : "text-loss"
              }`}
            >
              {(portfolio?.todayPnL || 0) >= 0 ? "+" : ""}
              {formatCurrency(portfolio?.todayPnL || 0)}
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              {(portfolio?.todayPnL || 0) >= 0 ? (
                <TrendingUp className="h-4 w-4 text-profit" />
              ) : (
                <TrendingDown className="h-4 w-4 text-loss" />
              )}
              <span>
                {formatPercent(portfolio?.todayPnLPercent || 0)} change
              </span>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-active-agents">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active AI Agents
            </CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">
              {activeAgents} / 4
            </div>
            <div className="flex gap-1 mt-2">
              {agentWeights.map((agent) => (
                <div
                  key={agent.id}
                  className="h-2 w-2 rounded-full"
                  style={{
                    backgroundColor: 
                      agent.agentType === "chatgpt" ? "#10A37F" :
                      agent.agentType === "gemini" ? "#8E75B2" :
                      agent.agentType === "grok" ? "#1DA1F2" : "#FF6B35"
                  }}
                  title={AGENT_NAMES[agent.agentType as AIAgentType]}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-recent-activity">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentTrades.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Activity className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No trades yet</p>
              <p className="text-sm text-muted-foreground/70">
                Start a trading cycle to see activity here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentTrades.map((trade) => (
                <div
                  key={trade.id}
                  className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0"
                  data-testid={`trade-${trade.id}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">
                        {new Date(trade.timestamp).toLocaleTimeString()}
                      </span>
                      <span className="font-mono font-semibold">
                        {trade.ticker}
                      </span>
                    </div>
                    <Badge
                      variant={trade.action === "BUY" ? "default" : "destructive"}
                      className={trade.action === "BUY" ? "bg-profit" : "bg-loss"}
                    >
                      {trade.action}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm">
                      {trade.quantity} @ {formatCurrency(trade.price)}
                    </div>
                    {trade.pnl !== undefined && (
                      <div
                        className={`text-sm font-mono ${
                          trade.pnl >= 0 ? "text-profit" : "text-loss"
                        }`}
                      >
                        {trade.pnl >= 0 ? "+" : ""}
                        {formatCurrency(trade.pnl)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
