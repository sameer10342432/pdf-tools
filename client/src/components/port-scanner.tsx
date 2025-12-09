import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RotateCcw, Search, CheckCircle2, XCircle, Server, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PortResult {
  port: number;
  status: "open" | "closed" | "filtered";
  service: string;
}

interface ScanResult {
  host: string;
  scanTime: number;
  ports: PortResult[];
  error?: string;
}

const commonPorts = [
  { port: 21, name: "FTP" },
  { port: 22, name: "SSH" },
  { port: 23, name: "Telnet" },
  { port: 25, name: "SMTP" },
  { port: 53, name: "DNS" },
  { port: 80, name: "HTTP" },
  { port: 110, name: "POP3" },
  { port: 143, name: "IMAP" },
  { port: 443, name: "HTTPS" },
  { port: 465, name: "SMTPS" },
  { port: 587, name: "SMTP Submission" },
  { port: 993, name: "IMAPS" },
  { port: 995, name: "POP3S" },
  { port: 3306, name: "MySQL" },
  { port: 3389, name: "RDP" },
  { port: 5432, name: "PostgreSQL" },
  { port: 5900, name: "VNC" },
  { port: 6379, name: "Redis" },
  { port: 8080, name: "HTTP Proxy" },
  { port: 8443, name: "HTTPS Alt" },
];

export function PortScanner() {
  const { toast } = useToast();
  const [host, setHost] = useState("");
  const [customPorts, setCustomPorts] = useState("");
  const [selectedPorts, setSelectedPorts] = useState<number[]>([21, 22, 80, 443, 3306, 8080]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ScanResult | null>(null);

  const togglePort = (port: number) => {
    setSelectedPorts(prev => 
      prev.includes(port) 
        ? prev.filter(p => p !== port)
        : [...prev, port]
    );
  };

  const selectAllCommon = () => {
    setSelectedPorts(commonPorts.map(p => p.port));
  };

  const clearAll = () => {
    setSelectedPorts([]);
  };

  const scanPorts = async () => {
    if (!host.trim()) {
      toast({
        title: "Error",
        description: "Please enter a hostname or IP address",
        variant: "destructive",
      });
      return;
    }

    const portsToScan = [...selectedPorts];
    
    if (customPorts.trim()) {
      const custom = customPorts.split(",")
        .map(p => parseInt(p.trim()))
        .filter(p => !isNaN(p) && p > 0 && p <= 65535);
      custom.forEach(p => {
        if (!portsToScan.includes(p)) {
          portsToScan.push(p);
        }
      });
    }

    if (portsToScan.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one port to scan",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setProgress(0);
    setResult(null);

    try {
      const response = await fetch("/api/scan-ports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ host: host.trim(), ports: portsToScan }),
      });

      if (!response.ok) {
        throw new Error("Failed to scan ports");
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        host: host.trim(),
        scanTime: 0,
        ports: [],
        error: "Failed to scan ports. Please check the hostname and try again."
      });
    } finally {
      setIsLoading(false);
      setProgress(100);
    }
  };

  const getServiceName = (port: number): string => {
    const found = commonPorts.find(p => p.port === port);
    return found?.name || "Unknown";
  };

  const reset = () => {
    setHost("");
    setCustomPorts("");
    setResult(null);
    setProgress(0);
  };

  const openPorts = result?.ports.filter(p => p.status === "open") || [];
  const closedPorts = result?.ports.filter(p => p.status === "closed") || [];

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Hostname or IP Address</Label>
            <Input
              value={host}
              onChange={(e) => setHost(e.target.value)}
              placeholder="example.com or 192.168.1.1"
              data-testid="input-host"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <Label>Common Ports</Label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAllCommon} data-testid="button-select-all">
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={clearAll} data-testid="button-clear-all">
                  Clear
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {commonPorts.map(({ port, name }) => (
                <div 
                  key={port} 
                  className="flex items-center space-x-2 p-2 bg-muted rounded cursor-pointer"
                  onClick={() => togglePort(port)}
                >
                  <Checkbox
                    checked={selectedPorts.includes(port)}
                    onCheckedChange={() => togglePort(port)}
                    data-testid={`checkbox-port-${port}`}
                  />
                  <span className="text-sm">{port} ({name})</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Custom Ports (comma-separated)</Label>
            <Input
              value={customPorts}
              onChange={(e) => setCustomPorts(e.target.value)}
              placeholder="8000, 9000, 27017"
              data-testid="input-custom-ports"
            />
          </div>

          <Button onClick={scanPorts} disabled={isLoading} className="w-full" data-testid="button-scan">
            {isLoading ? (
              <>Scanning...</>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" /> Scan Ports
              </>
            )}
          </Button>
        </div>
      </Card>

      {isLoading && (
        <Card className="p-6">
          <div className="space-y-4 text-center">
            <Server className="h-12 w-12 mx-auto text-primary animate-pulse" />
            <p className="text-muted-foreground">Scanning ports...</p>
            <Progress value={progress} className="w-full" />
          </div>
        </Card>
      )}

      {result && !isLoading && (
        <>
          {result.error ? (
            <Card className="p-6 border-destructive">
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-destructive" />
                <div>
                  <p className="font-medium text-destructive">Scan Error</p>
                  <p className="text-sm text-muted-foreground">{result.error}</p>
                </div>
              </div>
            </Card>
          ) : (
            <>
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Server className="h-5 w-5 text-primary" />
                  <Label className="font-medium text-lg">Scan Results for {result.host}</Label>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-muted rounded text-center">
                    <p className="text-3xl font-bold" data-testid="output-total">{result.ports.length}</p>
                    <p className="text-sm text-muted-foreground">Ports Scanned</p>
                  </div>
                  <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded text-center">
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400" data-testid="output-open">
                      {openPorts.length}
                    </p>
                    <p className="text-sm text-muted-foreground">Open</p>
                  </div>
                  <div className="p-4 bg-muted rounded text-center">
                    <p className="text-3xl font-bold" data-testid="output-closed">{closedPorts.length}</p>
                    <p className="text-sm text-muted-foreground">Closed</p>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4">
                  Scan completed in {result.scanTime}ms
                </p>
              </Card>

              {openPorts.length > 0 && (
                <Card className="p-6">
                  <Label className="font-medium text-lg mb-4 block">Open Ports</Label>
                  <div className="space-y-2">
                    {openPorts.map((port) => (
                      <div 
                        key={port.port} 
                        className="flex items-center justify-between p-3 bg-green-100 dark:bg-green-900/30 rounded"
                      >
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                          <span className="font-mono font-medium" data-testid={`output-port-${port.port}`}>
                            Port {port.port}
                          </span>
                        </div>
                        <Badge variant="secondary">{port.service || getServiceName(port.port)}</Badge>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {closedPorts.length > 0 && (
                <Card className="p-6">
                  <Label className="font-medium text-lg mb-4 block">Closed Ports</Label>
                  <div className="flex flex-wrap gap-2">
                    {closedPorts.map((port) => (
                      <div 
                        key={port.port} 
                        className="flex items-center gap-2 px-3 py-1 bg-muted rounded"
                      >
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{port.port}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </>
          )}
        </>
      )}

      <Card className="p-6">
        <Label className="font-medium text-lg mb-4 block">About Port Scanning</Label>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>Port scanning checks which network ports are open on a server. Open ports indicate services that are accepting connections. This tool performs basic connectivity checks to common service ports.</p>
          <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded">
            <p className="font-medium text-yellow-800 dark:text-yellow-200">Important Notice</p>
            <p className="text-yellow-700 dark:text-yellow-300">Only scan systems you own or have explicit permission to test. Unauthorized port scanning may be illegal in some jurisdictions.</p>
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
