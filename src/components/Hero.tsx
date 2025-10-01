import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, Link2, Target } from "lucide-react";

export const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 gradient-subtle" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(262_83%_58%/0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(195_100%_50%/0.1),transparent_50%)]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto text-center space-y-8 animate-slide-up">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
            <span className="text-sm font-medium text-primary">Real-Time Campaign Tracking</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            Track Every Click,
            <br />
            <span className="text-gradient">Measure Every Campaign</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            Build, test, and track UTM parameters in real-time. Get instant insights into your marketing campaigns with live analytics and attribution tracking.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button size="lg" className="gap-2 gradient-primary text-white hover:opacity-90 transition-opacity shadow-lg">
              Start Tracking Free
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" className="gap-2">
              View Live Demo
              <BarChart3 className="w-4 h-4" />
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 pt-12 max-w-2xl mx-auto">
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Link2 className="w-5 h-5 text-primary" />
                <div className="text-3xl font-bold">10K+</div>
              </div>
              <div className="text-sm text-muted-foreground">UTM Links Created</div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Target className="w-5 h-5 text-accent" />
                <div className="text-3xl font-bold">99.9%</div>
              </div>
              <div className="text-sm text-muted-foreground">Tracking Accuracy</div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <BarChart3 className="w-5 h-5 text-success" />
                <div className="text-3xl font-bold">Real-time</div>
              </div>
              <div className="text-sm text-muted-foreground">Live Analytics</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
