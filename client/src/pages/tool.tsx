import { useState, useCallback, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { FileUpload } from "@/components/file-upload";
import { ToolOptionsComponent } from "@/components/tool-options";
import { VoiceRecorder } from "@/components/voice-recorder";
import { TextToSpeechComponent } from "@/components/text-to-speech";
import { ScreenRecorder } from "@/components/screen-recorder";
import { WebcamRecorder } from "@/components/webcam-recorder";
import { AudioVisualizerComponent } from "@/components/audio-visualizer";
import { VideoPlayer } from "@/components/video-player";
import { OnlineVideoPlayer } from "@/components/online-video-player";
import { Teleprompter } from "@/components/teleprompter";
import { UrlToolInput } from "@/components/url-tool-input";
import { UrlToolResults } from "@/components/url-tool-results";
import { CssGradientGenerator } from "@/components/css-gradient-generator";
import { UnitConverterLength } from "@/components/unit-converter-length";
import { UnitConverterWeight } from "@/components/unit-converter-weight";
import { UnitConverterTemperature } from "@/components/unit-converter-temperature";
import { UnitConverterData } from "@/components/unit-converter-data";
import { TimeZoneConverter } from "@/components/time-zone-converter";
import { AgeCalculator } from "@/components/age-calculator";
import { DateCalculator } from "@/components/date-calculator";
import { WorldClockComponent } from "@/components/world-clock";
import { StopwatchComponent } from "@/components/stopwatch";
import { OnlineCalculator } from "@/components/online-calculator";
import { ScientificCalculator } from "@/components/scientific-calculator";
import { BmiCalculator } from "@/components/bmi-calculator";
import { LoanCalculator } from "@/components/loan-calculator";
import { MortgageCalculator } from "@/components/mortgage-calculator";
import { PercentageCalculator } from "@/components/percentage-calculator";
import { SalesTaxCalculator } from "@/components/sales-tax-calculator";
import { DiscountCalculator } from "@/components/discount-calculator";
import { OnlineNotepad } from "@/components/online-notepad";
import { TimerTool } from "@/components/timer-tool";
import { OnlineWhiteboard } from "@/components/online-whiteboard";
import { OnlinePollMaker } from "@/components/online-poll-maker";
import { OnlineSurveyMaker } from "@/components/online-survey-maker";
import { RandomNamePicker } from "@/components/random-name-picker";
import { DiceRoller } from "@/components/dice-roller";
import { CoinFlipper } from "@/components/coin-flipper";
import { OnlineClipboard } from "@/components/online-clipboard";
import { ShareTextOnline } from "@/components/share-text-online";
import { ShareFilesOnline } from "@/components/share-files-online";
import { UrlShortener } from "@/components/url-shortener";
import { ReadabilityChecker } from "@/components/readability-checker";
import { PlagiarismChecker } from "@/components/plagiarism-checker";
import { GrammarChecker } from "@/components/grammar-checker";
import { SpellChecker } from "@/components/spell-checker";
import { ArticleSpinner } from "@/components/article-spinner";
import { ParaphrasingTool } from "@/components/paraphrasing-tool";
import { TextSummarizer } from "@/components/text-summarizer";
import { WordCloudGenerator } from "@/components/word-cloud-generator";
import { SignatureGenerator } from "@/components/signature-generator";
import { EmailValidator } from "@/components/email-validator";
import { RandomWordGenerator } from "@/components/random-word-generator";
import { RandomParagraphGenerator } from "@/components/random-paragraph-generator";
import { BarcodeGenerator } from "@/components/barcode-generator";
import { BarcodeReader } from "@/components/barcode-reader";
import { RssFeedReader } from "@/components/rss-feed-reader";
import { TwitterCardGenerator } from "@/components/twitter-card-generator";
import { OpenGraphGenerator } from "@/components/open-graph-generator";
import { YoutubeThumbnailDownloader } from "@/components/youtube-thumbnail-downloader";
import { YoutubeTagExtractor } from "@/components/youtube-tag-extractor";
import { CreditCardValidator } from "@/components/credit-card-validator";
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
  GitCompare,
  ChevronsUp,
  ChevronsDown,
  Heading,
  TextCursor,
  WrapText,
  SplitSquareVertical,
  ListOrdered,
  type LucideIcon,
  Mic,
  Mic2,
  Volume2,
  VolumeX,
  FileAudio,
  Captions,
  Tag,
  Activity,
  Smartphone,
  Slice,
  Timer,
  Crop,
  Square,
  RefreshCw,
  FileArchive,
  FolderArchive,
  Camera,
  BarChart,
  ClipboardList,
  Users,
  Dices,
  CircleDot,
  Clipboard,
  Share2,
  Upload,
  PenSquare,
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
  GitCompare,
  ChevronsUp,
  ChevronsDown,
  Heading,
  TextCursor,
  WrapText,
  SplitSquareVertical,
  ListOrdered,
  Mic,
  Mic2,
  Volume2,
  VolumeX,
  FileAudio,
  Captions,
  Tag,
  AudioWaveform: Activity,
  Smartphone,
  Slice,
  Timer,
  Crop,
  Square,
  RefreshCw,
  FileArchive,
  FolderArchive,
  BarChart,
  ClipboardList,
  Users,
  Dices,
  CircleDot,
  Clipboard,
  Share2,
  Upload,
  PenSquare,
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
  const [urlToolResult, setUrlToolResult] = useState<any>(null);
  const [isUrlToolLoading, setIsUrlToolLoading] = useState(false);

  const resetState = useCallback(() => {
    setFiles([]);
    setOptions({});
    setProcessingState("idle");
    setProgress(0);
    setResult(null);
    setPageCount(undefined);
    setUrlToolResult(null);
    setIsUrlToolLoading(false);
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

      let ogTitle = document.querySelector('meta[property="og:title"]');
      if (!ogTitle) {
        ogTitle = document.createElement("meta");
        ogTitle.setAttribute("property", "og:title");
        document.head.appendChild(ogTitle);
      }
      ogTitle.setAttribute("content", tool.metaTitle);

      let ogDescription = document.querySelector('meta[property="og:description"]');
      if (!ogDescription) {
        ogDescription = document.createElement("meta");
        ogDescription.setAttribute("property", "og:description");
        document.head.appendChild(ogDescription);
      }
      ogDescription.setAttribute("content", tool.metaDescription);

      let ogType = document.querySelector('meta[property="og:type"]');
      if (!ogType) {
        ogType = document.createElement("meta");
        ogType.setAttribute("property", "og:type");
        document.head.appendChild(ogType);
      }
      ogType.setAttribute("content", "website");

      return () => {
        document.title = "File Tools - Free Online File Processor";
        if (metaDescription) {
          metaDescription.setAttribute("content", "Free online tools for PDFs, videos, images, and archives. Process your files easily.");
        }
        if (ogTitle) {
          ogTitle.setAttribute("content", "File Tools - Free Online File Processor");
        }
        if (ogDescription) {
          ogDescription.setAttribute("content", "Free online tools for PDFs, videos, images, and archives. Process your files easily.");
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
      return !!(options.base64Input?.trim());
    }
    if (tool.type === "json-validator" || tool.type === "json-minifier" || tool.type === "json-beautifier" || tool.type === "json-formatter") {
      return !!(options.jsonInput?.trim());
    }
    if (tool.type === "xml-formatter" || tool.type === "xml-validator") {
      return !!(options.xmlInput?.trim());
    }
    if (tool.type === "html-minifier" || tool.type === "html-beautifier") {
      return !!(options.htmlInput?.trim());
    }
    if (tool.type === "css-minifier" || tool.type === "css-beautifier") {
      return !!(options.cssInput?.trim());
    }
    if (tool.type === "js-minifier" || tool.type === "js-beautifier") {
      return !!(options.jsInput?.trim());
    }
    if (tool.type === "sql-formatter" || tool.type === "sql-minifier") {
      return !!(options.sqlInput?.trim());
    }
    if (tool.type === "lorem-ipsum-generator" || tool.type === "uuid-generator") {
      return true;
    }
    if (tool.type === "md5-hash-generator" || tool.type === "sha256-hash-generator") {
      return !!(options.textInput?.trim());
    }
    if (tool.type === "base64-encode" || tool.type === "base64-decode" || tool.type === "url-encoder" || tool.type === "url-decode" || tool.type === "text-case-converter" || tool.type === "uppercase-converter" || tool.type === "lowercase-converter" || tool.type === "title-case-converter" || tool.type === "sentence-case-converter" || tool.type === "remove-line-breaks" || tool.type === "add-line-breaks" || tool.type === "text-sorter" || tool.type === "alphabetize-list" || tool.type === "reverse-text" || tool.type === "random-number-generator" || tool.type === "password-generator" || tool.type === "text-repeater" || tool.type === "find-replace-text" || tool.type === "text-statistics" || tool.type === "character-counter" || tool.type === "line-counter" || tool.type === "whitespace-remover" || tool.type === "slugify-url") {
      return !!(options.textInput?.trim());
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
    if (tool.type === "compress-audio" || tool.type === "audio-converter") {
      return ".mp3,.wav,.aac,.m4a,.ogg,.flac,.wma,audio/mpeg,audio/wav,audio/aac,audio/mp4,audio/ogg,audio/flac";
    }
    if (tool.type === "compress-mp3" || tool.type === "mp3-to-wav") {
      return ".mp3,audio/mpeg";
    }
    if (tool.type === "compress-wav" || tool.type === "wav-to-mp3") {
      return ".wav,audio/wav,audio/wave,audio/x-wav";
    }
    if (tool.type === "avi-to-mp3" || tool.type === "mov-to-mp3") {
      return ".avi,.mov,video/x-msvideo,video/quicktime";
    }
    if (tool.type === "cut-audio" || tool.type === "trim-audio" || tool.type === "audio-trimmer" ||
        tool.type === "change-audio-volume" || tool.type === "increase-audio-volume" || tool.type === "decrease-audio-volume" || tool.type === "change-audio-speed" || tool.type === "audio-speed-changer" || tool.type === "change-audio-pitch" || tool.type === "audio-pitch-shifter" || tool.type === "reverse-audio" || tool.type === "audio-reverser" || tool.type === "audio-equalizer") {
      return ".mp3,.wav,.aac,.m4a,.ogg,.flac,.wma,audio/mpeg,audio/wav,audio/aac,audio/mp4,audio/ogg,audio/flac";
    }
    if (tool.type === "add-audio-to-video") {
      return ".mp4,.webm,.mov,.avi,.mkv,.mp3,.wav,.aac,.m4a,.ogg,.flac,video/mp4,video/webm,video/quicktime,video/x-msvideo,audio/mpeg,audio/wav,audio/aac,audio/mp4,audio/ogg,audio/flac";
    }
    if (tool.type === "remove-audio-from-video") {
      return ".mp4,.webm,.mov,.avi,.mkv,video/mp4,video/webm,video/quicktime,video/x-msvideo";
    }
    if (tool.type === "merge-audio" || tool.type === "combine-audio" || tool.type === "audio-joiner") {
      return ".mp3,.wav,.aac,.m4a,.ogg,.flac,.wma,audio/mpeg,audio/wav,audio/aac,audio/mp4,audio/ogg,audio/flac";
    }
    if (tool.type === "hex-to-text" || tool.type === "text-to-morse" || tool.type === "morse-to-text" || tool.type === "text-to-handwriting") {
      return "*/*";
    }
    // New Video Tools
    if (tool.type === "ringtone-maker") {
      return ".mp3,.wav,.aac,.m4a,.ogg,.flac,.mp4,.webm,.mov,.avi,.mkv,audio/mpeg,audio/wav,audio/aac,audio/mp4,audio/ogg,video/mp4,video/webm,video/quicktime,video/x-msvideo";
    }
    if (tool.type === "compress-video" || tool.type === "reduce-video-size" || tool.type === "video-converter") {
      return ".mp4,.webm,.mov,.avi,.mkv,video/mp4,video/webm,video/quicktime,video/x-msvideo,video/x-matroska";
    }
    if (tool.type === "compress-mp4" || tool.type === "mp4-to-avi") {
      return ".mp4,video/mp4";
    }
    if (tool.type === "compress-mov" || tool.type === "mov-to-mp4") {
      return ".mov,video/quicktime";
    }
    if (tool.type === "compress-avi" || tool.type === "avi-to-mp4") {
      return ".avi,video/x-msvideo";
    }
    // New Video Conversion Tools
    if (tool.type === "mp4-to-mov" || tool.type === "mp4-to-mkv" || tool.type === "mp4-to-webm" || tool.type === "mp4-to-gif") {
      return ".mp4,video/mp4";
    }
    if (tool.type === "mkv-to-mp4") {
      return ".mkv,video/x-matroska";
    }
    if (tool.type === "webm-to-mp4") {
      return ".webm,video/webm";
    }
    if (tool.type === "avi-to-mpeg") {
      return ".avi,video/x-msvideo";
    }
    if (tool.type === "gif-to-mp4-hd") {
      return ".gif,image/gif";
    }
    if (tool.type === "video-to-webm" || tool.type === "video-to-flv") {
      return "video/mp4,video/webm,video/quicktime,video/x-msvideo,video/x-matroska,.mp4,.webm,.mov,.avi,.mkv";
    }
    if (tool.type === "resize-video" || tool.type === "video-resizer" || 
        tool.type === "change-video-aspect-ratio" || tool.type === "mute-video" ||
        tool.type === "change-video-audio" || tool.type === "change-video-speed" ||
        tool.type === "speed-up-video" || tool.type === "slow-down-video" ||
        tool.type === "loop-video" || tool.type === "stabilize-video" ||
        tool.type === "video-deshaker" || tool.type === "reverse-video" ||
        tool.type === "video-reverser" || tool.type === "add-filter-to-video" ||
        tool.type === "video-color-correction") {
      return ".mp4,.webm,.mov,.avi,.mkv,video/mp4,video/webm,video/quicktime,video/x-msvideo,video/x-matroska";
    }
    if (tool.type === "merge-video" || tool.type === "combine-videos" || tool.type === "video-joiner") {
      return ".mp4,.webm,.mov,.avi,.mkv,video/mp4,video/webm,video/quicktime,video/x-msvideo,video/x-matroska";
    }
    // Archive tools
    if (tool.type === "zip-creator") {
      return "*/*";
    }
    if (tool.type === "zip-extractor" || tool.type === "online-unzipper") {
      return ".zip,application/zip,application/x-zip-compressed";
    }
    if (tool.type === "rar-extractor" || tool.type === "online-unrar") {
      return ".rar,application/x-rar-compressed,application/vnd.rar";
    }
    if (tool.type === "7z-extractor") {
      return ".7z,application/x-7z-compressed";
    }
    if (tool.type === "tar-extractor") {
      return ".tar,application/x-tar";
    }
    if (tool.type === "tar-gz-extractor") {
      return ".tar.gz,.tgz,application/gzip,application/x-gzip";
    }
    if (tool.type === "tar-bz2-extractor") {
      return ".tar.bz2,.tbz2,.tbz,application/x-bzip2";
    }
    if (tool.type === "create-7z-archive" || tool.type === "create-tar-gz-archive") {
      return "*/*";
    }
    if (tool.type === "archive-converter") {
      return ".zip,.rar,.7z,.tar,.tar.gz,.tgz,.tar.bz2,.tbz2,application/zip,application/x-rar-compressed,application/x-7z-compressed,application/x-tar,application/gzip";
    }
    if (tool.type === "zip-to-7z") {
      return ".zip,application/zip,application/x-zip-compressed";
    }
    if (tool.type === "7z-to-zip") {
      return ".7z,application/x-7z-compressed";
    }
    if (tool.type === "rar-to-zip") {
      return ".rar,application/x-rar-compressed,application/vnd.rar";
    }
    // Video tools
    if (tool.type === "ai-video-noise-reduction" || tool.type === "ai-auto-subtitle-generator" || tool.type === "ai-video-editor" || tool.type === "green-screen-remover") {
      return ".mp4,.webm,.mov,.avi,.mkv,video/mp4,video/webm,video/quicktime,video/x-msvideo,video/x-matroska";
    }
    return ".pdf,application/pdf";
  };

  const urlBasedToolTypes = ["backlink-checker", "broken-link-checker", "website-speed-test", "ping-tool", "whois-lookup", "dns-lookup", "ip-address-lookup", "what-is-my-ip", "http-header-viewer", "redirect-checker", "color-picker-screen", "color-picker-image", "hex-to-rgb", "rgb-to-hex", "hex-to-hsl", "rgb-to-cmyk", "color-palette-generator", "gradient-generator", "box-shadow-generator", "border-radius-generator"];

  const isUrlBasedTool = () => urlBasedToolTypes.includes(tool?.type || "");

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
      "merge-audio",
      "combine-audio",
      "audio-joiner",
      "add-audio-to-video",
      "merge-video",
      "combine-videos",
      "video-joiner",
      "zip-creator",
      "create-7z-archive",
      "create-tar-gz-archive",
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
      "merge-audio",
      "combine-audio",
      "audio-joiner",
      "add-audio-to-video",
      "merge-video",
      "combine-videos",
      "video-joiner",
      "zip-creator",
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
    if (tool.type === "merge-video" || tool.type === "combine-videos" || tool.type === "video-joiner") return 2;
    return 1;
  };

  const canProcess = () => {
    if (tool.type === "base64-to-image") {
      return !!(options.base64Input?.trim());
    }
    if (tool.type === "json-validator" || tool.type === "json-minifier" || tool.type === "json-beautifier" || tool.type === "json-formatter") {
      return !!(options.jsonInput?.trim());
    }
    if (tool.type === "xml-formatter" || tool.type === "xml-validator") {
      return !!(options.xmlInput?.trim());
    }
    if (tool.type === "html-minifier" || tool.type === "html-beautifier") {
      return !!(options.htmlInput?.trim());
    }
    if (tool.type === "css-minifier" || tool.type === "css-beautifier") {
      return !!(options.cssInput?.trim());
    }
    if (tool.type === "js-minifier" || tool.type === "js-beautifier") {
      return !!(options.jsInput?.trim());
    }
    if (tool.type === "sql-formatter" || tool.type === "sql-minifier") {
      return !!(options.sqlInput?.trim());
    }
    if (tool.type === "lorem-ipsum-generator") {
      return true;
    }
    if (tool.type === "uuid-generator") {
      return true;
    }
    if (tool.type === "md5-hash-generator" || tool.type === "sha256-hash-generator") {
      return !!(options.textInput?.trim());
    }
    if (tool.type === "base64-encode" || tool.type === "base64-decode" || tool.type === "url-encoder" || tool.type === "url-decode" || tool.type === "text-case-converter" || tool.type === "uppercase-converter" || tool.type === "lowercase-converter" || tool.type === "title-case-converter" || tool.type === "sentence-case-converter" || tool.type === "remove-line-breaks" || tool.type === "add-line-breaks" || tool.type === "text-sorter" || tool.type === "alphabetize-list") {
      return !!(options.textInput?.trim());
    }
    if (tool.type === "hex-to-text") {
      return !!(options.hexInput?.trim());
    }
    if (tool.type === "text-to-morse" || tool.type === "text-to-handwriting") {
      return !!(options.textInput?.trim());
    }
    if (tool.type === "morse-to-text") {
      return !!(options.morseInput?.trim());
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

  const handleUrlToolSubmit = async (data: { url?: string; domain?: string; ip?: string }) => {
    if (!tool) return;
    
    setIsUrlToolLoading(true);
    setUrlToolResult(null);
    
    try {
      const response = await fetch("/api/url-tool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolType: tool.type, ...data }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setUrlToolResult(result.data);
      } else {
        console.error("URL tool error:", result.error);
      }
    } catch (error) {
      console.error("URL tool request failed:", error);
    } finally {
      setIsUrlToolLoading(false);
    }
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
                    {(tool.type === "voice-recorder" || tool.type === "online-voice-recorder") && (
                      <VoiceRecorder />
                    )}

                    {tool.type === "text-to-speech" && (
                      <TextToSpeechComponent />
                    )}

                    {tool.type === "audio-visualizer" && (
                      <AudioVisualizerComponent />
                    )}

                    {(tool.type === "screen-recorder" || tool.type === "record-screen-camera") && (
                      <ScreenRecorder includeCamera={tool.type === "record-screen-camera"} />
                    )}

                    {tool.type === "webcam-recorder" && (
                      <WebcamRecorder />
                    )}

                    {tool.type === "video-player" && (
                      <VideoPlayer />
                    )}

                    {tool.type === "online-video-player" && (
                      <OnlineVideoPlayer />
                    )}

                    {isUrlBasedTool() && (
                      <div className="space-y-6">
                        <UrlToolInput
                          toolType={tool.type}
                          onSubmit={handleUrlToolSubmit}
                          isLoading={isUrlToolLoading}
                        />
                        {urlToolResult && (
                          <div className="mt-6">
                            <UrlToolResults toolType={tool.type} data={urlToolResult} />
                          </div>
                        )}
                      </div>
                    )}

                    {tool.type === "teleprompter" && (
                      <Teleprompter />
                    )}

                    {tool.type === "online-whiteboard" && (
                      <OnlineWhiteboard />
                    )}

                    {tool.type === "online-poll-maker" && (
                      <OnlinePollMaker />
                    )}

                    {tool.type === "online-survey-maker" && (
                      <OnlineSurveyMaker />
                    )}

                    {tool.type === "random-name-picker" && (
                      <RandomNamePicker />
                    )}

                    {tool.type === "dice-roller" && (
                      <DiceRoller />
                    )}

                    {tool.type === "coin-flipper" && (
                      <CoinFlipper />
                    )}

                    {tool.type === "online-clipboard" && (
                      <OnlineClipboard />
                    )}

                    {tool.type === "share-text-online" && (
                      <ShareTextOnline />
                    )}

                    {tool.type === "share-files-online" && (
                      <ShareFilesOnline />
                    )}

                    {tool.type === "url-shortener" && (
                      <UrlShortener />
                    )}

                    {tool.type === "readability-checker" && (
                      <ReadabilityChecker />
                    )}

                    {tool.type === "plagiarism-checker" && (
                      <PlagiarismChecker />
                    )}

                    {tool.type === "grammar-checker" && (
                      <GrammarChecker />
                    )}

                    {tool.type === "spell-checker" && (
                      <SpellChecker />
                    )}

                    {tool.type === "article-spinner" && (
                      <ArticleSpinner />
                    )}

                    {tool.type === "paraphrasing-tool" && (
                      <ParaphrasingTool />
                    )}

                    {tool.type === "text-summarizer" && (
                      <TextSummarizer />
                    )}

                    {tool.type === "word-cloud-generator" && (
                      <WordCloudGenerator />
                    )}

                    {tool.type === "signature-generator" && (
                      <SignatureGenerator />
                    )}

                    {tool.type === "email-validator" && (
                      <EmailValidator />
                    )}

                    {tool.type === "random-word-generator" && (
                      <RandomWordGenerator />
                    )}

                    {tool.type === "random-paragraph-generator" && (
                      <RandomParagraphGenerator />
                    )}

                    {tool.type === "barcode-generator" && (
                      <BarcodeGenerator />
                    )}

                    {tool.type === "barcode-reader" && (
                      <BarcodeReader />
                    )}

                    {tool.type === "rss-feed-reader" && (
                      <RssFeedReader />
                    )}

                    {tool.type === "twitter-card-generator" && (
                      <TwitterCardGenerator />
                    )}

                    {tool.type === "open-graph-generator" && (
                      <OpenGraphGenerator />
                    )}

                    {tool.type === "youtube-thumbnail-downloader" && (
                      <YoutubeThumbnailDownloader />
                    )}

                    {tool.type === "youtube-tag-extractor" && (
                      <YoutubeTagExtractor />
                    )}

                    {tool.type === "credit-card-validator" && (
                      <CreditCardValidator />
                    )}

                    {!["base64-to-image", "json-validator", "json-minifier", "json-beautifier", "json-formatter", "xml-formatter", "xml-validator", "html-minifier", "html-beautifier", "css-minifier", "css-beautifier", "js-minifier", "js-beautifier", "sql-formatter", "sql-minifier", "lorem-ipsum-generator", "uuid-generator", "md5-hash-generator", "sha256-hash-generator", "base64-encode", "base64-decode", "url-encoder", "url-decode", "text-case-converter", "uppercase-converter", "lowercase-converter", "title-case-converter", "sentence-case-converter", "remove-line-breaks", "add-line-breaks", "text-sorter", "alphabetize-list", "reverse-text", "random-number-generator", "password-generator", "text-repeater", "find-replace-text", "text-statistics", "character-counter", "line-counter", "whitespace-remover", "slugify-url", "hex-to-text", "text-to-morse", "morse-to-text", "text-to-handwriting", "website-to-pdf", "website-to-jpg", "website-source-code-viewer", "website-seo-analyzer", "keyword-density-checker", "meta-tag-generator", "robots-txt-generator", "sitemap-xml-generator", "domain-authority-checker", "page-authority-checker", "website-downloader", "screenshot-website", "voice-recorder", "online-voice-recorder", "text-to-speech", "audio-visualizer", "screen-recorder", "record-screen-camera", "webcam-recorder", "video-player", "online-video-player", "teleprompter", "backlink-checker", "broken-link-checker", "website-speed-test", "ping-tool", "whois-lookup", "dns-lookup", "ip-address-lookup", "what-is-my-ip", "http-header-viewer", "redirect-checker", "color-picker-screen", "color-picker-image", "hex-to-rgb", "rgb-to-hex", "hex-to-hsl", "rgb-to-cmyk", "color-palette-generator", "gradient-generator", "box-shadow-generator", "border-radius-generator", "online-whiteboard", "online-poll-maker", "online-survey-maker", "random-name-picker", "dice-roller", "coin-flipper", "online-clipboard", "share-text-online", "share-files-online", "url-shortener", "readability-checker", "plagiarism-checker", "grammar-checker", "spell-checker", "article-spinner", "paraphrasing-tool", "text-summarizer", "word-cloud-generator", "signature-generator", "email-validator", "random-word-generator", "random-paragraph-generator", "barcode-generator", "barcode-reader", "rss-feed-reader", "twitter-card-generator", "open-graph-generator", "youtube-thumbnail-downloader", "youtube-tag-extractor", "credit-card-validator"].includes(tool.type) && (
                      <FileUpload
                        accept={getAcceptType() as string}
                        multiple={isMultiFileAllowed()}
                        maxFiles={tool.type === "images-to-pdf" ? 50 : 20}
                        files={files}
                        onFilesChange={setFiles}
                      />
                    )}

                    {!["voice-recorder", "online-voice-recorder", "text-to-speech", "audio-visualizer", "screen-recorder", "record-screen-camera", "webcam-recorder", "color-picker-screen", "color-picker-image", "hex-to-rgb", "rgb-to-hex", "hex-to-hsl", "rgb-to-cmyk", "color-palette-generator", "gradient-generator", "box-shadow-generator", "border-radius-generator", "online-whiteboard", "online-poll-maker", "online-survey-maker", "random-name-picker", "dice-roller", "coin-flipper", "online-clipboard", "share-text-online", "share-files-online", "url-shortener", "readability-checker", "plagiarism-checker", "grammar-checker", "spell-checker", "article-spinner", "paraphrasing-tool", "text-summarizer", "word-cloud-generator", "signature-generator", "email-validator", "random-word-generator", "random-paragraph-generator", "barcode-generator", "barcode-reader", "rss-feed-reader", "twitter-card-generator", "open-graph-generator", "youtube-thumbnail-downloader", "youtube-tag-extractor", "credit-card-validator"].includes(tool.type) && (files.length > 0 || ["base64-to-image", "json-validator", "json-minifier", "json-beautifier", "json-formatter", "xml-formatter", "xml-validator", "html-minifier", "html-beautifier", "css-minifier", "css-beautifier", "js-minifier", "js-beautifier", "sql-formatter", "sql-minifier", "lorem-ipsum-generator", "uuid-generator", "md5-hash-generator", "sha256-hash-generator", "base64-encode", "base64-decode", "url-encoder", "url-decode", "text-case-converter", "uppercase-converter", "lowercase-converter", "title-case-converter", "sentence-case-converter", "remove-line-breaks", "add-line-breaks", "text-sorter", "alphabetize-list", "reverse-text", "random-number-generator", "password-generator", "text-repeater", "find-replace-text", "text-statistics", "character-counter", "line-counter", "whitespace-remover", "slugify-url", "hex-to-text", "text-to-morse", "morse-to-text", "text-to-handwriting", "website-to-pdf", "website-to-jpg", "website-source-code-viewer", "website-seo-analyzer", "keyword-density-checker", "meta-tag-generator", "robots-txt-generator", "sitemap-xml-generator", "domain-authority-checker", "page-authority-checker", "website-downloader", "screenshot-website", "backlink-checker", "broken-link-checker", "website-speed-test", "ping-tool", "whois-lookup", "dns-lookup", "ip-address-lookup", "what-is-my-ip", "http-header-viewer", "redirect-checker", "color-picker-screen", "color-picker-image", "hex-to-rgb", "rgb-to-hex", "hex-to-hsl", "rgb-to-cmyk", "color-palette-generator", "gradient-generator", "box-shadow-generator", "border-radius-generator"].includes(tool.type)) && (
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

                    {!["voice-recorder", "online-voice-recorder", "text-to-speech", "audio-visualizer", "screen-recorder", "record-screen-camera", "webcam-recorder", "video-player", "online-video-player", "teleprompter", "backlink-checker", "broken-link-checker", "website-speed-test", "ping-tool", "whois-lookup", "dns-lookup", "ip-address-lookup", "what-is-my-ip", "http-header-viewer", "redirect-checker", "color-picker-screen", "color-picker-image", "hex-to-rgb", "rgb-to-hex", "hex-to-hsl", "rgb-to-cmyk", "color-palette-generator", "gradient-generator", "box-shadow-generator", "border-radius-generator", "online-whiteboard", "online-poll-maker", "online-survey-maker", "random-name-picker", "dice-roller", "coin-flipper", "online-clipboard", "share-text-online", "share-files-online", "url-shortener", "readability-checker", "plagiarism-checker", "grammar-checker", "spell-checker", "article-spinner", "paraphrasing-tool", "text-summarizer", "word-cloud-generator", "signature-generator", "email-validator", "random-word-generator", "random-paragraph-generator", "barcode-generator", "barcode-reader", "rss-feed-reader", "twitter-card-generator", "open-graph-generator", "youtube-thumbnail-downloader", "youtube-tag-extractor", "credit-card-validator"].includes(tool.type) && (
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
                    )}
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
