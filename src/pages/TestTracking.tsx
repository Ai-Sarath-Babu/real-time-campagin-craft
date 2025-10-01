import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, MousePointer, Eye } from "lucide-react";

const TestTracking = () => {
  const [searchParams] = useSearchParams();
  const [tracked, setTracked] = useState(false);
  
  const utmSource = searchParams.get("utm_source");
  const utmMedium = searchParams.get("utm_medium");
  const utmCampaign = searchParams.get("utm_campaign");
  
  useEffect(() => {
    if (utmSource && utmMedium && utmCampaign) {
      // Track page view
      trackEvent("pageview");
      setTracked(true);
    }
  }, [utmSource, utmMedium, utmCampaign]);

  const trackEvent = async (eventType: string) => {
    try {
      const response = await fetch(
        "https://azolpholrzdashejgcdl.supabase.co/functions/v1/track-event",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            utm_source: utmSource,
            utm_medium: utmMedium,
            utm_campaign: utmCampaign,
            event_type: eventType,
            referrer: document.referrer,
          }),
        }
      );

      const data = await response.json();
      console.log("Tracking response:", data);
    } catch (error) {
      console.error("Tracking error:", error);
    }
  };

  return (
    <div className="min-h-screen gradient-subtle flex items-center justify-center px-4">
      <Card className="p-8 max-w-2xl w-full space-y-6 border-border/50 bg-card/80">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-success/10 flex items-center justify-center">
            {tracked ? (
              <CheckCircle className="w-8 h-8 text-success animate-fade-in" />
            ) : (
              <Eye className="w-8 h-8 text-primary" />
            )}
          </div>
          
          <h1 className="text-3xl font-bold">
            {tracked ? "Tracking Active!" : "Test Tracking Page"}
          </h1>
          
          <p className="text-muted-foreground">
            This page demonstrates real-time tracking capabilities
          </p>
        </div>

        {utmSource && utmMedium && utmCampaign ? (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/50 space-y-3">
              <div className="text-sm font-semibold text-muted-foreground">
                Detected UTM Parameters:
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Badge variant="secondary">Source</Badge>
                  <div className="mt-1 font-medium">{utmSource}</div>
                </div>
                <div>
                  <Badge variant="secondary">Medium</Badge>
                  <div className="mt-1 font-medium">{utmMedium}</div>
                </div>
                <div>
                  <Badge variant="secondary">Campaign</Badge>
                  <div className="mt-1 font-medium">{utmCampaign}</div>
                </div>
              </div>
            </div>

            {tracked && (
              <div className="flex items-center gap-2 p-3 bg-success/10 rounded-lg text-success text-sm">
                <CheckCircle className="w-4 h-4" />
                <span>Page view tracked successfully! Check your dashboard.</span>
              </div>
            )}

            <div className="space-y-3 pt-4">
              <div className="text-sm font-semibold text-muted-foreground">
                Test Actions:
              </div>
              <div className="grid gap-2">
                <Button
                  onClick={() => trackEvent("click")}
                  variant="outline"
                  className="gap-2 justify-start"
                >
                  <MousePointer className="w-4 h-4" />
                  Track Click Event
                </Button>
                <Button
                  onClick={() => trackEvent("conversion")}
                  className="gap-2 justify-start gradient-primary text-white"
                >
                  <CheckCircle className="w-4 h-4" />
                  Track Conversion Event
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-4 py-8">
            <p className="text-muted-foreground">
              No UTM parameters detected. Add UTM parameters to this URL to test tracking.
            </p>
            <p className="text-sm text-muted-foreground">
              Example: ?utm_source=google&utm_medium=cpc&utm_campaign=test
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default TestTracking;
