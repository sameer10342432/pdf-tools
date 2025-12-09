import { useState, useCallback, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function ScientificCalculator() {
  const [display, setDisplay] = useState("0");
  const [expression, setExpression] = useState("");
  const [memory, setMemory] = useState<number>(0);
  const [isDegrees, setIsDegrees] = useState(true);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [isInverse, setIsInverse] = useState(false);

  const clearAll = useCallback(() => {
    setDisplay("0");
    setExpression("");
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

  const toRadians = (deg: number) => deg * (Math.PI / 180);
  const toDegrees = (rad: number) => rad * (180 / Math.PI);

  const performUnaryOperation = useCallback((operation: string) => {
    const value = parseFloat(display);
    let result: number;

    switch (operation) {
      case "sin":
        result = isDegrees ? Math.sin(toRadians(value)) : Math.sin(value);
        break;
      case "cos":
        result = isDegrees ? Math.cos(toRadians(value)) : Math.cos(value);
        break;
      case "tan":
        result = isDegrees ? Math.tan(toRadians(value)) : Math.tan(value);
        break;
      case "asin":
        result = isDegrees ? toDegrees(Math.asin(value)) : Math.asin(value);
        break;
      case "acos":
        result = isDegrees ? toDegrees(Math.acos(value)) : Math.acos(value);
        break;
      case "atan":
        result = isDegrees ? toDegrees(Math.atan(value)) : Math.atan(value);
        break;
      case "ln":
        result = Math.log(value);
        break;
      case "log":
        result = Math.log10(value);
        break;
      case "sqrt":
        result = Math.sqrt(value);
        break;
      case "cbrt":
        result = Math.cbrt(value);
        break;
      case "square":
        result = value * value;
        break;
      case "cube":
        result = value * value * value;
        break;
      case "exp":
        result = Math.exp(value);
        break;
      case "10^x":
        result = Math.pow(10, value);
        break;
      case "1/x":
        result = 1 / value;
        break;
      case "factorial":
        result = factorial(value);
        break;
      case "abs":
        result = Math.abs(value);
        break;
      default:
        result = value;
    }

    setDisplay(String(Math.round(result * 1000000000000) / 1000000000000));
    setWaitingForOperand(true);
  }, [display, isDegrees]);

  const factorial = (n: number): number => {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    if (n > 170) return Infinity;
    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    return result;
  };

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
      const sanitized = expr.replace(/×/g, "*").replace(/÷/g, "/").replace(/\^/g, "**");
      const result = Function('"use strict"; return (' + sanitized + ')')();
      return Math.round(result * 1000000000000) / 1000000000000;
    } catch {
      return 0;
    }
  };

  const calculate = useCallback(() => {
    if (!expression) return;
    
    const fullExpression = expression + display;
    const result = evaluateExpression(fullExpression);
    setDisplay(String(result));
    setExpression("");
    setWaitingForOperand(true);
  }, [display, expression]);

  const insertConstant = useCallback((constant: string) => {
    let value: string;
    switch (constant) {
      case "pi":
        value = String(Math.PI);
        break;
      case "e":
        value = String(Math.E);
        break;
      default:
        value = "0";
    }
    setDisplay(value);
    setWaitingForOperand(true);
  }, []);

  const buttonClass = "text-sm font-medium";
  const operatorClass = "bg-primary text-primary-foreground";
  const functionClass = "bg-secondary";

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="angle-mode">RAD</Label>
            <Switch
              id="angle-mode"
              checked={isDegrees}
              onCheckedChange={setIsDegrees}
              data-testid="switch-angle-mode"
            />
            <Label htmlFor="angle-mode">DEG</Label>
          </div>
          <Button
            variant={isInverse ? "default" : "outline"}
            size="sm"
            onClick={() => setIsInverse(!isInverse)}
            data-testid="button-inverse"
          >
            INV
          </Button>
        </div>
        
        <div className="text-right mb-2 text-sm text-muted-foreground h-6" data-testid="text-expression">
          {expression}
        </div>
        <div className="text-right text-3xl font-mono font-bold truncate" data-testid="text-display">
          {display}
        </div>
      </Card>

      <Card className="p-4">
        <div className="grid grid-cols-5 gap-2">
          <Button variant="outline" className={`${buttonClass} ${functionClass}`} onClick={() => performUnaryOperation(isInverse ? "asin" : "sin")} data-testid="button-sin">
            {isInverse ? "sin⁻¹" : "sin"}
          </Button>
          <Button variant="outline" className={`${buttonClass} ${functionClass}`} onClick={() => performUnaryOperation(isInverse ? "acos" : "cos")} data-testid="button-cos">
            {isInverse ? "cos⁻¹" : "cos"}
          </Button>
          <Button variant="outline" className={`${buttonClass} ${functionClass}`} onClick={() => performUnaryOperation(isInverse ? "atan" : "tan")} data-testid="button-tan">
            {isInverse ? "tan⁻¹" : "tan"}
          </Button>
          <Button variant="outline" className={`${buttonClass} ${functionClass}`} onClick={() => performUnaryOperation(isInverse ? "exp" : "ln")} data-testid="button-ln">
            {isInverse ? "eˣ" : "ln"}
          </Button>
          <Button variant="outline" className={`${buttonClass} ${functionClass}`} onClick={() => performUnaryOperation(isInverse ? "10^x" : "log")} data-testid="button-log">
            {isInverse ? "10ˣ" : "log"}
          </Button>

          <Button variant="outline" className={`${buttonClass} ${functionClass}`} onClick={() => performUnaryOperation("sqrt")} data-testid="button-sqrt">√</Button>
          <Button variant="outline" className={`${buttonClass} ${functionClass}`} onClick={() => performUnaryOperation("cbrt")} data-testid="button-cbrt">∛</Button>
          <Button variant="outline" className={`${buttonClass} ${functionClass}`} onClick={() => performUnaryOperation("square")} data-testid="button-square">x²</Button>
          <Button variant="outline" className={`${buttonClass} ${functionClass}`} onClick={() => performUnaryOperation("cube")} data-testid="button-cube">x³</Button>
          <Button variant="outline" className={`${buttonClass} ${functionClass}`} onClick={() => performOperation("^")} data-testid="button-power">xʸ</Button>

          <Button variant="outline" className={`${buttonClass} ${functionClass}`} onClick={() => insertConstant("pi")} data-testid="button-pi">π</Button>
          <Button variant="outline" className={`${buttonClass} ${functionClass}`} onClick={() => insertConstant("e")} data-testid="button-e">e</Button>
          <Button variant="outline" className={`${buttonClass} ${functionClass}`} onClick={() => performUnaryOperation("factorial")} data-testid="button-factorial">n!</Button>
          <Button variant="outline" className={`${buttonClass} ${functionClass}`} onClick={() => performUnaryOperation("1/x")} data-testid="button-reciprocal">1/x</Button>
          <Button variant="outline" className={`${buttonClass} ${functionClass}`} onClick={() => performUnaryOperation("abs")} data-testid="button-abs">|x|</Button>

          <Button variant="secondary" className={buttonClass} onClick={clearAll} data-testid="button-ac">AC</Button>
          <Button variant="secondary" className={buttonClass} onClick={() => setExpression(expression + "(")} data-testid="button-open-paren">(</Button>
          <Button variant="secondary" className={buttonClass} onClick={() => setExpression(expression + display + ")")} data-testid="button-close-paren">)</Button>
          <Button variant="secondary" className={buttonClass} onClick={() => { const v = parseFloat(display); setDisplay(String(v / 100)); }} data-testid="button-percent">%</Button>
          <Button className={`${buttonClass} ${operatorClass}`} onClick={() => performOperation("÷")} data-testid="button-divide">÷</Button>

          <Button variant="outline" className={buttonClass} onClick={() => inputDigit("7")} data-testid="button-7">7</Button>
          <Button variant="outline" className={buttonClass} onClick={() => inputDigit("8")} data-testid="button-8">8</Button>
          <Button variant="outline" className={buttonClass} onClick={() => inputDigit("9")} data-testid="button-9">9</Button>
          <Button variant="outline" className={buttonClass} onClick={() => { const v = parseFloat(display); setDisplay(String(-v)); }} data-testid="button-negate">±</Button>
          <Button className={`${buttonClass} ${operatorClass}`} onClick={() => performOperation("×")} data-testid="button-multiply">×</Button>

          <Button variant="outline" className={buttonClass} onClick={() => inputDigit("4")} data-testid="button-4">4</Button>
          <Button variant="outline" className={buttonClass} onClick={() => inputDigit("5")} data-testid="button-5">5</Button>
          <Button variant="outline" className={buttonClass} onClick={() => inputDigit("6")} data-testid="button-6">6</Button>
          <Button variant="outline" className={buttonClass} onClick={() => setMemory(memory + parseFloat(display))} data-testid="button-m-plus">M+</Button>
          <Button className={`${buttonClass} ${operatorClass}`} onClick={() => performOperation("-")} data-testid="button-subtract">-</Button>

          <Button variant="outline" className={buttonClass} onClick={() => inputDigit("1")} data-testid="button-1">1</Button>
          <Button variant="outline" className={buttonClass} onClick={() => inputDigit("2")} data-testid="button-2">2</Button>
          <Button variant="outline" className={buttonClass} onClick={() => inputDigit("3")} data-testid="button-3">3</Button>
          <Button variant="outline" className={buttonClass} onClick={() => { setDisplay(String(memory)); setWaitingForOperand(true); }} data-testid="button-mr">MR</Button>
          <Button className={`${buttonClass} ${operatorClass}`} onClick={() => performOperation("+")} data-testid="button-add">+</Button>

          <Button variant="outline" className={buttonClass} onClick={() => inputDigit("0")} data-testid="button-0">0</Button>
          <Button variant="outline" className={buttonClass} onClick={inputDecimal} data-testid="button-decimal">.</Button>
          <Button variant="outline" className={buttonClass} onClick={() => setMemory(0)} data-testid="button-mc">MC</Button>
          <Button className={`${buttonClass} ${operatorClass} col-span-2`} onClick={calculate} data-testid="button-equals">=</Button>
        </div>
      </Card>
    </div>
  );
}
