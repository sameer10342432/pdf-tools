import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  SkipBack, 
  SkipForward,
  Link,
  RotateCcw,
  AlertCircle
} from "lucide-react";

export function OnlineVideoPlayer() {
  const [videoUrl, setVideoUrl] = useState("");
  const [loadedUrl, setLoadedUrl] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const loadVideo = () => {
    if (!videoUrl.trim()) {
      setError("Please enter a video URL");
      return;
    }
    
    setError(null);
    setLoadedUrl(videoUrl.trim());
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleVideoError = () => {
    setError("Unable to load video. Please check the URL or try a different source.");
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {
          setError("Unable to play video. The source may not allow direct playback.");
        });
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
      setError(null);
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

  return (
    <Card className="p-6 space-y-4">
      <div className="space-y-4">
        <Label htmlFor="video-url">Video URL</Label>
        <div className="flex gap-2 flex-wrap">
          <Input
            id="video-url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://example.com/video.mp4"
            className="flex-1 min-w-[200px]"
            onKeyDown={(e) => e.key === 'Enter' && loadVideo()}
            data-testid="input-video-url"
          />
          <Button 
            onClick={loadVideo}
            data-testid="button-load-video"
          >
            <Link className="mr-2 h-4 w-4" />
            Load Video
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Enter a direct link to an MP4, WebM, or OGG video file
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-destructive bg-destructive/10 p-3 rounded-md">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {loadedUrl && !error && (
        <div 
          ref={containerRef}
          className="relative bg-black rounded-lg overflow-hidden"
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(isPlaying ? false : true)}
        >
          <video
            ref={videoRef}
            src={loadedUrl}
            className="w-full aspect-video"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => setIsPlaying(false)}
            onError={handleVideoError}
            onClick={togglePlay}
            crossOrigin="anonymous"
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

      {!loadedUrl && (
        <div className="border-2 border-dashed border-muted rounded-lg p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <Play className="h-12 w-12 text-muted-foreground" />
            <div>
              <p className="text-lg font-medium">Enter a video URL to play</p>
              <p className="text-sm text-muted-foreground">Supports MP4, WebM, and OGG formats</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="font-semibold">Supported Formats</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium">MP4</span>
            <span className="text-muted-foreground">H.264/AVC</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">WebM</span>
            <span className="text-muted-foreground">VP8/VP9</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">OGG</span>
            <span className="text-muted-foreground">Theora</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Note: Some video sources may not work due to CORS restrictions or DRM protection.
        </p>
      </div>
    </Card>
  );
}
