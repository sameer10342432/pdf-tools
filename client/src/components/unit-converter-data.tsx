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

type DataUnit = 
  | "bit"
  | "byte"
  | "kilobit"
  | "kilobyte"
  | "megabit"
  | "megabyte"
  | "gigabit"
  | "gigabyte"
  | "terabit"
  | "terabyte"
  | "petabit"
  | "petabyte"
  | "kibibyte"
  | "mebibyte"
  | "gibibyte"
  | "tebibyte";

const dataUnits: { value: DataUnit; label: string; symbol: string }[] = [
  { value: "bit", label: "Bit", symbol: "b" },
  { value: "byte", label: "Byte", symbol: "B" },
  { value: "kilobit", label: "Kilobit", symbol: "Kb" },
  { value: "kilobyte", label: "Kilobyte", symbol: "KB" },
  { value: "megabit", label: "Megabit", symbol: "Mb" },
  { value: "megabyte", label: "Megabyte", symbol: "MB" },
  { value: "gigabit", label: "Gigabit", symbol: "Gb" },
  { value: "gigabyte", label: "Gigabyte", symbol: "GB" },
  { value: "terabit", label: "Terabit", symbol: "Tb" },
  { value: "terabyte", label: "Terabyte", symbol: "TB" },
  { value: "petabit", label: "Petabit", symbol: "Pb" },
  { value: "petabyte", label: "Petabyte", symbol: "PB" },
  { value: "kibibyte", label: "Kibibyte", symbol: "KiB" },
  { value: "mebibyte", label: "Mebibyte", symbol: "MiB" },
  { value: "gibibyte", label: "Gibibyte", symbol: "GiB" },
  { value: "tebibyte", label: "Tebibyte", symbol: "TiB" },
];

const toBits: Record<DataUnit, number> = {
  bit: 1,
  byte: 8,
  kilobit: 1000,
  kilobyte: 8000,
  megabit: 1000000,
  megabyte: 8000000,
  gigabit: 1000000000,
  gigabyte: 8000000000,
  terabit: 1000000000000,
  terabyte: 8000000000000,
  petabit: 1000000000000000,
  petabyte: 8000000000000000,
  kibibyte: 8192,
  mebibyte: 8388608,
  gibibyte: 8589934592,
  tebibyte: 8796093022208,
};

export function UnitConverterData() {
  const [fromValue, setFromValue] = useState("1");
  const [fromUnit, setFromUnit] = useState<DataUnit>("gigabyte");
  const [toUnit, setToUnit] = useState<DataUnit>("megabyte");
  const [result, setResult] = useState("");

  const convert = useCallback(() => {
    const value = parseFloat(fromValue);
    if (isNaN(value)) {
      setResult("");
      return;
    }

    const inBits = value * toBits[fromUnit];
    const converted = inBits / toBits[toUnit];
    
    if (converted === 0) {
      setResult("0");
    } else if (Math.abs(converted) < 0.000001 || Math.abs(converted) >= 1e15) {
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
      const inBits = value * toBits[fromUnit];
      const converted = inBits / toBits[toUnit];
      setFromValue(converted.toString());
    }
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  const reset = () => {
    setFromValue("1");
    setFromUnit("gigabyte");
    setToUnit("megabyte");
  };

  const getSymbol = (unit: DataUnit) => {
    return dataUnits.find((u) => u.value === unit)?.symbol || "";
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <Label>From</Label>
          <Select value={fromUnit} onValueChange={(v) => setFromUnit(v as DataUnit)}>
            <SelectTrigger data-testid="select-from-unit">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {dataUnits.map((unit) => (
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
          <Select value={toUnit} onValueChange={(v) => setToUnit(v as DataUnit)}>
            <SelectTrigger data-testid="select-to-unit">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {dataUnits.map((unit) => (
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
        <Label className="text-sm font-medium">Common Conversions from {fromValue || "0"} {getSymbol(fromUnit)}</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-3">
          {dataUnits
            .filter((u) => u.value !== fromUnit)
            .slice(0, 9)
            .map((unit) => {
              const value = parseFloat(fromValue) || 0;
              const inBits = value * toBits[fromUnit];
              const converted = inBits / toBits[unit.value];
              const displayValue = Math.abs(converted) < 0.000001 || Math.abs(converted) >= 1e12
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

      <Card className="p-4">
        <Label className="text-sm font-medium">Decimal vs Binary Units</Label>
        <div className="mt-2 text-sm text-muted-foreground space-y-1">
          <p>Decimal (SI): 1 KB = 1,000 bytes, 1 MB = 1,000 KB</p>
          <p>Binary (IEC): 1 KiB = 1,024 bytes, 1 MiB = 1,024 KiB</p>
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
