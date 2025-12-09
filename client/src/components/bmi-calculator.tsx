import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

interface BMIResult {
  bmi: number;
  category: string;
  color: string;
  description: string;
}

export function BmiCalculator() {
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [heightFeet, setHeightFeet] = useState("");
  const [heightInches, setHeightInches] = useState("");
  const [result, setResult] = useState<BMIResult | null>(null);

  const calculateBMI = useCallback(() => {
    let weightKg: number;
    let heightM: number;

    if (unit === "metric") {
      weightKg = parseFloat(weight);
      heightM = parseFloat(height) / 100;
    } else {
      weightKg = parseFloat(weight) * 0.453592;
      const totalInches = parseFloat(heightFeet) * 12 + parseFloat(heightInches);
      heightM = totalInches * 0.0254;
    }

    if (isNaN(weightKg) || isNaN(heightM) || weightKg <= 0 || heightM <= 0) {
      return;
    }

    const bmi = weightKg / (heightM * heightM);
    const roundedBMI = Math.round(bmi * 10) / 10;

    let category: string;
    let color: string;
    let description: string;

    if (bmi < 18.5) {
      category = "Underweight";
      color = "text-blue-500";
      description = "You may need to gain weight. Consult with a healthcare provider for personalized advice.";
    } else if (bmi < 25) {
      category = "Normal Weight";
      color = "text-green-500";
      description = "Your weight is within a healthy range. Maintain a balanced diet and regular exercise.";
    } else if (bmi < 30) {
      category = "Overweight";
      color = "text-yellow-500";
      description = "You may benefit from lifestyle changes. Consider consulting a healthcare provider.";
    } else {
      category = "Obese";
      color = "text-red-500";
      description = "Please consult with a healthcare provider for personalized guidance on weight management.";
    }

    setResult({ bmi: roundedBMI, category, color, description });
  }, [unit, weight, height, heightFeet, heightInches]);

  const clearForm = useCallback(() => {
    setWeight("");
    setHeight("");
    setHeightFeet("");
    setHeightInches("");
    setResult(null);
  }, []);

  const getBMIProgress = (bmi: number): number => {
    if (bmi < 15) return 5;
    if (bmi > 40) return 100;
    return ((bmi - 15) / 25) * 100;
  };

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <Tabs value={unit} onValueChange={(v) => { setUnit(v as "metric" | "imperial"); clearForm(); }}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="metric" data-testid="tab-metric">Metric (kg/cm)</TabsTrigger>
            <TabsTrigger value="imperial" data-testid="tab-imperial">Imperial (lbs/ft-in)</TabsTrigger>
          </TabsList>

          <TabsContent value="metric" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="weight-metric">Weight (kg)</Label>
              <Input
                id="weight-metric"
                type="number"
                placeholder="e.g., 70"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                data-testid="input-weight-metric"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height-metric">Height (cm)</Label>
              <Input
                id="height-metric"
                type="number"
                placeholder="e.g., 175"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                data-testid="input-height-metric"
              />
            </div>
          </TabsContent>

          <TabsContent value="imperial" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="weight-imperial">Weight (lbs)</Label>
              <Input
                id="weight-imperial"
                type="number"
                placeholder="e.g., 154"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                data-testid="input-weight-imperial"
              />
            </div>
            <div className="space-y-2">
              <Label>Height</Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    type="number"
                    placeholder="Feet"
                    value={heightFeet}
                    onChange={(e) => setHeightFeet(e.target.value)}
                    data-testid="input-height-feet"
                  />
                </div>
                <div className="flex-1">
                  <Input
                    type="number"
                    placeholder="Inches"
                    value={heightInches}
                    onChange={(e) => setHeightInches(e.target.value)}
                    data-testid="input-height-inches"
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex gap-2 mt-6">
          <Button onClick={calculateBMI} className="flex-1" data-testid="button-calculate">
            Calculate BMI
          </Button>
          <Button variant="outline" onClick={clearForm} data-testid="button-clear">
            Clear
          </Button>
        </div>
      </Card>

      {result && (
        <Card className="p-6">
          <div className="text-center mb-6">
            <p className="text-sm text-muted-foreground mb-2">Your BMI</p>
            <p className={`text-5xl font-bold ${result.color}`} data-testid="text-bmi-value">
              {result.bmi}
            </p>
            <p className={`text-xl font-medium mt-2 ${result.color}`} data-testid="text-bmi-category">
              {result.category}
            </p>
          </div>

          <div className="mb-6">
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>15</span>
              <span>18.5</span>
              <span>25</span>
              <span>30</span>
              <span>40</span>
            </div>
            <div className="relative h-4 bg-gradient-to-r from-blue-400 via-green-400 via-50% via-yellow-400 to-red-500 rounded-full">
              <div
                className="absolute w-3 h-6 bg-foreground rounded-full -top-1 transform -translate-x-1/2"
                style={{ left: `${getBMIProgress(result.bmi)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>Underweight</span>
              <span>Normal</span>
              <span>Overweight</span>
              <span>Obese</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground" data-testid="text-bmi-description">
            {result.description}
          </p>
        </Card>
      )}

      <Card className="p-4">
        <h3 className="font-medium mb-2">BMI Categories</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-blue-500">Underweight</span>
            <span>Below 18.5</span>
          </div>
          <div className="flex justify-between">
            <span className="text-green-500">Normal weight</span>
            <span>18.5 - 24.9</span>
          </div>
          <div className="flex justify-between">
            <span className="text-yellow-500">Overweight</span>
            <span>25 - 29.9</span>
          </div>
          <div className="flex justify-between">
            <span className="text-red-500">Obese</span>
            <span>30 and above</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          Note: BMI is a screening tool, not a diagnostic measure. It does not account for muscle mass, bone density, or body composition.
        </p>
      </Card>
    </div>
  );
}
