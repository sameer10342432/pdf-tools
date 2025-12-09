import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function MortgageCalculator() {
  const [homePrice, setHomePrice] = useState("300000");
  const [downPayment, setDownPayment] = useState("60000");
  const [downPaymentPercent, setDownPaymentPercent] = useState("20");
  const [interestRate, setInterestRate] = useState("6.5");
  const [loanTerm, setLoanTerm] = useState("30");
  const [propertyTax, setPropertyTax] = useState("3600");
  const [homeInsurance, setHomeInsurance] = useState("1200");
  const [pmi, setPmi] = useState("0");

  const handleDownPaymentChange = (value: string) => {
    setDownPayment(value);
    const price = parseFloat(homePrice) || 0;
    const dp = parseFloat(value) || 0;
    if (price > 0) {
      setDownPaymentPercent(((dp / price) * 100).toFixed(1));
    }
  };

  const handleDownPaymentPercentChange = (value: string) => {
    setDownPaymentPercent(value);
    const price = parseFloat(homePrice) || 0;
    const percent = parseFloat(value) || 0;
    setDownPayment(((price * percent) / 100).toFixed(0));
  };

  const calculations = useMemo(() => {
    const price = parseFloat(homePrice) || 0;
    const dp = parseFloat(downPayment) || 0;
    const rate = (parseFloat(interestRate) || 0) / 100;
    const years = parseInt(loanTerm) || 30;
    const annualTax = parseFloat(propertyTax) || 0;
    const annualInsurance = parseFloat(homeInsurance) || 0;
    
    const principal = price - dp;
    const months = years * 12;
    const monthlyRate = rate / 12;

    let monthlyPrincipalInterest: number;
    if (monthlyRate === 0) {
      monthlyPrincipalInterest = principal / months;
    } else {
      monthlyPrincipalInterest = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    }

    const monthlyTax = annualTax / 12;
    const monthlyInsurance = annualInsurance / 12;
    
    const dpPercent = (dp / price) * 100;
    const monthlyPmi = dpPercent < 20 ? (principal * 0.005) / 12 : 0;

    const totalMonthly = monthlyPrincipalInterest + monthlyTax + monthlyInsurance + monthlyPmi;
    const totalPayments = monthlyPrincipalInterest * months;
    const totalInterest = totalPayments - principal;

    return {
      principal: Math.round(principal),
      monthlyPrincipalInterest: Math.round(monthlyPrincipalInterest * 100) / 100,
      monthlyTax: Math.round(monthlyTax * 100) / 100,
      monthlyInsurance: Math.round(monthlyInsurance * 100) / 100,
      monthlyPmi: Math.round(monthlyPmi * 100) / 100,
      totalMonthly: Math.round(totalMonthly * 100) / 100,
      totalPayments: Math.round(totalPayments),
      totalInterest: Math.round(totalInterest),
      dpPercent: Math.round(dpPercent * 10) / 10,
    };
  }, [homePrice, downPayment, interestRate, loanTerm, propertyTax, homeInsurance]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatCurrencyDecimal = (value: number) => {
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
            <Label htmlFor="home-price">Home Price ($)</Label>
            <Input
              id="home-price"
              type="number"
              value={homePrice}
              onChange={(e) => setHomePrice(e.target.value)}
              data-testid="input-home-price"
            />
          </div>
          <div className="space-y-2">
            <Label>Down Payment</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={downPayment}
                onChange={(e) => handleDownPaymentChange(e.target.value)}
                placeholder="$"
                className="flex-1"
                data-testid="input-down-payment"
              />
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  value={downPaymentPercent}
                  onChange={(e) => handleDownPaymentPercentChange(e.target.value)}
                  className="w-20"
                  data-testid="input-down-payment-percent"
                />
                <span className="text-muted-foreground">%</span>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="interest-rate">Interest Rate (%)</Label>
            <Input
              id="interest-rate"
              type="number"
              step="0.125"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              data-testid="input-interest-rate"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="loan-term">Loan Term</Label>
            <Select value={loanTerm} onValueChange={setLoanTerm}>
              <SelectTrigger data-testid="select-loan-term">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 Years</SelectItem>
                <SelectItem value="20">20 Years</SelectItem>
                <SelectItem value="30">30 Years</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="property-tax">Annual Property Tax ($)</Label>
            <Input
              id="property-tax"
              type="number"
              value={propertyTax}
              onChange={(e) => setPropertyTax(e.target.value)}
              data-testid="input-property-tax"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="home-insurance">Annual Home Insurance ($)</Label>
            <Input
              id="home-insurance"
              type="number"
              value={homeInsurance}
              onChange={(e) => setHomeInsurance(e.target.value)}
              data-testid="input-home-insurance"
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="text-center mb-6">
          <p className="text-sm text-muted-foreground mb-2">Monthly Payment (PITI)</p>
          <p className="text-5xl font-bold text-primary" data-testid="text-monthly-payment">
            {formatCurrencyDecimal(calculations.totalMonthly)}
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-muted rounded">
            <span>Principal & Interest</span>
            <span className="font-medium" data-testid="text-pi">{formatCurrencyDecimal(calculations.monthlyPrincipalInterest)}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-muted rounded">
            <span>Property Tax</span>
            <span className="font-medium" data-testid="text-tax">{formatCurrencyDecimal(calculations.monthlyTax)}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-muted rounded">
            <span>Home Insurance</span>
            <span className="font-medium" data-testid="text-insurance">{formatCurrencyDecimal(calculations.monthlyInsurance)}</span>
          </div>
          {calculations.monthlyPmi > 0 && (
            <div className="flex justify-between items-center p-3 bg-yellow-100 dark:bg-yellow-950/30 rounded">
              <span>PMI (Private Mortgage Insurance)</span>
              <span className="font-medium" data-testid="text-pmi">{formatCurrencyDecimal(calculations.monthlyPmi)}</span>
            </div>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <p className="text-sm text-muted-foreground mb-1">Loan Amount</p>
          <p className="text-xl font-bold" data-testid="text-loan-amount">
            {formatCurrency(calculations.principal)}
          </p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-sm text-muted-foreground mb-1">Total Interest</p>
          <p className="text-xl font-bold text-red-500" data-testid="text-total-interest">
            {formatCurrency(calculations.totalInterest)}
          </p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-sm text-muted-foreground mb-1">Total of Payments</p>
          <p className="text-xl font-bold" data-testid="text-total-payments">
            {formatCurrency(calculations.totalPayments)}
          </p>
        </Card>
      </div>

      {calculations.dpPercent < 20 && (
        <Card className="p-4 bg-yellow-50 dark:bg-yellow-950/30">
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            Your down payment is {calculations.dpPercent}%, which is below 20%. This typically requires Private Mortgage Insurance (PMI) which has been included in your monthly payment estimate. PMI can usually be removed once you have 20% equity in your home.
          </p>
        </Card>
      )}
    </div>
  );
}
