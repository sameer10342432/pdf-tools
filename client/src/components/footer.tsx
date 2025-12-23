import { FileText, Heart } from "lucide-react";
import { pdfTools } from "@shared/schema";

interface FooterProps {
  onToolClick: (toolId: string) => void;
}

export function Footer({ onToolClick }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-card/50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <a
              href="/"
              className="flex items-center gap-2 font-bold text-xl mb-4"
              data-testid="link-footer-home"
            >
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary-foreground" />
              </div>
              <span>PDF Tools</span>
            </a>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Free online PDF tools to help you work with PDF files easily.
              Merge, split, compress, and convert PDFs securely.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">PDF Tools</h3>
            <ul className="space-y-2">
              {pdfTools.slice(0, 5).map((tool) => (
                <li key={tool.id}>
                  <button
                    onClick={() => onToolClick(tool.id)}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    data-testid={`link-footer-${tool.id}`}
                  >
                    {tool.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>



          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  data-testid="link-footer-about"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  data-testid="link-footer-privacy"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  data-testid="link-footer-terms"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  data-testid="link-footer-contact"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t text-center">
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 flex-wrap">
            <span>&copy; {currentYear} PDF Tools. Made with</span>
            <Heart className="h-4 w-4 text-primary fill-primary" />
            <span>for everyone.</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
