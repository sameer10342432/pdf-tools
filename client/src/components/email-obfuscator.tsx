import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, RotateCcw, Mail, Code, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type ObfuscationType = "html-entities" | "javascript" | "css-reverse" | "rot13" | "at-dot-replacement" | "base64";

function emailToHtmlEntities(email: string): string {
  return email.split("").map(char => `&#${char.charCodeAt(0)};`).join("");
}

function emailToJavaScript(email: string): string {
  const parts = email.split("@");
  if (parts.length !== 2) return "";
  const [user, domain] = parts;
  return `<script>
  var user = "${user}";
  var domain = "${domain}";
  document.write('<a href="mailto:' + user + '@' + domain + '">' + user + '@' + domain + '</a>');
</script>`;
}

function emailToCssReverse(email: string): string {
  const reversed = email.split("").reverse().join("");
  return `<style>
  .obfuscated-email {
    unicode-bidi: bidi-override;
    direction: rtl;
  }
</style>
<span class="obfuscated-email">${reversed}</span>`;
}

function rot13(text: string): string {
  return text.replace(/[a-zA-Z]/g, (char) => {
    const code = char.charCodeAt(0);
    const base = code >= 97 ? 97 : 65;
    return String.fromCharCode(((code - base + 13) % 26) + base);
  });
}

function emailToRot13(email: string): string {
  const encoded = rot13(email);
  return `<script>
  function rot13(str) {
    return str.replace(/[a-zA-Z]/g, function(c) {
      return String.fromCharCode(
        (c <= 'Z' ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26
      );
    });
  }
  document.write('<a href="mailto:' + rot13("${encoded}") + '">' + rot13("${encoded}") + '</a>');
</script>`;
}

function emailToAtDot(email: string): string {
  return email.replace("@", " [at] ").replace(/\./g, " [dot] ");
}

function emailToBase64(email: string): string {
  const encoded = btoa(email);
  return `<script>
  var encoded = "${encoded}";
  var decoded = atob(encoded);
  document.write('<a href="mailto:' + decoded + '">' + decoded + '</a>');
</script>`;
}

export function EmailObfuscator() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [method, setMethod] = useState<ObfuscationType>("html-entities");
  const [output, setOutput] = useState("");
  const [preview, setPreview] = useState("");

  const obfuscate = useCallback(() => {
    if (!email.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Warning",
        description: "The entered email may not be valid",
      });
    }

    let result = "";
    let previewText = "";

    switch (method) {
      case "html-entities":
        result = `<a href="mailto:${emailToHtmlEntities(email)}">${emailToHtmlEntities(email)}</a>`;
        previewText = email;
        break;
      case "javascript":
        result = emailToJavaScript(email);
        previewText = email;
        break;
      case "css-reverse":
        result = emailToCssReverse(email);
        previewText = email;
        break;
      case "rot13":
        result = emailToRot13(email);
        previewText = email;
        break;
      case "at-dot-replacement":
        result = emailToAtDot(email);
        previewText = emailToAtDot(email);
        break;
      case "base64":
        result = emailToBase64(email);
        previewText = email;
        break;
    }

    setOutput(result);
    setPreview(previewText);
  }, [email, method, toast]);

  const copyToClipboard = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      toast({
        title: "Copied",
        description: "Obfuscated code copied to clipboard",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const reset = () => {
    setEmail("");
    setOutput("");
    setPreview("");
  };

  const methodDescriptions: Record<ObfuscationType, string> = {
    "html-entities": "Converts each character to HTML decimal entities. Bots that don't parse HTML won't see the email.",
    "javascript": "Generates JavaScript that constructs the email dynamically. Requires JS-enabled browsers.",
    "css-reverse": "Displays the email reversed visually but correct via CSS. Simple but effective against basic scrapers.",
    "rot13": "Uses ROT13 encoding with JavaScript decoding. Adds a layer of obfuscation.",
    "at-dot-replacement": "Replaces @ with [at] and . with [dot]. Human-readable but needs manual interpretation.",
    "base64": "Base64 encodes the email with JavaScript decoding. Strong obfuscation for most bots."
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Email Address</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@domain.com"
              data-testid="input-email"
            />
          </div>

          <div className="space-y-2">
            <Label>Obfuscation Method</Label>
            <Select value={method} onValueChange={(v) => setMethod(v as ObfuscationType)}>
              <SelectTrigger data-testid="select-method">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="html-entities">HTML Entities</SelectItem>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="css-reverse">CSS Reverse</SelectItem>
                <SelectItem value="rot13">ROT13</SelectItem>
                <SelectItem value="at-dot-replacement">[at] [dot] Replacement</SelectItem>
                <SelectItem value="base64">Base64</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">{methodDescriptions[method]}</p>
          </div>

          <Button onClick={obfuscate} className="w-full" data-testid="button-obfuscate">
            <Mail className="h-4 w-4 mr-2" /> Obfuscate Email
          </Button>
        </div>
      </Card>

      {output && (
        <>
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Code className="h-5 w-5 text-primary" />
                <Label className="font-medium text-lg">Obfuscated Code</Label>
              </div>
              <Textarea
                value={output}
                readOnly
                className="font-mono text-sm min-h-40"
                data-testid="output-code"
              />
              <Button variant="outline" onClick={copyToClipboard} data-testid="button-copy">
                <Copy className="h-4 w-4 mr-2" /> Copy Code
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                <Label className="font-medium text-lg">Preview (How users will see it)</Label>
              </div>
              <div className="p-4 bg-muted rounded-md">
                <p className="text-lg" data-testid="output-preview">{preview}</p>
              </div>
            </div>
          </Card>
        </>
      )}

      <Card className="p-6">
        <Label className="font-medium text-lg mb-4 block">Why Obfuscate Emails?</Label>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>Email harvesting bots crawl websites looking for email addresses to add to spam lists. By obfuscating your email, you make it harder for these bots to extract your address while keeping it readable for humans.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            <div className="p-3 bg-muted rounded">
              <p className="font-medium text-foreground">Best Protection</p>
              <p>JavaScript and Base64 methods offer the best protection as most bots don't execute JavaScript.</p>
            </div>
            <div className="p-3 bg-muted rounded">
              <p className="font-medium text-foreground">Best Compatibility</p>
              <p>HTML Entities work without JavaScript and display correctly in all browsers.</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button variant="outline" onClick={reset} data-testid="button-reset">
          <RotateCcw className="h-4 w-4 mr-2" /> Reset
        </Button>
      </div>
    </div>
  );
}
