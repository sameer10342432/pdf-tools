import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Download, Youtube, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Thumbnail {
  quality: string;
  url: string;
  width: number;
  height: number;
}

export function YoutubeThumbnailDownloader() {
  const [url, setUrl] = useState("");
  const [thumbnails, setThumbnails] = useState<Thumbnail[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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

  const fetchThumbnails = async () => {
    const videoId = extractVideoId(url.trim());
    if (!videoId) {
      toast({ title: "Please enter a valid YouTube URL or video ID", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/youtube/thumbnail/${videoId}`);
      const data = await response.json();
      
      if (data.success) {
        setThumbnails(data.thumbnails);
        toast({ title: "Thumbnails loaded successfully" });
      } else {
        toast({ title: data.error || "Failed to get thumbnails", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Failed to fetch thumbnails", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadThumbnail = async (thumbnail: Thumbnail) => {
    try {
      const response = await fetch(thumbnail.url);
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `youtube-thumbnail-${thumbnail.quality}.jpg`;
      link.click();
      URL.revokeObjectURL(downloadUrl);
      toast({ title: `Downloaded ${thumbnail.quality} thumbnail` });
    } catch {
      window.open(thumbnail.url, "_blank");
    }
  };

  const qualityLabels: Record<string, string> = {
    maxresdefault: "Max Resolution (1280x720)",
    sddefault: "SD (640x480)",
    hqdefault: "HQ (480x360)",
    mqdefault: "MQ (320x180)",
    default: "Default (120x90)",
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
                onKeyDown={(e) => e.key === "Enter" && fetchThumbnails()}
                data-testid="input-youtube-url"
              />
              <Button onClick={fetchThumbnails} disabled={isLoading} data-testid="button-fetch">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {thumbnails.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {thumbnails.map((thumb) => (
                <div key={thumb.quality} className="border rounded-lg overflow-hidden" data-testid={`thumbnail-${thumb.quality}`}>
                  <div className="aspect-video bg-muted relative group">
                    <img
                      src={thumb.url}
                      alt={`${thumb.quality} thumbnail`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget.parentElement as HTMLElement).classList.add("hidden");
                      }}
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => downloadThumbnail(thumb)}
                        data-testid={`button-download-${thumb.quality}`}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="font-medium text-sm">{qualityLabels[thumb.quality] || thumb.quality}</p>
                    <p className="text-xs text-muted-foreground">{thumb.width}x{thumb.height}px</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Youtube className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Enter a YouTube video URL to download its thumbnails</p>
              <p className="text-sm text-muted-foreground mt-2">All available quality options will be shown</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
