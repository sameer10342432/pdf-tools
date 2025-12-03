import { useState, useCallback, useEffect } from "react";
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
  HardDrive,
  Bookmark,
  FileText,
  SplitSquareHorizontal,
  Grid,
  FileOutput,
  FileSearch,
  Eraser,
  Target,
  FilePlus2,
  Copy,
  LayoutGrid,
  ArrowDownUp,
  ScanLine,
  Minimize2,
  Shrink,
  TrendingDown,
  Zap,
  Gauge,
  Wrench,
  Settings,
  Search,
  RefreshCcw,
  Hammer,
  ScanText,
  Eye,
  FilePlus,
  FileEdit,
  FileSpreadsheet,
  Globe,
  ImageDown,
  Type,
  MessageSquare,
  MessageCircle,
  MessageSquareDashed,
  Link,
  ExternalLink,
  Combine,
  Pencil,
  Pen,
  BookOpen,
  Columns,
  Palette,
  Unlink,
  PenTool,
  PenLine,
  FileSignature,
  FilePen,
  Send,
  ShieldCheck,
  Award,
  LockKeyhole,
  BadgeCheck,
  ShieldAlert,
  FileCheck,
  Maximize,
  Sparkles,
  Pipette,
  Film,
  Video,
  FileVideo,
  FlipVertical,
  FlipHorizontal,
  Sun,
  Contrast,
  ShieldOff,
  ZoomIn,
  Focus,
  Wand2,
  UserX,
  Table,
  Braces,
  Code,
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
  HardDrive,
  Bookmark,
  FileText,
  SplitSquareHorizontal,
  Grid,
  FileOutput,
  FileSearch,
  Eraser,
  Target,
  FilePlus2,
  Copy,
  LayoutGrid,
  ArrowDownUp,
  ScanLine,
  Minimize2,
  Shrink,
  TrendingDown,
  Zap,
  Gauge,
  Wrench,
  Settings,
  Search,
  RefreshCcw,
  Hammer,
  ScanText,
  Eye,
  FilePlus,
  FileEdit,
  FileSpreadsheet,
  Globe,
  ImageDown,
  Type,
  MessageSquare,
  MessageCircle,
  MessageSquareDashed,
  Link,
  ExternalLink,
  Combine,
  Pencil,
  Pen,
  BookOpen,
  Columns,
  Palette,
  Unlink,
  PenTool,
  Signature: PenLine,
  FileSignature,
  FilePen,
  Send,
  ShieldCheck,
  Award,
  LockKeyhole,
  BadgeCheck,
  ShieldAlert,
  FileCheck,
  Maximize,
  Sparkles,
  Pipette,
  Film,
  Video,
  FileVideo,
  FlipVertical,
  FlipHorizontal,
  Sun,
  Contrast,
  ShieldOff,
  ZoomIn,
  Focus,
  Wand2,
  UserX,
  Table,
  Braces,
  Code,
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

  useEffect(() => {
    if (tool) {
      document.title = tool.metaTitle;
      
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement("meta");
        metaDescription.setAttribute("name", "description");
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute("content", tool.metaDescription);

      return () => {
        document.title = "PDF Tools - Free Online PDF Editor";
        if (metaDescription) {
          metaDescription.setAttribute("content", "Free online PDF tools to merge, split, compress, convert, rotate, unlock and watermark PDFs.");
        }
      };
    }
  }, [tool]);

  useEffect(() => {
    if (tool?.type === "divide-pdf" && options.parts === undefined) {
      setOptions((prev) => ({ ...prev, parts: 2 }));
    }
    if (tool?.type === "split-by-size" && options.sizeLimitMB === undefined) {
      setOptions((prev) => ({ ...prev, sizeLimitMB: 5 }));
    }
    if (tool?.type === "split-every-x-pages" && options.pageInterval === undefined) {
      setOptions((prev) => ({ ...prev, pageInterval: 5 }));
    }
  }, [tool?.type, options.parts, options.sizeLimitMB, options.pageInterval]);

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
    if (tool.type === "images-to-pdf" || tool.type === "scan-to-pdf" || tool.type === "image-to-text") {
      return "image/jpeg,image/png,image/gif,image/webp,.jpg,.jpeg,.png,.gif,.webp";
    }
    if (tool.type === "pdf-images-combiner") {
      return ".pdf,application/pdf,image/jpeg,image/png,image/gif,image/webp,.jpg,.jpeg,.png,.gif,.webp";
    }
    if (tool.type === "add-image-to-pdf" || tool.type === "replace-image-in-pdf") {
      return ".pdf,application/pdf,image/jpeg,image/png,image/gif,image/webp,.jpg,.jpeg,.png,.gif,.webp";
    }
    if (tool.type === "pdf-word-merger") {
      return ".pdf,application/pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    }
    if (tool.type === "word-to-pdf" || tool.type === "docx-to-pdf" || tool.type === "doc-to-pdf") {
      return ".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    }
    if (tool.type === "powerpoint-to-pdf") {
      return ".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation";
    }
    if (tool.type === "ppt-to-pdf") {
      return ".ppt,application/vnd.ms-powerpoint";
    }
    if (tool.type === "pptx-to-pdf") {
      return ".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation";
    }
    if (tool.type === "excel-to-pdf") {
      return ".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    }
    if (tool.type === "xls-to-pdf") {
      return ".xls,application/vnd.ms-excel";
    }
    if (tool.type === "xlsx-to-pdf") {
      return ".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    }
    if (tool.type === "jpg-to-pdf") {
      return ".jpg,.jpeg,image/jpeg";
    }
    if (tool.type === "png-to-pdf") {
      return ".png,image/png";
    }
    if (tool.type === "bmp-to-pdf") {
      return ".bmp,image/bmp";
    }
    if (tool.type === "gif-to-pdf") {
      return ".gif,image/gif";
    }
    if (tool.type === "tiff-to-pdf") {
      return ".tiff,.tif,image/tiff";
    }
    if (tool.type === "heic-to-pdf") {
      return ".heic,.heif,image/heic,image/heif";
    }
    if (tool.type === "webp-to-pdf") {
      return ".webp,image/webp";
    }
    if (tool.type === "svg-to-pdf") {
      return ".svg,image/svg+xml";
    }
    if (tool.type === "html-to-pdf" || tool.type === "url-to-pdf" || tool.type === "webpage-to-pdf") {
      return ".html,.htm,text/html";
    }
    if (tool.type === "txt-to-pdf") {
      return ".txt,text/plain";
    }
    if (tool.type === "rtf-to-pdf") {
      return ".rtf,application/rtf,text/rtf";
    }
    // New Image Tools
    if (tool.type === "resize-heic") {
      return ".heic,.heif,image/heic,image/heif";
    }
    if (tool.type === "crop-image" || tool.type === "rotate-image" || tool.type === "watermark-image" || 
        tool.type === "add-text-to-image" || tool.type === "image-converter") {
      return "image/jpeg,image/png,image/gif,image/webp,image/bmp,.jpg,.jpeg,.png,.gif,.webp,.bmp,.heic,.heif";
    }
    if (tool.type === "crop-jpg") {
      return ".jpg,.jpeg,image/jpeg";
    }
    if (tool.type === "crop-png") {
      return ".png,image/png";
    }
    if (tool.type === "png-to-jpg") {
      return ".png,image/png";
    }
    if (tool.type === "jpg-to-png") {
      return ".jpg,.jpeg,image/jpeg";
    }
    if (tool.type === "heic-to-jpg") {
      return ".heic,.heif,image/heic,image/heif";
    }
    if (tool.type === "webp-to-jpg") {
      return ".webp,image/webp";
    }
    if (tool.type === "image-to-base64") {
      return "image/jpeg,image/png,image/gif,image/webp,image/bmp,image/svg+xml,.jpg,.jpeg,.png,.gif,.webp,.bmp,.svg";
    }
    if (tool.type === "base64-to-image") {
      return "*/*";
    }
    if (tool.type === "image-editor" || tool.type === "photo-editor") {
      return "image/jpeg,image/png,image/gif,image/webp,image/bmp,.jpg,.jpeg,.png,.gif,.webp,.bmp";
    }
    if (tool.type === "remove-image-background" || tool.type === "image-background-remover") {
      return "image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp";
    }
    if (tool.type === "convert-to-ico" || tool.type === "ico-converter") {
      return "image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif";
    }
    if (tool.type === "image-to-svg") {
      return "image/jpeg,image/png,image/bmp,image/webp,.jpg,.jpeg,.png,.bmp,.webp";
    }
    if (tool.type === "svg-to-png") {
      return ".svg,image/svg+xml";
    }
    if (tool.type === "upscale-image" || tool.type === "ai-image-upscaler") {
      return "image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp";
    }
    if (tool.type === "colorize-photo") {
      return "image/jpeg,image/png,image/webp,image/bmp,.jpg,.jpeg,.png,.webp,.bmp";
    }
    if (tool.type === "image-color-picker") {
      return "image/jpeg,image/png,image/webp,image/gif,image/bmp,.jpg,.jpeg,.png,.webp,.gif,.bmp";
    }
    if (tool.type === "gif-maker" || tool.type === "apng-maker") {
      return "image/jpeg,image/png,image/webp,image/bmp,.jpg,.jpeg,.png,.webp,.bmp";
    }
    if (tool.type === "video-to-gif") {
      return "video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov";
    }
    if (tool.type === "gif-to-mp4") {
      return ".gif,image/gif";
    }
    if (tool.type === "gif-to-png" || tool.type === "gif-to-jpg") {
      return ".gif,image/gif";
    }
    if (tool.type === "png-to-gif") {
      return ".png,image/png";
    }
    if (tool.type === "jpg-to-gif") {
      return ".jpg,.jpeg,image/jpeg";
    }
    if (tool.type === "bmp-to-jpg") {
      return ".bmp,image/bmp,image/x-ms-bmp";
    }
    if (tool.type === "jpg-to-bmp") {
      return ".jpg,.jpeg,image/jpeg";
    }
    if (tool.type === "tiff-to-jpg") {
      return ".tif,.tiff,image/tiff";
    }
    if (tool.type === "jpg-to-tiff") {
      return ".jpg,.jpeg,image/jpeg";
    }
    if (tool.type === "webp-to-png") {
      return ".webp,image/webp";
    }
    if (tool.type === "png-to-webp") {
      return ".png,image/png";
    }
    // New 10 Image Tools
    if (tool.type === "grayscale-image" || tool.type === "invert-image-colors" || 
        tool.type === "add-border-to-image" || tool.type === "round-image-corners" ||
        tool.type === "image-filter-sepia" || tool.type === "image-filter-vintage" ||
        tool.type === "image-filter-bw" || tool.type === "meme-generator" ||
        tool.type === "add-text-to-photo" || tool.type === "split-image") {
      return "image/jpeg,image/png,image/gif,image/webp,.jpg,.jpeg,.png,.gif,.webp";
    }
    // New 10 Image Tools
    if (tool.type === "merge-images" || tool.type === "image-combiner-horizontal" ||
        tool.type === "image-combiner-vertical") {
      return "image/jpeg,image/png,image/gif,image/webp,image/bmp,.jpg,.jpeg,.png,.gif,.webp,.bmp";
    }
    if (tool.type === "favicon-generator") {
      return "image/jpeg,image/png,image/gif,image/webp,image/bmp,image/svg+xml,.jpg,.jpeg,.png,.gif,.webp,.bmp,.svg";
    }
    if (tool.type === "ico-to-png") {
      return ".ico,image/x-icon,image/vnd.microsoft.icon";
    }
    if (tool.type === "png-to-ico") {
      return ".png,image/png";
    }
    if (tool.type === "apng-to-gif") {
      return ".png,image/png,image/apng";
    }
    if (tool.type === "gif-to-apng") {
      return ".gif,image/gif";
    }
    if (tool.type === "image-to-ascii" || tool.type === "image-metadata-viewer") {
      return "image/jpeg,image/png,image/gif,image/webp,.jpg,.jpeg,.png,.gif,.webp";
    }
    // New 10 Advanced Image Tools
    if (tool.type === "remove-image-metadata" || tool.type === "image-color-corrector" ||
        tool.type === "change-image-dpi" || tool.type === "image-enlarger" ||
        tool.type === "image-deblur" || tool.type === "ai-photo-retouch" ||
        tool.type === "ai-object-remover" || tool.type === "image-to-sketch") {
      return "image/jpeg,image/png,image/gif,image/webp,image/bmp,image/tiff,.jpg,.jpeg,.png,.gif,.webp,.bmp,.tiff,.tif";
    }
    if (tool.type === "ai-face-swapper") {
      return "image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp";
    }
    if (tool.type === "ai-image-generator") {
      return "*/*";
    }
    // New 10 Conversion Tools
    if (tool.type === "image-to-painting" || tool.type === "image-color-palette" || tool.type === "image-histogram") {
      return "image/jpeg,image/png,image/gif,image/webp,image/bmp,.jpg,.jpeg,.png,.gif,.webp,.bmp";
    }
    if (tool.type === "word-to-txt" || tool.type === "word-to-html") {
      return ".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    }
    if (tool.type === "txt-to-word") {
      return ".txt,text/plain";
    }
    if (tool.type === "html-to-word") {
      return ".html,.htm,text/html";
    }
    if (tool.type === "excel-to-csv" || tool.type === "excel-to-json") {
      return ".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    }
    if (tool.type === "csv-to-excel") {
      return ".csv,text/csv,application/csv";
    }
    if (tool.type === "json-to-excel" || tool.type === "json-to-csv" || tool.type === "json-viewer") {
      return ".json,application/json";
    }
    if (tool.type === "ppt-to-jpg" || tool.type === "ppt-to-video") {
      return ".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation";
    }
    if (tool.type === "word-counter" || tool.type === "text-editor") {
      return ".txt,.doc,.docx,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    }
    if (tool.type === "markdown-editor") {
      return ".md,.markdown,text/markdown,text/plain";
    }

    if (tool.type === "csv-to-json") {
      return ".csv,text/csv,application/csv";
    }
    if (tool.type === "odt-to-docx") {
      return ".odt,application/vnd.oasis.opendocument.text";
    }
    if (tool.type === "docx-to-odt") {
      return ".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    }
    if (tool.type === "ods-to-xlsx") {
      return ".ods,application/vnd.oasis.opendocument.spreadsheet";
    }
    if (tool.type === "xlsx-to-ods") {
      return ".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    }
    if (tool.type === "odp-to-pptx") {
      return ".odp,application/vnd.oasis.opendocument.presentation";
    }
    if (tool.type === "pptx-to-odp") {
      return ".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation";
    }
    if (tool.type === "epub-reader") {
      return ".epub,application/epub+zip";
    }
    if (tool.type === "mobi-to-epub") {
      return ".mobi,.azw,.azw3,application/x-mobipocket-ebook";
    }
    if (tool.type === "epub-to-mobi") {
      return ".epub,application/epub+zip";
    }
    if (tool.type === "csv-viewer") {
      return ".csv,text/csv,application/csv";
    }
    if (tool.type === "xml-viewer") {
      return ".xml,application/xml,text/xml";
    }
    if (tool.type === "file-converter" || tool.type === "document-converter") {
      return ".epub,.xml,.json,.yaml,.yml,.csv,.txt,.html,.htm,application/epub+zip,application/xml,application/json,text/yaml,text/csv,text/plain,text/html,*/*";
    }
    if (tool.type === "epub-to-txt") {
      return ".epub,application/epub+zip";
    }
    if (tool.type === "xml-to-csv" || tool.type === "xml-to-json") {
      return ".xml,application/xml,text/xml";
    }
    if (tool.type === "json-to-xml" || tool.type === "json-to-yaml") {
      return ".json,application/json";
    }
    if (tool.type === "yaml-to-json" || tool.type === "yaml-to-csv") {
      return ".yaml,.yml,text/yaml,application/x-yaml";
    }
    if (tool.type === "csv-to-yaml") {
      return ".csv,text/csv,application/csv";
    }
    return ".pdf,application/pdf";
  };

  const isMultiFileAllowed = () => {
    return [
      "merge",
      "images-to-pdf",
      "pdf-binder",
      "merge-with-bookmarks",
      "pdf-images-combiner",
      "pdf-word-merger",
      "interleave-pdf",
      "add-pages",
      "scan-to-pdf",
      "add-image-to-pdf",
      "replace-image-in-pdf",
      "gif-maker",
      "apng-maker",
      "ai-face-swapper",
      "merge-images",
      "image-combiner-horizontal",
      "image-combiner-vertical",
      "ai-face-swapper",
    ].includes(tool.type);
  };

  const needsMultipleFiles = () => {
    return [
      "merge",
      "merge-alternately",
      "pdf-binder",
      "merge-with-bookmarks",
      "interleave-pdf",
      "add-pages",
      "add-image-to-pdf",
      "replace-image-in-pdf",
      "gif-maker",
      "apng-maker",
      "ai-face-swapper",
    ].includes(tool.type);
  };

  const getMinFiles = () => {
    if (tool.type === "merge") return 2;
    if (tool.type === "merge-alternately") return 2;
    if (tool.type === "pdf-binder") return 2;
    if (tool.type === "merge-with-bookmarks") return 2;
    if (tool.type === "interleave-pdf") return 2;
    if (tool.type === "add-pages") return 2;
    if (tool.type === "add-image-to-pdf") return 2;
    if (tool.type === "replace-image-in-pdf") return 2;
    if (tool.type === "gif-maker") return 2;
    if (tool.type === "apng-maker") return 2;
    if (tool.type === "ai-face-swapper") return 2;
    return 1;
  };

  const canProcess = () => {
    if (tool.type === "base64-to-image") {
      return !!(options.base64Input?.trim());
    }
    if (files.length < getMinFiles()) return false;
    
    if (tool.type === "add-image-to-pdf" || tool.type === "replace-image-in-pdf") {
      const hasPdf = files.some(f => 
        f.name.toLowerCase().endsWith('.pdf') || f.type === 'application/pdf'
      );
      const hasImage = files.some(f => {
        const ext = f.name.toLowerCase();
        const isImageExt = ext.endsWith('.jpg') || ext.endsWith('.jpeg') || ext.endsWith('.png') || 
               ext.endsWith('.gif') || ext.endsWith('.webp') || ext.endsWith('.bmp') ||
               ext.endsWith('.tiff') || ext.endsWith('.tif');
        const isImageMime = f.type.startsWith('image/');
        return isImageExt || isImageMime;
      });
      if (!hasPdf || !hasImage) {
        return false;
      }
    }
    
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

    if (tool.type === "pdf-splitter" && !options.pages?.trim()) {
      return false;
    }

    if (tool.type === "divide-pdf") {
      const parts = typeof options.parts === 'string' 
        ? parseInt(options.parts, 10) 
        : options.parts;
      if (!parts || parts < 2) {
        return false;
      }
    }

    if (tool.type === "break-pdf" && !options.sections?.trim()) {
      return false;
    }

    if (tool.type === "split-by-text" && !options.searchText?.trim()) {
      return false;
    }

    if (tool.type === "extract-pages" && !options.pages?.trim()) {
      return false;
    }

    if (tool.type === "page-remover" && !options.pages?.trim()) {
      return false;
    }

    if (tool.type === "extract-specific" && !options.pages?.trim()) {
      return false;
    }

    if (tool.type === "split-by-size") {
      const sizeLimit = typeof options.sizeLimitMB === 'string' 
        ? parseFloat(options.sizeLimitMB) 
        : options.sizeLimitMB;
      if (!sizeLimit || sizeLimit < 0.1) {
        return false;
      }
    }

    if (tool.type === "split-every-x-pages") {
      const interval = typeof options.pageInterval === 'string' 
        ? parseInt(options.pageInterval, 10) 
        : options.pageInterval;
      if (!interval || interval < 1) {
        return false;
      }
    }

    if (tool.type === "duplicate-pages" && !options.duplicatePages?.trim()) {
      return false;
    }

    if (tool.type === "pdf-page-manager" && !options.pageOrder?.trim()) {
      return false;
    }

    if (tool.type === "add-pages" && options.addPagesPosition === "after") {
      const insertAfter = typeof options.insertAfterPage === 'string'
        ? parseInt(options.insertAfterPage, 10)
        : options.insertAfterPage;
      if (!insertAfter || insertAfter < 1) {
        return false;
      }
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
                  <h1 className="text-2xl md:text-3xl font-bold">
                    <span className="mr-2">{tool.emoji}</span>
                    {tool.name}
                  </h1>
                  <p className="text-muted-foreground">{tool.description}</p>
                </div>
              </div>

              <div className="space-y-6">
                {processingState === "idle" && (
                  <>
                    {tool.type !== "base64-to-image" && (
                      <FileUpload
                        accept={getAcceptType()}
                        multiple={isMultiFileAllowed()}
                        maxFiles={tool.type === "images-to-pdf" ? 50 : 20}
                        files={files}
                        onFilesChange={setFiles}
                      />
                    )}

                    {(files.length > 0 || tool.type === "base64-to-image") && (
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

          {tool.seoArticle && (
            <div className="mt-12" data-testid="section-seo-article">
              <article 
                className="prose prose-slate dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: tool.seoArticle }}
              />
            </div>
          )}
        </div>
      </main>
      <Footer onToolClick={handleFooterToolClick} />
    </div>
  );
}
