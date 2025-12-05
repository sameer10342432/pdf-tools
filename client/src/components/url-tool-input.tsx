import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Search, Globe, Link2, Wifi, Server, MapPin, FileCode, Shuffle, AlertCircle } from "lucide-react";

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
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (toolType === "what-is-my-ip") {
      onSubmit({});
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
          {toolType !== "what-is-my-ip" && (
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
            disabled={isLoading || (toolType !== "what-is-my-ip" && !inputValue.trim())}
            className="w-full"
            data-testid="button-analyze"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                {toolType === "what-is-my-ip" ? "Get My IP Address" : "Analyze"}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
