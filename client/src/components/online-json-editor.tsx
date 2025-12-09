import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertCircle, Check, Copy, Minimize2, Maximize2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function OnlineJsonEditor() {
  const [jsonInput, setJsonInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const validateJson = useCallback((text: string) => {
    if (!text.trim()) {
      setError(null);
      return null;
    }
    try {
      const parsed = JSON.parse(text);
      setError(null);
      return parsed;
    } catch (e: any) {
      setError(e.message);
      return null;
    }
  }, []);

  const handleInputChange = (value: string) => {
    setJsonInput(value);
    validateJson(value);
  };

  const beautify = () => {
    const parsed = validateJson(jsonInput);
    if (parsed !== null) {
      setJsonInput(JSON.stringify(parsed, null, 2));
      toast({ title: "JSON beautified", description: "Your JSON has been formatted with proper indentation." });
    }
  };

  const minify = () => {
    const parsed = validateJson(jsonInput);
    if (parsed !== null) {
      setJsonInput(JSON.stringify(parsed));
      toast({ title: "JSON minified", description: "Your JSON has been compressed to a single line." });
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(jsonInput);
    toast({ title: "Copied", description: "JSON copied to clipboard." });
  };

  const isValid = !error && jsonInput.trim().length > 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
          <CardTitle className="text-lg">JSON Editor</CardTitle>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={beautify} disabled={!isValid} data-testid="button-beautify">
              <Maximize2 className="h-4 w-4 mr-1" />
              Beautify
            </Button>
            <Button variant="outline" size="sm" onClick={minify} disabled={!isValid} data-testid="button-minify">
              <Minimize2 className="h-4 w-4 mr-1" />
              Minify
            </Button>
            <Button variant="outline" size="sm" onClick={copyToClipboard} disabled={!jsonInput} data-testid="button-copy">
              <Copy className="h-4 w-4 mr-1" />
              Copy
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="json-input">JSON Data</Label>
            <Textarea
              id="json-input"
              value={jsonInput}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder='{"name": "John", "age": 30}'
              rows={15}
              className="font-mono text-sm"
              data-testid="textarea-json-input"
            />
          </div>
          {error && (
            <div className="flex items-start gap-2 text-destructive text-sm p-3 bg-destructive/10 rounded-md">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span data-testid="text-json-error">{error}</span>
            </div>
          )}
          {isValid && (
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <Check className="h-4 w-4" />
              <span data-testid="text-json-valid">Valid JSON</span>
            </div>
          )}
        </CardContent>
      </Card>

      {isValid && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Parsed Structure</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="p-4 bg-muted rounded-md overflow-auto max-h-96 text-sm font-mono" data-testid="text-parsed-json">
              {JSON.stringify(JSON.parse(jsonInput), null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
