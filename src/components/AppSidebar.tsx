import { NavLink, useLocation } from "react-router-dom";
import { 
  LinkIcon, 
  BarChart3, 
  Activity, 
  Users, 
  TrendingUp,
  Plus,
  Globe
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UtmBuilderForm } from "./UtmBuilderForm";

const menuItems = [
  { 
    title: "UTM Builder", 
    url: "/dashboard/builder", 
    icon: LinkIcon,
    description: "Create campaign URLs"
  },
  { 
    title: "Campaigns", 
    url: "/dashboard/campaigns", 
    icon: Globe,
    description: "Manage all campaigns"
  },
  { 
    title: "Live Analytics", 
    url: "/dashboard/analytics", 
    icon: Activity,
    description: "Real-time tracking"
  },
  { 
    title: "Advanced Analytics", 
    url: "/dashboard/advanced", 
    icon: TrendingUp,
    description: "Deep insights"
  },
  { 
    title: "User Behavior", 
    url: "/dashboard/behavior", 
    icon: Users,
    description: "Visitor analysis"
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const currentPath = location.pathname;
  
  const collapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path;

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 transition-colors ${
      isActive 
        ? "bg-primary/10 text-primary font-semibold border-l-4 border-primary" 
        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
    }`;

  return (
    <Sidebar
      className="border-r border-border"
      collapsible="icon"
    >
      <SidebarContent>
        <div className="p-4 border-b border-border">
          {!collapsed && (
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-6 h-6 text-primary" />
              <h2 className="text-lg font-bold">Campaign Craft</h2>
            </div>
          )}
          
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="w-full gap-2 bg-gradient-to-r from-primary to-primary/80"
                size={collapsed ? "icon" : "default"}
              >
                <Plus className="w-4 h-4" />
                {!collapsed && "New Campaign"}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Campaign</DialogTitle>
              </DialogHeader>
              <UtmBuilderForm />
            </DialogContent>
          </Dialog>
        </div>

        <SidebarGroup className="px-2 py-4">
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Analytics
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="p-0">
                    <NavLink 
                      to={item.url} 
                      end 
                      className={getNavCls}
                    >
                      <div className={`flex items-center gap-3 px-3 py-2.5 w-full ${
                        collapsed ? "justify-center" : ""
                      }`}>
                        <item.icon className="w-5 h-5 shrink-0" />
                        {!collapsed && (
                          <div className="flex flex-col items-start">
                            <span className="text-sm">{item.title}</span>
                            <span className="text-xs opacity-70">{item.description}</span>
                          </div>
                        )}
                      </div>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <div className="p-2 border-t border-border">
        <SidebarTrigger className="w-full" />
      </div>
    </Sidebar>
  );
}
