import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Video, AlertCircle, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ScreenRecordingToggleProps {
  campaignId: string;
  campaignName: string;
}

export const ScreenRecordingToggle = ({ campaignId, campaignName }: ScreenRecordingToggleProps) => {
  const { toast } = useToast();
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    // Check if screen recording is enabled in localStorage
    const enabled = localStorage.getItem('cc_record_screen') === 'true';
    setIsEnabled(enabled);
  }, []);

  const handleToggle = (checked: boolean) => {
    setIsEnabled(checked);
    localStorage.setItem('cc_record_screen', checked.toString());
    
    toast({
      title: checked ? "Screen Recording Enabled" : "Screen Recording Disabled",
      description: checked 
        ? "Visitor sessions will now be recorded for this campaign" 
        : "Screen recording has been disabled",
    });
  };

  return (
    <Card className="p-6 space-y-4 border-border/50 bg-card/80">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Video className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Session Recording</h3>
        </div>
        <Badge variant={isEnabled ? "default" : "secondary"}>
          {isEnabled ? "Active" : "Inactive"}
        </Badge>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
          <div className="space-y-1">
            <Label htmlFor="recording-toggle" className="text-base font-medium cursor-pointer">
              Enable Session Recording
            </Label>
            <p className="text-sm text-muted-foreground">
              Record visitor interactions for campaign: <strong>{campaignName}</strong>
            </p>
          </div>
          <Switch
            id="recording-toggle"
            checked={isEnabled}
            onCheckedChange={handleToggle}
          />
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2 text-muted-foreground">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <p>
                <strong>Privacy Notice:</strong> When enabled, visitor interactions will be recorded including:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Mouse movements and clicks</li>
                <li>Scroll behavior</li>
                <li>Page navigation</li>
                <li>Form interactions (passwords are automatically masked)</li>
              </ul>
              <p className="text-xs mt-2">
                ⚠️ Make sure your privacy policy discloses session recording and obtain user consent where required.
              </p>
            </div>
          </div>
        </div>

        {isEnabled && (
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-primary mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-primary">Recording Active</p>
                <p className="text-xs text-muted-foreground">
                  Sessions are being recorded. View recordings in the tracking events table.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-border/50">
          <h4 className="font-medium mb-2">How it works:</h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>1. Install the tracking script on your website</p>
            <p>2. Enable session recording using this toggle</p>
            <p>3. Sessions are automatically recorded and stored</p>
            <p>4. View recordings in your tracking events dashboard</p>
          </div>
        </div>
      </div>
    </Card>
  );
};
