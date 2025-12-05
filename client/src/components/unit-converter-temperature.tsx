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
import { ArrowRightLeft, RotateCcw } from "lucide-react";

type TemperatureUnit = "celsius" | "fahrenheit" | "kelvin" | "rankine";

const temperatureUnits: { value: TemperatureUnit; label: string; symbol: string }[] = [
  { value: "celsius", label: "Celsius", symbol: "°C" },
  { value: "fahrenheit", label: "Fahrenheit", symbol: "°F" },
  { value: "kelvin", label: "Kelvin", symbol: "K" },
  { value: "rankine", label: "Rankine", symbol: "°R" },
];

function convertTemperature(value: number, from: TemperatureUnit, to: TemperatureUnit): number {
  let celsius: number;
  switch (from) {
    case "celsius":
      celsius = value;
      break;
    case "fahrenheit":
      celsius = (value - 32) * (5 / 9);
      break;
    case "kelvin":
      celsius = value - 273.15;
      break;
    case "rankine":
      celsius = (value - 491.67) * (5 / 9);
      break;
  }

  switch (to) {
    case "celsius":
      return celsius;
    case "fahrenheit":
      return celsius * (9 / 5) + 32;
    case "kelvin":
      return celsius + 273.15;
    case "rankine":
      return (celsius + 273.15) * (9 / 5);
  }
}

export function UnitConverterTemperature() {
  const [fromValue, setFromValue] = useState("0");
  const [fromUnit, setFromUnit] = useState<TemperatureUnit>("celsius");
  const [toUnit, setToUnit] = useState<TemperatureUnit>("fahrenheit");
  const [result, setResult] = useState("");

  const convert = useCallback(() => {
    const value = parseFloat(fromValue);
    if (isNaN(value)) {
      setResult("");
      return;
    }

    const converted = convertTemperature(value, fromUnit, toUnit);
    setResult(converted.toLocaleString(undefined, { maximumFractionDigits: 4 }));
  }, [fromValue, fromUnit, toUnit]);

  useEffect(() => {
    convert();
  }, [convert]);

  const swapUnits = () => {
    const value = parseFloat(fromValue);
    if (!isNaN(value)) {
      const converted = convertTemperature(value, fromUnit, toUnit);
      setFromValue(converted.toString());
    }
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  const reset = () => {
    setFromValue("0");
    setFromUnit("celsius");
    setToUnit("fahrenheit");
  };

  const getSymbol = (unit: TemperatureUnit) => {
    return temperatureUnits.find((u) => u.value === unit)?.symbol || "";
  };

  const value = parseFloat(fromValue) || 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <Label>From</Label>
          <Select value={fromUnit} onValueChange={(v) => setFromUnit(v as TemperatureUnit)}>
            <SelectTrigger data-testid="select-from-unit">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {temperatureUnits.map((unit) => (
                <SelectItem key={unit.value} value={unit.value}>
                  {unit.label} ({unit.symbol})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="number"
            value={fromValue}
            onChange={(e) => setFromValue(e.target.value)}
            placeholder="Enter temperature"
            data-testid="input-from-value"
          />
        </div>

        <div className="space-y-3">
          <Label>To</Label>
          <Select value={toUnit} onValueChange={(v) => setToUnit(v as TemperatureUnit)}>
            <SelectTrigger data-testid="select-to-unit">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {temperatureUnits.map((unit) => (
                <SelectItem key={unit.value} value={unit.value}>
                  {unit.label} ({unit.symbol})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="text"
            value={result}
            readOnly
            placeholder="Result"
            className="bg-muted"
            data-testid="input-result"
          />
        </div>
      </div>

      <div className="flex justify-center">
        <Button variant="outline" onClick={swapUnits} data-testid="button-swap">
          <ArrowRightLeft className="w-4 h-4 mr-2" /> Swap Units
        </Button>
      </div>

      <Card className="p-4">
        <div className="text-center">
          <p className="text-2xl font-bold" data-testid="text-conversion-result">
            {fromValue || "0"} {getSymbol(fromUnit)} = {result || "0"} {getSymbol(toUnit)}
          </p>
        </div>
      </Card>

      <Card className="p-4">
        <Label className="text-sm font-medium">All Conversions from {fromValue || "0"} {getSymbol(fromUnit)}</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-3">
          {temperatureUnits
            .filter((u) => u.value !== fromUnit)
            .map((unit) => {
              const converted = convertTemperature(value, fromUnit, unit.value);
              const displayValue = converted.toLocaleString(undefined, { maximumFractionDigits: 4 });
              return (
                <div
                  key={unit.value}
                  className="p-2 bg-muted rounded text-sm"
                  data-testid={`conversion-${unit.value}`}
                >
                  <span className="font-medium">{displayValue}</span>{" "}
                  <span className="text-muted-foreground">{unit.symbol}</span>
                </div>
              );
            })}
        </div>
      </Card>

      <Card className="p-4">
        <Label className="text-sm font-medium">Conversion Formulas</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3 text-sm text-muted-foreground">
          <div className="p-2 bg-muted rounded font-mono">°F = °C × 9/5 + 32</div>
          <div className="p-2 bg-muted rounded font-mono">°C = (°F - 32) × 5/9</div>
          <div className="p-2 bg-muted rounded font-mono">K = °C + 273.15</div>
          <div className="p-2 bg-muted rounded font-mono">°R = (°C + 273.15) × 9/5</div>
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
