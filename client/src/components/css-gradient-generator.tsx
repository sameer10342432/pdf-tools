import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Copy, Plus, Trash2, RotateCcw, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ColorStop {
  id: string;
  color: string;
  position: number;
}

type GradientType = "linear" | "radial" | "conic";

const presetGradients = [
  { name: "Sunset", colors: ["#ff512f", "#dd2476"], type: "linear" as GradientType, angle: 135 },
  { name: "Ocean", colors: ["#2193b0", "#6dd5ed"], type: "linear" as GradientType, angle: 90 },
  { name: "Purple", colors: ["#834d9b", "#d04ed6"], type: "linear" as GradientType, angle: 45 },
  { name: "Mango", colors: ["#ffe259", "#ffa751"], type: "linear" as GradientType, angle: 180 },
  { name: "Forest", colors: ["#134e5e", "#71b280"], type: "linear" as GradientType, angle: 120 },
  { name: "Fire", colors: ["#f12711", "#f5af19"], type: "linear" as GradientType, angle: 0 },
  { name: "Royal", colors: ["#141e30", "#243b55"], type: "linear" as GradientType, angle: 90 },
  { name: "Cotton Candy", colors: ["#ee9ca7", "#ffdde1"], type: "linear" as GradientType, angle: 45 },
];

export function CssGradientGenerator() {
  const { toast } = useToast();
  const [gradientType, setGradientType] = useState<GradientType>("linear");
  const [angle, setAngle] = useState(90);
  const [colorStops, setColorStops] = useState<ColorStop[]>([
    { id: "1", color: "#667eea", position: 0 },
    { id: "2", color: "#764ba2", position: 100 },
  ]);
  const [radialShape, setRadialShape] = useState<"circle" | "ellipse">("circle");
  const [radialPosition, setRadialPosition] = useState({ x: 50, y: 50 });
  const [copied, setCopied] = useState(false);

  const generateGradientCSS = useCallback(() => {
    const sortedStops = [...colorStops].sort((a, b) => a.position - b.position);
    const stopsString = sortedStops
      .map((stop) => `${stop.color} ${stop.position}%`)
      .join(", ");

    switch (gradientType) {
      case "linear":
        return `linear-gradient(${angle}deg, ${stopsString})`;
      case "radial":
        return `radial-gradient(${radialShape} at ${radialPosition.x}% ${radialPosition.y}%, ${stopsString})`;
      case "conic":
        return `conic-gradient(from ${angle}deg at ${radialPosition.x}% ${radialPosition.y}%, ${stopsString})`;
      default:
        return `linear-gradient(${angle}deg, ${stopsString})`;
    }
  }, [gradientType, angle, colorStops, radialShape, radialPosition]);

  const gradientCSS = generateGradientCSS();

  const addColorStop = () => {
    const newId = Date.now().toString();
    const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}`;
    const newPosition = Math.floor(Math.random() * 100);
    setColorStops([...colorStops, { id: newId, color: randomColor, position: newPosition }]);
  };

  const removeColorStop = (id: string) => {
    if (colorStops.length > 2) {
      setColorStops(colorStops.filter((stop) => stop.id !== id));
    }
  };

  const updateColorStop = (id: string, updates: Partial<ColorStop>) => {
    setColorStops(
      colorStops.map((stop) => (stop.id === id ? { ...stop, ...updates } : stop))
    );
  };

  const applyPreset = (preset: typeof presetGradients[0]) => {
    setGradientType(preset.type);
    setAngle(preset.angle);
    setColorStops([
      { id: "1", color: preset.colors[0], position: 0 },
      { id: "2", color: preset.colors[1], position: 100 },
    ]);
  };

  const resetGradient = () => {
    setGradientType("linear");
    setAngle(90);
    setColorStops([
      { id: "1", color: "#667eea", position: 0 },
      { id: "2", color: "#764ba2", position: 100 },
    ]);
    setRadialPosition({ x: 50, y: 50 });
  };

  const copyToClipboard = async () => {
    const cssCode = `background: ${gradientCSS};`;
    try {
      await navigator.clipboard.writeText(cssCode);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "CSS code copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div
        className="w-full h-48 rounded-lg border"
        style={{ background: gradientCSS }}
        data-testid="gradient-preview"
      />

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Gradient Type</Label>
          <Select value={gradientType} onValueChange={(v) => setGradientType(v as GradientType)}>
            <SelectTrigger data-testid="select-gradient-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="linear">Linear</SelectItem>
              <SelectItem value="radial">Radial</SelectItem>
              <SelectItem value="conic">Conic</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {gradientType === "linear" && (
          <div className="space-y-2">
            <Label>Angle: {angle}deg</Label>
            <Slider
              value={[angle]}
              onValueChange={([v]) => setAngle(v)}
              max={360}
              step={1}
              data-testid="slider-angle"
            />
          </div>
        )}

        {gradientType === "conic" && (
          <div className="space-y-2">
            <Label>Start Angle: {angle}deg</Label>
            <Slider
              value={[angle]}
              onValueChange={([v]) => setAngle(v)}
              max={360}
              step={1}
              data-testid="slider-conic-angle"
            />
          </div>
        )}

        {gradientType === "radial" && (
          <div className="space-y-2">
            <Label>Shape</Label>
            <Select value={radialShape} onValueChange={(v) => setRadialShape(v as "circle" | "ellipse")}>
              <SelectTrigger data-testid="select-radial-shape">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="circle">Circle</SelectItem>
                <SelectItem value="ellipse">Ellipse</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {(gradientType === "radial" || gradientType === "conic") && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Position X: {radialPosition.x}%</Label>
              <Slider
                value={[radialPosition.x]}
                onValueChange={([v]) => setRadialPosition({ ...radialPosition, x: v })}
                max={100}
                step={1}
                data-testid="slider-position-x"
              />
            </div>
            <div className="space-y-2">
              <Label>Position Y: {radialPosition.y}%</Label>
              <Slider
                value={[radialPosition.y]}
                onValueChange={([v]) => setRadialPosition({ ...radialPosition, y: v })}
                max={100}
                step={1}
                data-testid="slider-position-y"
              />
            </div>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Color Stops</Label>
            <Button size="sm" variant="outline" onClick={addColorStop} data-testid="button-add-color">
              <Plus className="w-4 h-4 mr-1" /> Add Color
            </Button>
          </div>

          <div className="space-y-2">
            {colorStops.map((stop) => (
              <div key={stop.id} className="flex items-center gap-2">
                <Input
                  type="color"
                  value={stop.color}
                  onChange={(e) => updateColorStop(stop.id, { color: e.target.value })}
                  className="w-12 h-9 p-1 cursor-pointer"
                  data-testid={`input-color-${stop.id}`}
                />
                <Input
                  type="text"
                  value={stop.color}
                  onChange={(e) => updateColorStop(stop.id, { color: e.target.value })}
                  className="flex-1 font-mono"
                  data-testid={`input-color-hex-${stop.id}`}
                />
                <div className="flex items-center gap-2 w-32">
                  <Slider
                    value={[stop.position]}
                    onValueChange={([v]) => updateColorStop(stop.id, { position: v })}
                    max={100}
                    step={1}
                    className="flex-1"
                    data-testid={`slider-position-${stop.id}`}
                  />
                  <span className="text-xs w-8">{stop.position}%</span>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => removeColorStop(stop.id)}
                  disabled={colorStops.length <= 2}
                  data-testid={`button-remove-color-${stop.id}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Presets</Label>
          <div className="grid grid-cols-4 gap-2">
            {presetGradients.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset)}
                className="h-10 rounded-md border transition-transform hover:scale-105"
                style={{
                  background: `linear-gradient(${preset.angle}deg, ${preset.colors[0]}, ${preset.colors[1]})`,
                }}
                title={preset.name}
                data-testid={`button-preset-${preset.name.toLowerCase()}`}
              />
            ))}
          </div>
        </div>

        <Card className="p-3">
          <Label className="text-xs text-muted-foreground">Generated CSS</Label>
          <code className="block mt-1 p-2 bg-muted rounded text-sm font-mono break-all" data-testid="text-css-output">
            background: {gradientCSS};
          </code>
        </Card>

        <div className="flex gap-2">
          <Button onClick={copyToClipboard} className="flex-1" data-testid="button-copy-css">
            {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
            {copied ? "Copied!" : "Copy CSS"}
          </Button>
          <Button variant="outline" onClick={resetGradient} data-testid="button-reset">
            <RotateCcw className="w-4 h-4 mr-2" /> Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
