import { useState, useCallback, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AmortizationRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export function LoanCalculator() {
  const [loanAmount, setLoanAmount] = useState("10000");
  const [interestRate, setInterestRate] = useState("5");
  const [loanTerm, setLoanTerm] = useState("12");
  const [extraPayment, setExtraPayment] = useState("0");

  const calculations = useMemo(() => {
    const principal = parseFloat(loanAmount) || 0;
    const annualRate = parseFloat(interestRate) / 100 || 0;
    const months = parseInt(loanTerm) || 0;
    const extra = parseFloat(extraPayment) || 0;

    if (principal <= 0 || months <= 0) {
      return null;
    }

    const monthlyRate = annualRate / 12;
    
    let monthlyPayment: number;
    if (monthlyRate === 0) {
      monthlyPayment = principal / months;
    } else {
      monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    }

    const schedule: AmortizationRow[] = [];
    let balance = principal;
    let totalInterest = 0;
    let actualMonths = 0;

    for (let month = 1; month <= months && balance > 0; month++) {
      const interestPayment = balance * monthlyRate;
      let principalPayment = monthlyPayment - interestPayment + extra;
      
      if (principalPayment > balance) {
        principalPayment = balance;
      }

      balance -= principalPayment;
      totalInterest += interestPayment;
      actualMonths = month;

      schedule.push({
        month,
        payment: Math.round((principalPayment + interestPayment) * 100) / 100,
        principal: Math.round(principalPayment * 100) / 100,
        interest: Math.round(interestPayment * 100) / 100,
        balance: Math.max(0, Math.round(balance * 100) / 100),
      });

      if (balance <= 0) break;
    }

    return {
      monthlyPayment: Math.round(monthlyPayment * 100) / 100,
      totalPayment: Math.round((monthlyPayment * actualMonths + extra * actualMonths) * 100) / 100,
      totalInterest: Math.round(totalInterest * 100) / 100,
      schedule,
      actualMonths,
      interestSaved: extra > 0 ? Math.round((monthlyPayment * months - (monthlyPayment * actualMonths + extra * actualMonths)) * 100) / 100 : 0,
    };
  }, [loanAmount, interestRate, loanTerm, extraPayment]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="loan-amount">Loan Amount ($)</Label>
            <Input
              id="loan-amount"
              type="number"
              value={loanAmount}
              onChange={(e) => setLoanAmount(e.target.value)}
              placeholder="10000"
              data-testid="input-loan-amount"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="interest-rate">Annual Interest Rate (%)</Label>
            <Input
              id="interest-rate"
              type="number"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              placeholder="5"
              data-testid="input-interest-rate"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="loan-term">Loan Term (months)</Label>
            <Input
              id="loan-term"
              type="number"
              value={loanTerm}
              onChange={(e) => setLoanTerm(e.target.value)}
              placeholder="12"
              data-testid="input-loan-term"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="extra-payment">Extra Monthly Payment ($)</Label>
            <Input
              id="extra-payment"
              type="number"
              value={extraPayment}
              onChange={(e) => setExtraPayment(e.target.value)}
              placeholder="0"
              data-testid="input-extra-payment"
            />
          </div>
        </div>
      </Card>

      {calculations && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 text-center">
              <p className="text-sm text-muted-foreground mb-1">Monthly Payment</p>
              <p className="text-2xl font-bold text-primary" data-testid="text-monthly-payment">
                {formatCurrency(calculations.monthlyPayment)}
              </p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-sm text-muted-foreground mb-1">Total Payment</p>
              <p className="text-2xl font-bold" data-testid="text-total-payment">
                {formatCurrency(calculations.totalPayment)}
              </p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-sm text-muted-foreground mb-1">Total Interest</p>
              <p className="text-2xl font-bold text-red-500" data-testid="text-total-interest">
                {formatCurrency(calculations.totalInterest)}
              </p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-sm text-muted-foreground mb-1">Payoff Time</p>
              <p className="text-2xl font-bold" data-testid="text-payoff-time">
                {calculations.actualMonths} mo
              </p>
            </Card>
          </div>

          {calculations.interestSaved > 0 && (
            <Card className="p-4 bg-green-50 dark:bg-green-950/30">
              <p className="text-center text-green-600 dark:text-green-400">
                With extra payments, you save <strong>{formatCurrency(calculations.interestSaved)}</strong> and pay off{" "}
                <strong>{parseInt(loanTerm) - calculations.actualMonths} months</strong> earlier!
              </p>
            </Card>
          )}

          <Card className="p-4">
            <h3 className="font-medium mb-4">Amortization Schedule</h3>
            <ScrollArea className="h-72">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-background">
                  <tr className="border-b">
                    <th className="text-left py-2 px-2">Month</th>
                    <th className="text-right py-2 px-2">Payment</th>
                    <th className="text-right py-2 px-2">Principal</th>
                    <th className="text-right py-2 px-2">Interest</th>
                    <th className="text-right py-2 px-2">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {calculations.schedule.map((row) => (
                    <tr key={row.month} className="border-b" data-testid={`row-month-${row.month}`}>
                      <td className="py-2 px-2">{row.month}</td>
                      <td className="text-right py-2 px-2">{formatCurrency(row.payment)}</td>
                      <td className="text-right py-2 px-2 text-green-600">{formatCurrency(row.principal)}</td>
                      <td className="text-right py-2 px-2 text-red-500">{formatCurrency(row.interest)}</td>
                      <td className="text-right py-2 px-2">{formatCurrency(row.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
          </Card>
        </>
      )}
    </div>
  );
}
