import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RefreshCw, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const wordLists: Record<string, string[]> = {
  common: ["the", "be", "to", "of", "and", "a", "in", "that", "have", "I", "it", "for", "not", "on", "with", "he", "as", "you", "do", "at", "this", "but", "his", "by", "from", "they", "we", "say", "her", "she", "or", "an", "will", "my", "one", "all", "would", "there", "their", "what", "so", "up", "out", "if", "about", "who", "get", "which", "go", "me"],
  nouns: ["time", "year", "people", "way", "day", "man", "thing", "woman", "life", "child", "world", "school", "state", "family", "student", "group", "country", "problem", "hand", "part", "place", "case", "week", "company", "system", "program", "question", "work", "government", "number", "night", "point", "home", "water", "room", "mother", "area", "money", "story", "fact", "month", "lot", "right", "study", "book", "eye", "job", "word", "business", "issue"],
  verbs: ["be", "have", "do", "say", "get", "make", "go", "know", "take", "see", "come", "think", "look", "want", "give", "use", "find", "tell", "ask", "work", "seem", "feel", "try", "leave", "call", "keep", "let", "begin", "seem", "help", "show", "hear", "play", "run", "move", "live", "believe", "hold", "bring", "happen", "write", "provide", "sit", "stand", "lose", "pay", "meet", "include", "continue", "set"],
  adjectives: ["good", "new", "first", "last", "long", "great", "little", "own", "other", "old", "right", "big", "high", "different", "small", "large", "next", "early", "young", "important", "few", "public", "bad", "same", "able", "best", "sure", "free", "better", "true", "whole", "real", "strong", "full", "beautiful", "simple", "clear", "happy", "difficult", "special", "possible", "open", "hard", "alone", "single", "perfect", "safe", "ready", "easy", "nice"],
  random: ["apple", "banana", "cherry", "dragon", "eagle", "forest", "garden", "harmony", "island", "jungle", "kingdom", "lighthouse", "mountain", "nebula", "ocean", "phoenix", "quantum", "rainbow", "sunshine", "thunder", "universe", "volcano", "waterfall", "xylophone", "zenith", "adventure", "brilliant", "cascade", "destiny", "eclipse", "fantasy", "galaxy", "horizon", "illusion", "journey", "kaleidoscope", "labyrinth", "mystical", "nostalgic", "odyssey", "paradise", "quintessence", "radiance", "serenity", "twilight", "utopia", "vibrant", "wanderlust", "zephyr", "azure"]
};

export function RandomWordGenerator() {
  const [count, setCount] = useState(5);
  const [wordType, setWordType] = useState("random");
  const [separator, setSeparator] = useState("newline");
  const [generatedWords, setGeneratedWords] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const generate = () => {
    const list = wordLists[wordType] || wordLists.random;
    const words: string[] = [];
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * list.length);
      words.push(list[randomIndex]);
    }
    setGeneratedWords(words);
  };

  const getSeparatedText = () => {
    switch (separator) {
      case "comma": return generatedWords.join(", ");
      case "space": return generatedWords.join(" ");
      case "semicolon": return generatedWords.join("; ");
      default: return generatedWords.join("\n");
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getSeparatedText());
      setCopied(true);
      toast({ title: "Copied to clipboard" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Number of Words</Label>
              <Input
                type="number"
                min={1}
                max={100}
                value={count}
                onChange={(e) => setCount(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
                data-testid="input-word-count"
              />
            </div>
            <div className="space-y-2">
              <Label>Word Type</Label>
              <Select value={wordType} onValueChange={setWordType}>
                <SelectTrigger data-testid="select-word-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="random">Random Words</SelectItem>
                  <SelectItem value="common">Common Words</SelectItem>
                  <SelectItem value="nouns">Nouns</SelectItem>
                  <SelectItem value="verbs">Verbs</SelectItem>
                  <SelectItem value="adjectives">Adjectives</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Separator</Label>
              <Select value={separator} onValueChange={setSeparator}>
                <SelectTrigger data-testid="select-separator">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newline">New Line</SelectItem>
                  <SelectItem value="comma">Comma</SelectItem>
                  <SelectItem value="space">Space</SelectItem>
                  <SelectItem value="semicolon">Semicolon</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={generate} className="w-full" data-testid="button-generate">
            <RefreshCw className="h-4 w-4 mr-2" />
            Generate Words
          </Button>
          {generatedWords.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Generated Words ({generatedWords.length})</Label>
                <Button size="sm" variant="outline" onClick={copyToClipboard} data-testid="button-copy">
                  {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
              <Textarea
                value={getSeparatedText()}
                readOnly
                className="min-h-[200px] font-mono"
                data-testid="textarea-result"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
