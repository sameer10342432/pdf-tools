import { useState, useCallback, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, RotateCcw, Network, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SubnetResult {
  networkAddress: string;
  broadcastAddress: string;
  firstHost: string;
  lastHost: string;
  subnetMask: string;
  wildcardMask: string;
  totalHosts: number;
  usableHosts: number;
  cidr: number;
  ipClass: string;
  ipType: string;
  binaryMask: string;
  binaryNetwork: string;
}

function ipToNumber(ip: string): number {
  const parts = ip.split(".").map(Number);
  return (parts[0] << 24) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
}

function numberToIp(num: number): string {
  return [
    (num >>> 24) & 255,
    (num >>> 16) & 255,
    (num >>> 8) & 255,
    num & 255
  ].join(".");
}

function ipToBinary(ip: string): string {
  return ip.split(".").map(octet => 
    parseInt(octet).toString(2).padStart(8, "0")
  ).join(".");
}

function cidrToMask(cidr: number): number {
  return cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0;
}

function maskToCidr(mask: number): number {
  let cidr = 0;
  let m = mask >>> 0;
  while (m) {
    cidr += m & 1;
    m >>>= 1;
  }
  return cidr;
}

function getIpClass(ip: string): string {
  const firstOctet = parseInt(ip.split(".")[0]);
  if (firstOctet < 128) return "A";
  if (firstOctet < 192) return "B";
  if (firstOctet < 224) return "C";
  if (firstOctet < 240) return "D (Multicast)";
  return "E (Reserved)";
}

function getIpType(ip: string): string {
  const parts = ip.split(".").map(Number);
  const first = parts[0];
  const second = parts[1];
  
  if (first === 10) return "Private (Class A)";
  if (first === 172 && second >= 16 && second <= 31) return "Private (Class B)";
  if (first === 192 && second === 168) return "Private (Class C)";
  if (first === 127) return "Loopback";
  if (first === 169 && second === 254) return "Link-Local (APIPA)";
  if (first >= 224 && first <= 239) return "Multicast";
  if (first >= 240) return "Reserved";
  return "Public";
}

function validateIp(ip: string): boolean {
  const parts = ip.split(".");
  if (parts.length !== 4) return false;
  return parts.every(part => {
    const num = parseInt(part);
    return !isNaN(num) && num >= 0 && num <= 255 && part === num.toString();
  });
}

export function SubnetCalculator() {
  const { toast } = useToast();
  const [ipAddress, setIpAddress] = useState("192.168.1.1");
  const [cidr, setCidr] = useState(24);
  const [result, setResult] = useState<SubnetResult | null>(null);
  const [error, setError] = useState("");

  const calculate = useCallback(() => {
    if (!ipAddress.trim()) {
      setError("Please enter an IP address");
      setResult(null);
      return;
    }

    if (!validateIp(ipAddress)) {
      setError("Invalid IP address format");
      setResult(null);
      return;
    }

    setError("");

    const ipNum = ipToNumber(ipAddress);
    const maskNum = cidrToMask(cidr);
    const wildcardNum = (~maskNum) >>> 0;
    
    const networkNum = (ipNum & maskNum) >>> 0;
    const broadcastNum = (networkNum | wildcardNum) >>> 0;
    
    const totalHosts = Math.pow(2, 32 - cidr);
    const usableHosts = cidr >= 31 ? (cidr === 32 ? 1 : 2) : totalHosts - 2;
    
    const firstHostNum = cidr >= 31 ? networkNum : networkNum + 1;
    const lastHostNum = cidr >= 31 ? broadcastNum : broadcastNum - 1;

    setResult({
      networkAddress: numberToIp(networkNum),
      broadcastAddress: numberToIp(broadcastNum),
      firstHost: numberToIp(firstHostNum),
      lastHost: numberToIp(lastHostNum),
      subnetMask: numberToIp(maskNum),
      wildcardMask: numberToIp(wildcardNum),
      totalHosts,
      usableHosts,
      cidr,
      ipClass: getIpClass(ipAddress),
      ipType: getIpType(ipAddress),
      binaryMask: ipToBinary(numberToIp(maskNum)),
      binaryNetwork: ipToBinary(numberToIp(networkNum))
    });
  }, [ipAddress, cidr]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied",
        description: "Copied to clipboard",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to copy",
        variant: "destructive",
      });
    }
  };

  const reset = () => {
    setIpAddress("192.168.1.1");
    setCidr(24);
    setResult(null);
    setError("");
  };

  const cidrOptions = Array.from({ length: 33 }, (_, i) => i);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>IP Address</Label>
              <Input
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                placeholder="192.168.1.1"
                data-testid="input-ip-address"
              />
            </div>
            <div className="space-y-2">
              <Label>CIDR Notation</Label>
              <Select value={cidr.toString()} onValueChange={(v) => setCidr(parseInt(v))}>
                <SelectTrigger data-testid="select-cidr">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {cidrOptions.map(c => (
                    <SelectItem key={c} value={c.toString()}>
                      /{c} ({Math.pow(2, 32 - c).toLocaleString()} addresses)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      </Card>

      {result && (
        <>
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Network className="h-5 w-5 text-primary" />
              <Label className="font-medium text-lg">Subnet Information</Label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-muted rounded">
                  <span className="text-muted-foreground">Network Address</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-medium" data-testid="output-network">{result.networkAddress}</span>
                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard(result.networkAddress)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded">
                  <span className="text-muted-foreground">Broadcast Address</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-medium" data-testid="output-broadcast">{result.broadcastAddress}</span>
                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard(result.broadcastAddress)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded">
                  <span className="text-muted-foreground">First Host</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-medium" data-testid="output-first-host">{result.firstHost}</span>
                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard(result.firstHost)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded">
                  <span className="text-muted-foreground">Last Host</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-medium" data-testid="output-last-host">{result.lastHost}</span>
                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard(result.lastHost)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-muted rounded">
                  <span className="text-muted-foreground">Subnet Mask</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-medium" data-testid="output-subnet-mask">{result.subnetMask}</span>
                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard(result.subnetMask)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded">
                  <span className="text-muted-foreground">Wildcard Mask</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-medium" data-testid="output-wildcard">{result.wildcardMask}</span>
                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard(result.wildcardMask)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded">
                  <span className="text-muted-foreground">Total Hosts</span>
                  <span className="font-mono font-medium" data-testid="output-total-hosts">{result.totalHosts.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded">
                  <span className="text-muted-foreground">Usable Hosts</span>
                  <span className="font-mono font-medium" data-testid="output-usable-hosts">{result.usableHosts.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Info className="h-5 w-5 text-primary" />
              <Label className="font-medium text-lg">Additional Information</Label>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-muted rounded text-center">
                <p className="text-sm text-muted-foreground">IP Class</p>
                <p className="text-xl font-bold" data-testid="output-ip-class">{result.ipClass}</p>
              </div>
              <div className="p-4 bg-muted rounded text-center">
                <p className="text-sm text-muted-foreground">IP Type</p>
                <p className="text-xl font-bold" data-testid="output-ip-type">{result.ipType}</p>
              </div>
              <div className="p-4 bg-muted rounded text-center">
                <p className="text-sm text-muted-foreground">CIDR Notation</p>
                <p className="text-xl font-bold" data-testid="output-cidr">/{result.cidr}</p>
              </div>
              <div className="p-4 bg-muted rounded text-center">
                <p className="text-sm text-muted-foreground">Host Bits</p>
                <p className="text-xl font-bold">{32 - result.cidr}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <Label className="font-medium text-lg mb-4 block">Binary Representation</Label>
            <div className="space-y-3">
              <div className="p-3 bg-muted rounded">
                <p className="text-sm text-muted-foreground mb-1">Network Address (Binary)</p>
                <p className="font-mono text-sm break-all" data-testid="output-binary-network">{result.binaryNetwork}</p>
              </div>
              <div className="p-3 bg-muted rounded">
                <p className="text-sm text-muted-foreground mb-1">Subnet Mask (Binary)</p>
                <p className="font-mono text-sm break-all" data-testid="output-binary-mask">{result.binaryMask}</p>
              </div>
            </div>
          </Card>
        </>
      )}

      <div className="flex justify-end">
        <Button variant="outline" onClick={reset} data-testid="button-reset">
          <RotateCcw className="h-4 w-4 mr-2" /> Reset
        </Button>
      </div>
    </div>
  );
}
