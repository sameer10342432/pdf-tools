import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function QrCodeWifi() {
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [encryption, setEncryption] = useState("WPA");
  const [hidden, setHidden] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateQrCode = async () => {
    if (!ssid) {
      toast({ title: "Error", description: "Please enter a network name (SSID).", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/qr-code/wifi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ssid, password, encryption, hidden }),
      });
      if (!response.ok) throw new Error("Failed to generate QR code");
      const blob = await response.blob();
      setQrCodeUrl(URL.createObjectURL(blob));
      toast({ title: "QR Code Generated", description: "Your WiFi QR code is ready to download." });
    } catch (e) {
      toast({ title: "Error", description: "Failed to generate QR code.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const downloadQrCode = () => {
    if (!qrCodeUrl) return;
    const a = document.createElement("a");
    a.href = qrCodeUrl;
    a.download = `wifi-qr-${ssid}.png`;
    a.click();
  };

  useEffect(() => {
    return () => {
      if (qrCodeUrl) URL.revokeObjectURL(qrCodeUrl);
    };
  }, [qrCodeUrl]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">WiFi Network Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ssid">Network Name (SSID)</Label>
            <Input
              id="ssid"
              value={ssid}
              onChange={(e) => setSsid(e.target.value)}
              placeholder="My WiFi Network"
              data-testid="input-wifi-ssid"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              data-testid="input-wifi-password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="encryption">Security Type</Label>
            <Select value={encryption} onValueChange={setEncryption}>
              <SelectTrigger data-testid="select-wifi-encryption">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="WPA">WPA/WPA2</SelectItem>
                <SelectItem value="WEP">WEP</SelectItem>
                <SelectItem value="nopass">None (Open)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="hidden"
              checked={hidden}
              onCheckedChange={(c) => setHidden(!!c)}
              data-testid="checkbox-wifi-hidden"
            />
            <Label htmlFor="hidden" className="text-sm">Hidden Network</Label>
          </div>
          <Button onClick={generateQrCode} disabled={loading || !ssid} className="w-full" data-testid="button-generate-wifi-qr">
            {loading ? "Generating..." : "Generate QR Code"}
          </Button>
        </CardContent>
      </Card>

      {qrCodeUrl && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your WiFi QR Code</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <img src={qrCodeUrl} alt="WiFi QR Code" className="max-w-[256px] rounded-md border" data-testid="img-wifi-qr" />
            <Button onClick={downloadQrCode} data-testid="button-download-wifi-qr">
              <Download className="h-4 w-4 mr-2" />
              Download QR Code
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
