import { useState, useCallback, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, RotateCcw, Clock, Calendar, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CronParts {
  minute: string;
  hour: string;
  dayOfMonth: string;
  month: string;
  dayOfWeek: string;
}

const presets = [
  { label: "Every minute", value: "* * * * *" },
  { label: "Every 5 minutes", value: "*/5 * * * *" },
  { label: "Every 15 minutes", value: "*/15 * * * *" },
  { label: "Every 30 minutes", value: "*/30 * * * *" },
  { label: "Every hour", value: "0 * * * *" },
  { label: "Every 2 hours", value: "0 */2 * * *" },
  { label: "Every day at midnight", value: "0 0 * * *" },
  { label: "Every day at noon", value: "0 12 * * *" },
  { label: "Every Sunday at midnight", value: "0 0 * * 0" },
  { label: "Every Monday at 9 AM", value: "0 9 * * 1" },
  { label: "First day of month at midnight", value: "0 0 1 * *" },
  { label: "Every weekday at 9 AM", value: "0 9 * * 1-5" },
  { label: "Every weekend at 10 AM", value: "0 10 * * 0,6" },
  { label: "Every year on Jan 1st", value: "0 0 1 1 *" },
];

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function describeCron(cron: string): string {
  const parts = cron.split(" ");
  if (parts.length !== 5) return "Invalid cron expression";
  
  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
  
  let description = "Runs ";
  
  if (minute === "*" && hour === "*" && dayOfMonth === "*" && month === "*" && dayOfWeek === "*") {
    return "Runs every minute";
  }
  
  if (minute.startsWith("*/")) {
    description += `every ${minute.substring(2)} minutes`;
  } else if (minute === "*") {
    description += "every minute";
  } else if (minute === "0") {
    description += "at minute 0";
  } else {
    description += `at minute ${minute}`;
  }
  
  if (hour.startsWith("*/")) {
    description += `, every ${hour.substring(2)} hours`;
  } else if (hour !== "*") {
    const h = parseInt(hour);
    const period = h >= 12 ? "PM" : "AM";
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    description = `Runs at ${h12}:${minute.padStart(2, "0")} ${period}`;
  }
  
  if (dayOfMonth !== "*") {
    if (dayOfMonth === "1") {
      description += " on the 1st";
    } else if (dayOfMonth === "2") {
      description += " on the 2nd";
    } else if (dayOfMonth === "3") {
      description += " on the 3rd";
    } else {
      description += ` on day ${dayOfMonth}`;
    }
  }
  
  if (month !== "*") {
    const monthNum = parseInt(month);
    if (monthNum >= 1 && monthNum <= 12) {
      description += ` of ${months[monthNum - 1]}`;
    }
  }
  
  if (dayOfWeek !== "*") {
    if (dayOfWeek.includes("-")) {
      const [start, end] = dayOfWeek.split("-").map(Number);
      description += ` on ${days[start]} through ${days[end]}`;
    } else if (dayOfWeek.includes(",")) {
      const dayList = dayOfWeek.split(",").map(d => days[parseInt(d)]).join(", ");
      description += ` on ${dayList}`;
    } else {
      const dayNum = parseInt(dayOfWeek);
      if (dayNum >= 0 && dayNum <= 6) {
        description += ` on ${days[dayNum]}`;
      }
    }
  }
  
  return description;
}

function getNextRuns(cron: string, count: number = 5): Date[] {
  const parts = cron.split(" ");
  if (parts.length !== 5) return [];
  
  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
  const runs: Date[] = [];
  const now = new Date();
  let current = new Date(now);
  current.setSeconds(0);
  current.setMilliseconds(0);
  
  const matchesPart = (value: number, part: string, max: number): boolean => {
    if (part === "*") return true;
    if (part.startsWith("*/")) {
      const interval = parseInt(part.substring(2));
      return value % interval === 0;
    }
    if (part.includes(",")) {
      return part.split(",").map(Number).includes(value);
    }
    if (part.includes("-")) {
      const [start, end] = part.split("-").map(Number);
      return value >= start && value <= end;
    }
    return value === parseInt(part);
  };
  
  for (let i = 0; i < 1000 && runs.length < count; i++) {
    current = new Date(current.getTime() + 60000);
    
    if (matchesPart(current.getMinutes(), minute, 59) &&
        matchesPart(current.getHours(), hour, 23) &&
        matchesPart(current.getDate(), dayOfMonth, 31) &&
        matchesPart(current.getMonth() + 1, month, 12) &&
        matchesPart(current.getDay(), dayOfWeek, 6)) {
      runs.push(new Date(current));
    }
  }
  
  return runs;
}

export function CronJobGenerator() {
  const { toast } = useToast();
  const [mode, setMode] = useState<"simple" | "advanced">("simple");
  const [parts, setParts] = useState<CronParts>({
    minute: "*",
    hour: "*",
    dayOfMonth: "*",
    month: "*",
    dayOfWeek: "*"
  });
  const [cronExpression, setCronExpression] = useState("* * * * *");
  const [command, setCommand] = useState("");
  const [description, setDescription] = useState("");
  const [nextRuns, setNextRuns] = useState<Date[]>([]);

  const updateFromParts = useCallback(() => {
    const expr = `${parts.minute} ${parts.hour} ${parts.dayOfMonth} ${parts.month} ${parts.dayOfWeek}`;
    setCronExpression(expr);
    setDescription(describeCron(expr));
    setNextRuns(getNextRuns(expr));
  }, [parts]);

  const updateFromExpression = useCallback((expr: string) => {
    setCronExpression(expr);
    const p = expr.split(" ");
    if (p.length === 5) {
      setParts({
        minute: p[0],
        hour: p[1],
        dayOfMonth: p[2],
        month: p[3],
        dayOfWeek: p[4]
      });
      setDescription(describeCron(expr));
      setNextRuns(getNextRuns(expr));
    }
  }, []);

  useEffect(() => {
    if (mode === "simple") {
      updateFromParts();
    }
  }, [parts, mode, updateFromParts]);

  const applyPreset = (value: string) => {
    updateFromExpression(value);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied",
        description: "Copied to clipboard",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to copy",
        variant: "destructive",
      });
    }
  };

  const getFullCronLine = () => {
    return command ? `${cronExpression} ${command}` : cronExpression;
  };

  const reset = () => {
    setParts({
      minute: "*",
      hour: "*",
      dayOfMonth: "*",
      month: "*",
      dayOfWeek: "*"
    });
    setCronExpression("* * * * *");
    setCommand("");
    setDescription("");
    setNextRuns([]);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <Tabs value={mode} onValueChange={(v) => setMode(v as "simple" | "advanced")}>
          <TabsList className="mb-4">
            <TabsTrigger value="simple" data-testid="tab-simple">Simple</TabsTrigger>
            <TabsTrigger value="advanced" data-testid="tab-advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="simple" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label>Minute (0-59)</Label>
                <Input
                  value={parts.minute}
                  onChange={(e) => setParts({ ...parts, minute: e.target.value })}
                  placeholder="*"
                  data-testid="input-minute"
                />
              </div>
              <div className="space-y-2">
                <Label>Hour (0-23)</Label>
                <Input
                  value={parts.hour}
                  onChange={(e) => setParts({ ...parts, hour: e.target.value })}
                  placeholder="*"
                  data-testid="input-hour"
                />
              </div>
              <div className="space-y-2">
                <Label>Day (1-31)</Label>
                <Input
                  value={parts.dayOfMonth}
                  onChange={(e) => setParts({ ...parts, dayOfMonth: e.target.value })}
                  placeholder="*"
                  data-testid="input-day"
                />
              </div>
              <div className="space-y-2">
                <Label>Month (1-12)</Label>
                <Input
                  value={parts.month}
                  onChange={(e) => setParts({ ...parts, month: e.target.value })}
                  placeholder="*"
                  data-testid="input-month"
                />
              </div>
              <div className="space-y-2">
                <Label>Weekday (0-6)</Label>
                <Input
                  value={parts.dayOfWeek}
                  onChange={(e) => setParts({ ...parts, dayOfWeek: e.target.value })}
                  placeholder="*"
                  data-testid="input-weekday"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Quick Presets</Label>
              <Select onValueChange={applyPreset}>
                <SelectTrigger data-testid="select-preset">
                  <SelectValue placeholder="Select a preset..." />
                </SelectTrigger>
                <SelectContent>
                  {presets.map(preset => (
                    <SelectItem key={preset.value} value={preset.value}>
                      {preset.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <div className="space-y-2">
              <Label>Cron Expression</Label>
              <Input
                value={cronExpression}
                onChange={(e) => updateFromExpression(e.target.value)}
                placeholder="* * * * *"
                className="font-mono"
                data-testid="input-cron-expression"
              />
              <p className="text-sm text-muted-foreground">
                Format: minute hour day-of-month month day-of-week
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="space-y-2 mt-4">
          <Label>Command (optional)</Label>
          <Input
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="/path/to/script.sh"
            data-testid="input-command"
          />
        </div>
      </Card>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <Label className="font-medium text-lg">Generated Cron Expression</Label>
          </div>
          
          <div className="p-4 bg-muted rounded-md font-mono text-lg" data-testid="output-cron">
            {getFullCronLine()}
          </div>
          
          {description && (
            <div className="p-3 bg-muted/50 rounded-md">
              <p className="text-muted-foreground" data-testid="output-description">{description}</p>
            </div>
          )}

          <Button variant="outline" onClick={() => copyToClipboard(getFullCronLine())} data-testid="button-copy">
            <Copy className="h-4 w-4 mr-2" /> Copy
          </Button>
        </div>
      </Card>

      {nextRuns.length > 0 && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <Label className="font-medium text-lg">Next 5 Scheduled Runs</Label>
            </div>
            <div className="space-y-2">
              {nextRuns.map((run, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                  <Play className="h-4 w-4 text-muted-foreground" />
                  <span data-testid={`output-next-run-${index}`}>
                    {run.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      <Card className="p-6">
        <div className="space-y-3">
          <Label className="font-medium">Cron Syntax Reference</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="p-2 bg-muted rounded">
              <span className="font-mono">*</span> - Any value
            </div>
            <div className="p-2 bg-muted rounded">
              <span className="font-mono">,</span> - List separator (1,3,5)
            </div>
            <div className="p-2 bg-muted rounded">
              <span className="font-mono">-</span> - Range (1-5)
            </div>
            <div className="p-2 bg-muted rounded">
              <span className="font-mono">/</span> - Step values (*/15)
            </div>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button variant="outline" onClick={reset} data-testid="button-reset">
          <RotateCcw className="h-4 w-4 mr-2" /> Reset
        </Button>
      </div>
    </div>
  );
}
