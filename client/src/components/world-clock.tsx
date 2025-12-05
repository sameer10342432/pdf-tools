import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Clock, Sun, Moon } from "lucide-react";

interface WorldClock {
  id: string;
  timezone: string;
  label: string;
}

const availableTimezones = [
  { value: "UTC", label: "UTC", city: "Coordinated Universal Time" },
  { value: "America/New_York", label: "EST/EDT", city: "New York" },
  { value: "America/Los_Angeles", label: "PST/PDT", city: "Los Angeles" },
  { value: "America/Chicago", label: "CST/CDT", city: "Chicago" },
  { value: "America/Denver", label: "MST/MDT", city: "Denver" },
  { value: "America/Toronto", label: "EST/EDT", city: "Toronto" },
  { value: "America/Vancouver", label: "PST/PDT", city: "Vancouver" },
  { value: "America/Mexico_City", label: "CST", city: "Mexico City" },
  { value: "America/Sao_Paulo", label: "BRT", city: "Sao Paulo" },
  { value: "America/Buenos_Aires", label: "ART", city: "Buenos Aires" },
  { value: "Europe/London", label: "GMT/BST", city: "London" },
  { value: "Europe/Paris", label: "CET/CEST", city: "Paris" },
  { value: "Europe/Berlin", label: "CET/CEST", city: "Berlin" },
  { value: "Europe/Rome", label: "CET/CEST", city: "Rome" },
  { value: "Europe/Madrid", label: "CET/CEST", city: "Madrid" },
  { value: "Europe/Amsterdam", label: "CET/CEST", city: "Amsterdam" },
  { value: "Europe/Moscow", label: "MSK", city: "Moscow" },
  { value: "Europe/Istanbul", label: "TRT", city: "Istanbul" },
  { value: "Asia/Dubai", label: "GST", city: "Dubai" },
  { value: "Asia/Kolkata", label: "IST", city: "Mumbai" },
  { value: "Asia/Bangkok", label: "ICT", city: "Bangkok" },
  { value: "Asia/Singapore", label: "SGT", city: "Singapore" },
  { value: "Asia/Hong_Kong", label: "HKT", city: "Hong Kong" },
  { value: "Asia/Shanghai", label: "CST", city: "Shanghai" },
  { value: "Asia/Tokyo", label: "JST", city: "Tokyo" },
  { value: "Asia/Seoul", label: "KST", city: "Seoul" },
  { value: "Australia/Sydney", label: "AEST/AEDT", city: "Sydney" },
  { value: "Australia/Melbourne", label: "AEST/AEDT", city: "Melbourne" },
  { value: "Australia/Perth", label: "AWST", city: "Perth" },
  { value: "Pacific/Auckland", label: "NZST/NZDT", city: "Auckland" },
  { value: "Pacific/Honolulu", label: "HST", city: "Honolulu" },
];

const defaultClocks: WorldClock[] = [
  { id: "1", timezone: "America/New_York", label: "New York" },
  { id: "2", timezone: "Europe/London", label: "London" },
  { id: "3", timezone: "Asia/Tokyo", label: "Tokyo" },
  { id: "4", timezone: "Australia/Sydney", label: "Sydney" },
];

export function WorldClockComponent() {
  const [clocks, setClocks] = useState<WorldClock[]>(defaultClocks);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedTimezone, setSelectedTimezone] = useState("UTC");
  const [customLabel, setCustomLabel] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const addClock = () => {
    const tzInfo = availableTimezones.find((tz) => tz.value === selectedTimezone);
    const newClock: WorldClock = {
      id: Date.now().toString(),
      timezone: selectedTimezone,
      label: customLabel || tzInfo?.city || selectedTimezone,
    };
    setClocks([...clocks, newClock]);
    setCustomLabel("");
  };

  const removeClock = (id: string) => {
    setClocks(clocks.filter((clock) => clock.id !== id));
  };

  const getTimeForTimezone = (timezone: string) => {
    try {
      return new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }).format(currentTime);
    } catch {
      return "--:--:--";
    }
  };

  const getDateForTimezone = (timezone: string) => {
    try {
      return new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        weekday: "short",
        month: "short",
        day: "numeric",
      }).format(currentTime);
    } catch {
      return "---";
    }
  };

  const getHourForTimezone = (timezone: string): number => {
    try {
      const hour = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        hour: "numeric",
        hour12: false,
      }).format(currentTime);
      return parseInt(hour);
    } catch {
      return 12;
    }
  };

  const isDaytime = (timezone: string): boolean => {
    const hour = getHourForTimezone(timezone);
    return hour >= 6 && hour < 18;
  };

  const getAnalogClockRotation = (timezone: string) => {
    try {
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: false,
      });
      const parts = formatter.formatToParts(currentTime);
      const hours = parseInt(parts.find((p) => p.type === "hour")?.value || "0");
      const minutes = parseInt(parts.find((p) => p.type === "minute")?.value || "0");
      const seconds = parseInt(parts.find((p) => p.type === "second")?.value || "0");

      return {
        hourRotation: (hours % 12) * 30 + minutes * 0.5,
        minuteRotation: minutes * 6,
        secondRotation: seconds * 6,
      };
    } catch {
      return { hourRotation: 0, minuteRotation: 0, secondRotation: 0 };
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <Label className="text-sm font-medium mb-3 block">Add New Clock</Label>
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={selectedTimezone} onValueChange={setSelectedTimezone}>
            <SelectTrigger className="flex-1" data-testid="select-timezone">
              <SelectValue placeholder="Select timezone" />
            </SelectTrigger>
            <SelectContent>
              {availableTimezones.map((tz) => (
                <SelectItem key={tz.value} value={tz.value}>
                  {tz.city} ({tz.label})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="Custom label (optional)"
            value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)}
            className="flex-1"
            data-testid="input-custom-label"
          />
          <Button onClick={addClock} data-testid="button-add-clock">
            <Plus className="w-4 h-4 mr-2" /> Add
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {clocks.map((clock) => {
          const { hourRotation, minuteRotation, secondRotation } = getAnalogClockRotation(clock.timezone);
          const daytime = isDaytime(clock.timezone);

          return (
            <Card
              key={clock.id}
              className={`p-4 relative ${daytime ? "bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950/30 dark:to-blue-950/30" : "bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30"}`}
              data-testid={`clock-${clock.id}`}
            >
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => removeClock(clock.id)}
                data-testid={`button-remove-${clock.id}`}
              >
                <Trash2 className="w-4 h-4" />
              </Button>

              <div className="flex items-center gap-2 mb-3">
                {daytime ? (
                  <Sun className="w-4 h-4 text-amber-500" />
                ) : (
                  <Moon className="w-4 h-4 text-indigo-400" />
                )}
                <span className="font-medium" data-testid={`label-${clock.id}`}>{clock.label}</span>
              </div>

              <div className="flex justify-center mb-3">
                <div className="relative w-24 h-24">
                  <div className="absolute inset-0 rounded-full border-2 border-border bg-background">
                    {[...Array(12)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-1 h-1 bg-muted-foreground rounded-full"
                        style={{
                          top: `${50 - 42 * Math.cos((i * 30 * Math.PI) / 180)}%`,
                          left: `${50 + 42 * Math.sin((i * 30 * Math.PI) / 180)}%`,
                          transform: "translate(-50%, -50%)",
                        }}
                      />
                    ))}
                    <div
                      className="absolute w-1 h-6 bg-foreground rounded-full origin-bottom"
                      style={{
                        bottom: "50%",
                        left: "calc(50% - 2px)",
                        transform: `rotate(${hourRotation}deg)`,
                      }}
                    />
                    <div
                      className="absolute w-0.5 h-8 bg-foreground rounded-full origin-bottom"
                      style={{
                        bottom: "50%",
                        left: "calc(50% - 1px)",
                        transform: `rotate(${minuteRotation}deg)`,
                      }}
                    />
                    <div
                      className="absolute w-px h-9 bg-destructive rounded-full origin-bottom"
                      style={{
                        bottom: "50%",
                        left: "50%",
                        transform: `rotate(${secondRotation}deg)`,
                      }}
                    />
                    <div className="absolute w-2 h-2 bg-foreground rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                  </div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-2xl font-bold font-mono" data-testid={`time-${clock.id}`}>
                  {getTimeForTimezone(clock.timezone)}
                </p>
                <p className="text-sm text-muted-foreground" data-testid={`date-${clock.id}`}>
                  {getDateForTimezone(clock.timezone)}
                </p>
              </div>
            </Card>
          );
        })}
      </div>

      {clocks.length === 0 && (
        <Card className="p-8 text-center">
          <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No clocks added. Add a timezone above to get started.</p>
        </Card>
      )}
    </div>
  );
}
