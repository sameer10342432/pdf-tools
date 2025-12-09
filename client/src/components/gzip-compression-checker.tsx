import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RotateCcw, Search, CheckCircle2, XCircle, AlertCircle, FileArchive, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CompressionResult {
  url: string;
  isCompressed: boolean;
  contentEncoding: string | null;
  originalSize: number | null;
  compressedSize: number | null;
  savings: number | null;
  contentType: string | null;
  server: string | null;
  responseTime: number;
  error?: string;
}

export function GzipCompressionChecker() {
  const { toast } = useToast();
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CompressionResult | null>(null);

  const checkCompression = async () => {
    if (!url.trim()) {
      toast({
        title: "Error",
        description: "Please enter a URL",
        variant: "destructive",
      });
      return;
    }

    let checkUrl = url.trim();
    if (!checkUrl.startsWith("http://") && !checkUrl.startsWith("https://")) {
      checkUrl = "https://" + checkUrl;
    }

    try {
      new URL(checkUrl);
    } catch {
      toast({
        title: "Error",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/check-gzip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: checkUrl }),
      });

      if (!response.ok) {
        throw new Error("Failed to check compression");
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        url: checkUrl,
        isCompressed: false,
        contentEncoding: null,
        originalSize: null,
        compressedSize: null,
        savings: null,
        contentType: null,
        server: null,
        responseTime: 0,
        error: "Failed to check URL. The server may not be accessible or CORS restrictions may apply."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatBytes = (bytes: number | null): string => {
    if (bytes === null) return "Unknown";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const reset = () => {
    setUrl("");
    setResult(null);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Website URL</Label>
            <div className="flex gap-2 flex-wrap">
              <Input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="flex-1"
                onKeyDown={(e) => e.key === "Enter" && checkCompression()}
                data-testid="input-url"
              />
              <Button onClick={checkCompression} disabled={isLoading} data-testid="button-check">
                {isLoading ? (
                  <>Checking...</>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" /> Check
                  </>
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Enter a URL to check if the server supports GZIP or Brotli compression
            </p>
          </div>
        </div>
      </Card>

      {isLoading && (
        <Card className="p-6">
          <div className="space-y-4 text-center">
            <Globe className="h-12 w-12 mx-auto text-primary animate-pulse" />
            <p className="text-muted-foreground">Checking compression settings...</p>
            <Progress value={undefined} className="w-full" />
          </div>
        </Card>
      )}

      {result && !isLoading && (
        <>
          {result.error ? (
            <Card className="p-6 border-destructive">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-8 w-8 text-destructive" />
                <div>
                  <p className="font-medium text-destructive">Error</p>
                  <p className="text-sm text-muted-foreground">{result.error}</p>
                </div>
              </div>
            </Card>
          ) : (
            <>
              <Card className="p-6">
                <div className="flex items-center gap-4">
                  {result.isCompressed ? (
                    <CheckCircle2 className="h-12 w-12 text-green-500" />
                  ) : (
                    <XCircle className="h-12 w-12 text-red-500" />
                  )}
                  <div>
                    <p className="text-2xl font-bold" data-testid="output-status">
                      {result.isCompressed ? "Compression Enabled" : "Compression Not Detected"}
                    </p>
                    <p className="text-muted-foreground" data-testid="output-url">{result.url}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileArchive className="h-5 w-5 text-primary" />
                  <Label className="font-medium text-lg">Compression Details</Label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex justify-between p-3 bg-muted rounded">
                      <span className="text-muted-foreground">Content-Encoding</span>
                      <span className="font-medium" data-testid="output-encoding">
                        {result.contentEncoding || "None"}
                      </span>
                    </div>
                    <div className="flex justify-between p-3 bg-muted rounded">
                      <span className="text-muted-foreground">Content-Type</span>
                      <span className="font-medium" data-testid="output-content-type">
                        {result.contentType || "Unknown"}
                      </span>
                    </div>
                    <div className="flex justify-between p-3 bg-muted rounded">
                      <span className="text-muted-foreground">Server</span>
                      <span className="font-medium" data-testid="output-server">
                        {result.server || "Unknown"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between p-3 bg-muted rounded">
                      <span className="text-muted-foreground">Response Size</span>
                      <span className="font-medium" data-testid="output-size">
                        {formatBytes(result.compressedSize || result.originalSize)}
                      </span>
                    </div>
                    <div className="flex justify-between p-3 bg-muted rounded">
                      <span className="text-muted-foreground">Response Time</span>
                      <span className="font-medium" data-testid="output-time">
                        {result.responseTime}ms
                      </span>
                    </div>
                    {result.savings !== null && result.savings > 0 && (
                      <div className="flex justify-between p-3 bg-green-100 dark:bg-green-900/30 rounded">
                        <span className="text-muted-foreground">Estimated Savings</span>
                        <span className="font-medium text-green-600 dark:text-green-400" data-testid="output-savings">
                          ~{result.savings}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {!result.isCompressed && (
                <Card className="p-6">
                  <Label className="font-medium text-lg mb-4 block">How to Enable Compression</Label>
                  <div className="space-y-4 text-sm">
                    <div className="p-4 bg-muted rounded">
                      <p className="font-medium mb-2">Apache (.htaccess)</p>
                      <pre className="text-xs overflow-x-auto">
{`<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/css
  AddOutputFilterByType DEFLATE text/javascript application/javascript
  AddOutputFilterByType DEFLATE application/json application/xml
</IfModule>`}
                      </pre>
                    </div>
                    <div className="p-4 bg-muted rounded">
                      <p className="font-medium mb-2">Nginx</p>
                      <pre className="text-xs overflow-x-auto">
{`gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml;
gzip_min_length 1000;`}
                      </pre>
                    </div>
                  </div>
                </Card>
              )}
            </>
          )}
        </>
      )}

      <Card className="p-6">
        <Label className="font-medium text-lg mb-4 block">About GZIP Compression</Label>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>GZIP compression reduces the size of files sent from your server, making your website load faster. Most modern browsers support GZIP and will automatically decompress content.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
            <div className="p-3 bg-muted rounded text-center">
              <p className="text-2xl font-bold text-foreground">70%</p>
              <p>Average size reduction for text files</p>
            </div>
            <div className="p-3 bg-muted rounded text-center">
              <p className="text-2xl font-bold text-foreground">Faster</p>
              <p>Page load times</p>
            </div>
            <div className="p-3 bg-muted rounded text-center">
              <p className="text-2xl font-bold text-foreground">SEO</p>
              <p>Better search rankings</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button variant="outline" onClick={reset} data-testid="button-reset">
          <RotateCcw className="h-4 w-4 mr-2" /> Reset
        </Button>
      </div>
    </div>
  );
}
