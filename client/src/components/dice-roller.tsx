import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dices, History } from "lucide-react";

type DiceType = 4 | 6 | 8 | 10 | 12 | 20;

interface RollResult {
  diceType: DiceType;
  count: number;
  results: number[];
  total: number;
  timestamp: Date;
}

export function DiceRoller() {
  const [diceType, setDiceType] = useState<DiceType>(6);
  const [diceCount, setDiceCount] = useState(1);
  const [results, setResults] = useState<number[]>([]);
  const [isRolling, setIsRolling] = useState(false);
  const [history, setHistory] = useState<RollResult[]>([]);

  const rollDice = () => {
    setIsRolling(true);
    setResults([]);

    let rollCount = 0;
    const interval = setInterval(() => {
      const tempResults = Array.from({ length: diceCount }, () => Math.floor(Math.random() * diceType) + 1);
      setResults(tempResults);
      rollCount++;
      if (rollCount >= 10) {
        clearInterval(interval);
        const finalResults = Array.from({ length: diceCount }, () => Math.floor(Math.random() * diceType) + 1);
        setResults(finalResults);
        setHistory([
          {
            diceType,
            count: diceCount,
            results: finalResults,
            total: finalResults.reduce((a, b) => a + b, 0),
            timestamp: new Date(),
          },
          ...history.slice(0, 9),
        ]);
        setIsRolling(false);
      }
    }, 100);
  };

  const total = results.reduce((a, b) => a + b, 0);

  const getDiceFace = (value: number, type: DiceType) => {
    if (type === 6 && value >= 1 && value <= 6) {
      const dots: Record<number, string> = {
        1: "flex items-center justify-center",
        2: "flex justify-between items-center px-2",
        3: "flex justify-between items-center px-2",
        4: "grid grid-cols-2 gap-1 p-2",
        5: "grid grid-cols-2 gap-1 p-2",
        6: "grid grid-cols-2 gap-1 p-1",
      };
      return (
        <div className={`w-full h-full ${dots[value]}`}>
          {value === 1 && <div className="w-3 h-3 bg-foreground rounded-full" />}
          {value === 2 && (
            <>
              <div className="w-2 h-2 bg-foreground rounded-full" />
              <div className="w-2 h-2 bg-foreground rounded-full" />
            </>
          )}
          {value === 3 && (
            <>
              <div className="w-2 h-2 bg-foreground rounded-full" />
              <div className="w-2 h-2 bg-foreground rounded-full" />
              <div className="w-2 h-2 bg-foreground rounded-full" />
            </>
          )}
          {value >= 4 && Array.from({ length: value }).map((_, i) => (
            <div key={i} className="w-2 h-2 bg-foreground rounded-full" />
          ))}
        </div>
      );
    }
    return <span className="text-2xl font-bold">{value}</span>;
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Dice Type</Label>
              <div className="flex flex-wrap gap-2">
                {([4, 6, 8, 10, 12, 20] as DiceType[]).map((type) => (
                  <Button
                    key={type}
                    variant={diceType === type ? "default" : "outline"}
                    onClick={() => setDiceType(type)}
                    data-testid={`button-d${type}`}
                  >
                    D{type}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Number of Dice</Label>
              <Select value={String(diceCount)} onValueChange={(v) => setDiceCount(Number(v))}>
                <SelectTrigger data-testid="select-dice-count">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <SelectItem key={n} value={String(n)}>{n} {n === 1 ? "die" : "dice"}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button size="lg" onClick={rollDice} disabled={isRolling} className="w-full" data-testid="button-roll">
              <Dices className={`h-5 w-5 mr-2 ${isRolling ? "animate-bounce" : ""}`} />
              {isRolling ? "Rolling..." : `Roll ${diceCount}D${diceType}`}
            </Button>
            {history.length > 0 && (
              <div className="space-y-2">
                <Label className="flex items-center gap-1"><History className="h-4 w-4" /> History</Label>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {history.map((roll, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm p-2 bg-muted rounded" data-testid={`history-${i}`}>
                      <Badge variant="secondary">{roll.count}D{roll.diceType}</Badge>
                      <span className="text-muted-foreground">[{roll.results.join(", ")}]</span>
                      <span className="font-semibold ml-auto">= {roll.total}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-col items-center justify-center">
            {results.length > 0 ? (
              <div className="space-y-4">
                <div className="flex flex-wrap justify-center gap-3">
                  {results.map((value, i) => (
                    <div
                      key={i}
                      className={`w-16 h-16 bg-card border-2 rounded-lg flex items-center justify-center shadow-lg ${isRolling ? "animate-bounce" : ""}`}
                      style={{ animationDelay: `${i * 50}ms` }}
                      data-testid={`dice-result-${i}`}
                    >
                      {getDiceFace(value, diceType)}
                    </div>
                  ))}
                </div>
                {diceCount > 1 && (
                  <div className="text-center">
                    <p className="text-muted-foreground">Total</p>
                    <p className="text-4xl font-bold" data-testid="text-total">{total}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                <Dices className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Click Roll to start</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
