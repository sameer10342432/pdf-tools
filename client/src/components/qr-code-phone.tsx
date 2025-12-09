import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function QrCodePhone() {
  const [phone, setPhone] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateQrCode = async () => {
    if (!phone) {
      toast({ title: "Error", description: "Please enter a phone number.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/qr-code/phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      if (!response.ok) throw new Error("Failed to generate QR code");
      const blob = await response.blob();
      setQrCodeUrl(URL.createObjectURL(blob));
      toast({ title: "QR Code Generated", description: "Your phone QR code is ready to download." });
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
    a.download = `phone-qr-${phone}.png`;
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
          <CardTitle className="text-lg">Phone Number</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1234567890"
              data-testid="input-phone-number"
            />
            <p className="text-sm text-muted-foreground">
              Include country code for international numbers (e.g., +1 for USA)
            </p>
          </div>
          <Button onClick={generateQrCode} disabled={loading || !phone} className="w-full" data-testid="button-generate-phone-qr">
            {loading ? "Generating..." : "Generate QR Code"}
          </Button>
        </CardContent>
      </Card>

      {qrCodeUrl && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Phone QR Code</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <img src={qrCodeUrl} alt="Phone QR Code" className="max-w-[256px] rounded-md border" data-testid="img-phone-qr" />
            <Button onClick={downloadQrCode} data-testid="button-download-phone-qr">
              <Download className="h-4 w-4 mr-2" />
              Download QR Code
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
