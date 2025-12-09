import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertCircle, Check, Copy, Maximize2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function formatXml(xml: string, indent = "  "): string {
  let formatted = "";
  let pad = 0;
  const nodes = xml.replace(/(>)(<)(\/*)/g, "$1\n$2$3").split("\n");
  for (const node of nodes) {
    let indentLevel = 0;
    if (node.match(/<\/\w/)) {
      indentLevel = --pad < 0 ? 0 : pad;
    } else if (node.match(/<\w[^>]*[^\/]>.*$/)) {
      indentLevel = pad++;
    } else {
      indentLevel = pad;
    }
    formatted += indent.repeat(indentLevel) + node + "\n";
  }
  return formatted.trim();
}

function validateXml(xml: string): { valid: boolean; error: string | null } {
  if (!xml.trim()) return { valid: false, error: null };
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, "application/xml");
    const parseError = doc.getElementsByTagName("parsererror");
    if (parseError.length > 0) {
      return { valid: false, error: parseError[0].textContent || "Invalid XML" };
    }
    return { valid: true, error: null };
  } catch (e: any) {
    return { valid: false, error: e.message };
  }
}

export function OnlineXmlEditor() {
  const [xmlInput, setXmlInput] = useState("");
  const [validationResult, setValidationResult] = useState<{ valid: boolean; error: string | null }>({ valid: false, error: null });
  const { toast } = useToast();

  const handleInputChange = useCallback((value: string) => {
    setXmlInput(value);
    setValidationResult(validateXml(value));
  }, []);

  const beautify = () => {
    if (validationResult.valid) {
      setXmlInput(formatXml(xmlInput));
      toast({ title: "XML formatted", description: "Your XML has been formatted with proper indentation." });
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(xmlInput);
    toast({ title: "Copied", description: "XML copied to clipboard." });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
          <CardTitle className="text-lg">XML Editor</CardTitle>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={beautify} disabled={!validationResult.valid} data-testid="button-beautify-xml">
              <Maximize2 className="h-4 w-4 mr-1" />
              Beautify
            </Button>
            <Button variant="outline" size="sm" onClick={copyToClipboard} disabled={!xmlInput} data-testid="button-copy-xml">
              <Copy className="h-4 w-4 mr-1" />
              Copy
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="xml-input">XML Data</Label>
            <Textarea
              id="xml-input"
              value={xmlInput}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="<root><item>content</item></root>"
              rows={15}
              className="font-mono text-sm"
              data-testid="textarea-xml-input"
            />
          </div>
          {validationResult.error && (
            <div className="flex items-start gap-2 text-destructive text-sm p-3 bg-destructive/10 rounded-md">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span data-testid="text-xml-error">{validationResult.error}</span>
            </div>
          )}
          {validationResult.valid && (
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <Check className="h-4 w-4" />
              <span data-testid="text-xml-valid">Valid XML</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
