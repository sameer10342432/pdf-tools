import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function QrCodeEvent() {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateQrCode = async () => {
    if (!title || !startDate || !startTime) {
      toast({ title: "Error", description: "Please enter event title, start date and time.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/qr-code/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, location, description, startDate, startTime, endDate, endTime }),
      });
      if (!response.ok) throw new Error("Failed to generate QR code");
      const blob = await response.blob();
      setQrCodeUrl(URL.createObjectURL(blob));
      toast({ title: "QR Code Generated", description: "Your event QR code is ready to download." });
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
    a.download = `event-qr-${title.replace(/\s+/g, "-")}.png`;
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
          <CardTitle className="text-lg">Event Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Team Meeting"
              data-testid="input-event-title"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="123 Main St or https://zoom.us/..."
              data-testid="input-event-location"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                data-testid="input-event-start-date"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                data-testid="input-event-start-time"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date (Optional)</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                data-testid="input-event-end-date"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time (Optional)</Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                data-testid="input-event-end-time"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Event description..."
              rows={3}
              data-testid="textarea-event-description"
            />
          </div>
          <Button onClick={generateQrCode} disabled={loading || !title || !startDate || !startTime} className="w-full" data-testid="button-generate-event-qr">
            {loading ? "Generating..." : "Generate QR Code"}
          </Button>
        </CardContent>
      </Card>

      {qrCodeUrl && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Event QR Code</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <img src={qrCodeUrl} alt="Event QR Code" className="max-w-[256px] rounded-md border" data-testid="img-event-qr" />
            <Button onClick={downloadQrCode} data-testid="button-download-event-qr">
              <Download className="h-4 w-4 mr-2" />
              Download QR Code
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
