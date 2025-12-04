import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Video, Square, Download, Play, Pause, Trash2, VideoOff, RotateCcw } from "lucide-react";

interface WebcamRecorderProps {
  onRecordingComplete?: (blob: Blob) => void;
}

export function WebcamRecorder({ onRecordingComplete }: WebcamRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const [isPreviewActive, setIsPreviewActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || typeof MediaRecorder === "undefined") {
      setIsSupported(false);
    }
  }, []);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);
  const playbackVideoRef = useRef<HTMLVideoElement | null>(null);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const startPreview = useCallback(async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: true,
      });

      setStream(mediaStream);
      setIsPreviewActive(true);

      if (previewVideoRef.current) {
        previewVideoRef.current.srcObject = mediaStream;
        previewVideoRef.current.play();
      }
    } catch (err) {
      setError("Could not access webcam. Please grant permission and try again.");
      console.error("Error accessing webcam:", err);
    }
  }, []);

  const stopPreview = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsPreviewActive(false);
  }, [stream]);

  const startRecording = useCallback(async () => {
    if (!stream) {
      await startPreview();
      return;
    }

    try {
      setError(null);

      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : MediaRecorder.isTypeSupported("video/webm")
        ? "video/webm"
        : "video/mp4";

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
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

        if (onRecordingComplete) {
          onRecordingComplete(blob);
        }
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      setError("Could not start recording. Please try again.");
      console.error("Error starting recording:", err);
    }
  }, [stream, startPreview, onRecordingComplete]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      stopPreview();

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording, stopPreview]);

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
    if (videoUrl && playbackVideoRef.current) {
      if (isPlaying) {
        playbackVideoRef.current.pause();
      } else {
        playbackVideoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [videoUrl, isPlaying]);

  const downloadRecording = useCallback(() => {
    if (videoBlob && videoUrl) {
      const extension = videoBlob.type.includes("webm") ? "webm" : "mp4";
      const link = document.createElement("a");
      link.href = videoUrl;
      link.download = `webcam-recording-${new Date().toISOString().slice(0, 10)}.${extension}`;
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

  const recordAgain = useCallback(() => {
    deleteRecording();
    startPreview();
  }, [deleteRecording, startPreview]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [videoUrl, stream]);

  useEffect(() => {
    if (playbackVideoRef.current) {
      playbackVideoRef.current.onended = () => setIsPlaying(false);
    }
  }, [videoUrl]);

  if (!isSupported) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <VideoOff className="w-12 h-12 text-muted-foreground" />
          <p className="text-muted-foreground">
            Webcam recording is not supported in your browser. Please try using Chrome, Firefox, or Edge.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex flex-col items-center space-y-6">
        {(isPreviewActive || isRecording) && !videoUrl && (
          <div className="relative w-full max-w-md">
            <video
              ref={previewVideoRef}
              className="w-full rounded-lg bg-black mirror"
              autoPlay
              muted
              playsInline
              style={{ transform: "scaleX(-1)" }}
              data-testid="video-preview"
            />
            {isRecording && (
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 rounded-full px-3 py-1">
                <div className={`w-3 h-3 rounded-full ${isPaused ? "bg-yellow-500" : "bg-red-500 animate-pulse"}`} />
                <span className="text-white text-sm font-mono">{formatTime(duration)}</span>
              </div>
            )}
          </div>
        )}

        {!isPreviewActive && !isRecording && !videoUrl && (
          <div className="text-4xl font-mono tabular-nums" data-testid="text-recording-duration">
            {formatTime(duration)}
          </div>
        )}

        {error && (
          <p className="text-destructive text-sm text-center" data-testid="text-recording-error">
            {error}
          </p>
        )}

        <div className="flex items-center gap-4 flex-wrap justify-center">
          {!isPreviewActive && !isRecording && !videoUrl && (
            <Button size="lg" onClick={startPreview} className="gap-2" data-testid="button-start-preview">
              <Video className="w-5 h-5" />
              Open Camera
            </Button>
          )}

          {isPreviewActive && !isRecording && !videoUrl && (
            <>
              <Button size="lg" onClick={startRecording} className="gap-2" data-testid="button-start-recording">
                <Video className="w-5 h-5" />
                Start Recording
              </Button>
              <Button size="lg" variant="outline" onClick={stopPreview} data-testid="button-close-preview">
                Close Camera
              </Button>
            </>
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

              <Button size="icon" variant="outline" onClick={recordAgain} data-testid="button-record-again">
                <RotateCcw className="w-5 h-5" />
              </Button>

              <Button size="icon" variant="outline" onClick={deleteRecording} data-testid="button-delete-recording">
                <Trash2 className="w-5 h-5" />
              </Button>
            </>
          )}
        </div>

        {videoUrl && !isRecording && (
          <div className="w-full space-y-4">
            <video
              ref={playbackVideoRef}
              src={videoUrl}
              className="w-full max-h-80 rounded-lg bg-black"
              controls
              style={{ transform: "scaleX(-1)" }}
              data-testid="video-playback"
            />
            <p className="text-sm text-muted-foreground text-center">
              Recording complete! Click play to preview or download to save.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
