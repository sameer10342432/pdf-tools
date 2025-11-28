import { type PdfTool } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import {
  Layers,
  Scissors,
  Archive,
  Image,
  FileImage,
  RotateCw,
  Trash2,
  Shuffle,
  Hash,
  Stamp,
  Lock,
  Unlock,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Layers,
  Scissors,
  Archive,
  Image,
  FileImage,
  RotateCw,
  Trash2,
  Shuffle,
  Hash,
  Stamp,
  Lock,
  Unlock,
};

interface ToolCardProps {
  tool: PdfTool;
}

export function ToolCard({ tool }: ToolCardProps) {
  const Icon = iconMap[tool.icon] || Layers;

  return (
    <Link href={`/tool/${tool.id}`}>
      <Card
        className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 hover-elevate h-full"
        data-testid={`card-tool-${tool.id}`}
      >
        <CardContent className="p-6 flex flex-col items-center text-center">
          <div
            className={`w-14 h-14 rounded-xl ${tool.color} flex items-center justify-center mb-4 transition-transform duration-200 group-hover:scale-110`}
          >
            <Icon className="h-7 w-7 text-white" />
          </div>
          <h3 className="font-semibold text-lg mb-2" data-testid={`text-tool-name-${tool.id}`}>
            <span className="mr-2 text-xl" data-testid={`emoji-tool-${tool.id}`}>{tool.emoji}</span>
            {tool.name}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed" data-testid={`text-tool-desc-${tool.id}`}>
            {tool.description}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
