import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useTradingStore } from "@/lib/store";
import { AGENT_NAMES, AGENT_COLORS, type AIAgentType } from "@shared/schema";
import { Vote, Target, Zap } from "lucide-react";

interface VoteBarProps {
  label: string;
  value: number;
  total: number;
  color: string;
}

function VoteBar({ label, value, total, color }: VoteBarProps) {
  const percentage = total > 0 ? (value / total) * 100 : 0;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-mono font-semibold">{label}</span>
        <span className="text-muted-foreground">{percentage.toFixed(1)}%</span>
      </div>
      <div className="relative h-6 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-mono font-bold mix-blend-difference">
            {value.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}

export function VotingPanel() {
  const { cycleState, agentWeights } = useTradingStore();

  const stockVotes = cycleState.stockVotes || {};
  const strategyVotes = cycleState.strategyVotes || {};

  const totalStockVotes = Object.values(stockVotes).reduce((a, b) => a + b, 0);
  const totalStrategyVotes = Object.values(strategyVotes).reduce(
    (a, b) => a + b,
    0
  );

  const sortedStockVotes = Object.entries(stockVotes).sort(
    ([, a], [, b]) => b - a
  );
  const sortedStrategyVotes = Object.entries(strategyVotes).sort(
    ([, a], [, b]) => b - a
  );

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex items-center gap-2">
        <Vote className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Voting Status</h3>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Target className="h-4 w-4" />
            Stock Selection
            {cycleState.selectedTicker && (
              <Badge className="ml-auto bg-primary text-primary-foreground">
                {cycleState.selectedTicker}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {sortedStockVotes.length === 0 ? (
            <div className="text-center py-4 text-sm text-muted-foreground">
              Waiting for stock proposals...
            </div>
          ) : (
            sortedStockVotes.map(([ticker, votes], index) => (
              <VoteBar
                key={ticker}
                label={ticker}
                value={votes}
                total={totalStockVotes}
                color={
                  index === 0
                    ? "hsl(156 100% 50%)"
                    : `hsl(${228 - index * 20} 35% ${40 + index * 10}%)`
                }
              />
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Zap className="h-4 w-4" />
            Strategy Selection
            {cycleState.selectedStrategy && (
              <Badge variant="secondary" className="ml-auto">
                {cycleState.selectedStrategy}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {sortedStrategyVotes.length === 0 ? (
            <div className="text-center py-4 text-sm text-muted-foreground">
              Waiting for strategy proposals...
            </div>
          ) : (
            sortedStrategyVotes.map(([strategy, votes], index) => (
              <VoteBar
                key={strategy}
                label={strategy.length > 20 ? strategy.slice(0, 20) + "..." : strategy}
                value={votes}
                total={totalStrategyVotes}
                color={
                  index === 0
                    ? "hsl(156 100% 50%)"
                    : `hsl(${200 + index * 30} 60% ${50 + index * 5}%)`
                }
              />
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Agent Weights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {agentWeights.map((agent) => {
            const avgWeight =
              (agent.stockWeight + agent.strategyWeight + agent.tradingWeight) /
              3;
            return (
              <div
                key={agent.id}
                className="flex items-center gap-2"
                data-testid={`agent-weight-${agent.agentType}`}
              >
                <div
                  className="h-3 w-3 rounded-full"
                  style={{
                    backgroundColor:
                      AGENT_COLORS[agent.agentType as AIAgentType],
                  }}
                />
                <span className="flex-1 text-sm">
                  {AGENT_NAMES[agent.agentType as AIAgentType]}
                </span>
                <Progress value={avgWeight * 50} className="w-16 h-2" />
                <span className="w-12 text-right text-xs font-mono text-muted-foreground">
                  {avgWeight.toFixed(2)}
                </span>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
