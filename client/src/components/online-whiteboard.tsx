import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Pencil, Square, Circle, Trash2, Download, Eraser, Minus } from "lucide-react";

type Tool = "pencil" | "line" | "rectangle" | "circle" | "eraser";

interface Point {
  x: number;
  y: number;
}

export function OnlineWhiteboard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<Tool>("pencil");
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(3);
  const [startPoint, setStartPoint] = useState<Point | null>(null);

  const colors = ["#000000", "#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF", "#FFA500", "#800080", "#008000"];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, []);

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    setIsDrawing(true);
    setStartPoint(pos);

    if (tool === "pencil" || tool === "eraser") {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
      }
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    const pos = getMousePos(e);

    if (tool === "pencil" || tool === "eraser") {
      ctx.lineWidth = brushSize;
      ctx.lineCap = "round";
      ctx.strokeStyle = tool === "eraser" ? "#FFFFFF" : color;
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }
  };

  const stopDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !startPoint) {
      setIsDrawing(false);
      return;
    }

    const pos = getMousePos(e);
    ctx.lineWidth = brushSize;
    ctx.strokeStyle = color;

    if (tool === "line") {
      ctx.beginPath();
      ctx.moveTo(startPoint.x, startPoint.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else if (tool === "rectangle") {
      ctx.strokeRect(startPoint.x, startPoint.y, pos.x - startPoint.x, pos.y - startPoint.y);
    } else if (tool === "circle") {
      const radius = Math.sqrt(
        Math.pow(pos.x - startPoint.x, 2) + Math.pow(pos.y - startPoint.y, 2)
      );
      ctx.beginPath();
      ctx.arc(startPoint.x, startPoint.y, radius, 0, 2 * Math.PI);
      ctx.stroke();
    }

    setIsDrawing(false);
    setStartPoint(null);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx && canvas) {
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const link = document.createElement("a");
      link.download = "whiteboard.png";
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 items-center">
            <Button
              size="icon"
              variant={tool === "pencil" ? "default" : "outline"}
              onClick={() => setTool("pencil")}
              data-testid="button-tool-pencil"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant={tool === "line" ? "default" : "outline"}
              onClick={() => setTool("line")}
              data-testid="button-tool-line"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant={tool === "rectangle" ? "default" : "outline"}
              onClick={() => setTool("rectangle")}
              data-testid="button-tool-rectangle"
            >
              <Square className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant={tool === "circle" ? "default" : "outline"}
              onClick={() => setTool("circle")}
              data-testid="button-tool-circle"
            >
              <Circle className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant={tool === "eraser" ? "default" : "outline"}
              onClick={() => setTool("eraser")}
              data-testid="button-tool-eraser"
            >
              <Eraser className="h-4 w-4" />
            </Button>
            <div className="h-6 w-px bg-border mx-2" />
            {colors.map((c) => (
              <button
                key={c}
                className={`w-6 h-6 rounded-full border-2 ${color === c ? "border-foreground" : "border-transparent"}`}
                style={{ backgroundColor: c }}
                onClick={() => setColor(c)}
                data-testid={`button-color-${c}`}
              />
            ))}
            <div className="h-6 w-px bg-border mx-2" />
            <div className="flex items-center gap-2 w-32">
              <span className="text-sm text-muted-foreground">Size:</span>
              <Slider
                value={[brushSize]}
                onValueChange={(v) => setBrushSize(v[0])}
                min={1}
                max={20}
                step={1}
                data-testid="slider-brush-size"
              />
            </div>
            <div className="h-6 w-px bg-border mx-2" />
            <Button size="icon" variant="outline" onClick={clearCanvas} data-testid="button-clear">
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="outline" onClick={downloadCanvas} data-testid="button-download">
              <Download className="h-4 w-4" />
            </Button>
          </div>
          <div className="border rounded-lg overflow-hidden">
            <canvas
              ref={canvasRef}
              width={800}
              height={500}
              className="w-full bg-white cursor-crosshair"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              data-testid="canvas-whiteboard"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
