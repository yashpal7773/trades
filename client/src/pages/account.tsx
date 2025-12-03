import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTradingStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { Wallet, Plus, RotateCcw, Key, Bot, Shield } from "lucide-react";
import { AGENT_NAMES, type AIAgentType } from "@shared/schema";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function Account() {
  const { user, setUser, portfolio, setPortfolio, settings, setSettings } = useTradingStore();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [apiKeys, setApiKeys] = useState({
    marketDataApiKey: settings.marketDataApiKey || "",
    openaiApiKey: settings.openaiApiKey || "",
    geminiApiKey: settings.geminiApiKey || "",
    grokApiKey: settings.grokApiKey || "",
    deepseekApiKey: settings.deepseekApiKey || "",
  });

  const handleTopUp = (amount: number) => {
    if (user && portfolio) {
      const newBalance = (user.paperBalance || 0) + amount;
      setUser({ ...user, paperBalance: newBalance });
      setPortfolio({
        ...portfolio,
        cashBalance: portfolio.cashBalance + amount,
        totalValue: portfolio.totalValue + amount,
      });
      toast({
        title: "Balance Updated",
        description: `Added ${formatCurrency(amount)} to your paper trading balance.`,
      });
    }
    setIsDialogOpen(false);
  };

  const handleReset = () => {
    if (user && portfolio) {
      setUser({ ...user, paperBalance: 100000 });
      setPortfolio({
        ...portfolio,
        cashBalance: 100000,
        totalValue: 100000,
        todayPnL: 0,
        todayPnLPercent: 0,
        lifetimePnL: 0,
        lifetimePnLPercent: 0,
        positions: [],
      });
      toast({
        title: "Balance Reset",
        description: "Your paper trading balance has been reset to $100,000.",
      });
    }
    setIsDialogOpen(false);
  };

  const handleSaveApiKeys = () => {
    setSettings({
      ...settings,
      ...apiKeys,
    });
    toast({
      title: "API Keys Saved",
      description: "Your API keys have been saved successfully.",
    });
  };

  const agentConfigs: { key: keyof typeof apiKeys; agent: AIAgentType; color: string }[] = [
    { key: "openaiApiKey", agent: "chatgpt", color: "#10A37F" },
    { key: "geminiApiKey", agent: "gemini", color: "#8E75B2" },
    { key: "grokApiKey", agent: "grok", color: "#1DA1F2" },
    { key: "deepseekApiKey", agent: "deepseek", color: "#FF6B35" },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Account</h1>
        <Badge variant="outline" className="text-sm">
          Settings
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card data-testid="card-paper-balance">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Paper Trading Balance
            </CardTitle>
            <CardDescription>
              Manage your virtual trading funds
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card/50 p-8">
              <span className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
                Current Balance
              </span>
              <span className="text-4xl font-bold font-mono text-primary">
                {formatCurrency(user?.paperBalance || 100000)}
              </span>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="w-full" 
                  size="lg"
                  data-testid="button-add-money"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Paper Money
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Paper Money</DialogTitle>
                  <DialogDescription>
                    Add virtual funds to your paper trading account
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <Button
                    variant="outline"
                    onClick={() => handleTopUp(10000)}
                    className="justify-between"
                    data-testid="button-topup-10k"
                  >
                    <span>Top Up</span>
                    <span className="font-mono font-bold">+$10,000</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleTopUp(50000)}
                    className="justify-between"
                    data-testid="button-topup-50k"
                  >
                    <span>Top Up</span>
                    <span className="font-mono font-bold">+$50,000</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleTopUp(100000)}
                    className="justify-between"
                    data-testid="button-topup-100k"
                  >
                    <span>Top Up</span>
                    <span className="font-mono font-bold">+$100,000</span>
                  </Button>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-popover px-2 text-muted-foreground">or</span>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={handleReset}
                    data-testid="button-reset-balance"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reset to $100,000
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        <Card data-testid="card-market-api">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Market Data API
            </CardTitle>
            <CardDescription>
              Configure your market data provider
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="marketApiKey">Alpha Vantage API Key</Label>
              <div className="flex gap-2">
                <Input
                  id="marketApiKey"
                  type="password"
                  placeholder="Enter your API key"
                  value={apiKeys.marketDataApiKey}
                  onChange={(e) =>
                    setApiKeys({ ...apiKeys, marketDataApiKey: e.target.value })
                  }
                  data-testid="input-market-api-key"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Get a free API key at{" "}
                <a
                  href="https://www.alphavantage.co/support/#api-key"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  alphavantage.co
                </a>
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-border bg-primary/10 p-3">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                API keys are stored securely and never shared
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-ai-api-keys">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Agent API Keys
          </CardTitle>
          <CardDescription>
            Configure API keys for each AI trading agent
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {agentConfigs.map(({ key, agent, color }) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={key} className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  {AGENT_NAMES[agent]} API Key
                </Label>
                <Input
                  id={key}
                  type="password"
                  placeholder={`Enter ${AGENT_NAMES[agent]} API key`}
                  value={apiKeys[key]}
                  onChange={(e) =>
                    setApiKeys({ ...apiKeys, [key]: e.target.value })
                  }
                  data-testid={`input-${agent}-api-key`}
                />
              </div>
            ))}
          </div>

          <Button 
            onClick={handleSaveApiKeys} 
            className="w-full"
            data-testid="button-save-api-keys"
          >
            Save API Keys
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
