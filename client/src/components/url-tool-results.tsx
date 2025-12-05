import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Globe, 
  Link2, 
  Server, 
  MapPin,
  Shield,
  Zap,
  ArrowRight,
  Copy,
  Check
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface UrlToolResultsProps {
  toolType: string;
  data: any;
}

export function UrlToolResults({ toolType, data }: UrlToolResultsProps) {
  if (!data) return null;
  
  const renderBacklinkResults = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-primary" data-testid="text-total-backlinks">{data.totalBacklinks?.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total Backlinks</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-blue-500" data-testid="text-referring-domains">{data.referringDomains}</div>
            <div className="text-sm text-muted-foreground">Referring Domains</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-green-500">{data.dofollow}%</div>
            <div className="text-sm text-muted-foreground">Dofollow</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-orange-500">{data.domainAuthority}</div>
            <div className="text-sm text-muted-foreground">Domain Authority</div>
          </CardContent>
        </Card>
      </div>
      
      {data.topReferringDomains && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Top Referring Domains</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.topReferringDomains.map((domain: any, i: number) => (
                <div key={i} className="flex justify-between items-center p-2 bg-muted/50 rounded-md">
                  <span className="font-medium">{domain.domain}</span>
                  <Badge variant="secondary">{domain.backlinks} links</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
  
  const renderBrokenLinkResults = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold">{data.totalLinksFound}</div>
            <div className="text-sm text-muted-foreground">Total Links Found</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-green-500">{data.workingLinks}</div>
            <div className="text-sm text-muted-foreground">Working Links</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-red-500">{data.brokenLinks}</div>
            <div className="text-sm text-muted-foreground">Broken Links</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold">{data.linksChecked}</div>
            <div className="text-sm text-muted-foreground">Links Checked</div>
          </CardContent>
        </Card>
      </div>
      
      {data.brokenLinksList && data.brokenLinksList.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><XCircle className="h-5 w-5 text-red-500" />Broken Links</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.brokenLinksList.map((link: any, i: number) => (
                <div key={i} className="flex justify-between items-center p-2 bg-red-50 dark:bg-red-950/30 rounded-md">
                  <span className="text-sm truncate max-w-md">{link.url}</span>
                  <Badge variant="destructive">Status: {link.status || "Error"}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
  
  const renderSpeedTestResults = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-4xl font-bold" style={{ color: data.performance?.grade === "A" ? "#22c55e" : data.performance?.grade === "B" ? "#84cc16" : data.performance?.grade === "C" ? "#eab308" : "#ef4444" }}>
              {data.performance?.grade}
            </div>
            <div className="text-sm text-muted-foreground">Performance Grade</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold">{data.metrics?.ttfb}ms</div>
            <div className="text-sm text-muted-foreground">Time to First Byte</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold">{data.metrics?.totalLoadTime}ms</div>
            <div className="text-sm text-muted-foreground">Total Load Time</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold">{data.metrics?.pageSizeFormatted}</div>
            <div className="text-sm text-muted-foreground">Page Size</div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader><CardTitle className="text-lg">Resources</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div><div className="text-2xl font-bold">{data.resources?.scripts}</div><div className="text-sm text-muted-foreground">Scripts</div></div>
            <div><div className="text-2xl font-bold">{data.resources?.stylesheets}</div><div className="text-sm text-muted-foreground">Stylesheets</div></div>
            <div><div className="text-2xl font-bold">{data.resources?.images}</div><div className="text-sm text-muted-foreground">Images</div></div>
          </div>
        </CardContent>
      </Card>
      
      {data.recommendations && data.recommendations.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-yellow-500" />Recommendations</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.recommendations.map((rec: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Zap className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  {rec}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
  
  const renderPingResults = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2"><Server className="h-5 w-5" />{data.host}</span>
            <Badge variant={data.status === "reachable" ? "default" : "destructive"}>
              {data.status === "reachable" ? <CheckCircle2 className="h-4 w-4 mr-1" /> : <XCircle className="h-4 w-4 mr-1" />}
              {data.status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div><div className="text-2xl font-bold">{data.packets?.sent}</div><div className="text-sm text-muted-foreground">Packets Sent</div></div>
            <div><div className="text-2xl font-bold text-green-500">{data.packets?.received}</div><div className="text-sm text-muted-foreground">Received</div></div>
            <div><div className="text-2xl font-bold text-red-500">{data.packets?.lost}</div><div className="text-sm text-muted-foreground">Lost</div></div>
            <div><div className="text-2xl font-bold">{data.packets?.lossPercent}</div><div className="text-sm text-muted-foreground">Loss %</div></div>
          </div>
          
          {data.latency && (
            <div className="mt-6 grid grid-cols-3 gap-4 text-center border-t pt-4">
              <div><div className="text-xl font-bold text-green-500">{data.latency.min}ms</div><div className="text-sm text-muted-foreground">Min Latency</div></div>
              <div><div className="text-xl font-bold text-blue-500">{data.latency.avg}ms</div><div className="text-sm text-muted-foreground">Avg Latency</div></div>
              <div><div className="text-xl font-bold text-orange-500">{data.latency.max}ms</div><div className="text-sm text-muted-foreground">Max Latency</div></div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
  
  const renderWhoisResults = () => (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5" />{data.domain}</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex justify-between"><span className="text-muted-foreground">Registrar:</span><span className="font-medium">{data.registrar}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Organization:</span><span className="font-medium">{data.registrantOrg}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Country:</span><span className="font-medium">{data.registrantCountry}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Domain Age:</span><span className="font-medium">{data.domainAge}</span></div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between"><span className="text-muted-foreground">Created:</span><span className="font-medium">{data.createdDate}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Updated:</span><span className="font-medium">{data.updatedDate}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Expires:</span><span className="font-medium">{data.expiryDate}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">DNSSEC:</span><span className="font-medium">{data.dnssec}</span></div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <div className="text-sm font-medium mb-2">Name Servers:</div>
          <div className="flex flex-wrap gap-2">
            {data.nameServers?.map((ns: string, i: number) => (
              <Badge key={i} variant="secondary">{ns}</Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
  
  const renderDnsResults = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5" />DNS Records for {data.domain}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {data.A && data.A.length > 0 && (
            <div><div className="font-medium mb-1">A Records (IPv4):</div>
              <div className="flex flex-wrap gap-2">{data.A.map((ip: string, i: number) => <Badge key={i} variant="secondary">{ip}</Badge>)}</div>
            </div>
          )}
          {data.AAAA && data.AAAA.length > 0 && (
            <div><div className="font-medium mb-1">AAAA Records (IPv6):</div>
              <div className="flex flex-wrap gap-2">{data.AAAA.map((ip: string, i: number) => <Badge key={i} variant="secondary">{ip}</Badge>)}</div>
            </div>
          )}
          {data.MX && data.MX.length > 0 && (
            <div><div className="font-medium mb-1">MX Records (Mail):</div>
              <div className="flex flex-wrap gap-2">{data.MX.map((mx: any, i: number) => <Badge key={i} variant="secondary">{mx.exchange} (Priority: {mx.priority})</Badge>)}</div>
            </div>
          )}
          {data.NS && data.NS.length > 0 && (
            <div><div className="font-medium mb-1">NS Records (Nameservers):</div>
              <div className="flex flex-wrap gap-2">{data.NS.map((ns: string, i: number) => <Badge key={i} variant="secondary">{ns}</Badge>)}</div>
            </div>
          )}
          {data.TXT && data.TXT.length > 0 && (
            <div><div className="font-medium mb-1">TXT Records:</div>
              <div className="space-y-1">{data.TXT.map((txt: string, i: number) => <div key={i} className="text-sm bg-muted p-2 rounded-md break-all">{txt}</div>)}</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
  
  const renderIpLookupResults = () => (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" />{data.ip}</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex justify-between"><span className="text-muted-foreground">Type:</span><Badge>{data.type}</Badge></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Country:</span><span className="font-medium">{data.country}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Region:</span><span className="font-medium">{data.region}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">City:</span><span className="font-medium">{data.city}</span></div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between"><span className="text-muted-foreground">ISP:</span><span className="font-medium">{data.isp}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Organization:</span><span className="font-medium">{data.org}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Timezone:</span><span className="font-medium">{data.timezone}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">ASN:</span><span className="font-medium">{data.asn}</span></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
  
  const renderHttpHeaderResults = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold">{data.statusCode}</div>
            <div className="text-sm text-muted-foreground">{data.statusText}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold" style={{ color: data.security?.grade === "A" ? "#22c55e" : data.security?.grade === "B" ? "#84cc16" : "#ef4444" }}>
              {data.security?.grade}
            </div>
            <div className="text-sm text-muted-foreground">Security Grade</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold">{data.security?.score}%</div>
            <div className="text-sm text-muted-foreground">Security Score</div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Shield className="h-5 w-5" />Security Headers</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {[
              { key: "hasHSTS", label: "HSTS" },
              { key: "hasCSP", label: "CSP" },
              { key: "hasXFrameOptions", label: "X-Frame-Options" },
              { key: "hasXContentTypeOptions", label: "X-Content-Type" },
              { key: "hasXXSSProtection", label: "XSS Protection" },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center gap-2">
                {data.security?.[key] ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                <span className="text-sm">{label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader><CardTitle className="text-lg">Response Headers</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {Object.entries(data.headers || {}).map(([key, value]) => (
              <div key={key} className="flex gap-2 text-sm">
                <span className="font-mono text-muted-foreground min-w-32">{key}:</span>
                <span className="font-mono break-all">{String(value)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
  
  const renderRedirectResults = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold">{data.redirectCount}</div>
            <div className="text-sm text-muted-foreground">Redirects</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold">{data.finalStatus}</div>
            <div className="text-sm text-muted-foreground">Final Status</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            {data.hasRedirects ? (
              <Badge variant="secondary" className="text-lg py-1">Has Redirects</Badge>
            ) : (
              <Badge variant="default" className="text-lg py-1">Direct</Badge>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader><CardTitle className="text-lg">Redirect Chain</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.redirectChain?.map((step: any, i: number) => (
              <div key={i} className="flex items-center gap-2">
                <Badge variant={step.status >= 300 && step.status < 400 ? "secondary" : step.status === 200 ? "default" : "destructive"}>
                  {step.status}
                </Badge>
                <span className="text-sm truncate flex-1">{step.url}</span>
                {i < data.redirectChain.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {data.recommendations && data.recommendations.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-yellow-500" />Recommendations</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.recommendations.map((rec: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Zap className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  {rec}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
  
  const CopyButton = ({ text, label }: { text: string; label: string }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };
    return (
      <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1">
        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        {label}
      </Button>
    );
  };

  const ColorPreview = ({ color, size = "lg" }: { color: string; size?: "sm" | "md" | "lg" }) => {
    const sizeClasses = size === "lg" ? "w-24 h-24" : size === "md" ? "w-16 h-16" : "w-10 h-10";
    return (
      <div 
        className={`${sizeClasses} rounded-md border shadow-sm`} 
        style={{ backgroundColor: color }}
        data-testid="color-preview"
      />
    );
  };

  const renderHexToRgbResults = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle className="text-lg">Conversion Result</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <ColorPreview color={data.hex} />
            <div className="space-y-2">
              <div className="text-2xl font-bold">{data.hex}</div>
              <div className="text-lg text-muted-foreground">{data.rgbString}</div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted rounded-md">
              <div className="text-sm text-muted-foreground mb-1">HEX</div>
              <div className="flex items-center justify-between gap-2">
                <code className="text-lg font-mono">{data.hex}</code>
                <CopyButton text={data.hex} label="Copy" />
              </div>
            </div>
            <div className="p-4 bg-muted rounded-md">
              <div className="text-sm text-muted-foreground mb-1">RGB</div>
              <div className="flex items-center justify-between gap-2">
                <code className="text-lg font-mono">{data.rgbString}</code>
                <CopyButton text={data.rgbString} label="Copy" />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-red-100 dark:bg-red-950 rounded-md">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{data.rgb?.r}</div>
              <div className="text-sm text-muted-foreground">Red</div>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-950 rounded-md">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{data.rgb?.g}</div>
              <div className="text-sm text-muted-foreground">Green</div>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-950 rounded-md">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{data.rgb?.b}</div>
              <div className="text-sm text-muted-foreground">Blue</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderRgbToHexResults = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle className="text-lg">Conversion Result</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <ColorPreview color={data.hex} />
            <div className="space-y-2">
              <div className="text-2xl font-bold">{data.hex}</div>
              <div className="text-lg text-muted-foreground">rgb({data.rgb?.r}, {data.rgb?.g}, {data.rgb?.b})</div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted rounded-md">
              <div className="text-sm text-muted-foreground mb-1">HEX</div>
              <div className="flex items-center justify-between gap-2">
                <code className="text-lg font-mono">{data.hex}</code>
                <CopyButton text={data.hex} label="Copy" />
              </div>
            </div>
            {data.shortHex && (
              <div className="p-4 bg-muted rounded-md">
                <div className="text-sm text-muted-foreground mb-1">Short HEX</div>
                <div className="flex items-center justify-between gap-2">
                  <code className="text-lg font-mono">{data.shortHex}</code>
                  <CopyButton text={data.shortHex} label="Copy" />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderHexToHslResults = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle className="text-lg">Conversion Result</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <ColorPreview color={data.hex} />
            <div className="space-y-2">
              <div className="text-2xl font-bold">{data.hex}</div>
              <div className="text-lg text-muted-foreground">{data.hslString}</div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted rounded-md">
              <div className="text-sm text-muted-foreground mb-1">HEX</div>
              <div className="flex items-center justify-between gap-2">
                <code className="text-lg font-mono">{data.hex}</code>
                <CopyButton text={data.hex} label="Copy" />
              </div>
            </div>
            <div className="p-4 bg-muted rounded-md">
              <div className="text-sm text-muted-foreground mb-1">HSL</div>
              <div className="flex items-center justify-between gap-2">
                <code className="text-lg font-mono">{data.hslString}</code>
                <CopyButton text={data.hslString} label="Copy" />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-muted rounded-md">
              <div className="text-2xl font-bold">{data.hsl?.h}°</div>
              <div className="text-sm text-muted-foreground">Hue</div>
            </div>
            <div className="p-3 bg-muted rounded-md">
              <div className="text-2xl font-bold">{data.hsl?.s}%</div>
              <div className="text-sm text-muted-foreground">Saturation</div>
            </div>
            <div className="p-3 bg-muted rounded-md">
              <div className="text-2xl font-bold">{data.hsl?.l}%</div>
              <div className="text-sm text-muted-foreground">Lightness</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderRgbToCmykResults = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle className="text-lg">Print Color Conversion</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <ColorPreview color={`rgb(${data.rgb?.r}, ${data.rgb?.g}, ${data.rgb?.b})`} />
            <div className="space-y-2">
              <div className="text-lg">RGB: rgb({data.rgb?.r}, {data.rgb?.g}, {data.rgb?.b})</div>
              <div className="text-lg text-muted-foreground">{data.cmykString}</div>
            </div>
          </div>
          
          <div className="p-4 bg-muted rounded-md">
            <div className="text-sm text-muted-foreground mb-1">CMYK</div>
            <div className="flex items-center justify-between gap-2">
              <code className="text-lg font-mono">{data.cmykString}</code>
              <CopyButton text={data.cmykString} label="Copy" />
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-cyan-100 dark:bg-cyan-950 rounded-md">
              <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{data.cmyk?.c}%</div>
              <div className="text-sm text-muted-foreground">Cyan</div>
            </div>
            <div className="p-3 bg-pink-100 dark:bg-pink-950 rounded-md">
              <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">{data.cmyk?.m}%</div>
              <div className="text-sm text-muted-foreground">Magenta</div>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-950 rounded-md">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{data.cmyk?.y}%</div>
              <div className="text-sm text-muted-foreground">Yellow</div>
            </div>
            <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-md">
              <div className="text-2xl font-bold">{data.cmyk?.k}%</div>
              <div className="text-sm text-muted-foreground">Key (Black)</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderColorPaletteResults = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Base Color: <ColorPreview color={data.baseColor} size="sm" />
            <code className="font-mono">{data.baseColor}</code>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(data.palettes || {}).map(([name, colors]: [string, any]) => (
            <div key={name}>
              <div className="font-medium mb-2 capitalize">{name.replace(/([A-Z])/g, ' $1').trim()}</div>
              <div className="flex gap-2 flex-wrap">
                {colors.map((color: string, i: number) => (
                  <div key={i} className="text-center">
                    <div 
                      className="w-16 h-16 rounded-md border shadow-sm cursor-pointer hover:scale-105 transition-transform" 
                      style={{ backgroundColor: color }}
                      onClick={() => navigator.clipboard.writeText(color)}
                      title="Click to copy"
                    />
                    <code className="text-xs">{color}</code>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  const renderGradientResults = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle className="text-lg">Generated Gradients</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(data.gradients || {}).map(([type, gradient]: [string, any]) => (
            <div key={type} className="space-y-2">
              <div className="font-medium capitalize">{type} Gradient</div>
              <div 
                className="h-24 rounded-md border" 
                style={{ background: gradient.css }}
              />
              <div className="p-3 bg-muted rounded-md">
                <div className="flex items-center justify-between gap-2">
                  <code className="text-sm font-mono break-all">{data.cssCode?.[type]}</code>
                  <CopyButton text={data.cssCode?.[type]} label="Copy" />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  const renderBoxShadowResults = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle className="text-lg">Box Shadow Preview</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center p-8 bg-muted rounded-md">
            <div 
              className="w-32 h-32 bg-card rounded-md"
              style={{ boxShadow: data.value }}
            />
          </div>
          
          <div className="p-4 bg-muted rounded-md">
            <div className="text-sm text-muted-foreground mb-1">CSS Code</div>
            <div className="flex items-center justify-between gap-2">
              <code className="font-mono">{data.css}</code>
              <CopyButton text={data.css} label="Copy" />
            </div>
          </div>
          
          <div>
            <div className="font-medium mb-2">Preset Shadows</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(data.presets || {}).map(([name, css]: [string, any]) => (
                <div key={name} className="p-3 bg-muted rounded-md">
                  <div className="text-sm font-medium capitalize mb-1">{name}</div>
                  <div className="flex items-center justify-between gap-2">
                    <code className="text-xs font-mono truncate">{css}</code>
                    <CopyButton text={css} label="Copy" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderBorderRadiusResults = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle className="text-lg">Border Radius Preview</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center p-8 bg-muted rounded-md">
            <div 
              className="w-32 h-32 bg-primary"
              style={{ borderRadius: data.css?.replace('border-radius: ', '').replace(';', '') }}
            />
          </div>
          
          <div className="p-4 bg-muted rounded-md">
            <div className="text-sm text-muted-foreground mb-1">CSS Code</div>
            <div className="flex items-center justify-between gap-2">
              <code className="font-mono">{data.css}</code>
              <CopyButton text={data.css} label="Copy" />
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-muted rounded-md">
              <div className="text-xl font-bold">{data.values?.tl}px</div>
              <div className="text-xs text-muted-foreground">Top Left</div>
            </div>
            <div className="p-3 bg-muted rounded-md">
              <div className="text-xl font-bold">{data.values?.tr}px</div>
              <div className="text-xs text-muted-foreground">Top Right</div>
            </div>
            <div className="p-3 bg-muted rounded-md">
              <div className="text-xl font-bold">{data.values?.br}px</div>
              <div className="text-xs text-muted-foreground">Bottom Right</div>
            </div>
            <div className="p-3 bg-muted rounded-md">
              <div className="text-xl font-bold">{data.values?.bl}px</div>
              <div className="text-xs text-muted-foreground">Bottom Left</div>
            </div>
          </div>
          
          <div>
            <div className="font-medium mb-2">Preset Shapes</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(data.presets || {}).map(([name, css]: [string, any]) => (
                <div key={name} className="p-3 bg-muted rounded-md text-center">
                  <div className="text-sm font-medium capitalize mb-1">{name}</div>
                  <CopyButton text={css} label="Copy" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderColorPickerResults = () => (
    <Card>
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          {data.message && <p className="text-muted-foreground">{data.message}</p>}
          {data.instructions && (
            <ol className="text-left space-y-2">
              {data.instructions.map((step: string, i: number) => (
                <li key={i} className="flex gap-2">
                  <span className="font-bold">{i + 1}.</span>
                  {step}
                </li>
              ))}
            </ol>
          )}
          {data.browserSupport && (
            <div className="mt-4 p-4 bg-muted rounded-md text-left">
              <div className="font-medium mb-2">Browser Support</div>
              <ul className="text-sm space-y-1">
                <li>Chrome: {data.browserSupport.chrome}</li>
                <li>Edge: {data.browserSupport.edge}</li>
                <li>Opera: {data.browserSupport.opera}</li>
              </ul>
              <p className="text-xs text-muted-foreground mt-2">{data.browserSupport.note}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  switch (toolType) {
    case "backlink-checker": return renderBacklinkResults();
    case "broken-link-checker": return renderBrokenLinkResults();
    case "website-speed-test": return renderSpeedTestResults();
    case "ping-tool": return renderPingResults();
    case "whois-lookup": return renderWhoisResults();
    case "dns-lookup": return renderDnsResults();
    case "ip-address-lookup":
    case "what-is-my-ip": return renderIpLookupResults();
    case "http-header-viewer": return renderHttpHeaderResults();
    case "redirect-checker": return renderRedirectResults();
    case "hex-to-rgb": return renderHexToRgbResults();
    case "rgb-to-hex": return renderRgbToHexResults();
    case "hex-to-hsl": return renderHexToHslResults();
    case "rgb-to-cmyk": return renderRgbToCmykResults();
    case "color-palette-generator": return renderColorPaletteResults();
    case "gradient-generator": return renderGradientResults();
    case "box-shadow-generator": return renderBoxShadowResults();
    case "border-radius-generator": return renderBorderRadiusResults();
    case "color-picker-screen":
    case "color-picker-image": return renderColorPickerResults();
    default: return (
      <Card>
        <CardContent className="p-4">
          <pre className="text-sm overflow-auto">{JSON.stringify(data, null, 2)}</pre>
        </CardContent>
      </Card>
    );
  }
}
