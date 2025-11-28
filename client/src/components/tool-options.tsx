import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type PdfToolType, type ToolOptions } from "@shared/schema";

interface ToolOptionsProps {
  toolType: PdfToolType;
  options: ToolOptions;
  onOptionsChange: (options: ToolOptions) => void;
  pageCount?: number;
}

export function ToolOptionsComponent({
  toolType,
  options,
  onOptionsChange,
  pageCount,
}: ToolOptionsProps) {
  const updateOption = <K extends keyof ToolOptions>(
    key: K,
    value: ToolOptions[K]
  ) => {
    onOptionsChange({ ...options, [key]: value });
  };

  switch (toolType) {
    case "split":
    case "delete-pages":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pages">
              {toolType === "split" ? "Pages to extract" : "Pages to delete"}
            </Label>
            <Input
              id="pages"
              placeholder="e.g., 1,3,5-10"
              value={options.pages || ""}
              onChange={(e) => updateOption("pages", e.target.value)}
              data-testid="input-pages"
            />
            <p className="text-sm text-muted-foreground">
              Enter page numbers separated by commas. Use hyphen for ranges.
              {pageCount && ` (Total pages: ${pageCount})`}
            </p>
          </div>
        </div>
      );

    case "rotate":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Rotation Angle</Label>
            <Select
              value={options.rotation || "90"}
              onValueChange={(value) =>
                updateOption("rotation", value as "90" | "180" | "270")
              }
            >
              <SelectTrigger data-testid="select-rotation">
                <SelectValue placeholder="Select angle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="90">90° Clockwise</SelectItem>
                <SelectItem value="180">180°</SelectItem>
                <SelectItem value="270">270° Clockwise (90° Counter-clockwise)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );

    case "compress":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Compression Level</Label>
            <Select
              value={options.compressionLevel || "medium"}
              onValueChange={(value) =>
                updateOption("compressionLevel", value as "low" | "medium" | "high")
              }
            >
              <SelectTrigger data-testid="select-compression">
                <SelectValue placeholder="Select compression level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low (Larger file, better quality)</SelectItem>
                <SelectItem value="medium">Medium (Balanced)</SelectItem>
                <SelectItem value="high">High (Smaller file, lower quality)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );

    case "pdf-to-images":
      return null;

    case "watermark":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="watermarkText">Watermark Text</Label>
            <Input
              id="watermarkText"
              placeholder="e.g., CONFIDENTIAL"
              value={options.watermarkText || ""}
              onChange={(e) => updateOption("watermarkText", e.target.value)}
              data-testid="input-watermark-text"
            />
          </div>
          <div className="space-y-2">
            <Label>Position</Label>
            <Select
              value={options.watermarkPosition || "center"}
              onValueChange={(value) =>
                updateOption(
                  "watermarkPosition",
                  value as ToolOptions["watermarkPosition"]
                )
              }
            >
              <SelectTrigger data-testid="select-watermark-position">
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="top-left">Top Left</SelectItem>
                <SelectItem value="top-right">Top Right</SelectItem>
                <SelectItem value="bottom-left">Bottom Left</SelectItem>
                <SelectItem value="bottom-right">Bottom Right</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );

    case "add-page-numbers":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Position</Label>
            <Select
              value={options.pageNumberPosition || "bottom-center"}
              onValueChange={(value) =>
                updateOption(
                  "pageNumberPosition",
                  value as ToolOptions["pageNumberPosition"]
                )
              }
            >
              <SelectTrigger data-testid="select-page-number-position">
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bottom-center">Bottom Center</SelectItem>
                <SelectItem value="bottom-left">Bottom Left</SelectItem>
                <SelectItem value="bottom-right">Bottom Right</SelectItem>
                <SelectItem value="top-center">Top Center</SelectItem>
                <SelectItem value="top-left">Top Left</SelectItem>
                <SelectItem value="top-right">Top Right</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );

    case "protect":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter password to protect PDF"
              value={options.password || ""}
              onChange={(e) => updateOption("password", e.target.value)}
              data-testid="input-password"
            />
            <p className="text-sm text-muted-foreground">
              This password will be required to open the PDF.
            </p>
          </div>
        </div>
      );

    case "unlock":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="unlockPassword">Current Password</Label>
            <Input
              id="unlockPassword"
              type="password"
              placeholder="Enter current PDF password"
              value={options.unlockPassword || ""}
              onChange={(e) => updateOption("unlockPassword", e.target.value)}
              data-testid="input-unlock-password"
            />
            <p className="text-sm text-muted-foreground">
              Enter the password used to protect this PDF.
            </p>
          </div>
        </div>
      );

    default:
      return null;
  }
}
