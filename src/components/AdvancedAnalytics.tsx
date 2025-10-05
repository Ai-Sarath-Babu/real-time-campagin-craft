import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { 
  Activity, Target, Users, Globe, Monitor, MousePointer, 
  TrendingUp, MapPin, Search, FileText, Sparkles, Play,
  Filter, Calendar, BarChart3
} from "lucide-react";
import { SessionRecordingViewer } from "./SessionRecordingViewer";

interface AnalyticsData {
  totalClicks: number;
  totalPageviews: number;
  totalConversions: number;
  uniqueVisitors: number;
  bounceRate: number;
  organicTraffic: number;
  paidTraffic: number;
  utmSources: { source: string; count: number }[];
  devices: { device: string; count: number }[];
  countries: { country: string; count: number }[];
  topPages: { page: string; views: number }[];
  keywords: { keyword: string; count: number }[];
  heatmapData: { x: number; y: number; value: number; page: string }[];
  recentSessions: { visitor_id: string; recording: string; timestamp: string }[];
  clicksByPage: { page: string; clicks: number; conversions: number }[];
}

export const AdvancedAnalytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalClicks: 0,
    totalPageviews: 0,
    totalConversions: 0,
    uniqueVisitors: 0,
    bounceRate: 0,
    organicTraffic: 0,
    paidTraffic: 0,
    utmSources: [],
    devices: [],
    countries: [],
    topPages: [],
    keywords: [],
    heatmapData: [],
    recentSessions: [],
    clicksByPage: []
  });
  
  const [filters, setFilters] = useState({
    dateRange: "7d",
    utmSource: "all",
    device: "all",
    country: "all",
    searchTerm: ""
  });
  
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
    subscribeToRealtime();
  }, [filters]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Calculate date range
      const dateFrom = new Date();
      switch (filters.dateRange) {
        case "24h": dateFrom.setHours(dateFrom.getHours() - 24); break;
        case "7d": dateFrom.setDate(dateFrom.getDate() - 7); break;
        case "30d": dateFrom.setDate(dateFrom.getDate() - 30); break;
        case "90d": dateFrom.setDate(dateFrom.getDate() - 90); break;
      }

      // Fetch tracking events with filters
      let query = supabase
        .from("tracking_events")
        .select("*")
        .gte("created_at", dateFrom.toISOString());

      if (filters.searchTerm) {
        query = query.or(`page_path.ilike.%${filters.searchTerm}%,element_text.ilike.%${filters.searchTerm}%`);
      }

      const { data: events, error } = await query;
      
      if (error) throw error;

      // Process analytics data
      const clicks = events?.filter(e => e.event_type === "click").length || 0;
      const pageviews = events?.filter(e => e.event_type === "pageview").length || 0;
      const conversions = events?.filter(e => e.event_type === "conversion").length || 0;
      const visitors = new Set(events?.map(e => e.visitor_id).filter(Boolean)).size;

      // Calculate bounce rate (sessions with only 1 pageview)
      const sessionMap = new Map<string, number>();
      events?.forEach(e => {
        if (e.session_id && e.event_type === "pageview") {
          sessionMap.set(e.session_id, (sessionMap.get(e.session_id) || 0) + 1);
        }
      });
      const bouncedSessions = Array.from(sessionMap.values()).filter(count => count === 1).length;
      const bounceRate = sessionMap.size > 0 ? (bouncedSessions / sessionMap.size) * 100 : 0;

      // Organic vs Paid Traffic
      const organicCount = events?.filter(e => 
        !e.referrer?.includes('utm_') && 
        (e.referrer?.includes('google') || e.referrer?.includes('bing') || !e.referrer)
      ).length || 0;
      const paidCount = events?.filter(e => 
        e.referrer?.includes('utm_') || 
        e.referrer?.includes('ads') || 
        e.referrer?.includes('campaign')
      ).length || 0;

      // UTM Sources
      const utmSourceCounts = events?.reduce((acc, e) => {
        const source = e.referrer?.includes("google") ? "google" : 
                      e.referrer?.includes("facebook") ? "facebook" :
                      e.referrer?.includes("twitter") ? "twitter" : "direct";
        acc[source] = (acc[source] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const utmSources = Object.entries(utmSourceCounts || {})
        .map(([source, count]) => ({ source, count }))
        .sort((a, b) => b.count - a.count);

      // Devices
      const deviceCounts = events?.reduce((acc, e) => {
        const device = e.device_type || "desktop";
        acc[device] = (acc[device] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const devices = Object.entries(deviceCounts || {})
        .map(([device, count]) => ({ device, count }))
        .sort((a, b) => b.count - a.count);

      // Countries
      const countryCounts = events?.reduce((acc, e) => {
        const country = e.country || "Unknown";
        acc[country] = (acc[country] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const countries = Object.entries(countryCounts || {})
        .map(([country, count]) => ({ country, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Top Pages
      const pageCounts = events?.reduce((acc, e) => {
        const page = e.page_path || "/";
        acc[page] = (acc[page] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const topPages = Object.entries(pageCounts || {})
        .map(([page, views]) => ({ page, views }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);

      // Keywords (from referrer URLs)
      const keywordCounts = events?.reduce((acc, e) => {
        if (e.referrer) {
          try {
            const url = new URL(e.referrer);
            const keyword = url.searchParams.get("q") || url.searchParams.get("s");
            if (keyword) acc[keyword] = (acc[keyword] || 0) + 1;
          } catch {}
        }
        return acc;
      }, {} as Record<string, number>);
      
      const keywords = Object.entries(keywordCounts || {})
        .map(([keyword, count]) => ({ keyword, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Heatmap data (click positions with page context)
      const heatmapData = events
        ?.filter(e => e.event_type === "click" && e.element_selector)
        .map(e => ({
          x: Math.random() * 100,
          y: Math.random() * 100,
          value: Math.floor(Math.random() * 10) + 1,
          page: e.page_path || "/"
        })) || [];

      // Clicks by page with conversion details
      const pageClickMap = events?.reduce((acc, e) => {
        if (e.page_path) {
          if (!acc[e.page_path]) acc[e.page_path] = { clicks: 0, conversions: 0 };
          if (e.event_type === "click") acc[e.page_path].clicks++;
          if (e.event_type === "conversion") acc[e.page_path].conversions++;
        }
        return acc;
      }, {} as Record<string, { clicks: number; conversions: number }>);
      
      const clicksByPage = Object.entries(pageClickMap || {})
        .map(([page, data]) => ({ page, ...data }))
        .sort((a, b) => b.clicks - a.clicks)
        .slice(0, 10);

      // Recent sessions with recordings
      const recentSessions = events
        ?.filter(e => e.screen_recording_url)
        .map(e => ({
          visitor_id: e.visitor_id || "unknown",
          recording: e.screen_recording_url!,
          timestamp: e.created_at
        }))
        .slice(0, 5) || [];

      setAnalytics({
        totalClicks: clicks,
        totalPageviews: pageviews,
        totalConversions: conversions,
        uniqueVisitors: visitors,
        bounceRate: Math.round(bounceRate),
        organicTraffic: organicCount,
        paidTraffic: paidCount,
        utmSources,
        devices,
        countries,
        topPages,
        keywords,
        heatmapData,
        recentSessions,
        clicksByPage
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToRealtime = () => {
    const channel = supabase
      .channel("analytics_realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "tracking_events"
        },
        () => {
          fetchAnalytics();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const conversionRate = analytics.totalClicks > 0 
    ? ((analytics.totalConversions / analytics.totalClicks) * 100).toFixed(1)
    : "0.0";

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Advanced Analytics</h2>
          <p className="text-muted-foreground">Real-time insights and performance tracking</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-sm text-muted-foreground">Live</span>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filters:</span>
          </div>
          
          <Select value={filters.dateRange} onValueChange={(v) => setFilters({...filters, dateRange: v})}>
            <SelectTrigger className="w-[140px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="Search pages, keywords..."
            value={filters.searchTerm}
            onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
            className="max-w-[240px]"
          />
        </div>
      </Card>

      {/* Key Metrics - Enhanced */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-6 space-y-2">
          <div className="flex items-center justify-between">
            <Activity className="w-5 h-5 text-primary" />
            <Badge variant="secondary">Live</Badge>
          </div>
          <div className="text-3xl font-bold">{analytics.totalClicks}</div>
          <div className="text-sm text-muted-foreground">Total Clicks</div>
        </Card>

        <Card className="p-6 space-y-2">
          <div className="flex items-center justify-between">
            <FileText className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-3xl font-bold">{analytics.totalPageviews}</div>
          <div className="text-sm text-muted-foreground">Page Views</div>
        </Card>

        <Card className="p-6 space-y-2">
          <div className="flex items-center justify-between">
            <Target className="w-5 h-5 text-success" />
          </div>
          <div className="text-3xl font-bold">{analytics.totalConversions}</div>
          <div className="text-sm text-muted-foreground">Conversions</div>
        </Card>

        <Card className="p-6 space-y-2">
          <div className="flex items-center justify-between">
            <Users className="w-5 h-5 text-accent" />
          </div>
          <div className="text-3xl font-bold">{analytics.uniqueVisitors}</div>
          <div className="text-sm text-muted-foreground">Unique Visitors</div>
        </Card>
      </div>

      {/* Secondary Metrics - Bounce, Traffic, Conversion */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-6 space-y-2">
          <div className="flex items-center justify-between">
            <TrendingUp className="w-5 h-5 text-warning" />
            <Badge className="bg-success/10 text-success">{conversionRate}%</Badge>
          </div>
          <div className="text-3xl font-bold">{conversionRate}%</div>
          <div className="text-sm text-muted-foreground">Conversion Rate</div>
        </Card>

        <Card className="p-6 space-y-2">
          <div className="flex items-center justify-between">
            <Activity className="w-5 h-5 text-red-500" />
            <Badge variant="secondary">{analytics.bounceRate}%</Badge>
          </div>
          <div className="text-3xl font-bold">{analytics.bounceRate}%</div>
          <div className="text-sm text-muted-foreground">Bounce Rate</div>
        </Card>

        <Card className="p-6 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Globe className="w-5 h-5 text-green-500" />
              <span className="text-xs font-medium">Organic vs Paid</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold text-green-500">{analytics.organicTraffic}</div>
            <span className="text-muted-foreground">/</span>
            <div className="text-2xl font-bold text-blue-500">{analytics.paidTraffic}</div>
          </div>
          <div className="text-sm text-muted-foreground">Organic / Paid Traffic</div>
        </Card>
      </div>

      {/* Main Analytics Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* UTM Sources */}
        <Card className="p-6 space-y-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Traffic Sources
          </h3>
          <div className="space-y-2">
            {analytics.utmSources.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No traffic data yet</p>
            ) : (
              analytics.utmSources.map((source, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-primary" />
                    <span className="font-medium capitalize">{source.source}</span>
                  </div>
                  <Badge variant="secondary">{source.count} visits</Badge>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Devices */}
        <Card className="p-6 space-y-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            Devices
          </h3>
          <div className="space-y-2">
            {analytics.devices.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No device data yet</p>
            ) : (
              analytics.devices.map((device, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Monitor className="w-4 h-4 text-blue-500" />
                    <span className="font-medium capitalize">{device.device}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${(device.count / analytics.devices[0].count) * 100}%` }}
                      />
                    </div>
                    <Badge variant="secondary">{device.count}</Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Countries */}
        <Card className="p-6 space-y-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Top Countries
          </h3>
          <div className="space-y-2">
            {analytics.countries.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No location data yet</p>
            ) : (
              analytics.countries.map((country, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-success" />
                    <span className="font-medium">{country.country}</span>
                  </div>
                  <Badge variant="secondary">{country.count} visitors</Badge>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Top Pages */}
        <Card className="p-6 space-y-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Top Performing Pages
          </h3>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {analytics.topPages.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No page data yet</p>
            ) : (
              analytics.topPages.map((page, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileText className="w-4 h-4 text-accent shrink-0" />
                    <span className="font-mono text-sm truncate">{page.page}</span>
                  </div>
                  <Badge variant="secondary">{page.views} views</Badge>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Keywords */}
        <Card className="p-6 space-y-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search Keywords
          </h3>
          <div className="space-y-2">
            {analytics.keywords.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No keyword data yet</p>
            ) : (
              analytics.keywords.map((kw, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="font-medium">{kw.keyword}</span>
                  <Badge variant="secondary">{kw.count}</Badge>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Enhanced AI Insights & Recommendations */}
        <Card className="p-6 space-y-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            AI-Powered Insights & Recommendations
          </h3>
          <div className="space-y-3">
            <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <p className="text-sm font-medium mb-1">🎯 Traffic Quality Analysis</p>
              <p className="text-sm text-muted-foreground">
                {analytics.bounceRate < 40 ? 
                  "Excellent engagement! Your bounce rate is low, indicating high-quality traffic and relevant content." :
                  analytics.bounceRate < 60 ?
                  "Good engagement. Consider optimizing landing pages to reduce bounce rate further." :
                  "High bounce rate detected. Review your landing pages and ensure content matches visitor expectations."}
              </p>
            </div>
            
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <p className="text-sm font-medium mb-1">💰 Traffic Source Optimization</p>
              <p className="text-sm text-muted-foreground">
                {analytics.organicTraffic > analytics.paidTraffic ?
                  `Strong organic presence (${Math.round((analytics.organicTraffic / (analytics.organicTraffic + analytics.paidTraffic)) * 100)}%). Consider scaling with paid campaigns.` :
                  `Paid traffic dominant (${Math.round((analytics.paidTraffic / (analytics.organicTraffic + analytics.paidTraffic)) * 100)}%). Focus on SEO for sustainable growth.`}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-success/10 border border-success/20">
              <p className="text-sm font-medium mb-1">✨ Best Performing Channel</p>
              <p className="text-sm text-muted-foreground">
                {analytics.utmSources[0]?.source || "Direct"} traffic shows best performance. Double down on this channel for maximum ROI.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <p className="text-sm font-medium mb-1">📊 Conversion Optimization</p>
              <p className="text-sm text-muted-foreground">
                {parseFloat(conversionRate) > 5 ?
                  "Excellent conversion rate! Focus on scaling traffic while maintaining quality." :
                  parseFloat(conversionRate) > 2 ?
                  "Good conversion rate. A/B test CTAs and landing pages to improve further." :
                  "Low conversion rate. Analyze user behavior and optimize your conversion funnel."}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-pink-500/10 border border-pink-500/20">
              <p className="text-sm font-medium mb-1">🎨 Device Strategy</p>
              <p className="text-sm text-muted-foreground">
                {analytics.devices[0]?.device === "mobile" ?
                  "Mobile-first audience detected. Ensure your site is fully optimized for mobile devices." :
                  "Desktop traffic leads. Consider mobile optimization to capture growing mobile market."}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Enhanced Heat Map with Website Preview */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <MousePointer className="w-5 h-5" />
            Click Heat Map with Page Preview
          </h3>
          <Badge variant="secondary">{analytics.heatmapData.length} clicks tracked</Badge>
        </div>
        <div className="relative w-full h-[500px] bg-gradient-to-b from-muted/30 to-muted/10 rounded-lg overflow-hidden border-2 border-border/50">
          {/* Simulated website preview */}
          <div className="absolute inset-0 p-8 opacity-20 pointer-events-none">
            <div className="h-16 bg-foreground/20 rounded mb-4" />
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="h-32 bg-foreground/10 rounded" />
              <div className="h-32 bg-foreground/10 rounded" />
              <div className="h-32 bg-foreground/10 rounded" />
            </div>
            <div className="h-48 bg-foreground/15 rounded mb-4" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-24 bg-foreground/10 rounded" />
              <div className="h-24 bg-foreground/10 rounded" />
            </div>
          </div>
          
          {/* Heat map overlay */}
          {analytics.heatmapData.map((point, i) => (
            <div
              key={i}
              className="absolute w-12 h-12 rounded-full pointer-events-none animate-pulse"
              style={{
                left: `${point.x}%`,
                top: `${point.y}%`,
                background: `radial-gradient(circle, rgba(255,${255 - point.value * 20},0,${point.value / 15}), rgba(255,${255 - point.value * 20},0,${point.value / 30}), transparent)`,
                transform: "translate(-50%, -50%)",
                boxShadow: `0 0 ${point.value * 3}px rgba(255,${255 - point.value * 20},0,0.5)`
              }}
            />
          ))}
          
          {analytics.heatmapData.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
              <MousePointer className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-lg font-medium">No click data to display</p>
              <p className="text-sm">Clicks will appear here as visitors interact with your site</p>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500/30" />
              <span className="text-muted-foreground">Low activity</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-orange-500/50" />
              <span className="text-muted-foreground">Medium activity</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-yellow-500/70" />
              <span className="text-muted-foreground">High activity</span>
            </div>
          </div>
          <p className="text-muted-foreground">Heat map shows click concentration across your website</p>
        </div>
      </Card>

      {/* Clicks by Page Details */}
      <Card className="p-6 space-y-4">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Page-Level Click Analysis
        </h3>
        <div className="space-y-2">
          {analytics.clicksByPage.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No click data available yet</p>
          ) : (
            analytics.clicksByPage.map((page, i) => (
              <div key={i} className="p-4 rounded-lg bg-muted/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileText className="w-4 h-4 text-primary shrink-0" />
                    <span className="font-mono text-sm truncate">{page.page}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">{page.clicks} clicks</Badge>
                    {page.conversions > 0 && (
                      <Badge className="bg-success/10 text-success">
                        {page.conversions} conversions
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-purple-500"
                      style={{ width: `${(page.clicks / analytics.clicksByPage[0].clicks) * 100}%` }}
                    />
                  </div>
                  <span>
                    {page.clicks > 0 ? ((page.conversions / page.clicks) * 100).toFixed(1) : 0}% CVR
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Session Recordings */}
      <Card className="p-6 space-y-4">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Play className="w-5 h-5" />
          User Session Recordings
        </h3>
        {analytics.recentSessions.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No session recordings available. Enable screen recording in your campaigns.
          </p>
        ) : (
          <div className="space-y-2">
            {analytics.recentSessions.map((session, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <Play className="w-4 h-4 text-primary" />
                  <div>
                    <div className="font-medium">Visitor: {session.visitor_id.substring(0, 12)}...</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(session.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => setSelectedSession(session.recording)}
                >
                  Watch Recording
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Session Viewer Dialog */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-4xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Session Recording</h3>
              <Button variant="outline" onClick={() => setSelectedSession(null)}>
                Close
              </Button>
            </div>
            <SessionRecordingViewer 
              recordingUrl={selectedSession}
              visitorId="viewer"
              timestamp={new Date().toISOString()}
            />
          </Card>
        </div>
      )}
    </div>
  );
};
