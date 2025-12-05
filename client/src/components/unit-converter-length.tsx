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

type LengthUnit = 
  | "meter"
  | "kilometer"
  | "centimeter"
  | "millimeter"
  | "micrometer"
  | "nanometer"
  | "mile"
  | "yard"
  | "foot"
  | "inch"
  | "nautical-mile";

const lengthUnits: { value: LengthUnit; label: string; symbol: string }[] = [
  { value: "meter", label: "Meter", symbol: "m" },
  { value: "kilometer", label: "Kilometer", symbol: "km" },
  { value: "centimeter", label: "Centimeter", symbol: "cm" },
  { value: "millimeter", label: "Millimeter", symbol: "mm" },
  { value: "micrometer", label: "Micrometer", symbol: "μm" },
  { value: "nanometer", label: "Nanometer", symbol: "nm" },
  { value: "mile", label: "Mile", symbol: "mi" },
  { value: "yard", label: "Yard", symbol: "yd" },
  { value: "foot", label: "Foot", symbol: "ft" },
  { value: "inch", label: "Inch", symbol: "in" },
  { value: "nautical-mile", label: "Nautical Mile", symbol: "nmi" },
];

const toMeters: Record<LengthUnit, number> = {
  meter: 1,
  kilometer: 1000,
  centimeter: 0.01,
  millimeter: 0.001,
  micrometer: 0.000001,
  nanometer: 0.000000001,
  mile: 1609.344,
  yard: 0.9144,
  foot: 0.3048,
  inch: 0.0254,
  "nautical-mile": 1852,
};

export function UnitConverterLength() {
  const [fromValue, setFromValue] = useState("1");
  const [fromUnit, setFromUnit] = useState<LengthUnit>("meter");
  const [toUnit, setToUnit] = useState<LengthUnit>("foot");
  const [result, setResult] = useState("");

  const convert = useCallback(() => {
    const value = parseFloat(fromValue);
    if (isNaN(value)) {
      setResult("");
      return;
    }

    const inMeters = value * toMeters[fromUnit];
    const converted = inMeters / toMeters[toUnit];
    
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
      const inMeters = value * toMeters[fromUnit];
      const converted = inMeters / toMeters[toUnit];
      setFromValue(converted.toString());
    }
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  const reset = () => {
    setFromValue("1");
    setFromUnit("meter");
    setToUnit("foot");
  };

  const getSymbol = (unit: LengthUnit) => {
    return lengthUnits.find((u) => u.value === unit)?.symbol || "";
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <Label>From</Label>
          <Select value={fromUnit} onValueChange={(v) => setFromUnit(v as LengthUnit)}>
            <SelectTrigger data-testid="select-from-unit">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {lengthUnits.map((unit) => (
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
          <Select value={toUnit} onValueChange={(v) => setToUnit(v as LengthUnit)}>
            <SelectTrigger data-testid="select-to-unit">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {lengthUnits.map((unit) => (
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
          {lengthUnits
            .filter((u) => u.value !== fromUnit)
            .map((unit) => {
              const value = parseFloat(fromValue) || 0;
              const inMeters = value * toMeters[fromUnit];
              const converted = inMeters / toMeters[unit.value];
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
