import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, Upload, Copy, Check, ScanLine } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function BarcodeReader() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<{ data: string; format: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const scan = async () => {
    if (!file) {
      toast({ title: "Please select an image file", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/barcode/read", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      
      if (data.success) {
        setResult({ data: data.data, format: data.format });
        toast({ title: "Barcode/QR code detected successfully" });
      } else {
        toast({ title: data.error || "No barcode or QR code found in image", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Failed to read barcode", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.data);
      setCopied(true);
      toast({ title: "Copied to clipboard" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Upload Image with Barcode or QR Code</Label>
            <div className="flex gap-2">
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                data-testid="input-file"
              />
              {file && (
                <Button variant="outline" onClick={reset} data-testid="button-reset">
                  Clear
                </Button>
              )}
            </div>
          </div>

          {preview && (
            <div className="space-y-4">
              <div className="border rounded-lg p-4 bg-muted/50">
                <img src={preview} alt="Preview" className="max-w-full max-h-[300px] mx-auto object-contain" data-testid="img-preview" />
              </div>
              <Button onClick={scan} disabled={isLoading} className="w-full" data-testid="button-scan">
                {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ScanLine className="h-4 w-4 mr-2" />}
                Scan for Barcode/QR Code
              </Button>
            </div>
          )}

          {result && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center justify-between">
                <Label>Detected {result.format}</Label>
                <Button size="sm" variant="outline" onClick={copyToClipboard} data-testid="button-copy">
                  {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
              <div className="p-3 bg-background rounded border font-mono text-sm break-all" data-testid="text-result">
                {result.data}
              </div>
              {result.data.startsWith("http") && (
                <Button variant="outline" onClick={() => window.open(result.data, "_blank")} className="w-full" data-testid="button-open-url">
                  Open URL in New Tab
                </Button>
              )}
            </div>
          )}

          {!preview && !result && (
            <div 
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Click or drag an image with a barcode or QR code</p>
              <p className="text-sm text-muted-foreground mt-2">Supports: JPG, PNG, WEBP, GIF</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
