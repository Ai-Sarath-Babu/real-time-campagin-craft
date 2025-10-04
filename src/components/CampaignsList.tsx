import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Copy, Trash2, ExternalLink, BarChart, Code } from "lucide-react";
import { TrackingScriptGenerator } from "./TrackingScriptGenerator";
import { ScreenRecordingToggle } from "./ScreenRecordingToggle";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Campaign {
  id: string;
  name: string;
  url: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_term: string | null;
  utm_content: string | null;
  utm_id: string | null;
  created_at: string;
  is_active: boolean;
}

export const CampaignsList = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateUrl = (campaign: Campaign) => {
    const params = new URLSearchParams();
    params.append("utm_source", campaign.utm_source);
    params.append("utm_medium", campaign.utm_medium);
    params.append("utm_campaign", campaign.utm_campaign);
    if (campaign.utm_term) params.append("utm_term", campaign.utm_term);
    if (campaign.utm_content) params.append("utm_content", campaign.utm_content);
    if (campaign.utm_id) params.append("utm_id", campaign.utm_id);

    return `${campaign.url}?${params.toString()}`;
  };

  const handleCopy = (campaign: Campaign) => {
    navigator.clipboard.writeText(generateUrl(campaign));
    toast({
      title: "Copied!",
      description: "Campaign URL copied to clipboard",
    });
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("campaigns").delete().eq("id", id);
      if (error) throw error;

      toast({
        title: "Deleted",
        description: "Campaign deleted successfully",
      });
      fetchCampaigns();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <Card className="p-12 text-center space-y-4 max-w-2xl mx-auto">
        <BarChart className="w-16 h-16 mx-auto text-muted-foreground" />
        <h3 className="text-xl font-semibold">No campaigns yet</h3>
        <p className="text-muted-foreground">
          Create your first campaign in the UTM Builder tab
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Campaigns</h2>
        <Badge variant="secondary">{campaigns.length} campaigns</Badge>
      </div>

      <div className="grid gap-4">
        {campaigns.map((campaign) => (
          <Card key={campaign.id} className="p-6 space-y-4 border-border/50 bg-card/80">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">{campaign.name}</h3>
                <p className="text-sm text-muted-foreground">{campaign.url}</p>
              </div>
              <Badge variant={campaign.is_active ? "default" : "secondary"}>
                {campaign.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Source</div>
                <div className="font-medium">{campaign.utm_source}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Medium</div>
                <div className="font-medium">{campaign.utm_medium}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Campaign</div>
                <div className="font-medium">{campaign.utm_campaign}</div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(campaign)}
                className="gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy URL
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(generateUrl(campaign), "_blank")}
                className="gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Open
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Code className="w-4 h-4" />
                    Get Script
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Tracking Script & Recording</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6">
                    <ScreenRecordingToggle 
                      campaignId={campaign.id} 
                      campaignName={campaign.name} 
                    />
                    <TrackingScriptGenerator 
                      campaignId={campaign.id} 
                      campaignName={campaign.name} 
                    />
                  </div>
                </DialogContent>
              </Dialog>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(campaign.id)}
                className="gap-2 text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
