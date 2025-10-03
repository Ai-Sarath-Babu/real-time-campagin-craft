import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Activity, TrendingUp, Users, MousePointer, Target } from "lucide-react";

interface CampaignStat {
  campaign_id: string;
  clicks: number;
  pageviews: number;
  conversions: number;
  campaign: {
    name: string;
    utm_source: string;
  };
}

interface LiveEvent {
  id: string;
  event_type: string;
  campaign_id: string;
  created_at: string;
  visitor_id?: string;
  ip_address?: string;
  page_path?: string;
  element_text?: string;
  campaign: {
    name: string;
    utm_source: string;
  };
}

export const LiveDashboardData = () => {
  const [stats, setStats] = useState<CampaignStat[]>([]);
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchLiveEvents();
    subscribeToEvents();
  }, []);

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from("campaign_stats")
        .select(`
          campaign_id,
          clicks,
          pageviews,
          conversions,
          campaign:campaigns(name, utm_source)
        `)
        .eq("date", new Date().toISOString().split("T")[0])
        .order("clicks", { ascending: false })
        .limit(5);

      if (error) throw error;
      setStats(data || []);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLiveEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("tracking_events")
        .select(`
          id,
          event_type,
          campaign_id,
          created_at,
          visitor_id,
          ip_address,
          page_path,
          element_text,
          campaign:campaigns(name, utm_source)
        `)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setLiveEvents(data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const subscribeToEvents = () => {
    const channel = supabase
      .channel("tracking_events_changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "tracking_events",
        },
        (payload) => {
          console.log("New event:", payload);
          fetchLiveEvents();
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const getTotalStats = () => {
    return stats.reduce(
      (acc, stat) => ({
        clicks: acc.clicks + stat.clicks,
        conversions: acc.conversions + stat.conversions,
        pageviews: acc.pageviews + stat.pageviews,
      }),
      { clicks: 0, conversions: 0, pageviews: 0 }
    );
  };

  const totalStats = getTotalStats();
  const conversionRate = totalStats.clicks > 0 
    ? ((totalStats.conversions / totalStats.clicks) * 100).toFixed(1)
    : "0.0";

  const formatTimeAgo = (dateString: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Live Analytics</h2>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-sm text-muted-foreground">Real-time</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-6 space-y-2 border-border/50 bg-card/80">
          <div className="flex items-center justify-between">
            <Activity className="w-5 h-5 text-primary" />
            <Badge variant="secondary" className="bg-primary/10 text-primary">Today</Badge>
          </div>
          <div className="text-3xl font-bold">{totalStats.clicks}</div>
          <div className="text-sm text-muted-foreground">Total Clicks</div>
        </Card>

        <Card className="p-6 space-y-2 border-border/50 bg-card/80">
          <div className="flex items-center justify-between">
            <Target className="w-5 h-5 text-success" />
            <Badge variant="secondary" className="bg-success/10 text-success">
              {totalStats.conversions > 0 ? "+" : ""}
            </Badge>
          </div>
          <div className="text-3xl font-bold">{totalStats.conversions}</div>
          <div className="text-sm text-muted-foreground">Conversions</div>
        </Card>

        <Card className="p-6 space-y-2 border-border/50 bg-card/80">
          <div className="flex items-center justify-between">
            <Users className="w-5 h-5 text-accent" />
            <Badge variant="secondary" className="bg-accent/10 text-accent">Live</Badge>
          </div>
          <div className="text-3xl font-bold">{totalStats.pageviews}</div>
          <div className="text-sm text-muted-foreground">Page Views</div>
        </Card>

        <Card className="p-6 space-y-2 border-border/50 bg-card/80">
          <div className="flex items-center justify-between">
            <TrendingUp className="w-5 h-5 text-warning" />
            <Badge variant="secondary" className="bg-warning/10 text-warning">{conversionRate}%</Badge>
          </div>
          <div className="text-3xl font-bold">{conversionRate}%</div>
          <div className="text-sm text-muted-foreground">Conversion Rate</div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Campaign Performance */}
        <Card className="p-6 space-y-4 border-border/50 bg-card/80">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Top Campaigns</h3>
            <Badge variant="outline">Today</Badge>
          </div>
          {stats.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No campaign data yet. Create a campaign and start tracking!
            </div>
          ) : (
            <div className="space-y-3">
              {stats.map((stat, index) => (
                <div key={index} className="p-4 rounded-lg bg-muted/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">{stat.campaign?.name || "Unknown"}</div>
                    <Badge className="bg-success/10 text-success">
                      {stat.clicks > 0 ? `${((stat.conversions / stat.clicks) * 100).toFixed(1)}%` : "0%"}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Clicks</div>
                      <div className="font-semibold">{stat.clicks}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Views</div>
                      <div className="font-semibold">{stat.pageviews}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Conversions</div>
                      <div className="font-semibold">{stat.conversions}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Live Activity Feed */}
        <Card className="p-6 space-y-4 border-border/50 bg-card/80">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Live Activity</h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-sm text-muted-foreground">Real-time</span>
            </div>
          </div>
          {liveEvents.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No events yet. Events will appear here in real-time.
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {liveEvents.map((event) => (
                <div
                  key={event.id}
                  className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors animate-fade-in"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      event.event_type === "conversion" ? "bg-success/10" : "bg-primary/10"
                    }`}>
                      {event.event_type === "conversion" ? (
                        <Target className="w-4 h-4 text-success" />
                      ) : (
                        <MousePointer className="w-4 h-4 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium capitalize">{event.event_type}</span>
                        {event.visitor_id && (
                          <Badge variant="outline" className="text-xs">
                            ID: {event.visitor_id.substring(0, 10)}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground truncate">
                          {event.campaign?.utm_source || "Unknown"}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
                        {event.campaign?.name || "Unknown Campaign"}
                      </div>
                      {event.page_path && (
                        <div className="text-xs text-muted-foreground truncate">
                          📄 {event.page_path}
                        </div>
                      )}
                      {event.element_text && (
                        <div className="text-xs text-muted-foreground truncate">
                          🖱️ "{event.element_text}"
                        </div>
                      )}
                      {event.ip_address && event.ip_address !== 'Unknown' && (
                        <div className="text-xs text-muted-foreground">
                          🌍 {event.ip_address}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatTimeAgo(event.created_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
