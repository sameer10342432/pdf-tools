import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Play, 
  Pause, 
  RotateCcw,
  Maximize,
  Minimize,
  ChevronUp,
  ChevronDown,
  Settings,
  Eye
} from "lucide-react";

export function Teleprompter() {
  const [script, setScript] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(50);
  const [fontSize, setFontSize] = useState(32);
  const [mirrorText, setMirrorText] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(true);
  const [textColor, setTextColor] = useState("#ffffff");
  const [bgColor, setBgColor] = useState("#000000");
  const [lineHeight, setLineHeight] = useState(1.6);
  const [padding, setPadding] = useState(40);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isPlaying && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollStep = scrollSpeed / 60;
      
      const animate = () => {
        if (container.scrollTop < container.scrollHeight - container.clientHeight) {
          container.scrollTop += scrollStep;
          animationRef.current = requestAnimationFrame(animate);
        } else {
          setIsPlaying(false);
        }
      };
      
      animationRef.current = requestAnimationFrame(animate);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, scrollSpeed]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const restart = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
    setIsPlaying(false);
  };

  const scrollManually = (direction: 'up' | 'down') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'up' ? -100 : 100;
      scrollContainerRef.current.scrollBy({ top: scrollAmount, behavior: 'smooth' });
    }
  };

  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
        setIsFullscreen(false);
      } else {
        containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const defaultScript = `Welcome to the Teleprompter!

This is a professional teleprompter tool that helps you deliver speeches, presentations, and video content with confidence.

How to use:
1. Enter or paste your script in the text area
2. Adjust the scroll speed to match your reading pace
3. Set the font size for comfortable reading
4. Click Play to start auto-scrolling
5. Use fullscreen mode for the best experience

Tips for better presentations:
- Practice your script before recording
- Use natural pauses and breathing points
- Maintain eye contact with the camera
- Speak clearly and at a comfortable pace

You can mirror the text if you're using a teleprompter setup with a beam splitter or reflective glass.

Good luck with your presentation!`;

  return (
    <div ref={containerRef} className="space-y-4">
      {showSettings && !isFullscreen && (
        <Card className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="script">Script</Label>
            <Textarea
              id="script"
              value={script}
              onChange={(e) => setScript(e.target.value)}
              placeholder="Enter your script here..."
              className="min-h-[200px] text-base"
              data-testid="textarea-script"
            />
            {!script && (
              <Button 
                variant="outline" 
                onClick={() => setScript(defaultScript)}
                data-testid="button-load-sample"
              >
                Load Sample Script
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Scroll Speed: {scrollSpeed}px/s</Label>
                <Slider
                  value={[scrollSpeed]}
                  min={10}
                  max={200}
                  step={5}
                  onValueChange={(value) => setScrollSpeed(value[0])}
                  data-testid="slider-scroll-speed"
                />
              </div>

              <div className="space-y-2">
                <Label>Font Size: {fontSize}px</Label>
                <Slider
                  value={[fontSize]}
                  min={16}
                  max={72}
                  step={2}
                  onValueChange={(value) => setFontSize(value[0])}
                  data-testid="slider-font-size"
                />
              </div>

              <div className="space-y-2">
                <Label>Line Height: {lineHeight}</Label>
                <Slider
                  value={[lineHeight]}
                  min={1}
                  max={3}
                  step={0.1}
                  onValueChange={(value) => setLineHeight(value[0])}
                  data-testid="slider-line-height"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Padding: {padding}px</Label>
                <Slider
                  value={[padding]}
                  min={10}
                  max={100}
                  step={5}
                  onValueChange={(value) => setPadding(value[0])}
                  data-testid="slider-padding"
                />
              </div>

              <div className="flex gap-4 items-center">
                <div className="space-y-2">
                  <Label htmlFor="text-color">Text Color</Label>
                  <input
                    type="color"
                    id="text-color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-12 h-9 rounded cursor-pointer"
                    data-testid="input-text-color"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bg-color">Background</Label>
                  <input
                    type="color"
                    id="bg-color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-12 h-9 rounded cursor-pointer"
                    data-testid="input-bg-color"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={mirrorText ? "default" : "outline"}
                  onClick={() => setMirrorText(!mirrorText)}
                  data-testid="button-mirror"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Mirror Text {mirrorText ? 'ON' : 'OFF'}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      <Card className="relative overflow-hidden" style={{ backgroundColor: bgColor }}>
        <div className="absolute top-2 right-2 z-10 flex gap-2">
          {isFullscreen && (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setShowSettings(!showSettings)}
              className="text-white/70"
              data-testid="button-toggle-settings"
            >
              <Settings className="h-4 w-4" />
            </Button>
          )}
          <Button
            size="icon"
            variant="ghost"
            onClick={toggleFullscreen}
            className="text-white/70"
            data-testid="button-fullscreen"
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </Button>
        </div>

        <div
          ref={scrollContainerRef}
          className="h-[400px] overflow-y-auto"
          style={{ 
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          <div 
            className="whitespace-pre-wrap text-center"
            style={{ 
              fontSize: `${fontSize}px`,
              lineHeight: lineHeight,
              padding: `${padding}px`,
              color: textColor,
              transform: mirrorText ? 'scaleX(-1)' : 'none',
              minHeight: '100%'
            }}
            data-testid="text-script-display"
          >
            {script || 'Enter your script above...'}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
          <div className="flex items-center justify-center gap-4">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => scrollManually('up')}
              className="text-white"
              data-testid="button-scroll-up"
            >
              <ChevronUp className="h-5 w-5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={restart}
              className="text-white"
              data-testid="button-restart"
            >
              <RotateCcw className="h-5 w-5" />
            </Button>
            <Button
              size="icon"
              onClick={togglePlay}
              className="h-12 w-12"
              data-testid="button-play-pause"
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => scrollManually('down')}
              className="text-white"
              data-testid="button-scroll-down"
            >
              <ChevronDown className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <style>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </Card>

      {!isFullscreen && (
        <Card className="p-4">
          <h3 className="font-semibold mb-2">Keyboard Shortcuts</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
            <div><kbd className="px-2 py-1 bg-muted rounded">Space</kbd> Play/Pause</div>
            <div><kbd className="px-2 py-1 bg-muted rounded">R</kbd> Restart</div>
            <div><kbd className="px-2 py-1 bg-muted rounded">F</kbd> Fullscreen</div>
            <div><kbd className="px-2 py-1 bg-muted rounded">M</kbd> Mirror</div>
          </div>
        </Card>
      )}
    </div>
  );
}
