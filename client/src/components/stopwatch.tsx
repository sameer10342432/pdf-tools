import { useState, useEffect, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Flag, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Lap {
  id: number;
  time: number;
  totalTime: number;
}

function formatTime(ms: number): string {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const milliseconds = Math.floor((ms % 1000) / 10);

  if (hours > 0) {
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${milliseconds.toString().padStart(2, "0")}`;
  }
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${milliseconds.toString().padStart(2, "0")}`;
}

function formatLapTime(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const milliseconds = Math.floor((ms % 1000) / 10);
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${milliseconds.toString().padStart(2, "0")}`;
}

export function StopwatchComponent() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<Lap[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const lastLapTimeRef = useRef<number>(0);

  const start = useCallback(() => {
    if (!isRunning) {
      setIsRunning(true);
      startTimeRef.current = Date.now() - time;
    }
  }, [isRunning, time]);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setTime(0);
    setLaps([]);
    lastLapTimeRef.current = 0;
  }, []);

  const addLap = useCallback(() => {
    if (isRunning) {
      const lapTime = time - lastLapTimeRef.current;
      const newLap: Lap = {
        id: laps.length + 1,
        time: lapTime,
        totalTime: time,
      };
      setLaps([newLap, ...laps]);
      lastLapTimeRef.current = time;
    }
  }, [isRunning, time, laps]);

  const clearLaps = useCallback(() => {
    setLaps([]);
    lastLapTimeRef.current = 0;
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime(Date.now() - startTimeRef.current);
      }, 10);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        if (isRunning) {
          pause();
        } else {
          start();
        }
      } else if (e.code === "KeyL" && isRunning) {
        e.preventDefault();
        addLap();
      } else if (e.code === "KeyR") {
        e.preventDefault();
        reset();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isRunning, start, pause, addLap, reset]);

  const fastestLap = laps.length > 1 ? Math.min(...laps.map((l) => l.time)) : null;
  const slowestLap = laps.length > 1 ? Math.max(...laps.map((l) => l.time)) : null;

  return (
    <div className="space-y-6">
      <Card className="p-8">
        <div className="text-center">
          <p
            className="text-6xl md:text-7xl font-mono font-bold tracking-tight"
            data-testid="text-time"
          >
            {formatTime(time)}
          </p>
        </div>
      </Card>

      <div className="flex justify-center gap-3">
        {!isRunning ? (
          <Button size="lg" onClick={start} className="w-28" data-testid="button-start">
            <Play className="w-5 h-5 mr-2" /> Start
          </Button>
        ) : (
          <Button size="lg" variant="secondary" onClick={pause} className="w-28" data-testid="button-pause">
            <Pause className="w-5 h-5 mr-2" /> Pause
          </Button>
        )}
        <Button
          size="lg"
          variant="outline"
          onClick={addLap}
          disabled={!isRunning}
          className="w-28"
          data-testid="button-lap"
        >
          <Flag className="w-5 h-5 mr-2" /> Lap
        </Button>
        <Button size="lg" variant="outline" onClick={reset} className="w-28" data-testid="button-reset">
          <RotateCcw className="w-5 h-5 mr-2" /> Reset
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="font-medium">Laps ({laps.length})</p>
          {laps.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearLaps} data-testid="button-clear-laps">
              <Trash2 className="w-4 h-4 mr-1" /> Clear
            </Button>
          )}
        </div>

        {laps.length > 0 ? (
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {laps.map((lap) => (
                <div
                  key={lap.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    lap.time === fastestLap
                      ? "bg-green-100 dark:bg-green-950/30"
                      : lap.time === slowestLap
                        ? "bg-red-100 dark:bg-red-950/30"
                        : "bg-muted"
                  }`}
                  data-testid={`lap-${lap.id}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground font-medium w-12">
                      Lap {lap.id}
                    </span>
                    {lap.time === fastestLap && (
                      <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded">
                        Fastest
                      </span>
                    )}
                    {lap.time === slowestLap && (
                      <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded">
                        Slowest
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-medium" data-testid={`lap-time-${lap.id}`}>
                      {formatLapTime(lap.time)}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono" data-testid={`lap-total-${lap.id}`}>
                      {formatLapTime(lap.totalTime)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Flag className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Press "Lap" while running to record lap times</p>
          </div>
        )}
      </Card>

      <Card className="p-4">
        <p className="text-sm font-medium mb-2">Keyboard Shortcuts</p>
        <div className="grid grid-cols-3 gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Space</kbd>
            <span>Start/Pause</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">L</kbd>
            <span>Lap</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">R</kbd>
            <span>Reset</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
