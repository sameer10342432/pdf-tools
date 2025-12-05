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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RotateCcw, ArrowRightLeft, Plus, Minus } from "lucide-react";

interface DateDifference {
  years: number;
  months: number;
  weeks: number;
  days: number;
  totalDays: number;
  totalWeeks: number;
  totalMonths: number;
  businessDays: number;
}

export function DateCalculator() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [difference, setDifference] = useState<DateDifference | null>(null);

  const [baseDate, setBaseDate] = useState("");
  const [addYears, setAddYears] = useState("0");
  const [addMonths, setAddMonths] = useState("0");
  const [addWeeks, setAddWeeks] = useState("0");
  const [addDays, setAddDays] = useState("0");
  const [operation, setOperation] = useState<"add" | "subtract">("add");
  const [calculatedDate, setCalculatedDate] = useState("");

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setStartDate(today);
    setEndDate(today);
    setBaseDate(today);
  }, []);

  const calculateDifference = useCallback(() => {
    if (!startDate || !endDate) {
      setDifference(null);
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const [earlier, later] = start <= end ? [start, end] : [end, start];

    let years = later.getFullYear() - earlier.getFullYear();
    let months = later.getMonth() - earlier.getMonth();
    let days = later.getDate() - earlier.getDate();

    if (days < 0) {
      months--;
      const lastMonth = new Date(later.getFullYear(), later.getMonth(), 0);
      days += lastMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    const totalMs = Math.abs(later.getTime() - earlier.getTime());
    const totalDays = Math.floor(totalMs / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const totalMonths = years * 12 + months;

    let businessDays = 0;
    const current = new Date(earlier);
    while (current <= later) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        businessDays++;
      }
      current.setDate(current.getDate() + 1);
    }

    setDifference({
      years,
      months,
      weeks: Math.floor((totalDays % 30) / 7),
      days: totalDays % 7,
      totalDays,
      totalWeeks,
      totalMonths,
      businessDays,
    });
  }, [startDate, endDate]);

  useEffect(() => {
    calculateDifference();
  }, [calculateDifference]);

  const calculateNewDate = useCallback(() => {
    if (!baseDate) {
      setCalculatedDate("");
      return;
    }

    const date = new Date(baseDate);
    const multiplier = operation === "add" ? 1 : -1;

    date.setFullYear(date.getFullYear() + multiplier * parseInt(addYears || "0"));
    date.setMonth(date.getMonth() + multiplier * parseInt(addMonths || "0"));
    date.setDate(date.getDate() + multiplier * (parseInt(addWeeks || "0") * 7 + parseInt(addDays || "0")));

    const formattedDate = date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    setCalculatedDate(formattedDate);
  }, [baseDate, addYears, addMonths, addWeeks, addDays, operation]);

  useEffect(() => {
    calculateNewDate();
  }, [calculateNewDate]);

  const swapDates = () => {
    const temp = startDate;
    setStartDate(endDate);
    setEndDate(temp);
  };

  const resetDifference = () => {
    const today = new Date().toISOString().split("T")[0];
    setStartDate(today);
    setEndDate(today);
  };

  const resetAddSubtract = () => {
    const today = new Date().toISOString().split("T")[0];
    setBaseDate(today);
    setAddYears("0");
    setAddMonths("0");
    setAddWeeks("0");
    setAddDays("0");
    setOperation("add");
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="difference">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="difference" data-testid="tab-difference">Date Difference</TabsTrigger>
          <TabsTrigger value="add-subtract" data-testid="tab-add-subtract">Add/Subtract</TabsTrigger>
        </TabsList>

        <TabsContent value="difference" className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                data-testid="input-start-date"
              />
            </div>
            <div className="space-y-3">
              <Label>End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                data-testid="input-end-date"
              />
            </div>
          </div>

          <div className="flex justify-center">
            <Button variant="outline" onClick={swapDates} data-testid="button-swap-dates">
              <ArrowRightLeft className="w-4 h-4 mr-2" /> Swap Dates
            </Button>
          </div>

          {difference && (
            <>
              <Card className="p-6">
                <div className="text-center">
                  <p className="text-3xl font-bold" data-testid="text-difference">
                    {difference.years > 0 && `${difference.years} year${difference.years !== 1 ? "s" : ""}, `}
                    {difference.months > 0 && `${difference.months} month${difference.months !== 1 ? "s" : ""}, `}
                    {difference.totalDays % 30} day{difference.totalDays % 30 !== 1 ? "s" : ""}
                  </p>
                  <p className="text-muted-foreground mt-2">
                    or {difference.totalDays.toLocaleString()} days total
                  </p>
                </div>
              </Card>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4 text-center">
                  <p className="text-2xl font-bold" data-testid="text-total-days">{difference.totalDays.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Days</p>
                </Card>
                <Card className="p-4 text-center">
                  <p className="text-2xl font-bold" data-testid="text-total-weeks">{difference.totalWeeks.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Weeks</p>
                </Card>
                <Card className="p-4 text-center">
                  <p className="text-2xl font-bold" data-testid="text-total-months">{difference.totalMonths}</p>
                  <p className="text-sm text-muted-foreground">Months</p>
                </Card>
                <Card className="p-4 text-center">
                  <p className="text-2xl font-bold" data-testid="text-business-days">{difference.businessDays.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Business Days</p>
                </Card>
              </div>
            </>
          )}

          <div className="flex justify-end">
            <Button variant="outline" onClick={resetDifference} data-testid="button-reset-difference">
              <RotateCcw className="w-4 h-4 mr-2" /> Reset
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="add-subtract" className="space-y-6 mt-4">
          <div className="space-y-3">
            <Label>Base Date</Label>
            <Input
              type="date"
              value={baseDate}
              onChange={(e) => setBaseDate(e.target.value)}
              data-testid="input-base-date"
            />
          </div>

          <div className="space-y-3">
            <Label>Operation</Label>
            <Select value={operation} onValueChange={(v) => setOperation(v as "add" | "subtract")}>
              <SelectTrigger data-testid="select-operation">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="add">
                  <span className="flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Add
                  </span>
                </SelectItem>
                <SelectItem value="subtract">
                  <span className="flex items-center gap-2">
                    <Minus className="w-4 h-4" /> Subtract
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Years</Label>
              <Input
                type="number"
                min="0"
                value={addYears}
                onChange={(e) => setAddYears(e.target.value)}
                data-testid="input-add-years"
              />
            </div>
            <div className="space-y-2">
              <Label>Months</Label>
              <Input
                type="number"
                min="0"
                value={addMonths}
                onChange={(e) => setAddMonths(e.target.value)}
                data-testid="input-add-months"
              />
            </div>
            <div className="space-y-2">
              <Label>Weeks</Label>
              <Input
                type="number"
                min="0"
                value={addWeeks}
                onChange={(e) => setAddWeeks(e.target.value)}
                data-testid="input-add-weeks"
              />
            </div>
            <div className="space-y-2">
              <Label>Days</Label>
              <Input
                type="number"
                min="0"
                value={addDays}
                onChange={(e) => setAddDays(e.target.value)}
                data-testid="input-add-days"
              />
            </div>
          </div>

          <Card className="p-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Result</p>
              <p className="text-2xl font-bold" data-testid="text-calculated-date">
                {calculatedDate || "Select a date"}
              </p>
            </div>
          </Card>

          <div className="flex justify-end">
            <Button variant="outline" onClick={resetAddSubtract} data-testid="button-reset-add-subtract">
              <RotateCcw className="w-4 h-4 mr-2" /> Reset
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
