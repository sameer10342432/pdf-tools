import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, RotateCw, History } from "lucide-react";

export function RandomNamePicker() {
  const [names, setNames] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [winner, setWinner] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [rotation, setRotation] = useState(0);
  const wheelRef = useRef<HTMLDivElement>(null);

  const addName = () => {
    if (inputValue.trim() && !names.includes(inputValue.trim())) {
      setNames([...names, inputValue.trim()]);
      setInputValue("");
    }
  };

  const removeName = (name: string) => {
    setNames(names.filter((n) => n !== name));
  };

  const clearAll = () => {
    setNames([]);
    setWinner(null);
    setHistory([]);
  };

  const spin = () => {
    if (names.length < 2 || isSpinning) return;
    setIsSpinning(true);
    setWinner(null);

    const randomIndex = Math.floor(Math.random() * names.length);
    const segmentAngle = 360 / names.length;
    const targetAngle = 360 - (randomIndex * segmentAngle + segmentAngle / 2);
    const spins = 5;
    const totalRotation = spins * 360 + targetAngle + rotation;

    setRotation(totalRotation);

    setTimeout(() => {
      setWinner(names[randomIndex]);
      setHistory([names[randomIndex], ...history.slice(0, 9)]);
      setIsSpinning(false);
    }, 4000);
  };

  const removeWinnerFromWheel = () => {
    if (winner) {
      setNames(names.filter((n) => n !== winner));
      setWinner(null);
    }
  };

  const colors = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40", "#E7E9ED", "#7C4DFF", "#00E676", "#FF5252"];

  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Add Names</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter a name"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addName()}
                  data-testid="input-name"
                />
                <Button onClick={addName} data-testid="button-add-name">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Names ({names.length})</Label>
                {names.length > 0 && (
                  <Button size="sm" variant="ghost" onClick={clearAll} data-testid="button-clear-all">
                    <Trash2 className="h-4 w-4 mr-1" /> Clear
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-2 min-h-[100px] p-3 border rounded-lg">
                {names.map((name, i) => (
                  <Badge key={i} variant="secondary" className="cursor-pointer" onClick={() => removeName(name)} data-testid={`badge-name-${i}`}>
                    {name} <Trash2 className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
                {names.length === 0 && <span className="text-muted-foreground text-sm">Add at least 2 names to spin</span>}
              </div>
            </div>
            {history.length > 0 && (
              <div className="space-y-2">
                <Label className="flex items-center gap-1"><History className="h-4 w-4" /> History</Label>
                <div className="flex flex-wrap gap-2">
                  {history.map((name, i) => (
                    <Badge key={i} variant="outline" data-testid={`badge-history-${i}`}>{name}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-64 h-64">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-0 h-0 border-l-[15px] border-r-[15px] border-t-[25px] border-l-transparent border-r-transparent border-t-foreground" />
              <div
                ref={wheelRef}
                className="w-full h-full rounded-full border-4 border-foreground overflow-hidden relative"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transition: isSpinning ? "transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)" : "none",
                }}
                data-testid="wheel"
              >
                {names.length > 0 ? (
                  names.map((name, i) => {
                    const angle = 360 / names.length;
                    const skew = 90 - angle;
                    return (
                      <div
                        key={i}
                        className="absolute w-1/2 h-1/2 origin-bottom-right overflow-hidden"
                        style={{
                          transform: `rotate(${i * angle}deg) skewY(-${skew}deg)`,
                          left: 0,
                          top: 0,
                        }}
                      >
                        <div
                          className="absolute w-full h-full flex items-center justify-center text-white text-xs font-bold"
                          style={{
                            backgroundColor: colors[i % colors.length],
                            transform: `skewY(${skew}deg) rotate(${angle / 2}deg)`,
                          }}
                        >
                          <span className="truncate max-w-[60px] transform -rotate-90">{name}</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground text-sm">Add names</div>
                )}
              </div>
            </div>
            <Button size="lg" onClick={spin} disabled={names.length < 2 || isSpinning} className="w-full max-w-[200px]" data-testid="button-spin">
              <RotateCw className={`h-5 w-5 mr-2 ${isSpinning ? "animate-spin" : ""}`} />
              {isSpinning ? "Spinning..." : "Spin!"}
            </Button>
            {winner && (
              <div className="text-center space-y-2">
                <p className="text-lg">Winner:</p>
                <p className="text-3xl font-bold text-primary" data-testid="text-winner">{winner}</p>
                <Button size="sm" variant="outline" onClick={removeWinnerFromWheel} data-testid="button-remove-winner">
                  Remove from wheel
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
