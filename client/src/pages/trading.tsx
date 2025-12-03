import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CandlestickChart } from "@/components/candlestick-chart";
import { DebateArena } from "@/components/debate-arena";
import { VotingPanel } from "@/components/voting-panel";
import { ControlPanel } from "@/components/control-panel";
import { useTradingStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { 
  Bot, 
  Search, 
  Wifi, 
  WifiOff,
  TrendingUp
} from "lucide-react";

// 1. Get backend URL from env
const BASE_URL = import.meta.env.VITE_API_URL || "";

export default function Trading() {
  const { 
    currentTicker, 
    setCurrentTicker, 
    candlesticks, 
    setCandlesticks,
    wsConnected,
    setWsConnected,
    addDebateMessage,
    setCycleState,
    addTrade
  } = useTradingStore();
  const { toast } = useToast();
  const [tickerInput, setTickerInput] = useState(currentTicker);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // 2. Logic to determine the correct WebSocket URL
    let wsUrl;
    if (BASE_URL) {
      // Replace http/https with ws/wss from the env variable
      wsUrl = BASE_URL.replace(/^http/, "ws") + "/ws";
    } else {
      // Fallback for local development
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      wsUrl = `${protocol}//${window.location.host}/ws`;
    }
    
    const connectWebSocket = () => {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setWsConnected(true);
        toast({
          title: "Connected",
          description: "Real-time data stream established",
        });
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          switch (message.type) {
            case "price_update":
              if (message.data.candles) {
                setCandlesticks(message.data.candles);
              }
              break;
            case "debate_message":
              addDebateMessage(message.data);
              break;
            case "cycle_status":
              setCycleState(message.data);
              break;
            case "trade_executed":
              addTrade(message.data);
              toast({
                title: `Trade Executed: ${message.data.action}`,
                description: `${message.data.ticker} @ $${message.data.price}`,
              });
              break;
          }
        } catch (error) {
          console.error("WebSocket message error:", error);
        }
      };

      ws.onclose = () => {
        setWsConnected(false);
        setTimeout(connectWebSocket, 3000);
      };

      ws.onerror = () => {
        ws.close();
      };
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // 3. Use the full BASE_URL for the initial fetch as well
        const url = BASE_URL 
          ? `${BASE_URL}/api/market/candles/${currentTicker}`
          : `/api/market/candles/${currentTicker}`;

        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          if (data.candles) {
            setCandlesticks(data.candles);
          }
        }
      } catch (error) {
        console.error("Failed to fetch initial candle data:", error);
      }
    };

    fetchInitialData();
  }, [currentTicker]);

  const handleTickerChange = () => {
    if (tickerInput && tickerInput !== currentTicker) {
      setCurrentTicker(tickerInput.toUpperCase());
      setCandlesticks([]);
    }
  };

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">AI Trading</h1>
          <Badge 
            variant={wsConnected ? "default" : "destructive"}
            className="flex items-center gap-1"
          >
            {wsConnected ? (
              <>
                <Wifi className="h-3 w-3" />
                Live
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3" />
                Offline
              </>
            )}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Enter ticker..."
              value={tickerInput}
              onChange={(e) => setTickerInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleTickerChange()}
              className="w-32 pl-9 font-mono uppercase"
              data-testid="input-ticker"
            />
          </div>
          <Button 
            variant="secondary" 
            onClick={handleTickerChange}
            data-testid="button-change-ticker"
          >
            <TrendingUp className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card className="flex-1 min-h-[400px] overflow-hidden" data-testid="card-chart">
        <CandlestickChart
          data={candlesticks}
          ticker={currentTicker}
          markers={[]}
        />
      </Card>

      <div className="grid h-[400px] gap-4 lg:grid-cols-3">
        <Card className="overflow-hidden lg:col-span-1" data-testid="card-debate-arena">
          <DebateArena />
        </Card>

        <Card className="overflow-hidden lg:col-span-1">
          <Tabs defaultValue="voting" className="h-full flex flex-col">
            <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent p-0">
              <TabsTrigger 
                value="voting" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Voting
              </TabsTrigger>
              <TabsTrigger 
                value="control"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Control
              </TabsTrigger>
            </TabsList>
            <TabsContent value="voting" className="flex-1 mt-0 overflow-auto">
              <VotingPanel />
            </TabsContent>
            <TabsContent value="control" className="flex-1 mt-0 overflow-auto">
              <ControlPanel />
            </TabsContent>
          </Tabs>
        </Card>

        <Card className="overflow-hidden lg:col-span-1" data-testid="card-control">
          <ControlPanel />
        </Card>
      </div>
    </div>
  );
}
