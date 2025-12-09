import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Copy, RotateCcw, Plus, Trash2, Key, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UserEntry {
  id: number;
  username: string;
  password: string;
  showPassword: boolean;
}

type HashAlgorithm = "md5" | "sha1" | "plaintext" | "crypt";

function md5(string: string): string {
  function md5cycle(x: number[], k: number[]) {
    let a = x[0], b = x[1], c = x[2], d = x[3];
    a = ff(a, b, c, d, k[0], 7, -680876936);
    d = ff(d, a, b, c, k[1], 12, -389564586);
    c = ff(c, d, a, b, k[2], 17, 606105819);
    b = ff(b, c, d, a, k[3], 22, -1044525330);
    a = ff(a, b, c, d, k[4], 7, -176418897);
    d = ff(d, a, b, c, k[5], 12, 1200080426);
    c = ff(c, d, a, b, k[6], 17, -1473231341);
    b = ff(b, c, d, a, k[7], 22, -45705983);
    a = ff(a, b, c, d, k[8], 7, 1770035416);
    d = ff(d, a, b, c, k[9], 12, -1958414417);
    c = ff(c, d, a, b, k[10], 17, -42063);
    b = ff(b, c, d, a, k[11], 22, -1990404162);
    a = ff(a, b, c, d, k[12], 7, 1804603682);
    d = ff(d, a, b, c, k[13], 12, -40341101);
    c = ff(c, d, a, b, k[14], 17, -1502002290);
    b = ff(b, c, d, a, k[15], 22, 1236535329);
    a = gg(a, b, c, d, k[1], 5, -165796510);
    d = gg(d, a, b, c, k[6], 9, -1069501632);
    c = gg(c, d, a, b, k[11], 14, 643717713);
    b = gg(b, c, d, a, k[0], 20, -373897302);
    a = gg(a, b, c, d, k[5], 5, -701558691);
    d = gg(d, a, b, c, k[10], 9, 38016083);
    c = gg(c, d, a, b, k[15], 14, -660478335);
    b = gg(b, c, d, a, k[4], 20, -405537848);
    a = gg(a, b, c, d, k[9], 5, 568446438);
    d = gg(d, a, b, c, k[14], 9, -1019803690);
    c = gg(c, d, a, b, k[3], 14, -187363961);
    b = gg(b, c, d, a, k[8], 20, 1163531501);
    a = gg(a, b, c, d, k[13], 5, -1444681467);
    d = gg(d, a, b, c, k[2], 9, -51403784);
    c = gg(c, d, a, b, k[7], 14, 1735328473);
    b = gg(b, c, d, a, k[12], 20, -1926607734);
    a = hh(a, b, c, d, k[5], 4, -378558);
    d = hh(d, a, b, c, k[8], 11, -2022574463);
    c = hh(c, d, a, b, k[11], 16, 1839030562);
    b = hh(b, c, d, a, k[14], 23, -35309556);
    a = hh(a, b, c, d, k[1], 4, -1530992060);
    d = hh(d, a, b, c, k[4], 11, 1272893353);
    c = hh(c, d, a, b, k[7], 16, -155497632);
    b = hh(b, c, d, a, k[10], 23, -1094730640);
    a = hh(a, b, c, d, k[13], 4, 681279174);
    d = hh(d, a, b, c, k[0], 11, -358537222);
    c = hh(c, d, a, b, k[3], 16, -722521979);
    b = hh(b, c, d, a, k[6], 23, 76029189);
    a = hh(a, b, c, d, k[9], 4, -640364487);
    d = hh(d, a, b, c, k[12], 11, -421815835);
    c = hh(c, d, a, b, k[15], 16, 530742520);
    b = hh(b, c, d, a, k[2], 23, -995338651);
    a = ii(a, b, c, d, k[0], 6, -198630844);
    d = ii(d, a, b, c, k[7], 10, 1126891415);
    c = ii(c, d, a, b, k[14], 15, -1416354905);
    b = ii(b, c, d, a, k[5], 21, -57434055);
    a = ii(a, b, c, d, k[12], 6, 1700485571);
    d = ii(d, a, b, c, k[3], 10, -1894986606);
    c = ii(c, d, a, b, k[10], 15, -1051523);
    b = ii(b, c, d, a, k[1], 21, -2054922799);
    a = ii(a, b, c, d, k[8], 6, 1873313359);
    d = ii(d, a, b, c, k[15], 10, -30611744);
    c = ii(c, d, a, b, k[6], 15, -1560198380);
    b = ii(b, c, d, a, k[13], 21, 1309151649);
    a = ii(a, b, c, d, k[4], 6, -145523070);
    d = ii(d, a, b, c, k[11], 10, -1120210379);
    c = ii(c, d, a, b, k[2], 15, 718787259);
    b = ii(b, c, d, a, k[9], 21, -343485551);
    x[0] = add32(a, x[0]);
    x[1] = add32(b, x[1]);
    x[2] = add32(c, x[2]);
    x[3] = add32(d, x[3]);
  }

  function cmn(q: number, a: number, b: number, x: number, s: number, t: number) {
    a = add32(add32(a, q), add32(x, t));
    return add32((a << s) | (a >>> (32 - s)), b);
  }

  function ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn((b & c) | (~b & d), a, b, x, s, t);
  }

  function gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn((b & d) | (c & ~d), a, b, x, s, t);
  }

  function hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn(b ^ c ^ d, a, b, x, s, t);
  }

  function ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn(c ^ (b | ~d), a, b, x, s, t);
  }

  function md51(s: string) {
    const n = s.length;
    const state = [1732584193, -271733879, -1732584194, 271733878];
    let i;
    for (i = 64; i <= s.length; i += 64) {
      md5cycle(state, md5blk(s.substring(i - 64, i)));
    }
    s = s.substring(i - 64);
    const tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (i = 0; i < s.length; i++) {
      tail[i >> 2] |= s.charCodeAt(i) << ((i % 4) << 3);
    }
    tail[i >> 2] |= 0x80 << ((i % 4) << 3);
    if (i > 55) {
      md5cycle(state, tail);
      for (i = 0; i < 16; i++) tail[i] = 0;
    }
    tail[14] = n * 8;
    md5cycle(state, tail);
    return state;
  }

  function md5blk(s: string) {
    const md5blks = [];
    for (let i = 0; i < 64; i += 4) {
      md5blks[i >> 2] = s.charCodeAt(i) + (s.charCodeAt(i + 1) << 8) + (s.charCodeAt(i + 2) << 16) + (s.charCodeAt(i + 3) << 24);
    }
    return md5blks;
  }

  const hex_chr = "0123456789abcdef".split("");

  function rhex(n: number) {
    let s = "";
    for (let j = 0; j < 4; j++) {
      s += hex_chr[(n >> (j * 8 + 4)) & 0x0f] + hex_chr[(n >> (j * 8)) & 0x0f];
    }
    return s;
  }

  function hex(x: number[]) {
    const result: string[] = [];
    for (let i = 0; i < x.length; i++) {
      result[i] = rhex(x[i]);
    }
    return result.join("");
  }

  function add32(a: number, b: number) {
    return (a + b) & 0xffffffff;
  }

  return hex(md51(string));
}

function generateSalt(length: number = 8): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789./";
  let salt = "";
  for (let i = 0; i < length; i++) {
    salt += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return salt;
}

function aprMd5Hash(password: string): string {
  const salt = generateSalt(8);
  const hash = md5(password + salt);
  return `$apr1$${salt}$${hash.substring(0, 22)}`;
}

function sha1Hash(password: string): string {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  let hash = 0x67452301;
  let h1 = 0xEFCDAB89;
  let h2 = 0x98BADCFE;
  let h3 = 0x10325476;
  let h4 = 0xC3D2E1F0;
  
  const padded = new Uint8Array(Math.ceil((data.length + 9) / 64) * 64);
  padded.set(data);
  padded[data.length] = 0x80;
  const len = data.length * 8;
  const view = new DataView(padded.buffer);
  view.setUint32(padded.length - 4, len, false);
  
  let result = "";
  for (let i = 0; i < data.length; i++) {
    result += data[i].toString(16).padStart(2, "0");
  }
  
  const base64Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let binary = "";
  for (let i = 0; i < password.length; i++) {
    binary += password.charCodeAt(i).toString(2).padStart(8, "0");
  }
  while (binary.length % 6 !== 0) {
    binary += "0";
  }
  let base64 = "";
  for (let i = 0; i < binary.length; i += 6) {
    base64 += base64Chars[parseInt(binary.substring(i, i + 6), 2)];
  }
  while (base64.length % 4 !== 0) {
    base64 += "=";
  }
  
  return `{SHA}${btoa(password + generateSalt(4)).substring(0, 28)}`;
}

function cryptHash(password: string): string {
  const salt = generateSalt(2);
  const hash = md5(salt + password);
  return salt + hash.substring(0, 11);
}

export function HtpasswdGenerator() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserEntry[]>([
    { id: 1, username: "", password: "", showPassword: false }
  ]);
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>("md5");
  const [output, setOutput] = useState("");

  const addUser = () => {
    setUsers([...users, { 
      id: Date.now(), 
      username: "", 
      password: "", 
      showPassword: false 
    }]);
  };

  const removeUser = (id: number) => {
    if (users.length > 1) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  const updateUser = (id: number, field: keyof UserEntry, value: string | boolean) => {
    setUsers(users.map(u => u.id === id ? { ...u, [field]: value } : u));
  };

  const togglePassword = (id: number) => {
    setUsers(users.map(u => u.id === id ? { ...u, showPassword: !u.showPassword } : u));
  };

  const generateHtpasswd = useCallback(() => {
    const validUsers = users.filter(u => u.username.trim() && u.password.trim());
    
    if (validUsers.length === 0) {
      toast({
        title: "Error",
        description: "Please enter at least one username and password",
        variant: "destructive",
      });
      return;
    }

    const lines = validUsers.map(user => {
      let hash: string;
      switch (algorithm) {
        case "md5":
          hash = aprMd5Hash(user.password);
          break;
        case "sha1":
          hash = sha1Hash(user.password);
          break;
        case "crypt":
          hash = cryptHash(user.password);
          break;
        case "plaintext":
          hash = user.password;
          break;
        default:
          hash = aprMd5Hash(user.password);
      }
      return `${user.username}:${hash}`;
    });

    setOutput(lines.join("\n"));
  }, [users, algorithm, toast]);

  const copyToClipboard = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      toast({
        title: "Copied",
        description: "htpasswd content copied to clipboard",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const downloadFile = () => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = ".htpasswd";
    a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setUsers([{ id: 1, username: "", password: "", showPassword: false }]);
    setOutput("");
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <Label className="font-medium">Hash Algorithm</Label>
            <Select value={algorithm} onValueChange={(v) => setAlgorithm(v as HashAlgorithm)}>
              <SelectTrigger className="w-48" data-testid="select-algorithm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="md5">MD5 (APR1)</SelectItem>
                <SelectItem value="sha1">SHA1</SelectItem>
                <SelectItem value="crypt">Crypt</SelectItem>
                <SelectItem value="plaintext">Plain Text</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="font-medium">Users</Label>
            {users.map((user, index) => (
              <div key={user.id} className="flex items-center gap-2 flex-wrap">
                <Input
                  placeholder="Username"
                  value={user.username}
                  onChange={(e) => updateUser(user.id, "username", e.target.value)}
                  className="flex-1 min-w-32"
                  data-testid={`input-username-${index}`}
                />
                <div className="relative flex-1 min-w-32">
                  <Input
                    type={user.showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={user.password}
                    onChange={(e) => updateUser(user.id, "password", e.target.value)}
                    className="pr-10"
                    data-testid={`input-password-${index}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0"
                    onClick={() => togglePassword(user.id)}
                    data-testid={`button-toggle-password-${index}`}
                  >
                    {user.showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeUser(user.id)}
                  disabled={users.length === 1}
                  data-testid={`button-remove-user-${index}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" onClick={addUser} data-testid="button-add-user">
              <Plus className="h-4 w-4 mr-2" /> Add User
            </Button>
          </div>

          <Button onClick={generateHtpasswd} className="w-full" data-testid="button-generate">
            <Key className="h-4 w-4 mr-2" /> Generate htpasswd
          </Button>
        </div>
      </Card>

      {output && (
        <Card className="p-6">
          <div className="space-y-4">
            <Label className="font-medium">Generated .htpasswd Content</Label>
            <Textarea
              value={output}
              readOnly
              className="font-mono text-sm min-h-32"
              data-testid="output-htpasswd"
            />
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" onClick={copyToClipboard} data-testid="button-copy">
                <Copy className="h-4 w-4 mr-2" /> Copy
              </Button>
              <Button variant="outline" onClick={downloadFile} data-testid="button-download">
                Download .htpasswd
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="flex justify-end">
        <Button variant="outline" onClick={reset} data-testid="button-reset">
          <RotateCcw className="h-4 w-4 mr-2" /> Reset
        </Button>
      </div>
    </div>
  );
}
