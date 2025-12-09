import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Rss, ExternalLink, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FeedItem {
  title?: string;
  link?: string;
  pubDate?: string;
  creator?: string;
  content?: string;
  categories?: string[];
}

interface Feed {
  title?: string;
  description?: string;
  link?: string;
  image?: { url?: string };
  items: FeedItem[];
}

export function RssFeedReader() {
  const [url, setUrl] = useState("");
  const [feed, setFeed] = useState<Feed | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const parseFeed = async () => {
    if (!url.trim()) {
      toast({ title: "Please enter a feed URL", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/rss/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await response.json();
      
      if (data.success) {
        setFeed(data.feed);
        toast({ title: `Loaded ${data.feed.items.length} items` });
      } else {
        toast({ title: data.error || "Failed to parse feed", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Failed to parse RSS feed", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>RSS Feed URL</Label>
            <div className="flex gap-2">
              <Input
                placeholder="https://example.com/feed.xml"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && parseFeed()}
                data-testid="input-feed-url"
              />
              <Button onClick={parseFeed} disabled={isLoading} data-testid="button-parse">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => setUrl("https://feeds.bbci.co.uk/news/rss.xml")}>
              BBC News
            </Button>
            <Button size="sm" variant="outline" onClick={() => setUrl("https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml")}>
              NY Times
            </Button>
            <Button size="sm" variant="outline" onClick={() => setUrl("https://www.reddit.com/.rss")}>
              Reddit
            </Button>
          </div>

          {feed && (
            <div className="space-y-4">
              <div className="border-b pb-4">
                <div className="flex items-center gap-3">
                  {feed.image?.url && (
                    <img src={feed.image.url} alt="" className="w-12 h-12 rounded object-cover" />
                  )}
                  <div>
                    <h2 className="text-lg font-semibold" data-testid="text-feed-title">{feed.title}</h2>
                    {feed.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{feed.description}</p>
                    )}
                  </div>
                </div>
              </div>

              <ScrollArea className="h-[400px]">
                <div className="space-y-3 pr-4">
                  {feed.items.map((item, index) => (
                    <div key={index} className="p-3 border rounded-lg hover-elevate" data-testid={`item-feed-${index}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium hover:underline line-clamp-2"
                          >
                            {item.title}
                          </a>
                          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            {item.pubDate && <span>{formatDate(item.pubDate)}</span>}
                            {item.creator && <span>by {item.creator}</span>}
                          </div>
                          {item.content && (
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{item.content}</p>
                          )}
                        </div>
                        {item.link && (
                          <a href={item.link} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
                            <ExternalLink className="h-4 w-4 text-muted-foreground" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {!feed && !isLoading && (
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Rss className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Enter an RSS feed URL to read its content</p>
              <p className="text-sm text-muted-foreground mt-2">Or try one of the example feeds above</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
