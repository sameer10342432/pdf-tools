import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  FileEdit,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link,
  Heading1,
  Heading2,
  Quote,
  Download,
  Copy,
  Undo,
  Redo,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function OnlineWysiwygEditor() {
  const [content, setContent] = useState("<p>Start typing here...</p>");
  const editorRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  }, []);

  const handleFormat = useCallback((format: string) => {
    switch (format) {
      case "bold":
        execCommand("bold");
        break;
      case "italic":
        execCommand("italic");
        break;
      case "underline":
        execCommand("underline");
        break;
      case "strikethrough":
        execCommand("strikeThrough");
        break;
      case "ul":
        execCommand("insertUnorderedList");
        break;
      case "ol":
        execCommand("insertOrderedList");
        break;
      case "left":
        execCommand("justifyLeft");
        break;
      case "center":
        execCommand("justifyCenter");
        break;
      case "right":
        execCommand("justifyRight");
        break;
      case "h1":
        execCommand("formatBlock", "h1");
        break;
      case "h2":
        execCommand("formatBlock", "h2");
        break;
      case "quote":
        execCommand("formatBlock", "blockquote");
        break;
      case "link":
        const url = prompt("Enter URL:");
        if (url) execCommand("createLink", url);
        break;
      case "undo":
        execCommand("undo");
        break;
      case "redo":
        execCommand("redo");
        break;
    }
  }, [execCommand]);

  const getContent = useCallback(() => {
    return editorRef.current?.innerHTML || "";
  }, []);

  const exportAs = useCallback((format: "html" | "text" | "markdown") => {
    const html = getContent();
    let content = html;
    let filename = "document";
    let mimeType = "text/plain";

    if (format === "html") {
      content = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Document</title></head><body>${html}</body></html>`;
      filename = "document.html";
      mimeType = "text/html";
    } else if (format === "text") {
      const temp = document.createElement("div");
      temp.innerHTML = html;
      content = temp.textContent || temp.innerText || "";
      filename = "document.txt";
    } else if (format === "markdown") {
      content = html
        .replace(/<h1[^>]*>(.*?)<\/h1>/gi, "# $1\n\n")
        .replace(/<h2[^>]*>(.*?)<\/h2>/gi, "## $1\n\n")
        .replace(/<h3[^>]*>(.*?)<\/h3>/gi, "### $1\n\n")
        .replace(/<strong[^>]*>(.*?)<\/strong>/gi, "**$1**")
        .replace(/<b[^>]*>(.*?)<\/b>/gi, "**$1**")
        .replace(/<em[^>]*>(.*?)<\/em>/gi, "*$1*")
        .replace(/<i[^>]*>(.*?)<\/i>/gi, "*$1*")
        .replace(/<u[^>]*>(.*?)<\/u>/gi, "__$1__")
        .replace(/<s[^>]*>(.*?)<\/s>/gi, "~~$1~~")
        .replace(/<strike[^>]*>(.*?)<\/strike>/gi, "~~$1~~")
        .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, "[$2]($1)")
        .replace(/<ul[^>]*>/gi, "")
        .replace(/<\/ul>/gi, "\n")
        .replace(/<ol[^>]*>/gi, "")
        .replace(/<\/ol>/gi, "\n")
        .replace(/<li[^>]*>(.*?)<\/li>/gi, "- $1\n")
        .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, "> $1\n\n")
        .replace(/<p[^>]*>(.*?)<\/p>/gi, "$1\n\n")
        .replace(/<br[^>]*>/gi, "\n")
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&")
        .trim();
      filename = "document.md";
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = filename;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }, [getContent]);

  const copyToClipboard = useCallback(() => {
    const html = getContent();
    navigator.clipboard.writeText(html).then(() => {
      toast({
        title: "Copied!",
        description: "Content copied to clipboard as HTML",
      });
    });
  }, [getContent, toast]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileEdit className="w-5 h-5" />
            WYSIWYG Editor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-muted/30">
              <Button size="icon" variant="ghost" onClick={() => handleFormat("undo")} title="Undo" data-testid="button-undo">
                <Undo className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => handleFormat("redo")} title="Redo" data-testid="button-redo">
                <Redo className="w-4 h-4" />
              </Button>
              <div className="w-px h-6 bg-border mx-1" />
              <Button size="icon" variant="ghost" onClick={() => handleFormat("bold")} title="Bold" data-testid="button-bold">
                <Bold className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => handleFormat("italic")} title="Italic" data-testid="button-italic">
                <Italic className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => handleFormat("underline")} title="Underline" data-testid="button-underline">
                <Underline className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => handleFormat("strikethrough")} title="Strikethrough" data-testid="button-strikethrough">
                <Strikethrough className="w-4 h-4" />
              </Button>
              <div className="w-px h-6 bg-border mx-1" />
              <Button size="icon" variant="ghost" onClick={() => handleFormat("h1")} title="Heading 1" data-testid="button-h1">
                <Heading1 className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => handleFormat("h2")} title="Heading 2" data-testid="button-h2">
                <Heading2 className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => handleFormat("quote")} title="Quote" data-testid="button-quote">
                <Quote className="w-4 h-4" />
              </Button>
              <div className="w-px h-6 bg-border mx-1" />
              <Button size="icon" variant="ghost" onClick={() => handleFormat("ul")} title="Bullet List" data-testid="button-ul">
                <List className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => handleFormat("ol")} title="Numbered List" data-testid="button-ol">
                <ListOrdered className="w-4 h-4" />
              </Button>
              <div className="w-px h-6 bg-border mx-1" />
              <Button size="icon" variant="ghost" onClick={() => handleFormat("left")} title="Align Left" data-testid="button-align-left">
                <AlignLeft className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => handleFormat("center")} title="Align Center" data-testid="button-align-center">
                <AlignCenter className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => handleFormat("right")} title="Align Right" data-testid="button-align-right">
                <AlignRight className="w-4 h-4" />
              </Button>
              <div className="w-px h-6 bg-border mx-1" />
              <Button size="icon" variant="ghost" onClick={() => handleFormat("link")} title="Insert Link" data-testid="button-link">
                <Link className="w-4 h-4" />
              </Button>
            </div>

            <div
              ref={editorRef}
              contentEditable
              className="min-h-[400px] p-4 outline-none prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: content }}
              onInput={(e) => setContent((e.target as HTMLDivElement).innerHTML)}
              data-testid="wysiwyg-content"
            />
          </div>

          <div className="flex gap-2 mt-4">
            <Button onClick={copyToClipboard} variant="outline" data-testid="button-copy-html">
              <Copy className="w-4 h-4 mr-2" />
              Copy HTML
            </Button>
            <Select onValueChange={(v) => exportAs(v as "html" | "text" | "markdown")}>
              <SelectTrigger className="w-40" data-testid="select-export">
                <Download className="w-4 h-4 mr-2" />
                Export As
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="html">HTML</SelectItem>
                <SelectItem value="text">Plain Text</SelectItem>
                <SelectItem value="markdown">Markdown</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
