import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Check, X, RefreshCw } from "lucide-react";
import { SiVisa, SiMastercard, SiAmericanexpress, SiDiscover } from "react-icons/si";

interface ValidationResult {
  isValid: boolean;
  cardType: string | null;
  formatted: string;
}

const cardPatterns = [
  { type: "Visa", pattern: /^4/, lengths: [13, 16, 19] },
  { type: "Mastercard", pattern: /^(5[1-5]|2[2-7])/, lengths: [16] },
  { type: "American Express", pattern: /^3[47]/, lengths: [15] },
  { type: "Discover", pattern: /^(6011|65|64[4-9])/, lengths: [16, 19] },
  { type: "Diners Club", pattern: /^(36|38|30[0-5])/, lengths: [14] },
  { type: "JCB", pattern: /^35/, lengths: [16] },
  { type: "UnionPay", pattern: /^62/, lengths: [16, 17, 18, 19] },
];

export function CreditCardValidator() {
  const [cardNumber, setCardNumber] = useState("");
  const [result, setResult] = useState<ValidationResult | null>(null);

  const luhnCheck = (num: string): boolean => {
    const digits = num.replace(/\D/g, "").split("").map(Number);
    let sum = 0;
    let isEven = false;

    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = digits[i];
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  };

  const detectCardType = (num: string): string | null => {
    const cleanNum = num.replace(/\D/g, "");
    for (const card of cardPatterns) {
      if (card.pattern.test(cleanNum)) {
        return card.type;
      }
    }
    return null;
  };

  const formatCardNumber = (num: string): string => {
    const cleanNum = num.replace(/\D/g, "");
    const cardType = detectCardType(cleanNum);

    if (cardType === "American Express") {
      return cleanNum.replace(/(\d{4})(\d{6})(\d{5})/, "$1 $2 $3").trim();
    }
    return cleanNum.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
  };

  const validate = () => {
    const cleanNum = cardNumber.replace(/\D/g, "");
    
    if (!cleanNum) {
      setResult(null);
      return;
    }

    const cardType = detectCardType(cleanNum);
    const isValidLength = cardPatterns.some(
      (card) => card.type === cardType && card.lengths.includes(cleanNum.length)
    );
    const passesLuhn = luhnCheck(cleanNum);

    setResult({
      isValid: passesLuhn && (isValidLength || cleanNum.length >= 13),
      cardType,
      formatted: formatCardNumber(cleanNum),
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 19);
    setCardNumber(formatCardNumber(value));
    setResult(null);
  };

  const reset = () => {
    setCardNumber("");
    setResult(null);
  };

  const getCardIcon = (cardType: string | null) => {
    switch (cardType) {
      case "Visa":
        return <SiVisa className="h-8 w-8 text-blue-600" />;
      case "Mastercard":
        return <SiMastercard className="h-8 w-8 text-orange-500" />;
      case "American Express":
        return <SiAmericanexpress className="h-8 w-8 text-blue-500" />;
      case "Discover":
        return <SiDiscover className="h-8 w-8 text-orange-400" />;
      default:
        return <CreditCard className="h-8 w-8 text-muted-foreground" />;
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="max-w-md mx-auto space-y-6">
          <div className="space-y-2">
            <Label>Credit Card Number</Label>
            <div className="flex gap-2">
              <Input
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={handleInputChange}
                className="font-mono text-lg"
                data-testid="input-card-number"
              />
              {cardNumber && (
                <Button variant="outline" onClick={reset} data-testid="button-clear">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <Button onClick={validate} disabled={!cardNumber} className="w-full" data-testid="button-validate">
            <CreditCard className="h-4 w-4 mr-2" />
            Validate Card Number
          </Button>

          {result && (
            <div className={`p-6 border rounded-lg ${result.isValid ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900" : "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900"}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getCardIcon(result.cardType)}
                  <div>
                    <p className="font-semibold" data-testid="text-card-type">
                      {result.cardType || "Unknown Card Type"}
                    </p>
                    <p className="font-mono text-sm text-muted-foreground">{result.formatted}</p>
                  </div>
                </div>
                <div className={`rounded-full p-2 ${result.isValid ? "bg-green-500" : "bg-red-500"}`}>
                  {result.isValid ? (
                    <Check className="h-5 w-5 text-white" />
                  ) : (
                    <X className="h-5 w-5 text-white" />
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={result.isValid ? "default" : "destructive"} data-testid="badge-result">
                  {result.isValid ? "Valid Card Number" : "Invalid Card Number"}
                </Badge>
                <Badge variant="outline">Luhn Algorithm</Badge>
              </div>
              {!result.isValid && (
                <p className="text-sm text-muted-foreground mt-3">
                  This card number does not pass the Luhn algorithm check. Please verify the number is correct.
                </p>
              )}
            </div>
          )}

          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium mb-2">How it works</p>
            <p className="text-sm text-muted-foreground">
              This tool uses the Luhn algorithm (also known as the "modulus 10" algorithm) to validate credit card numbers. 
              It checks the mathematical validity of the number format, but does not verify if the card is active or has funds.
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 pt-4 border-t">
            <SiVisa className="h-8 w-8 text-blue-600" />
            <SiMastercard className="h-8 w-8 text-orange-500" />
            <SiAmericanexpress className="h-8 w-8 text-blue-500" />
            <SiDiscover className="h-8 w-8 text-orange-400" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
