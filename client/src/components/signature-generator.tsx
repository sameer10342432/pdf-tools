import { useState, useCallback, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PenLine, Download, Trash2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SIGNATURE_FONTS = [
  { id: 'dancing', name: 'Dancing Script', family: "'Dancing Script', cursive" },
  { id: 'pacifico', name: 'Pacifico', family: "'Pacifico', cursive" },
  { id: 'satisfy', name: 'Satisfy', family: "'Satisfy', cursive" },
  { id: 'greatvibes', name: 'Great Vibes', family: "'Great Vibes', cursive" },
  { id: 'allura', name: 'Allura', family: "'Allura', cursive" },
  { id: 'sacramento', name: 'Sacramento', family: "'Sacramento', cursive" },
];

const SIGNATURE_COLORS = [
  { id: 'black', name: 'Black', value: '#000000' },
  { id: 'blue', name: 'Blue', value: '#1e40af' },
  { id: 'darkblue', name: 'Navy', value: '#1e3a5f' },
  { id: 'gray', name: 'Gray', value: '#4b5563' },
  { id: 'red', name: 'Red', value: '#991b1b' },
  { id: 'brown', name: 'Brown', value: '#78350f' },
];

export function SignatureGenerator() {
  const [name, setName] = useState("");
  const [font, setFont] = useState("dancing");
  const [color, setColor] = useState("blue");
  const [size, setSize] = useState(48);
  const [slant, setSlant] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const selectedFont = SIGNATURE_FONTS.find(f => f.id === font) || SIGNATURE_FONTS[0];
  const selectedColor = SIGNATURE_COLORS.find(c => c.id === color) || SIGNATURE_COLORS[0];

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&family=Pacifico&family=Satisfy&family=Great+Vibes&family=Allura&family=Sacramento&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  const generateSignature = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !name.trim()) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((slant * Math.PI) / 180);
    
    ctx.font = `${size}px ${selectedFont.family}`;
    ctx.fillStyle = selectedColor.value;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(name, 0, 0);
    
    ctx.restore();
  }, [name, size, slant, selectedFont, selectedColor]);

  useEffect(() => {
    if (name.trim()) {
      const timer = setTimeout(generateSignature, 100);
      return () => clearTimeout(timer);
    }
  }, [name, font, color, size, slant, generateSignature]);

  const handleDownloadPNG = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !name.trim()) return;

    const link = document.createElement('a');
    link.download = `signature-${name.replace(/\s+/g, '-').toLowerCase()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    toast({ title: "Downloaded", description: "Signature saved as PNG." });
  }, [name, toast]);

  const handleDownloadSVG = useCallback(() => {
    if (!name.trim()) return;

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="150">
      <style>@import url('https://fonts.googleapis.com/css2?family=${selectedFont.name.replace(' ', '+')}&amp;display=swap');</style>
      <text x="250" y="75" font-family="${selectedFont.family}" font-size="${size}" fill="${selectedColor.value}" text-anchor="middle" dominant-baseline="middle" transform="rotate(${slant}, 250, 75)">${name}</text>
    </svg>`;

    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `signature-${name.replace(/\s+/g, '-').toLowerCase()}.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);

    toast({ title: "Downloaded", description: "Signature saved as SVG." });
  }, [name, size, slant, selectedFont, selectedColor, toast]);

  const handleClear = useCallback(() => {
    setName("");
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    toast({ title: "Cleared", description: "Signature has been cleared." });
  }, [toast]);

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <PenLine className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">Signature Generator</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleDownloadPNG} disabled={!name.trim()} data-testid="button-download-png">
              <Download className="h-4 w-4 mr-1" /> PNG
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadSVG} disabled={!name.trim()} data-testid="button-download-svg">
              <Download className="h-4 w-4 mr-1" /> SVG
            </Button>
            <Button variant="outline" size="sm" onClick={handleClear} data-testid="button-clear">
              <Trash2 className="h-4 w-4 mr-1" /> Clear
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Your Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="text-lg"
              data-testid="input-name"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Font Style</label>
              <Select value={font} onValueChange={setFont}>
                <SelectTrigger data-testid="select-font">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SIGNATURE_FONTS.map(f => (
                    <SelectItem key={f.id} value={f.id} style={{ fontFamily: f.family }}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Color</label>
              <Select value={color} onValueChange={setColor}>
                <SelectTrigger data-testid="select-color">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SIGNATURE_COLORS.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: c.value }} />
                        {c.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium">Size: {size}px</label>
              </div>
              <Slider
                value={[size]}
                onValueChange={([val]) => setSize(val)}
                min={24}
                max={72}
                step={2}
                data-testid="slider-size"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium">Slant: {slant}°</label>
              </div>
              <Slider
                value={[slant]}
                onValueChange={([val]) => setSlant(val)}
                min={-15}
                max={15}
                step={1}
                data-testid="slider-slant"
              />
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-medium mb-3">Preview</h3>
        <div className="bg-white border rounded-lg p-4 flex items-center justify-center min-h-[150px]">
          <canvas
            ref={canvasRef}
            width={500}
            height={150}
            className="max-w-full"
            data-testid="signature-canvas"
          />
          {!name.trim() && (
            <p className="text-muted-foreground text-center absolute">Enter your name to generate a signature</p>
          )}
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-medium mb-3">Quick Styles</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {SIGNATURE_FONTS.map(f => (
            <Button
              key={f.id}
              variant={font === f.id ? "default" : "outline"}
              size="sm"
              onClick={() => setFont(f.id)}
              className="justify-start"
              style={{ fontFamily: f.family }}
              data-testid={`button-font-${f.id}`}
            >
              {name || "Signature"}
            </Button>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-medium mb-2">Tips</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>Download as PNG for documents with transparent background</li>
          <li>Download as SVG for scalable vector graphics</li>
          <li>Adjust slant for a more natural handwritten look</li>
          <li>Blue signatures are commonly used for official documents</li>
        </ul>
      </Card>
    </div>
  );
}
