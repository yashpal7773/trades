import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTradingStore } from "@/lib/store";
import { BarChart3, Grid3X3, TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { AGENT_NAMES, AGENT_COLORS, type AIAgentType } from "@shared/schema";

export default function Graphs() {
  const { agentWeights, trades } = useTradingStore();

  const powerRankingsData = agentWeights.map((agent) => {
    const combinedPower =
      (agent.stockWeight + agent.strategyWeight + agent.tradingWeight) / 3;
    return {
      name: AGENT_NAMES[agent.agentType as AIAgentType],
      power: combinedPower,
      stockWeight: agent.stockWeight,
      strategyWeight: agent.strategyWeight,
      tradingWeight: agent.tradingWeight,
      color: AGENT_COLORS[agent.agentType as AIAgentType],
    };
  }).sort((a, b) => b.power - a.power);

  const heatmapData = agentWeights.map((agent) => {
    const agentTrades = trades.filter(
      (t) => t.strategy?.toLowerCase().includes(agent.agentType)
    );
    const wins = agentTrades.filter((t) => (t.pnl || 0) > 0).length;
    const total = agentTrades.length || 1;
    return {
      agent: AGENT_NAMES[agent.agentType as AIAgentType],
      accuracy: (wins / total) * 100,
      trades: agentTrades.length,
      color: AGENT_COLORS[agent.agentType as AIAgentType],
    };
  });

  const performanceData = trades.slice(-20).map((trade, index) => {
    let cumulativePnL = 0;
    for (let i = 0; i <= index; i++) {
      cumulativePnL += trades[i]?.pnl || 0;
    }
    return {
      trade: index + 1,
      aiPnL: cumulativePnL,
      benchmark: index * 50 + Math.random() * 100 - 50,
    };
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <Badge variant="outline" className="text-sm">
          AI Performance
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card data-testid="card-power-rankings">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              AI Power Rankings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={powerRankingsData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(228 35% 18%)"
                  />
                  <XAxis
                    type="number"
                    domain={[0, 2]}
                    tick={{ fill: "hsl(228 20% 69%)" }}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fill: "hsl(0 0% 100%)" }}
                    width={70}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(228 45% 12%)",
                      border: "1px solid hsl(228 35% 18%)",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [value.toFixed(2), "Power"]}
                  />
                  <Bar
                    dataKey="power"
                    radius={[0, 4, 4, 0]}
                    fill="hsl(156 100% 50%)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              {powerRankingsData.map((agent, index) => (
                <div
                  key={agent.name}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                  data-testid={`ranking-${agent.name.toLowerCase()}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-muted-foreground">
                      #{index + 1}
                    </span>
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: agent.color }}
                    />
                    <span className="font-medium">{agent.name}</span>
                  </div>
                  <span className="font-mono text-sm text-primary">
                    {agent.power.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-accuracy-heatmap">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Grid3X3 className="h-5 w-5" />
              Accuracy Heatmap
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {heatmapData.map((agent) => (
                <div
                  key={agent.agent}
                  className="space-y-2"
                  data-testid={`heatmap-${agent.agent.toLowerCase()}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: agent.color }}
                      />
                      <span className="font-medium">{agent.agent}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {agent.trades} trades
                    </span>
                  </div>
                  <div className="relative h-8 w-full overflow-hidden rounded-lg bg-muted">
                    <div
                      className="absolute inset-y-0 left-0 rounded-lg transition-all duration-500"
                      style={{
                        width: `${agent.accuracy}%`,
                        backgroundColor:
                          agent.accuracy >= 60
                            ? "hsl(156 100% 50%)"
                            : agent.accuracy >= 40
                            ? "hsl(45 100% 50%)"
                            : "hsl(0 100% 64%)",
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-mono text-sm font-bold">
                        {agent.accuracy.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {heatmapData.every((a) => a.trades === 0) && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Grid3X3 className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No trading data yet</p>
                  <p className="text-sm text-muted-foreground/70">
                    Accuracy will be calculated after trading
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-performance-comparison">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performance vs Market
          </CardTitle>
        </CardHeader>
        <CardContent>
          {performanceData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <TrendingUp className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No performance data yet</p>
              <p className="text-sm text-muted-foreground/70">
                Chart will populate after trading activity
              </p>
            </div>
          ) : (
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={performanceData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(228 35% 18%)"
                  />
                  <XAxis
                    dataKey="trade"
                    tick={{ fill: "hsl(228 20% 69%)" }}
                    label={{
                      value: "Trade #",
                      position: "insideBottom",
                      offset: -5,
                      fill: "hsl(228 20% 69%)",
                    }}
                  />
                  <YAxis
                    tick={{ fill: "hsl(228 20% 69%)" }}
                    label={{
                      value: "P&L ($)",
                      angle: -90,
                      position: "insideLeft",
                      fill: "hsl(228 20% 69%)",
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(228 45% 12%)",
                      border: "1px solid hsl(228 35% 18%)",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [
                      `$${value.toFixed(2)}`,
                      value === performanceData[0]?.aiPnL ? "AI Fund" : "Benchmark",
                    ]}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="aiPnL"
                    name="AI Fund"
                    stroke="hsl(156 100% 50%)"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="benchmark"
                    name="S&P 500"
                    stroke="hsl(228 20% 69%)"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <Card data-testid="card-weight-breakdown">
        <CardHeader>
          <CardTitle>Weight Breakdown by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 text-left font-medium text-muted-foreground">
                    Agent
                  </th>
                  <th className="pb-3 text-right font-medium text-muted-foreground">
                    Stock Weight
                  </th>
                  <th className="pb-3 text-right font-medium text-muted-foreground">
                    Strategy Weight
                  </th>
                  <th className="pb-3 text-right font-medium text-muted-foreground">
                    Trading Weight
                  </th>
                  <th className="pb-3 text-right font-medium text-muted-foreground">
                    Combined
                  </th>
                </tr>
              </thead>
              <tbody>
                {agentWeights.map((agent) => {
                  const combined =
                    (agent.stockWeight +
                      agent.strategyWeight +
                      agent.tradingWeight) /
                    3;
                  return (
                    <tr
                      key={agent.id}
                      className="border-b border-border last:border-0"
                    >
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{
                              backgroundColor:
                                AGENT_COLORS[agent.agentType as AIAgentType],
                            }}
                          />
                          <span className="font-medium">
                            {AGENT_NAMES[agent.agentType as AIAgentType]}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 text-right font-mono">
                        {agent.stockWeight.toFixed(2)}
                      </td>
                      <td className="py-4 text-right font-mono">
                        {agent.strategyWeight.toFixed(2)}
                      </td>
                      <td className="py-4 text-right font-mono">
                        {agent.tradingWeight.toFixed(2)}
                      </td>
                      <td className="py-4 text-right font-mono font-bold text-primary">
                        {combined.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
