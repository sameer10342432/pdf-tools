import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Download, Eye } from "lucide-react";

type ColorBlindnessType = 
  | "normal"
  | "protanopia"
  | "deuteranopia"
  | "tritanopia"
  | "achromatopsia"
  | "protanomaly"
  | "deuteranomaly"
  | "tritanomaly";

const colorBlindnessTypes: { value: ColorBlindnessType; label: string; description: string }[] = [
  { value: "normal", label: "Normal Vision", description: "No color vision deficiency" },
  { value: "protanopia", label: "Protanopia", description: "Red-blind (1% of men)" },
  { value: "deuteranopia", label: "Deuteranopia", description: "Green-blind (1% of men)" },
  { value: "tritanopia", label: "Tritanopia", description: "Blue-blind (very rare)" },
  { value: "achromatopsia", label: "Achromatopsia", description: "Complete color blindness" },
  { value: "protanomaly", label: "Protanomaly", description: "Red-weak (1% of men)" },
  { value: "deuteranomaly", label: "Deuteranomaly", description: "Green-weak (5% of men)" },
  { value: "tritanomaly", label: "Tritanomaly", description: "Blue-weak (very rare)" },
];

const colorMatrices: Record<ColorBlindnessType, number[]> = {
  normal: [1, 0, 0, 0, 1, 0, 0, 0, 1],
  protanopia: [0.567, 0.433, 0, 0.558, 0.442, 0, 0, 0.242, 0.758],
  deuteranopia: [0.625, 0.375, 0, 0.7, 0.3, 0, 0, 0.3, 0.7],
  tritanopia: [0.95, 0.05, 0, 0, 0.433, 0.567, 0, 0.475, 0.525],
  achromatopsia: [0.299, 0.587, 0.114, 0.299, 0.587, 0.114, 0.299, 0.587, 0.114],
  protanomaly: [0.817, 0.183, 0, 0.333, 0.667, 0, 0, 0.125, 0.875],
  deuteranomaly: [0.8, 0.2, 0, 0.258, 0.742, 0, 0, 0.142, 0.858],
  tritanomaly: [0.967, 0.033, 0, 0, 0.733, 0.267, 0, 0.183, 0.817],
};

export function ColorBlindnessSimulator() {
  const [image, setImage] = useState<string | null>(null);
  const [type, setType] = useState<ColorBlindnessType>("protanopia");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const originalCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const applyColorBlindness = useCallback((matrix: number[], imageData: ImageData) => {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      data[i] = r * matrix[0] + g * matrix[1] + b * matrix[2];
      data[i + 1] = r * matrix[3] + g * matrix[4] + b * matrix[5];
      data[i + 2] = r * matrix[6] + g * matrix[7] + b * matrix[8];
    }
    return imageData;
  }, []);

  useEffect(() => {
    if (!image) return;
    
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      const originalCanvas = originalCanvasRef.current;
      if (!canvas || !originalCanvas) return;

      const ctx = canvas.getContext("2d");
      const originalCtx = originalCanvas.getContext("2d");
      if (!ctx || !originalCtx) return;

      canvas.width = img.width;
      canvas.height = img.height;
      originalCanvas.width = img.width;
      originalCanvas.height = img.height;

      originalCtx.drawImage(img, 0, 0);
      ctx.drawImage(img, 0, 0);

      if (type !== "normal") {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const modified = applyColorBlindness(colorMatrices[type], imageData);
        ctx.putImageData(modified, 0, 0);
      }
    };
    img.src = image;
  }, [image, type, applyColorBlindness]);

  const downloadImage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement("a");
    link.download = `color-blindness-${type}.png`;
    link.href = canvas.toDataURL();
    link.click();
  }, [type]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Color Blindness Simulator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            data-testid="input-cb-image"
          />
          
          {!image ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover-elevate transition-colors"
              data-testid="dropzone-cb-image"
            >
              <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground mt-2">Click to upload an image</p>
              <p className="text-sm text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Color Blindness Type</label>
                <Select value={type} onValueChange={(v) => setType(v as ColorBlindnessType)}>
                  <SelectTrigger data-testid="select-cb-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {colorBlindnessTypes.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        <div>
                          <div className="font-medium">{t.label}</div>
                          <div className="text-xs text-muted-foreground">{t.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Original</h3>
                  <canvas
                    ref={originalCanvasRef}
                    className="w-full h-auto rounded-lg border"
                    data-testid="canvas-original"
                  />
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-2">Simulated: {colorBlindnessTypes.find(t => t.value === type)?.label}</h3>
                  <canvas
                    ref={canvasRef}
                    className="w-full h-auto rounded-lg border"
                    data-testid="canvas-simulated"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => fileInputRef.current?.click()} variant="outline" data-testid="button-change-image">
                  <Upload className="w-4 h-4 mr-2" />
                  Change Image
                </Button>
                <Button onClick={downloadImage} data-testid="button-download-cb">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
