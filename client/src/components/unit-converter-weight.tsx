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

type WeightUnit = 
  | "kilogram"
  | "gram"
  | "milligram"
  | "microgram"
  | "metric-ton"
  | "pound"
  | "ounce"
  | "stone"
  | "us-ton"
  | "uk-ton"
  | "carat";

const weightUnits: { value: WeightUnit; label: string; symbol: string }[] = [
  { value: "kilogram", label: "Kilogram", symbol: "kg" },
  { value: "gram", label: "Gram", symbol: "g" },
  { value: "milligram", label: "Milligram", symbol: "mg" },
  { value: "microgram", label: "Microgram", symbol: "μg" },
  { value: "metric-ton", label: "Metric Ton", symbol: "t" },
  { value: "pound", label: "Pound", symbol: "lb" },
  { value: "ounce", label: "Ounce", symbol: "oz" },
  { value: "stone", label: "Stone", symbol: "st" },
  { value: "us-ton", label: "US Ton", symbol: "US t" },
  { value: "uk-ton", label: "UK Ton", symbol: "UK t" },
  { value: "carat", label: "Carat", symbol: "ct" },
];

const toKilograms: Record<WeightUnit, number> = {
  kilogram: 1,
  gram: 0.001,
  milligram: 0.000001,
  microgram: 0.000000001,
  "metric-ton": 1000,
  pound: 0.45359237,
  ounce: 0.028349523125,
  stone: 6.35029318,
  "us-ton": 907.18474,
  "uk-ton": 1016.0469088,
  carat: 0.0002,
};

export function UnitConverterWeight() {
  const [fromValue, setFromValue] = useState("1");
  const [fromUnit, setFromUnit] = useState<WeightUnit>("kilogram");
  const [toUnit, setToUnit] = useState<WeightUnit>("pound");
  const [result, setResult] = useState("");

  const convert = useCallback(() => {
    const value = parseFloat(fromValue);
    if (isNaN(value)) {
      setResult("");
      return;
    }

    const inKilograms = value * toKilograms[fromUnit];
    const converted = inKilograms / toKilograms[toUnit];
    
    if (converted === 0) {
      setResult("0");
    } else if (Math.abs(converted) < 0.000001 || Math.abs(converted) >= 1e9) {
      setResult(converted.toExponential(6));
    } else {
      setResult(converted.toLocaleString(undefined, { maximumFractionDigits: 10 }));
    }
  }, [fromValue, fromUnit, toUnit]);

  useEffect(() => {
    convert();
  }, [convert]);

  const swapUnits = () => {
    const value = parseFloat(fromValue);
    if (!isNaN(value)) {
      const inKilograms = value * toKilograms[fromUnit];
      const converted = inKilograms / toKilograms[toUnit];
      setFromValue(converted.toString());
    }
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  const reset = () => {
    setFromValue("1");
    setFromUnit("kilogram");
    setToUnit("pound");
  };

  const getSymbol = (unit: WeightUnit) => {
    return weightUnits.find((u) => u.value === unit)?.symbol || "";
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <Label>From</Label>
          <Select value={fromUnit} onValueChange={(v) => setFromUnit(v as WeightUnit)}>
            <SelectTrigger data-testid="select-from-unit">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {weightUnits.map((unit) => (
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
            placeholder="Enter value"
            data-testid="input-from-value"
          />
        </div>

        <div className="space-y-3">
          <Label>To</Label>
          <Select value={toUnit} onValueChange={(v) => setToUnit(v as WeightUnit)}>
            <SelectTrigger data-testid="select-to-unit">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {weightUnits.map((unit) => (
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
          {weightUnits
            .filter((u) => u.value !== fromUnit)
            .map((unit) => {
              const value = parseFloat(fromValue) || 0;
              const inKilograms = value * toKilograms[fromUnit];
              const converted = inKilograms / toKilograms[unit.value];
              const displayValue = Math.abs(converted) < 0.000001 || Math.abs(converted) >= 1e9
                ? converted.toExponential(4)
                : converted.toLocaleString(undefined, { maximumFractionDigits: 6 });
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

      <div className="flex justify-end">
        <Button variant="outline" onClick={reset} data-testid="button-reset">
          <RotateCcw className="w-4 h-4 mr-2" /> Reset
        </Button>
      </div>
    </div>
  );
}
