import { Shield, Zap, Lock, CloudOff, Sparkles, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Shield,
    title: "100% Secure",
    description:
      "Your files are processed securely and automatically deleted after processing.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Advanced algorithms ensure your PDFs are processed in seconds, not minutes.",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    icon: Lock,
    title: "Privacy First",
    description:
      "We never store, share, or access your files. Your data stays yours.",
    color: "text-sky-500",
    bg: "bg-sky-500/10",
  },
  {
    icon: CloudOff,
    title: "No Registration",
    description:
      "Use all tools instantly without creating an account or signing up.",
    color: "text-violet-500",
    bg: "bg-violet-500/10",
  },
  {
    icon: Sparkles,
    title: "High Quality",
    description:
      "Maintain original quality of your PDFs with our optimized processing.",
    color: "text-pink-500",
    bg: "bg-pink-500/10",
  },
  {
    icon: Clock,
    title: "Works Everywhere",
    description:
      "Access from any device - desktop, tablet, or mobile. No software needed.",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-16 md:py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why Choose PDF Tools?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Trusted by thousands of users for fast, secure, and reliable PDF processing
          </p>
        </div>

        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          data-testid="grid-features"
        >
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center flex-shrink-0`}
                  >
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1" data-testid={`text-feature-title-${index}`}>
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed" data-testid={`text-feature-desc-${index}`}>
                      {feature.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
