import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Share2, Eye, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function ShareTextOnline() {
  const [content, setContent] = useState("");
  const [expiration, setExpiration] = useState("24");
  const [sharedId, setSharedId] = useState("");
  const [viewId, setViewId] = useState("");
  const [viewedContent, setViewedContent] = useState<{ content: string; views: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const shareText = async () => {
    if (!content.trim()) {
      toast({ title: "Please enter some content", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/share-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, expirationHours: parseInt(expiration) }),
      });
      const data = await res.json();
      if (data.success) {
        setSharedId(data.id);
        toast({ title: "Text shared successfully!" });
      }
    } catch {
      toast({ title: "Failed to share text", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const viewText = async () => {
    if (!viewId.trim()) {
      toast({ title: "Please enter a share ID", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`/api/share-text/${viewId}`);
      const data = await res.json();
      if (data.success) {
        setViewedContent({ content: data.content, views: data.views });
      } else {
        toast({ title: data.error || "Text not found or expired", variant: "destructive" });
      }
    } catch {
      toast({ title: "Failed to retrieve text", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const copyLink = () => {
    const link = `${window.location.origin}/tool/share-text-online?id=${sharedId}`;
    navigator.clipboard.writeText(link);
    toast({ title: "Link copied to clipboard!" });
  };

  const copyContent = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Content copied!" });
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Share2 className="h-5 w-5" /> Share Text
            </h3>
            <div className="space-y-2">
              <Label>Content to Share</Label>
              <Textarea
                placeholder="Enter text, code, notes, or any content..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
                data-testid="textarea-share-content"
              />
            </div>
            <div className="space-y-2">
              <Label>Expires After</Label>
              <Select value={expiration} onValueChange={setExpiration}>
                <SelectTrigger data-testid="select-expiration">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 hour</SelectItem>
                  <SelectItem value="6">6 hours</SelectItem>
                  <SelectItem value="24">24 hours</SelectItem>
                  <SelectItem value="72">3 days</SelectItem>
                  <SelectItem value="168">7 days</SelectItem>
                  <SelectItem value="720">30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={shareText} disabled={isLoading} className="w-full" data-testid="button-share">
              <Share2 className="h-4 w-4 mr-2" /> {isLoading ? "Sharing..." : "Share Text"}
            </Button>
            {sharedId && (
              <div className="p-4 bg-muted rounded-lg space-y-3">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">Text Shared!</span>
                </div>
                <div className="flex gap-2">
                  <Input value={`${window.location.origin}/tool/share-text-online?id=${sharedId}`} readOnly className="text-sm" data-testid="input-share-link" />
                  <Button size="icon" variant="outline" onClick={copyLink} data-testid="button-copy-link">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Eye className="h-5 w-5" /> View Shared Text
            </h3>
            <div className="space-y-2">
              <Label>Share ID</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter share ID"
                  value={viewId}
                  onChange={(e) => setViewId(e.target.value)}
                  data-testid="input-view-id"
                />
                <Button onClick={viewText} disabled={isLoading} data-testid="button-view">
                  View
                </Button>
              </div>
            </div>
            {viewedContent && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Content</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Eye className="h-3 w-3" /> {viewedContent.views} views
                    </span>
                    <Button size="sm" variant="ghost" onClick={() => copyContent(viewedContent.content)} data-testid="button-copy-viewed">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Textarea value={viewedContent.content} readOnly rows={8} className="bg-muted font-mono text-sm" data-testid="textarea-viewed-content" />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
