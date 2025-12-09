import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Search, Copy, Check, Trash2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function analyzePlagiarism(text: string) {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  const words = text.split(/\s+/).filter(w => w.length > 0);
  
  const commonPhrases = [
    "according to", "in order to", "as a result", "on the other hand",
    "in conclusion", "for example", "in addition", "however", "therefore",
    "furthermore", "nevertheless", "consequently", "meanwhile", "moreover"
  ];
  
  let phraseCount = 0;
  const lowerText = text.toLowerCase();
  commonPhrases.forEach(phrase => {
    const regex = new RegExp(phrase, 'gi');
    const matches = lowerText.match(regex);
    if (matches) phraseCount += matches.length;
  });
  
  const uniqueWords = new Set(words.map(w => w.toLowerCase().replace(/[^a-z]/g, '')));
  const vocabularyRichness = uniqueWords.size / (words.length || 1);
  
  const avgSentenceLength = words.length / (sentences.length || 1);
  const sentenceLengthVariance = sentences.reduce((acc, s) => {
    const len = s.split(/\s+/).length;
    return acc + Math.pow(len - avgSentenceLength, 2);
  }, 0) / (sentences.length || 1);
  
  let originalityScore = 100;
  
  if (vocabularyRichness < 0.3) originalityScore -= 15;
  else if (vocabularyRichness < 0.5) originalityScore -= 5;
  
  if (sentenceLengthVariance < 10) originalityScore -= 10;
  
  const phraseDensity = phraseCount / (sentences.length || 1);
  if (phraseDensity > 0.5) originalityScore -= 10;
  
  originalityScore = Math.max(0, Math.min(100, originalityScore));
  
  return {
    originalityScore: Math.round(originalityScore),
    wordCount: words.length,
    sentenceCount: sentences.length,
    uniqueWordCount: uniqueWords.size,
    vocabularyRichness: Math.round(vocabularyRichness * 100),
    commonPhraseCount: phraseCount,
    avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
  };
}

function getOriginalityLevel(score: number): { level: string; color: string; icon: any } {
  if (score >= 90) return { level: "Highly Original", color: "text-green-600", icon: CheckCircle2 };
  if (score >= 75) return { level: "Mostly Original", color: "text-green-500", icon: CheckCircle2 };
  if (score >= 60) return { level: "Moderately Original", color: "text-yellow-500", icon: AlertTriangle };
  if (score >= 40) return { level: "Needs Review", color: "text-orange-500", icon: AlertTriangle };
  return { level: "Low Originality", color: "text-red-500", icon: AlertTriangle };
}

export function PlagiarismChecker() {
  const [content, setContent] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const analysis = content.trim().length >= 50 ? analyzePlagiarism(content) : null;

  const handleClear = useCallback(() => {
    if (content && confirm("Are you sure you want to clear all content?")) {
      setContent("");
      toast({ title: "Content cleared", description: "Your text has been cleared." });
    }
  }, [content, toast]);

  const handleCopy = useCallback(async () => {
    if (!analysis) return;
    const originalityInfo = getOriginalityLevel(analysis.originalityScore);
    const report = `Plagiarism Analysis Report:
Originality Score: ${analysis.originalityScore}% (${originalityInfo.level})
Words: ${analysis.wordCount}
Sentences: ${analysis.sentenceCount}
Unique Words: ${analysis.uniqueWordCount}
Vocabulary Richness: ${analysis.vocabularyRichness}%
Common Phrases Found: ${analysis.commonPhraseCount}
Avg Sentence Length: ${analysis.avgSentenceLength} words`;
    
    try {
      await navigator.clipboard.writeText(report);
      setIsCopied(true);
      toast({ title: "Copied", description: "Report copied to clipboard." });
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  }, [analysis, toast]);

  const originalityInfo = analysis ? getOriginalityLevel(analysis.originalityScore) : null;
  const StatusIcon = originalityInfo?.icon || CheckCircle2;

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">Plagiarism Checker</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy} disabled={!analysis} data-testid="button-copy">
              {isCopied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
              {isCopied ? "Copied" : "Copy Report"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleClear} disabled={!content} data-testid="button-clear">
              <Trash2 className="h-4 w-4 mr-1" /> Clear
            </Button>
          </div>
        </div>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Paste or type your text here to check for potential plagiarism...

Minimum 50 characters required for analysis.

This tool analyzes:
- Vocabulary richness and uniqueness
- Sentence structure patterns
- Common phrase usage
- Writing style consistency"
          className="min-h-[250px] font-mono text-sm resize-y"
          data-testid="textarea-content"
        />
        {content.length > 0 && content.length < 50 && (
          <p className="text-sm text-muted-foreground mt-2">Enter at least 50 characters for analysis ({50 - content.length} more needed)</p>
        )}
      </Card>

      {analysis && (
        <>
          <Card className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <StatusIcon className={`h-6 w-6 ${originalityInfo?.color}`} />
              <div>
                <h3 className="font-medium">Originality Score</h3>
                <p className={`text-sm ${originalityInfo?.color}`}>{originalityInfo?.level}</p>
              </div>
              <div className="ml-auto text-3xl font-bold" data-testid="text-score">{analysis.originalityScore}%</div>
            </div>
            <Progress value={analysis.originalityScore} className="h-3" />
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <h3 className="font-medium mb-3">Content Analysis</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Words</span>
                  <span className="font-medium" data-testid="text-words">{analysis.wordCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Sentences</span>
                  <span className="font-medium" data-testid="text-sentences">{analysis.sentenceCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg Sentence Length</span>
                  <span className="font-medium">{analysis.avgSentenceLength} words</span>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-medium mb-3">Originality Indicators</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Unique Words</span>
                  <span className="font-medium" data-testid="text-unique">{analysis.uniqueWordCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vocabulary Richness</span>
                  <span className="font-medium">{analysis.vocabularyRichness}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Common Phrases</span>
                  <span className="font-medium">{analysis.commonPhraseCount}</span>
                </div>
              </div>
            </Card>
          </div>
        </>
      )}

      <Card className="p-4">
        <h3 className="font-medium mb-2">About This Tool</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>This tool performs linguistic analysis to estimate content originality</li>
          <li>Higher vocabulary richness and sentence variety indicate more original content</li>
          <li>For comprehensive plagiarism detection, consider using dedicated services</li>
          <li>Results are estimates based on writing patterns, not database comparisons</li>
        </ul>
      </Card>
    </div>
  );
}
