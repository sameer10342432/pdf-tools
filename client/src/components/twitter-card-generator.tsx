import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Check, Twitter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function TwitterCardGenerator() {
  const [cardType, setCardType] = useState("summary_large_image");
  const [site, setSite] = useState("");
  const [creator, setCreator] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const generateCode = () => {
    const tags: string[] = [];
    
    tags.push(`<meta name="twitter:card" content="${cardType}" />`);
    
    if (site) {
      tags.push(`<meta name="twitter:site" content="${site.startsWith('@') ? site : '@' + site}" />`);
    }
    if (creator) {
      tags.push(`<meta name="twitter:creator" content="${creator.startsWith('@') ? creator : '@' + creator}" />`);
    }
    if (title) {
      tags.push(`<meta name="twitter:title" content="${title}" />`);
    }
    if (description) {
      tags.push(`<meta name="twitter:description" content="${description}" />`);
    }
    if (image) {
      tags.push(`<meta name="twitter:image" content="${image}" />`);
      tags.push(`<meta name="twitter:image:alt" content="${title || 'Image'}" />`);
    }
    
    return tags.join("\n");
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateCode());
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
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Card Type</Label>
              <Select value={cardType} onValueChange={setCardType}>
                <SelectTrigger data-testid="select-card-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">Summary</SelectItem>
                  <SelectItem value="summary_large_image">Summary Large Image</SelectItem>
                  <SelectItem value="app">App</SelectItem>
                  <SelectItem value="player">Player</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Site @username</Label>
              <Input
                placeholder="@yoursite"
                value={site}
                onChange={(e) => setSite(e.target.value)}
                data-testid="input-site"
              />
            </div>
            <div className="space-y-2">
              <Label>Creator @username</Label>
              <Input
                placeholder="@creator"
                value={creator}
                onChange={(e) => setCreator(e.target.value)}
                data-testid="input-creator"
              />
            </div>
            <div className="space-y-2">
              <Label>Title (max 70 characters)</Label>
              <Input
                placeholder="Page title"
                value={title}
                onChange={(e) => setTitle(e.target.value.slice(0, 70))}
                maxLength={70}
                data-testid="input-title"
              />
              <p className="text-xs text-muted-foreground">{title.length}/70</p>
            </div>
            <div className="space-y-2">
              <Label>Description (max 200 characters)</Label>
              <Textarea
                placeholder="Page description"
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 200))}
                maxLength={200}
                data-testid="input-description"
              />
              <p className="text-xs text-muted-foreground">{description.length}/200</p>
            </div>
            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input
                placeholder="https://example.com/image.jpg"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                data-testid="input-image"
              />
              <p className="text-xs text-muted-foreground">Recommended: 1200x628px for summary_large_image</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="border rounded-lg overflow-hidden bg-background">
                {cardType === "summary_large_image" && image ? (
                  <div className="aspect-video bg-muted">
                    <img src={image} alt="" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                  </div>
                ) : null}
                <div className="p-3">
                  <p className="text-sm text-muted-foreground truncate">{site ? site.replace('@', '') + '.com' : 'example.com'}</p>
                  <p className="font-medium truncate">{title || "Page Title"}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2">{description || "Page description will appear here"}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Generated Meta Tags</Label>
                <Button size="sm" variant="outline" onClick={copyToClipboard} data-testid="button-copy">
                  {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
              <Textarea
                value={generateCode()}
                readOnly
                className="min-h-[200px] font-mono text-sm"
                data-testid="textarea-code"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
