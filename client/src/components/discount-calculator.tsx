import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function DiscountCalculator() {
  const [originalPrice, setOriginalPrice] = useState("100");
  const [discountPercent, setDiscountPercent] = useState("20");
  const [fixedDiscount, setFixedDiscount] = useState("15");
  const [discount1, setDiscount1] = useState("20");
  const [discount2, setDiscount2] = useState("10");
  const [comparePrice1, setComparePrice1] = useState("100");
  const [compareDiscount1, setCompareDiscount1] = useState("25");
  const [comparePrice2, setComparePrice2] = useState("80");
  const [compareDiscount2, setCompareDiscount2] = useState("20");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const percentageCalc = useMemo(() => {
    const price = parseFloat(originalPrice) || 0;
    const discount = parseFloat(discountPercent) || 0;
    const savings = price * (discount / 100);
    const finalPrice = price - savings;
    return {
      savings: Math.round(savings * 100) / 100,
      finalPrice: Math.round(finalPrice * 100) / 100,
    };
  }, [originalPrice, discountPercent]);

  const fixedCalc = useMemo(() => {
    const price = parseFloat(originalPrice) || 0;
    const discount = parseFloat(fixedDiscount) || 0;
    const finalPrice = Math.max(0, price - discount);
    const percentSaved = price > 0 ? (discount / price) * 100 : 0;
    return {
      finalPrice: Math.round(finalPrice * 100) / 100,
      percentSaved: Math.round(percentSaved * 10) / 10,
    };
  }, [originalPrice, fixedDiscount]);

  const stackedCalc = useMemo(() => {
    const price = parseFloat(originalPrice) || 0;
    const d1 = parseFloat(discount1) || 0;
    const d2 = parseFloat(discount2) || 0;
    
    const afterFirst = price * (1 - d1 / 100);
    const finalPrice = afterFirst * (1 - d2 / 100);
    const totalSavings = price - finalPrice;
    const effectiveDiscount = price > 0 ? (totalSavings / price) * 100 : 0;

    return {
      afterFirst: Math.round(afterFirst * 100) / 100,
      finalPrice: Math.round(finalPrice * 100) / 100,
      totalSavings: Math.round(totalSavings * 100) / 100,
      effectiveDiscount: Math.round(effectiveDiscount * 10) / 10,
    };
  }, [originalPrice, discount1, discount2]);

  const compareCalc = useMemo(() => {
    const price1 = parseFloat(comparePrice1) || 0;
    const disc1 = parseFloat(compareDiscount1) || 0;
    const price2 = parseFloat(comparePrice2) || 0;
    const disc2 = parseFloat(compareDiscount2) || 0;

    const final1 = price1 * (1 - disc1 / 100);
    const final2 = price2 * (1 - disc2 / 100);
    const savings1 = price1 - final1;
    const savings2 = price2 - final2;

    return {
      final1: Math.round(final1 * 100) / 100,
      final2: Math.round(final2 * 100) / 100,
      savings1: Math.round(savings1 * 100) / 100,
      savings2: Math.round(savings2 * 100) / 100,
      betterDeal: final1 < final2 ? 1 : final2 < final1 ? 2 : 0,
      difference: Math.abs(Math.round((final1 - final2) * 100) / 100),
    };
  }, [comparePrice1, compareDiscount1, comparePrice2, compareDiscount2]);

  const quickDiscounts = [10, 15, 20, 25, 30, 50];

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="space-y-2">
          <Label htmlFor="original-price">Original Price ($)</Label>
          <Input
            id="original-price"
            type="number"
            step="0.01"
            value={originalPrice}
            onChange={(e) => setOriginalPrice(e.target.value)}
            placeholder="100.00"
            data-testid="input-original-price"
          />
        </div>
      </Card>

      <Tabs defaultValue="percentage" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="percentage" data-testid="tab-percentage">% Off</TabsTrigger>
          <TabsTrigger value="fixed" data-testid="tab-fixed">$ Off</TabsTrigger>
          <TabsTrigger value="stacked" data-testid="tab-stacked">Stacked</TabsTrigger>
          <TabsTrigger value="compare" data-testid="tab-compare">Compare</TabsTrigger>
        </TabsList>

        <TabsContent value="percentage">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Discount Percentage</Label>
                <div className="flex gap-2 flex-wrap">
                  {quickDiscounts.map((d) => (
                    <Button
                      key={d}
                      variant={discountPercent === String(d) ? "default" : "outline"}
                      size="sm"
                      onClick={() => setDiscountPercent(String(d))}
                      data-testid={`button-quick-${d}`}
                    >
                      {d}%
                    </Button>
                  ))}
                </div>
                <Input
                  type="number"
                  step="0.1"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  placeholder="20"
                  data-testid="input-discount-percent"
                />
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex justify-between">
                  <span>Original Price</span>
                  <span className="line-through text-muted-foreground">{formatCurrency(parseFloat(originalPrice) || 0)}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>You Save ({discountPercent}%)</span>
                  <span data-testid="text-savings">-{formatCurrency(percentageCalc.savings)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold pt-2 border-t">
                  <span>Final Price</span>
                  <span data-testid="text-final-price">{formatCurrency(percentageCalc.finalPrice)}</span>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="fixed">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fixed-discount">Discount Amount ($)</Label>
                <Input
                  id="fixed-discount"
                  type="number"
                  step="0.01"
                  value={fixedDiscount}
                  onChange={(e) => setFixedDiscount(e.target.value)}
                  placeholder="15.00"
                  data-testid="input-fixed-discount"
                />
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex justify-between">
                  <span>Original Price</span>
                  <span className="line-through text-muted-foreground">{formatCurrency(parseFloat(originalPrice) || 0)}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Discount ({fixedCalc.percentSaved}%)</span>
                  <span data-testid="text-fixed-savings">-{formatCurrency(parseFloat(fixedDiscount) || 0)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold pt-2 border-t">
                  <span>Final Price</span>
                  <span data-testid="text-fixed-final">{formatCurrency(fixedCalc.finalPrice)}</span>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="stacked">
          <Card className="p-6">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Apply multiple discounts in sequence (e.g., store discount + coupon)
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Discount (%)</Label>
                  <Input
                    type="number"
                    value={discount1}
                    onChange={(e) => setDiscount1(e.target.value)}
                    placeholder="20"
                    data-testid="input-discount-1"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Second Discount (%)</Label>
                  <Input
                    type="number"
                    value={discount2}
                    onChange={(e) => setDiscount2(e.target.value)}
                    placeholder="10"
                    data-testid="input-discount-2"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex justify-between">
                  <span>Original Price</span>
                  <span className="line-through text-muted-foreground">{formatCurrency(parseFloat(originalPrice) || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>After {discount1}% off</span>
                  <span>{formatCurrency(stackedCalc.afterFirst)}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Total Savings</span>
                  <span data-testid="text-stacked-savings">-{formatCurrency(stackedCalc.totalSavings)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold pt-2 border-t">
                  <span>Final Price</span>
                  <span data-testid="text-stacked-final">{formatCurrency(stackedCalc.finalPrice)}</span>
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Effective discount: {stackedCalc.effectiveDiscount}%
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="compare">
          <Card className="p-6">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Compare two deals to see which saves you more
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <Card className={`p-4 ${compareCalc.betterDeal === 1 ? "ring-2 ring-green-500" : ""}`}>
                  <h4 className="font-medium mb-3">Deal 1</h4>
                  <div className="space-y-2">
                    <Input
                      type="number"
                      placeholder="Price"
                      value={comparePrice1}
                      onChange={(e) => setComparePrice1(e.target.value)}
                      data-testid="input-compare-price-1"
                    />
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        placeholder="%"
                        value={compareDiscount1}
                        onChange={(e) => setCompareDiscount1(e.target.value)}
                        data-testid="input-compare-discount-1"
                      />
                      <span>% off</span>
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-sm text-muted-foreground">Final: <span className="font-bold text-foreground">{formatCurrency(compareCalc.final1)}</span></p>
                      <p className="text-sm text-green-600">Save: {formatCurrency(compareCalc.savings1)}</p>
                    </div>
                  </div>
                  {compareCalc.betterDeal === 1 && (
                    <p className="text-sm text-green-600 font-medium mt-2">Better Deal!</p>
                  )}
                </Card>

                <Card className={`p-4 ${compareCalc.betterDeal === 2 ? "ring-2 ring-green-500" : ""}`}>
                  <h4 className="font-medium mb-3">Deal 2</h4>
                  <div className="space-y-2">
                    <Input
                      type="number"
                      placeholder="Price"
                      value={comparePrice2}
                      onChange={(e) => setComparePrice2(e.target.value)}
                      data-testid="input-compare-price-2"
                    />
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        placeholder="%"
                        value={compareDiscount2}
                        onChange={(e) => setCompareDiscount2(e.target.value)}
                        data-testid="input-compare-discount-2"
                      />
                      <span>% off</span>
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-sm text-muted-foreground">Final: <span className="font-bold text-foreground">{formatCurrency(compareCalc.final2)}</span></p>
                      <p className="text-sm text-green-600">Save: {formatCurrency(compareCalc.savings2)}</p>
                    </div>
                  </div>
                  {compareCalc.betterDeal === 2 && (
                    <p className="text-sm text-green-600 font-medium mt-2">Better Deal!</p>
                  )}
                </Card>
              </div>

              {compareCalc.betterDeal !== 0 && (
                <p className="text-center text-sm">
                  Deal {compareCalc.betterDeal} saves you {formatCurrency(compareCalc.difference)} more!
                </p>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
