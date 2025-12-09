import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { AlignLeft, Copy, Check, Trash2, List } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function summarizeText(text: string, ratio: number, bulletPoints: boolean): string {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  if (sentences.length === 0) return text;
  
  const scoredSentences = sentences.map((sentence, index) => {
    let score = 0;
    
    if (index === 0) score += 3;
    if (index === sentences.length - 1) score += 2;
    
    const wordCount = sentence.split(/\s+/).length;
    if (wordCount >= 10 && wordCount <= 25) score += 2;
    
    const importantWords = ['important', 'key', 'main', 'primary', 'significant', 
      'crucial', 'essential', 'fundamental', 'critical', 'major', 'conclusion',
      'result', 'therefore', 'thus', 'hence', 'consequently', 'summary', 'overall'];
    importantWords.forEach(word => {
      if (sentence.toLowerCase().includes(word)) score += 1;
    });
    
    const numbers = sentence.match(/\d+/g);
    if (numbers) score += numbers.length * 0.5;
    
    const quotes = sentence.match(/["']/g);
    if (quotes) score += 1;
    
    return { sentence: sentence.trim(), score, index };
  });
  
  const numSentences = Math.max(1, Math.ceil(sentences.length * (ratio / 100)));
  
  const topSentences = scoredSentences
    .sort((a, b) => b.score - a.score)
    .slice(0, numSentences)
    .sort((a, b) => a.index - b.index);
  
  if (bulletPoints) {
    return topSentences.map(s => `• ${s.sentence}`).join('\n\n');
  }
  
  return topSentences.map(s => s.sentence).join(' ');
}

function extractKeyPoints(text: string): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  const keyPoints: string[] = [];
  
  const keywords = ['first', 'second', 'third', 'finally', 'importantly', 
    'key', 'main', 'primary', 'essential', 'crucial', 'must', 'should'];
  
  sentences.forEach(sentence => {
    const lower = sentence.toLowerCase();
    if (keywords.some(kw => lower.includes(kw))) {
      keyPoints.push(sentence.trim());
    }
  });
  
  if (keyPoints.length === 0 && sentences.length > 0) {
    return sentences.slice(0, Math.min(3, sentences.length)).map(s => s.trim());
  }
  
  return keyPoints.slice(0, 5);
}

export function TextSummarizer() {
  const [content, setContent] = useState("");
  const [summary, setSummary] = useState("");
  const [ratio, setRatio] = useState(30);
  const [bulletPoints, setBulletPoints] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const handleSummarize = useCallback(() => {
    if (!content.trim()) return;
    const result = summarizeText(content, ratio, bulletPoints);
    setSummary(result);
    toast({ title: "Text summarized", description: `Reduced to ~${ratio}% of original length.` });
  }, [content, ratio, bulletPoints, toast]);

  const handleClear = useCallback(() => {
    if ((content || summary) && confirm("Are you sure you want to clear all content?")) {
      setContent("");
      setSummary("");
      toast({ title: "Content cleared", description: "All text has been cleared." });
    }
  }, [content, summary, toast]);

  const handleCopy = useCallback(async () => {
    const textToCopy = summary || content;
    if (!textToCopy) return;
    
    try {
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      toast({ title: "Copied", description: "Summary copied to clipboard." });
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  }, [content, summary, toast]);

  const originalWordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const summaryWordCount = summary.trim() ? summary.trim().split(/\s+/).length : 0;
  const reductionPercent = originalWordCount > 0 
    ? Math.round((1 - summaryWordCount / originalWordCount) * 100) 
    : 0;

  const keyPoints = content.trim() ? extractKeyPoints(content) : [];

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <AlignLeft className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">Text Summarizer</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy} disabled={!content && !summary} data-testid="button-copy">
              {isCopied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
              {isCopied ? "Copied" : "Copy"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleClear} disabled={!content && !summary} data-testid="button-clear">
              <Trash2 className="h-4 w-4 mr-1" /> Clear
            </Button>
          </div>
        </div>
        
        <div>
          <label className="text-sm font-medium mb-2 block">Original Text ({originalWordCount} words)</label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste or type a long article, document, or text here to summarize...

The summarizer will extract the most important sentences based on:
- Position in the text
- Presence of key phrases
- Sentence structure and content"
            className="min-h-[200px] font-mono text-sm resize-y"
            data-testid="textarea-content"
          />
        </div>
        
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium">Summary Length: {ratio}%</label>
            </div>
            <Slider
              value={[ratio]}
              onValueChange={([val]) => setRatio(val)}
              min={10}
              max={70}
              step={5}
              className="w-full"
              data-testid="slider-ratio"
            />
            <p className="text-xs text-muted-foreground">Lower = shorter summary</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              variant={bulletPoints ? "default" : "outline"}
              size="sm"
              onClick={() => setBulletPoints(!bulletPoints)}
              data-testid="button-bullets"
            >
              <List className="h-4 w-4 mr-2" />
              Bullet Points
            </Button>
          </div>
        </div>
        
        <Button onClick={handleSummarize} disabled={!content.trim()} className="w-full mt-4" data-testid="button-summarize">
          <AlignLeft className="h-4 w-4 mr-2" /> Summarize Text
        </Button>
      </Card>

      {summary && (
        <Card className="p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium">Summary ({summaryWordCount} words)</h3>
            <span className="text-sm text-green-600" data-testid="text-reduction">
              {reductionPercent}% reduction
            </span>
          </div>
          <div className={`p-3 rounded-md bg-muted ${bulletPoints ? 'whitespace-pre-line' : ''}`}>
            <p className="text-sm" data-testid="text-summary">{summary}</p>
          </div>
        </Card>
      )}

      {keyPoints.length > 0 && (
        <Card className="p-4">
          <h3 className="font-medium mb-3">Key Points Detected</h3>
          <ul className="space-y-2">
            {keyPoints.map((point, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="text-primary font-medium">{index + 1}.</span>
                <span className="text-muted-foreground">{point}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card className="p-4">
        <h3 className="font-medium mb-2">How It Works</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>Analyzes sentence importance based on position, keywords, and structure</li>
          <li>Preserves the most informative sentences from your text</li>
          <li>Maintains original sentence order for coherent reading</li>
          <li>Adjust the summary length to get more or less detail</li>
        </ul>
      </Card>
    </div>
  );
}
