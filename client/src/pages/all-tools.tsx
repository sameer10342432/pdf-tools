import { useCallback } from "react";
import { useLocation } from "wouter";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ToolCard } from "@/components/tool-card";
import { pdfTools } from "@shared/schema";

export default function AllTools() {
  const [, navigate] = useLocation();

  const handleFooterToolClick = useCallback((toolId: string) => {
    navigate(`/tool/${toolId}`);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              All PDF Tools
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Choose from our collection of powerful PDF tools to get started
            </p>
          </div>
          
          <div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            data-testid="grid-all-tools"
          >
            {pdfTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </div>
      </main>
      <Footer onToolClick={handleFooterToolClick} />
    </div>
  );
}
