import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Copy, Check, AlertCircle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { type PdfToolType } from "@shared/schema";

interface TextProcessingToolProps {
  toolType: PdfToolType;
}

export function TextProcessingTool({ toolType }: TextProcessingToolProps) {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();

  const getPlaceholder = () => {
    switch (toolType) {
      case "iban-validator":
        return "Enter IBAN number (e.g., DE89370400440532013000)";
      case "slug-to-title":
        return "Enter slug (e.g., my-awesome-blog-post)";
      case "title-to-slug":
        return "Enter title (e.g., My Awesome Blog Post)";
      case "case-converter-camel":
        return "Enter text to convert to camelCase";
      case "case-converter-snake":
        return "Enter text to convert to snake_case";
      case "case-converter-kebab":
        return "Enter text to convert to kebab-case";
      case "case-converter-pascal":
        return "Enter text to convert to PascalCase";
      case "find-facebook-id":
        return "Enter Facebook profile URL or username";
      case "find-twitter-id":
        return "Enter Twitter/X profile URL or username";
      case "http-status-checker":
        return "Enter URL to check (e.g., https://example.com)";
      default:
        return "Enter text...";
    }
  };

  const getInputLabel = () => {
    switch (toolType) {
      case "iban-validator":
        return "IBAN Number";
      case "slug-to-title":
        return "Slug";
      case "title-to-slug":
        return "Title";
      case "case-converter-camel":
      case "case-converter-snake":
      case "case-converter-kebab":
      case "case-converter-pascal":
        return "Text to Convert";
      case "find-facebook-id":
        return "Facebook Profile URL or Username";
      case "find-twitter-id":
        return "Twitter/X Profile URL or Username";
      case "http-status-checker":
        return "URL";
      default:
        return "Input";
    }
  };

  const getButtonText = () => {
    switch (toolType) {
      case "iban-validator":
        return "Validate IBAN";
      case "slug-to-title":
      case "title-to-slug":
      case "case-converter-camel":
      case "case-converter-snake":
      case "case-converter-kebab":
      case "case-converter-pascal":
        return "Convert";
      case "find-facebook-id":
        return "Find Facebook ID";
      case "find-twitter-id":
        return "Find Twitter ID";
      case "http-status-checker":
        return "Check Status";
      default:
        return "Process";
    }
  };

  const isUrlInput = () => {
    return ["find-facebook-id", "find-twitter-id", "http-status-checker"].includes(toolType);
  };

  const handleProcess = async () => {
    if (!input.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter some text to process.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setResult(null);
    setIsValid(null);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/text-tools", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          toolType,
          input: input.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errMsg = errorData.error || "Processing failed";
        setErrorMessage(errMsg);
        throw new Error(errMsg);
      }

      const data = await response.json();
      
      if (data.success) {
        setResult(data.result);
        if (data.isValid !== undefined) {
          setIsValid(data.isValid);
        }
        
        if (toolType !== "iban-validator" && toolType !== "http-status-checker") {
          toast({
            title: "Success",
            description: "Text processed successfully!",
          });
        }
      } else {
        const errMsg = data.error || "Processing failed";
        setErrorMessage(errMsg);
        throw new Error(errMsg);
      }
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "An error occurred";
      setErrorMessage(errMsg);
      toast({
        title: "Error",
        description: errMsg,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      toast({
        title: "Copied",
        description: "Result copied to clipboard!",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Copy Failed",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="text-input">{getInputLabel()}</Label>
        {isUrlInput() ? (
          <Input
            id="text-input"
            type="text"
            placeholder={getPlaceholder()}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            data-testid="input-text-tool"
          />
        ) : (
          <Textarea
            id="text-input"
            placeholder={getPlaceholder()}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[100px]"
            data-testid="input-text-tool"
          />
        )}
      </div>

      <Button
        onClick={handleProcess}
        disabled={isProcessing || !input.trim()}
        className="w-full"
        data-testid="button-process-text"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          getButtonText()
        )}
      </Button>

      {errorMessage && !result && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className="font-medium text-red-600 dark:text-red-400">{errorMessage}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {result !== null && (
        <Card>
          <CardContent className="pt-4">
            {toolType === "iban-validator" && (
              <div className="flex items-center gap-3 mb-3">
                {isValid ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">Valid IBAN</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <span className="font-medium text-red-600 dark:text-red-400">Invalid IBAN</span>
                  </>
                )}
              </div>
            )}
            
            {toolType === "http-status-checker" && (
              <div className="flex items-center gap-3 mb-3">
                {isValid ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">URL is Accessible</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                    <span className="font-medium text-amber-600 dark:text-amber-400">URL Status</span>
                  </>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label>Result</Label>
              <div className="flex gap-2">
                <Textarea
                  value={result}
                  readOnly
                  className="min-h-[80px] font-mono text-sm"
                  data-testid="text-result"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopy}
                  data-testid="button-copy-result"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
