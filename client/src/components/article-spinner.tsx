import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { RefreshCw, Copy, Check, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SYNONYMS: Record<string, string[]> = {
  "good": ["excellent", "great", "wonderful", "superb", "fine", "outstanding"],
  "bad": ["poor", "terrible", "awful", "dreadful", "unpleasant", "inferior"],
  "big": ["large", "huge", "enormous", "massive", "substantial", "significant"],
  "small": ["tiny", "little", "compact", "miniature", "petite", "minor"],
  "fast": ["quick", "rapid", "swift", "speedy", "hasty", "prompt"],
  "slow": ["sluggish", "gradual", "leisurely", "unhurried", "steady", "deliberate"],
  "happy": ["joyful", "pleased", "delighted", "content", "cheerful", "elated"],
  "sad": ["unhappy", "sorrowful", "melancholy", "gloomy", "dejected", "downcast"],
  "important": ["crucial", "essential", "vital", "significant", "critical", "key"],
  "difficult": ["challenging", "hard", "tough", "complex", "demanding", "arduous"],
  "easy": ["simple", "straightforward", "effortless", "uncomplicated", "basic", "elementary"],
  "beautiful": ["gorgeous", "stunning", "lovely", "attractive", "elegant", "exquisite"],
  "ugly": ["unattractive", "unsightly", "hideous", "unpleasant", "grotesque", "homely"],
  "old": ["ancient", "aged", "elderly", "vintage", "antique", "mature"],
  "new": ["fresh", "recent", "modern", "contemporary", "novel", "latest"],
  "start": ["begin", "commence", "initiate", "launch", "embark", "kick off"],
  "end": ["finish", "conclude", "terminate", "complete", "wrap up", "close"],
  "help": ["assist", "aid", "support", "facilitate", "contribute", "serve"],
  "make": ["create", "produce", "build", "construct", "develop", "generate"],
  "show": ["display", "demonstrate", "present", "reveal", "exhibit", "indicate"],
  "get": ["obtain", "acquire", "receive", "gain", "secure", "achieve"],
  "use": ["utilize", "employ", "apply", "implement", "leverage", "adopt"],
  "think": ["believe", "consider", "assume", "suppose", "reckon", "imagine"],
  "know": ["understand", "realize", "recognize", "comprehend", "grasp", "perceive"],
  "want": ["desire", "wish", "need", "require", "seek", "crave"],
  "like": ["enjoy", "prefer", "appreciate", "favor", "admire", "fancy"],
  "very": ["extremely", "highly", "incredibly", "remarkably", "exceptionally", "particularly"],
  "really": ["truly", "genuinely", "actually", "indeed", "certainly", "absolutely"],
  "also": ["additionally", "furthermore", "moreover", "too", "likewise", "besides"],
  "however": ["nevertheless", "nonetheless", "yet", "still", "though", "although"],
  "because": ["since", "as", "due to", "owing to", "given that", "considering"],
  "but": ["however", "yet", "although", "though", "nevertheless", "nonetheless"],
};

function spinText(text: string, intensity: number): string {
  const words = text.split(/(\s+)/);
  
  return words.map(word => {
    if (/^\s+$/.test(word)) return word;
    
    const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
    const punctuation = word.match(/[^a-zA-Z]+$/)?.[0] || '';
    const prefix = word.match(/^[^a-zA-Z]+/)?.[0] || '';
    const isCapitalized = /^[A-Z]/.test(word);
    
    if (SYNONYMS[cleanWord] && Math.random() < intensity / 100) {
      const synonyms = SYNONYMS[cleanWord];
      let newWord = synonyms[Math.floor(Math.random() * synonyms.length)];
      
      if (isCapitalized) {
        newWord = newWord.charAt(0).toUpperCase() + newWord.slice(1);
      }
      
      return prefix + newWord + punctuation;
    }
    
    return word;
  }).join('');
}

export function ArticleSpinner() {
  const [content, setContent] = useState("");
  const [spunContent, setSpunContent] = useState("");
  const [intensity, setIntensity] = useState(50);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const handleSpin = useCallback(() => {
    if (!content.trim()) return;
    const result = spinText(content, intensity);
    setSpunContent(result);
    toast({ title: "Text spun", description: "Your article has been rewritten." });
  }, [content, intensity, toast]);

  const handleClear = useCallback(() => {
    if ((content || spunContent) && confirm("Are you sure you want to clear all content?")) {
      setContent("");
      setSpunContent("");
      toast({ title: "Content cleared", description: "All text has been cleared." });
    }
  }, [content, spunContent, toast]);

  const handleCopy = useCallback(async () => {
    const textToCopy = spunContent || content;
    if (!textToCopy) return;
    
    try {
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      toast({ title: "Copied", description: "Text copied to clipboard." });
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  }, [content, spunContent, toast]);

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const spunWordCount = spunContent.trim() ? spunContent.trim().split(/\s+/).length : 0;

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">Article Spinner</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy} disabled={!content && !spunContent} data-testid="button-copy">
              {isCopied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
              {isCopied ? "Copied" : "Copy"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleClear} disabled={!content && !spunContent} data-testid="button-clear">
              <Trash2 className="h-4 w-4 mr-1" /> Clear
            </Button>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Original Text ({wordCount} words)</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste your original article here to spin it...

The spinner will replace words with synonyms to create unique variations of your content."
              className="min-h-[180px] font-mono text-sm resize-y"
              data-testid="textarea-content"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium">Spin Intensity: {intensity}%</label>
            </div>
            <Slider
              value={[intensity]}
              onValueChange={([val]) => setIntensity(val)}
              min={10}
              max={100}
              step={10}
              className="w-full"
              data-testid="slider-intensity"
            />
            <p className="text-xs text-muted-foreground">Higher intensity = more words replaced</p>
          </div>
          
          <Button onClick={handleSpin} disabled={!content.trim()} className="w-full" data-testid="button-spin">
            <RefreshCw className="h-4 w-4 mr-2" /> Spin Article
          </Button>
        </div>
      </Card>

      {spunContent && (
        <Card className="p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">Spun Result ({spunWordCount} words)</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setContent(spunContent);
                setSpunContent("");
              }}
              data-testid="button-use-result"
            >
              Use as Input
            </Button>
          </div>
          <Textarea
            value={spunContent}
            onChange={(e) => setSpunContent(e.target.value)}
            className="min-h-[180px] font-mono text-sm resize-y"
            data-testid="textarea-result"
          />
        </Card>
      )}

      <Card className="p-4">
        <h3 className="font-medium mb-2">About Article Spinning</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>Replaces words with synonyms to create unique content variations</li>
          <li>Higher intensity replaces more words but may affect readability</li>
          <li>Always review spun content for accuracy and coherence</li>
          <li>Use responsibly - original content is always preferred</li>
        </ul>
      </Card>
    </div>
  );
}
