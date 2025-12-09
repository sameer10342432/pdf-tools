import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function PercentageCalculator() {
  const [percentOf, setPercentOf] = useState({ percent: "", number: "", result: "" });
  const [whatPercent, setWhatPercent] = useState({ x: "", y: "", result: "" });
  const [percentChange, setPercentChange] = useState({ from: "", to: "", result: "" });
  const [reversePercent, setReversePercent] = useState({ final: "", percent: "", result: "" });

  const calculatePercentOf = useCallback(() => {
    const p = parseFloat(percentOf.percent);
    const n = parseFloat(percentOf.number);
    if (!isNaN(p) && !isNaN(n)) {
      setPercentOf({ ...percentOf, result: String((p / 100) * n) });
    }
  }, [percentOf]);

  const calculateWhatPercent = useCallback(() => {
    const x = parseFloat(whatPercent.x);
    const y = parseFloat(whatPercent.y);
    if (!isNaN(x) && !isNaN(y) && y !== 0) {
      setWhatPercent({ ...whatPercent, result: String(Math.round((x / y) * 10000) / 100) });
    }
  }, [whatPercent]);

  const calculatePercentChange = useCallback(() => {
    const from = parseFloat(percentChange.from);
    const to = parseFloat(percentChange.to);
    if (!isNaN(from) && !isNaN(to) && from !== 0) {
      const change = ((to - from) / from) * 100;
      setPercentChange({ ...percentChange, result: String(Math.round(change * 100) / 100) });
    }
  }, [percentChange]);

  const calculateReversePercent = useCallback(() => {
    const final = parseFloat(reversePercent.final);
    const percent = parseFloat(reversePercent.percent);
    if (!isNaN(final) && !isNaN(percent)) {
      const original = final / (1 + percent / 100);
      setReversePercent({ ...reversePercent, result: String(Math.round(original * 100) / 100) });
    }
  }, [reversePercent]);

  return (
    <div className="space-y-4">
      <Tabs defaultValue="percent-of" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="percent-of" data-testid="tab-percent-of">X% of Y</TabsTrigger>
          <TabsTrigger value="what-percent" data-testid="tab-what-percent">X is ?% of Y</TabsTrigger>
          <TabsTrigger value="percent-change" data-testid="tab-percent-change">% Change</TabsTrigger>
          <TabsTrigger value="reverse" data-testid="tab-reverse">Reverse %</TabsTrigger>
        </TabsList>

        <TabsContent value="percent-of">
          <Card className="p-6">
            <div className="space-y-4">
              <p className="text-lg font-medium">What is X% of Y?</p>
              <div className="flex flex-wrap items-end gap-2">
                <div className="space-y-2">
                  <Label>Percentage</Label>
                  <Input
                    type="number"
                    placeholder="10"
                    value={percentOf.percent}
                    onChange={(e) => setPercentOf({ ...percentOf, percent: e.target.value })}
                    className="w-24"
                    data-testid="input-percent-of-percent"
                  />
                </div>
                <span className="pb-2 text-lg">% of</span>
                <div className="space-y-2">
                  <Label>Number</Label>
                  <Input
                    type="number"
                    placeholder="100"
                    value={percentOf.number}
                    onChange={(e) => setPercentOf({ ...percentOf, number: e.target.value })}
                    className="w-32"
                    data-testid="input-percent-of-number"
                  />
                </div>
                <Button onClick={calculatePercentOf} data-testid="button-calculate-percent-of">=</Button>
                <div className="space-y-2">
                  <Label>Result</Label>
                  <Input
                    type="text"
                    value={percentOf.result}
                    readOnly
                    className="w-32 font-bold"
                    data-testid="input-percent-of-result"
                  />
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="what-percent">
          <Card className="p-6">
            <div className="space-y-4">
              <p className="text-lg font-medium">X is what percent of Y?</p>
              <div className="flex flex-wrap items-end gap-2">
                <div className="space-y-2">
                  <Label>X</Label>
                  <Input
                    type="number"
                    placeholder="25"
                    value={whatPercent.x}
                    onChange={(e) => setWhatPercent({ ...whatPercent, x: e.target.value })}
                    className="w-32"
                    data-testid="input-what-percent-x"
                  />
                </div>
                <span className="pb-2 text-lg">is what % of</span>
                <div className="space-y-2">
                  <Label>Y</Label>
                  <Input
                    type="number"
                    placeholder="100"
                    value={whatPercent.y}
                    onChange={(e) => setWhatPercent({ ...whatPercent, y: e.target.value })}
                    className="w-32"
                    data-testid="input-what-percent-y"
                  />
                </div>
                <Button onClick={calculateWhatPercent} data-testid="button-calculate-what-percent">=</Button>
                <div className="space-y-2">
                  <Label>Result</Label>
                  <div className="flex items-center gap-1">
                    <Input
                      type="text"
                      value={whatPercent.result}
                      readOnly
                      className="w-24 font-bold"
                      data-testid="input-what-percent-result"
                    />
                    <span>%</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="percent-change">
          <Card className="p-6">
            <div className="space-y-4">
              <p className="text-lg font-medium">Percentage Change (Increase/Decrease)</p>
              <div className="flex flex-wrap items-end gap-2">
                <div className="space-y-2">
                  <Label>From</Label>
                  <Input
                    type="number"
                    placeholder="50"
                    value={percentChange.from}
                    onChange={(e) => setPercentChange({ ...percentChange, from: e.target.value })}
                    className="w-32"
                    data-testid="input-percent-change-from"
                  />
                </div>
                <span className="pb-2 text-lg">to</span>
                <div className="space-y-2">
                  <Label>To</Label>
                  <Input
                    type="number"
                    placeholder="75"
                    value={percentChange.to}
                    onChange={(e) => setPercentChange({ ...percentChange, to: e.target.value })}
                    className="w-32"
                    data-testid="input-percent-change-to"
                  />
                </div>
                <Button onClick={calculatePercentChange} data-testid="button-calculate-percent-change">=</Button>
                <div className="space-y-2">
                  <Label>Change</Label>
                  <div className="flex items-center gap-1">
                    <Input
                      type="text"
                      value={percentChange.result}
                      readOnly
                      className={`w-24 font-bold ${parseFloat(percentChange.result) >= 0 ? "text-green-600" : "text-red-600"}`}
                      data-testid="input-percent-change-result"
                    />
                    <span>%</span>
                  </div>
                </div>
              </div>
              {percentChange.result && (
                <p className="text-sm text-muted-foreground">
                  {parseFloat(percentChange.result) >= 0 ? "Increase" : "Decrease"} of {Math.abs(parseFloat(percentChange.result))}%
                </p>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="reverse">
          <Card className="p-6">
            <div className="space-y-4">
              <p className="text-lg font-medium">Find Original (Before X% was added)</p>
              <div className="flex flex-wrap items-end gap-2">
                <div className="space-y-2">
                  <Label>Final Value</Label>
                  <Input
                    type="number"
                    placeholder="110"
                    value={reversePercent.final}
                    onChange={(e) => setReversePercent({ ...reversePercent, final: e.target.value })}
                    className="w-32"
                    data-testid="input-reverse-final"
                  />
                </div>
                <span className="pb-2 text-lg">after</span>
                <div className="space-y-2">
                  <Label>Percent Added</Label>
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      placeholder="10"
                      value={reversePercent.percent}
                      onChange={(e) => setReversePercent({ ...reversePercent, percent: e.target.value })}
                      className="w-20"
                      data-testid="input-reverse-percent"
                    />
                    <span>%</span>
                  </div>
                </div>
                <Button onClick={calculateReversePercent} data-testid="button-calculate-reverse">=</Button>
                <div className="space-y-2">
                  <Label>Original</Label>
                  <Input
                    type="text"
                    value={reversePercent.result}
                    readOnly
                    className="w-32 font-bold"
                    data-testid="input-reverse-result"
                  />
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="p-4">
        <h3 className="font-medium mb-2">Quick Reference</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="p-2 bg-muted rounded">
            <p className="font-medium">10% of 100</p>
            <p className="text-muted-foreground">= 10</p>
          </div>
          <div className="p-2 bg-muted rounded">
            <p className="font-medium">25% of 200</p>
            <p className="text-muted-foreground">= 50</p>
          </div>
          <div className="p-2 bg-muted rounded">
            <p className="font-medium">15% tip on $50</p>
            <p className="text-muted-foreground">= $7.50</p>
          </div>
          <div className="p-2 bg-muted rounded">
            <p className="font-medium">20% off $80</p>
            <p className="text-muted-foreground">= $64</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
