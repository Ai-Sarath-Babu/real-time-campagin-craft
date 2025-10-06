import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { 
  User, Clock, MousePointer, Target, TrendingUp, 
  MapPin, Monitor, Eye, ChevronRight, Brain, Heart
} from "lucide-react";

interface UserProfile {
  visitor_id: string;
  total_sessions: number;
  total_clicks: number;
  total_pageviews: number;
  conversions: number;
  avg_session_duration: number;
  last_seen: string;
  devices: string[];
  countries: string[];
  top_pages: string[];
  behavior_pattern: string;
  engagement_score: number;
  conversion_likelihood: number;
}

export const UserBehaviorAnalysis = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    fetchUserProfiles();
    
    // Real-time updates
    const channel = supabase
      .channel('user-behavior-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'tracking_events'
        },
        () => {
          fetchUserProfiles();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchUserProfiles = async () => {
    try {
      setLoading(true);
      const { data: events, error } = await supabase
        .from("tracking_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1000);

      if (error) throw error;

      // Group events by visitor_id
      const userMap = new Map<string, any>();
      
      events?.forEach(event => {
        const vid = event.visitor_id || "unknown";
        if (!userMap.has(vid)) {
          userMap.set(vid, {
            visitor_id: vid,
            sessions: new Set(),
            clicks: 0,
            pageviews: 0,
            conversions: 0,
            devices: new Set(),
            countries: new Set(),
            pages: new Set(),
            timestamps: [],
          });
        }
        
        const user = userMap.get(vid);
        if (event.session_id) user.sessions.add(event.session_id);
        if (event.event_type === "click") user.clicks++;
        if (event.event_type === "pageview") user.pageviews++;
        if (event.event_type === "conversion") user.conversions++;
        if (event.device_type) user.devices.add(event.device_type);
        if (event.country) user.countries.add(event.country);
        if (event.page_path) user.pages.add(event.page_path);
        user.timestamps.push(new Date(event.created_at).getTime());
      });

      // Calculate profiles
      const profiles: UserProfile[] = Array.from(userMap.values()).map(user => {
        const timestamps = user.timestamps.sort((a: number, b: number) => a - b);
        const sessionDuration = timestamps.length > 1 
          ? (timestamps[timestamps.length - 1] - timestamps[0]) / 1000 / 60 
          : 0;

        const engagementScore = Math.min(100, 
          (user.clicks * 10) + 
          (user.pageviews * 5) + 
          (user.conversions * 50) + 
          (user.sessions.size * 15)
        );

        const conversionLikelihood = user.conversions > 0 ? 85 : 
          user.clicks > 5 ? 60 :
          user.pageviews > 3 ? 40 : 20;

        const behaviorPattern = 
          user.conversions > 0 ? "Converted Customer" :
          user.clicks > 10 ? "Highly Engaged" :
          user.pageviews > 5 ? "Active Browser" :
          user.sessions.size > 2 ? "Returning Visitor" : "New Visitor";

        return {
          visitor_id: user.visitor_id,
          total_sessions: user.sessions.size,
          total_clicks: user.clicks,
          total_pageviews: user.pageviews,
          conversions: user.conversions,
          avg_session_duration: sessionDuration / user.sessions.size || 0,
          last_seen: new Date(Math.max(...timestamps)).toISOString(),
          devices: Array.from(user.devices),
          countries: Array.from(user.countries),
          top_pages: Array.from(user.pages).slice(0, 3) as string[],
          behavior_pattern: behaviorPattern,
          engagement_score: Math.round(engagementScore),
          conversion_likelihood: conversionLikelihood,
        };
      });

      setUsers(profiles.sort((a, b) => b.engagement_score - a.engagement_score).slice(0, 20));
    } catch (error) {
      console.error("Error fetching user profiles:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-500" />
            User Behavior Intelligence
          </h2>
          <p className="text-muted-foreground">Deep insights into visitor psychology and conversion patterns</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* User List */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-lg font-semibold">Top Visitors</h3>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {users.map((user, i) => (
              <Card 
                key={i} 
                className="p-4 cursor-pointer hover:border-primary transition-all"
                onClick={() => setSelectedUser(user)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-gradient-to-br from-primary to-purple-500 text-white">
                        {user.visitor_id.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-sm">
                        Visitor {user.visitor_id.substring(0, 8)}...
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {user.behavior_pattern}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    Score: {user.engagement_score}
                  </Badge>
                  <Badge 
                    className="text-xs"
                    style={{
                      background: user.conversion_likelihood > 60 ? 'hsl(var(--success))' : 
                                 user.conversion_likelihood > 40 ? 'hsl(var(--warning))' : 
                                 'hsl(var(--muted))'
                    }}
                  >
                    {user.conversion_likelihood}% convert
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Detailed User Profile */}
        <div className="lg:col-span-2">
          {selectedUser ? (
            <div className="space-y-4">
              <Card className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-purple-500 text-white text-xl">
                        {selectedUser.visitor_id.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-bold">Visitor {selectedUser.visitor_id.substring(0, 12)}...</h3>
                      <p className="text-muted-foreground">{selectedUser.behavior_pattern}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" />
                        Last seen: {new Date(selectedUser.last_seen).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary">{selectedUser.engagement_score}</div>
                    <div className="text-sm text-muted-foreground">Engagement Score</div>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <Eye className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                    <div className="text-2xl font-bold">{selectedUser.total_pageviews}</div>
                    <div className="text-xs text-muted-foreground">Page Views</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <MousePointer className="w-5 h-5 mx-auto mb-1 text-green-500" />
                    <div className="text-2xl font-bold">{selectedUser.total_clicks}</div>
                    <div className="text-xs text-muted-foreground">Clicks</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <Target className="w-5 h-5 mx-auto mb-1 text-purple-500" />
                    <div className="text-2xl font-bold">{selectedUser.conversions}</div>
                    <div className="text-xs text-muted-foreground">Conversions</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <Clock className="w-5 h-5 mx-auto mb-1 text-orange-500" />
                    <div className="text-2xl font-bold">{selectedUser.avg_session_duration.toFixed(1)}m</div>
                    <div className="text-xs text-muted-foreground">Avg Duration</div>
                  </div>
                </div>

                {/* Psychology & Behavior */}
                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Heart className="w-5 h-5 text-pink-500" />
                    Psychological Profile
                  </h4>
                  
                  <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                    <div className="font-medium mb-2">Conversion Likelihood</div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                          style={{ width: `${selectedUser.conversion_likelihood}%` }}
                        />
                      </div>
                      <span className="font-bold text-lg">{selectedUser.conversion_likelihood}%</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {selectedUser.conversion_likelihood > 70 ? 
                        "🔥 Hot lead! This user shows strong buying signals. Consider retargeting." :
                      selectedUser.conversion_likelihood > 40 ?
                        "⚡ Warm prospect. Needs more engagement to convert." :
                        "🌱 Early stage. Build trust through valuable content."}
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2 mb-2">
                        <Monitor className="w-4 h-4 text-blue-500" />
                        <span className="font-medium">Devices Used</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedUser.devices.map((device, i) => (
                          <Badge key={i} variant="secondary">{device}</Badge>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-green-500" />
                        <span className="font-medium">Locations</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedUser.countries.map((country, i) => (
                          <Badge key={i} variant="secondary">{country}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-orange-500" />
                      <span className="font-medium">Top Pages Visited</span>
                    </div>
                    <div className="space-y-1">
                      {selectedUser.top_pages.map((page, i) => (
                        <div key={i} className="text-sm font-mono text-muted-foreground">
                          {i + 1}. {page}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <div className="font-medium mb-2 flex items-center gap-2">
                      <Brain className="w-5 h-5 text-blue-500" />
                      AI Behavioral Insights
                    </div>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Engagement pattern suggests {selectedUser.total_clicks > selectedUser.total_pageviews / 2 ? "high interaction" : "passive browsing"} behavior</li>
                      <li>• {selectedUser.total_sessions > 1 ? "Returning visitor shows strong interest" : "First-time visitor, needs nurturing"}</li>
                      <li>• Best time to engage: Based on activity, user is most active in {new Date(selectedUser.last_seen).getHours() > 12 ? "afternoon/evening" : "morning"}</li>
                      <li>• Recommended action: {selectedUser.conversions > 0 ? "Upsell or retention campaign" : selectedUser.total_clicks > 5 ? "Send targeted offer" : "Nurture with valuable content"}</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            <Card className="p-12 text-center">
              <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Select a visitor to analyze</h3>
              <p className="text-muted-foreground">
                Click on any visitor from the list to see detailed behavioral analysis
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
