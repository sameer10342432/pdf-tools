import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Monitor, Square, Download, Play, Pause, Trash2, MonitorOff, Camera } from "lucide-react";

interface ScreenRecorderProps {
  onRecordingComplete?: (blob: Blob) => void;
  includeCamera?: boolean;
}

export function ScreenRecorder({ onRecordingComplete, includeCamera = false }: ScreenRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia || typeof MediaRecorder === "undefined") {
      setIsSupported(false);
    }
  }, []);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const cameraVideoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const startRecording = useCallback(async () => {
    try {
      setError(null);

      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: "monitor",
        },
        audio: true,
      });

      let finalStream = displayStream;

      if (includeCamera) {
        try {
          const camStream = await navigator.mediaDevices.getUserMedia({
            video: { width: 320, height: 240 },
            audio: false,
          });
          setCameraStream(camStream);

          if (cameraVideoRef.current) {
            cameraVideoRef.current.srcObject = camStream;
            cameraVideoRef.current.play();
          }
        } catch (camErr) {
          console.warn("Could not access camera:", camErr);
        }
      }

      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : MediaRecorder.isTypeSupported("video/webm")
        ? "video/webm"
        : "video/mp4";

      const mediaRecorder = new MediaRecorder(finalStream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      videoChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          videoChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const mType = mediaRecorder.mimeType;
        const blob = new Blob(videoChunksRef.current, { type: mType });
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
        setVideoBlob(blob);

        displayStream.getTracks().forEach((track) => track.stop());
        if (cameraStream) {
          cameraStream.getTracks().forEach((track) => track.stop());
          setCameraStream(null);
        }

        if (onRecordingComplete) {
          onRecordingComplete(blob);
        }
      };

      displayStream.getVideoTracks()[0].onended = () => {
        if (mediaRecorderRef.current && isRecording) {
          stopRecording();
        }
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      if (err instanceof Error && err.name === "NotAllowedError") {
        setError("Screen sharing was cancelled or denied. Please try again and select a screen to share.");
      } else {
        setError("Could not access screen. Please grant permission and try again.");
      }
      console.error("Error accessing screen:", err);
    }
  }, [onRecordingComplete, includeCamera, cameraStream, isRecording]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        timerRef.current = setInterval(() => {
          setDuration((prev) => prev + 1);
        }, 1000);
      } else {
        mediaRecorderRef.current.pause();
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      }
      setIsPaused(!isPaused);
    }
  }, [isRecording, isPaused]);

  const playRecording = useCallback(() => {
    if (videoUrl && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [videoUrl, isPlaying]);

  const downloadRecording = useCallback(() => {
    if (videoBlob && videoUrl) {
      const extension = videoBlob.type.includes("webm") ? "webm" : "mp4";
      const link = document.createElement("a");
      link.href = videoUrl;
      link.download = `screen-recording-${new Date().toISOString().slice(0, 10)}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [videoBlob, videoUrl]);

  const deleteRecording = useCallback(() => {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
    setVideoUrl(null);
    setVideoBlob(null);
    setDuration(0);
    setIsPlaying(false);
  }, [videoUrl]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [videoUrl, cameraStream]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.onended = () => setIsPlaying(false);
    }
  }, [videoUrl]);

  if (!isSupported) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <MonitorOff className="w-12 h-12 text-muted-foreground" />
          <p className="text-muted-foreground">
            Screen recording is not supported in your browser. Please try using Chrome, Firefox, or Edge.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex flex-col items-center space-y-6">
        <div className="text-4xl font-mono tabular-nums" data-testid="text-recording-duration">
          {formatTime(duration)}
        </div>

        {error && (
          <p className="text-destructive text-sm text-center" data-testid="text-recording-error">
            {error}
          </p>
        )}

        {includeCamera && isRecording && cameraStream && (
          <div className="relative">
            <video
              ref={cameraVideoRef}
              className="w-40 h-30 rounded-lg border-2 border-primary"
              autoPlay
              muted
              playsInline
            />
            <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full p-1">
              <Camera className="w-3 h-3" />
            </div>
          </div>
        )}

        <div className="flex items-center gap-4 flex-wrap justify-center">
          {!isRecording && !videoUrl && (
            <Button size="lg" onClick={startRecording} className="gap-2" data-testid="button-start-recording">
              <Monitor className="w-5 h-5" />
              {includeCamera ? "Record Screen & Camera" : "Start Recording"}
            </Button>
          )}

          {isRecording && (
            <>
              <Button size="icon" variant="outline" onClick={pauseRecording} data-testid="button-pause-recording">
                {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
              </Button>

              <Button
                size="lg"
                variant="destructive"
                onClick={stopRecording}
                className="gap-2"
                data-testid="button-stop-recording"
              >
                <Square className="w-5 h-5" />
                Stop
              </Button>
            </>
          )}

          {videoUrl && !isRecording && (
            <>
              <Button size="icon" variant="outline" onClick={playRecording} data-testid="button-play-recording">
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </Button>

              <Button size="lg" onClick={downloadRecording} className="gap-2" data-testid="button-download-recording">
                <Download className="w-5 h-5" />
                Download
              </Button>

              <Button size="icon" variant="outline" onClick={deleteRecording} data-testid="button-delete-recording">
                <Trash2 className="w-5 h-5" />
              </Button>
            </>
          )}
        </div>

        {isRecording && (
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isPaused ? "bg-yellow-500" : "bg-red-500 animate-pulse"}`} />
            <span className="text-sm text-muted-foreground">{isPaused ? "Paused" : "Recording..."}</span>
          </div>
        )}

        {videoUrl && !isRecording && (
          <div className="w-full space-y-4">
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full max-h-80 rounded-lg bg-black"
              controls
              data-testid="video-preview"
            />
            <p className="text-sm text-muted-foreground text-center">
              Recording complete! Click play to preview or download to save.
            </p>
          </div>
        )}
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </Card>
  );
}
