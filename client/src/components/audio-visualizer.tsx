import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Play, Pause, Download, AudioWaveform } from "lucide-react";

interface AudioVisualizerProps {
  onVisualizationComplete?: (imageBlob: Blob) => void;
}

export function AudioVisualizerComponent({ onVisualizationComplete }: AudioVisualizerProps) {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [waveColor, setWaveColor] = useState("#3b82f6");
  const [bgColor, setBgColor] = useState("#1f2937");
  const [visualizationType, setVisualizationType] = useState<"waveform" | "bars">("waveform");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("audio/")) {
      setAudioFile(file);
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      setIsPlaying(false);
      setIsAnalyzing(false);
    }
  }, []);

  const setupAudioContext = useCallback(() => {
    if (!audioRef.current || sourceRef.current) return;

    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    analyserRef.current = audioContextRef.current.createAnalyser();
    analyserRef.current.fftSize = 2048;
    
    sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
    sourceRef.current.connect(analyserRef.current);
    analyserRef.current.connect(audioContextRef.current.destination);
  }, []);

  const drawWaveform = useCallback(() => {
    if (!canvasRef.current || !analyserRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      
      analyserRef.current!.getByteTimeDomainData(dataArray);

      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 2;
      ctx.strokeStyle = waveColor;
      ctx.beginPath();

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    draw();
  }, [waveColor, bgColor]);

  const drawBars = useCallback(() => {
    if (!canvasRef.current || !analyserRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      
      analyserRef.current!.getByteFrequencyData(dataArray);

      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;

        ctx.fillStyle = waveColor;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }
    };

    draw();
  }, [waveColor, bgColor]);

  const startVisualization = useCallback(() => {
    if (!audioRef.current || !audioUrl) return;

    if (!sourceRef.current) {
      setupAudioContext();
    }

    if (audioContextRef.current?.state === "suspended") {
      audioContextRef.current.resume();
    }

    audioRef.current.play();
    setIsPlaying(true);
    setIsAnalyzing(true);

    if (visualizationType === "waveform") {
      drawWaveform();
    } else {
      drawBars();
    }
  }, [audioUrl, setupAudioContext, visualizationType, drawWaveform, drawBars]);

  const pauseVisualization = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  }, []);

  const downloadVisualization = useCallback(() => {
    if (!canvasRef.current) return;

    canvasRef.current.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `audio-visualization-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        if (onVisualizationComplete) {
          onVisualizationComplete(blob);
        }
      }
    }, "image/png");
  }, [onVisualizationComplete]);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [audioUrl]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onended = () => {
        setIsPlaying(false);
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [audioUrl]);

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleFileChange}
          className="hidden"
          data-testid="input-audio-file"
        />

        {!audioFile ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:border-primary transition-colors"
            data-testid="dropzone-audio"
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium">Click to upload an audio file</p>
            <p className="text-sm text-muted-foreground mt-2">
              Supports MP3, WAV, OGG, M4A, and other audio formats
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <AudioWaveform className="w-5 h-5" />
                <span className="font-medium">{audioFile.name}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                data-testid="button-change-file"
              >
                Change File
              </Button>
            </div>

            <audio ref={audioRef} src={audioUrl || undefined} />

            <div 
              className="rounded-lg overflow-hidden"
              style={{ backgroundColor: bgColor }}
            >
              <canvas
                ref={canvasRef}
                width={800}
                height={200}
                className="w-full"
                data-testid="canvas-visualizer"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Visualization Type</Label>
                <Select value={visualizationType} onValueChange={(v) => setVisualizationType(v as "waveform" | "bars")}>
                  <SelectTrigger data-testid="select-viz-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="waveform">Waveform</SelectItem>
                    <SelectItem value="bars">Frequency Bars</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Wave Color</Label>
                <Select value={waveColor} onValueChange={setWaveColor}>
                  <SelectTrigger data-testid="select-wave-color">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="#3b82f6">Blue</SelectItem>
                    <SelectItem value="#ef4444">Red</SelectItem>
                    <SelectItem value="#22c55e">Green</SelectItem>
                    <SelectItem value="#f59e0b">Orange</SelectItem>
                    <SelectItem value="#8b5cf6">Purple</SelectItem>
                    <SelectItem value="#ffffff">White</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Background</Label>
                <Select value={bgColor} onValueChange={setBgColor}>
                  <SelectTrigger data-testid="select-bg-color">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="#1f2937">Dark Gray</SelectItem>
                    <SelectItem value="#000000">Black</SelectItem>
                    <SelectItem value="#0f172a">Slate</SelectItem>
                    <SelectItem value="#171717">Neutral</SelectItem>
                    <SelectItem value="#transparent">Transparent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-4 flex-wrap justify-center">
              <Button
                size="lg"
                onClick={isPlaying ? pauseVisualization : startVisualization}
                className="gap-2"
                data-testid="button-play-visualize"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-5 h-5" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    Play & Visualize
                  </>
                )}
              </Button>

              {isAnalyzing && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={downloadVisualization}
                  className="gap-2"
                  data-testid="button-download-viz"
                >
                  <Download className="w-5 h-5" />
                  Download Snapshot
                </Button>
              )}
            </div>
          </div>
        )}

        <p className="text-sm text-muted-foreground text-center">
          Upload an audio file to create a real-time visualization. You can capture and download snapshots at any time.
        </p>
      </div>
    </Card>
  );
}
