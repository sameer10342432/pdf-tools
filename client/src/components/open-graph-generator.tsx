import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Check, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function OpenGraphGenerator() {
  const [ogType, setOgType] = useState("website");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [image, setImage] = useState("");
  const [siteName, setSiteName] = useState("");
  const [locale, setLocale] = useState("en_US");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const generateCode = () => {
    const tags: string[] = [];
    
    tags.push(`<meta property="og:type" content="${ogType}" />`);
    
    if (title) {
      tags.push(`<meta property="og:title" content="${title}" />`);
    }
    if (description) {
      tags.push(`<meta property="og:description" content="${description}" />`);
    }
    if (url) {
      tags.push(`<meta property="og:url" content="${url}" />`);
    }
    if (image) {
      tags.push(`<meta property="og:image" content="${image}" />`);
      tags.push(`<meta property="og:image:width" content="1200" />`);
      tags.push(`<meta property="og:image:height" content="630" />`);
    }
    if (siteName) {
      tags.push(`<meta property="og:site_name" content="${siteName}" />`);
    }
    if (locale) {
      tags.push(`<meta property="og:locale" content="${locale}" />`);
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={ogType} onValueChange={setOgType}>
                  <SelectTrigger data-testid="select-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="article">Article</SelectItem>
                    <SelectItem value="product">Product</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="music">Music</SelectItem>
                    <SelectItem value="book">Book</SelectItem>
                    <SelectItem value="profile">Profile</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Locale</Label>
                <Select value={locale} onValueChange={setLocale}>
                  <SelectTrigger data-testid="select-locale">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en_US">English (US)</SelectItem>
                    <SelectItem value="en_GB">English (UK)</SelectItem>
                    <SelectItem value="es_ES">Spanish</SelectItem>
                    <SelectItem value="fr_FR">French</SelectItem>
                    <SelectItem value="de_DE">German</SelectItem>
                    <SelectItem value="ja_JP">Japanese</SelectItem>
                    <SelectItem value="zh_CN">Chinese</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                placeholder="Page title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                data-testid="input-title"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Page description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                data-testid="input-description"
              />
            </div>
            <div className="space-y-2">
              <Label>URL</Label>
              <Input
                placeholder="https://example.com/page"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                data-testid="input-url"
              />
            </div>
            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input
                placeholder="https://example.com/image.jpg"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                data-testid="input-image"
              />
              <p className="text-xs text-muted-foreground">Recommended: 1200x630px</p>
            </div>
            <div className="space-y-2">
              <Label>Site Name</Label>
              <Input
                placeholder="Your Website Name"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                data-testid="input-site-name"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Preview (Facebook/LinkedIn style)</Label>
              <div className="border rounded-lg overflow-hidden bg-background">
                {image && (
                  <div className="aspect-video bg-muted">
                    <img src={image} alt="" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                  </div>
                )}
                <div className="p-3 bg-muted/30">
                  <p className="text-xs text-muted-foreground uppercase">{siteName || "example.com"}</p>
                  <p className="font-semibold mt-1 line-clamp-2">{title || "Page Title"}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{description || "Page description will appear here"}</p>
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
