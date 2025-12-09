import { useState, useEffect, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Play, Pause, RotateCcw, Plus, Trash2, Bell, BellOff } from "lucide-react";

interface Timer {
  id: number;
  name: string;
  totalSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (h > 0) {
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function TimerTool() {
  const [timers, setTimers] = useState<Timer[]>([
    { id: 1, name: "Timer 1", totalSeconds: 300, remainingSeconds: 300, isRunning: false },
  ]);
  const [hours, setHours] = useState("0");
  const [minutes, setMinutes] = useState("5");
  const [seconds, setSeconds] = useState("0");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const presets = [
    { label: "1 min", seconds: 60 },
    { label: "5 min", seconds: 300 },
    { label: "10 min", seconds: 600 },
    { label: "15 min", seconds: 900 },
    { label: "30 min", seconds: 1800 },
    { label: "1 hour", seconds: 3600 },
  ];

  useEffect(() => {
    audioRef.current = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2Onq2flnmBjpmno5uGc4GRoaafiH2EkZyepJqNgYaQmJ2blIuDhpCVmZeQiYKGj5WZl4+IgoeQlZaVjoaFiJKVlpSMhYeJkpSUk4qGiIqRk5OSioeIi5GTkpGJiImKkJKRkImIioqPkZCPiIiJiY+RkI6IiImJjpCQjYeIiYmOkJCNh4iJiY2PjoyHiImJjY+OjIeIiYmMjo6Mh4iIiYyOjouHiIiJjI6Ni4eIiImMjY2LhoiIiYuNjYuGiIiIi42MioaHiIiLjIyKhoeHiIuMjIqGh4eIiouLiYaHh4iKi4uJhoaHiIqLi4mGhoeIiYqKiIaGh4iJioqIhoaGiImKiYiGhoaIiYmJiIaGhoiJiYmIhoaGh4iJiYiGhoaHiImJiIaGhoaIiImIhoaGhoiIiIiGhoaGh4iIiIaGhoaHiIiHhoaGhoaIh4eGhoaGhoeHh4aGhoaGh4eHhoaGhoaHh4eGhoaGhoaHhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaG");
  }, []);

  const playAlarm = useCallback(() => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  }, [soundEnabled]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prevTimers) =>
        prevTimers.map((timer) => {
          if (timer.isRunning && timer.remainingSeconds > 0) {
            const newRemaining = timer.remainingSeconds - 1;
            if (newRemaining === 0) {
              playAlarm();
            }
            return { ...timer, remainingSeconds: newRemaining };
          }
          if (timer.isRunning && timer.remainingSeconds === 0) {
            return { ...timer, isRunning: false };
          }
          return timer;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [playAlarm]);

  const addTimer = useCallback(() => {
    const h = parseInt(hours) || 0;
    const m = parseInt(minutes) || 0;
    const s = parseInt(seconds) || 0;
    const totalSecs = h * 3600 + m * 60 + s;

    if (totalSecs > 0) {
      setTimers((prev) => [
        ...prev,
        {
          id: Date.now(),
          name: `Timer ${prev.length + 1}`,
          totalSeconds: totalSecs,
          remainingSeconds: totalSecs,
          isRunning: false,
        },
      ]);
    }
  }, [hours, minutes, seconds]);

  const addPresetTimer = useCallback((secs: number) => {
    setTimers((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: `Timer ${prev.length + 1}`,
        totalSeconds: secs,
        remainingSeconds: secs,
        isRunning: false,
      },
    ]);
  }, []);

  const toggleTimer = useCallback((id: number) => {
    setTimers((prev) =>
      prev.map((timer) =>
        timer.id === id ? { ...timer, isRunning: !timer.isRunning } : timer
      )
    );
  }, []);

  const resetTimer = useCallback((id: number) => {
    setTimers((prev) =>
      prev.map((timer) =>
        timer.id === id
          ? { ...timer, remainingSeconds: timer.totalSeconds, isRunning: false }
          : timer
      )
    );
  }, []);

  const removeTimer = useCallback((id: number) => {
    if (timers.length > 1) {
      setTimers((prev) => prev.filter((timer) => timer.id !== id));
    }
  }, [timers.length]);

  const getProgress = (timer: Timer) => {
    return (timer.remainingSeconds / timer.totalSeconds) * 100;
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium">Add Timer</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
            data-testid="button-toggle-sound"
          >
            {soundEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {presets.map((preset) => (
            <Button
              key={preset.label}
              variant="outline"
              size="sm"
              onClick={() => addPresetTimer(preset.seconds)}
              data-testid={`button-preset-${preset.seconds}`}
            >
              {preset.label}
            </Button>
          ))}
        </div>

        <div className="flex flex-wrap items-end gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Hours</Label>
            <Input
              type="number"
              min="0"
              max="23"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className="w-16"
              data-testid="input-hours"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Minutes</Label>
            <Input
              type="number"
              min="0"
              max="59"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              className="w-16"
              data-testid="input-minutes"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Seconds</Label>
            <Input
              type="number"
              min="0"
              max="59"
              value={seconds}
              onChange={(e) => setSeconds(e.target.value)}
              className="w-16"
              data-testid="input-seconds"
            />
          </div>
          <Button onClick={addTimer} data-testid="button-add-timer">
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>
      </Card>

      <div className="space-y-4">
        {timers.map((timer) => (
          <Card
            key={timer.id}
            className={`p-6 ${timer.remainingSeconds === 0 ? "bg-red-50 dark:bg-red-950/30" : ""}`}
            data-testid={`timer-card-${timer.id}`}
          >
            <div className="flex items-center justify-between mb-4">
              <Input
                value={timer.name}
                onChange={(e) =>
                  setTimers((prev) =>
                    prev.map((t) =>
                      t.id === timer.id ? { ...t, name: e.target.value } : t
                    )
                  )
                }
                className="max-w-[200px] font-medium border-none p-0 h-auto text-lg focus-visible:ring-0"
                data-testid={`input-timer-name-${timer.id}`}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeTimer(timer.id)}
                disabled={timers.length === 1}
                data-testid={`button-remove-${timer.id}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="relative mb-4">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ${
                    timer.remainingSeconds === 0
                      ? "bg-red-500"
                      : timer.remainingSeconds < timer.totalSeconds * 0.2
                        ? "bg-yellow-500"
                        : "bg-primary"
                  }`}
                  style={{ width: `${getProgress(timer)}%` }}
                />
              </div>
            </div>

            <div className="text-center mb-4">
              <p
                className={`text-5xl font-mono font-bold ${
                  timer.remainingSeconds === 0 ? "text-red-500 animate-pulse" : ""
                }`}
                data-testid={`text-time-${timer.id}`}
              >
                {formatTime(timer.remainingSeconds)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                of {formatTime(timer.totalSeconds)}
              </p>
            </div>

            <div className="flex justify-center gap-2">
              <Button
                size="lg"
                onClick={() => toggleTimer(timer.id)}
                disabled={timer.remainingSeconds === 0}
                className="w-28"
                data-testid={`button-toggle-${timer.id}`}
              >
                {timer.isRunning ? (
                  <>
                    <Pause className="h-5 w-5 mr-2" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5 mr-2" /> Start
                  </>
                )}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => resetTimer(timer.id)}
                className="w-28"
                data-testid={`button-reset-${timer.id}`}
              >
                <RotateCcw className="h-5 w-5 mr-2" /> Reset
              </Button>
            </div>

            {timer.remainingSeconds === 0 && (
              <p className="text-center text-red-500 font-medium mt-4 animate-pulse">
                Time is up!
              </p>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
