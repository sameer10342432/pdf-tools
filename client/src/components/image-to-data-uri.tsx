import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function ImageToDataUri() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dataUri, setDataUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
      setDataUri(null);
      convertToDataUri(file);
    }
  }, []);

  const convertToDataUri = (file: File) => {
    setLoading(true);
    const reader = new FileReader();
    reader.onload = () => {
      setDataUri(reader.result as string);
      setLoading(false);
      toast({ title: "Conversion Complete", description: "Your image has been converted to a Data URI." });
    };
    reader.onerror = () => {
      setLoading(false);
      toast({ title: "Error", description: "Failed to read the image file.", variant: "destructive" });
    };
    reader.readAsDataURL(file);
  };

  const copyToClipboard = async () => {
    if (dataUri) {
      await navigator.clipboard.writeText(dataUri);
      toast({ title: "Copied", description: "Data URI copied to clipboard." });
    }
  };

  const copyHtml = async () => {
    if (dataUri) {
      const html = `<img src="${dataUri}" alt="Embedded image" />`;
      await navigator.clipboard.writeText(html);
      toast({ title: "Copied", description: "HTML img tag copied to clipboard." });
    }
  };

  const copyCss = async () => {
    if (dataUri) {
      const css = `background-image: url(${dataUri});`;
      await navigator.clipboard.writeText(css);
      toast({ title: "Copied", description: "CSS background-image copied to clipboard." });
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1024 / 1024).toFixed(2) + " MB";
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
                data-testid="input-data-uri-image"
              />
              <Button variant="outline" onClick={() => document.getElementById("image")?.click()} data-testid="button-upload-data-uri">
                <Upload className="h-4 w-4 mr-2" />
                Choose Image
              </Button>
              {imageFile && <span className="text-sm text-muted-foreground">{imageFile.name}</span>}
            </div>
          </div>
          {preview && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <img src={preview} alt="Preview" className="max-w-[200px] rounded-md border" data-testid="img-data-uri-preview" />
            </div>
          )}
          {loading && <p className="text-sm text-muted-foreground">Converting...</p>}
        </CardContent>
      </Card>

      {dataUri && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
            <CardTitle className="text-lg">Data URI</CardTitle>
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={copyToClipboard} data-testid="button-copy-data-uri">
                <Copy className="h-4 w-4 mr-1" />
                Copy URI
              </Button>
              <Button variant="outline" size="sm" onClick={copyHtml} data-testid="button-copy-html">
                <Copy className="h-4 w-4 mr-1" />
                Copy HTML
              </Button>
              <Button variant="outline" size="sm" onClick={copyCss} data-testid="button-copy-css">
                <Copy className="h-4 w-4 mr-1" />
                Copy CSS
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>Original size: {imageFile ? formatSize(imageFile.size) : "N/A"}</p>
              <p>Data URI length: {formatSize(dataUri.length)} (characters)</p>
            </div>
            <Textarea
              value={dataUri}
              readOnly
              rows={8}
              className="font-mono text-xs"
              data-testid="textarea-data-uri-output"
            />
            <div className="space-y-2">
              <Label>HTML Usage</Label>
              <pre className="p-2 bg-muted rounded-md text-xs font-mono overflow-auto" data-testid="text-html-usage">
                {`<img src="${dataUri.slice(0, 50)}..." alt="Image" />`}
              </pre>
            </div>
            <div className="space-y-2">
              <Label>CSS Usage</Label>
              <pre className="p-2 bg-muted rounded-md text-xs font-mono overflow-auto" data-testid="text-css-usage">
                {`background-image: url(${dataUri.slice(0, 50)}...);`}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
