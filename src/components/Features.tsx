import { Card } from "@/components/ui/card";
import { Link2, TestTube, LineChart, Zap, Shield, Layers } from "lucide-react";

const features = [
  {
    icon: Link2,
    title: "UTM Builder",
    description: "Generate campaign URLs with 7+ parameter combinations. Custom fields, templates, and bulk creation.",
    color: "text-primary",
  },
  {
    icon: TestTube,
    title: "UTM Testing",
    description: "Validate URLs before deployment. Preview tracking behavior and catch errors early.",
    color: "text-accent",
  },
  {
    icon: LineChart,
    title: "Live Analytics",
    description: "Real-time visitor tracking, click metrics, and conversion attribution with instant updates.",
    color: "text-success",
  },
  {
    icon: Zap,
    title: "Instant Tracking",
    description: "Sub-second data processing. See clicks and conversions as they happen with WebSocket streams.",
    color: "text-warning",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "GDPR & CCPA compliant. Anonymous tracking, no PII collection, full data ownership.",
    color: "text-primary",
  },
  {
    icon: Layers,
    title: "Multi-Channel",
    description: "Track across email, social, paid ads, and organic. Unified attribution dashboard.",
    color: "text-accent",
  },
];

export const Features = () => {
  return (
    <section className="py-24 px-4">
      <div className="container mx-auto">
        <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">
            Everything You Need to <span className="text-gradient">Track Campaigns</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            From URL generation to live attribution, all in one powerful platform
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="p-6 space-y-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50 backdrop-blur-sm bg-card/50"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${feature.color} bg-primary/10`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
