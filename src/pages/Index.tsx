import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { UtmBuilder } from "@/components/UtmBuilder";
import { LiveDashboard } from "@/components/LiveDashboard";
import { Button } from "@/components/ui/button";
import { LogIn, LayoutDashboard } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Top Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="text-xl font-bold">Campaign Craft</div>
            <div className="flex gap-3">
              {isLoggedIn ? (
                <Button 
                  onClick={() => navigate("/dashboard")}
                  className="gap-2 gradient-primary text-white"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Button>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate("/auth")}
                    className="gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </Button>
                  <Button 
                    onClick={() => navigate("/auth")}
                    className="gap-2 gradient-primary text-white"
                  >
                    Get Started Free
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-16">
        <Hero />
        <Features />
        <UtmBuilder />
        <LiveDashboard />
      </div>
    </div>
  );
};

export default Index;
