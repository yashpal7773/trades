import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTradingStore } from "@/lib/store";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Play, 
  Square, 
  AlertOctagon, 
  Loader2, 
  Activity,
  TrendingUp,
  Zap
} from "lucide-react";

type CycleStatus = "idle" | "stock_selection" | "strategy_debate" | "trading" | "stopped";

const STATUS_CONFIG: Record<CycleStatus, { label: string; color: string; icon: typeof Activity }> = {
  idle: { label: "Waiting", color: "text-muted-foreground", icon: Activity },
  stock_selection: { label: "Selecting Stock", color: "text-chart-2", icon: TrendingUp },
  strategy_debate: { label: "Debating Strategy", color: "text-chart-3", icon: Zap },
  trading: { label: "Trading Active", color: "text-profit", icon: Activity },
  stopped: { label: "Stopped", color: "text-loss", icon: Square },
};

export function ControlPanel() {
  const { cycleState, setCycleState, currentTicker } = useTradingStore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const status = cycleState.status as CycleStatus;
  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.idle;
  const StatusIcon = statusConfig.icon;

  const handleStartCycle = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/trading/start-cycle", {
        ticker: currentTicker,
      });
      const data = await response.json();
      
      setCycleState({
        status: "stock_selection",
        stockVotes: {},
        strategyVotes: {},
      });
      
      toast({
        title: "Trading Cycle Started",
        description: "AI agents are now debating stock selection.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start trading cycle. Check API connections.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopCycle = async () => {
    setIsLoading(true);
    try {
      await apiRequest("POST", "/api/trading/stop-cycle");
      
      setCycleState({
        status: "stopped",
      });
      
      toast({
        title: "Trading Stopped",
        description: "Emergency stop executed. All positions closed.",
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to stop trading cycle.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex items-center gap-2">
        <Activity className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Control Panel</h3>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Cycle Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className={`relative flex h-3 w-3`}>
              {status === "trading" && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-profit opacity-75" />
              )}
              <span
                className={`relative inline-flex h-3 w-3 rounded-full ${
                  status === "trading"
                    ? "bg-profit"
                    : status === "stopped"
                    ? "bg-loss"
                    : "bg-muted-foreground"
                }`}
              />
            </div>
            <div className="flex flex-col">
              <span className={`font-semibold ${statusConfig.color}`}>
                {statusConfig.label}
              </span>
              {cycleState.selectedTicker && (
                <span className="text-sm text-muted-foreground">
                  Trading: {cycleState.selectedTicker}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Current Selection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Stock:</span>
            {cycleState.selectedTicker ? (
              <Badge className="bg-primary text-primary-foreground font-mono">
                {cycleState.selectedTicker}
              </Badge>
            ) : (
              <span className="text-sm text-muted-foreground">--</span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Strategy:</span>
            {cycleState.selectedStrategy ? (
              <Badge variant="secondary" className="max-w-32 truncate">
                {cycleState.selectedStrategy}
              </Badge>
            ) : (
              <span className="text-sm text-muted-foreground">--</span>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="mt-auto space-y-3">
        {status === "idle" || status === "stopped" ? (
          <Button
            className="w-full h-14 text-lg font-semibold"
            size="lg"
            onClick={handleStartCycle}
            disabled={isLoading}
            data-testid="button-start-cycle"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <Play className="mr-2 h-5 w-5" />
                Start Trading Cycle
              </>
            )}
          </Button>
        ) : (
          <Button
            variant="destructive"
            className="w-full h-14 text-lg font-semibold animate-pulse"
            size="lg"
            onClick={handleStopCycle}
            disabled={isLoading}
            data-testid="button-emergency-stop"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Stopping...
              </>
            ) : (
              <>
                <AlertOctagon className="mr-2 h-5 w-5" />
                Emergency Stop
              </>
            )}
          </Button>
        )}

        <p className="text-center text-xs text-muted-foreground">
          {status === "idle" || status === "stopped"
            ? "Click to start AI trading debate"
            : "Click to immediately stop trading and close positions"}
        </p>
      </div>
    </div>
  );
}
