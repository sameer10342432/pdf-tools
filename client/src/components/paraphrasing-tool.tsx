import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PenTool, Copy, Check, Trash2, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PARAPHRASE_MODES = {
  standard: {
    label: "Standard",
    description: "Balanced rewriting",
  },
  formal: {
    label: "Formal",
    description: "Professional tone",
  },
  simple: {
    label: "Simplified",
    description: "Easier to understand",
  },
  creative: {
    label: "Creative",
    description: "More expressive",
  },
};

const WORD_REPLACEMENTS: Record<string, Record<string, string>> = {
  standard: {
    "use": "utilize", "get": "obtain", "make": "create", "show": "demonstrate",
    "help": "assist", "start": "begin", "end": "conclude", "think": "consider",
    "want": "desire", "need": "require", "like": "prefer", "give": "provide",
    "take": "acquire", "find": "discover", "know": "understand", "see": "observe",
    "come": "arrive", "go": "proceed", "say": "state", "tell": "inform",
    "ask": "inquire", "work": "function", "try": "attempt", "seem": "appear",
  },
  formal: {
    "use": "employ", "get": "acquire", "make": "construct", "show": "exhibit",
    "help": "facilitate", "start": "commence", "end": "terminate", "think": "deliberate",
    "want": "require", "need": "necessitate", "like": "favor", "give": "bestow",
    "take": "procure", "find": "ascertain", "know": "comprehend", "see": "perceive",
    "come": "approach", "go": "proceed", "say": "articulate", "tell": "convey",
    "ask": "request", "work": "operate", "try": "endeavor", "seem": "manifest",
    "good": "excellent", "bad": "inadequate", "big": "substantial", "small": "minimal",
  },
  simple: {
    "utilize": "use", "obtain": "get", "construct": "make", "demonstrate": "show",
    "facilitate": "help", "commence": "start", "terminate": "end", "deliberate": "think",
    "require": "need", "necessitate": "need", "endeavor": "try", "ascertain": "find",
    "comprehend": "know", "perceive": "see", "approach": "come", "proceed": "go",
    "articulate": "say", "convey": "tell", "inquire": "ask", "attempt": "try",
    "substantial": "big", "minimal": "small", "inadequate": "bad", "excellent": "good",
  },
  creative: {
    "use": "leverage", "get": "grab", "make": "craft", "show": "unveil",
    "help": "empower", "start": "kick off", "end": "wrap up", "think": "envision",
    "want": "crave", "need": "yearn for", "like": "adore", "give": "bestow",
    "take": "snag", "find": "uncover", "know": "grasp", "see": "witness",
    "come": "arrive", "go": "venture", "say": "proclaim", "tell": "share",
    "good": "fantastic", "bad": "dreadful", "big": "massive", "small": "tiny",
  },
};

function paraphraseText(text: string, mode: string): string {
  const replacements = WORD_REPLACEMENTS[mode] || WORD_REPLACEMENTS.standard;
  
  let result = text;
  Object.entries(replacements).forEach(([original, replacement]) => {
    const regex = new RegExp(`\\b${original}\\b`, 'gi');
    result = result.replace(regex, (match) => {
      const isCapitalized = match[0] === match[0].toUpperCase();
      return isCapitalized 
        ? replacement.charAt(0).toUpperCase() + replacement.slice(1)
        : replacement;
    });
  });
  
  const sentences = result.split(/(?<=[.!?])\s+/);
  result = sentences.map(sentence => {
    if (mode === 'formal' && !sentence.includes(',') && sentence.split(/\s+/).length > 8) {
      const words = sentence.split(/\s+/);
      const midpoint = Math.floor(words.length / 2);
      return [...words.slice(0, midpoint), ',', ...words.slice(midpoint)].join(' ').replace(' , ', ', ');
    }
    return sentence;
  }).join(' ');
  
  return result;
}

export function ParaphrasingTool() {
  const [content, setContent] = useState("");
  const [paraphrasedContent, setParaphrasedContent] = useState("");
  const [mode, setMode] = useState("standard");
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const handleParaphrase = useCallback(() => {
    if (!content.trim()) return;
    const result = paraphraseText(content, mode);
    setParaphrasedContent(result);
    toast({ title: "Text paraphrased", description: `Rewritten in ${PARAPHRASE_MODES[mode as keyof typeof PARAPHRASE_MODES].label} style.` });
  }, [content, mode, toast]);

  const handleClear = useCallback(() => {
    if ((content || paraphrasedContent) && confirm("Are you sure you want to clear all content?")) {
      setContent("");
      setParaphrasedContent("");
      toast({ title: "Content cleared", description: "All text has been cleared." });
    }
  }, [content, paraphrasedContent, toast]);

  const handleCopy = useCallback(async () => {
    const textToCopy = paraphrasedContent || content;
    if (!textToCopy) return;
    
    try {
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      toast({ title: "Copied", description: "Text copied to clipboard." });
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  }, [content, paraphrasedContent, toast]);

  const originalWordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const paraphrasedWordCount = paraphrasedContent.trim() ? paraphrasedContent.trim().split(/\s+/).length : 0;

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <PenTool className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">Paraphrasing Tool</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy} disabled={!content && !paraphrasedContent} data-testid="button-copy">
              {isCopied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
              {isCopied ? "Copied" : "Copy"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleClear} disabled={!content && !paraphrasedContent} data-testid="button-clear">
              <Trash2 className="h-4 w-4 mr-1" /> Clear
            </Button>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Original Text ({originalWordCount} words)</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter your text here to paraphrase...

The tool will rewrite your content while maintaining its meaning."
              className="min-h-[200px] font-mono text-sm resize-y"
              data-testid="textarea-content"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Paraphrased Text ({paraphrasedWordCount} words)</label>
            <Textarea
              value={paraphrasedContent}
              onChange={(e) => setParaphrasedContent(e.target.value)}
              placeholder="Paraphrased text will appear here..."
              className="min-h-[200px] font-mono text-sm resize-y"
              data-testid="textarea-result"
            />
          </div>
        </div>
        
        <div className="flex flex-wrap items-end gap-4 mt-4">
          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium mb-2 block">Writing Style</label>
            <Select value={mode} onValueChange={setMode}>
              <SelectTrigger data-testid="select-mode">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PARAPHRASE_MODES).map(([key, { label, description }]) => (
                  <SelectItem key={key} value={key}>
                    {label} - {description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button onClick={handleParaphrase} disabled={!content.trim()} data-testid="button-paraphrase">
            <ArrowRight className="h-4 w-4 mr-2" /> Paraphrase
          </Button>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-medium mb-2">Paraphrasing Styles</h3>
        <div className="grid md:grid-cols-2 gap-3 text-sm">
          {Object.entries(PARAPHRASE_MODES).map(([key, { label, description }]) => (
            <div key={key} className="flex items-start gap-2">
              <div className={`w-2 h-2 rounded-full mt-1.5 ${mode === key ? 'bg-primary' : 'bg-muted'}`} />
              <div>
                <span className="font-medium">{label}:</span>{' '}
                <span className="text-muted-foreground">{description}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-medium mb-2">Tips for Effective Paraphrasing</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>Always review and edit the paraphrased text for accuracy</li>
          <li>Combine multiple styles for varied content</li>
          <li>Use the result as a starting point, then add your own voice</li>
          <li>Ensure the meaning remains consistent with your intent</li>
        </ul>
      </Card>
    </div>
  );
}
