import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, Square, Download, Play, Pause, Trash2 } from "lucide-react";

interface VoiceRecorderProps {
  onRecordingComplete?: (blob: Blob) => void;
}

export function VoiceRecorder({ onRecordingComplete }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4"
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const mimeType = mediaRecorder.mimeType;
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setAudioBlob(blob);
        
        stream.getTracks().forEach(track => track.stop());
        
        if (onRecordingComplete) {
          onRecordingComplete(blob);
        }
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setDuration(0);
      
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
      
    } catch (err) {
      setError("Could not access microphone. Please grant permission and try again.");
      console.error("Error accessing microphone:", err);
    }
  }, [onRecordingComplete]);

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
          setDuration(prev => prev + 1);
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
    if (audioUrl && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [audioUrl, isPlaying]);

  const downloadRecording = useCallback(() => {
    if (audioBlob && audioUrl) {
      const extension = audioBlob.type.includes("webm") ? "webm" : "m4a";
      const link = document.createElement("a");
      link.href = audioUrl;
      link.download = `recording-${new Date().toISOString().slice(0, 10)}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [audioBlob, audioUrl]);

  const deleteRecording = useCallback(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setAudioBlob(null);
    setDuration(0);
    setIsPlaying(false);
  }, [audioUrl]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onended = () => setIsPlaying(false);
    }
  }, [audioUrl]);

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

        <div className="flex items-center gap-4 flex-wrap justify-center">
          {!isRecording && !audioUrl && (
            <Button
              size="lg"
              onClick={startRecording}
              className="gap-2"
              data-testid="button-start-recording"
            >
              <Mic className="w-5 h-5" />
              Start Recording
            </Button>
          )}

          {isRecording && (
            <>
              <Button
                size="icon"
                variant="outline"
                onClick={pauseRecording}
                data-testid="button-pause-recording"
              >
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

          {audioUrl && !isRecording && (
            <>
              <audio ref={audioRef} src={audioUrl} />
              
              <Button
                size="icon"
                variant="outline"
                onClick={playRecording}
                data-testid="button-play-recording"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </Button>
              
              <Button
                size="lg"
                onClick={downloadRecording}
                className="gap-2"
                data-testid="button-download-recording"
              >
                <Download className="w-5 h-5" />
                Download
              </Button>
              
              <Button
                size="icon"
                variant="outline"
                onClick={deleteRecording}
                data-testid="button-delete-recording"
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            </>
          )}
        </div>

        {isRecording && (
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isPaused ? "bg-yellow-500" : "bg-red-500 animate-pulse"}`} />
            <span className="text-sm text-muted-foreground">
              {isPaused ? "Paused" : "Recording..."}
            </span>
          </div>
        )}

        {audioUrl && !isRecording && (
          <p className="text-sm text-muted-foreground text-center">
            Recording complete! Click play to preview or download to save.
          </p>
        )}
      </div>
    </Card>
  );
}
