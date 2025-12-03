import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useTradingStore } from "@/lib/store";
import { AGENT_NAMES, AGENT_COLORS, type AIAgentType } from "@shared/schema";
import { Bot, MessageSquare } from "lucide-react";

function getAgentInitials(agentType: AIAgentType): string {
  switch (agentType) {
    case "chatgpt":
      return "GP";
    case "gemini":
      return "GE";
    case "grok":
      return "GR";
    case "deepseek":
      return "DS";
    default:
      return "AI";
  }
}

export function DebateArena() {
  const { debateMessages } = useTradingStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [debateMessages]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border p-4">
        <MessageSquare className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Debate Arena</h3>
        <Badge variant="outline" className="ml-auto text-xs">
          {debateMessages.length} messages
        </Badge>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {debateMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 text-center">
            <Bot className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">AI agents are waiting</p>
            <p className="text-sm text-muted-foreground/70">
              Start a trading cycle to see the debate
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {debateMessages.map((message) => (
              <div
                key={message.id}
                className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300"
                data-testid={`debate-message-${message.id}`}
              >
                <Avatar
                  className="h-10 w-10 border-2"
                  style={{
                    borderColor:
                      AGENT_COLORS[message.agentType as AIAgentType],
                  }}
                >
                  <AvatarFallback
                    className="text-xs font-bold"
                    style={{
                      backgroundColor: `${
                        AGENT_COLORS[message.agentType as AIAgentType]
                      }20`,
                      color: AGENT_COLORS[message.agentType as AIAgentType],
                    }}
                  >
                    {getAgentInitials(message.agentType as AIAgentType)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="font-semibold"
                      style={{
                        color: AGENT_COLORS[message.agentType as AIAgentType],
                      }}
                    >
                      {AGENT_NAMES[message.agentType as AIAgentType]}
                    </span>
                    <Badge
                      variant="outline"
                      className="text-xs capitalize"
                      style={{
                        borderColor: `${
                          AGENT_COLORS[message.agentType as AIAgentType]
                        }50`,
                      }}
                    >
                      {message.messageType}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="rounded-lg border border-border bg-card/50 p-3">
                    <p className="text-sm leading-relaxed">{message.message}</p>
                    {message.ticker && (
                      <div className="mt-2 flex items-center gap-2">
                        <Badge className="bg-primary text-primary-foreground">
                          {message.ticker}
                        </Badge>
                      </div>
                    )}
                    {message.strategy && (
                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant="secondary">{message.strategy}</Badge>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
