import { useCallback } from "react";
import { useLocation } from "wouter";
import { Header } from "@/components/header";
import { HeroSection } from "@/components/hero-section";
import { ToolsGrid } from "@/components/tools-grid";
import { FeaturesSection } from "@/components/features-section";
import { Footer } from "@/components/footer";

export default function Home() {
  const [, navigate] = useLocation();

  const handleFooterToolClick = useCallback((toolId: string) => {
    navigate(`/tool/${toolId}`);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <ToolsGrid />
        <FeaturesSection />
      </main>
      <Footer onToolClick={handleFooterToolClick} />
    </div>
  );
}
