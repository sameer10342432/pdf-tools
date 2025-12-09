import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileCheck, Copy, Check, Trash2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GrammarIssue {
  type: "error" | "warning" | "suggestion";
  message: string;
  context: string;
  suggestion?: string;
}

function checkGrammar(text: string): GrammarIssue[] {
  const issues: GrammarIssue[] = [];
  const sentences = text.split(/(?<=[.!?])\s+/);
  
  const doubleWords = text.match(/\b(\w+)\s+\1\b/gi);
  if (doubleWords) {
    doubleWords.forEach(match => {
      issues.push({
        type: "error",
        message: "Repeated word detected",
        context: match,
        suggestion: match.split(/\s+/)[0],
      });
    });
  }
  
  sentences.forEach(sentence => {
    if (sentence.length > 0 && /^[a-z]/.test(sentence.trim())) {
      issues.push({
        type: "error",
        message: "Sentence should start with a capital letter",
        context: sentence.substring(0, 30) + "...",
        suggestion: sentence.charAt(0).toUpperCase() + sentence.slice(1),
      });
    }
  });
  
  const commonErrors: [RegExp, string, string][] = [
    [/\bi\b/g, "Use 'I' (capitalize)", "I"],
    [/\byour\s+(?:a|an)\b/gi, "Possible confusion: 'your' vs 'you're'", "you're a"],
    [/\bits\s+(?:a|an|the)\b/gi, "Check: 'its' vs 'it's'", "it's"],
    [/\bthere\s+(?:going|coming|doing)\b/gi, "Possible: 'they're' instead of 'there'", "they're"],
    [/\bshould\s+of\b/gi, "Use 'should have' instead of 'should of'", "should have"],
    [/\bcould\s+of\b/gi, "Use 'could have' instead of 'could of'", "could have"],
    [/\bwould\s+of\b/gi, "Use 'would have' instead of 'would of'", "would have"],
    [/\balot\b/gi, "Write as two words: 'a lot'", "a lot"],
    [/\binfact\b/gi, "Write as two words: 'in fact'", "in fact"],
    [/\bnevertheless\b/gi, "Consider: 'nevertheless' is one word", ""],
  ];
  
  commonErrors.forEach(([pattern, message, suggestion]) => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => {
        issues.push({
          type: "warning",
          message,
          context: match,
          suggestion: suggestion || undefined,
        });
      });
    }
  });
  
  if (text.includes("  ")) {
    issues.push({
      type: "suggestion",
      message: "Multiple consecutive spaces detected",
      context: "Consider using single spaces between words",
    });
  }
  
  const longSentences = sentences.filter(s => s.split(/\s+/).length > 35);
  if (longSentences.length > 0) {
    issues.push({
      type: "suggestion",
      message: `${longSentences.length} long sentence(s) detected (35+ words)`,
      context: "Consider breaking into shorter sentences for clarity",
    });
  }
  
  const passivePatterns = /\b(?:is|are|was|were|been|being)\s+(?:\w+ed)\b/gi;
  const passiveMatches = text.match(passivePatterns);
  if (passiveMatches && passiveMatches.length > 3) {
    issues.push({
      type: "suggestion",
      message: `Heavy passive voice usage (${passiveMatches.length} instances)`,
      context: "Consider using more active voice for stronger writing",
    });
  }
  
  return issues;
}

export function GrammarChecker() {
  const [content, setContent] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const issues = content.trim() ? checkGrammar(content) : [];
  const errorCount = issues.filter(i => i.type === "error").length;
  const warningCount = issues.filter(i => i.type === "warning").length;
  const suggestionCount = issues.filter(i => i.type === "suggestion").length;

  const handleClear = useCallback(() => {
    if (content && confirm("Are you sure you want to clear all content?")) {
      setContent("");
      toast({ title: "Content cleared", description: "Your text has been cleared." });
    }
  }, [content, toast]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content);
      setIsCopied(true);
      toast({ title: "Copied", description: "Text copied to clipboard." });
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  }, [content, toast]);

  const getIssueColor = (type: string) => {
    switch (type) {
      case "error": return "border-red-500 bg-red-50 dark:bg-red-950";
      case "warning": return "border-yellow-500 bg-yellow-50 dark:bg-yellow-950";
      default: return "border-blue-500 bg-blue-50 dark:bg-blue-950";
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">Grammar Checker</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy} disabled={!content} data-testid="button-copy">
              {isCopied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
              {isCopied ? "Copied" : "Copy"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleClear} disabled={!content} data-testid="button-clear">
              <Trash2 className="h-4 w-4 mr-1" /> Clear
            </Button>
          </div>
        </div>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Paste or type your text here to check for grammar issues...

The tool checks for:
- Repeated words
- Capitalization errors
- Common grammar mistakes
- Passive voice overuse
- Long sentence warnings"
          className="min-h-[250px] font-mono text-sm resize-y"
          data-testid="textarea-content"
        />
      </Card>

      {content.trim() && (
        <Card className="p-4">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <h3 className="font-medium">Analysis Results</h3>
            <div className="flex gap-3 text-sm">
              <span className="text-red-600" data-testid="text-errors">{errorCount} error{errorCount !== 1 ? 's' : ''}</span>
              <span className="text-yellow-600" data-testid="text-warnings">{warningCount} warning{warningCount !== 1 ? 's' : ''}</span>
              <span className="text-blue-600" data-testid="text-suggestions">{suggestionCount} suggestion{suggestionCount !== 1 ? 's' : ''}</span>
            </div>
          </div>
          
          {issues.length === 0 ? (
            <div className="flex items-center gap-2 text-green-600">
              <Check className="h-5 w-5" />
              <span>No grammar issues detected. Great job!</span>
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {issues.map((issue, index) => (
                <div key={index} className={`p-3 rounded-md border-l-4 ${getIssueColor(issue.type)}`}>
                  <div className="flex items-start gap-2">
                    <AlertCircle className={`h-4 w-4 mt-0.5 ${
                      issue.type === "error" ? "text-red-600" : 
                      issue.type === "warning" ? "text-yellow-600" : "text-blue-600"
                    }`} />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{issue.message}</p>
                      <p className="text-sm text-muted-foreground mt-1">Context: "{issue.context}"</p>
                      {issue.suggestion && (
                        <p className="text-sm text-green-600 mt-1">Suggestion: "{issue.suggestion}"</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      <Card className="p-4">
        <h3 className="font-medium mb-2">Tips for Better Grammar</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>Read your text aloud to catch awkward phrasing</li>
          <li>Use active voice for clearer, more direct writing</li>
          <li>Keep sentences concise - aim for 15-20 words on average</li>
          <li>Proofread multiple times with breaks in between</li>
        </ul>
      </Card>
    </div>
  );
}
