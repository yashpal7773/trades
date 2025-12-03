import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTradingStore } from "@/lib/store";
import { TrendingUp, TrendingDown, PieChart, History } from "lucide-react";
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

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

const COLORS = ["#00FF94", "#1DA1F2", "#8E75B2", "#FF6B35", "#FFD93D"];

export default function Portfolio() {
  const { portfolio, positions, trades } = useTradingStore();

  const lifetimePnL = portfolio?.lifetimePnL || 0;
  const lifetimePnLPercent = portfolio?.lifetimePnLPercent || 0;

  const allocationData = [
    { name: "Cash", value: portfolio?.cashBalance || 100000 },
    ...positions.map((pos) => ({
      name: pos.ticker,
      value: pos.quantity * pos.currentPrice,
    })),
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Portfolio</h1>
        <Badge variant="outline" className="text-sm">
          {positions.length} Position{positions.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      <Card data-testid="card-lifetime-pnl">
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center gap-4">
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Lifetime P&L
            </span>
            <div className="flex items-center gap-4">
              {lifetimePnL >= 0 ? (
                <TrendingUp className="h-12 w-12 text-profit" />
              ) : (
                <TrendingDown className="h-12 w-12 text-loss" />
              )}
              <div className="flex flex-col">
                <span
                  className={`text-5xl font-bold font-mono ${
                    lifetimePnL >= 0 ? "text-profit" : "text-loss"
                  }`}
                >
                  {lifetimePnL >= 0 ? "+" : ""}
                  {formatCurrency(lifetimePnL)}
                </span>
                <span
                  className={`text-xl font-mono ${
                    lifetimePnL >= 0 ? "text-profit" : "text-loss"
                  }`}
                >
                  {formatPercent(lifetimePnLPercent)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card data-testid="card-asset-allocation">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Asset Allocation
            </CardTitle>
          </CardHeader>
          <CardContent>
            {allocationData.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie
                      data={allocationData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {allocationData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: "hsl(228 45% 12%)",
                        border: "1px solid hsl(228 35% 18%)",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                No positions to display
              </div>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-positions">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Open Positions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {positions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <PieChart className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No open positions</p>
                <p className="text-sm text-muted-foreground/70">
                  Your positions will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {positions.map((position) => {
                  const pnl =
                    (position.currentPrice - position.entryPrice) *
                    position.quantity;
                  const pnlPercent =
                    ((position.currentPrice - position.entryPrice) /
                      position.entryPrice) *
                    100;
                  return (
                    <div
                      key={position.id}
                      className="flex items-center justify-between rounded-lg border border-border p-4"
                      data-testid={`position-${position.ticker}`}
                    >
                      <div className="flex flex-col">
                        <span className="font-mono font-bold text-lg">
                          {position.ticker}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {position.quantity} shares @ {formatCurrency(position.entryPrice)}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-semibold">
                          {formatCurrency(position.currentPrice * position.quantity)}
                        </div>
                        <div
                          className={`text-sm font-mono ${
                            pnl >= 0 ? "text-profit" : "text-loss"
                          }`}
                        >
                          {pnl >= 0 ? "+" : ""}
                          {formatCurrency(pnl)} ({formatPercent(pnlPercent)})
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-trade-history">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Trade History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {trades.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <History className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No trade history</p>
              <p className="text-sm text-muted-foreground/70">
                Your trades will appear here
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Strategy</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">P&L</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trades.map((trade) => (
                    <TableRow key={trade.id} data-testid={`history-row-${trade.id}`}>
                      <TableCell className="font-mono text-sm">
                        {new Date(trade.timestamp).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold">
                            {trade.ticker}
                          </span>
                          <Badge
                            variant={trade.action === "BUY" ? "default" : "destructive"}
                            className={`text-xs ${
                              trade.action === "BUY" ? "bg-profit" : "bg-loss"
                            }`}
                          >
                            {trade.action}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {trade.strategy}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {trade.quantity}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(trade.price)}
                      </TableCell>
                      <TableCell
                        className={`text-right font-mono ${
                          (trade.pnl || 0) >= 0 ? "text-profit" : "text-loss"
                        }`}
                      >
                        {trade.pnl !== undefined
                          ? `${trade.pnl >= 0 ? "+" : ""}${formatCurrency(trade.pnl)}`
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
