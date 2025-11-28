import { FileText } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <a
          href="/"
          className="flex items-center gap-2 font-bold text-xl"
          data-testid="link-home"
        >
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <FileText className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="hidden sm:inline-block">PDF Tools</span>
        </a>
        
        <nav className="hidden md:flex items-center gap-6">
          <a
            href="#tools"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            data-testid="link-tools"
          >
            All Tools
          </a>
          <a
            href="#features"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            data-testid="link-features"
          >
            Features
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
