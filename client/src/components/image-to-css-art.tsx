import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Upload, Copy, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function ImageToCssArt() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [cssOutput, setCssOutput] = useState<string | null>(null);
  const [resolution, setResolution] = useState(32);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
      setCssOutput(null);
    }
  }, []);

  const generateCssArt = async () => {
    if (!imageFile) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("resolution", resolution.toString());
      const response = await fetch("/api/image-to-css-art", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to convert image");
      const data = await response.json();
      setCssOutput(data.css);
      toast({ title: "CSS Art Generated", description: "Your image has been converted to CSS box-shadow art." });
    } catch (e) {
      toast({ title: "Error", description: "Failed to generate CSS art.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (cssOutput) {
      await navigator.clipboard.writeText(cssOutput);
      toast({ title: "Copied", description: "CSS code copied to clipboard." });
    }
  };

  const downloadCss = () => {
    if (!cssOutput) return;
    const blob = new Blob([cssOutput], { type: "text/css" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "css-art.css";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upload Image</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="image">Select Image</Label>
            <div className="flex items-center gap-4">
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                data-testid="input-css-art-image"
              />
              <Button variant="outline" onClick={() => document.getElementById("image")?.click()} data-testid="button-upload-css-art">
                <Upload className="h-4 w-4 mr-2" />
                Choose Image
              </Button>
              {imageFile && <span className="text-sm text-muted-foreground">{imageFile.name}</span>}
            </div>
          </div>
          {preview && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <img src={preview} alt="Preview" className="max-w-[200px] rounded-md border" data-testid="img-css-art-preview" />
            </div>
          )}
          <div className="space-y-2">
            <Label>Resolution: {resolution}px</Label>
            <Slider
              value={[resolution]}
              onValueChange={([v]) => setResolution(v)}
              min={8}
              max={64}
              step={4}
              data-testid="slider-css-art-resolution"
            />
            <p className="text-sm text-muted-foreground">Lower values create smaller CSS files, higher values create more detail</p>
          </div>
          <Button onClick={generateCssArt} disabled={loading || !imageFile} className="w-full" data-testid="button-generate-css-art">
            {loading ? "Generating..." : "Generate CSS Art"}
          </Button>
        </CardContent>
      </Card>

      {cssOutput && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
            <CardTitle className="text-lg">Generated CSS</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copyToClipboard} data-testid="button-copy-css-art">
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </Button>
              <Button variant="outline" size="sm" onClick={downloadCss} data-testid="button-download-css-art">
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <pre className="p-4 bg-muted rounded-md overflow-auto max-h-64 text-xs font-mono" data-testid="text-css-output">
              {cssOutput.slice(0, 5000)}{cssOutput.length > 5000 ? "..." : ""}
            </pre>
            <p className="text-sm text-muted-foreground mt-2">
              Use this CSS with a 1x1 pixel div element to render the art.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
