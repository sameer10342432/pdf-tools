import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Loader2, Download, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const barcodeFormats = [
  { value: "code128", label: "Code 128", description: "General purpose" },
  { value: "code39", label: "Code 39", description: "Alphanumeric" },
  { value: "ean13", label: "EAN-13", description: "European products" },
  { value: "ean8", label: "EAN-8", description: "Small products" },
  { value: "upca", label: "UPC-A", description: "US products" },
  { value: "upce", label: "UPC-E", description: "Small US packages" },
  { value: "itf14", label: "ITF-14", description: "Shipping containers" },
  { value: "code93", label: "Code 93", description: "High density" },
  { value: "codabar", label: "Codabar", description: "Libraries, blood banks" },
];

export function BarcodeGenerator() {
  const [text, setText] = useState("");
  const [format, setFormat] = useState("code128");
  const [scale, setScale] = useState(3);
  const [height, setHeight] = useState(100);
  const [includeText, setIncludeText] = useState(true);
  const [barcodeImage, setBarcodeImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const generate = async () => {
    if (!text.trim()) {
      toast({ title: "Please enter text to encode", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/barcode/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, format, scale, height, includeText }),
      });
      const data = await response.json();
      if (data.success) {
        setBarcodeImage(data.barcode);
        toast({ title: "Barcode generated successfully" });
      } else {
        toast({ title: data.error || "Failed to generate barcode", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Failed to generate barcode", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const download = () => {
    if (!barcodeImage) return;
    const link = document.createElement("a");
    link.href = barcodeImage;
    link.download = `barcode-${format}-${Date.now()}.png`;
    link.click();
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Text to Encode</Label>
                <Input
                  placeholder="Enter text or numbers"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  data-testid="input-barcode-text"
                />
              </div>
              <div className="space-y-2">
                <Label>Barcode Format</Label>
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger data-testid="select-format">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {barcodeFormats.map((f) => (
                      <SelectItem key={f.value} value={f.value}>
                        {f.label} - {f.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Scale: {scale}x</Label>
                <Slider
                  value={[scale]}
                  onValueChange={([v]) => setScale(v)}
                  min={1}
                  max={5}
                  step={1}
                  data-testid="slider-scale"
                />
              </div>
              <div className="space-y-2">
                <Label>Height: {height}px</Label>
                <Slider
                  value={[height]}
                  onValueChange={([v]) => setHeight(v)}
                  min={30}
                  max={200}
                  step={10}
                  data-testid="slider-height"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Show Text Below Barcode</Label>
                <Switch checked={includeText} onCheckedChange={setIncludeText} data-testid="switch-include-text" />
              </div>
              <Button onClick={generate} disabled={isLoading || !text.trim()} className="w-full" data-testid="button-generate">
                {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                Generate Barcode
              </Button>
            </div>
            <div className="flex flex-col items-center justify-center min-h-[300px] border rounded-lg bg-white p-4">
              {barcodeImage ? (
                <div className="space-y-4 text-center">
                  <img src={barcodeImage} alt="Generated barcode" className="max-w-full h-auto" data-testid="img-barcode" />
                  <Button onClick={download} variant="outline" data-testid="button-download">
                    <Download className="h-4 w-4 mr-2" />
                    Download PNG
                  </Button>
                </div>
              ) : (
                <p className="text-muted-foreground">Barcode will appear here</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
