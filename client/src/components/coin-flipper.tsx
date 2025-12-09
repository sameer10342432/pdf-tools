import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { History, RefreshCw } from "lucide-react";

type CoinResult = "heads" | "tails";

interface FlipResult {
  result: CoinResult;
  timestamp: Date;
}

export function CoinFlipper() {
  const [result, setResult] = useState<CoinResult | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [history, setHistory] = useState<FlipResult[]>([]);
  const [flipCount, setFlipCount] = useState(1);
  const [multiResults, setMultiResults] = useState<CoinResult[]>([]);

  const flipCoin = () => {
    setIsFlipping(true);
    setResult(null);
    setMultiResults([]);

    let flipAnimation = 0;
    const interval = setInterval(() => {
      setResult(Math.random() > 0.5 ? "heads" : "tails");
      flipAnimation++;
      if (flipAnimation >= 15) {
        clearInterval(interval);
        const finalResults: CoinResult[] = [];
        for (let i = 0; i < flipCount; i++) {
          finalResults.push(Math.random() > 0.5 ? "heads" : "tails");
        }
        if (flipCount === 1) {
          setResult(finalResults[0]);
          setHistory([{ result: finalResults[0], timestamp: new Date() }, ...history.slice(0, 19)]);
        } else {
          setMultiResults(finalResults);
          finalResults.forEach((r) => {
            setHistory((prev) => [{ result: r, timestamp: new Date() }, ...prev.slice(0, 19)]);
          });
        }
        setIsFlipping(false);
      }
    }, 100);
  };

  const headsCount = history.filter((h) => h.result === "heads").length;
  const tailsCount = history.filter((h) => h.result === "tails").length;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Number of Coins</Label>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 5, 10].map((n) => (
                  <Button
                    key={n}
                    variant={flipCount === n ? "default" : "outline"}
                    onClick={() => setFlipCount(n)}
                    data-testid={`button-count-${n}`}
                  >
                    {n}
                  </Button>
                ))}
              </div>
            </div>
            <Button size="lg" onClick={flipCoin} disabled={isFlipping} className="w-full" data-testid="button-flip">
              <RefreshCw className={`h-5 w-5 mr-2 ${isFlipping ? "animate-spin" : ""}`} />
              {isFlipping ? "Flipping..." : `Flip ${flipCount === 1 ? "Coin" : `${flipCount} Coins`}`}
            </Button>
            {history.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-1"><History className="h-4 w-4" /> Statistics</Label>
                  <Button size="sm" variant="ghost" onClick={() => setHistory([])} data-testid="button-clear-history">Clear</Button>
                </div>
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-amber-500" data-testid="text-heads-count">{headsCount}</p>
                    <p className="text-sm text-muted-foreground">Heads ({history.length > 0 ? ((headsCount / history.length) * 100).toFixed(1) : 0}%)</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-slate-500" data-testid="text-tails-count">{tailsCount}</p>
                    <p className="text-sm text-muted-foreground">Tails ({history.length > 0 ? ((tailsCount / history.length) * 100).toFixed(1) : 0}%)</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                  {history.slice(0, 20).map((h, i) => (
                    <Badge key={i} variant={h.result === "heads" ? "default" : "secondary"} className="text-xs" data-testid={`badge-history-${i}`}>
                      {h.result === "heads" ? "H" : "T"}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-col items-center justify-center">
            {multiResults.length > 0 ? (
              <div className="space-y-4">
                <div className="flex flex-wrap justify-center gap-3">
                  {multiResults.map((r, i) => (
                    <div
                      key={i}
                      className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold shadow-lg ${r === "heads" ? "bg-amber-500" : "bg-slate-500"}`}
                      data-testid={`coin-result-${i}`}
                    >
                      {r === "heads" ? "H" : "T"}
                    </div>
                  ))}
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground">
                    Heads: {multiResults.filter((r) => r === "heads").length} | Tails: {multiResults.filter((r) => r === "tails").length}
                  </p>
                </div>
              </div>
            ) : result ? (
              <div className="text-center space-y-4">
                <div
                  className={`w-32 h-32 rounded-full flex items-center justify-center shadow-lg text-white text-3xl font-bold transition-all duration-300 ${
                    isFlipping ? "animate-spin" : ""
                  } ${result === "heads" ? "bg-amber-500" : "bg-slate-500"}`}
                  data-testid="coin-display"
                >
                  {result === "heads" ? "H" : "T"}
                </div>
                <p className="text-2xl font-bold capitalize" data-testid="text-result">{result}</p>
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">?</span>
                </div>
                <p>Click Flip to start</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
