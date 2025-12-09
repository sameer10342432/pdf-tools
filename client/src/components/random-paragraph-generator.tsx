import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const loremWords = ["lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit", "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore", "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud", "exercitation", "ullamco", "laboris", "nisi", "aliquip", "ex", "ea", "commodo", "consequat", "duis", "aute", "irure", "in", "reprehenderit", "voluptate", "velit", "esse", "cillum", "fugiat", "nulla", "pariatur", "excepteur", "sint", "occaecat", "cupidatat", "non", "proident", "sunt", "culpa", "qui", "officia", "deserunt", "mollit", "anim", "id", "est", "laborum"];

const randomWords = ["adventure", "beautiful", "cascade", "destiny", "eclipse", "fantasy", "garden", "harmony", "island", "journey", "kingdom", "lighthouse", "mountain", "nebula", "ocean", "paradise", "quantum", "rainbow", "sunshine", "thunder", "universe", "volcano", "waterfall", "wonder", "zenith", "amazing", "brilliant", "creative", "delightful", "elegant", "fantastic", "graceful", "hopeful", "incredible", "joyful", "kindness", "luminous", "magical", "natural", "optimistic", "peaceful", "quality", "radiant", "serene", "tranquil", "unique", "vibrant", "wonderful", "youthful", "zealous"];

export function RandomParagraphGenerator() {
  const [paragraphCount, setParagraphCount] = useState(3);
  const [sentencesPerParagraph, setSentencesPerParagraph] = useState(5);
  const [wordsPerSentence, setWordsPerSentence] = useState(12);
  const [style, setStyle] = useState("lorem");
  const [generatedText, setGeneratedText] = useState("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const generateSentence = (wordCount: number, wordList: string[]): string => {
    const words: string[] = [];
    for (let i = 0; i < wordCount; i++) {
      const word = wordList[Math.floor(Math.random() * wordList.length)];
      words.push(i === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word);
    }
    return words.join(" ") + ".";
  };

  const generateParagraph = (sentenceCount: number, wordsPerSent: number, wordList: string[]): string => {
    const sentences: string[] = [];
    for (let i = 0; i < sentenceCount; i++) {
      const variance = Math.floor(Math.random() * 5) - 2;
      sentences.push(generateSentence(Math.max(5, wordsPerSent + variance), wordList));
    }
    return sentences.join(" ");
  };

  const generate = () => {
    const wordList = style === "lorem" ? loremWords : randomWords;
    const paragraphs: string[] = [];
    for (let i = 0; i < paragraphCount; i++) {
      paragraphs.push(generateParagraph(sentencesPerParagraph, wordsPerSentence, wordList));
    }
    setGeneratedText(paragraphs.join("\n\n"));
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedText);
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Paragraphs</Label>
              <Input
                type="number"
                min={1}
                max={20}
                value={paragraphCount}
                onChange={(e) => setParagraphCount(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
                data-testid="input-paragraph-count"
              />
            </div>
            <div className="space-y-2">
              <Label>Sentences per Paragraph</Label>
              <Input
                type="number"
                min={1}
                max={15}
                value={sentencesPerParagraph}
                onChange={(e) => setSentencesPerParagraph(Math.min(15, Math.max(1, parseInt(e.target.value) || 1)))}
                data-testid="input-sentences-count"
              />
            </div>
            <div className="space-y-2">
              <Label>Words per Sentence</Label>
              <Input
                type="number"
                min={5}
                max={25}
                value={wordsPerSentence}
                onChange={(e) => setWordsPerSentence(Math.min(25, Math.max(5, parseInt(e.target.value) || 5)))}
                data-testid="input-words-count"
              />
            </div>
            <div className="space-y-2">
              <Label>Style</Label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger data-testid="select-style">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lorem">Lorem Ipsum</SelectItem>
                  <SelectItem value="random">Random English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={generate} className="w-full" data-testid="button-generate">
            <RefreshCw className="h-4 w-4 mr-2" />
            Generate Paragraphs
          </Button>
          {generatedText && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Generated Text</Label>
                <Button size="sm" variant="outline" onClick={copyToClipboard} data-testid="button-copy">
                  {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
              <Textarea
                value={generatedText}
                readOnly
                className="min-h-[300px]"
                data-testid="textarea-result"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
