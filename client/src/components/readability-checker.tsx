import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Copy, Check, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function calculateReadabilityScores(text: string) {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const syllables = words.reduce((count, word) => count + countSyllables(word), 0);
  
  const wordCount = words.length;
  const sentenceCount = sentences.length || 1;
  const syllableCount = syllables;
  
  const avgWordsPerSentence = wordCount / sentenceCount;
  const avgSyllablesPerWord = syllableCount / (wordCount || 1);
  
  const fleschReading = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
  const fleschKincaid = (0.39 * avgWordsPerSentence) + (11.8 * avgSyllablesPerWord) - 15.59;
  
  const complexWords = words.filter(w => countSyllables(w) >= 3).length;
  const gunningFog = 0.4 * (avgWordsPerSentence + (100 * complexWords / (wordCount || 1)));
  
  const characters = text.replace(/\s/g, '').length;
  const colemanLiau = (0.0588 * (characters / (wordCount || 1) * 100)) - (0.296 * (sentenceCount / (wordCount || 1) * 100)) - 15.8;
  
  return {
    fleschReading: Math.max(0, Math.min(100, Math.round(fleschReading * 10) / 10)),
    fleschKincaid: Math.max(0, Math.round(fleschKincaid * 10) / 10),
    gunningFog: Math.max(0, Math.round(gunningFog * 10) / 10),
    colemanLiau: Math.max(0, Math.round(colemanLiau * 10) / 10),
    wordCount,
    sentenceCount,
    avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
    avgSyllablesPerWord: Math.round(avgSyllablesPerWord * 100) / 100,
  };
}

function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

function getReadabilityLevel(score: number): { level: string; color: string } {
  if (score >= 90) return { level: "Very Easy", color: "text-green-600" };
  if (score >= 80) return { level: "Easy", color: "text-green-500" };
  if (score >= 70) return { level: "Fairly Easy", color: "text-lime-500" };
  if (score >= 60) return { level: "Standard", color: "text-yellow-500" };
  if (score >= 50) return { level: "Fairly Difficult", color: "text-orange-500" };
  if (score >= 30) return { level: "Difficult", color: "text-red-500" };
  return { level: "Very Difficult", color: "text-red-600" };
}

function getGradeLevel(grade: number): string {
  if (grade <= 5) return "5th grade or below";
  if (grade <= 8) return `${Math.round(grade)}th grade`;
  if (grade <= 12) return `${Math.round(grade)}th grade (High School)`;
  return "College level";
}

export function ReadabilityChecker() {
  const [content, setContent] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const scores = content.trim() ? calculateReadabilityScores(content) : null;

  const handleClear = useCallback(() => {
    if (content && confirm("Are you sure you want to clear all content?")) {
      setContent("");
      toast({ title: "Content cleared", description: "Your text has been cleared." });
    }
  }, [content, toast]);

  const handleCopy = useCallback(async () => {
    if (!scores) return;
    const report = `Readability Report:
Flesch Reading Ease: ${scores.fleschReading} (${getReadabilityLevel(scores.fleschReading).level})
Flesch-Kincaid Grade: ${scores.fleschKincaid} (${getGradeLevel(scores.fleschKincaid)})
Gunning Fog Index: ${scores.gunningFog}
Coleman-Liau Index: ${scores.colemanLiau}
Words: ${scores.wordCount}
Sentences: ${scores.sentenceCount}
Avg Words/Sentence: ${scores.avgWordsPerSentence}
Avg Syllables/Word: ${scores.avgSyllablesPerWord}`;
    
    try {
      await navigator.clipboard.writeText(report);
      setIsCopied(true);
      toast({ title: "Copied", description: "Report copied to clipboard." });
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  }, [scores, toast]);

  const readabilityInfo = scores ? getReadabilityLevel(scores.fleschReading) : null;

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">Readability Checker</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy} disabled={!scores} data-testid="button-copy">
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
          placeholder="Paste or type your text here to analyze its readability...

The tool will calculate multiple readability metrics including:
- Flesch Reading Ease score
- Flesch-Kincaid Grade Level
- Gunning Fog Index
- Coleman-Liau Index"
          className="min-h-[250px] font-mono text-sm resize-y"
          data-testid="textarea-content"
        />
      </Card>

      {scores && (
        <>
          <Card className="p-4">
            <h3 className="font-medium mb-4">Readability Score</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span>Flesch Reading Ease</span>
                  <span className={`font-bold ${readabilityInfo?.color}`}>{scores.fleschReading} - {readabilityInfo?.level}</span>
                </div>
                <Progress value={scores.fleschReading} className="h-3" />
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <h3 className="font-medium mb-3">Grade Level Metrics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Flesch-Kincaid Grade</span>
                  <span className="font-medium" data-testid="text-fk-grade">{scores.fleschKincaid}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gunning Fog Index</span>
                  <span className="font-medium" data-testid="text-fog">{scores.gunningFog}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Coleman-Liau Index</span>
                  <span className="font-medium" data-testid="text-cli">{scores.colemanLiau}</span>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground">Suggested audience: <span className="font-medium text-foreground">{getGradeLevel(scores.fleschKincaid)}</span></p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-medium mb-3">Text Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Words</span>
                  <span className="font-medium" data-testid="text-words">{scores.wordCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Sentences</span>
                  <span className="font-medium" data-testid="text-sentences">{scores.sentenceCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg Words/Sentence</span>
                  <span className="font-medium">{scores.avgWordsPerSentence}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg Syllables/Word</span>
                  <span className="font-medium">{scores.avgSyllablesPerWord}</span>
                </div>
              </div>
            </Card>
          </div>
        </>
      )}

      <Card className="p-4">
        <h3 className="font-medium mb-2">About Readability Scores</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>Flesch Reading Ease: 0-100 scale (higher = easier to read)</li>
          <li>Grade Level scores indicate the US school grade needed to understand the text</li>
          <li>Aim for 60-70 for general audiences, 70-80 for casual content</li>
          <li>Technical or academic writing may score lower (30-50)</li>
        </ul>
      </Card>
    </div>
  );
}
