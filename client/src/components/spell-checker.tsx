import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Type, Copy, Check, Trash2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const COMMON_WORDS = new Set([
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "i", "it", "for", "not", "on", "with",
  "he", "as", "you", "do", "at", "this", "but", "his", "by", "from", "they", "we", "say", "her",
  "she", "or", "an", "will", "my", "one", "all", "would", "there", "their", "what", "so", "up",
  "out", "if", "about", "who", "get", "which", "go", "me", "when", "make", "can", "like", "time",
  "no", "just", "him", "know", "take", "people", "into", "year", "your", "good", "some", "could",
  "them", "see", "other", "than", "then", "now", "look", "only", "come", "its", "over", "think",
  "also", "back", "after", "use", "two", "how", "our", "work", "first", "well", "way", "even",
  "new", "want", "because", "any", "these", "give", "day", "most", "us", "is", "are", "was", "were",
  "been", "being", "has", "had", "does", "did", "done", "doing", "very", "more", "before", "such",
  "should", "must", "may", "might", "here", "through", "where", "while", "each", "still", "between",
  "under", "never", "same", "another", "however", "always", "those", "both", "much", "without",
  "during", "against", "until", "since", "already", "though", "often", "within", "toward", "upon"
]);

const COMMON_MISSPELLINGS: Record<string, string> = {
  "teh": "the", "recieve": "receive", "wierd": "weird", "occured": "occurred",
  "seperate": "separate", "definately": "definitely", "accomodate": "accommodate",
  "occassion": "occasion", "untill": "until", "begining": "beginning",
  "beleive": "believe", "calender": "calendar", "cemetary": "cemetery",
  "collegue": "colleague", "commitee": "committee", "concious": "conscious",
  "convienent": "convenient", "dilemna": "dilemma", "dissapear": "disappear",
  "dissapoint": "disappoint", "enviroment": "environment", "existance": "existence",
  "facinate": "fascinate", "flourescent": "fluorescent", "foriegn": "foreign",
  "goverment": "government", "gaurd": "guard", "harass": "harass",
  "harrass": "harass", "immediatly": "immediately", "independant": "independent",
  "knowlege": "knowledge", "liason": "liaison", "libary": "library",
  "lisence": "license", "maintainance": "maintenance", "millenium": "millennium",
  "mispell": "misspell", "neccessary": "necessary", "noticable": "noticeable",
  "occurance": "occurrence", "paralell": "parallel", "persistant": "persistent",
  "posession": "possession", "prefered": "preferred", "publically": "publicly",
  "recomend": "recommend", "refered": "referred", "relevent": "relevant",
  "resistence": "resistance", "rythm": "rhythm", "shedule": "schedule",
  "succesful": "successful", "supercede": "supersede", "surprize": "surprise",
  "tommorow": "tomorrow", "truely": "truly", "wich": "which", "writting": "writing"
};

interface SpellingIssue {
  word: string;
  suggestion?: string;
  index: number;
}

function checkSpelling(text: string): SpellingIssue[] {
  const issues: SpellingIssue[] = [];
  const words = text.match(/\b[a-zA-Z]+\b/g) || [];
  
  words.forEach((word, index) => {
    const lower = word.toLowerCase();
    
    if (COMMON_MISSPELLINGS[lower]) {
      issues.push({
        word,
        suggestion: COMMON_MISSPELLINGS[lower],
        index,
      });
    } else if (word.length > 2 && !COMMON_WORDS.has(lower)) {
      const vowels = lower.match(/[aeiou]/g)?.length || 0;
      const consonants = lower.match(/[bcdfghjklmnpqrstvwxyz]/g)?.length || 0;
      
      if (consonants > 0 && vowels === 0 && lower.length > 3) {
        issues.push({ word, index });
      }
      
      if (/(.)\1{2,}/.test(lower)) {
        issues.push({ word, index });
      }
      
      if (/[qwx]{2,}/.test(lower)) {
        issues.push({ word, index });
      }
    }
  });
  
  return issues;
}

export function SpellChecker() {
  const [content, setContent] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const issues = content.trim() ? checkSpelling(content) : [];
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

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

  const handleApplySuggestion = (issue: SpellingIssue) => {
    if (!issue.suggestion) return;
    const newContent = content.replace(new RegExp(`\\b${issue.word}\\b`), issue.suggestion);
    setContent(newContent);
    toast({ title: "Fixed", description: `Changed "${issue.word}" to "${issue.suggestion}"` });
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <Type className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">Spell Checker</span>
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
          placeholder="Paste or type your text here to check for spelling errors...

The tool checks for:
- Common misspellings
- Words with unusual letter patterns
- Repeated characters
- Missing vowels"
          className="min-h-[250px] font-mono text-sm resize-y"
          data-testid="textarea-content"
        />
      </Card>

      {content.trim() && (
        <Card className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <h3 className="font-medium">Spelling Check Results</h3>
            <div className="text-sm text-muted-foreground">
              <span data-testid="text-words">{wordCount} words</span> | 
              <span className={issues.length > 0 ? " text-red-600" : " text-green-600"} data-testid="text-issues">
                {" "}{issues.length} issue{issues.length !== 1 ? 's' : ''} found
              </span>
            </div>
          </div>
          
          {issues.length === 0 ? (
            <div className="flex items-center gap-2 text-green-600">
              <Check className="h-5 w-5" />
              <span>No spelling issues detected!</span>
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {issues.map((issue, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-md bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="font-medium text-red-700 dark:text-red-400">"{issue.word}"</span>
                    {issue.suggestion && (
                      <span className="text-muted-foreground">
                        {"→"} <span className="text-green-600">"{issue.suggestion}"</span>
                      </span>
                    )}
                  </div>
                  {issue.suggestion && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleApplySuggestion(issue)}
                      data-testid={`button-fix-${idx}`}
                    >
                      Fix
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      <Card className="p-4">
        <h3 className="font-medium mb-2">Spelling Tips</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>Double-check names and technical terms that may not be in the dictionary</li>
          <li>Remember: "I before E, except after C" (with exceptions)</li>
          <li>When in doubt, use a dictionary or search engine to verify spelling</li>
          <li>Read your text backwards word by word to catch spelling errors</li>
        </ul>
      </Card>
    </div>
  );
}
