import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRightLeft, RotateCcw, Clock } from "lucide-react";

const timeZones = [
  { value: "UTC", label: "UTC (Coordinated Universal Time)", offset: 0 },
  { value: "America/New_York", label: "New York (EST/EDT)", offset: -5 },
  { value: "America/Los_Angeles", label: "Los Angeles (PST/PDT)", offset: -8 },
  { value: "America/Chicago", label: "Chicago (CST/CDT)", offset: -6 },
  { value: "America/Denver", label: "Denver (MST/MDT)", offset: -7 },
  { value: "Europe/London", label: "London (GMT/BST)", offset: 0 },
  { value: "Europe/Paris", label: "Paris (CET/CEST)", offset: 1 },
  { value: "Europe/Berlin", label: "Berlin (CET/CEST)", offset: 1 },
  { value: "Europe/Moscow", label: "Moscow (MSK)", offset: 3 },
  { value: "Asia/Tokyo", label: "Tokyo (JST)", offset: 9 },
  { value: "Asia/Shanghai", label: "Shanghai (CST)", offset: 8 },
  { value: "Asia/Hong_Kong", label: "Hong Kong (HKT)", offset: 8 },
  { value: "Asia/Singapore", label: "Singapore (SGT)", offset: 8 },
  { value: "Asia/Dubai", label: "Dubai (GST)", offset: 4 },
  { value: "Asia/Kolkata", label: "India (IST)", offset: 5.5 },
  { value: "Australia/Sydney", label: "Sydney (AEST/AEDT)", offset: 10 },
  { value: "Australia/Perth", label: "Perth (AWST)", offset: 8 },
  { value: "Pacific/Auckland", label: "Auckland (NZST/NZDT)", offset: 12 },
  { value: "Pacific/Honolulu", label: "Honolulu (HST)", offset: -10 },
  { value: "America/Sao_Paulo", label: "Sao Paulo (BRT)", offset: -3 },
];

export function TimeZoneConverter() {
  const [fromZone, setFromZone] = useState("America/New_York");
  const [toZone, setToZone] = useState("Europe/London");
  const [dateTime, setDateTime] = useState("");
  const [convertedTime, setConvertedTime] = useState("");

  useEffect(() => {
    const now = new Date();
    const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setDateTime(localDateTime);
  }, []);

  const convert = useCallback(() => {
    if (!dateTime) {
      setConvertedTime("");
      return;
    }

    try {
      const inputDate = new Date(dateTime);
      
      const options: Intl.DateTimeFormatOptions = {
        timeZone: toZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      };

      const fromOptions: Intl.DateTimeFormatOptions = {
        timeZone: fromZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      };

      const fromFormatter = new Intl.DateTimeFormat("en-US", fromOptions);
      const fromParts = fromFormatter.formatToParts(inputDate);
      
      const fromDate = new Date(
        `${fromParts.find(p => p.type === "year")?.value}-${fromParts.find(p => p.type === "month")?.value}-${fromParts.find(p => p.type === "day")?.value}T${fromParts.find(p => p.type === "hour")?.value}:${fromParts.find(p => p.type === "minute")?.value}`
      );

      const utcDate = new Date(inputDate.getTime());
      
      const formatter = new Intl.DateTimeFormat("en-US", options);
      setConvertedTime(formatter.format(utcDate));
    } catch {
      setConvertedTime("Invalid date");
    }
  }, [dateTime, fromZone, toZone]);

  useEffect(() => {
    convert();
  }, [convert]);

  const swapZones = () => {
    const temp = fromZone;
    setFromZone(toZone);
    setToZone(temp);
  };

  const setToNow = () => {
    const now = new Date();
    const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setDateTime(localDateTime);
  };

  const reset = () => {
    setFromZone("America/New_York");
    setToZone("Europe/London");
    setToNow();
  };

  const getZoneLabel = (zone: string) => {
    return timeZones.find((z) => z.value === zone)?.label || zone;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <Label>From Time Zone</Label>
          <Select value={fromZone} onValueChange={setFromZone}>
            <SelectTrigger data-testid="select-from-zone">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timeZones.map((zone) => (
                <SelectItem key={zone.value} value={zone.value}>
                  {zone.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Input
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              className="flex-1"
              data-testid="input-datetime"
            />
            <Button variant="outline" size="icon" onClick={setToNow} data-testid="button-now">
              <Clock className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <Label>To Time Zone</Label>
          <Select value={toZone} onValueChange={setToZone}>
            <SelectTrigger data-testid="select-to-zone">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timeZones.map((zone) => (
                <SelectItem key={zone.value} value={zone.value}>
                  {zone.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="text"
            value={convertedTime}
            readOnly
            placeholder="Converted time"
            className="bg-muted"
            data-testid="input-result"
          />
        </div>
      </div>

      <div className="flex justify-center">
        <Button variant="outline" onClick={swapZones} data-testid="button-swap">
          <ArrowRightLeft className="w-4 h-4 mr-2" /> Swap Time Zones
        </Button>
      </div>

      <Card className="p-4">
        <div className="text-center">
          <p className="text-lg font-medium text-muted-foreground" data-testid="text-from-zone">
            {getZoneLabel(fromZone)}
          </p>
          <p className="text-3xl font-bold my-2" data-testid="text-converted-time">
            {convertedTime || "--:--"}
          </p>
          <p className="text-lg font-medium text-muted-foreground" data-testid="text-to-zone">
            {getZoneLabel(toZone)}
          </p>
        </div>
      </Card>

      <Card className="p-4">
        <Label className="text-sm font-medium">Current Time in Popular Cities</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-3">
          {["America/New_York", "Europe/London", "Asia/Tokyo", "Asia/Dubai", "Australia/Sydney", "America/Los_Angeles"].map((zone) => {
            const now = new Date();
            const formatter = new Intl.DateTimeFormat("en-US", {
              timeZone: zone,
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            });
            return (
              <div
                key={zone}
                className="p-2 bg-muted rounded text-sm"
                data-testid={`time-${zone}`}
              >
                <span className="font-medium">{formatter.format(now)}</span>
                <span className="text-muted-foreground block text-xs">
                  {getZoneLabel(zone).split(" ")[0]}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="flex justify-end">
        <Button variant="outline" onClick={reset} data-testid="button-reset">
          <RotateCcw className="w-4 h-4 mr-2" /> Reset
        </Button>
      </div>
    </div>
  );
}
