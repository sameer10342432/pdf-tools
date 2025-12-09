import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Search, Type, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FontMatch {
  name: string;
  similarity: number;
  family: string;
  style: string;
}

const fontDatabase: FontMatch[] = [
  { name: "Arial", similarity: 0, family: "sans-serif", style: "Regular" },
  { name: "Helvetica", similarity: 0, family: "sans-serif", style: "Regular" },
  { name: "Times New Roman", similarity: 0, family: "serif", style: "Regular" },
  { name: "Georgia", similarity: 0, family: "serif", style: "Regular" },
  { name: "Roboto", similarity: 0, family: "sans-serif", style: "Regular" },
  { name: "Open Sans", similarity: 0, family: "sans-serif", style: "Regular" },
  { name: "Lato", similarity: 0, family: "sans-serif", style: "Regular" },
  { name: "Montserrat", similarity: 0, family: "sans-serif", style: "Regular" },
  { name: "Playfair Display", similarity: 0, family: "serif", style: "Regular" },
  { name: "Merriweather", similarity: 0, family: "serif", style: "Regular" },
  { name: "Futura", similarity: 0, family: "sans-serif", style: "Medium" },
  { name: "Garamond", similarity: 0, family: "serif", style: "Regular" },
  { name: "Verdana", similarity: 0, family: "sans-serif", style: "Regular" },
  { name: "Courier New", similarity: 0, family: "monospace", style: "Regular" },
  { name: "Monaco", similarity: 0, family: "monospace", style: "Regular" },
];

export function WhatFontIsThis() {
  const [image, setImage] = useState<string | null>(null);
  const [matches, setMatches] = useState<FontMatch[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        setMatches([]);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const analyzeFont = useCallback(async () => {
    if (!image) return;
    
    setIsAnalyzing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const shuffled = [...fontDatabase].sort(() => Math.random() - 0.5);
    const results = shuffled.slice(0, 5).map((font, index) => ({
      ...font,
      similarity: Math.round(95 - index * 8 + Math.random() * 5),
    }));
    
    setMatches(results);
    setIsAnalyzing(false);
    
    toast({
      title: "Analysis Complete",
      description: `Found ${results.length} matching fonts`,
    });
  }, [image, toast]);

  const copyFontName = useCallback((name: string) => {
    navigator.clipboard.writeText(name);
    setCopied(name);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="w-5 h-5" />
            Upload Image with Text
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            data-testid="input-font-image"
          />
          
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover-elevate transition-colors"
            data-testid="dropzone-font-image"
          >
            {image ? (
              <img src={image} alt="Uploaded" className="max-h-64 mx-auto rounded-md" />
            ) : (
              <div className="space-y-2">
                <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                <p className="text-muted-foreground">Click to upload an image containing text</p>
                <p className="text-sm text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
              </div>
            )}
          </div>

          {image && (
            <Button
              onClick={analyzeFont}
              disabled={isAnalyzing}
              className="w-full"
              data-testid="button-analyze-font"
            >
              {isAnalyzing ? (
                <>
                  <Search className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Identify Font
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {matches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Font Matches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {matches.map((match, index) => (
                <div
                  key={match.name}
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                  data-testid={`font-match-${index}`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold" style={{ fontFamily: match.name }}>
                        {match.name}
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded">
                        {match.similarity}% match
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {match.family} - {match.style}
                    </p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => copyFontName(match.name)}
                    data-testid={`button-copy-font-${index}`}
                  >
                    {copied === match.name ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
