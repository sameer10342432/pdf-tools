import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Link, ExternalLink, CheckCircle2, BarChart3, QrCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShortenedUrl {
  shortCode: string;
  originalUrl: string;
  clicks: number;
  createdAt: Date;
}

export function UrlShortener() {
  const [url, setUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [shortenedUrl, setShortenedUrl] = useState<ShortenedUrl | null>(null);
  const [lookupCode, setLookupCode] = useState("");
  const [lookupResult, setLookupResult] = useState<{ originalUrl: string; clicks: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<ShortenedUrl[]>([]);
  const [showQr, setShowQr] = useState(false);
  const { toast } = useToast();

  const shortenUrl = async () => {
    if (!url.trim()) {
      toast({ title: "Please enter a URL", variant: "destructive" });
      return;
    }
    let finalUrl = url;
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      finalUrl = "https://" + url;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: finalUrl, customAlias: customAlias.trim() || undefined }),
      });
      const data = await res.json();
      if (data.success) {
        const newUrl: ShortenedUrl = {
          shortCode: data.shortCode,
          originalUrl: finalUrl,
          clicks: 0,
          createdAt: new Date(),
        };
        setShortenedUrl(newUrl);
        setHistory([newUrl, ...history.slice(0, 9)]);
        toast({ title: "URL shortened successfully!" });
      } else {
        toast({ title: data.error || "Failed to shorten URL", variant: "destructive" });
      }
    } catch {
      toast({ title: "Failed to shorten URL", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const lookupUrl = async () => {
    if (!lookupCode.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/shorten/${lookupCode}`);
      const data = await res.json();
      if (data.success) {
        setLookupResult({ originalUrl: data.originalUrl, clicks: data.clicks });
      } else {
        toast({ title: "Short URL not found", variant: "destructive" });
      }
    } catch {
      toast({ title: "Failed to lookup URL", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard!" });
  };

  const getShortUrl = (code: string) => `${window.location.origin}/s/${code}`;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Link className="h-5 w-5" /> Shorten URL
            </h3>
            <div className="space-y-2">
              <Label>Long URL</Label>
              <Input
                placeholder="https://example.com/very/long/url/here"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                data-testid="input-url"
              />
            </div>
            <div className="space-y-2">
              <Label>Custom Alias (optional)</Label>
              <Input
                placeholder="my-custom-link"
                value={customAlias}
                onChange={(e) => setCustomAlias(e.target.value.replace(/[^a-zA-Z0-9-]/g, ""))}
                data-testid="input-alias"
              />
            </div>
            <Button onClick={shortenUrl} disabled={isLoading} className="w-full" data-testid="button-shorten">
              {isLoading ? "Shortening..." : "Shorten URL"}
            </Button>
            {shortenedUrl && (
              <div className="p-4 bg-muted rounded-lg space-y-3">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">URL Shortened!</span>
                </div>
                <div className="flex gap-2">
                  <Input value={getShortUrl(shortenedUrl.shortCode)} readOnly className="font-mono" data-testid="input-short-url" />
                  <Button size="icon" variant="outline" onClick={() => copyToClipboard(getShortUrl(shortenedUrl.shortCode))} data-testid="button-copy-url">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="outline" onClick={() => window.open(getShortUrl(shortenedUrl.shortCode), "_blank")} data-testid="button-open-url">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowQr(!showQr)} data-testid="button-toggle-qr">
                  <QrCode className="h-4 w-4 mr-2" /> {showQr ? "Hide" : "Show"} QR Code
                </Button>
                {showQr && (
                  <div className="flex justify-center p-4 bg-white rounded">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(getShortUrl(shortenedUrl.shortCode))}`}
                      alt="QR Code"
                      className="w-36 h-36"
                      data-testid="img-qr-code"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <BarChart3 className="h-5 w-5" /> URL Analytics
            </h3>
            <div className="space-y-2">
              <Label>Short Code</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter short code to lookup"
                  value={lookupCode}
                  onChange={(e) => setLookupCode(e.target.value)}
                  data-testid="input-lookup"
                />
                <Button onClick={lookupUrl} disabled={isLoading} data-testid="button-lookup">
                  Lookup
                </Button>
              </div>
            </div>
            {lookupResult && (
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <p className="font-medium">Original URL:</p>
                <p className="text-sm text-muted-foreground break-all" data-testid="text-original-url">{lookupResult.originalUrl}</p>
                <div className="flex items-center gap-2 mt-2">
                  <BarChart3 className="h-4 w-4" />
                  <span className="font-medium" data-testid="text-clicks">{lookupResult.clicks} clicks</span>
                </div>
              </div>
            )}
            {history.length > 0 && (
              <div className="space-y-2">
                <Label>Recent URLs</Label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {history.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-muted rounded text-sm" data-testid={`history-item-${i}`}>
                      <span className="font-mono truncate flex-1">{getShortUrl(item.shortCode)}</span>
                      <Button size="icon" variant="ghost" onClick={() => copyToClipboard(getShortUrl(item.shortCode))}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
