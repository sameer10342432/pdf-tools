import { useState, useCallback, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2 } from "lucide-react";

interface Item {
  id: number;
  name: string;
  price: string;
}

export function SalesTaxCalculator() {
  const [price, setPrice] = useState("100");
  const [taxRate, setTaxRate] = useState("8.25");
  const [totalWithTax, setTotalWithTax] = useState("");
  const [items, setItems] = useState<Item[]>([{ id: 1, name: "Item 1", price: "" }]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const calculations = useMemo(() => {
    const priceNum = parseFloat(price) || 0;
    const rateNum = parseFloat(taxRate) || 0;
    
    const taxAmount = priceNum * (rateNum / 100);
    const total = priceNum + taxAmount;

    return {
      taxAmount: Math.round(taxAmount * 100) / 100,
      total: Math.round(total * 100) / 100,
    };
  }, [price, taxRate]);

  const reverseCalculations = useMemo(() => {
    const totalNum = parseFloat(totalWithTax) || 0;
    const rateNum = parseFloat(taxRate) || 0;
    
    const preTax = totalNum / (1 + rateNum / 100);
    const taxAmount = totalNum - preTax;

    return {
      preTax: Math.round(preTax * 100) / 100,
      taxAmount: Math.round(taxAmount * 100) / 100,
    };
  }, [totalWithTax, taxRate]);

  const multipleItemsCalculations = useMemo(() => {
    const rateNum = parseFloat(taxRate) || 0;
    let subtotal = 0;

    items.forEach((item) => {
      subtotal += parseFloat(item.price) || 0;
    });

    const taxAmount = subtotal * (rateNum / 100);
    const total = subtotal + taxAmount;

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      taxAmount: Math.round(taxAmount * 100) / 100,
      total: Math.round(total * 100) / 100,
    };
  }, [items, taxRate]);

  const addItem = useCallback(() => {
    setItems([...items, { id: Date.now(), name: `Item ${items.length + 1}`, price: "" }]);
  }, [items]);

  const removeItem = useCallback((id: number) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  }, [items]);

  const updateItem = useCallback((id: number, field: "name" | "price", value: string) => {
    setItems(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  }, [items]);

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="space-y-2 mb-6">
          <Label htmlFor="tax-rate">Sales Tax Rate (%)</Label>
          <Input
            id="tax-rate"
            type="number"
            step="0.01"
            value={taxRate}
            onChange={(e) => setTaxRate(e.target.value)}
            placeholder="8.25"
            data-testid="input-tax-rate"
          />
        </div>
      </Card>

      <Tabs defaultValue="single" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="single" data-testid="tab-single">Single Item</TabsTrigger>
          <TabsTrigger value="reverse" data-testid="tab-reverse">Reverse Calc</TabsTrigger>
          <TabsTrigger value="multiple" data-testid="tab-multiple">Multiple Items</TabsTrigger>
        </TabsList>

        <TabsContent value="single">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price Before Tax ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="100.00"
                  data-testid="input-price"
                />
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span data-testid="text-subtotal">{formatCurrency(parseFloat(price) || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax ({taxRate}%)</span>
                  <span data-testid="text-tax-amount">{formatCurrency(calculations.taxAmount)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total</span>
                  <span data-testid="text-total">{formatCurrency(calculations.total)}</span>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="reverse">
          <Card className="p-6">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Enter the total (including tax) to find the pre-tax price.
              </p>
              <div className="space-y-2">
                <Label htmlFor="total-with-tax">Total (Including Tax) ($)</Label>
                <Input
                  id="total-with-tax"
                  type="number"
                  step="0.01"
                  value={totalWithTax}
                  onChange={(e) => setTotalWithTax(e.target.value)}
                  placeholder="108.25"
                  data-testid="input-total-with-tax"
                />
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex justify-between">
                  <span>Pre-Tax Price</span>
                  <span className="font-medium" data-testid="text-pre-tax">{formatCurrency(reverseCalculations.preTax)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax Amount ({taxRate}%)</span>
                  <span data-testid="text-reverse-tax">{formatCurrency(reverseCalculations.taxAmount)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total</span>
                  <span>{formatCurrency(parseFloat(totalWithTax) || 0)}</span>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="multiple">
          <Card className="p-6">
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={item.id} className="flex gap-2 items-end" data-testid={`item-row-${item.id}`}>
                  <div className="flex-1 space-y-2">
                    <Label>Item {index + 1}</Label>
                    <Input
                      placeholder="Item name"
                      value={item.name}
                      onChange={(e) => updateItem(item.id, "name", e.target.value)}
                      data-testid={`input-item-name-${item.id}`}
                    />
                  </div>
                  <div className="w-32 space-y-2">
                    <Label>Price</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={item.price}
                      onChange={(e) => updateItem(item.id, "price", e.target.value)}
                      data-testid={`input-item-price-${item.id}`}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(item.id)}
                    disabled={items.length === 1}
                    data-testid={`button-remove-item-${item.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <Button variant="outline" onClick={addItem} className="w-full" data-testid="button-add-item">
                <Plus className="h-4 w-4 mr-2" /> Add Item
              </Button>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span data-testid="text-multi-subtotal">{formatCurrency(multipleItemsCalculations.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax ({taxRate}%)</span>
                  <span data-testid="text-multi-tax">{formatCurrency(multipleItemsCalculations.taxAmount)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total</span>
                  <span data-testid="text-multi-total">{formatCurrency(multipleItemsCalculations.total)}</span>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
