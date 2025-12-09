import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Upload, Download, Copy, File, CheckCircle2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function ShareFilesOnline() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [sharedId, setSharedId] = useState("");
  const [downloadId, setDownloadId] = useState("");
  const [fileInfo, setFileInfo] = useState<{ filename: string; size: number; downloads: number } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 50 * 1024 * 1024) {
        toast({ title: "File size must be under 50MB", variant: "destructive" });
        return;
      }
      setFile(selectedFile);
    }
  };

  const uploadFile = async () => {
    if (!file) return;
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("expirationHours", "24");

      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setUploadProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      const response = await new Promise<any>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status === 200) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error("Upload failed"));
          }
        };
        xhr.onerror = () => reject(new Error("Upload failed"));
        xhr.open("POST", "/api/share-file");
        xhr.send(formData);
      });

      if (response.success) {
        setSharedId(response.id);
        toast({ title: "File uploaded successfully!" });
      }
    } catch {
      toast({ title: "Failed to upload file", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const getFileInfo = async () => {
    if (!downloadId.trim()) {
      toast({ title: "Please enter a file ID", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`/api/share-file/${downloadId}`);
      const data = await res.json();
      if (data.success) {
        setFileInfo({ filename: data.filename, size: data.size, downloads: data.downloads });
      } else {
        toast({ title: data.error || "File not found or expired", variant: "destructive" });
      }
    } catch {
      toast({ title: "Failed to get file info", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadFile = () => {
    window.open(`/api/share-file/${downloadId}/download`, "_blank");
  };

  const copyLink = () => {
    const link = `${window.location.origin}/tool/share-files-online?id=${sharedId}`;
    navigator.clipboard.writeText(link);
    toast({ title: "Link copied to clipboard!" });
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Upload className="h-5 w-5" /> Share a File
            </h3>
            <div
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
              onClick={() => fileInputRef.current?.click()}
              data-testid="dropzone"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                data-testid="input-file"
              />
              {file ? (
                <div className="space-y-2">
                  <File className="h-12 w-12 mx-auto text-primary" />
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">{formatSize(file.size)}</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    data-testid="button-remove-file"
                  >
                    <X className="h-4 w-4 mr-1" /> Remove
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">Click or drag file here</p>
                  <p className="text-sm text-muted-foreground">Max 50MB</p>
                </div>
              )}
            </div>
            {file && !sharedId && (
              <>
                {isUploading && (
                  <div className="space-y-2">
                    <Progress value={uploadProgress} data-testid="progress-upload" />
                    <p className="text-sm text-center text-muted-foreground">{uploadProgress}% uploaded</p>
                  </div>
                )}
                <Button onClick={uploadFile} disabled={isUploading} className="w-full" data-testid="button-upload">
                  <Upload className="h-4 w-4 mr-2" /> {isUploading ? "Uploading..." : "Upload & Share"}
                </Button>
              </>
            )}
            {sharedId && (
              <div className="p-4 bg-muted rounded-lg space-y-3">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">File Shared!</span>
                </div>
                <div className="flex gap-2">
                  <Input value={`${window.location.origin}/tool/share-files-online?id=${sharedId}`} readOnly className="text-sm" data-testid="input-share-link" />
                  <Button size="icon" variant="outline" onClick={copyLink} data-testid="button-copy-link">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">Link expires in 24 hours</p>
              </div>
            )}
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Download className="h-5 w-5" /> Download Shared File
            </h3>
            <div className="space-y-2">
              <Label>File ID</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter file ID"
                  value={downloadId}
                  onChange={(e) => setDownloadId(e.target.value)}
                  data-testid="input-download-id"
                />
                <Button onClick={getFileInfo} disabled={isLoading} data-testid="button-get-info">
                  Find
                </Button>
              </div>
            </div>
            {fileInfo && (
              <div className="p-4 bg-muted rounded-lg space-y-3">
                <div className="flex items-center gap-3">
                  <File className="h-10 w-10 text-primary" />
                  <div>
                    <p className="font-medium" data-testid="text-filename">{fileInfo.filename}</p>
                    <p className="text-sm text-muted-foreground">{formatSize(fileInfo.size)} | {fileInfo.downloads} downloads</p>
                  </div>
                </div>
                <Button onClick={downloadFile} className="w-full" data-testid="button-download">
                  <Download className="h-4 w-4 mr-2" /> Download File
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
