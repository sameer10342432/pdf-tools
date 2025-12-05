import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Search, Globe, Link2, Wifi, Server, MapPin, FileCode, Shuffle, AlertCircle, Pipette, Image, RefreshCw, Printer, Palette, Sparkles, Square, SquareStack } from "lucide-react";

interface UrlToolInputProps {
  toolType: string;
  onSubmit: (data: { url?: string; domain?: string; ip?: string }) => void;
  isLoading: boolean;
}

const toolConfig: Record<string, { 
  inputType: "url" | "domain" | "ip" | "any";
  placeholder: string;
  label: string;
  icon: typeof Globe;
  description: string;
}> = {
  "backlink-checker": {
    inputType: "domain",
    placeholder: "example.com",
    label: "Domain or URL",
    icon: Link2,
    description: "Enter a domain to analyze its backlink profile"
  },
  "broken-link-checker": {
    inputType: "url",
    placeholder: "https://example.com",
    label: "Website URL",
    icon: AlertCircle,
    description: "Enter a URL to scan for broken links"
  },
  "website-speed-test": {
    inputType: "url",
    placeholder: "https://example.com",
    label: "Website URL",
    icon: Wifi,
    description: "Enter a URL to test page load speed"
  },
  "ping-tool": {
    inputType: "any",
    placeholder: "example.com or 8.8.8.8",
    label: "Domain or IP Address",
    icon: Server,
    description: "Enter a domain or IP to ping"
  },
  "whois-lookup": {
    inputType: "domain",
    placeholder: "example.com",
    label: "Domain Name",
    icon: Search,
    description: "Enter a domain to lookup registration info"
  },
  "dns-lookup": {
    inputType: "domain",
    placeholder: "example.com",
    label: "Domain Name",
    icon: Globe,
    description: "Enter a domain to query DNS records"
  },
  "ip-address-lookup": {
    inputType: "ip",
    placeholder: "8.8.8.8 or example.com",
    label: "IP Address or Domain",
    icon: MapPin,
    description: "Enter an IP address or domain for geolocation"
  },
  "what-is-my-ip": {
    inputType: "any",
    placeholder: "",
    label: "",
    icon: Wifi,
    description: "Click the button to see your public IP address"
  },
  "http-header-viewer": {
    inputType: "url",
    placeholder: "https://example.com",
    label: "Website URL",
    icon: FileCode,
    description: "Enter a URL to view HTTP response headers"
  },
  "redirect-checker": {
    inputType: "url",
    placeholder: "https://example.com",
    label: "URL to Check",
    icon: Shuffle,
    description: "Enter a URL to trace its redirect chain"
  },
  "color-picker-screen": {
    inputType: "any",
    placeholder: "",
    label: "",
    icon: Pipette,
    description: "Click the button to pick a color from your screen"
  },
  "color-picker-image": {
    inputType: "any",
    placeholder: "",
    label: "",
    icon: Image,
    description: "Upload an image to extract colors from it"
  },
  "hex-to-rgb": {
    inputType: "any",
    placeholder: "#FF5733 or FF5733",
    label: "HEX Color Code",
    icon: RefreshCw,
    description: "Enter a HEX color code to convert to RGB"
  },
  "rgb-to-hex": {
    inputType: "any",
    placeholder: "255, 87, 51 or rgb(255, 87, 51)",
    label: "RGB Values",
    icon: RefreshCw,
    description: "Enter RGB values to convert to HEX"
  },
  "hex-to-hsl": {
    inputType: "any",
    placeholder: "#FF5733 or FF5733",
    label: "HEX Color Code",
    icon: RefreshCw,
    description: "Enter a HEX color code to convert to HSL"
  },
  "rgb-to-cmyk": {
    inputType: "any",
    placeholder: "255, 87, 51 or rgb(255, 87, 51)",
    label: "RGB Values",
    icon: Printer,
    description: "Enter RGB values to convert to CMYK for printing"
  },
  "color-palette-generator": {
    inputType: "any",
    placeholder: "#FF5733 (optional - leave empty for random)",
    label: "Base Color (optional)",
    icon: Palette,
    description: "Enter a base color or leave empty to generate random palettes"
  },
  "gradient-generator": {
    inputType: "any",
    placeholder: "#FF6B6B, #4ECDC4 (comma-separated colors)",
    label: "Colors (optional)",
    icon: Sparkles,
    description: "Enter colors separated by commas or leave empty for defaults"
  },
  "box-shadow-generator": {
    inputType: "any",
    placeholder: "5, 5, 15, 0, rgba(0,0,0,0.3)",
    label: "Shadow Parameters (optional)",
    icon: Square,
    description: "Enter shadow values: offsetX, offsetY, blur, spread, color"
  },
  "border-radius-generator": {
    inputType: "any",
    placeholder: "10, 10, 10, 10 (top-left, top-right, bottom-right, bottom-left)",
    label: "Border Radius Values (optional)",
    icon: SquareStack,
    description: "Enter radius values for each corner or a single value"
  },
};

export function UrlToolInput({ toolType, onSubmit, isLoading }: UrlToolInputProps) {
  const [inputValue, setInputValue] = useState("");
  
  const config = toolConfig[toolType] || {
    inputType: "url",
    placeholder: "https://example.com",
    label: "URL",
    icon: Globe,
    description: "Enter a URL to analyze"
  };
  
  const Icon = config.icon;
  
  const noInputTools = ["what-is-my-ip", "color-picker-screen", "color-picker-image"];
  const optionalInputTools = ["color-palette-generator", "gradient-generator", "box-shadow-generator", "border-radius-generator"];
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (noInputTools.includes(toolType) || optionalInputTools.includes(toolType)) {
      onSubmit({ url: inputValue.trim() || "" });
      return;
    }
    
    if (!inputValue.trim()) return;
    
    const value = inputValue.trim();
    
    if (config.inputType === "url") {
      const urlValue = value.startsWith("http") ? value : `https://${value}`;
      onSubmit({ url: urlValue });
    } else if (config.inputType === "domain") {
      const cleanDomain = value.replace(/^https?:\/\//, "").split("/")[0];
      onSubmit({ domain: cleanDomain });
    } else if (config.inputType === "ip") {
      const isIp = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(value);
      if (isIp) {
        onSubmit({ ip: value });
      } else {
        const cleanDomain = value.replace(/^https?:\/\//, "").split("/")[0];
        onSubmit({ domain: cleanDomain });
      }
    } else {
      const isIp = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(value);
      if (isIp) {
        onSubmit({ ip: value });
      } else if (value.startsWith("http")) {
        onSubmit({ url: value });
      } else {
        onSubmit({ domain: value });
      }
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icon className="h-5 w-5" />
          {config.description}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!noInputTools.includes(toolType) && (
            <div className="space-y-2">
              <Label htmlFor="url-input">{config.label}</Label>
              <div className="flex gap-2">
                <Input
                  id="url-input"
                  type="text"
                  placeholder={config.placeholder}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={isLoading}
                  className="flex-1"
                  data-testid="input-url"
                />
              </div>
            </div>
          )}
          
          <Button 
            type="submit" 
            disabled={isLoading || (!noInputTools.includes(toolType) && !optionalInputTools.includes(toolType) && !inputValue.trim())}
            className="w-full"
            data-testid="button-analyze"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                {toolType === "what-is-my-ip" ? "Get My IP Address" : 
                 toolType === "color-picker-screen" ? "Pick Color from Screen" :
                 toolType === "color-picker-image" ? "Upload Image" :
                 toolType === "color-palette-generator" ? "Generate Palette" :
                 toolType === "gradient-generator" ? "Generate Gradient" :
                 toolType === "box-shadow-generator" ? "Generate Shadow" :
                 toolType === "border-radius-generator" ? "Generate Radius" :
                 toolType === "hex-to-rgb" ? "Convert to RGB" :
                 toolType === "rgb-to-hex" ? "Convert to HEX" :
                 toolType === "hex-to-hsl" ? "Convert to HSL" :
                 toolType === "rgb-to-cmyk" ? "Convert to CMYK" :
                 "Analyze"}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
