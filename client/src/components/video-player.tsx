import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  SkipBack, 
  SkipForward,
  Upload,
  Settings,
  RotateCcw
} from "lucide-react";

export function VideoPlayer() {
  const [videoSrc, setVideoSrc] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const skipForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(videoRef.current.currentTime + 10, duration);
    }
  };

  const skipBackward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(videoRef.current.currentTime - 10, 0);
    }
  };

  const handlePlaybackRateChange = (rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
    }
  };

  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen();
      }
    }
  };

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const restart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setCurrentTime(0);
    }
  };

  useEffect(() => {
    return () => {
      if (videoSrc) {
        URL.revokeObjectURL(videoSrc);
      }
    };
  }, [videoSrc]);

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleFileUpload}
          className="hidden"
          data-testid="input-video-upload"
        />
        <Button 
          onClick={() => fileInputRef.current?.click()}
          variant="outline"
          data-testid="button-upload-video"
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload Video
        </Button>
        {videoSrc && (
          <span className="text-sm text-muted-foreground">Video loaded</span>
        )}
      </div>

      {videoSrc && (
        <div 
          ref={containerRef}
          className="relative bg-black rounded-lg overflow-hidden"
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(isPlaying ? false : true)}
        >
          <video
            ref={videoRef}
            src={videoSrc}
            className="w-full aspect-video"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => setIsPlaying(false)}
            onClick={togglePlay}
            data-testid="video-player"
          />

          <div 
            className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity ${showControls ? 'opacity-100' : 'opacity-0'}`}
          >
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={0.1}
              onValueChange={handleSeek}
              className="mb-4"
              data-testid="slider-seek"
            />

            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={restart}
                  className="text-white"
                  data-testid="button-restart"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={skipBackward}
                  className="text-white"
                  data-testid="button-skip-back"
                >
                  <SkipBack className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={togglePlay}
                  className="text-white"
                  data-testid="button-play-pause"
                >
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={skipForward}
                  className="text-white"
                  data-testid="button-skip-forward"
                >
                  <SkipForward className="h-4 w-4" />
                </Button>
                <span className="text-white text-sm" data-testid="text-time">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={toggleMute}
                    className="text-white"
                    data-testid="button-mute"
                  >
                    {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                  <Slider
                    value={[isMuted ? 0 : volume]}
                    max={1}
                    step={0.1}
                    onValueChange={handleVolumeChange}
                    className="w-24"
                    data-testid="slider-volume"
                  />
                </div>

                <select
                  value={playbackRate}
                  onChange={(e) => handlePlaybackRateChange(Number(e.target.value))}
                  className="bg-transparent text-white text-sm border border-white/30 rounded px-2 py-1"
                  data-testid="select-playback-rate"
                >
                  <option value="0.25" className="bg-black">0.25x</option>
                  <option value="0.5" className="bg-black">0.5x</option>
                  <option value="0.75" className="bg-black">0.75x</option>
                  <option value="1" className="bg-black">1x</option>
                  <option value="1.25" className="bg-black">1.25x</option>
                  <option value="1.5" className="bg-black">1.5x</option>
                  <option value="1.75" className="bg-black">1.75x</option>
                  <option value="2" className="bg-black">2x</option>
                </select>

                <Button
                  size="icon"
                  variant="ghost"
                  onClick={toggleFullscreen}
                  className="text-white"
                  data-testid="button-fullscreen"
                >
                  <Maximize className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {!videoSrc && (
        <div className="border-2 border-dashed border-muted rounded-lg p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <Play className="h-12 w-12 text-muted-foreground" />
            <div>
              <p className="text-lg font-medium">No video loaded</p>
              <p className="text-sm text-muted-foreground">Upload a video file to start playing</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="font-semibold">Keyboard Shortcuts</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
          <div><kbd className="px-2 py-1 bg-muted rounded">Space</kbd> Play/Pause</div>
          <div><kbd className="px-2 py-1 bg-muted rounded">Left</kbd> -10 seconds</div>
          <div><kbd className="px-2 py-1 bg-muted rounded">Right</kbd> +10 seconds</div>
          <div><kbd className="px-2 py-1 bg-muted rounded">M</kbd> Mute/Unmute</div>
          <div><kbd className="px-2 py-1 bg-muted rounded">F</kbd> Fullscreen</div>
          <div><kbd className="px-2 py-1 bg-muted rounded">R</kbd> Restart</div>
        </div>
      </div>
    </Card>
  );
}
