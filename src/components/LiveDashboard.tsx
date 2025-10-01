import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, TrendingUp, Users, MousePointer, Eye, Target } from "lucide-react";

const realtimeData = [
  { source: "Google Ads", clicks: 1247, conversions: 89, rate: "7.1%", trend: "+12%" },
  { source: "Facebook", clicks: 892, conversions: 56, rate: "6.3%", trend: "+8%" },
  { source: "Email Campaign", clicks: 654, conversions: 123, rate: "18.8%", trend: "+24%" },
  { source: "Twitter", clicks: 432, conversions: 28, rate: "6.5%", trend: "+5%" },
];

const liveEvents = [
  { type: "click", source: "Google Ads", campaign: "summer_sale_2024", time: "2s ago" },
  { type: "conversion", source: "Email", campaign: "newsletter_q1", time: "5s ago" },
  { type: "click", source: "Facebook", campaign: "product_launch", time: "8s ago" },
  { type: "click", source: "Twitter", campaign: "brand_awareness", time: "12s ago" },
  { type: "conversion", source: "Google Ads", campaign: "summer_sale_2024", time: "15s ago" },
];

export const LiveDashboard = () => {
  return (
    <section className="py-24 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-sm font-medium text-success">Live Dashboard</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold">
            Watch Your Campaigns <span className="text-gradient">In Real-Time</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Every click, conversion, and visitor tracked instantly
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 space-y-2 border-border/50 bg-card/80">
            <div className="flex items-center justify-between">
              <Activity className="w-5 h-5 text-primary" />
              <Badge variant="secondary" className="bg-primary/10 text-primary">Live</Badge>
            </div>
            <div className="text-3xl font-bold">3,225</div>
            <div className="text-sm text-muted-foreground">Total Clicks Today</div>
          </Card>

          <Card className="p-6 space-y-2 border-border/50 bg-card/80">
            <div className="flex items-center justify-between">
              <Target className="w-5 h-5 text-success" />
              <Badge variant="secondary" className="bg-success/10 text-success">+18%</Badge>
            </div>
            <div className="text-3xl font-bold">296</div>
            <div className="text-sm text-muted-foreground">Conversions</div>
          </Card>

          <Card className="p-6 space-y-2 border-border/50 bg-card/80">
            <div className="flex items-center justify-between">
              <Users className="w-5 h-5 text-accent" />
              <Badge variant="secondary" className="bg-accent/10 text-accent">+24</Badge>
            </div>
            <div className="text-3xl font-bold">847</div>
            <div className="text-sm text-muted-foreground">Active Visitors</div>
          </Card>

          <Card className="p-6 space-y-2 border-border/50 bg-card/80">
            <div className="flex items-center justify-between">
              <TrendingUp className="w-5 h-5 text-warning" />
              <Badge variant="secondary" className="bg-warning/10 text-warning">9.2%</Badge>
            </div>
            <div className="text-3xl font-bold">9.2%</div>
            <div className="text-sm text-muted-foreground">Avg Conversion Rate</div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Campaign Performance */}
          <Card className="p-6 space-y-4 border-border/50 bg-card/80">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Campaign Performance</h3>
              <Badge variant="outline">Live Updates</Badge>
            </div>
            <div className="space-y-3">
              {realtimeData.map((item, index) => (
                <div key={index} className="p-4 rounded-lg bg-muted/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">{item.source}</div>
                    <Badge className="bg-success/10 text-success">{item.trend}</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Clicks</div>
                      <div className="font-semibold">{item.clicks}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Conversions</div>
                      <div className="font-semibold">{item.conversions}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Rate</div>
                      <div className="font-semibold">{item.rate}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
            <div className="space-y-2">
              {liveEvents.map((event, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg bg-muted/30 flex items-start gap-3 animate-fade-in"
                >
                  <div className={`p-2 rounded-lg ${
                    event.type === "conversion" ? "bg-success/10" : "bg-primary/10"
                  }`}>
                    {event.type === "conversion" ? (
                      <Target className="w-4 h-4 text-success" />
                    ) : (
                      <MousePointer className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium capitalize">{event.type}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground truncate">{event.source}</span>
                    </div>
                    <div className="text-sm text-muted-foreground truncate">{event.campaign}</div>
                  </div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap">{event.time}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};
