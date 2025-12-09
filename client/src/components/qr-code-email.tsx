import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function QrCodeEmail() {
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateQrCode = async () => {
    if (!email) {
      toast({ title: "Error", description: "Please enter an email address.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/qr-code/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, subject, body }),
      });
      if (!response.ok) throw new Error("Failed to generate QR code");
      const blob = await response.blob();
      setQrCodeUrl(URL.createObjectURL(blob));
      toast({ title: "QR Code Generated", description: "Your email QR code is ready to download." });
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
    a.download = `email-qr-${email}.png`;
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
          <CardTitle className="text-lg">Email Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contact@example.com"
              data-testid="input-email-address"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Subject (Optional)</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter email subject"
              data-testid="input-email-subject"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="body">Message Body (Optional)</Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Enter pre-filled message..."
              rows={4}
              data-testid="textarea-email-body"
            />
          </div>
          <Button onClick={generateQrCode} disabled={loading || !email} className="w-full" data-testid="button-generate-email-qr">
            {loading ? "Generating..." : "Generate QR Code"}
          </Button>
        </CardContent>
      </Card>

      {qrCodeUrl && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Email QR Code</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <img src={qrCodeUrl} alt="Email QR Code" className="max-w-[256px] rounded-md border" data-testid="img-email-qr" />
            <Button onClick={downloadQrCode} data-testid="button-download-email-qr">
              <Download className="h-4 w-4 mr-2" />
              Download QR Code
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
