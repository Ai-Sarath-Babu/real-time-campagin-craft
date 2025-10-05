import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { Navigation } from "@/components/Navigation";
import { CampaignsList } from "@/components/CampaignsList";
import { LiveDashboardData } from "@/components/LiveDashboardData";
import { AdvancedAnalytics } from "@/components/AdvancedAnalytics";
import { UserBehaviorAnalysis } from "@/components/UserBehaviorAnalysis";
import { UtmBuilderForm } from "@/components/UtmBuilderForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="builder" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 max-w-4xl mx-auto">
            <TabsTrigger value="builder">UTM Builder</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="analytics">Live Analytics</TabsTrigger>
            <TabsTrigger value="advanced">Advanced Analytics</TabsTrigger>
            <TabsTrigger value="behavior">User Behavior</TabsTrigger>
          </TabsList>

          <TabsContent value="builder">
            <UtmBuilderForm />
          </TabsContent>

          <TabsContent value="campaigns">
            <CampaignsList />
          </TabsContent>

          <TabsContent value="analytics">
            <LiveDashboardData />
          </TabsContent>

          <TabsContent value="advanced">
            <AdvancedAnalytics />
          </TabsContent>

          <TabsContent value="behavior">
            <UserBehaviorAnalysis />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
