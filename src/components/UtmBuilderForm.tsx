import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Copy, Check, Link2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { campaignSchema } from "@/lib/validations";
import { z } from "zod";

export const UtmBuilderForm = () => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    url: "https://example.com",
    domain: "example.com",
    source: "google",
    medium: "cpc",
    campaign: "summer_sale_2024",
    term: "running shoes",
    content: "text_ad_001",
    id: "123456",
    custom: "value",
  });

  const generateUrl = () => {
    const params = new URLSearchParams();
    if (formData.source) params.append("utm_source", formData.source);
    if (formData.medium) params.append("utm_medium", formData.medium);
    if (formData.campaign) params.append("utm_campaign", formData.campaign);
    if (formData.term) params.append("utm_term", formData.term);
    if (formData.content) params.append("utm_content", formData.content);
    if (formData.id) params.append("utm_id", formData.id);
    if (formData.custom) params.append("custom_param", formData.custom);

    return `${formData.url}?${params.toString()}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateUrl());
    setCopied(true);
    toast({
      title: "Copied!",
      description: "UTM URL copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to save campaigns",
          variant: "destructive",
        });
        return;
      }

      // Validate input
      const validated = campaignSchema.parse({
        name: formData.name || `${formData.source} - ${formData.campaign}`,
        url: formData.url,
        domain: formData.domain,
        utm_source: formData.source,
        utm_medium: formData.medium,
        utm_campaign: formData.campaign,
        utm_term: formData.term,
        utm_content: formData.content,
        utm_id: formData.id,
        custom: formData.custom,
      });

      const { error } = await supabase.from("campaigns").insert({
        user_id: user.id,
        name: validated.name,
        url: validated.url,
        domain: validated.domain,
        utm_source: validated.utm_source,
        utm_medium: validated.utm_medium,
        utm_campaign: validated.utm_campaign,
        utm_term: validated.utm_term || null,
        utm_content: validated.utm_content || null,
        utm_id: validated.utm_id || null,
        custom_params: validated.custom ? { custom_param: validated.custom } : {},
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Campaign saved successfully",
      });

      // Reset form
      setFormData({
        name: "",
        url: "https://example.com",
        domain: "example.com",
        source: "",
        medium: "",
        campaign: "",
        term: "",
        content: "",
        id: "",
        custom: "",
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const generatedUrl = generateUrl();

  return (
    <Card className="p-8 space-y-6 max-w-5xl mx-auto border-border/50 backdrop-blur-sm bg-card/80">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-base font-semibold">Campaign Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="My Summer Sale Campaign"
          className="h-12"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="url" className="text-base font-semibold">Website URL *</Label>
        <Input
          id="url"
          value={formData.url}
          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          placeholder="https://example.com"
          className="h-12"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="domain" className="text-base font-semibold">Domain *</Label>
        <Input
          id="domain"
          value={formData.domain}
          onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
          placeholder="example.com"
          className="h-12"
          required
        />
        <p className="text-xs text-muted-foreground">Each domain has separate campaigns and tracking</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 pt-4">
        <div className="space-y-2">
          <Label htmlFor="source" className="font-semibold">Campaign Source *</Label>
          <Input
            id="source"
            value={formData.source}
            onChange={(e) => setFormData({ ...formData, source: e.target.value })}
            placeholder="google, facebook, newsletter"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="medium" className="font-semibold">Campaign Medium *</Label>
          <Input
            id="medium"
            value={formData.medium}
            onChange={(e) => setFormData({ ...formData, medium: e.target.value })}
            placeholder="cpc, email, social"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="campaign" className="font-semibold">Campaign Name *</Label>
          <Input
            id="campaign"
            value={formData.campaign}
            onChange={(e) => setFormData({ ...formData, campaign: e.target.value })}
            placeholder="summer_sale_2024"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="term" className="font-semibold">Campaign Term</Label>
          <Input
            id="term"
            value={formData.term}
            onChange={(e) => setFormData({ ...formData, term: e.target.value })}
            placeholder="running shoes"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content" className="font-semibold">Campaign Content</Label>
          <Input
            id="content"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder="text_ad_001"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="id" className="font-semibold">Campaign ID</Label>
          <Input
            id="id"
            value={formData.id}
            onChange={(e) => setFormData({ ...formData, id: e.target.value })}
            placeholder="123456"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="custom" className="font-semibold">Custom Parameter</Label>
          <Input
            id="custom"
            value={formData.custom}
            onChange={(e) => setFormData({ ...formData, custom: e.target.value })}
            placeholder="any_custom_value"
          />
        </div>
      </div>

      <div className="pt-6 space-y-3">
        <Label className="text-base font-semibold flex items-center gap-2">
          <Link2 className="w-4 h-4 text-primary" />
          Generated URL
        </Label>
        <div className="flex gap-2">
          <Input
            value={generatedUrl}
            readOnly
            className="font-mono text-sm h-12 bg-muted/50"
          />
          <Button onClick={handleCopy} size="lg" variant="outline" className="gap-2 shrink-0">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button 
          onClick={handleSave} 
          size="lg" 
          className="gap-2 gradient-primary text-white"
          disabled={saving || !formData.source || !formData.medium || !formData.campaign || !formData.domain}
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save Campaign"}
        </Button>
      </div>
    </Card>
  );
};
