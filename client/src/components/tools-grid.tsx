import { pdfTools } from "@shared/schema";
import { ToolCard } from "./tool-card";

export function ToolsGrid() {
  return (
    <section id="tools" className="py-16 md:py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Choose Your Tool
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Select from our collection of powerful PDF, multimedia, and archive tools
          </p>
        </div>
        
        <div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          data-testid="grid-tools"
        >
          {pdfTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </div>
    </section>
  );
}
