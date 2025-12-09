import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Clipboard, CheckCircle2, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function OnlineClipboard() {
  const [mode, setMode] = useState<"save" | "retrieve">("save");
  const [content, setContent] = useState("");
  const [code, setCode] = useState("");
  const [savedCode, setSavedCode] = useState("");
  const [retrievedContent, setRetrievedContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const saveToClipboard = async () => {
    if (!content.trim()) {
      toast({ title: "Please enter some content", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/clipboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (data.success) {
        setSavedCode(data.code);
        toast({ title: "Content saved to clipboard!" });
      }
    } catch {
      toast({ title: "Failed to save content", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const retrieveFromClipboard = async () => {
    if (!code.trim()) {
      toast({ title: "Please enter a code", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`/api/clipboard/${code}`);
      const data = await res.json();
      if (data.success) {
        setRetrievedContent(data.content);
        toast({ title: "Content retrieved!" });
      } else {
        toast({ title: data.error || "Code not found or expired", variant: "destructive" });
      }
    } catch {
      toast({ title: "Failed to retrieve content", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard!" });
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="flex gap-2">
            <Button
              variant={mode === "save" ? "default" : "outline"}
              onClick={() => setMode("save")}
              className="flex-1"
              data-testid="button-mode-save"
            >
              <Clipboard className="h-4 w-4 mr-2" /> Save Content
            </Button>
            <Button
              variant={mode === "retrieve" ? "default" : "outline"}
              onClick={() => setMode("retrieve")}
              className="flex-1"
              data-testid="button-mode-retrieve"
            >
              <ArrowRight className="h-4 w-4 mr-2" /> Retrieve Content
            </Button>
          </div>

          {mode === "save" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Content to Save</Label>
                <Textarea
                  placeholder="Paste or type your content here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={8}
                  data-testid="textarea-content"
                />
              </div>
              <Button onClick={saveToClipboard} disabled={isLoading} className="w-full" data-testid="button-save">
                {isLoading ? "Saving..." : "Save to Online Clipboard"}
              </Button>
              {savedCode && (
                <div className="p-4 bg-muted rounded-lg space-y-3">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-medium">Content Saved!</span>
                  </div>
                  <div className="space-y-2">
                    <Label>Your Access Code</Label>
                    <div className="flex gap-2">
                      <Input value={savedCode} readOnly className="font-mono text-lg" data-testid="input-saved-code" />
                      <Button size="icon" variant="outline" onClick={() => copyToClipboard(savedCode)} data-testid="button-copy-code">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">Share this code to access your content from any device. Expires in 24 hours.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {mode === "retrieve" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Enter Access Code</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter your code (e.g., AB12CD)"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="font-mono"
                    data-testid="input-code"
                  />
                  <Button onClick={retrieveFromClipboard} disabled={isLoading} data-testid="button-retrieve">
                    {isLoading ? "..." : "Get"}
                  </Button>
                </div>
              </div>
              {retrievedContent && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Retrieved Content</Label>
                    <Button size="sm" variant="ghost" onClick={() => copyToClipboard(retrievedContent)} data-testid="button-copy-content">
                      <Copy className="h-4 w-4 mr-1" /> Copy
                    </Button>
                  </div>
                  <Textarea value={retrievedContent} readOnly rows={8} className="bg-muted" data-testid="textarea-retrieved" />
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
