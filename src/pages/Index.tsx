import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { UtmBuilder } from "@/components/UtmBuilder";
import { LiveDashboard } from "@/components/LiveDashboard";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <Features />
      <UtmBuilder />
      <LiveDashboard />
    </div>
  );
};

export default Index;
