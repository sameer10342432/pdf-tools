import { useState, useCallback, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2 } from "lucide-react";

interface HistoryEntry {
  id: number;
  expression: string;
  result: string;
}

export function OnlineCalculator() {
  const [display, setDisplay] = useState("0");
  const [expression, setExpression] = useState("");
  const [memory, setMemory] = useState<number>(0);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const clearAll = useCallback(() => {
    setDisplay("0");
    setExpression("");
    setWaitingForOperand(false);
  }, []);

  const clearEntry = useCallback(() => {
    setDisplay("0");
    setWaitingForOperand(false);
  }, []);

  const inputDigit = useCallback((digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === "0" ? digit : display + digit);
    }
  }, [display, waitingForOperand]);

  const inputDecimal = useCallback(() => {
    if (waitingForOperand) {
      setDisplay("0.");
      setWaitingForOperand(false);
    } else if (!display.includes(".")) {
      setDisplay(display + ".");
    }
  }, [display, waitingForOperand]);

  const toggleSign = useCallback(() => {
    const value = parseFloat(display);
    setDisplay(String(-value));
  }, [display]);

  const inputPercent = useCallback(() => {
    const value = parseFloat(display);
    setDisplay(String(value / 100));
  }, [display]);

  const performOperation = useCallback((operator: string) => {
    const inputValue = parseFloat(display);
    
    if (expression && !waitingForOperand) {
      const result = evaluateExpression(expression + display);
      setDisplay(String(result));
      setExpression(String(result) + " " + operator + " ");
    } else {
      setExpression(display + " " + operator + " ");
    }
    setWaitingForOperand(true);
  }, [display, expression, waitingForOperand]);

  const evaluateExpression = (expr: string): number => {
    try {
      const sanitized = expr.replace(/×/g, "*").replace(/÷/g, "/");
      const result = Function('"use strict"; return (' + sanitized + ')')();
      return Math.round(result * 1000000000) / 1000000000;
    } catch {
      return 0;
    }
  };

  const calculate = useCallback(() => {
    if (!expression) return;
    
    const fullExpression = expression + display;
    const result = evaluateExpression(fullExpression);
    const resultStr = String(result);
    
    setHistory(prev => [{
      id: Date.now(),
      expression: fullExpression.replace(/\*/g, "×").replace(/\//g, "÷"),
      result: resultStr
    }, ...prev.slice(0, 19)]);
    
    setDisplay(resultStr);
    setExpression("");
    setWaitingForOperand(true);
  }, [display, expression]);

  const memoryAdd = useCallback(() => {
    setMemory(memory + parseFloat(display));
  }, [display, memory]);

  const memorySubtract = useCallback(() => {
    setMemory(memory - parseFloat(display));
  }, [display, memory]);

  const memoryRecall = useCallback(() => {
    setDisplay(String(memory));
    setWaitingForOperand(true);
  }, [memory]);

  const memoryClear = useCallback(() => {
    setMemory(0);
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") {
        inputDigit(e.key);
      } else if (e.key === ".") {
        inputDecimal();
      } else if (e.key === "+" || e.key === "-") {
        performOperation(e.key);
      } else if (e.key === "*") {
        performOperation("×");
      } else if (e.key === "/") {
        e.preventDefault();
        performOperation("÷");
      } else if (e.key === "Enter" || e.key === "=") {
        e.preventDefault();
        calculate();
      } else if (e.key === "Escape") {
        clearAll();
      } else if (e.key === "Backspace") {
        if (display.length > 1) {
          setDisplay(display.slice(0, -1));
        } else {
          setDisplay("0");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [inputDigit, inputDecimal, performOperation, calculate, clearAll, display]);

  const buttonClass = "text-lg font-medium";
  const operatorClass = "bg-primary text-primary-foreground";

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="text-right mb-2 text-sm text-muted-foreground h-6" data-testid="text-expression">
          {expression}
        </div>
        <div className="text-right text-4xl font-mono font-bold truncate" data-testid="text-display">
          {display}
        </div>
      </Card>

      <Card className="p-4">
        <div className="grid grid-cols-4 gap-2 mb-2">
          <Button variant="outline" size="sm" onClick={memoryClear} data-testid="button-mc">MC</Button>
          <Button variant="outline" size="sm" onClick={memoryRecall} data-testid="button-mr">MR</Button>
          <Button variant="outline" size="sm" onClick={memoryAdd} data-testid="button-m-plus">M+</Button>
          <Button variant="outline" size="sm" onClick={memorySubtract} data-testid="button-m-minus">M-</Button>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <Button variant="secondary" className={buttonClass} onClick={clearAll} data-testid="button-ac">AC</Button>
          <Button variant="secondary" className={buttonClass} onClick={clearEntry} data-testid="button-ce">CE</Button>
          <Button variant="secondary" className={buttonClass} onClick={inputPercent} data-testid="button-percent">%</Button>
          <Button className={`${buttonClass} ${operatorClass}`} onClick={() => performOperation("÷")} data-testid="button-divide">÷</Button>

          <Button variant="outline" className={buttonClass} onClick={() => inputDigit("7")} data-testid="button-7">7</Button>
          <Button variant="outline" className={buttonClass} onClick={() => inputDigit("8")} data-testid="button-8">8</Button>
          <Button variant="outline" className={buttonClass} onClick={() => inputDigit("9")} data-testid="button-9">9</Button>
          <Button className={`${buttonClass} ${operatorClass}`} onClick={() => performOperation("×")} data-testid="button-multiply">×</Button>

          <Button variant="outline" className={buttonClass} onClick={() => inputDigit("4")} data-testid="button-4">4</Button>
          <Button variant="outline" className={buttonClass} onClick={() => inputDigit("5")} data-testid="button-5">5</Button>
          <Button variant="outline" className={buttonClass} onClick={() => inputDigit("6")} data-testid="button-6">6</Button>
          <Button className={`${buttonClass} ${operatorClass}`} onClick={() => performOperation("-")} data-testid="button-subtract">-</Button>

          <Button variant="outline" className={buttonClass} onClick={() => inputDigit("1")} data-testid="button-1">1</Button>
          <Button variant="outline" className={buttonClass} onClick={() => inputDigit("2")} data-testid="button-2">2</Button>
          <Button variant="outline" className={buttonClass} onClick={() => inputDigit("3")} data-testid="button-3">3</Button>
          <Button className={`${buttonClass} ${operatorClass}`} onClick={() => performOperation("+")} data-testid="button-add">+</Button>

          <Button variant="outline" className={buttonClass} onClick={toggleSign} data-testid="button-plusminus">±</Button>
          <Button variant="outline" className={buttonClass} onClick={() => inputDigit("0")} data-testid="button-0">0</Button>
          <Button variant="outline" className={buttonClass} onClick={inputDecimal} data-testid="button-decimal">.</Button>
          <Button className={`${buttonClass} ${operatorClass}`} onClick={calculate} data-testid="button-equals">=</Button>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="font-medium">History</p>
          {history.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearHistory} data-testid="button-clear-history">
              <Trash2 className="w-4 h-4 mr-1" /> Clear
            </Button>
          )}
        </div>
        {history.length > 0 ? (
          <ScrollArea className="h-40">
            <div className="space-y-2">
              {history.map((entry) => (
                <div key={entry.id} className="p-2 bg-muted rounded text-sm" data-testid={`history-${entry.id}`}>
                  <div className="text-muted-foreground">{entry.expression}</div>
                  <div className="font-mono font-medium">= {entry.result}</div>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-4 text-muted-foreground text-sm">
            No calculations yet
          </div>
        )}
      </Card>
    </div>
  );
}
