import { useState, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { FileUpload } from "@/components/file-upload";
import { ToolOptionsComponent } from "@/components/tool-options";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import {
  type PdfTool,
  type UploadedFile,
  type ToolOptions,
  type ProcessResponse,
  pdfTools,
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
  type LucideIcon,
} from "lucide-react";

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
};

type ProcessingState = "idle" | "uploading" | "processing" | "success" | "error";

export default function ToolPage() {
  const params = useParams<{ toolId: string }>();
  const [, navigate] = useLocation();
  const tool = pdfTools.find((t) => t.id === params.toolId);

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

  const handleFooterToolClick = useCallback((toolId: string) => {
    navigate(`/tool/${toolId}`);
  }, [navigate]);

  if (!tool) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Tool not found</h1>
            <Button onClick={() => navigate("/")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </main>
        <Footer onToolClick={handleFooterToolClick} />
      </div>
    );
  }

  const Icon = iconMap[tool.icon] || Layers;

  const getAcceptType = () => {
    if (tool.type === "images-to-pdf") {
      return "image/jpeg,image/png,image/gif,image/webp,.jpg,.jpeg,.png,.gif,.webp";
    }
    return ".pdf,application/pdf";
  };

  const isMultiFileAllowed = () => {
    return ["merge", "images-to-pdf"].includes(tool.type);
  };

  const needsMultipleFiles = () => {
    return ["merge", "merge-alternately"].includes(tool.type);
  };

  const getMinFiles = () => {
    if (tool.type === "merge") return 2;
    if (tool.type === "merge-alternately") return 2;
    return 1;
  };

  const canProcess = () => {
    if (files.length < getMinFiles()) return false;
    
    if (tool.type === "watermark" && !options.watermarkText?.trim()) {
      return false;
    }
    
    if (
      (tool.type === "split" || tool.type === "delete-pages") &&
      !options.pages?.trim()
    ) {
      return false;
    }

    if (tool.type === "protect" && !options.password?.trim()) {
      return false;
    }

    if (tool.type === "unlock" && !options.unlockPassword?.trim()) {
      return false;
    }
    
    return true;
  };

  const handleProcess = async () => {
    if (!canProcess()) return;

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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-8 md:py-12">
        <div className="max-w-3xl mx-auto px-4">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => navigate("/tools")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            All Tools
          </Button>

          <Card>
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center gap-4 mb-8">
                <div
                  className={`w-14 h-14 rounded-xl ${tool.color} flex items-center justify-center`}
                >
                  <Icon className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">{tool.name}</h1>
                  <p className="text-muted-foreground">{tool.description}</p>
                </div>
              </div>

              <div className="space-y-6">
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
                      <Button
                        onClick={handleProcess}
                        disabled={!canProcess()}
                        size="lg"
                        data-testid="button-process"
                      >
                        Process {tool.name.split(" ")[0]}
                      </Button>
                    </div>
                  </>
                )}

                {(processingState === "uploading" || processingState === "processing") && (
                  <div className="py-12 space-y-6">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                        <Loader2 className="h-10 w-10 text-primary animate-spin" />
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-xl">
                          {processingState === "uploading"
                            ? "Uploading files..."
                            : "Processing your PDF..."}
                        </p>
                        <p className="text-muted-foreground">
                          Please wait while we process your files
                        </p>
                      </div>
                    </div>
                    <Progress value={progress} className="h-3" data-testid="progress-bar" />
                  </div>
                )}

                {processingState === "success" && result && (
                  <div className="py-12 space-y-6">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center">
                        <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-xl" data-testid="text-success-message">
                          Processing Complete!
                        </p>
                        <p className="text-muted-foreground">
                          Your file is ready for download
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-center gap-3">
                      <Button variant="outline" onClick={resetState} size="lg" data-testid="button-process-another">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Process Another
                      </Button>
                      <Button onClick={handleDownload} size="lg" data-testid="button-download">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                )}

                {processingState === "error" && result && (
                  <div className="py-12 space-y-6">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
                        <AlertCircle className="h-10 w-10 text-destructive" />
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-xl">Processing Failed</p>
                        <p className="text-muted-foreground" data-testid="text-error-message">
                          {result.error || "An unexpected error occurred"}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-center gap-3">
                      <Button variant="outline" onClick={resetState} size="lg" data-testid="button-try-again">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Try Again
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer onToolClick={handleFooterToolClick} />
    </div>
  );
}
