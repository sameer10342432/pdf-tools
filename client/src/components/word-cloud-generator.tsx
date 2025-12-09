import { useState, useCallback, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LayoutGrid, Copy, Check, Trash2, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const STOP_WORDS = new Set([
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with',
  'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her',
  'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up',
  'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time',
  'no', 'just', 'him', 'know', 'take', 'into', 'year', 'your', 'some', 'could', 'them', 'see',
  'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back',
  'after', 'use', 'two', 'how', 'our', 'first', 'well', 'way', 'even', 'new', 'want', 'because',
  'any', 'these', 'give', 'day', 'most', 'us', 'is', 'are', 'was', 'were', 'been', 'has', 'had',
  'more', 'very', 'such', 'should', 'may', 'each', 'much', 'am', "it's", "don't", "i'm", "you're"
]);

const COLOR_SCHEMES = {
  ocean: ['#0077b6', '#00b4d8', '#48cae4', '#90e0ef', '#023e8a'],
  sunset: ['#ff6b6b', '#ffa06b', '#ffd93d', '#ff8a5b', '#ea5455'],
  forest: ['#2d6a4f', '#40916c', '#52b788', '#74c69d', '#95d5b2'],
  purple: ['#7b2cbf', '#9d4edd', '#c77dff', '#e0aaff', '#5a189a'],
  monochrome: ['#212529', '#343a40', '#495057', '#6c757d', '#868e96'],
};

interface WordData {
  word: string;
  count: number;
  size: number;
  color: string;
}

function analyzeWords(text: string, colorScheme: string[]): WordData[] {
  const words = text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
  const wordCounts: Record<string, number> = {};
  
  words.forEach(word => {
    if (!STOP_WORDS.has(word)) {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    }
  });
  
  const sortedWords = Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 50);
  
  if (sortedWords.length === 0) return [];
  
  const maxCount = sortedWords[0][1];
  const minCount = sortedWords[sortedWords.length - 1][1];
  const range = maxCount - minCount || 1;
  
  return sortedWords.map(([word, count], index) => ({
    word,
    count,
    size: 14 + ((count - minCount) / range) * 36,
    color: colorScheme[index % colorScheme.length],
  }));
}

export function WordCloudGenerator() {
  const [content, setContent] = useState("");
  const [colorScheme, setColorScheme] = useState<keyof typeof COLOR_SCHEMES>("ocean");
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const wordData = useMemo(() => 
    content.trim() ? analyzeWords(content, COLOR_SCHEMES[colorScheme]) : [],
    [content, colorScheme]
  );

  const handleClear = useCallback(() => {
    if (content && confirm("Are you sure you want to clear all content?")) {
      setContent("");
      toast({ title: "Content cleared", description: "Your text has been cleared." });
    }
  }, [content, toast]);

  const handleCopy = useCallback(async () => {
    const wordList = wordData.map(w => `${w.word}: ${w.count}`).join('\n');
    if (!wordList) return;
    
    try {
      await navigator.clipboard.writeText(wordList);
      setIsCopied(true);
      toast({ title: "Copied", description: "Word frequency list copied to clipboard." });
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  }, [wordData, toast]);

  const handleDownload = useCallback(() => {
    const svg = document.getElementById('word-cloud-svg');
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'word-cloud.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({ title: "Downloaded", description: "Word cloud saved as SVG." });
  }, [toast]);

  const totalWords = content.trim() ? content.trim().split(/\s+/).length : 0;
  const uniqueWords = wordData.length;

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">Word Cloud Generator</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy} disabled={wordData.length === 0} data-testid="button-copy">
              {isCopied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
              {isCopied ? "Copied" : "Copy List"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload} disabled={wordData.length === 0} data-testid="button-download">
              <Download className="h-4 w-4 mr-1" /> Download
            </Button>
            <Button variant="outline" size="sm" onClick={handleClear} disabled={!content} data-testid="button-clear">
              <Trash2 className="h-4 w-4 mr-1" /> Clear
            </Button>
          </div>
        </div>
        
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Paste or type your text here to generate a word cloud...

The most frequent words will appear larger. Common words (the, is, and, etc.) are automatically filtered out."
          className="min-h-[150px] font-mono text-sm resize-y"
          data-testid="textarea-content"
        />
        
        <div className="mt-4">
          <label className="text-sm font-medium mb-2 block">Color Scheme</label>
          <Select value={colorScheme} onValueChange={(val) => setColorScheme(val as keyof typeof COLOR_SCHEMES)}>
            <SelectTrigger className="w-[200px]" data-testid="select-colors">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ocean">Ocean Blues</SelectItem>
              <SelectItem value="sunset">Sunset Warm</SelectItem>
              <SelectItem value="forest">Forest Greens</SelectItem>
              <SelectItem value="purple">Purple Haze</SelectItem>
              <SelectItem value="monochrome">Monochrome</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {wordData.length > 0 && (
        <Card className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Word Cloud</h3>
            <div className="text-sm text-muted-foreground">
              <span data-testid="text-total">{totalWords} total words</span> | 
              <span data-testid="text-unique"> {uniqueWords} unique words shown</span>
            </div>
          </div>
          
          <div className="bg-muted rounded-lg p-6 min-h-[300px] flex flex-wrap items-center justify-center gap-2" data-testid="word-cloud-container">
            <svg id="word-cloud-svg" width="100%" height="300" viewBox="0 0 600 300" className="hidden">
              {wordData.map((item, i) => (
                <text
                  key={i}
                  x={50 + (i % 5) * 110}
                  y={30 + Math.floor(i / 5) * 40}
                  fontSize={item.size}
                  fill={item.color}
                  fontFamily="Arial, sans-serif"
                >
                  {item.word}
                </text>
              ))}
            </svg>
            
            {wordData.map((item, index) => (
              <span
                key={index}
                style={{
                  fontSize: `${item.size}px`,
                  color: item.color,
                  fontWeight: item.count > 5 ? 'bold' : 'normal',
                  padding: '2px 6px',
                  transition: 'transform 0.2s',
                  cursor: 'default',
                }}
                className="hover:scale-110"
                title={`${item.word}: ${item.count} occurrences`}
                data-testid={`word-${index}`}
              >
                {item.word}
              </span>
            ))}
          </div>
        </Card>
      )}

      {wordData.length > 0 && (
        <Card className="p-4">
          <h3 className="font-medium mb-3">Top 10 Words</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {wordData.slice(0, 10).map((item, index) => (
              <div key={index} className="flex items-center justify-between p-2 rounded-md bg-muted">
                <span className="font-medium truncate" style={{ color: item.color }}>{item.word}</span>
                <span className="text-sm text-muted-foreground ml-2">{item.count}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-4">
        <h3 className="font-medium mb-2">About Word Clouds</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>Word size represents frequency - larger words appear more often</li>
          <li>Common stop words are filtered out automatically</li>
          <li>Only words with 3+ characters are included</li>
          <li>Download the cloud as SVG for use in presentations</li>
        </ul>
      </Card>
    </div>
  );
}
