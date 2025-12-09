import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Copy, Check, Youtube, Search, Tag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VideoInfo {
  videoId: string;
  title: string;
  description: string;
  tags: string[];
}

export function YoutubeTagExtractor() {
  const [url, setUrl] = useState("");
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const extractVideoId = (input: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
      /^([a-zA-Z0-9_-]{11})$/,
    ];
    
    for (const pattern of patterns) {
      const match = input.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const extractTags = async () => {
    const videoId = extractVideoId(url.trim());
    if (!videoId) {
      toast({ title: "Please enter a valid YouTube URL or video ID", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/youtube/tags/${videoId}`);
      const data = await response.json();
      
      if (data.success) {
        setVideoInfo(data);
        if (data.tags.length === 0) {
          toast({ title: "No tags found for this video" });
        } else {
          toast({ title: `Found ${data.tags.length} tags` });
        }
      } else {
        toast({ title: data.error || "Failed to extract tags", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Failed to extract tags", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const copyTags = async () => {
    if (!videoInfo?.tags.length) return;
    try {
      await navigator.clipboard.writeText(videoInfo.tags.join(", "));
      setCopied(true);
      toast({ title: "Tags copied to clipboard" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>YouTube Video URL or ID</Label>
            <div className="flex gap-2">
              <Input
                placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ or dQw4w9WgXcQ"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && extractTags()}
                data-testid="input-youtube-url"
              />
              <Button onClick={extractTags} disabled={isLoading} data-testid="button-extract">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {videoInfo ? (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-muted/30">
                <h3 className="font-semibold line-clamp-2" data-testid="text-video-title">{videoInfo.title}</h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{videoInfo.description}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-1">
                    <Tag className="h-4 w-4" />
                    Tags ({videoInfo.tags.length})
                  </Label>
                  {videoInfo.tags.length > 0 && (
                    <Button size="sm" variant="outline" onClick={copyTags} data-testid="button-copy">
                      {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                      {copied ? "Copied" : "Copy All"}
                    </Button>
                  )}
                </div>
                
                {videoInfo.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2 p-4 border rounded-lg min-h-[100px]" data-testid="container-tags">
                    {videoInfo.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" data-testid={`badge-tag-${index}`}>
                        {tag}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 border rounded-lg text-center text-muted-foreground">
                    No tags found for this video. The creator may not have added tags.
                  </div>
                )}
              </div>

              {videoInfo.tags.length > 0 && (
                <div className="space-y-2">
                  <Label>Tags as comma-separated text</Label>
                  <Textarea
                    value={videoInfo.tags.join(", ")}
                    readOnly
                    className="min-h-[100px]"
                    data-testid="textarea-tags"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Youtube className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Enter a YouTube video URL to extract its tags</p>
              <p className="text-sm text-muted-foreground mt-2">Tags are keywords that creators use to help videos get discovered</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
