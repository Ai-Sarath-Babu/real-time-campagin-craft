import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Code } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TrackingScriptGeneratorProps {
  campaignId: string;
  campaignName: string;
}

export const TrackingScriptGenerator = ({ campaignId, campaignName }: TrackingScriptGeneratorProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const trackingScript = `<!-- Campaign Craft Tracking -->
<script>
(function() {
  const campaignId = '${campaignId}';
  const trackingUrl = 'https://azolpholrzdashejgcdl.supabase.co/functions/v1/track-event';
  
  // Track page view
  function trackEvent(eventType) {
    fetch(trackingUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        campaign_id: campaignId,
        event_type: eventType,
        referrer: document.referrer,
        timestamp: new Date().toISOString()
      })
    }).catch(err => console.error('Tracking error:', err));
  }
  
  // Auto-track page view
  trackEvent('pageview');
  
  // Track clicks on elements with data-track="click"
  document.addEventListener('click', function(e) {
    if (e.target.closest('[data-track="click"]')) {
      trackEvent('click');
    }
  });
  
  // Track conversions on elements with data-track="conversion"
  document.addEventListener('click', function(e) {
    if (e.target.closest('[data-track="conversion"]')) {
      trackEvent('conversion');
    }
  });
})();
</script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(trackingScript);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Tracking script copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="p-6 space-y-4 border-border/50 bg-card/80">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Code className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Tracking Script</h3>
        </div>
        <Badge variant="secondary">{campaignName}</Badge>
      </div>

      <div className="space-y-2">
        <Label>Embed this script in your website</Label>
        <div className="relative">
          <pre className="bg-muted/50 p-4 rounded-lg text-sm overflow-x-auto">
            <code>{trackingScript}</code>
          </pre>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopy}
            className="absolute top-2 right-2 gap-2"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
      </div>

      <div className="space-y-2 pt-2">
        <Label>Usage Instructions</Label>
        <div className="text-sm text-muted-foreground space-y-2">
          <p>1. Copy the script above and paste it before the closing {'</body>'} tag</p>
          <p>2. Add <code className="bg-muted px-1 rounded">data-track="click"</code> to buttons you want to track clicks</p>
          <p>3. Add <code className="bg-muted px-1 rounded">data-track="conversion"</code> to conversion buttons</p>
          <p>4. Page views are tracked automatically</p>
        </div>
      </div>
    </Card>
  );
};
