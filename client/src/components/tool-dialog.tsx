import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileUpload } from "./file-upload";
import { ToolOptionsComponent } from "./tool-options";
import {
  type PdfTool,
  type UploadedFile,
  type ToolOptions,
  type ProcessResponse,
} from "@shared/schema";
import {
  Download,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Layers,
  Scissors,
  Archive,
  Image,
  FileImage,
  RotateCw,
  Trash2,
  Shuffle,
  Hash,
  Stamp,
  Lock,
  Unlock,
  HardDrive,
  Bookmark,
  FileText,
  SplitSquareHorizontal,
  Grid,
  FileOutput,
  FileSearch,
  Eraser,
  Target,
  Globe,
  FileSpreadsheet,
  BookOpen,
  LayoutGrid,
  Columns,
  Palette,
  Type,
  Link as LinkIcon,
  Unlink,
  Search,
  type LucideIcon,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

const iconMap: Record<string, LucideIcon> = {
  Layers,
  Scissors,
  Archive,
  Image,
  FileImage,
  RotateCw,
  Trash2,
  Shuffle,
  Hash,
  Stamp,
  Lock,
  Unlock,
  HardDrive,
  Bookmark,
  FileText,
  SplitSquareHorizontal,
  Grid,
  FileOutput,
  FileSearch,
  Eraser,
  Target,
  Globe,
  FileSpreadsheet,
  BookOpen,
  LayoutGrid,
  Columns,
  Palette,
  Type,
  Link: LinkIcon,
  Unlink,
  Search,
};

interface ToolDialogProps {
  tool: PdfTool | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ProcessingState = "idle" | "uploading" | "processing" | "success" | "error";

export function ToolDialog({ tool, open, onOpenChange }: ToolDialogProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [options, setOptions] = useState<ToolOptions>({});
  const [processingState, setProcessingState] = useState<ProcessingState>("idle");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ProcessResponse | null>(null);
  const [pageCount, setPageCount] = useState<number | undefined>();

  const resetState = useCallback(() => {
    setFiles([]);
    setOptions({});
    setProcessingState("idle");
    setProgress(0);
    setResult(null);
    setPageCount(undefined);
  }, []);

  const handleClose = useCallback(() => {
    onOpenChange(false);
    setTimeout(resetState, 300);
  }, [onOpenChange, resetState]);

  const getAcceptType = () => {
    if (!tool) return ".pdf";
    if (tool.type === "images-to-pdf") {
      return "image/jpeg,image/png,image/gif,image/webp,.jpg,.jpeg,.png,.gif,.webp";
    }
    return ".pdf,application/pdf";
  };

  const isMultiFileAllowed = () => {
    if (!tool) return true;
    return ["merge", "images-to-pdf"].includes(tool.type);
  };

  const needsMultipleFiles = () => {
    if (!tool) return false;
    return ["merge", "merge-alternately"].includes(tool.type);
  };

  const getMinFiles = () => {
    if (!tool) return 1;
    if (tool.type === "merge") return 2;
    if (tool.type === "merge-alternately") return 2;
    return 1;
  };

  const canProcess = () => {
    if (files.length < getMinFiles()) return false;
    
    if (tool?.type === "watermark" && !options.watermarkText?.trim()) {
      return false;
    }
    
    if (
      (tool?.type === "split" || tool?.type === "delete-pages") &&
      !options.pages?.trim()
    ) {
      return false;
    }
    
    return true;
  };

  const handleProcess = async () => {
    if (!tool || !canProcess()) return;

    setProcessingState("uploading");
    setProgress(10);

    try {
      const formData = new FormData();
      files.forEach((f) => {
        formData.append("files", f.file);
      });
      formData.append("toolType", tool.type);
      formData.append("options", JSON.stringify(options));

      setProgress(30);
      setProcessingState("processing");

      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 500);

      const response = await fetch("/api/process", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Processing failed");
      }

      const data: ProcessResponse = await response.json();
      
      setProgress(100);
      setResult(data);
      setProcessingState(data.success ? "success" : "error");
      
      if (data.pageCount) {
        setPageCount(data.pageCount);
      }
    } catch (error) {
      setProcessingState("error");
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "An error occurred",
      });
    }
  };

  const handleDownload = async () => {
    if (!result?.downloadUrl) return;
    
    try {
      const response = await fetch(result.downloadUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.filename || "processed.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  if (!tool) return null;

  const Icon = iconMap[tool.icon] || Layers;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-xl ${tool.color} flex items-center justify-center`}
            >
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl" data-testid="text-dialog-title">
                {tool.name}
              </DialogTitle>
              <DialogDescription data-testid="text-dialog-description">
                {tool.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          {processingState === "idle" && (
            <>
              <FileUpload
                accept={getAcceptType()}
                multiple={isMultiFileAllowed()}
                maxFiles={tool.type === "images-to-pdf" ? 50 : 20}
                files={files}
                onFilesChange={setFiles}
              />

              {files.length > 0 && (
                <ToolOptionsComponent
                  toolType={tool.type}
                  options={options}
                  onOptionsChange={setOptions}
                  pageCount={pageCount}
                />
              )}

              {needsMultipleFiles() && files.length < 2 && files.length > 0 && (
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  Please upload at least 2 files to proceed.
                </p>
              )}

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={handleClose} data-testid="button-cancel">
                  Cancel
                </Button>
                <Button
                  onClick={handleProcess}
                  disabled={!canProcess()}
                  data-testid="button-process"
                >
                  Process {tool.name.split(" ")[0]}
                </Button>
              </div>
            </>
          )}

          {(processingState === "uploading" || processingState === "processing") && (
            <div className="py-8 space-y-6">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-lg">
                    {processingState === "uploading"
                      ? "Uploading files..."
                      : "Processing your PDF..."}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Please wait while we process your files
                  </p>
                </div>
              </div>
              <Progress value={progress} className="h-2" data-testid="progress-bar" />
            </div>
          )}

          {processingState === "success" && result && (
            <div className="py-8 space-y-6">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-lg" data-testid="text-success-message">
                    Processing Complete!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Your file is ready for download
                  </p>
                </div>
              </div>
              <div className="flex justify-center gap-3">
                <Button variant="outline" onClick={resetState} data-testid="button-process-another">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Process Another
                </Button>
                <Button onClick={handleDownload} data-testid="button-download">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          )}

          {processingState === "error" && result && (
            <div className="py-8 space-y-6">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertCircle className="h-8 w-8 text-destructive" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-lg">Processing Failed</p>
                  <p className="text-sm text-muted-foreground" data-testid="text-error-message">
                    {result.error || "An unexpected error occurred"}
                  </p>
                </div>
              </div>
              <div className="flex justify-center gap-3">
                <Button variant="outline" onClick={resetState} data-testid="button-try-again">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
