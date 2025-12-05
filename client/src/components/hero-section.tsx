import { ArrowDown, FileText, Zap, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pdfTools } from "@shared/schema";

export function HeroSection() {
  const scrollToTools = () => {
    document.getElementById("tools")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--primary)/0.05),transparent_50%)]" />
      
      <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24 lg:py-32">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Zap className="h-4 w-4" />
            <span>{pdfTools.length} Powerful Tools</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            All Your{" "}
            <span className="text-primary">File Tools</span>
            {" "}in One Place
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            PDFs, videos, images, and archives - all your file processing needs in one place.
            Free, secure, and incredibly fast.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
            <Button
              size="lg"
              onClick={scrollToTools}
              className="gap-2 text-base px-8"
              data-testid="button-choose-tool"
            >
              Choose a Tool
              <ArrowDown className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" />
              <span>100% Secure</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <span>Fast Processing</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <span>No Registration</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
