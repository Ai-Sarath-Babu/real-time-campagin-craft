import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Copy, Check, Link2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const UtmBuilder = () => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    url: "https://example.com",
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

  const generatedUrl = generateUrl();

  return (
    <section className="py-24 px-4 bg-muted/30">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">UTM Builder</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold">
            Build Your <span className="text-gradient">Campaign URL</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Generate trackable URLs with custom UTM parameters
          </p>
        </div>

        <Card className="p-8 space-y-6 border-border/50 backdrop-blur-sm bg-card/80">
          {/* Base URL */}
          <div className="space-y-2">
            <Label htmlFor="url" className="text-base font-semibold">Website URL</Label>
            <Input
              id="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://example.com"
              className="h-12"
            />
          </div>

          {/* UTM Parameters Grid */}
          <div className="grid md:grid-cols-2 gap-6 pt-4">
            <div className="space-y-2">
              <Label htmlFor="source" className="font-semibold">Campaign Source *</Label>
              <Input
                id="source"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                placeholder="google, facebook, newsletter"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="medium" className="font-semibold">Campaign Medium *</Label>
              <Input
                id="medium"
                value={formData.medium}
                onChange={(e) => setFormData({ ...formData, medium: e.target.value })}
                placeholder="cpc, email, social"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="campaign" className="font-semibold">Campaign Name *</Label>
              <Input
                id="campaign"
                value={formData.campaign}
                onChange={(e) => setFormData({ ...formData, campaign: e.target.value })}
                placeholder="summer_sale_2024"
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

          {/* Generated URL */}
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
              <Button onClick={handleCopy} size="lg" className="gap-2 gradient-primary text-white shrink-0">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" size="sm">Save Template</Button>
            <Button variant="outline" size="sm">Generate QR Code</Button>
            <Button variant="outline" size="sm">Test URL</Button>
          </div>
        </Card>
      </div>
    </section>
  );
};
