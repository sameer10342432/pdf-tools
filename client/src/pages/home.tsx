import { useState, useCallback } from "react";
import { Header } from "@/components/header";
import { HeroSection } from "@/components/hero-section";
import { ToolsGrid } from "@/components/tools-grid";
import { FeaturesSection } from "@/components/features-section";
import { Footer } from "@/components/footer";
import { ToolDialog } from "@/components/tool-dialog";
import { type PdfTool, pdfTools } from "@shared/schema";

export default function Home() {
  const [selectedTool, setSelectedTool] = useState<PdfTool | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSelectTool = useCallback((tool: PdfTool) => {
    setSelectedTool(tool);
    setDialogOpen(true);
  }, []);

  const handleFooterToolClick = useCallback((toolId: string) => {
    const tool = pdfTools.find((t) => t.id === toolId);
    if (tool) {
      handleSelectTool(tool);
    }
  }, [handleSelectTool]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <ToolsGrid onSelectTool={handleSelectTool} />
        <FeaturesSection />
      </main>
      <Footer onToolClick={handleFooterToolClick} />
      <ToolDialog
        tool={selectedTool}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
