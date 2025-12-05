import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCcw, Cake, Calendar, Clock } from "lucide-react";

interface AgeResult {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  totalWeeks: number;
  totalMonths: number;
  totalHours: number;
  totalMinutes: number;
  nextBirthday: number;
  zodiacSign: string;
  chineseZodiac: string;
  dayOfBirth: string;
}

const zodiacSigns = [
  { name: "Capricorn", start: [12, 22], end: [1, 19] },
  { name: "Aquarius", start: [1, 20], end: [2, 18] },
  { name: "Pisces", start: [2, 19], end: [3, 20] },
  { name: "Aries", start: [3, 21], end: [4, 19] },
  { name: "Taurus", start: [4, 20], end: [5, 20] },
  { name: "Gemini", start: [5, 21], end: [6, 20] },
  { name: "Cancer", start: [6, 21], end: [7, 22] },
  { name: "Leo", start: [7, 23], end: [8, 22] },
  { name: "Virgo", start: [8, 23], end: [9, 22] },
  { name: "Libra", start: [9, 23], end: [10, 22] },
  { name: "Scorpio", start: [10, 23], end: [11, 21] },
  { name: "Sagittarius", start: [11, 22], end: [12, 21] },
];

const chineseZodiacs = [
  "Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake",
  "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig"
];

function getZodiacSign(month: number, day: number): string {
  for (const sign of zodiacSigns) {
    const [startMonth, startDay] = sign.start;
    const [endMonth, endDay] = sign.end;
    
    if (startMonth === 12 && endMonth === 1) {
      if ((month === 12 && day >= startDay) || (month === 1 && day <= endDay)) {
        return sign.name;
      }
    } else if (
      (month === startMonth && day >= startDay) ||
      (month === endMonth && day <= endDay)
    ) {
      return sign.name;
    }
  }
  return "Unknown";
}

function getChineseZodiac(year: number): string {
  return chineseZodiacs[(year - 4) % 12];
}

export function AgeCalculator() {
  const [birthDate, setBirthDate] = useState("");
  const [result, setResult] = useState<AgeResult | null>(null);
  const [error, setError] = useState("");

  const calculateAge = useCallback(() => {
    if (!birthDate) {
      setResult(null);
      setError("");
      return;
    }

    const birth = new Date(birthDate);
    const today = new Date();

    if (birth > today) {
      setError("Birth date cannot be in the future");
      setResult(null);
      return;
    }

    setError("");

    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    let days = today.getDate() - birth.getDate();

    if (days < 0) {
      months--;
      const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += lastMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    const timeDiff = today.getTime() - birth.getTime();
    const totalDays = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const totalMonths = years * 12 + months;
    const totalHours = Math.floor(timeDiff / (1000 * 60 * 60));
    const totalMinutes = Math.floor(timeDiff / (1000 * 60));

    let nextBirthday = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
    if (nextBirthday <= today) {
      nextBirthday = new Date(today.getFullYear() + 1, birth.getMonth(), birth.getDate());
    }
    const daysUntilBirthday = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayOfBirth = dayNames[birth.getDay()];

    setResult({
      years,
      months,
      days,
      totalDays,
      totalWeeks,
      totalMonths,
      totalHours,
      totalMinutes,
      nextBirthday: daysUntilBirthday,
      zodiacSign: getZodiacSign(birth.getMonth() + 1, birth.getDate()),
      chineseZodiac: getChineseZodiac(birth.getFullYear()),
      dayOfBirth,
    });
  }, [birthDate]);

  useEffect(() => {
    calculateAge();
  }, [calculateAge]);

  const reset = () => {
    setBirthDate("");
    setResult(null);
    setError("");
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label>Date of Birth</Label>
        <Input
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          max={new Date().toISOString().split("T")[0]}
          data-testid="input-birthdate"
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      {result && (
        <>
          <Card className="p-6">
            <div className="text-center">
              <Cake className="w-12 h-12 mx-auto text-primary mb-4" />
              <p className="text-4xl font-bold" data-testid="text-age">
                {result.years} years
              </p>
              <p className="text-xl text-muted-foreground" data-testid="text-age-detail">
                {result.months} months, {result.days} days
              </p>
            </div>
          </Card>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 text-center">
              <Calendar className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
              <p className="text-2xl font-bold" data-testid="text-total-days">{result.totalDays.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Days</p>
            </Card>
            <Card className="p-4 text-center">
              <Calendar className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
              <p className="text-2xl font-bold" data-testid="text-total-weeks">{result.totalWeeks.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Weeks</p>
            </Card>
            <Card className="p-4 text-center">
              <Calendar className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
              <p className="text-2xl font-bold" data-testid="text-total-months">{result.totalMonths.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Months</p>
            </Card>
            <Card className="p-4 text-center">
              <Clock className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
              <p className="text-2xl font-bold" data-testid="text-total-hours">{result.totalHours.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Hours</p>
            </Card>
          </div>

          <Card className="p-4">
            <Label className="text-sm font-medium">Additional Information</Label>
            <div className="grid grid-cols-2 gap-4 mt-3">
              <div className="p-3 bg-muted rounded">
                <p className="text-sm text-muted-foreground">Next Birthday</p>
                <p className="font-medium" data-testid="text-next-birthday">
                  {result.nextBirthday === 0 ? "Today!" : `${result.nextBirthday} days`}
                </p>
              </div>
              <div className="p-3 bg-muted rounded">
                <p className="text-sm text-muted-foreground">Born on</p>
                <p className="font-medium" data-testid="text-day-of-birth">{result.dayOfBirth}</p>
              </div>
              <div className="p-3 bg-muted rounded">
                <p className="text-sm text-muted-foreground">Zodiac Sign</p>
                <p className="font-medium" data-testid="text-zodiac">{result.zodiacSign}</p>
              </div>
              <div className="p-3 bg-muted rounded">
                <p className="text-sm text-muted-foreground">Chinese Zodiac</p>
                <p className="font-medium" data-testid="text-chinese-zodiac">{result.chineseZodiac}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <Label className="text-sm font-medium">Life Statistics</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3 text-sm">
              <div className="p-2 bg-muted rounded flex justify-between">
                <span className="text-muted-foreground">Heartbeats (avg):</span>
                <span className="font-medium">{(result.totalMinutes * 72).toLocaleString()}</span>
              </div>
              <div className="p-2 bg-muted rounded flex justify-between">
                <span className="text-muted-foreground">Breaths (avg):</span>
                <span className="font-medium">{(result.totalMinutes * 16).toLocaleString()}</span>
              </div>
              <div className="p-2 bg-muted rounded flex justify-between">
                <span className="text-muted-foreground">Sleep hours (avg):</span>
                <span className="font-medium">{Math.floor(result.totalDays * 8).toLocaleString()}</span>
              </div>
              <div className="p-2 bg-muted rounded flex justify-between">
                <span className="text-muted-foreground">Meals (avg):</span>
                <span className="font-medium">{(result.totalDays * 3).toLocaleString()}</span>
              </div>
            </div>
          </Card>
        </>
      )}

      <div className="flex justify-end">
        <Button variant="outline" onClick={reset} data-testid="button-reset">
          <RotateCcw className="w-4 h-4 mr-2" /> Reset
        </Button>
      </div>
    </div>
  );
}
