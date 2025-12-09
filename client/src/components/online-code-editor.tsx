import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Code, Copy, Download, Sun, Moon, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Language = "javascript" | "typescript" | "python" | "html" | "css" | "json" | "sql" | "java" | "cpp" | "go" | "rust" | "php" | "ruby";

interface LanguageConfig {
  name: string;
  extension: string;
  keywords: string[];
  strings: RegExp;
  comments: RegExp;
  numbers: RegExp;
}

const languages: Record<Language, LanguageConfig> = {
  javascript: {
    name: "JavaScript",
    extension: "js",
    keywords: ["const", "let", "var", "function", "return", "if", "else", "for", "while", "class", "import", "export", "from", "async", "await", "try", "catch", "throw", "new", "this", "true", "false", "null", "undefined"],
    strings: /(["'`])(?:(?!\1)[^\\]|\\.)*\1/g,
    comments: /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm,
    numbers: /\b\d+\.?\d*\b/g,
  },
  typescript: {
    name: "TypeScript",
    extension: "ts",
    keywords: ["const", "let", "var", "function", "return", "if", "else", "for", "while", "class", "import", "export", "from", "async", "await", "try", "catch", "throw", "new", "this", "true", "false", "null", "undefined", "interface", "type", "enum", "implements", "extends", "private", "public", "protected"],
    strings: /(["'`])(?:(?!\1)[^\\]|\\.)*\1/g,
    comments: /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm,
    numbers: /\b\d+\.?\d*\b/g,
  },
  python: {
    name: "Python",
    extension: "py",
    keywords: ["def", "class", "return", "if", "elif", "else", "for", "while", "import", "from", "as", "try", "except", "finally", "raise", "with", "lambda", "yield", "True", "False", "None", "and", "or", "not", "in", "is", "pass", "break", "continue"],
    strings: /(["'`])(?:(?!\1)[^\\]|\\.)*\1/g,
    comments: /(#.*$)/gm,
    numbers: /\b\d+\.?\d*\b/g,
  },
  html: {
    name: "HTML",
    extension: "html",
    keywords: [],
    strings: /(["'])(?:(?!\1)[^\\]|\\.)*\1/g,
    comments: /(<!--[\s\S]*?-->)/g,
    numbers: /\b\d+\b/g,
  },
  css: {
    name: "CSS",
    extension: "css",
    keywords: ["@media", "@keyframes", "@import", "@font-face", "!important"],
    strings: /(["'])(?:(?!\1)[^\\]|\\.)*\1/g,
    comments: /(\/\*[\s\S]*?\*\/)/g,
    numbers: /\b\d+\.?\d*(px|em|rem|%|vh|vw|deg|s|ms)?\b/g,
  },
  json: {
    name: "JSON",
    extension: "json",
    keywords: ["true", "false", "null"],
    strings: /(["'])(?:(?!\1)[^\\]|\\.)*\1/g,
    comments: /$^/g,
    numbers: /\b\d+\.?\d*\b/g,
  },
  sql: {
    name: "SQL",
    extension: "sql",
    keywords: ["SELECT", "FROM", "WHERE", "INSERT", "INTO", "VALUES", "UPDATE", "SET", "DELETE", "CREATE", "TABLE", "DROP", "ALTER", "INDEX", "JOIN", "LEFT", "RIGHT", "INNER", "OUTER", "ON", "AND", "OR", "NOT", "NULL", "ORDER", "BY", "GROUP", "HAVING", "LIMIT", "OFFSET", "AS", "DISTINCT", "COUNT", "SUM", "AVG", "MIN", "MAX"],
    strings: /(["'])(?:(?!\1)[^\\]|\\.)*\1/g,
    comments: /(--.*$|\/\*[\s\S]*?\*\/)/gm,
    numbers: /\b\d+\.?\d*\b/g,
  },
  java: {
    name: "Java",
    extension: "java",
    keywords: ["public", "private", "protected", "class", "interface", "extends", "implements", "static", "final", "void", "int", "String", "boolean", "return", "if", "else", "for", "while", "try", "catch", "throw", "new", "this", "super", "import", "package", "true", "false", "null"],
    strings: /(["'])(?:(?!\1)[^\\]|\\.)*\1/g,
    comments: /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm,
    numbers: /\b\d+\.?\d*[fFdDlL]?\b/g,
  },
  cpp: {
    name: "C++",
    extension: "cpp",
    keywords: ["#include", "#define", "int", "char", "float", "double", "void", "bool", "class", "struct", "public", "private", "protected", "virtual", "const", "static", "return", "if", "else", "for", "while", "do", "switch", "case", "break", "continue", "new", "delete", "nullptr", "true", "false", "using", "namespace", "std"],
    strings: /(["'])(?:(?!\1)[^\\]|\\.)*\1/g,
    comments: /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm,
    numbers: /\b\d+\.?\d*[fFlL]?\b/g,
  },
  go: {
    name: "Go",
    extension: "go",
    keywords: ["package", "import", "func", "var", "const", "type", "struct", "interface", "return", "if", "else", "for", "range", "switch", "case", "default", "break", "continue", "go", "chan", "select", "defer", "make", "new", "nil", "true", "false", "map", "string", "int", "bool", "error"],
    strings: /(["'`])(?:(?!\1)[^\\]|\\.)*\1/g,
    comments: /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm,
    numbers: /\b\d+\.?\d*\b/g,
  },
  rust: {
    name: "Rust",
    extension: "rs",
    keywords: ["fn", "let", "mut", "const", "struct", "enum", "impl", "trait", "pub", "mod", "use", "return", "if", "else", "match", "for", "while", "loop", "break", "continue", "self", "Self", "true", "false", "Some", "None", "Ok", "Err", "Result", "Option", "String", "Vec", "Box"],
    strings: /(["'])(?:(?!\1)[^\\]|\\.)*\1/g,
    comments: /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm,
    numbers: /\b\d+\.?\d*[fFuUiI]*(8|16|32|64|128|size)?\b/g,
  },
  php: {
    name: "PHP",
    extension: "php",
    keywords: ["<?php", "?>", "echo", "print", "function", "return", "if", "else", "elseif", "for", "foreach", "while", "do", "switch", "case", "break", "continue", "class", "public", "private", "protected", "static", "new", "this", "self", "parent", "extends", "implements", "interface", "trait", "namespace", "use", "true", "false", "null", "array", "string", "int", "float", "bool"],
    strings: /(["'])(?:(?!\1)[^\\]|\\.)*\1/g,
    comments: /(\/\/.*$|#.*$|\/\*[\s\S]*?\*\/)/gm,
    numbers: /\b\d+\.?\d*\b/g,
  },
  ruby: {
    name: "Ruby",
    extension: "rb",
    keywords: ["def", "end", "class", "module", "return", "if", "elsif", "else", "unless", "case", "when", "for", "while", "until", "do", "begin", "rescue", "ensure", "raise", "yield", "block_given?", "self", "super", "true", "false", "nil", "require", "require_relative", "include", "extend", "attr_reader", "attr_writer", "attr_accessor", "private", "protected", "public"],
    strings: /(["'])(?:(?!\1)[^\\]|\\.)*\1/g,
    comments: /(#.*$)/gm,
    numbers: /\b\d+\.?\d*\b/g,
  },
};

const defaultCode: Record<Language, string> = {
  javascript: `// JavaScript Example
function greet(name) {
  const message = \`Hello, \${name}!\`;
  console.log(message);
  return message;
}

greet("World");`,
  typescript: `// TypeScript Example
interface User {
  name: string;
  age: number;
}

function greet(user: User): string {
  return \`Hello, \${user.name}!\`;
}`,
  python: `# Python Example
def greet(name: str) -> str:
    message = f"Hello, {name}!"
    print(message)
    return message

greet("World")`,
  html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Hello World</title>
</head>
<body>
  <h1>Hello, World!</h1>
</body>
</html>`,
  css: `/* CSS Example */
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f0f0;
}`,
  json: `{
  "name": "example",
  "version": "1.0.0",
  "description": "A sample JSON file",
  "dependencies": {
    "example-package": "^1.0.0"
  }
}`,
  sql: `-- SQL Example
SELECT users.name, orders.total
FROM users
INNER JOIN orders ON users.id = orders.user_id
WHERE orders.total > 100
ORDER BY orders.total DESC
LIMIT 10;`,
  java: `// Java Example
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
  cpp: `// C++ Example
#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`,
  go: `// Go Example
package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}`,
  rust: `// Rust Example
fn main() {
    let message = "Hello, World!";
    println!("{}", message);
}`,
  php: `<?php
// PHP Example
function greet($name) {
    echo "Hello, " . $name . "!";
}

greet("World");
?>`,
  ruby: `# Ruby Example
def greet(name)
  puts "Hello, #{name}!"
end

greet("World")`,
};

export function OnlineCodeEditor() {
  const [code, setCode] = useState(defaultCode.javascript);
  const [language, setLanguage] = useState<Language>("javascript");
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleLanguageChange = useCallback((lang: Language) => {
    setLanguage(lang);
    setCode(defaultCode[lang]);
  }, []);

  const highlightCode = useMemo(() => {
    const config = languages[language];
    let highlighted = code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    highlighted = highlighted.replace(config.comments, '<span class="text-green-500">$1</span>');
    highlighted = highlighted.replace(config.strings, '<span class="text-amber-500">$&</span>');
    highlighted = highlighted.replace(config.numbers, '<span class="text-purple-400">$&</span>');

    config.keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, "g");
      highlighted = highlighted.replace(regex, `<span class="text-blue-400 font-semibold">${keyword}</span>`);
    });

    return highlighted;
  }, [code, language]);

  const copyCode = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied!",
        description: "Code copied to clipboard",
      });
    });
  }, [code, toast]);

  const downloadCode = useCallback(() => {
    const config = languages[language];
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `code.${config.extension}`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }, [code, language]);

  const lines = code.split("\n");

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Code className="w-5 h-5" />
              Code Editor
            </div>
            <div className="flex items-center gap-2">
              <Select value={language} onValueChange={(v) => handleLanguageChange(v as Language)}>
                <SelectTrigger className="w-36" data-testid="select-language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(languages).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setTheme(t => t === "light" ? "dark" : "light")}
                data-testid="button-toggle-theme"
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`relative rounded-lg overflow-hidden border ${theme === "dark" ? "bg-slate-900" : "bg-slate-50"}`}
          >
            <div className="flex" style={{ minHeight: "400px" }}>
              <div
                className={`py-3 px-2 text-right select-none border-r ${theme === "dark" ? "bg-slate-800 text-slate-500 border-slate-700" : "bg-slate-100 text-slate-400 border-slate-200"}`}
                style={{ minWidth: "3rem" }}
              >
                {lines.map((_, i) => (
                  <div key={i} className="text-xs leading-6">{i + 1}</div>
                ))}
              </div>
              <div className="flex-1 relative">
                <pre
                  className={`absolute inset-0 p-3 overflow-auto font-mono text-sm leading-6 pointer-events-none whitespace-pre-wrap ${theme === "dark" ? "text-slate-200" : "text-slate-800"}`}
                  dangerouslySetInnerHTML={{ __html: highlightCode }}
                  data-testid="code-preview"
                />
                <Textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className={`w-full h-full min-h-[400px] p-3 font-mono text-sm leading-6 resize-none border-0 bg-transparent focus-visible:ring-0 ${theme === "dark" ? "text-transparent caret-white" : "text-transparent caret-black"}`}
                  spellCheck={false}
                  data-testid="code-input"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button onClick={copyCode} variant="outline" data-testid="button-copy-code">
              {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              {copied ? "Copied!" : "Copy Code"}
            </Button>
            <Button onClick={downloadCode} variant="outline" data-testid="button-download-code">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mt-3">
            Supports {Object.keys(languages).length} programming languages with syntax highlighting.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
