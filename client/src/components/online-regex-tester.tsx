import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Check } from "lucide-react";

export function OnlineRegexTester() {
  const [pattern, setPattern] = useState("");
  const [testText, setTestText] = useState("");
  const [flags, setFlags] = useState({ global: true, caseInsensitive: false, multiline: false });

  const result = useMemo(() => {
    if (!pattern || !testText) return null;
    try {
      const flagStr = (flags.global ? "g" : "") + (flags.caseInsensitive ? "i" : "") + (flags.multiline ? "m" : "");
      const regex = new RegExp(pattern, flagStr);
      const matches: { match: string; index: number; groups: string[] }[] = [];
      let match;
      if (flags.global) {
        while ((match = regex.exec(testText)) !== null) {
          matches.push({ match: match[0], index: match.index, groups: match.slice(1) });
          if (match[0].length === 0) regex.lastIndex++;
        }
      } else {
        match = regex.exec(testText);
        if (match) {
          matches.push({ match: match[0], index: match.index, groups: match.slice(1) });
        }
      }
      return { valid: true, matches, error: null };
    } catch (e: any) {
      return { valid: false, matches: [], error: e.message };
    }
  }, [pattern, testText, flags]);

  const highlightedText = useMemo(() => {
    if (!result?.valid || result.matches.length === 0) return testText;
    let lastIndex = 0;
    const parts: { text: string; highlighted: boolean }[] = [];
    for (const m of result.matches) {
      if (m.index > lastIndex) {
        parts.push({ text: testText.slice(lastIndex, m.index), highlighted: false });
      }
      parts.push({ text: m.match, highlighted: true });
      lastIndex = m.index + m.match.length;
    }
    if (lastIndex < testText.length) {
      parts.push({ text: testText.slice(lastIndex), highlighted: false });
    }
    return parts;
  }, [testText, result]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Regular Expression</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pattern">Pattern</Label>
            <div className="flex gap-2 items-center">
              <span className="text-muted-foreground">/</span>
              <Input
                id="pattern"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="Enter regex pattern..."
                className="font-mono"
                data-testid="input-regex-pattern"
              />
              <span className="text-muted-foreground">/</span>
              <span className="text-sm font-mono text-muted-foreground">
                {flags.global ? "g" : ""}{flags.caseInsensitive ? "i" : ""}{flags.multiline ? "m" : ""}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="global"
                checked={flags.global}
                onCheckedChange={(c) => setFlags({ ...flags, global: !!c })}
                data-testid="checkbox-global"
              />
              <Label htmlFor="global" className="text-sm">Global (g)</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="caseInsensitive"
                checked={flags.caseInsensitive}
                onCheckedChange={(c) => setFlags({ ...flags, caseInsensitive: !!c })}
                data-testid="checkbox-case-insensitive"
              />
              <Label htmlFor="caseInsensitive" className="text-sm">Case Insensitive (i)</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="multiline"
                checked={flags.multiline}
                onCheckedChange={(c) => setFlags({ ...flags, multiline: !!c })}
                data-testid="checkbox-multiline"
              />
              <Label htmlFor="multiline" className="text-sm">Multiline (m)</Label>
            </div>
          </div>
          {result && !result.valid && (
            <div className="flex items-center gap-2 text-destructive text-sm">
              <AlertCircle className="h-4 w-4" />
              <span data-testid="text-regex-error">{result.error}</span>
            </div>
          )}
          {result && result.valid && (
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <Check className="h-4 w-4" />
              <span data-testid="text-match-count">{result.matches.length} match{result.matches.length !== 1 ? "es" : ""} found</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Test String</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            placeholder="Enter text to test against the regex..."
            rows={6}
            className="font-mono"
            data-testid="textarea-test-string"
          />
          {result?.valid && result.matches.length > 0 && (
            <div className="space-y-2">
              <Label>Highlighted Matches</Label>
              <div className="p-3 bg-muted rounded-md font-mono text-sm whitespace-pre-wrap" data-testid="text-highlighted-matches">
                {Array.isArray(highlightedText) ? (
                  highlightedText.map((part, i) => (
                    <span key={i} className={part.highlighted ? "bg-yellow-300 dark:bg-yellow-600" : ""}>
                      {part.text}
                    </span>
                  ))
                ) : (
                  highlightedText
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {result?.valid && result.matches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Match Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {result.matches.slice(0, 20).map((m, i) => (
                <div key={i} className="flex flex-wrap items-center gap-2 p-2 bg-muted rounded-md" data-testid={`match-detail-${i}`}>
                  <Badge variant="outline" className="text-xs">Match {i + 1}</Badge>
                  <span className="font-mono text-sm bg-yellow-200 dark:bg-yellow-700 px-1 rounded">{m.match}</span>
                  <span className="text-xs text-muted-foreground">at index {m.index}</span>
                  {m.groups.length > 0 && (
                    <span className="text-xs text-muted-foreground">
                      Groups: {m.groups.map((g, j) => <Badge key={j} variant="secondary" className="ml-1 text-xs">${j + 1}: {g}</Badge>)}
                    </span>
                  )}
                </div>
              ))}
              {result.matches.length > 20 && (
                <p className="text-sm text-muted-foreground">Showing first 20 of {result.matches.length} matches...</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
