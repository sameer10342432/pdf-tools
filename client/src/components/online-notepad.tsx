import { useState, useCallback, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Download, Trash2, Copy, Check, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const STORAGE_KEY = "online-notepad-content";

export function OnlineNotepad() {
  const [content, setContent] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setContent(saved);
      setLastSaved(new Date());
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (content) {
        localStorage.setItem(STORAGE_KEY, content);
        setLastSaved(new Date());
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [content]);

  const stats = {
    characters: content.length,
    words: content.trim() ? content.trim().split(/\s+/).length : 0,
    lines: content ? content.split("\n").length : 0,
    paragraphs: content.trim() ? content.split(/\n\s*\n/).filter(p => p.trim()).length : 0,
  };

  const handleClear = useCallback(() => {
    if (content && confirm("Are you sure you want to clear all content?")) {
      setContent("");
      localStorage.removeItem(STORAGE_KEY);
      toast({
        title: "Content cleared",
        description: "Your notepad has been cleared.",
      });
    }
  }, [content, toast]);

  const handleCopy = useCallback(async () => {
    if (!content) return;
    
    try {
      await navigator.clipboard.writeText(content);
      setIsCopied(true);
      toast({
        title: "Copied to clipboard",
        description: "Your notes have been copied.",
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy to clipboard.",
        variant: "destructive",
      });
    }
  }, [content, toast]);

  const handleDownload = useCallback(() => {
    if (!content) return;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `notes-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Downloaded",
      description: "Your notes have been downloaded as a text file.",
    });
  }, [content, toast]);

  const formatLastSaved = () => {
    if (!lastSaved) return null;
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastSaved.getTime()) / 1000);
    
    if (diff < 5) return "Just now";
    if (diff < 60) return `${diff} seconds ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    return lastSaved.toLocaleTimeString();
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">Notepad</span>
            {lastSaved && (
              <span className="text-xs text-muted-foreground">
                Saved {formatLastSaved()}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              disabled={!content}
              data-testid="button-copy"
            >
              {isCopied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
              {isCopied ? "Copied" : "Copy"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={!content}
              data-testid="button-download"
            >
              <Download className="h-4 w-4 mr-1" /> Download
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              disabled={!content}
              data-testid="button-clear"
            >
              <Trash2 className="h-4 w-4 mr-1" /> Clear
            </Button>
          </div>
        </div>

        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start typing your notes here...

Your content will be automatically saved to your browser.

Press Ctrl+S or Cmd+S to save manually (content auto-saves anyway)."
          className="min-h-[400px] font-mono text-sm resize-y"
          data-testid="textarea-content"
        />
      </Card>

      <Card className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold" data-testid="text-characters">{stats.characters.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Characters</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold" data-testid="text-words">{stats.words.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Words</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold" data-testid="text-lines">{stats.lines.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Lines</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold" data-testid="text-paragraphs">{stats.paragraphs.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Paragraphs</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-medium mb-2">Tips</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>Your notes are automatically saved to your browser as you type</li>
          <li>Use the Download button to save your notes as a .txt file</li>
          <li>Notes persist between sessions until you clear them</li>
          <li>This notepad works offline once the page is loaded</li>
        </ul>
      </Card>
    </div>
  );
}
