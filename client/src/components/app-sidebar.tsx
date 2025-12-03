import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Briefcase, 
  User, 
  LineChart, 
  Bot,
  Zap
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { useTradingStore } from "@/lib/store";

const navigationItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Portfolio", url: "/portfolio", icon: Briefcase },
  { title: "Account", url: "/account", icon: User },
  { title: "Graphs", url: "/graphs", icon: LineChart },
  { title: "AI Trading", url: "/trading", icon: Bot },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { wsConnected, cycleState } = useTradingStore();

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Zap className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-sidebar-foreground">
              AI Trading Arena
            </span>
            <span className="text-xs text-muted-foreground">
              Multi-Agent Battle
            </span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      className={isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""}
                      data-testid={`nav-${item.title.toLowerCase().replace(" ", "-")}`}
                    >
                      <Link href={item.url}>
                        <item.icon className={isActive ? "text-primary" : ""} />
                        <span>{item.title}</span>
                        {item.title === "AI Trading" && cycleState.status !== "idle" && (
                          <Badge 
                            variant="default" 
                            className="ml-auto h-5 animate-pulse bg-primary text-primary-foreground"
                          >
                            Live
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-2">
          <div 
            className={`h-2 w-2 rounded-full ${wsConnected ? "bg-profit animate-pulse" : "bg-loss"}`} 
          />
          <span className="text-xs text-muted-foreground">
            {wsConnected ? "Connected" : "Disconnected"}
          </span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
