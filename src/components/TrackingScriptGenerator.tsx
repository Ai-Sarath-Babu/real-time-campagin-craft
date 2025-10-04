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

  // Escape campaign ID to prevent XSS
  const escapedCampaignId = campaignId.replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const trackingScript = `<!-- Campaign Craft Advanced Tracking -->
<script src="https://cdn.jsdelivr.net/npm/rrweb@latest/dist/rrweb.min.js"></script>
<script>
(function() {
  // Respect Do Not Track browser setting
  if (navigator.doNotTrack === '1' || window.doNotTrack === '1') {
    console.log('[Campaign Craft] Do Not Track enabled, tracking disabled');
    return;
  }
  
  const campaignId = '${escapedCampaignId}';
  const trackingUrl = 'https://azolpholrzdashejgcdl.supabase.co/functions/v1/track-event';
  
  // Get or create unique visitor ID
  function getVisitorId() {
    let visitorId = localStorage.getItem('cc_visitor_id');
    if (!visitorId) {
      visitorId = 'v_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('cc_visitor_id', visitorId);
    }
    return visitorId;
  }
  
  const visitorId = getVisitorId();
  
  // Track event with full context
  function trackEvent(eventType, extraData = {}) {
    const eventData = {
      campaign_id: campaignId,
      event_type: eventType,
      referrer: document.referrer,
      visitor_id: visitorId,
      page_path: window.location.pathname + window.location.search,
      timestamp: new Date().toISOString(),
      ...extraData
    };
    
    fetch(trackingUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData)
    }).catch(err => console.error('Tracking error:', err));
  }
  
  // Auto-track page view on load
  trackEvent('pageview');
  
  // Track all button clicks
  document.addEventListener('click', function(e) {
    const button = e.target.closest('button, a, [role="button"]');
    if (button) {
      const isConversion = button.hasAttribute('data-track-conversion') || 
                          button.closest('[data-track="conversion"]');
      const eventType = isConversion ? 'conversion' : 'click';
      
      trackEvent(eventType, {
        element_selector: button.tagName + (button.id ? '#' + button.id : '') + 
                         (button.className ? '.' + button.className.split(' ')[0] : ''),
        element_text: button.textContent?.trim().substring(0, 100) || ''
      });
    }
  });
  
  // Screen recording with rrweb
  if (localStorage.getItem('cc_record_screen') === 'true') {
    // Wait for rrweb to load
    const initRecording = function() {
      if (!window.rrweb) {
        setTimeout(initRecording, 100);
        return;
      }
      
      console.log('[Campaign Craft] Screen recording enabled');
      let events = [];
      let stopFn;
      
      stopFn = window.rrweb.record({
        emit(event) {
          events.push(event);
          
          // Send recording data every 50 events or 30 seconds
          if (events.length >= 50) {
            const recordingData = JSON.stringify(events);
            const base64Data = btoa(unescape(encodeURIComponent(recordingData)));
            
            trackEvent('session_recording', {
              screen_recording_url: 'data:application/json;base64,' + base64Data,
              recording_events_count: events.length
            });
            
            events = []; // Clear events after sending
          }
        },
        recordCanvas: true,
        collectFonts: true,
        maskAllInputs: true, // Mask all inputs for privacy
        maskInputOptions: {
          password: true,
          email: true,
          tel: true
        }
      });
      
      // Send remaining events before page unload
      window.addEventListener('beforeunload', function() {
        if (events.length > 0) {
          const recordingData = JSON.stringify(events);
          const base64Data = btoa(unescape(encodeURIComponent(recordingData)));
          
          navigator.sendBeacon(trackingUrl, JSON.stringify({
            campaign_id: campaignId,
            event_type: 'session_recording',
            visitor_id: visitorId,
            page_path: window.location.pathname + window.location.search,
            screen_recording_url: 'data:application/json;base64,' + base64Data,
            recording_events_count: events.length
          }));
        }
      });
    };
    
    initRecording();
  }
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
        <Label>Advanced Features</Label>
        <div className="text-sm text-muted-foreground space-y-2">
          <p>✅ <strong>Auto-tracking:</strong> Page views tracked automatically</p>
          <p>✅ <strong>All buttons:</strong> Clicks on all buttons, links, and clickable elements</p>
          <p>✅ <strong>Unique visitors:</strong> Each visitor gets a persistent ID</p>
          <p>✅ <strong>IP tracking:</strong> IP addresses captured server-side</p>
          <p>✅ <strong>Page context:</strong> Full URL path and referrer tracked</p>
          <p>✅ <strong>Element details:</strong> Button text and selectors captured</p>
          <p>📝 <strong>Conversions:</strong> Add <code className="bg-muted px-1 rounded">data-track-conversion</code> to conversion buttons</p>
          <p>🎥 <strong>Screen recording:</strong> Uses rrweb library (loaded via CDN)</p>
          <p>🔒 <strong>Privacy protected:</strong> All passwords and sensitive inputs are automatically masked</p>
          <p>💾 <strong>Auto-save:</strong> Recording data sent every 50 events or on page unload</p>
        </div>
      </div>
    </Card>
  );
};
