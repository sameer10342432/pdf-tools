import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { BadgeCheck, Copy, Check, Trash2, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ValidationResult {
  email: string;
  isValid: boolean;
  issues: string[];
  suggestions?: string[];
}

const DISPOSABLE_DOMAINS = new Set([
  'tempmail.com', 'throwaway.com', 'mailinator.com', 'guerrillamail.com',
  '10minutemail.com', 'trashmail.com', 'fakeinbox.com', 'yopmail.com',
  'getnada.com', 'maildrop.cc', 'dispostable.com', 'mohmal.com'
]);

const COMMON_DOMAINS: Record<string, string> = {
  'gmial.com': 'gmail.com',
  'gmal.com': 'gmail.com',
  'gmai.com': 'gmail.com',
  'gamil.com': 'gmail.com',
  'gnail.com': 'gmail.com',
  'hotmal.com': 'hotmail.com',
  'hotmial.com': 'hotmail.com',
  'hotmil.com': 'hotmail.com',
  'outlok.com': 'outlook.com',
  'outloo.com': 'outlook.com',
  'yahooo.com': 'yahoo.com',
  'yaho.com': 'yahoo.com',
  'yahho.com': 'yahoo.com',
};

function validateEmail(email: string): ValidationResult {
  const trimmed = email.trim().toLowerCase();
  const issues: string[] = [];
  const suggestions: string[] = [];

  if (!trimmed) {
    return { email, isValid: false, issues: ['Empty email address'] };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    issues.push('Invalid email format');
  }

  const atCount = (trimmed.match(/@/g) || []).length;
  if (atCount === 0) {
    issues.push('Missing @ symbol');
  } else if (atCount > 1) {
    issues.push('Multiple @ symbols found');
  }

  const parts = trimmed.split('@');
  if (parts.length === 2) {
    const [local, domain] = parts;

    if (!local) {
      issues.push('Empty local part (before @)');
    } else if (local.length > 64) {
      issues.push('Local part too long (max 64 characters)');
    }

    if (!domain) {
      issues.push('Empty domain part (after @)');
    } else {
      if (!domain.includes('.')) {
        issues.push('Domain missing top-level domain (.com, .org, etc.)');
      }

      if (COMMON_DOMAINS[domain]) {
        issues.push(`Possible typo in domain`);
        suggestions.push(`Did you mean ${local}@${COMMON_DOMAINS[domain]}?`);
      }

      if (DISPOSABLE_DOMAINS.has(domain)) {
        issues.push('Disposable/temporary email domain detected');
      }

      if (/[^a-z0-9.-]/.test(domain)) {
        issues.push('Domain contains invalid characters');
      }

      if (domain.startsWith('.') || domain.endsWith('.')) {
        issues.push('Domain cannot start or end with a period');
      }

      if (domain.includes('..')) {
        issues.push('Domain contains consecutive periods');
      }
    }

    if (local) {
      if (/[^a-z0-9.!#$%&'*+/=?^_`{|}~-]/.test(local)) {
        issues.push('Local part contains unusual characters');
      }

      if (local.startsWith('.') || local.endsWith('.')) {
        issues.push('Local part cannot start or end with a period');
      }

      if (local.includes('..')) {
        issues.push('Local part contains consecutive periods');
      }
    }
  }

  return {
    email: trimmed,
    isValid: issues.length === 0,
    issues,
    suggestions: suggestions.length > 0 ? suggestions : undefined,
  };
}

export function EmailValidator() {
  const [singleEmail, setSingleEmail] = useState("");
  const [bulkEmails, setBulkEmails] = useState("");
  const [mode, setMode] = useState<"single" | "bulk">("single");
  const [results, setResults] = useState<ValidationResult[]>([]);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const handleValidate = useCallback(() => {
    if (mode === "single") {
      if (!singleEmail.trim()) return;
      setResults([validateEmail(singleEmail)]);
    } else {
      const emails = bulkEmails.split(/[\n,;]+/).filter(e => e.trim());
      if (emails.length === 0) return;
      setResults(emails.map(validateEmail));
    }
    toast({ title: "Validation complete", description: "Emails have been validated." });
  }, [mode, singleEmail, bulkEmails, toast]);

  const handleClear = useCallback(() => {
    setSingleEmail("");
    setBulkEmails("");
    setResults([]);
    toast({ title: "Cleared", description: "All content has been cleared." });
  }, [toast]);

  const handleCopyValid = useCallback(async () => {
    const validEmails = results.filter(r => r.isValid).map(r => r.email).join('\n');
    if (!validEmails) return;

    try {
      await navigator.clipboard.writeText(validEmails);
      setIsCopied(true);
      toast({ title: "Copied", description: "Valid emails copied to clipboard." });
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  }, [results, toast]);

  const validCount = results.filter(r => r.isValid).length;
  const invalidCount = results.filter(r => !r.isValid).length;

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <BadgeCheck className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">Email Validator</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant={mode === "single" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("single")}
              data-testid="button-mode-single"
            >
              Single
            </Button>
            <Button
              variant={mode === "bulk" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("bulk")}
              data-testid="button-mode-bulk"
            >
              Bulk
            </Button>
          </div>
        </div>

        {mode === "single" ? (
          <div className="space-y-4">
            <Input
              value={singleEmail}
              onChange={(e) => setSingleEmail(e.target.value)}
              placeholder="Enter an email address to validate..."
              type="email"
              data-testid="input-single-email"
            />
          </div>
        ) : (
          <Textarea
            value={bulkEmails}
            onChange={(e) => setBulkEmails(e.target.value)}
            placeholder="Enter multiple email addresses (one per line, or separated by commas)...

example@gmail.com
test@yahoo.com, user@outlook.com
another@company.org"
            className="min-h-[150px] font-mono text-sm resize-y"
            data-testid="textarea-bulk-emails"
          />
        )}

        <div className="flex gap-2 mt-4">
          <Button onClick={handleValidate} disabled={mode === "single" ? !singleEmail.trim() : !bulkEmails.trim()} data-testid="button-validate">
            <BadgeCheck className="h-4 w-4 mr-2" /> Validate
          </Button>
          <Button variant="outline" onClick={handleClear} data-testid="button-clear">
            <Trash2 className="h-4 w-4 mr-2" /> Clear
          </Button>
          {results.length > 0 && validCount > 0 && (
            <Button variant="outline" onClick={handleCopyValid} data-testid="button-copy-valid">
              {isCopied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
              Copy Valid ({validCount})
            </Button>
          )}
        </div>
      </Card>

      {results.length > 0 && (
        <Card className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <h3 className="font-medium">Validation Results</h3>
            <div className="flex gap-3 text-sm">
              <span className="text-green-600 flex items-center gap-1" data-testid="text-valid-count">
                <CheckCircle2 className="h-4 w-4" /> {validCount} valid
              </span>
              <span className="text-red-600 flex items-center gap-1" data-testid="text-invalid-count">
                <XCircle className="h-4 w-4" /> {invalidCount} invalid
              </span>
            </div>
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {results.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded-md border ${
                  result.isValid
                    ? 'border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800'
                    : 'border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800'
                }`}
              >
                <div className="flex items-start gap-2">
                  {result.isValid ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="font-mono text-sm" data-testid={`email-${index}`}>{result.email}</p>
                    {result.issues.length > 0 && (
                      <ul className="mt-1 space-y-0.5">
                        {result.issues.map((issue, i) => (
                          <li key={i} className="text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> {issue}
                          </li>
                        ))}
                      </ul>
                    )}
                    {result.suggestions && result.suggestions.map((suggestion, i) => (
                      <p key={i} className="text-sm text-blue-600 mt-1">{suggestion}</p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-4">
        <h3 className="font-medium mb-2">What We Check</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>RFC 5322 email format compliance</li>
          <li>Common typos in popular domains (gmail, yahoo, etc.)</li>
          <li>Disposable/temporary email detection</li>
          <li>Invalid characters and formatting issues</li>
        </ul>
      </Card>
    </div>
  );
}
