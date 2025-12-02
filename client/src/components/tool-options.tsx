import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { type PdfToolType, type ToolOptions } from "@shared/schema";

interface ToolOptionsProps {
  toolType: PdfToolType;
  options: ToolOptions;
  onOptionsChange: (options: ToolOptions) => void;
  pageCount?: number;
}

export function ToolOptionsComponent({
  toolType,
  options,
  onOptionsChange,
  pageCount,
}: ToolOptionsProps) {
  const updateOption = <K extends keyof ToolOptions>(
    key: K,
    value: ToolOptions[K]
  ) => {
    onOptionsChange({ ...options, [key]: value });
  };

  switch (toolType) {
    case "split":
    case "delete-pages":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pages">
              {toolType === "split" ? "Pages to extract" : "Pages to delete"}
            </Label>
            <Input
              id="pages"
              placeholder="e.g., 1,3,5-10"
              value={options.pages || ""}
              onChange={(e) => updateOption("pages", e.target.value)}
              data-testid="input-pages"
            />
            <p className="text-sm text-muted-foreground">
              Enter page numbers separated by commas. Use hyphen for ranges.
              {pageCount && ` (Total pages: ${pageCount})`}
            </p>
          </div>
        </div>
      );

    case "rotate":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Rotation Angle</Label>
            <Select
              value={options.rotation || "90"}
              onValueChange={(value) =>
                updateOption("rotation", value as "90" | "180" | "270")
              }
            >
              <SelectTrigger data-testid="select-rotation">
                <SelectValue placeholder="Select angle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="90">90° Clockwise</SelectItem>
                <SelectItem value="180">180°</SelectItem>
                <SelectItem value="270">270° Clockwise (90° Counter-clockwise)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );

    case "compress":
    case "compress-pdf":
    case "pdf-compressor":
    case "reduce-pdf-size":
    case "optimize-pdf":
    case "pdf-optimizer":
    case "custom-pdf-compression":
    case "pdf-size-reducer":
    case "shrink-pdf":
    case "pdf-file-compressor":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Compression Level</Label>
            <Select
              value={options.compressionLevel || "medium"}
              onValueChange={(value) =>
                updateOption("compressionLevel", value as "low" | "medium" | "high")
              }
            >
              <SelectTrigger data-testid="select-compression">
                <SelectValue placeholder="Select compression level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low (Larger file, better quality)</SelectItem>
                <SelectItem value="medium">Medium (Balanced)</SelectItem>
                <SelectItem value="high">High (Smaller file, lower quality)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );

    case "high-compression-pdf":
    case "basic-compression-pdf":
    case "compress-pdf-for-web":
    case "compress-pdf-for-email":
    case "compress-scanned-pdf":
    case "optimize-pdf-for-print":
      return null;

    case "pdf-to-images":
      return null;

    case "watermark":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="watermarkText">Watermark Text</Label>
            <Input
              id="watermarkText"
              placeholder="e.g., CONFIDENTIAL"
              value={options.watermarkText || ""}
              onChange={(e) => updateOption("watermarkText", e.target.value)}
              data-testid="input-watermark-text"
            />
          </div>
          <div className="space-y-2">
            <Label>Position</Label>
            <Select
              value={options.watermarkPosition || "center"}
              onValueChange={(value) =>
                updateOption(
                  "watermarkPosition",
                  value as ToolOptions["watermarkPosition"]
                )
              }
            >
              <SelectTrigger data-testid="select-watermark-position">
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="top-left">Top Left</SelectItem>
                <SelectItem value="top-right">Top Right</SelectItem>
                <SelectItem value="bottom-left">Bottom Left</SelectItem>
                <SelectItem value="bottom-right">Bottom Right</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );

    case "add-page-numbers":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Position</Label>
            <Select
              value={options.pageNumberPosition || "bottom-center"}
              onValueChange={(value) =>
                updateOption(
                  "pageNumberPosition",
                  value as ToolOptions["pageNumberPosition"]
                )
              }
            >
              <SelectTrigger data-testid="select-page-number-position">
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bottom-center">Bottom Center</SelectItem>
                <SelectItem value="bottom-left">Bottom Left</SelectItem>
                <SelectItem value="bottom-right">Bottom Right</SelectItem>
                <SelectItem value="top-center">Top Center</SelectItem>
                <SelectItem value="top-left">Top Left</SelectItem>
                <SelectItem value="top-right">Top Right</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );

    case "protect":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter password to protect PDF"
              value={options.password || ""}
              onChange={(e) => updateOption("password", e.target.value)}
              data-testid="input-password"
            />
            <p className="text-sm text-muted-foreground">
              This password will be required to open the PDF.
            </p>
          </div>
        </div>
      );

    case "unlock":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="unlockPassword">Current Password</Label>
            <Input
              id="unlockPassword"
              type="password"
              placeholder="Enter current PDF password"
              value={options.unlockPassword || ""}
              onChange={(e) => updateOption("unlockPassword", e.target.value)}
              data-testid="input-unlock-password"
            />
            <p className="text-sm text-muted-foreground">
              Enter the password used to protect this PDF.
            </p>
          </div>
        </div>
      );

    case "divide-pdf":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="parts">Number of Parts</Label>
            <Input
              id="parts"
              type="number"
              min={2}
              placeholder="2"
              value={options.parts || 2}
              onChange={(e) => updateOption("parts", parseInt(e.target.value) || 2)}
              data-testid="input-parts"
            />
            <p className="text-sm text-muted-foreground">
              Enter how many equal parts to divide the PDF into.
              {pageCount && ` (Total pages: ${pageCount})`}
            </p>
          </div>
        </div>
      );

    case "break-pdf":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sections">Page Sections</Label>
            <Input
              id="sections"
              placeholder="e.g., 1-5,6-10,11-15"
              value={options.sections || ""}
              onChange={(e) => updateOption("sections", e.target.value)}
              data-testid="input-sections"
            />
            <p className="text-sm text-muted-foreground">
              Enter page ranges separated by commas to define each section.
              {pageCount && ` (Total pages: ${pageCount})`}
            </p>
          </div>
        </div>
      );

    case "pdf-splitter":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pages">Pages to extract</Label>
            <Input
              id="pages"
              placeholder="e.g., 1,3,5-10"
              value={options.pages || ""}
              onChange={(e) => updateOption("pages", e.target.value)}
              data-testid="input-pages"
            />
            <p className="text-sm text-muted-foreground">
              Enter page numbers separated by commas. Use hyphen for ranges.
              {pageCount && ` (Total pages: ${pageCount})`}
            </p>
          </div>
        </div>
      );

    case "split-by-size":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sizeLimitMB">Maximum File Size (MB)</Label>
            <Input
              id="sizeLimitMB"
              type="number"
              min={0.1}
              step={0.1}
              placeholder="5"
              value={options.sizeLimitMB || 5}
              onChange={(e) => updateOption("sizeLimitMB", parseFloat(e.target.value) || 5)}
              data-testid="input-size-limit"
            />
            <p className="text-sm text-muted-foreground">
              Each output file will not exceed this size limit.
            </p>
          </div>
        </div>
      );

    case "split-by-text":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="searchText">Split Text Pattern</Label>
            <Input
              id="searchText"
              placeholder="e.g., Chapter, Section"
              value={options.searchText || ""}
              onChange={(e) => updateOption("searchText", e.target.value)}
              data-testid="input-search-text"
            />
            <p className="text-sm text-muted-foreground">
              Enter text that marks section boundaries in your PDF.
            </p>
          </div>
        </div>
      );

    case "split-every-x-pages":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pageInterval">Page Interval</Label>
            <Input
              id="pageInterval"
              type="number"
              min={1}
              placeholder="5"
              value={options.pageInterval || 5}
              onChange={(e) => updateOption("pageInterval", parseInt(e.target.value) || 5)}
              data-testid="input-page-interval"
            />
            <p className="text-sm text-muted-foreground">
              Split PDF every X pages. {pageCount && `(Total pages: ${pageCount})`}
            </p>
          </div>
        </div>
      );

    case "extract-pages":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pages">Page Ranges to Extract</Label>
            <Input
              id="pages"
              placeholder="e.g., 1-5, 10-15, 20-25"
              value={options.pages || ""}
              onChange={(e) => updateOption("pages", e.target.value)}
              data-testid="input-pages"
            />
            <p className="text-sm text-muted-foreground">
              Each range creates a separate PDF file.
              {pageCount && ` (Total pages: ${pageCount})`}
            </p>
          </div>
        </div>
      );

    case "page-remover":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pages">Pages to Remove</Label>
            <Input
              id="pages"
              placeholder="e.g., 1,3,5-10"
              value={options.pages || ""}
              onChange={(e) => updateOption("pages", e.target.value)}
              data-testid="input-pages"
            />
            <p className="text-sm text-muted-foreground">
              Enter page numbers to remove. Use comma for multiple, hyphen for ranges.
              {pageCount && ` (Total pages: ${pageCount})`}
            </p>
          </div>
        </div>
      );

    case "extract-specific":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pages">Pages to Extract</Label>
            <Input
              id="pages"
              placeholder="e.g., 1,5,10-15"
              value={options.pages || ""}
              onChange={(e) => updateOption("pages", e.target.value)}
              data-testid="input-pages"
            />
            <p className="text-sm text-muted-foreground">
              Selected pages will be combined into a single PDF.
              {pageCount && ` (Total pages: ${pageCount})`}
            </p>
          </div>
        </div>
      );

    case "split-odd-pages":
    case "split-even-pages":
    case "pdf-breaker":
    case "extract-attachments":
    case "extract-images":
      return null;

    case "organize-pages":
    case "reorder-pages":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pageOrder">New Page Order</Label>
            <Input
              id="pageOrder"
              placeholder="e.g., 3,1,2,5,4"
              value={options.pageOrder || ""}
              onChange={(e) => updateOption("pageOrder", e.target.value)}
              data-testid="input-page-order"
            />
            <p className="text-sm text-muted-foreground">
              Enter the new page order as comma-separated page numbers.
              {pageCount && ` (Total pages: ${pageCount})`}
            </p>
          </div>
        </div>
      );

    case "sort-pages":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Sort Order</Label>
            <Select
              value={options.sortOrder || "reverse"}
              onValueChange={(value) =>
                updateOption("sortOrder", value as "ascending" | "descending" | "reverse")
              }
            >
              <SelectTrigger data-testid="select-sort-order">
                <SelectValue placeholder="Select sort order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ascending">Ascending (1, 2, 3...)</SelectItem>
                <SelectItem value="descending">Descending (last to first)</SelectItem>
                <SelectItem value="reverse">Reverse Order</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );

    case "move-pages":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="moveFrom">Page to Move</Label>
            <Input
              id="moveFrom"
              type="number"
              min={1}
              placeholder="Source page number"
              value={options.moveFrom || ""}
              onChange={(e) => updateOption("moveFrom", parseInt(e.target.value) || undefined)}
              data-testid="input-move-from"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="moveTo">Move to Position</Label>
            <Input
              id="moveTo"
              type="number"
              min={1}
              placeholder="Destination position"
              value={options.moveTo || ""}
              onChange={(e) => updateOption("moveTo", parseInt(e.target.value) || undefined)}
              data-testid="input-move-to"
            />
            <p className="text-sm text-muted-foreground">
              Move a page from one position to another.
              {pageCount && ` (Total pages: ${pageCount})`}
            </p>
          </div>
        </div>
      );

    case "insert-blank-page":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="insertPosition">Insert Position</Label>
            <Input
              id="insertPosition"
              type="number"
              min={1}
              placeholder="Position to insert blank page"
              value={options.insertPosition || 1}
              onChange={(e) => updateOption("insertPosition", parseInt(e.target.value) || 1)}
              data-testid="input-insert-position"
            />
            <p className="text-sm text-muted-foreground">
              Insert a blank page before this position.
              {pageCount && ` (Valid: 1 to ${pageCount + 1})`}
            </p>
          </div>
        </div>
      );

    case "add-pages":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Insert Position</Label>
            <Select
              value={options.addPagesPosition || "end"}
              onValueChange={(value) =>
                updateOption("addPagesPosition", value as "start" | "end" | "after")
              }
            >
              <SelectTrigger data-testid="select-add-position">
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="start">At the beginning</SelectItem>
                <SelectItem value="end">At the end</SelectItem>
                <SelectItem value="after">After specific page</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {options.addPagesPosition === "after" && (
            <div className="space-y-2">
              <Label htmlFor="insertAfterPage">Insert After Page</Label>
              <Input
                id="insertAfterPage"
                type="number"
                min={1}
                placeholder="Page number"
                value={options.insertAfterPage || 1}
                onChange={(e) => updateOption("insertAfterPage", parseInt(e.target.value) || 1)}
                data-testid="input-insert-after"
              />
              <p className="text-sm text-muted-foreground">
                New pages will be inserted after this page number.
              </p>
            </div>
          )}
        </div>
      );

    case "duplicate-pages":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="duplicatePages">Pages to Duplicate</Label>
            <Input
              id="duplicatePages"
              placeholder="e.g., 1,3,5-7"
              value={options.duplicatePages || ""}
              onChange={(e) => updateOption("duplicatePages", e.target.value)}
              data-testid="input-duplicate-pages"
            />
            <p className="text-sm text-muted-foreground">
              Enter page numbers to duplicate. Use comma for multiple, hyphen for ranges.
              {pageCount && ` (Total pages: ${pageCount})`}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="duplicateCount">Number of Copies</Label>
            <Input
              id="duplicateCount"
              type="number"
              min={1}
              max={10}
              placeholder="1"
              value={options.duplicateCount || 1}
              onChange={(e) => updateOption("duplicateCount", parseInt(e.target.value) || 1)}
              data-testid="input-duplicate-count"
            />
            <p className="text-sm text-muted-foreground">
              How many copies to create for each selected page (max 10).
            </p>
          </div>
        </div>
      );

    case "pdf-page-manager":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pageOrder">Page Order</Label>
            <Input
              id="pageOrder"
              placeholder="e.g., 3,1,2,5,4"
              value={options.pageOrder || ""}
              onChange={(e) => updateOption("pageOrder", e.target.value)}
              data-testid="input-page-order"
            />
            <p className="text-sm text-muted-foreground">
              Enter the desired page order. Pages not listed will be removed.
              {pageCount && ` (Total pages: ${pageCount})`}
            </p>
          </div>
        </div>
      );

    case "reverse-pages":
      return null;

    case "scan-to-pdf":
      return null;

    case "repair-pdf":
    case "fix-pdf":
    case "recover-pdf-data":
    case "repair-corrupt-pdf":
    case "pdf-repair-tool":
      return null;

    case "ocr-pdf":
    case "scanned-pdf-to-text":
    case "pdf-ocr":
    case "searchable-pdf-creator":
    case "ocr-to-word":
    case "ocr-to-excel":
    case "image-to-text":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>OCR Language</Label>
            <Select
              value={options.ocrLanguage || "eng"}
              onValueChange={(value) => updateOption("ocrLanguage", value as ToolOptions["ocrLanguage"])}
            >
              <SelectTrigger data-testid="select-ocr-language">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="eng">English</SelectItem>
                <SelectItem value="spa">Spanish</SelectItem>
                <SelectItem value="fra">French</SelectItem>
                <SelectItem value="deu">German</SelectItem>
                <SelectItem value="ita">Italian</SelectItem>
                <SelectItem value="por">Portuguese</SelectItem>
                <SelectItem value="rus">Russian</SelectItem>
                <SelectItem value="chi_sim">Chinese (Simplified)</SelectItem>
                <SelectItem value="chi_tra">Chinese (Traditional)</SelectItem>
                <SelectItem value="jpn">Japanese</SelectItem>
                <SelectItem value="kor">Korean</SelectItem>
                <SelectItem value="ara">Arabic</SelectItem>
                <SelectItem value="hin">Hindi</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Select the language of the text in your scanned document.
            </p>
          </div>
        </div>
      );

    case "downsample-pdf-images":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Target DPI</Label>
            <Select
              value={String(options.downsampleDpi || 150)}
              onValueChange={(value) => updateOption("downsampleDpi", parseInt(value))}
            >
              <SelectTrigger data-testid="select-dpi">
                <SelectValue placeholder="Select DPI" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="72">72 DPI (Web/Screen)</SelectItem>
                <SelectItem value="96">96 DPI (Standard Screen)</SelectItem>
                <SelectItem value="150">150 DPI (Balanced)</SelectItem>
                <SelectItem value="200">200 DPI (Good Quality)</SelectItem>
                <SelectItem value="300">300 DPI (Print Quality)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Lower DPI means smaller file size but reduced image quality.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Image Quality</Label>
            <Select
              value={String(options.imageQuality || 80)}
              onValueChange={(value) => updateOption("imageQuality", parseInt(value))}
            >
              <SelectTrigger data-testid="select-quality">
                <SelectValue placeholder="Select quality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="50">50% (Small file)</SelectItem>
                <SelectItem value="65">65% (Balanced)</SelectItem>
                <SelectItem value="80">80% (Good quality)</SelectItem>
                <SelectItem value="90">90% (High quality)</SelectItem>
                <SelectItem value="100">100% (Maximum quality)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Image compression quality after downsampling.
            </p>
          </div>
        </div>
      );

    case "linearize-pdf":
    case "pdf-fast-web-view":
    case "pdf-optimizer-remove-unused":
    case "pdf-font-subsetter":
    case "word-to-pdf":
    case "doc-to-pdf":
    case "docx-to-pdf":
      return null;

    case "pdf-to-png-transparent":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Output DPI (Resolution)</Label>
            <Select
              value={String(options.pngDpi || 150)}
              onValueChange={(value) => updateOption("pngDpi", parseInt(value))}
            >
              <SelectTrigger data-testid="select-png-dpi">
                <SelectValue placeholder="Select DPI" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="72">72 DPI (Web/Screen)</SelectItem>
                <SelectItem value="150">150 DPI (Standard)</SelectItem>
                <SelectItem value="300">300 DPI (High Quality)</SelectItem>
                <SelectItem value="600">600 DPI (Print Quality)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Higher DPI produces larger, sharper images with transparent backgrounds.
            </p>
          </div>
        </div>
      );

    case "pdf-to-tiff-multipage":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Output DPI (Resolution)</Label>
            <Select
              value={String(options.tiffDpi || 200)}
              onValueChange={(value) => updateOption("tiffDpi", parseInt(value))}
            >
              <SelectTrigger data-testid="select-tiff-dpi">
                <SelectValue placeholder="Select DPI" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="150">150 DPI (Balanced)</SelectItem>
                <SelectItem value="200">200 DPI (Good Quality)</SelectItem>
                <SelectItem value="300">300 DPI (High Quality)</SelectItem>
                <SelectItem value="600">600 DPI (Archival Quality)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Higher DPI produces larger files with better detail for archival.
            </p>
          </div>
        </div>
      );

    case "pdf-to-word-layout":
    case "pdf-to-word-flow":
    case "pdf-to-ppt-editable":
    case "pdf-to-ppt-images":
      return null;

    case "edit-pdf":
    case "pdf-editor":
    case "add-text-to-pdf":
    case "edit-pdf-text":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="textContent">Text to Add</Label>
            <Input
              id="textContent"
              placeholder="Enter the text you want to add..."
              value={options.textContent || ""}
              onChange={(e) => updateOption("textContent", e.target.value)}
              data-testid="input-text-content"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="textX">X Position (pixels from left)</Label>
              <Input
                id="textX"
                type="number"
                placeholder="50"
                value={options.textX || ""}
                onChange={(e) => updateOption("textX", parseInt(e.target.value) || undefined)}
                data-testid="input-text-x"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="textY">Y Position (pixels from bottom)</Label>
              <Input
                id="textY"
                type="number"
                placeholder="700"
                value={options.textY || ""}
                onChange={(e) => updateOption("textY", parseInt(e.target.value) || undefined)}
                data-testid="input-text-y"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Font Size</Label>
              <Select
                value={String(options.fontSize || 12)}
                onValueChange={(value) => updateOption("fontSize", parseInt(value))}
              >
                <SelectTrigger data-testid="select-font-size">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="8">8pt</SelectItem>
                  <SelectItem value="10">10pt</SelectItem>
                  <SelectItem value="12">12pt</SelectItem>
                  <SelectItem value="14">14pt</SelectItem>
                  <SelectItem value="16">16pt</SelectItem>
                  <SelectItem value="18">18pt</SelectItem>
                  <SelectItem value="24">24pt</SelectItem>
                  <SelectItem value="36">36pt</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fontColor">Font Color</Label>
              <Input
                id="fontColor"
                type="color"
                value={options.fontColor || "#000000"}
                onChange={(e) => updateOption("fontColor", e.target.value)}
                className="h-9 cursor-pointer"
                data-testid="input-font-color"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="targetPage">Target Page</Label>
            <Input
              id="targetPage"
              type="number"
              placeholder="1"
              min={1}
              value={options.targetPage || ""}
              onChange={(e) => updateOption("targetPage", parseInt(e.target.value) || undefined)}
              data-testid="input-target-page"
            />
            <p className="text-sm text-muted-foreground">
              Page number where the text will be added.
              {pageCount && ` (Total pages: ${pageCount})`}
            </p>
          </div>
        </div>
      );

    case "add-image-to-pdf":
      return (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Upload a PDF and an image file together. The image will be added to the selected page.
          </p>
          <div className="space-y-2">
            <Label>Image Position</Label>
            <Select
              value={options.imagePosition || "center"}
              onValueChange={(value) => updateOption("imagePosition", value as ToolOptions["imagePosition"])}
            >
              <SelectTrigger data-testid="select-image-position">
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="top-left">Top Left</SelectItem>
                <SelectItem value="top-right">Top Right</SelectItem>
                <SelectItem value="bottom-left">Bottom Left</SelectItem>
                <SelectItem value="bottom-right">Bottom Right</SelectItem>
                <SelectItem value="custom">Custom Position</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {options.imagePosition === "custom" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="imageX">X Position (pixels)</Label>
                <Input
                  id="imageX"
                  type="number"
                  placeholder="50"
                  value={options.imageX || ""}
                  onChange={(e) => updateOption("imageX", parseInt(e.target.value) || undefined)}
                  data-testid="input-image-x"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="imageY">Y Position (pixels)</Label>
                <Input
                  id="imageY"
                  type="number"
                  placeholder="50"
                  value={options.imageY || ""}
                  onChange={(e) => updateOption("imageY", parseInt(e.target.value) || undefined)}
                  data-testid="input-image-y"
                />
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="imageWidth">Width (pixels)</Label>
              <Input
                id="imageWidth"
                type="number"
                placeholder="200"
                value={options.imageWidth || ""}
                onChange={(e) => updateOption("imageWidth", parseInt(e.target.value) || undefined)}
                data-testid="input-image-width"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="imageHeight">Height (pixels)</Label>
              <Input
                id="imageHeight"
                type="number"
                placeholder="200"
                value={options.imageHeight || ""}
                onChange={(e) => updateOption("imageHeight", parseInt(e.target.value) || undefined)}
                data-testid="input-image-height"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="targetPage">Target Page</Label>
            <Input
              id="targetPage"
              type="number"
              placeholder="1"
              min={1}
              value={options.targetPage || ""}
              onChange={(e) => updateOption("targetPage", parseInt(e.target.value) || undefined)}
              data-testid="input-target-page"
            />
            <p className="text-sm text-muted-foreground">
              Page number where the image will be added.
              {pageCount && ` (Total pages: ${pageCount})`}
            </p>
          </div>
        </div>
      );

    case "replace-image-in-pdf":
      return (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Upload a PDF and a new image file. The new image will replace existing content on the selected page.
          </p>
          <div className="space-y-2">
            <Label htmlFor="targetPage">Target Page</Label>
            <Input
              id="targetPage"
              type="number"
              placeholder="1"
              min={1}
              value={options.targetPage || ""}
              onChange={(e) => updateOption("targetPage", parseInt(e.target.value) || undefined)}
              data-testid="input-target-page"
            />
            <p className="text-sm text-muted-foreground">
              Page number where the image will be placed.
              {pageCount && ` (Total pages: ${pageCount})`}
            </p>
          </div>
        </div>
      );

    case "add-shapes-to-pdf":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Shape Type</Label>
            <Select
              value={options.shapeType || "rectangle"}
              onValueChange={(value) => updateOption("shapeType", value as ToolOptions["shapeType"])}
            >
              <SelectTrigger data-testid="select-shape-type">
                <SelectValue placeholder="Select shape" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rectangle">Rectangle</SelectItem>
                <SelectItem value="circle">Circle</SelectItem>
                <SelectItem value="ellipse">Ellipse</SelectItem>
                <SelectItem value="line">Line</SelectItem>
                <SelectItem value="arrow">Arrow</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shapeX">X Position</Label>
              <Input
                id="shapeX"
                type="number"
                placeholder="100"
                value={options.shapeX || ""}
                onChange={(e) => updateOption("shapeX", parseInt(e.target.value) || undefined)}
                data-testid="input-shape-x"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shapeY">Y Position</Label>
              <Input
                id="shapeY"
                type="number"
                placeholder="100"
                value={options.shapeY || ""}
                onChange={(e) => updateOption("shapeY", parseInt(e.target.value) || undefined)}
                data-testid="input-shape-y"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shapeWidth">Width</Label>
              <Input
                id="shapeWidth"
                type="number"
                placeholder="100"
                value={options.shapeWidth || ""}
                onChange={(e) => updateOption("shapeWidth", parseInt(e.target.value) || undefined)}
                data-testid="input-shape-width"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shapeHeight">Height</Label>
              <Input
                id="shapeHeight"
                type="number"
                placeholder="100"
                value={options.shapeHeight || ""}
                onChange={(e) => updateOption("shapeHeight", parseInt(e.target.value) || undefined)}
                data-testid="input-shape-height"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shapeColor">Stroke Color</Label>
              <Input
                id="shapeColor"
                type="color"
                value={options.shapeColor || "#0000FF"}
                onChange={(e) => updateOption("shapeColor", e.target.value)}
                className="h-9 cursor-pointer"
                data-testid="input-shape-color"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shapeFillColor">Fill Color (optional)</Label>
              <Input
                id="shapeFillColor"
                type="color"
                value={options.shapeFillColor || "#ffffff"}
                onChange={(e) => updateOption("shapeFillColor", e.target.value)}
                className="h-9 cursor-pointer"
                data-testid="input-shape-fill-color"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shapeStrokeWidth">Stroke Width</Label>
              <Input
                id="shapeStrokeWidth"
                type="number"
                placeholder="2"
                min={1}
                max={10}
                value={options.shapeStrokeWidth || ""}
                onChange={(e) => updateOption("shapeStrokeWidth", parseInt(e.target.value) || undefined)}
                data-testid="input-shape-stroke-width"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetPage">Target Page</Label>
              <Input
                id="targetPage"
                type="number"
                placeholder="1"
                min={1}
                value={options.targetPage || ""}
                onChange={(e) => updateOption("targetPage", parseInt(e.target.value) || undefined)}
                data-testid="input-target-page"
              />
            </div>
          </div>
        </div>
      );

    case "draw-on-pdf":
      return (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Add a freehand drawing effect to your PDF. A sample circle will be drawn on the specified page.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="drawColor">Draw Color</Label>
              <Input
                id="drawColor"
                type="color"
                value={options.drawColor || "#000000"}
                onChange={(e) => updateOption("drawColor", e.target.value)}
                className="h-9 cursor-pointer"
                data-testid="input-draw-color"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="drawStrokeWidth">Stroke Width</Label>
              <Input
                id="drawStrokeWidth"
                type="number"
                placeholder="2"
                min={1}
                max={10}
                value={options.drawStrokeWidth || ""}
                onChange={(e) => updateOption("drawStrokeWidth", parseInt(e.target.value) || undefined)}
                data-testid="input-draw-stroke-width"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="targetPage">Target Page</Label>
            <Input
              id="targetPage"
              type="number"
              placeholder="1"
              min={1}
              value={options.targetPage || ""}
              onChange={(e) => updateOption("targetPage", parseInt(e.target.value) || undefined)}
              data-testid="input-target-page"
            />
            <p className="text-sm text-muted-foreground">
              {pageCount && `Total pages: ${pageCount}`}
            </p>
          </div>
        </div>
      );

    case "pdf-annotator":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Annotation Type</Label>
            <Select
              value={options.annotationType || "highlight"}
              onValueChange={(value) => updateOption("annotationType", value as ToolOptions["annotationType"])}
            >
              <SelectTrigger data-testid="select-annotation-type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="highlight">Highlight</SelectItem>
                <SelectItem value="underline">Underline</SelectItem>
                <SelectItem value="strikethrough">Strikethrough</SelectItem>
                <SelectItem value="note">Note</SelectItem>
                <SelectItem value="freehand">Freehand</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="annotationColor">Annotation Color</Label>
              <Input
                id="annotationColor"
                type="color"
                value={options.annotationColor || "#FFFF00"}
                onChange={(e) => updateOption("annotationColor", e.target.value)}
                className="h-9 cursor-pointer"
                data-testid="input-annotation-color"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetPage">Target Page</Label>
              <Input
                id="targetPage"
                type="number"
                placeholder="1"
                min={1}
                value={options.targetPage || ""}
                onChange={(e) => updateOption("targetPage", parseInt(e.target.value) || undefined)}
                data-testid="input-target-page"
              />
            </div>
          </div>
          {options.annotationType === "note" && (
            <div className="space-y-2">
              <Label htmlFor="annotationText">Note Text</Label>
              <Input
                id="annotationText"
                placeholder="Enter your note..."
                value={options.annotationText || ""}
                onChange={(e) => updateOption("annotationText", e.target.value)}
                data-testid="input-annotation-text"
              />
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="textX">X Position</Label>
              <Input
                id="textX"
                type="number"
                placeholder="50"
                value={options.textX || ""}
                onChange={(e) => updateOption("textX", parseInt(e.target.value) || undefined)}
                data-testid="input-text-x"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="textY">Y Position</Label>
              <Input
                id="textY"
                type="number"
                placeholder="700"
                value={options.textY || ""}
                onChange={(e) => updateOption("textY", parseInt(e.target.value) || undefined)}
                data-testid="input-text-y"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shapeWidth">Width</Label>
              <Input
                id="shapeWidth"
                type="number"
                placeholder="200"
                value={options.shapeWidth || ""}
                onChange={(e) => updateOption("shapeWidth", parseInt(e.target.value) || undefined)}
                data-testid="input-shape-width"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shapeHeight">Height</Label>
              <Input
                id="shapeHeight"
                type="number"
                placeholder="20"
                value={options.shapeHeight || ""}
                onChange={(e) => updateOption("shapeHeight", parseInt(e.target.value) || undefined)}
                data-testid="input-shape-height"
              />
            </div>
          </div>
        </div>
      );

    case "annotate-pdf":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="annotationText">Annotation Text</Label>
            <Input
              id="annotationText"
              placeholder="Enter your annotation..."
              value={options.annotationText || ""}
              onChange={(e) => updateOption("annotationText", e.target.value)}
              data-testid="input-annotation-text"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="annotationColor">Annotation Color</Label>
              <Input
                id="annotationColor"
                type="color"
                value={options.annotationColor || "#FFFF00"}
                onChange={(e) => updateOption("annotationColor", e.target.value)}
                className="h-9 cursor-pointer"
                data-testid="input-annotation-color"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetPage">Target Page</Label>
              <Input
                id="targetPage"
                type="number"
                placeholder="1"
                min={1}
                value={options.targetPage || ""}
                onChange={(e) => updateOption("targetPage", parseInt(e.target.value) || undefined)}
                data-testid="input-target-page"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="textX">X Position</Label>
              <Input
                id="textX"
                type="number"
                placeholder="50"
                value={options.textX || ""}
                onChange={(e) => updateOption("textX", parseInt(e.target.value) || undefined)}
                data-testid="input-text-x"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="textY">Y Position</Label>
              <Input
                id="textY"
                type="number"
                placeholder="700"
                value={options.textY || ""}
                onChange={(e) => updateOption("textY", parseInt(e.target.value) || undefined)}
                data-testid="input-text-y"
              />
            </div>
          </div>
        </div>
      );

    case "highlight-pdf-text":
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="highlightColor">Highlight Color</Label>
              <Input
                id="highlightColor"
                type="color"
                value={options.highlightColor || "#FFFF00"}
                onChange={(e) => updateOption("highlightColor", e.target.value)}
                className="h-9 cursor-pointer"
                data-testid="input-highlight-color"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="annotationOpacity">Opacity (0.1 - 1.0)</Label>
              <Input
                id="annotationOpacity"
                type="number"
                placeholder="0.5"
                min={0.1}
                max={1}
                step={0.1}
                value={options.annotationOpacity || ""}
                onChange={(e) => updateOption("annotationOpacity", parseFloat(e.target.value) || undefined)}
                data-testid="input-annotation-opacity"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="textX">X Position</Label>
              <Input
                id="textX"
                type="number"
                placeholder="50"
                value={options.textX || ""}
                onChange={(e) => updateOption("textX", parseInt(e.target.value) || undefined)}
                data-testid="input-text-x"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="textY">Y Position</Label>
              <Input
                id="textY"
                type="number"
                placeholder="700"
                value={options.textY || ""}
                onChange={(e) => updateOption("textY", parseInt(e.target.value) || undefined)}
                data-testid="input-text-y"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shapeWidth">Width</Label>
              <Input
                id="shapeWidth"
                type="number"
                placeholder="200"
                value={options.shapeWidth || ""}
                onChange={(e) => updateOption("shapeWidth", parseInt(e.target.value) || undefined)}
                data-testid="input-shape-width"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shapeHeight">Height</Label>
              <Input
                id="shapeHeight"
                type="number"
                placeholder="20"
                value={options.shapeHeight || ""}
                onChange={(e) => updateOption("shapeHeight", parseInt(e.target.value) || undefined)}
                data-testid="input-shape-height"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="targetPage">Target Page</Label>
            <Input
              id="targetPage"
              type="number"
              placeholder="1"
              min={1}
              value={options.targetPage || ""}
              onChange={(e) => updateOption("targetPage", parseInt(e.target.value) || undefined)}
              data-testid="input-target-page"
            />
            <p className="text-sm text-muted-foreground">
              {pageCount && `Total pages: ${pageCount}`}
            </p>
          </div>
        </div>
      );

    case "underline-pdf-text":
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="annotationColor">Underline Color</Label>
              <Input
                id="annotationColor"
                type="color"
                value={options.annotationColor || "#0000FF"}
                onChange={(e) => updateOption("annotationColor", e.target.value)}
                className="h-9 cursor-pointer"
                data-testid="input-annotation-color"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shapeStrokeWidth">Line Thickness</Label>
              <Input
                id="shapeStrokeWidth"
                type="number"
                placeholder="2"
                min={1}
                max={5}
                value={options.shapeStrokeWidth || ""}
                onChange={(e) => updateOption("shapeStrokeWidth", parseInt(e.target.value) || undefined)}
                data-testid="input-shape-stroke-width"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="textX">X Position</Label>
              <Input
                id="textX"
                type="number"
                placeholder="50"
                value={options.textX || ""}
                onChange={(e) => updateOption("textX", parseInt(e.target.value) || undefined)}
                data-testid="input-text-x"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="textY">Y Position</Label>
              <Input
                id="textY"
                type="number"
                placeholder="700"
                value={options.textY || ""}
                onChange={(e) => updateOption("textY", parseInt(e.target.value) || undefined)}
                data-testid="input-text-y"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shapeWidth">Width</Label>
              <Input
                id="shapeWidth"
                type="number"
                placeholder="200"
                value={options.shapeWidth || ""}
                onChange={(e) => updateOption("shapeWidth", parseInt(e.target.value) || undefined)}
                data-testid="input-shape-width"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetPage">Target Page</Label>
              <Input
                id="targetPage"
                type="number"
                placeholder="1"
                min={1}
                value={options.targetPage || ""}
                onChange={(e) => updateOption("targetPage", parseInt(e.target.value) || undefined)}
                data-testid="input-target-page"
              />
            </div>
          </div>
        </div>
      );

    case "strikethrough-pdf-text":
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="annotationColor">Strikethrough Color</Label>
              <Input
                id="annotationColor"
                type="color"
                value={options.annotationColor || "#FF0000"}
                onChange={(e) => updateOption("annotationColor", e.target.value)}
                className="h-9 cursor-pointer"
                data-testid="input-annotation-color"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shapeStrokeWidth">Line Thickness</Label>
              <Input
                id="shapeStrokeWidth"
                type="number"
                placeholder="2"
                min={1}
                max={5}
                value={options.shapeStrokeWidth || ""}
                onChange={(e) => updateOption("shapeStrokeWidth", parseInt(e.target.value) || undefined)}
                data-testid="input-shape-stroke-width"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="textX">X Position</Label>
              <Input
                id="textX"
                type="number"
                placeholder="50"
                value={options.textX || ""}
                onChange={(e) => updateOption("textX", parseInt(e.target.value) || undefined)}
                data-testid="input-text-x"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="textY">Y Position</Label>
              <Input
                id="textY"
                type="number"
                placeholder="700"
                value={options.textY || ""}
                onChange={(e) => updateOption("textY", parseInt(e.target.value) || undefined)}
                data-testid="input-text-y"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shapeWidth">Width</Label>
              <Input
                id="shapeWidth"
                type="number"
                placeholder="200"
                value={options.shapeWidth || ""}
                onChange={(e) => updateOption("shapeWidth", parseInt(e.target.value) || undefined)}
                data-testid="input-shape-width"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetPage">Target Page</Label>
              <Input
                id="targetPage"
                type="number"
                placeholder="1"
                min={1}
                value={options.targetPage || ""}
                onChange={(e) => updateOption("targetPage", parseInt(e.target.value) || undefined)}
                data-testid="input-target-page"
              />
            </div>
          </div>
        </div>
      );

    case "pdf-marker":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Marker Type</Label>
            <Select
              value={options.annotationType || "highlight"}
              onValueChange={(value) => updateOption("annotationType", value as ToolOptions["annotationType"])}
            >
              <SelectTrigger data-testid="select-marker-type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="highlight">Highlight</SelectItem>
                <SelectItem value="underline">Underline</SelectItem>
                <SelectItem value="strikethrough">Strikethrough</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="markerColor">Marker Color</Label>
              <Input
                id="markerColor"
                type="color"
                value={options.markerColor || "#FFFF00"}
                onChange={(e) => updateOption("markerColor", e.target.value)}
                className="h-9 cursor-pointer"
                data-testid="input-marker-color"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetPage">Target Page</Label>
              <Input
                id="targetPage"
                type="number"
                placeholder="1"
                min={1}
                value={options.targetPage || ""}
                onChange={(e) => updateOption("targetPage", parseInt(e.target.value) || undefined)}
                data-testid="input-target-page"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="textX">X Position</Label>
              <Input
                id="textX"
                type="number"
                placeholder="50"
                value={options.textX || ""}
                onChange={(e) => updateOption("textX", parseInt(e.target.value) || undefined)}
                data-testid="input-text-x"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="textY">Y Position</Label>
              <Input
                id="textY"
                type="number"
                placeholder="700"
                value={options.textY || ""}
                onChange={(e) => updateOption("textY", parseInt(e.target.value) || undefined)}
                data-testid="input-text-y"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shapeWidth">Width</Label>
              <Input
                id="shapeWidth"
                type="number"
                placeholder="200"
                value={options.shapeWidth || ""}
                onChange={(e) => updateOption("shapeWidth", parseInt(e.target.value) || undefined)}
                data-testid="input-shape-width"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shapeHeight">Height</Label>
              <Input
                id="shapeHeight"
                type="number"
                placeholder="20"
                value={options.shapeHeight || ""}
                onChange={(e) => updateOption("shapeHeight", parseInt(e.target.value) || undefined)}
                data-testid="input-shape-height"
              />
            </div>
          </div>
        </div>
      );

    case "add-comments-to-pdf":
    case "pdf-commenter":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="commentText">Comment Text</Label>
            <Input
              id="commentText"
              placeholder="Enter your comment"
              value={options.commentText || ""}
              onChange={(e) => updateOption("commentText", e.target.value)}
              data-testid="input-comment-text"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="commentAuthor">Author Name</Label>
            <Input
              id="commentAuthor"
              placeholder="Your name"
              value={options.commentAuthor || ""}
              onChange={(e) => updateOption("commentAuthor", e.target.value)}
              data-testid="input-comment-author"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="commentPage">Page Number</Label>
              <Input
                id="commentPage"
                type="number"
                placeholder="1"
                min={1}
                value={options.commentPage || ""}
                onChange={(e) => updateOption("commentPage", parseInt(e.target.value) || undefined)}
                data-testid="input-comment-page"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="commentX">X Position</Label>
              <Input
                id="commentX"
                type="number"
                placeholder="50"
                value={options.commentX || ""}
                onChange={(e) => updateOption("commentX", parseInt(e.target.value) || undefined)}
                data-testid="input-comment-x"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="commentY">Y Position</Label>
              <Input
                id="commentY"
                type="number"
                placeholder="700"
                value={options.commentY || ""}
                onChange={(e) => updateOption("commentY", parseInt(e.target.value) || undefined)}
                data-testid="input-comment-y"
              />
            </div>
          </div>
        </div>
      );

    case "flatten-pdf":
    case "flatten-pdf-comments":
    case "flatten-pdf-layers":
      return null;

    case "add-hyperlink-to-pdf":
    case "pdf-link-editor":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="hyperlinkUrl">Link URL</Label>
            <Input
              id="hyperlinkUrl"
              placeholder="https://example.com"
              value={options.hyperlinkUrl || ""}
              onChange={(e) => updateOption("hyperlinkUrl", e.target.value)}
              data-testid="input-hyperlink-url"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hyperlinkPage">Page Number</Label>
              <Input
                id="hyperlinkPage"
                type="number"
                placeholder="1"
                min={1}
                value={options.hyperlinkPage || ""}
                onChange={(e) => updateOption("hyperlinkPage", parseInt(e.target.value) || undefined)}
                data-testid="input-hyperlink-page"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hyperlinkX">X Position</Label>
              <Input
                id="hyperlinkX"
                type="number"
                placeholder="50"
                value={options.hyperlinkX || ""}
                onChange={(e) => updateOption("hyperlinkX", parseInt(e.target.value) || undefined)}
                data-testid="input-hyperlink-x"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hyperlinkY">Y Position</Label>
              <Input
                id="hyperlinkY"
                type="number"
                placeholder="700"
                value={options.hyperlinkY || ""}
                onChange={(e) => updateOption("hyperlinkY", parseInt(e.target.value) || undefined)}
                data-testid="input-hyperlink-y"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hyperlinkWidth">Link Width</Label>
              <Input
                id="hyperlinkWidth"
                type="number"
                placeholder="100"
                value={options.hyperlinkWidth || ""}
                onChange={(e) => updateOption("hyperlinkWidth", parseInt(e.target.value) || undefined)}
                data-testid="input-hyperlink-width"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hyperlinkHeight">Link Height</Label>
              <Input
                id="hyperlinkHeight"
                type="number"
                placeholder="20"
                value={options.hyperlinkHeight || ""}
                onChange={(e) => updateOption("hyperlinkHeight", parseInt(e.target.value) || undefined)}
                data-testid="input-hyperlink-height"
              />
            </div>
          </div>
        </div>
      );

    case "edit-pdf-metadata":
    case "pdf-metadata-editor":
    case "change-pdf-metadata":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="metadataTitle">Document Title</Label>
            <Input
              id="metadataTitle"
              placeholder="Enter document title"
              value={options.metadataTitle || ""}
              onChange={(e) => updateOption("metadataTitle", e.target.value)}
              data-testid="input-metadata-title"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="metadataAuthor">Author</Label>
            <Input
              id="metadataAuthor"
              placeholder="Enter author name"
              value={options.metadataAuthor || ""}
              onChange={(e) => updateOption("metadataAuthor", e.target.value)}
              data-testid="input-metadata-author"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="metadataSubject">Subject</Label>
            <Input
              id="metadataSubject"
              placeholder="Enter document subject"
              value={options.metadataSubject || ""}
              onChange={(e) => updateOption("metadataSubject", e.target.value)}
              data-testid="input-metadata-subject"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="metadataKeywords">Keywords</Label>
            <Input
              id="metadataKeywords"
              placeholder="keyword1, keyword2, keyword3"
              value={options.metadataKeywords || ""}
              onChange={(e) => updateOption("metadataKeywords", e.target.value)}
              data-testid="input-metadata-keywords"
            />
            <p className="text-sm text-muted-foreground">
              Separate keywords with commas
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="metadataCreator">Creator Application</Label>
            <Input
              id="metadataCreator"
              placeholder="Enter creator application"
              value={options.metadataCreator || ""}
              onChange={(e) => updateOption("metadataCreator", e.target.value)}
              data-testid="input-metadata-creator"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="metadataProducer">Producer</Label>
            <Input
              id="metadataProducer"
              placeholder="Enter producer"
              value={options.metadataProducer || ""}
              onChange={(e) => updateOption("metadataProducer", e.target.value)}
              data-testid="input-metadata-producer"
            />
          </div>
        </div>
      );

    case "pdf-booklet-maker":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bookletBinding">Binding Edge</Label>
            <Select
              value={options.bookletBinding || "left"}
              onValueChange={(value) => updateOption("bookletBinding", value as ToolOptions["bookletBinding"])}
            >
              <SelectTrigger id="bookletBinding" data-testid="select-booklet-binding">
                <SelectValue placeholder="Select binding edge" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left Edge (Standard)</SelectItem>
                <SelectItem value="right">Right Edge (RTL)</SelectItem>
                <SelectItem value="top">Top Edge</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bookletPageSize">Page Size</Label>
            <Select
              value={options.bookletPageSize || "letter"}
              onValueChange={(value) => updateOption("bookletPageSize", value as ToolOptions["bookletPageSize"])}
            >
              <SelectTrigger id="bookletPageSize" data-testid="select-booklet-page-size">
                <SelectValue placeholder="Select page size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="letter">Letter (8.5 x 11 in)</SelectItem>
                <SelectItem value="a4">A4 (210 x 297 mm)</SelectItem>
                <SelectItem value="a3">A3 (297 x 420 mm)</SelectItem>
                <SelectItem value="tabloid">Tabloid (11 x 17 in)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-muted-foreground">
            Creates booklet-ready PDF with proper page ordering for folding
          </p>
        </div>
      );

    case "impose-pdf":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="impositionLayout">Imposition Layout</Label>
            <Select
              value={options.impositionLayout || "2-up-saddle"}
              onValueChange={(value) => updateOption("impositionLayout", value as ToolOptions["impositionLayout"])}
            >
              <SelectTrigger id="impositionLayout" data-testid="select-imposition-layout">
                <SelectValue placeholder="Select layout" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2-up-saddle">2-Up Saddle Stitch</SelectItem>
                <SelectItem value="4-up-perfect">4-Up Perfect Binding</SelectItem>
                <SelectItem value="step-repeat">Step and Repeat</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="impositionSheetSize">Sheet Size</Label>
            <Select
              value={options.impositionSheetSize || "a3"}
              onValueChange={(value) => updateOption("impositionSheetSize", value as ToolOptions["impositionSheetSize"])}
            >
              <SelectTrigger id="impositionSheetSize" data-testid="select-imposition-sheet-size">
                <SelectValue placeholder="Select sheet size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="a3">A3</SelectItem>
                <SelectItem value="tabloid">Tabloid</SelectItem>
                <SelectItem value="a4">A4</SelectItem>
                <SelectItem value="letter">Letter</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-muted-foreground">
            Arrange pages on sheets for professional printing
          </p>
        </div>
      );

    case "pdf-handout-6up":
      return (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Creates 6-slide-per-page handouts from your PDF. Perfect for presentations and lecture materials.
          </p>
          <p className="text-sm text-muted-foreground">
            Each page will contain 6 slides arranged in a 2x3 grid with slide numbers.
          </p>
        </div>
      );

    case "add-gutter-margins":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="gutterSize">Gutter Size (points)</Label>
            <Input
              id="gutterSize"
              type="number"
              placeholder="36"
              min={1}
              max={144}
              value={options.gutterSize ?? ""}
              onChange={(e) => {
                const parsed = parseInt(e.target.value, 10);
                updateOption("gutterSize", isNaN(parsed) ? undefined : parsed);
              }}
              data-testid="input-gutter-size"
            />
            <p className="text-sm text-muted-foreground">
              72 points = 1 inch. Default: 36 points (0.5 inch)
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="gutterPosition">Gutter Position</Label>
            <Select
              value={options.gutterPosition || "left"}
              onValueChange={(value) => updateOption("gutterPosition", value as ToolOptions["gutterPosition"])}
            >
              <SelectTrigger id="gutterPosition" data-testid="select-gutter-position">
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left Side</SelectItem>
                <SelectItem value="right">Right Side</SelectItem>
                <SelectItem value="both">Mirror (Alternating)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );

    case "pdf-color-changer":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="colorChangeFrom">Color to Find</Label>
            <Input
              id="colorChangeFrom"
              type="color"
              value={options.colorChangeFrom || "#000000"}
              onChange={(e) => updateOption("colorChangeFrom", e.target.value)}
              data-testid="input-color-from"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="colorChangeTo">Replace With</Label>
            <Input
              id="colorChangeTo"
              type="color"
              value={options.colorChangeTo || "#0000FF"}
              onChange={(e) => updateOption("colorChangeTo", e.target.value)}
              data-testid="input-color-to"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="colorChangeMode">Match Mode</Label>
            <Select
              value={options.colorChangeMode || "exact"}
              onValueChange={(value) => updateOption("colorChangeMode", value as ToolOptions["colorChangeMode"])}
            >
              <SelectTrigger id="colorChangeMode" data-testid="select-color-mode">
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="exact">Exact Match</SelectItem>
                <SelectItem value="similar">Similar Colors</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );

    case "pdf-font-replacer":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sourceFontName">Font to Replace</Label>
            <Input
              id="sourceFontName"
              placeholder="Arial"
              value={options.sourceFontName || ""}
              onChange={(e) => updateOption("sourceFontName", e.target.value)}
              data-testid="input-source-font"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="targetFontName">Replace With</Label>
            <Select
              value={options.targetFontName || "Helvetica"}
              onValueChange={(value) => updateOption("targetFontName", value)}
            >
              <SelectTrigger id="targetFontName" data-testid="select-target-font">
                <SelectValue placeholder="Select font" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Helvetica">Helvetica</SelectItem>
                <SelectItem value="Times-Roman">Times Roman</SelectItem>
                <SelectItem value="Courier">Courier</SelectItem>
                <SelectItem value="Symbol">Symbol</SelectItem>
                <SelectItem value="ZapfDingbats">Zapf Dingbats</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-muted-foreground">
            Replaces font references throughout the document
          </p>
        </div>
      );

    case "pdf-font-finder":
      return (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Analyzes your PDF and generates a report of all fonts used, including:
          </p>
          <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
            <li>Font names and types</li>
            <li>Embedding status</li>
            <li>Subset information</li>
          </ul>
        </div>
      );

    case "pdf-link-checker":
      return (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Scans your PDF and generates a report of all hyperlinks found, including:
          </p>
          <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
            <li>Link URLs</li>
            <li>Page locations</li>
            <li>Link status</li>
          </ul>
        </div>
      );

    case "pdf-link-remover":
      return (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Removes all hyperlinks from your PDF document. The visual appearance of link text is preserved, but links will no longer be clickable.
          </p>
          <p className="text-sm text-muted-foreground">
            Useful for creating print versions or removing potentially unsafe links.
          </p>
        </div>
      );

    case "pdf-annotation-remover":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="annotationTypesToRemove">Annotations to Remove</Label>
            <Select
              value={options.annotationTypesToRemove || "all"}
              onValueChange={(value) => updateOption("annotationTypesToRemove", value as ToolOptions["annotationTypesToRemove"])}
            >
              <SelectTrigger id="annotationTypesToRemove" data-testid="select-annotation-type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Annotations</SelectItem>
                <SelectItem value="highlights">Highlights Only</SelectItem>
                <SelectItem value="notes">Notes & Comments</SelectItem>
                <SelectItem value="drawings">Drawings & Shapes</SelectItem>
                <SelectItem value="stamps">Stamps</SelectItem>
                <SelectItem value="links">Links Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-muted-foreground">
            Creates a clean version of your PDF without the selected annotations
          </p>
        </div>
      );

    case "pdf-bookmark-creator":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bookmarks">Bookmarks (one per line)</Label>
            <textarea
              id="bookmarks"
              className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Chapter 1, 1&#10;Chapter 2, 5&#10;Chapter 3, 10"
              value={options.bookmarks || ""}
              onChange={(e) => updateOption("bookmarks", e.target.value)}
              data-testid="textarea-bookmarks"
            />
            <p className="text-sm text-muted-foreground">
              Enter bookmarks as: Title, Page Number (one per line)
            </p>
          </div>
        </div>
      );

    case "pdf-bookmark-editor":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bookmarks">Edit Bookmarks (one per line)</Label>
            <textarea
              id="bookmarks"
              className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Introduction, 1&#10;Main Content, 3&#10;Conclusion, 15"
              value={options.bookmarks || ""}
              onChange={(e) => updateOption("bookmarks", e.target.value)}
              data-testid="textarea-bookmarks"
            />
            <p className="text-sm text-muted-foreground">
              Modify bookmarks: Title, Page Number. Leave empty to remove all bookmarks.
            </p>
          </div>
        </div>
      );

    case "pdf-bookmark-remover":
      return (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Removes all bookmarks and navigation structure from your PDF document.
          </p>
          <p className="text-sm text-muted-foreground">
            The document content remains unchanged - only the bookmark panel is cleared.
          </p>
        </div>
      );

    case "pdf-page-labeler":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pageLabelStyle">Numbering Style</Label>
            <Select
              value={options.pageLabelStyle || "decimal"}
              onValueChange={(value) => updateOption("pageLabelStyle", value as ToolOptions["pageLabelStyle"])}
            >
              <SelectTrigger id="pageLabelStyle" data-testid="select-page-label-style">
                <SelectValue placeholder="Select style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="decimal">Arabic (1, 2, 3...)</SelectItem>
                <SelectItem value="roman-lower">Roman Lowercase (i, ii, iii...)</SelectItem>
                <SelectItem value="roman-upper">Roman Uppercase (I, II, III...)</SelectItem>
                <SelectItem value="alpha-lower">Alphabetic Lowercase (a, b, c...)</SelectItem>
                <SelectItem value="alpha-upper">Alphabetic Uppercase (A, B, C...)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="pageLabelPrefix">Page Label Prefix</Label>
            <Input
              id="pageLabelPrefix"
              placeholder="e.g., Page, Appendix-"
              value={options.pageLabelPrefix || ""}
              onChange={(e) => updateOption("pageLabelPrefix", e.target.value)}
              data-testid="input-page-label-prefix"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pageLabelStartPage">Start from Page</Label>
            <Input
              id="pageLabelStartPage"
              type="number"
              min={1}
              placeholder="1"
              value={options.pageLabelStartPage || 1}
              onChange={(e) => updateOption("pageLabelStartPage", parseInt(e.target.value) || 1)}
              data-testid="input-start-page"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pageLabelStartNumber">Start Numbering at</Label>
            <Input
              id="pageLabelStartNumber"
              type="number"
              min={1}
              placeholder="1"
              value={options.pageLabelStartNumber || 1}
              onChange={(e) => updateOption("pageLabelStartNumber", parseInt(e.target.value) || 1)}
              data-testid="input-start-number"
            />
          </div>
        </div>
      );

    case "pdf-comment-summarizer":
      return (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Extracts all comments and annotations from your PDF and generates a summary report including:
          </p>
          <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
            <li>Text comments and sticky notes</li>
            <li>Highlights and underlines</li>
            <li>Author and timestamp information</li>
            <li>Page locations</li>
          </ul>
        </div>
      );

    case "pdf-action-remover":
      return (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Removes all interactive actions and triggers from your PDF, including:
          </p>
          <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
            <li>Document open/close actions</li>
            <li>Button click actions</li>
            <li>Form submission actions</li>
            <li>Navigation actions</li>
          </ul>
          <p className="text-sm text-muted-foreground">
            Creates a static, safe version of your document.
          </p>
        </div>
      );

    case "pdf-javascript-remover":
      return (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Removes all JavaScript code from your PDF document for security. This eliminates:
          </p>
          <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
            <li>Document-level scripts</li>
            <li>Form field scripts</li>
            <li>Action-based JavaScript</li>
            <li>XFA form scripting</li>
          </ul>
          <p className="text-sm text-muted-foreground">
            Document content and appearance are preserved.
          </p>
        </div>
      );

    case "pdf-object-editor":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="objectType">Object Type</Label>
            <Select
              value={options.objectType || "text"}
              onValueChange={(value) => updateOption("objectType", value as ToolOptions["objectType"])}
            >
              <SelectTrigger id="objectType" data-testid="select-object-type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text Objects</SelectItem>
                <SelectItem value="image">Image Objects</SelectItem>
                <SelectItem value="path">Path/Vector Objects</SelectItem>
                <SelectItem value="annotation">Annotations</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="objectAction">Action</Label>
            <Select
              value={options.objectAction || "view"}
              onValueChange={(value) => updateOption("objectAction", value as ToolOptions["objectAction"])}
            >
              <SelectTrigger id="objectAction" data-testid="select-object-action">
                <SelectValue placeholder="Select action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="view">View/Analyze</SelectItem>
                <SelectItem value="delete">Remove Objects</SelectItem>
                <SelectItem value="modify">Modify Properties</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );

    case "pdf-path-editor":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pathOperation">Operation</Label>
            <Select
              value={options.pathOperation || "view"}
              onValueChange={(value) => updateOption("pathOperation", value as ToolOptions["pathOperation"])}
            >
              <SelectTrigger id="pathOperation" data-testid="select-path-operation">
                <SelectValue placeholder="Select operation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="view">View Paths</SelectItem>
                <SelectItem value="simplify">Simplify Paths</SelectItem>
                <SelectItem value="remove">Remove Paths</SelectItem>
                <SelectItem value="modify-stroke">Modify Stroke</SelectItem>
                <SelectItem value="modify-fill">Modify Fill</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {(options.pathOperation === "modify-stroke" || options.pathOperation === "modify-fill") && (
            <>
              <div className="space-y-2">
                <Label htmlFor="pathStrokeColor">Stroke Color</Label>
                <Input
                  id="pathStrokeColor"
                  type="color"
                  value={options.pathStrokeColor || "#000000"}
                  onChange={(e) => updateOption("pathStrokeColor", e.target.value)}
                  data-testid="input-stroke-color"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pathFillColor">Fill Color</Label>
                <Input
                  id="pathFillColor"
                  type="color"
                  value={options.pathFillColor || "#FFFFFF"}
                  onChange={(e) => updateOption("pathFillColor", e.target.value)}
                  data-testid="input-fill-color"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pathStrokeWidth">Stroke Width</Label>
                <Input
                  id="pathStrokeWidth"
                  type="number"
                  min={0}
                  max={10}
                  step={0.5}
                  placeholder="1"
                  value={options.pathStrokeWidth || 1}
                  onChange={(e) => updateOption("pathStrokeWidth", parseFloat(e.target.value) || 1)}
                  data-testid="input-stroke-width"
                />
              </div>
            </>
          )}
        </div>
      );

    case "pdf-javascript-editor":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="javascriptAction">JavaScript Trigger</Label>
            <Select
              value={options.javascriptAction || "document-open"}
              onValueChange={(value) => updateOption("javascriptAction", value as ToolOptions["javascriptAction"])}
            >
              <SelectTrigger id="javascriptAction" data-testid="select-js-action">
                <SelectValue placeholder="Select trigger" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="document-open">Document Open</SelectItem>
                <SelectItem value="document-close">Document Close</SelectItem>
                <SelectItem value="page-open">Page Open</SelectItem>
                <SelectItem value="page-close">Page Close</SelectItem>
                <SelectItem value="form-submit">Form Submit</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="javascriptCode">JavaScript Code</Label>
            <textarea
              id="javascriptCode"
              className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="app.alert('Hello World!');"
              value={options.javascriptCode || ""}
              onChange={(e) => updateOption("javascriptCode", e.target.value)}
              data-testid="textarea-javascript-code"
            />
            <p className="text-sm text-muted-foreground">
              Enter JavaScript code to embed in the PDF document.
            </p>
          </div>
        </div>
      );

    case "pdf-initial-view-editor":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Initial Zoom Level</Label>
            <Select
              value={options.initialViewZoom || "fit-page"}
              onValueChange={(value) => updateOption("initialViewZoom", value as ToolOptions["initialViewZoom"])}
            >
              <SelectTrigger data-testid="select-zoom">
                <SelectValue placeholder="Select zoom level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fit-page">Fit to Page</SelectItem>
                <SelectItem value="fit-width">Fit to Width</SelectItem>
                <SelectItem value="actual-size">Actual Size (100%)</SelectItem>
                <SelectItem value="50">50%</SelectItem>
                <SelectItem value="75">75%</SelectItem>
                <SelectItem value="100">100%</SelectItem>
                <SelectItem value="125">125%</SelectItem>
                <SelectItem value="150">150%</SelectItem>
                <SelectItem value="200">200%</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Page Mode (Panel Display)</Label>
            <Select
              value={options.initialViewPageMode || "none"}
              onValueChange={(value) => updateOption("initialViewPageMode", value as ToolOptions["initialViewPageMode"])}
            >
              <SelectTrigger data-testid="select-page-mode">
                <SelectValue placeholder="Select page mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Panel</SelectItem>
                <SelectItem value="bookmarks">Show Bookmarks Panel</SelectItem>
                <SelectItem value="thumbnails">Show Thumbnails Panel</SelectItem>
                <SelectItem value="fullscreen">Open in Full Screen</SelectItem>
                <SelectItem value="attachments">Show Attachments Panel</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Page Layout</Label>
            <Select
              value={options.initialViewPageLayout || "single"}
              onValueChange={(value) => updateOption("initialViewPageLayout", value as ToolOptions["initialViewPageLayout"])}
            >
              <SelectTrigger data-testid="select-page-layout">
                <SelectValue placeholder="Select page layout" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single Page</SelectItem>
                <SelectItem value="continuous">Single Page Continuous</SelectItem>
                <SelectItem value="two-column">Two-Column Continuous</SelectItem>
                <SelectItem value="two-page">Two-Page View</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="startPage">Start Page</Label>
            <Input
              id="startPage"
              type="number"
              min={1}
              placeholder="1"
              value={options.initialViewStartPage || 1}
              onChange={(e) => updateOption("initialViewStartPage", parseInt(e.target.value) || 1)}
              data-testid="input-start-page"
            />
            <p className="text-sm text-muted-foreground">
              The page to display when the PDF is opened.
              {pageCount && ` (Total pages: ${pageCount})`}
            </p>
          </div>
        </div>
      );

    case "pdf-presentation-maker":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Page Transition Effect</Label>
            <Select
              value={options.transitionEffect || "fade"}
              onValueChange={(value) => updateOption("transitionEffect", value as ToolOptions["transitionEffect"])}
            >
              <SelectTrigger data-testid="select-transition">
                <SelectValue placeholder="Select transition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Transition</SelectItem>
                <SelectItem value="fade">Fade</SelectItem>
                <SelectItem value="wipe-left">Wipe Left</SelectItem>
                <SelectItem value="wipe-right">Wipe Right</SelectItem>
                <SelectItem value="wipe-up">Wipe Up</SelectItem>
                <SelectItem value="wipe-down">Wipe Down</SelectItem>
                <SelectItem value="dissolve">Dissolve</SelectItem>
                <SelectItem value="box-in">Box In</SelectItem>
                <SelectItem value="box-out">Box Out</SelectItem>
                <SelectItem value="blinds-horizontal">Horizontal Blinds</SelectItem>
                <SelectItem value="blinds-vertical">Vertical Blinds</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="transitionDuration">Transition Duration (seconds)</Label>
            <Input
              id="transitionDuration"
              type="number"
              min={0.1}
              max={5}
              step={0.1}
              placeholder="1"
              value={options.transitionDuration || 1}
              onChange={(e) => updateOption("transitionDuration", parseFloat(e.target.value) || 1)}
              data-testid="input-transition-duration"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="autoAdvanceTime">Auto-Advance Time (seconds, 0 for manual)</Label>
            <Input
              id="autoAdvanceTime"
              type="number"
              min={0}
              max={300}
              step={1}
              placeholder="0"
              value={options.autoAdvanceTime || 0}
              onChange={(e) => updateOption("autoAdvanceTime", parseInt(e.target.value) || 0)}
              data-testid="input-auto-advance"
            />
            <p className="text-sm text-muted-foreground">
              Set to 0 for manual navigation, or enter seconds to auto-advance slides.
            </p>
          </div>
        </div>
      );

    case "protect-pdf":
    case "pdf-protector":
    case "add-password-to-pdf":
    case "encrypt-pdf":
    case "pdf-encryptor":
    case "password-protect-pdf":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter password to protect PDF"
              value={options.password || ""}
              onChange={(e) => updateOption("password", e.target.value)}
              data-testid="input-password"
            />
            <p className="text-sm text-muted-foreground">
              This password will be required to open the PDF. Use a strong password with letters, numbers, and symbols.
            </p>
          </div>
        </div>
      );

    case "unlock-pdf-tool":
    case "pdf-unlocker":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="unlockPassword">Current Password</Label>
            <Input
              id="unlockPassword"
              type="password"
              placeholder="Enter current PDF password"
              value={options.unlockPassword || ""}
              onChange={(e) => updateOption("unlockPassword", e.target.value)}
              data-testid="input-unlock-password"
            />
            <p className="text-sm text-muted-foreground">
              Enter the password used to protect this PDF to remove the protection.
            </p>
          </div>
        </div>
      );

    case "remove-pdf-password":
    case "decrypt-pdf":
    case "pdf-password-remover":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="unlockPassword">Current PDF Password</Label>
            <Input
              id="unlockPassword"
              type="password"
              placeholder="Enter the current PDF password"
              value={options.unlockPassword || ""}
              onChange={(e) => updateOption("unlockPassword", e.target.value)}
              data-testid="input-unlock-password"
            />
            <p className="text-sm text-muted-foreground">
              Enter the password currently protecting this PDF to remove it.
            </p>
          </div>
        </div>
      );

    case "add-pdf-permissions":
    case "set-pdf-permissions":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ownerPassword">Owner Password (Required)</Label>
            <Input
              id="ownerPassword"
              type="password"
              placeholder="Enter owner password"
              value={options.ownerPassword || ""}
              onChange={(e) => updateOption("ownerPassword", e.target.value)}
              data-testid="input-owner-password"
            />
            <p className="text-sm text-muted-foreground">
              This password allows changing permissions later.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="userPassword">User Password (Optional)</Label>
            <Input
              id="userPassword"
              type="password"
              placeholder="Enter user password (optional)"
              value={options.userPassword || ""}
              onChange={(e) => updateOption("userPassword", e.target.value)}
              data-testid="input-user-password"
            />
            <p className="text-sm text-muted-foreground">
              If set, this password will be required to open the PDF.
            </p>
          </div>
          <div className="space-y-3 border-t pt-4">
            <Label>Permissions</Label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.allowPrinting !== false}
                  onChange={(e) => updateOption("allowPrinting", e.target.checked)}
                  className="rounded border-gray-300"
                  data-testid="checkbox-allow-printing"
                />
                <span className="text-sm">Allow Printing</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.allowCopying !== false}
                  onChange={(e) => updateOption("allowCopying", e.target.checked)}
                  className="rounded border-gray-300"
                  data-testid="checkbox-allow-copying"
                />
                <span className="text-sm">Allow Copying Text and Images</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.allowEditing !== false}
                  onChange={(e) => updateOption("allowEditing", e.target.checked)}
                  className="rounded border-gray-300"
                  data-testid="checkbox-allow-editing"
                />
                <span className="text-sm">Allow Editing</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.allowAnnotations !== false}
                  onChange={(e) => updateOption("allowAnnotations", e.target.checked)}
                  className="rounded border-gray-300"
                  data-testid="checkbox-allow-annotations"
                />
                <span className="text-sm">Allow Annotations</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.allowFormFilling !== false}
                  onChange={(e) => updateOption("allowFormFilling", e.target.checked)}
                  className="rounded border-gray-300"
                  data-testid="checkbox-allow-forms"
                />
                <span className="text-sm">Allow Form Filling</span>
              </label>
            </div>
          </div>
        </div>
      );

    case "disable-pdf-printing":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ownerPassword">Owner Password (Required)</Label>
            <Input
              id="ownerPassword"
              type="password"
              placeholder="Enter owner password"
              value={options.ownerPassword || ""}
              onChange={(e) => updateOption("ownerPassword", e.target.value)}
              data-testid="input-owner-password"
            />
            <p className="text-sm text-muted-foreground">
              This password protects the print restriction and allows changes later.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="userPassword">User Password (Optional)</Label>
            <Input
              id="userPassword"
              type="password"
              placeholder="Enter user password (optional)"
              value={options.userPassword || ""}
              onChange={(e) => updateOption("userPassword", e.target.value)}
              data-testid="input-user-password"
            />
            <p className="text-sm text-muted-foreground">
              If set, this password will be required to open the PDF.
            </p>
          </div>
          <div className="p-3 bg-muted rounded-md">
            <p className="text-sm text-muted-foreground">
              This will disable printing while keeping other permissions (copying, editing) enabled.
            </p>
          </div>
        </div>
      );

    case "disable-pdf-editing":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ownerPassword">Owner Password (Required)</Label>
            <Input
              id="ownerPassword"
              type="password"
              placeholder="Enter owner password"
              value={options.ownerPassword || ""}
              onChange={(e) => updateOption("ownerPassword", e.target.value)}
              data-testid="input-owner-password"
            />
            <p className="text-sm text-muted-foreground">
              This password protects the edit restriction and allows changes later.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="userPassword">User Password (Optional)</Label>
            <Input
              id="userPassword"
              type="password"
              placeholder="Enter user password (optional)"
              value={options.userPassword || ""}
              onChange={(e) => updateOption("userPassword", e.target.value)}
              data-testid="input-user-password"
            />
            <p className="text-sm text-muted-foreground">
              If set, this password will be required to open the PDF.
            </p>
          </div>
          <div className="p-3 bg-muted rounded-md">
            <p className="text-sm text-muted-foreground">
              This will disable editing, annotations, and form filling while keeping printing and copying enabled.
            </p>
          </div>
        </div>
      );

    case "disable-pdf-copying":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ownerPassword">Owner Password (Required)</Label>
            <Input
              id="ownerPassword"
              type="password"
              placeholder="Enter owner password"
              value={options.ownerPassword || ""}
              onChange={(e) => updateOption("ownerPassword", e.target.value)}
              data-testid="input-owner-password"
            />
            <p className="text-sm text-muted-foreground">
              This password protects the copy restriction and allows changes later.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="userPassword">User Password (Optional)</Label>
            <Input
              id="userPassword"
              type="password"
              placeholder="Enter user password (optional)"
              value={options.userPassword || ""}
              onChange={(e) => updateOption("userPassword", e.target.value)}
              data-testid="input-user-password"
            />
            <p className="text-sm text-muted-foreground">
              If set, this password will be required to open the PDF.
            </p>
          </div>
          <div className="p-3 bg-muted rounded-md">
            <p className="text-sm text-muted-foreground">
              This will disable copying text and images while keeping printing and editing enabled.
            </p>
          </div>
        </div>
      );

    case "pdf-security":
    case "secure-pdf":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Document Password (Required)</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter password to secure the PDF"
              value={options.password || ""}
              onChange={(e) => updateOption("password", e.target.value)}
              data-testid="input-password"
            />
            <p className="text-sm text-muted-foreground">
              This password will be required to open the PDF.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ownerPassword">Owner Password (Optional)</Label>
            <Input
              id="ownerPassword"
              type="password"
              placeholder="Enter owner password (optional)"
              value={options.ownerPassword || ""}
              onChange={(e) => updateOption("ownerPassword", e.target.value)}
              data-testid="input-owner-password"
            />
            <p className="text-sm text-muted-foreground">
              If different from document password, this allows changing permissions later.
            </p>
          </div>
          <div className="space-y-3 border-t pt-4">
            <Label>Permissions</Label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.allowPrinting !== false}
                  onChange={(e) => updateOption("allowPrinting", e.target.checked)}
                  className="rounded border-gray-300"
                  data-testid="checkbox-allow-printing"
                />
                <span className="text-sm">Allow Printing</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.allowCopying !== false}
                  onChange={(e) => updateOption("allowCopying", e.target.checked)}
                  className="rounded border-gray-300"
                  data-testid="checkbox-allow-copying"
                />
                <span className="text-sm">Allow Copying Text and Images</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.allowEditing !== false}
                  onChange={(e) => updateOption("allowEditing", e.target.checked)}
                  className="rounded border-gray-300"
                  data-testid="checkbox-allow-editing"
                />
                <span className="text-sm">Allow Editing</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.allowAnnotations !== false}
                  onChange={(e) => updateOption("allowAnnotations", e.target.checked)}
                  className="rounded border-gray-300"
                  data-testid="checkbox-allow-annotations"
                />
                <span className="text-sm">Allow Annotations</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.allowFormFilling !== false}
                  onChange={(e) => updateOption("allowFormFilling", e.target.checked)}
                  className="rounded border-gray-300"
                  data-testid="checkbox-allow-forms"
                />
                <span className="text-sm">Allow Form Filling</span>
              </label>
            </div>
          </div>
        </div>
      );

    case "sign-pdf":
    case "pdf-signer":
    case "esign-pdf":
    case "add-signature-to-pdf":
    case "pdf-signature-tool":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="signatureName">Signer Name</Label>
            <Input
              id="signatureName"
              placeholder="Enter your name"
              value={options.signatureName || ""}
              onChange={(e) => updateOption("signatureName", e.target.value)}
              data-testid="input-signature-name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signatureText">Signature Text (optional)</Label>
            <Input
              id="signatureText"
              placeholder="Custom signature text"
              value={options.signatureText || ""}
              onChange={(e) => updateOption("signatureText", e.target.value)}
              data-testid="input-signature-text"
            />
            <p className="text-sm text-muted-foreground">
              Leave empty to use your name as the signature.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Signature Style</Label>
            <Select
              value={options.signatureStyle || "typed"}
              onValueChange={(value) => updateOption("signatureStyle", value as ToolOptions["signatureStyle"])}
            >
              <SelectTrigger data-testid="select-signature-style">
                <SelectValue placeholder="Select style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="typed">Typed (Professional)</SelectItem>
                <SelectItem value="handwritten">Handwritten (Script)</SelectItem>
                <SelectItem value="drawn">Drawn Style</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Signature Position</Label>
            <Select
              value={options.signaturePosition || "bottom-right"}
              onValueChange={(value) => updateOption("signaturePosition", value as ToolOptions["signaturePosition"])}
            >
              <SelectTrigger data-testid="select-signature-position">
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bottom-right">Bottom Right</SelectItem>
                <SelectItem value="bottom-left">Bottom Left</SelectItem>
                <SelectItem value="top-right">Top Right</SelectItem>
                <SelectItem value="top-left">Top Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Sign Which Pages</Label>
            <Select
              value={options.signaturePage || "last"}
              onValueChange={(value) => updateOption("signaturePage", value as ToolOptions["signaturePage"])}
            >
              <SelectTrigger data-testid="select-signature-page">
                <SelectValue placeholder="Select pages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last">Last Page Only</SelectItem>
                <SelectItem value="first">First Page Only</SelectItem>
                <SelectItem value="all">All Pages</SelectItem>
                <SelectItem value="custom">Custom Page</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {options.signaturePage === "custom" && (
            <div className="space-y-2">
              <Label htmlFor="signatureCustomPage">Page Number</Label>
              <Input
                id="signatureCustomPage"
                type="number"
                min={1}
                placeholder="Enter page number"
                value={options.signatureCustomPage || 1}
                onChange={(e) => updateOption("signatureCustomPage", parseInt(e.target.value) || 1)}
                data-testid="input-signature-custom-page"
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="signatureReason">Reason for Signing (optional)</Label>
            <Input
              id="signatureReason"
              placeholder="e.g., Document approval, Contract agreement"
              value={options.signatureReason || ""}
              onChange={(e) => updateOption("signatureReason", e.target.value)}
              data-testid="input-signature-reason"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signatureLocation">Location (optional)</Label>
            <Input
              id="signatureLocation"
              placeholder="e.g., New York, USA"
              value={options.signatureLocation || ""}
              onChange={(e) => updateOption("signatureLocation", e.target.value)}
              data-testid="input-signature-location"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signatureColor">Signature Color</Label>
            <Input
              id="signatureColor"
              type="color"
              value={options.signatureColor || "#1a365d"}
              onChange={(e) => updateOption("signatureColor", e.target.value)}
              className="h-10 w-20"
              data-testid="input-signature-color"
            />
          </div>
        </div>
      );

    case "request-pdf-signature":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="requestEmail">Recipient Email</Label>
            <Input
              id="requestEmail"
              type="email"
              placeholder="Enter recipient's email"
              value={options.requestEmail || ""}
              onChange={(e) => updateOption("requestEmail", e.target.value)}
              data-testid="input-request-email"
            />
            <p className="text-sm text-muted-foreground">
              The prepared document will include signature fields for this recipient.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="requestMessage">Message to Signer (optional)</Label>
            <Input
              id="requestMessage"
              placeholder="e.g., Please sign and return by Friday"
              value={options.requestMessage || ""}
              onChange={(e) => updateOption("requestMessage", e.target.value)}
              data-testid="input-request-message"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="requestDeadline">Deadline (optional)</Label>
            <Input
              id="requestDeadline"
              type="date"
              value={options.requestDeadline || ""}
              onChange={(e) => updateOption("requestDeadline", e.target.value)}
              data-testid="input-request-deadline"
            />
          </div>
          <div className="space-y-2">
            <Label>Signature Field Position</Label>
            <Select
              value={options.signaturePosition || "bottom-right"}
              onValueChange={(value) => updateOption("signaturePosition", value as ToolOptions["signaturePosition"])}
            >
              <SelectTrigger data-testid="select-signature-position">
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bottom-right">Bottom Right</SelectItem>
                <SelectItem value="bottom-left">Bottom Left</SelectItem>
                <SelectItem value="top-right">Top Right</SelectItem>
                <SelectItem value="top-left">Top Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );

    case "validate-pdf-signature":
    case "pdf-digital-signature-validator":
      return (
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-md">
            <p className="text-sm text-muted-foreground">
              Upload a signed PDF to validate its signatures. The validation will check:
            </p>
            <ul className="text-sm text-muted-foreground mt-2 list-disc list-inside space-y-1">
              <li>Signature authenticity and integrity</li>
              <li>Document modification status since signing</li>
              <li>Signature details and metadata</li>
              <li>Certificate information (if applicable)</li>
            </ul>
          </div>
        </div>
      );

    case "certify-pdf":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="signatureName">Certifier Name</Label>
            <Input
              id="signatureName"
              placeholder="Enter your name"
              value={options.signatureName || ""}
              onChange={(e) => updateOption("signatureName", e.target.value)}
              data-testid="input-signature-name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signatureReason">Certification Reason</Label>
            <Input
              id="signatureReason"
              placeholder="e.g., Official document certification"
              value={options.signatureReason || ""}
              onChange={(e) => updateOption("signatureReason", e.target.value)}
              data-testid="input-signature-reason"
            />
          </div>
          <div className="space-y-2">
            <Label>Post-Certification Permissions</Label>
            <Select
              value={options.certifyPermissions || "no-changes"}
              onValueChange={(value) => updateOption("certifyPermissions", value as ToolOptions["certifyPermissions"])}
            >
              <SelectTrigger data-testid="select-certify-permissions">
                <SelectValue placeholder="Select permissions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no-changes">No Changes Allowed</SelectItem>
                <SelectItem value="form-filling">Form Filling Only</SelectItem>
                <SelectItem value="annotations">Annotations and Form Filling</SelectItem>
                <SelectItem value="all">All Changes Allowed</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Choose what modifications are allowed after certification.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Certification Position</Label>
            <Select
              value={options.signaturePosition || "top-right"}
              onValueChange={(value) => updateOption("signaturePosition", value as ToolOptions["signaturePosition"])}
            >
              <SelectTrigger data-testid="select-signature-position">
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="top-right">Top Right</SelectItem>
                <SelectItem value="top-left">Top Left</SelectItem>
                <SelectItem value="bottom-right">Bottom Right</SelectItem>
                <SelectItem value="bottom-left">Bottom Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="signatureLocation">Location (optional)</Label>
            <Input
              id="signatureLocation"
              placeholder="e.g., Corporate Headquarters"
              value={options.signatureLocation || ""}
              onChange={(e) => updateOption("signatureLocation", e.target.value)}
              data-testid="input-signature-location"
            />
          </div>
        </div>
      );

    case "pdf-locker":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="signatureName">Signer Name</Label>
            <Input
              id="signatureName"
              placeholder="Enter your name"
              value={options.signatureName || ""}
              onChange={(e) => updateOption("signatureName", e.target.value)}
              data-testid="input-signature-name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lockPassword">Lock Password</Label>
            <Input
              id="lockPassword"
              type="password"
              placeholder="Enter password to lock the PDF"
              value={options.lockPassword || ""}
              onChange={(e) => updateOption("lockPassword", e.target.value)}
              data-testid="input-lock-password"
            />
            <p className="text-sm text-muted-foreground">
              This password will be required to open the locked PDF.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Lock Type</Label>
            <Select
              value={options.lockType || "both"}
              onValueChange={(value) => updateOption("lockType", value as ToolOptions["lockType"])}
            >
              <SelectTrigger data-testid="select-lock-type">
                <SelectValue placeholder="Select lock type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User Password Only (Open Protection)</SelectItem>
                <SelectItem value="owner">Owner Password Only (Edit Protection)</SelectItem>
                <SelectItem value="both">Both User and Owner Protection</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Signature Position</Label>
            <Select
              value={options.signaturePosition || "bottom-right"}
              onValueChange={(value) => updateOption("signaturePosition", value as ToolOptions["signaturePosition"])}
            >
              <SelectTrigger data-testid="select-signature-position">
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bottom-right">Bottom Right</SelectItem>
                <SelectItem value="bottom-left">Bottom Left</SelectItem>
                <SelectItem value="top-right">Top Right</SelectItem>
                <SelectItem value="top-left">Top Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="signatureReason">Reason (optional)</Label>
            <Input
              id="signatureReason"
              placeholder="e.g., Document secured for distribution"
              value={options.signatureReason || ""}
              onChange={(e) => updateOption("signatureReason", e.target.value)}
              data-testid="input-signature-reason"
            />
          </div>
        </div>
      );

    case "add-timestamp-to-pdf":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Timestamp Format</Label>
            <Select
              value={options.timestampFormat || "date-time"}
              onValueChange={(value) => updateOption("timestampFormat", value as ToolOptions["timestampFormat"])}
            >
              <SelectTrigger data-testid="select-timestamp-format">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-only">Date Only (MM/DD/YYYY)</SelectItem>
                <SelectItem value="time-only">Time Only (HH:MM:SS)</SelectItem>
                <SelectItem value="date-time">Date and Time</SelectItem>
                <SelectItem value="iso-8601">ISO 8601 Format</SelectItem>
                <SelectItem value="custom">Custom Format</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {options.timestampFormat === "custom" && (
            <div className="space-y-2">
              <Label htmlFor="timestampCustomFormat">Custom Format</Label>
              <Input
                id="timestampCustomFormat"
                placeholder="e.g., YYYY-MM-DD HH:mm"
                value={options.timestampCustomFormat || ""}
                onChange={(e) => updateOption("timestampCustomFormat", e.target.value)}
                data-testid="input-timestamp-custom-format"
              />
            </div>
          )}
          <div className="space-y-2">
            <Label>Position</Label>
            <Select
              value={options.timestampPosition || "bottom-right"}
              onValueChange={(value) => updateOption("timestampPosition", value as ToolOptions["timestampPosition"])}
            >
              <SelectTrigger data-testid="select-timestamp-position">
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="top-left">Top Left</SelectItem>
                <SelectItem value="top-center">Top Center</SelectItem>
                <SelectItem value="top-right">Top Right</SelectItem>
                <SelectItem value="bottom-left">Bottom Left</SelectItem>
                <SelectItem value="bottom-center">Bottom Center</SelectItem>
                <SelectItem value="bottom-right">Bottom Right</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Font Size: {options.timestampFontSize || 12}pt</Label>
            <Slider
              value={[options.timestampFontSize || 12]}
              min={8}
              max={24}
              step={1}
              onValueChange={([value]) => updateOption("timestampFontSize", value)}
              data-testid="slider-timestamp-font-size"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="timestampColor">Color</Label>
            <Input
              id="timestampColor"
              type="color"
              value={options.timestampColor || "#000000"}
              onChange={(e) => updateOption("timestampColor", e.target.value)}
              className="w-20 h-10"
              data-testid="input-timestamp-color"
            />
          </div>
          <div className="space-y-2">
            <Label>Opacity: {Math.round((options.timestampOpacity || 100))}%</Label>
            <Slider
              value={[options.timestampOpacity || 100]}
              min={10}
              max={100}
              step={5}
              onValueChange={([value]) => updateOption("timestampOpacity", value)}
              data-testid="slider-timestamp-opacity"
            />
          </div>
          <div className="space-y-2">
            <Label>Apply to Pages</Label>
            <Select
              value={options.timestampPages || "all"}
              onValueChange={(value) => updateOption("timestampPages", value as ToolOptions["timestampPages"])}
            >
              <SelectTrigger data-testid="select-timestamp-pages">
                <SelectValue placeholder="Select pages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Pages</SelectItem>
                <SelectItem value="first">First Page Only</SelectItem>
                <SelectItem value="last">Last Page Only</SelectItem>
                <SelectItem value="odd">Odd Pages</SelectItem>
                <SelectItem value="even">Even Pages</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {options.timestampPages === "custom" && (
            <div className="space-y-2">
              <Label htmlFor="timestampCustomPages">Page Range</Label>
              <Input
                id="timestampCustomPages"
                placeholder="e.g., 1,3,5-10"
                value={options.timestampCustomPages || ""}
                onChange={(e) => updateOption("timestampCustomPages", e.target.value)}
                data-testid="input-timestamp-custom-pages"
              />
            </div>
          )}
          <div className="flex items-center space-x-2">
            <Switch
              id="timestampIncludeTimezone"
              checked={options.timestampIncludeTimezone || false}
              onCheckedChange={(checked) => updateOption("timestampIncludeTimezone", checked)}
              data-testid="switch-timestamp-timezone"
            />
            <Label htmlFor="timestampIncludeTimezone">Include Timezone</Label>
          </div>
        </div>
      );

    case "pdf-certificate-adder":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Certificate Type</Label>
            <Select
              value={options.certificateType || "completion"}
              onValueChange={(value) => updateOption("certificateType", value as ToolOptions["certificateType"])}
            >
              <SelectTrigger data-testid="select-certificate-type">
                <SelectValue placeholder="Select certificate type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="completion">Completion Certificate</SelectItem>
                <SelectItem value="authenticity">Authenticity Certificate</SelectItem>
                <SelectItem value="approval">Approval Certificate</SelectItem>
                <SelectItem value="membership">Membership Certificate</SelectItem>
                <SelectItem value="custom">Custom Certificate</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="certificateName">Recipient/Subject Name</Label>
            <Input
              id="certificateName"
              placeholder="Enter name"
              value={options.certificateName || ""}
              onChange={(e) => updateOption("certificateName", e.target.value)}
              data-testid="input-certificate-name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="certificateIssuer">Issuing Authority</Label>
            <Input
              id="certificateIssuer"
              placeholder="Enter issuer name"
              value={options.certificateIssuer || ""}
              onChange={(e) => updateOption("certificateIssuer", e.target.value)}
              data-testid="input-certificate-issuer"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="certificateDate">Issue Date</Label>
            <Input
              id="certificateDate"
              type="date"
              value={options.certificateDate || ""}
              onChange={(e) => updateOption("certificateDate", e.target.value)}
              data-testid="input-certificate-date"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="certificateNumber">Certificate Number (optional)</Label>
            <Input
              id="certificateNumber"
              placeholder="e.g., CERT-2024-001"
              value={options.certificateNumber || ""}
              onChange={(e) => updateOption("certificateNumber", e.target.value)}
              data-testid="input-certificate-number"
            />
          </div>
          <div className="space-y-2">
            <Label>Certificate Style</Label>
            <Select
              value={options.certificateStyle || "classic"}
              onValueChange={(value) => updateOption("certificateStyle", value as ToolOptions["certificateStyle"])}
            >
              <SelectTrigger data-testid="select-certificate-style">
                <SelectValue placeholder="Select style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="classic">Classic</SelectItem>
                <SelectItem value="modern">Modern</SelectItem>
                <SelectItem value="minimal">Minimal</SelectItem>
                <SelectItem value="ornate">Ornate</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Position</Label>
            <Select
              value={options.certificatePosition || "center"}
              onValueChange={(value) => updateOption("certificatePosition", value as ToolOptions["certificatePosition"])}
            >
              <SelectTrigger data-testid="select-certificate-position">
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="top-center">Top Center</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="bottom-center">Bottom Center</SelectItem>
                <SelectItem value="custom">Custom Position</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );

    case "pdf-signature-remover":
      return (
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-md">
            <p className="text-sm text-muted-foreground">
              This tool will scan your PDF and remove signature elements. Options include:
            </p>
            <ul className="text-sm text-muted-foreground mt-2 list-disc list-inside space-y-1">
              <li>Remove all visual signature images</li>
              <li>Clear signature form fields</li>
              <li>Delete signature annotations</li>
              <li>Remove digital signature metadata</li>
            </ul>
          </div>
          <div className="space-y-2">
            <Label>Pages to Process</Label>
            <Select
              value={options.pageRange || "all"}
              onValueChange={(value) => updateOption("pageRange", value as ToolOptions["pageRange"])}
            >
              <SelectTrigger data-testid="select-page-range">
                <SelectValue placeholder="Select pages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Pages</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {options.pageRange === "custom" && (
            <div className="space-y-2">
              <Label htmlFor="customPages">Page Range</Label>
              <Input
                id="customPages"
                placeholder="e.g., 1,3,5-10"
                value={options.customPages || ""}
                onChange={(e) => updateOption("customPages", e.target.value)}
                data-testid="input-custom-pages"
              />
            </div>
          )}
        </div>
      );

    case "watermark-pdf":
    case "pdf-watermarker":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Watermark Type</Label>
            <Select
              value={options.watermarkType || "text"}
              onValueChange={(value) => updateOption("watermarkType", value as ToolOptions["watermarkType"])}
            >
              <SelectTrigger data-testid="select-watermark-type">
                <SelectValue placeholder="Select watermark type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text Watermark</SelectItem>
                <SelectItem value="image">Image Watermark</SelectItem>
                <SelectItem value="combined">Text + Image</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {(options.watermarkType === "text" || options.watermarkType === "combined" || !options.watermarkType) && (
            <div className="space-y-2">
              <Label htmlFor="watermarkText">Watermark Text</Label>
              <Input
                id="watermarkText"
                placeholder="e.g., CONFIDENTIAL"
                value={options.watermarkText || ""}
                onChange={(e) => updateOption("watermarkText", e.target.value)}
                data-testid="input-watermark-text"
              />
            </div>
          )}
          <div className="space-y-2">
            <Label>Position</Label>
            <Select
              value={options.watermarkPosition || "center"}
              onValueChange={(value) => updateOption("watermarkPosition", value as ToolOptions["watermarkPosition"])}
            >
              <SelectTrigger data-testid="select-watermark-position">
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="top-left">Top Left</SelectItem>
                <SelectItem value="top-right">Top Right</SelectItem>
                <SelectItem value="bottom-left">Bottom Left</SelectItem>
                <SelectItem value="bottom-right">Bottom Right</SelectItem>
                <SelectItem value="diagonal">Diagonal (Full Page)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Opacity: {Math.round((options.watermarkOpacity || 30))}%</Label>
            <Slider
              value={[options.watermarkOpacity || 30]}
              min={5}
              max={100}
              step={5}
              onValueChange={([value]) => updateOption("watermarkOpacity", value)}
              data-testid="slider-watermark-opacity"
            />
          </div>
          <div className="space-y-2">
            <Label>Rotation: {options.watermarkRotation || 0} degrees</Label>
            <Slider
              value={[options.watermarkRotation || 0]}
              min={-90}
              max={90}
              step={15}
              onValueChange={([value]) => updateOption("watermarkRotation", value)}
              data-testid="slider-watermark-rotation"
            />
          </div>
          <div className="space-y-2">
            <Label>Layer</Label>
            <Select
              value={options.watermarkLayer || "foreground"}
              onValueChange={(value) => updateOption("watermarkLayer", value as ToolOptions["watermarkLayer"])}
            >
              <SelectTrigger data-testid="select-watermark-layer">
                <SelectValue placeholder="Select layer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="foreground">Foreground (Over Content)</SelectItem>
                <SelectItem value="background">Background (Behind Content)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Apply to Pages</Label>
            <Select
              value={options.watermarkPages || "all"}
              onValueChange={(value) => updateOption("watermarkPages", value as ToolOptions["watermarkPages"])}
            >
              <SelectTrigger data-testid="select-watermark-pages">
                <SelectValue placeholder="Select pages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Pages</SelectItem>
                <SelectItem value="first">First Page Only</SelectItem>
                <SelectItem value="last">Last Page Only</SelectItem>
                <SelectItem value="odd">Odd Pages</SelectItem>
                <SelectItem value="even">Even Pages</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {options.watermarkPages === "custom" && (
            <div className="space-y-2">
              <Label htmlFor="watermarkCustomPages">Page Range</Label>
              <Input
                id="watermarkCustomPages"
                placeholder="e.g., 1,3,5-10"
                value={options.watermarkCustomPages || ""}
                onChange={(e) => updateOption("watermarkCustomPages", e.target.value)}
                data-testid="input-watermark-custom-pages"
              />
            </div>
          )}
        </div>
      );

    case "add-text-watermark":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="watermarkText">Watermark Text</Label>
            <Input
              id="watermarkText"
              placeholder="e.g., CONFIDENTIAL, DRAFT, DO NOT COPY"
              value={options.watermarkText || ""}
              onChange={(e) => updateOption("watermarkText", e.target.value)}
              data-testid="input-watermark-text"
            />
          </div>
          <div className="space-y-2">
            <Label>Font Size: {options.fontSize || 48}pt</Label>
            <Slider
              value={[options.fontSize || 48]}
              min={12}
              max={120}
              step={4}
              onValueChange={([value]) => updateOption("fontSize", value)}
              data-testid="slider-font-size"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="watermarkColor">Color</Label>
            <Input
              id="watermarkColor"
              type="color"
              value={options.color || "#808080"}
              onChange={(e) => updateOption("color", e.target.value)}
              className="w-20 h-10"
              data-testid="input-watermark-color"
            />
          </div>
          <div className="space-y-2">
            <Label>Opacity: {Math.round((options.watermarkOpacity || 30))}%</Label>
            <Slider
              value={[options.watermarkOpacity || 30]}
              min={5}
              max={100}
              step={5}
              onValueChange={([value]) => updateOption("watermarkOpacity", value)}
              data-testid="slider-opacity"
            />
          </div>
          <div className="space-y-2">
            <Label>Rotation: {options.watermarkRotation || 45} degrees</Label>
            <Slider
              value={[options.watermarkRotation || 45]}
              min={-90}
              max={90}
              step={15}
              onValueChange={([value]) => updateOption("watermarkRotation", value)}
              data-testid="slider-rotation"
            />
          </div>
          <div className="space-y-2">
            <Label>Position</Label>
            <Select
              value={options.watermarkPosition || "center"}
              onValueChange={(value) => updateOption("watermarkPosition", value as ToolOptions["watermarkPosition"])}
            >
              <SelectTrigger data-testid="select-position">
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="top-left">Top Left</SelectItem>
                <SelectItem value="top-right">Top Right</SelectItem>
                <SelectItem value="bottom-left">Bottom Left</SelectItem>
                <SelectItem value="bottom-right">Bottom Right</SelectItem>
                <SelectItem value="diagonal">Diagonal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Apply to Pages</Label>
            <Select
              value={options.watermarkPages || "all"}
              onValueChange={(value) => updateOption("watermarkPages", value as ToolOptions["watermarkPages"])}
            >
              <SelectTrigger data-testid="select-pages">
                <SelectValue placeholder="Select pages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Pages</SelectItem>
                <SelectItem value="first">First Page Only</SelectItem>
                <SelectItem value="last">Last Page Only</SelectItem>
                <SelectItem value="odd">Odd Pages</SelectItem>
                <SelectItem value="even">Even Pages</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );

    case "add-image-watermark":
      return (
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-md">
            <p className="text-sm text-muted-foreground">
              Upload your PDF first, then upload a watermark image (PNG, JPG recommended). The image will be embedded as a watermark on your PDF pages.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Scale: {options.watermarkScale || 50}%</Label>
            <Slider
              value={[options.watermarkScale || 50]}
              min={10}
              max={200}
              step={10}
              onValueChange={([value]) => updateOption("watermarkScale", value)}
              data-testid="slider-scale"
            />
          </div>
          <div className="space-y-2">
            <Label>Opacity: {Math.round((options.watermarkOpacity || 30))}%</Label>
            <Slider
              value={[options.watermarkOpacity || 30]}
              min={5}
              max={100}
              step={5}
              onValueChange={([value]) => updateOption("watermarkOpacity", value)}
              data-testid="slider-opacity"
            />
          </div>
          <div className="space-y-2">
            <Label>Rotation: {options.watermarkRotation || 0} degrees</Label>
            <Slider
              value={[options.watermarkRotation || 0]}
              min={-180}
              max={180}
              step={15}
              onValueChange={([value]) => updateOption("watermarkRotation", value)}
              data-testid="slider-rotation"
            />
          </div>
          <div className="space-y-2">
            <Label>Position</Label>
            <Select
              value={options.watermarkPosition || "center"}
              onValueChange={(value) => updateOption("watermarkPosition", value as ToolOptions["watermarkPosition"])}
            >
              <SelectTrigger data-testid="select-position">
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="top-left">Top Left</SelectItem>
                <SelectItem value="top-right">Top Right</SelectItem>
                <SelectItem value="bottom-left">Bottom Left</SelectItem>
                <SelectItem value="bottom-right">Bottom Right</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Layer</Label>
            <Select
              value={options.watermarkLayer || "foreground"}
              onValueChange={(value) => updateOption("watermarkLayer", value as ToolOptions["watermarkLayer"])}
            >
              <SelectTrigger data-testid="select-layer">
                <SelectValue placeholder="Select layer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="foreground">Foreground (Over Content)</SelectItem>
                <SelectItem value="background">Background (Behind Content)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Apply to Pages</Label>
            <Select
              value={options.watermarkPages || "all"}
              onValueChange={(value) => updateOption("watermarkPages", value as ToolOptions["watermarkPages"])}
            >
              <SelectTrigger data-testid="select-pages">
                <SelectValue placeholder="Select pages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Pages</SelectItem>
                <SelectItem value="first">First Page Only</SelectItem>
                <SelectItem value="last">Last Page Only</SelectItem>
                <SelectItem value="odd">Odd Pages</SelectItem>
                <SelectItem value="even">Even Pages</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );

    case "add-tiled-watermark":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="watermarkText">Watermark Text</Label>
            <Input
              id="watermarkText"
              placeholder="e.g., CONFIDENTIAL"
              value={options.watermarkText || ""}
              onChange={(e) => updateOption("watermarkText", e.target.value)}
              data-testid="input-watermark-text"
            />
          </div>
          <div className="space-y-2">
            <Label>Font Size: {options.fontSize || 24}pt</Label>
            <Slider
              value={[options.fontSize || 24]}
              min={8}
              max={72}
              step={2}
              onValueChange={([value]) => updateOption("fontSize", value)}
              data-testid="slider-font-size"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tileColor">Color</Label>
            <Input
              id="tileColor"
              type="color"
              value={options.color || "#808080"}
              onChange={(e) => updateOption("color", e.target.value)}
              className="w-20 h-10"
              data-testid="input-color"
            />
          </div>
          <div className="space-y-2">
            <Label>Opacity: {Math.round((options.watermarkOpacity || 20))}%</Label>
            <Slider
              value={[options.watermarkOpacity || 20]}
              min={5}
              max={80}
              step={5}
              onValueChange={([value]) => updateOption("watermarkOpacity", value)}
              data-testid="slider-opacity"
            />
          </div>
          <div className="space-y-2">
            <Label>Tile Spacing: {options.watermarkTileSpacing || 100}px</Label>
            <Slider
              value={[options.watermarkTileSpacing || 100]}
              min={50}
              max={300}
              step={25}
              onValueChange={([value]) => updateOption("watermarkTileSpacing", value)}
              data-testid="slider-tile-spacing"
            />
          </div>
          <div className="space-y-2">
            <Label>Rotation: {options.watermarkRotation || 45} degrees</Label>
            <Slider
              value={[options.watermarkRotation || 45]}
              min={-90}
              max={90}
              step={15}
              onValueChange={([value]) => updateOption("watermarkRotation", value)}
              data-testid="slider-rotation"
            />
          </div>
          <div className="space-y-2">
            <Label>Apply to Pages</Label>
            <Select
              value={options.watermarkPages || "all"}
              onValueChange={(value) => updateOption("watermarkPages", value as ToolOptions["watermarkPages"])}
            >
              <SelectTrigger data-testid="select-pages">
                <SelectValue placeholder="Select pages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Pages</SelectItem>
                <SelectItem value="first">First Page Only</SelectItem>
                <SelectItem value="last">Last Page Only</SelectItem>
                <SelectItem value="odd">Odd Pages</SelectItem>
                <SelectItem value="even">Even Pages</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );

    case "stamp-pdf":
    case "pdf-stamper":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Stamp Type</Label>
            <Select
              value={options.stampType || "approved"}
              onValueChange={(value) => updateOption("stampType", value as ToolOptions["stampType"])}
            >
              <SelectTrigger data-testid="select-stamp-type">
                <SelectValue placeholder="Select stamp type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="approved">APPROVED</SelectItem>
                <SelectItem value="rejected">REJECTED</SelectItem>
                <SelectItem value="pending">PENDING</SelectItem>
                <SelectItem value="confidential">CONFIDENTIAL</SelectItem>
                <SelectItem value="draft">DRAFT</SelectItem>
                <SelectItem value="final">FINAL</SelectItem>
                <SelectItem value="copy">COPY</SelectItem>
                <SelectItem value="paid">PAID</SelectItem>
                <SelectItem value="received">RECEIVED</SelectItem>
                <SelectItem value="custom">Custom Text</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {options.stampType === "custom" && (
            <div className="space-y-2">
              <Label htmlFor="stampText">Custom Stamp Text</Label>
              <Input
                id="stampText"
                placeholder="Enter custom stamp text"
                value={options.stampText || ""}
                onChange={(e) => updateOption("stampText", e.target.value)}
                data-testid="input-stamp-text"
              />
            </div>
          )}
          <div className="space-y-2">
            <Label>Stamp Style</Label>
            <Select
              value={options.stampStyle || "rectangle"}
              onValueChange={(value) => updateOption("stampStyle", value as ToolOptions["stampStyle"])}
            >
              <SelectTrigger data-testid="select-stamp-style">
                <SelectValue placeholder="Select style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="circle">Circle Seal</SelectItem>
                <SelectItem value="rectangle">Rectangle</SelectItem>
                <SelectItem value="banner">Banner</SelectItem>
                <SelectItem value="seal">Official Seal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Size</Label>
            <Select
              value={options.stampSize || "medium"}
              onValueChange={(value) => updateOption("stampSize", value as ToolOptions["stampSize"])}
            >
              <SelectTrigger data-testid="select-stamp-size">
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Position</Label>
            <Select
              value={options.stampPosition || "center"}
              onValueChange={(value) => updateOption("stampPosition", value as ToolOptions["stampPosition"])}
            >
              <SelectTrigger data-testid="select-stamp-position">
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="top-left">Top Left</SelectItem>
                <SelectItem value="top-right">Top Right</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="bottom-left">Bottom Left</SelectItem>
                <SelectItem value="bottom-right">Bottom Right</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="stampColor">Stamp Color</Label>
            <Input
              id="stampColor"
              type="color"
              value={options.stampColor || "#dc2626"}
              onChange={(e) => updateOption("stampColor", e.target.value)}
              className="w-20 h-10"
              data-testid="input-stamp-color"
            />
          </div>
          <div className="space-y-2">
            <Label>Opacity: {Math.round((options.stampOpacity || 80))}%</Label>
            <Slider
              value={[options.stampOpacity || 80]}
              min={20}
              max={100}
              step={10}
              onValueChange={([value]) => updateOption("stampOpacity", value)}
              data-testid="slider-stamp-opacity"
            />
          </div>
          <div className="space-y-2">
            <Label>Rotation: {options.stampRotation || 0} degrees</Label>
            <Slider
              value={[options.stampRotation || 0]}
              min={-45}
              max={45}
              step={5}
              onValueChange={([value]) => updateOption("stampRotation", value)}
              data-testid="slider-stamp-rotation"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="stampDate"
              checked={options.stampDate || false}
              onCheckedChange={(checked) => updateOption("stampDate", checked)}
              data-testid="switch-stamp-date"
            />
            <Label htmlFor="stampDate">Include Current Date</Label>
          </div>
          <div className="space-y-2">
            <Label>Apply to Pages</Label>
            <Select
              value={options.stampPages || "first"}
              onValueChange={(value) => updateOption("stampPages", value as ToolOptions["stampPages"])}
            >
              <SelectTrigger data-testid="select-stamp-pages">
                <SelectValue placeholder="Select pages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Pages</SelectItem>
                <SelectItem value="first">First Page Only</SelectItem>
                <SelectItem value="last">Last Page Only</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {options.stampPages === "custom" && (
            <div className="space-y-2">
              <Label htmlFor="stampCustomPages">Page Range</Label>
              <Input
                id="stampCustomPages"
                placeholder="e.g., 1,3,5-10"
                value={options.stampCustomPages || ""}
                onChange={(e) => updateOption("stampCustomPages", e.target.value)}
                data-testid="input-stamp-custom-pages"
              />
            </div>
          )}
        </div>
      );

    case "pdf-underlay":
      return (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Upload the main PDF first, then upload the underlay PDF second.
          </p>
          <div className="space-y-2">
            <Label>Underlay Position</Label>
            <Select
              value={options.underlayPosition || "center"}
              onValueChange={(value) => updateOption("underlayPosition", value as ToolOptions["underlayPosition"])}
            >
              <SelectTrigger data-testid="select-underlay-position">
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="top-left">Top Left</SelectItem>
                <SelectItem value="top-right">Top Right</SelectItem>
                <SelectItem value="bottom-left">Bottom Left</SelectItem>
                <SelectItem value="bottom-right">Bottom Right</SelectItem>
                <SelectItem value="tile">Tile (Repeat)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Scale: {options.underlayScale || 100}%</Label>
            <Slider
              value={[options.underlayScale || 100]}
              min={10}
              max={200}
              step={10}
              onValueChange={([value]) => updateOption("underlayScale", value)}
              data-testid="slider-underlay-scale"
            />
          </div>
          <div className="space-y-2">
            <Label>Opacity: {options.underlayOpacity || 100}%</Label>
            <Slider
              value={[options.underlayOpacity || 100]}
              min={10}
              max={100}
              step={10}
              onValueChange={([value]) => updateOption("underlayOpacity", value)}
              data-testid="slider-underlay-opacity"
            />
          </div>
          <div className="space-y-2">
            <Label>Apply to Pages</Label>
            <Select
              value={options.underlayPages || "all"}
              onValueChange={(value) => updateOption("underlayPages", value as ToolOptions["underlayPages"])}
            >
              <SelectTrigger data-testid="select-underlay-pages">
                <SelectValue placeholder="Select pages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Pages</SelectItem>
                <SelectItem value="first">First Page Only</SelectItem>
                <SelectItem value="last">Last Page Only</SelectItem>
                <SelectItem value="odd">Odd Pages</SelectItem>
                <SelectItem value="even">Even Pages</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {options.underlayPages === "custom" && (
            <div className="space-y-2">
              <Label htmlFor="underlayCustomPages">Page Range</Label>
              <Input
                id="underlayCustomPages"
                placeholder="e.g., 1,3,5-10"
                value={options.underlayCustomPages || ""}
                onChange={(e) => updateOption("underlayCustomPages", e.target.value)}
                data-testid="input-underlay-custom-pages"
              />
            </div>
          )}
        </div>
      );

    case "pdf-stamp-datetime":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Date Format</Label>
            <Select
              value={options.userDateFormat || "MM/DD/YYYY"}
              onValueChange={(value) => updateOption("userDateFormat", value as ToolOptions["userDateFormat"])}
            >
              <SelectTrigger data-testid="select-date-format">
                <SelectValue placeholder="Select date format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (12/01/2025)</SelectItem>
                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (01/12/2025)</SelectItem>
                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (2025-12-01)</SelectItem>
                <SelectItem value="MMMM D, YYYY">December 1, 2025</SelectItem>
                <SelectItem value="D MMMM YYYY">1 December 2025</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Time Format</Label>
            <Select
              value={options.userTimeFormat || "12-hour"}
              onValueChange={(value) => updateOption("userTimeFormat", value as ToolOptions["userTimeFormat"])}
            >
              <SelectTrigger data-testid="select-time-format">
                <SelectValue placeholder="Select time format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12-hour">12-hour (3:45 PM)</SelectItem>
                <SelectItem value="24-hour">24-hour (15:45)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="includeDate"
              checked={options.includeDate !== false}
              onCheckedChange={(checked) => updateOption("includeDate", checked)}
              data-testid="switch-include-date"
            />
            <Label htmlFor="includeDate">Include Date</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="includeTime"
              checked={options.includeTime !== false}
              onCheckedChange={(checked) => updateOption("includeTime", checked)}
              data-testid="switch-include-time"
            />
            <Label htmlFor="includeTime">Include Time</Label>
          </div>
          <div className="space-y-2">
            <Label>Position</Label>
            <Select
              value={options.batesPosition || "bottom-right"}
              onValueChange={(value) => updateOption("batesPosition", value as ToolOptions["batesPosition"])}
            >
              <SelectTrigger data-testid="select-stamp-position">
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="top-left">Top Left</SelectItem>
                <SelectItem value="top-center">Top Center</SelectItem>
                <SelectItem value="top-right">Top Right</SelectItem>
                <SelectItem value="bottom-left">Bottom Left</SelectItem>
                <SelectItem value="bottom-center">Bottom Center</SelectItem>
                <SelectItem value="bottom-right">Bottom Right</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Font Size: {options.batesFontSize || 10}pt</Label>
            <Slider
              value={[options.batesFontSize || 10]}
              min={6}
              max={24}
              step={1}
              onValueChange={([value]) => updateOption("batesFontSize", value)}
              data-testid="slider-font-size"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stampColor">Text Color</Label>
            <Input
              id="stampColor"
              type="color"
              value={options.batesColor || "#000000"}
              onChange={(e) => updateOption("batesColor", e.target.value)}
              className="w-20 h-10"
              data-testid="input-stamp-color"
            />
          </div>
        </div>
      );

    case "pdf-stamp-username":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="userName">Your Name</Label>
            <Input
              id="userName"
              placeholder="e.g., John Smith"
              value={options.userName || ""}
              onChange={(e) => updateOption("userName", e.target.value)}
              data-testid="input-user-name"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="includeDate"
              checked={options.includeDate || false}
              onCheckedChange={(checked) => updateOption("includeDate", checked)}
              data-testid="switch-include-date"
            />
            <Label htmlFor="includeDate">Include Date</Label>
          </div>
          {options.includeDate && (
            <div className="space-y-2">
              <Label>Date Format</Label>
              <Select
                value={options.userDateFormat || "MM/DD/YYYY"}
                onValueChange={(value) => updateOption("userDateFormat", value as ToolOptions["userDateFormat"])}
              >
                <SelectTrigger data-testid="select-date-format">
                  <SelectValue placeholder="Select date format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <Label>Position</Label>
            <Select
              value={options.batesPosition || "bottom-right"}
              onValueChange={(value) => updateOption("batesPosition", value as ToolOptions["batesPosition"])}
            >
              <SelectTrigger data-testid="select-stamp-position">
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="top-left">Top Left</SelectItem>
                <SelectItem value="top-center">Top Center</SelectItem>
                <SelectItem value="top-right">Top Right</SelectItem>
                <SelectItem value="bottom-left">Bottom Left</SelectItem>
                <SelectItem value="bottom-center">Bottom Center</SelectItem>
                <SelectItem value="bottom-right">Bottom Right</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Font Size: {options.batesFontSize || 10}pt</Label>
            <Slider
              value={[options.batesFontSize || 10]}
              min={6}
              max={24}
              step={1}
              onValueChange={([value]) => updateOption("batesFontSize", value)}
              data-testid="slider-font-size"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="textColor">Text Color</Label>
            <Input
              id="textColor"
              type="color"
              value={options.batesColor || "#000000"}
              onChange={(e) => updateOption("batesColor", e.target.value)}
              className="w-20 h-10"
              data-testid="input-text-color"
            />
          </div>
        </div>
      );

    case "pdf-bates-advanced":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="batesPrefix">Prefix</Label>
            <Input
              id="batesPrefix"
              placeholder="e.g., ABC-"
              value={options.batesPrefix || ""}
              onChange={(e) => updateOption("batesPrefix", e.target.value)}
              data-testid="input-bates-prefix"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="batesSuffix">Suffix</Label>
            <Input
              id="batesSuffix"
              placeholder="e.g., -2025"
              value={options.batesSuffix || ""}
              onChange={(e) => updateOption("batesSuffix", e.target.value)}
              data-testid="input-bates-suffix"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="batesStartNumber">Starting Number</Label>
            <Input
              id="batesStartNumber"
              type="number"
              min="1"
              value={options.batesStartNumber || 1}
              onChange={(e) => updateOption("batesStartNumber", parseInt(e.target.value) || 1)}
              data-testid="input-bates-start"
            />
          </div>
          <div className="space-y-2">
            <Label>Number of Digits: {options.batesDigits || 6}</Label>
            <Slider
              value={[options.batesDigits || 6]}
              min={3}
              max={10}
              step={1}
              onValueChange={([value]) => updateOption("batesDigits", value)}
              data-testid="slider-bates-digits"
            />
            <p className="text-xs text-muted-foreground">
              Example: {(options.batesPrefix || "") + String(options.batesStartNumber || 1).padStart(options.batesDigits || 6, '0') + (options.batesSuffix || "")}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="batesIncludeDocName"
              checked={options.batesIncludeDocName || false}
              onCheckedChange={(checked) => updateOption("batesIncludeDocName", checked)}
              data-testid="switch-include-docname"
            />
            <Label htmlFor="batesIncludeDocName">Include Document Name</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="batesIncludeDate"
              checked={options.batesIncludeDate || false}
              onCheckedChange={(checked) => updateOption("batesIncludeDate", checked)}
              data-testid="switch-include-bates-date"
            />
            <Label htmlFor="batesIncludeDate">Include Date</Label>
          </div>
          {options.batesIncludeDate && (
            <div className="space-y-2">
              <Label>Date Format</Label>
              <Select
                value={options.batesDateFormat || "MM/DD/YYYY"}
                onValueChange={(value) => updateOption("batesDateFormat", value as ToolOptions["batesDateFormat"])}
              >
                <SelectTrigger data-testid="select-bates-date-format">
                  <SelectValue placeholder="Select date format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <Switch
              id="batesIncludeTime"
              checked={options.batesIncludeTime || false}
              onCheckedChange={(checked) => updateOption("batesIncludeTime", checked)}
              data-testid="switch-include-bates-time"
            />
            <Label htmlFor="batesIncludeTime">Include Time</Label>
          </div>
          <div className="space-y-2">
            <Label>Position</Label>
            <Select
              value={options.batesPosition || "bottom-right"}
              onValueChange={(value) => updateOption("batesPosition", value as ToolOptions["batesPosition"])}
            >
              <SelectTrigger data-testid="select-bates-position">
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="top-left">Top Left</SelectItem>
                <SelectItem value="top-center">Top Center</SelectItem>
                <SelectItem value="top-right">Top Right</SelectItem>
                <SelectItem value="bottom-left">Bottom Left</SelectItem>
                <SelectItem value="bottom-center">Bottom Center</SelectItem>
                <SelectItem value="bottom-right">Bottom Right</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Font Size: {options.batesFontSize || 10}pt</Label>
            <Slider
              value={[options.batesFontSize || 10]}
              min={6}
              max={24}
              step={1}
              onValueChange={([value]) => updateOption("batesFontSize", value)}
              data-testid="slider-bates-font-size"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="batesColor">Text Color</Label>
            <Input
              id="batesColor"
              type="color"
              value={options.batesColor || "#000000"}
              onChange={(e) => updateOption("batesColor", e.target.value)}
              className="w-20 h-10"
              data-testid="input-bates-color"
            />
          </div>
        </div>
      );

    case "extract-text-from-pdf":
    case "pdf-text-extractor":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Extraction Mode</Label>
            <Select
              value={options.extractionMode || "all-pages"}
              onValueChange={(value) => updateOption("extractionMode", value as ToolOptions["extractionMode"])}
            >
              <SelectTrigger data-testid="select-extraction-mode">
                <SelectValue placeholder="Select extraction mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-pages">All Pages</SelectItem>
                <SelectItem value="specific-pages">Specific Pages</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {options.extractionMode === "specific-pages" && (
            <div className="space-y-2">
              <Label htmlFor="extractionPages">Page Range</Label>
              <Input
                id="extractionPages"
                placeholder="e.g., 1,3,5-10"
                value={options.extractionPages || ""}
                onChange={(e) => updateOption("extractionPages", e.target.value)}
                data-testid="input-extraction-pages"
              />
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            Text will be extracted and saved as a plain text (.txt) file.
          </p>
        </div>
      );

    case "extract-images-from-pdf":
    case "pdf-image-extractor":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Extraction Mode</Label>
            <Select
              value={options.extractionMode || "all-pages"}
              onValueChange={(value) => updateOption("extractionMode", value as ToolOptions["extractionMode"])}
            >
              <SelectTrigger data-testid="select-extraction-mode">
                <SelectValue placeholder="Select extraction mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-pages">All Pages</SelectItem>
                <SelectItem value="specific-pages">Specific Pages</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {options.extractionMode === "specific-pages" && (
            <div className="space-y-2">
              <Label htmlFor="extractionPages">Page Range</Label>
              <Input
                id="extractionPages"
                placeholder="e.g., 1,3,5-10"
                value={options.extractionPages || ""}
                onChange={(e) => updateOption("extractionPages", e.target.value)}
                data-testid="input-extraction-pages"
              />
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            Images will be extracted and saved as a ZIP archive.
          </p>
        </div>
      );

    case "extract-tables-from-pdf":
    case "pdf-table-extractor":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Output Format</Label>
            <Select
              value={options.tableOutputFormat || "csv"}
              onValueChange={(value) => updateOption("tableOutputFormat", value as ToolOptions["tableOutputFormat"])}
            >
              <SelectTrigger data-testid="select-output-format">
                <SelectValue placeholder="Select output format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV (Comma-Separated Values)</SelectItem>
                <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Extraction Mode</Label>
            <Select
              value={options.extractionMode || "all-pages"}
              onValueChange={(value) => updateOption("extractionMode", value as ToolOptions["extractionMode"])}
            >
              <SelectTrigger data-testid="select-extraction-mode">
                <SelectValue placeholder="Select extraction mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-pages">All Pages</SelectItem>
                <SelectItem value="specific-pages">Specific Pages</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {options.extractionMode === "specific-pages" && (
            <div className="space-y-2">
              <Label htmlFor="extractionPages">Page Range</Label>
              <Input
                id="extractionPages"
                placeholder="e.g., 1,3,5-10"
                value={options.extractionPages || ""}
                onChange={(e) => updateOption("extractionPages", e.target.value)}
                data-testid="input-extraction-pages"
              />
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            Tables will be detected and extracted to the selected format.
          </p>
        </div>
      );

    case "pdf-to-xml-structured":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>XML Output Format</Label>
            <Select
              value={options.xmlOutputFormat || "structured"}
              onValueChange={(value) => updateOption("xmlOutputFormat", value as ToolOptions["xmlOutputFormat"])}
            >
              <SelectTrigger data-testid="select-xml-format">
                <SelectValue placeholder="Select XML format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="structured">Structured (Hierarchical)</SelectItem>
                <SelectItem value="simple">Simple (Flat)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="includeMetadata"
              checked={options.includeMetadata !== false}
              onCheckedChange={(checked) => updateOption("includeMetadata", checked)}
              data-testid="switch-include-metadata"
            />
            <Label htmlFor="includeMetadata">Include Document Metadata</Label>
          </div>
          <p className="text-sm text-muted-foreground">
            Convert your PDF to well-structured XML format for data integration.
          </p>
        </div>
      );

    case "read-pdf-form-data":
      return (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Upload a filled PDF form to read and display all form field names and values.
            The extracted data will be shown in JSON format for easy review.
          </p>
        </div>
      );

    case "flatten-pdf-form":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Flatten Mode</Label>
            <Select
              value={options.flattenMode || "all"}
              onValueChange={(value) => updateOption("flattenMode", value as ToolOptions["flattenMode"])}
            >
              <SelectTrigger data-testid="select-flatten-mode">
                <SelectValue placeholder="Select flatten mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All (Forms and Annotations)</SelectItem>
                <SelectItem value="forms-only">Forms Only</SelectItem>
                <SelectItem value="annotations-only">Annotations Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-muted-foreground">
            Flattening converts interactive form fields into static content that cannot be edited.
          </p>
        </div>
      );

    case "extract-fonts-from-pdf":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Font Extraction Mode</Label>
            <Select
              value={options.fontExtractionMode || "all"}
              onValueChange={(value) => updateOption("fontExtractionMode", value as ToolOptions["fontExtractionMode"])}
            >
              <SelectTrigger data-testid="select-font-mode">
                <SelectValue placeholder="Select extraction mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Fonts</SelectItem>
                <SelectItem value="embedded">Embedded Only</SelectItem>
                <SelectItem value="subset">Subset Information</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-muted-foreground">
            Extract information about fonts used in your PDF document.
          </p>
        </div>
      );

    case "zugferd-invoice-extractor":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Invoice Format</Label>
            <Select
              value={options.invoiceFormat || "zugferd"}
              onValueChange={(value) => updateOption("invoiceFormat", value as ToolOptions["invoiceFormat"])}
            >
              <SelectTrigger data-testid="select-invoice-format">
                <SelectValue placeholder="Select invoice format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="zugferd">ZUGFeRD</SelectItem>
                <SelectItem value="factur-x">Factur-X</SelectItem>
                <SelectItem value="xrechnung">XRechnung</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-muted-foreground">
            Extract structured invoice data from ZUGFeRD/Factur-X electronic invoices.
          </p>
        </div>
      );

    case "pdf-to-ubl-xml":
      return (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="includeMetadata"
              checked={options.includeMetadata !== false}
              onCheckedChange={(checked) => updateOption("includeMetadata", checked)}
              data-testid="switch-include-metadata"
            />
            <Label htmlFor="includeMetadata">Include Document Metadata</Label>
          </div>
          <p className="text-sm text-muted-foreground">
            Convert your PDF invoice to Universal Business Language (UBL) XML format
            for seamless B2B electronic exchange.
          </p>
        </div>
      );

    case "form-data-to-csv":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>CSV Delimiter</Label>
            <Select
              value={options.csvDelimiter || ","}
              onValueChange={(value) => updateOption("csvDelimiter", value as ToolOptions["csvDelimiter"])}
            >
              <SelectTrigger data-testid="select-csv-delimiter">
                <SelectValue placeholder="Select delimiter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=",">Comma (,)</SelectItem>
                <SelectItem value=";">Semicolon (;)</SelectItem>
                <SelectItem value="|">Pipe (|)</SelectItem>
                <SelectItem value="\t">Tab</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="csvHasHeader"
              checked={options.csvHasHeader !== false}
              onCheckedChange={(checked) => updateOption("csvHasHeader", checked)}
              data-testid="switch-csv-header"
            />
            <Label htmlFor="csvHasHeader">Include Header Row</Label>
          </div>
          <p className="text-sm text-muted-foreground">
            Export form field data to CSV format for spreadsheet applications.
          </p>
        </div>
      );

    case "form-data-to-xml":
      return (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="includeMetadata"
              checked={options.includeMetadata !== false}
              onCheckedChange={(checked) => updateOption("includeMetadata", checked)}
              data-testid="switch-include-metadata"
            />
            <Label htmlFor="includeMetadata">Include Field Types</Label>
          </div>
          <p className="text-sm text-muted-foreground">
            Export form field data to structured XML format for system integration.
          </p>
        </div>
      );

    case "form-data-to-json":
      return (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="includeMetadata"
              checked={options.includeMetadata !== false}
              onCheckedChange={(checked) => updateOption("includeMetadata", checked)}
              data-testid="switch-include-metadata"
            />
            <Label htmlFor="includeMetadata">Include Field Metadata</Label>
          </div>
          <p className="text-sm text-muted-foreground">
            Export form field data to JSON format for web applications.
          </p>
        </div>
      );

    case "form-filler-csv":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="csvFieldMapping">CSV Data (Field Name, Value)</Label>
            <textarea
              id="csvFieldMapping"
              className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="FirstName,LastName,Email&#10;John,Doe,john@example.com"
              value={options.csvFieldMapping || ""}
              onChange={(e) => updateOption("csvFieldMapping", e.target.value)}
              data-testid="input-csv-mapping"
            />
          </div>
          <div className="space-y-2">
            <Label>CSV Delimiter</Label>
            <Select
              value={options.csvDelimiter || ","}
              onValueChange={(value) => updateOption("csvDelimiter", value as ToolOptions["csvDelimiter"])}
            >
              <SelectTrigger data-testid="select-csv-delimiter">
                <SelectValue placeholder="Select delimiter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=",">Comma (,)</SelectItem>
                <SelectItem value=";">Semicolon (;)</SelectItem>
                <SelectItem value="|">Pipe (|)</SelectItem>
                <SelectItem value="\t">Tab</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-muted-foreground">
            Enter CSV data where the first row contains form field names and
            subsequent rows contain values to fill in the form.
          </p>
        </div>
      );

    case "pdf-form-filler-json":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="formDataJson">JSON Data</Label>
            <textarea
              id="formDataJson"
              className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder='{"FirstName": "John", "LastName": "Doe", "Email": "john@example.com"}'
              value={options.formDataJson || ""}
              onChange={(e) => updateOption("formDataJson", e.target.value)}
              data-testid="input-json-data"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Enter JSON object with field names as keys and values to fill.
            Keys should match the form field names in your PDF.
          </p>
        </div>
      );

    case "pdf-form-export-csv":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>CSV Delimiter</Label>
            <Select
              value={options.csvDelimiter || ","}
              onValueChange={(value) => updateOption("csvDelimiter", value as ToolOptions["csvDelimiter"])}
            >
              <SelectTrigger data-testid="select-csv-delimiter">
                <SelectValue placeholder="Select delimiter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=",">Comma (,)</SelectItem>
                <SelectItem value=";">Semicolon (;)</SelectItem>
                <SelectItem value="|">Pipe (|)</SelectItem>
                <SelectItem value="\t">Tab</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-muted-foreground">
            Export all form field data to a CSV file for use in spreadsheets.
          </p>
        </div>
      );

    case "pdf-form-export-json":
      return (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="includeMetadata"
              checked={options.includeMetadata !== false}
              onCheckedChange={(checked) => updateOption("includeMetadata", checked)}
              data-testid="switch-include-metadata"
            />
            <Label htmlFor="includeMetadata">Include Field Types</Label>
          </div>
          <p className="text-sm text-muted-foreground">
            Export form field data as JSON for web applications and APIs.
          </p>
        </div>
      );

    case "pdf-viewer":
    case "pdf-reader":
    case "open-pdf":
    case "read-pdf-online":
      return (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Upload your PDF file to view it directly in your browser.
            No additional options required.
          </p>
        </div>
      );

    case "compare-pdf":
    case "pdf-comparer":
    case "pdf-difference-checker":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Comparison Mode</Label>
            <Select
              value={options.comparisonMode || "detailed"}
              onValueChange={(value) => updateOption("comparisonMode", value as ToolOptions["comparisonMode"])}
            >
              <SelectTrigger data-testid="select-comparison-mode">
                <SelectValue placeholder="Select comparison mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="visual">Visual Comparison</SelectItem>
                <SelectItem value="text">Text Comparison</SelectItem>
                <SelectItem value="detailed">Detailed Analysis</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="highlightDifferences"
              checked={options.highlightDifferences !== false}
              onCheckedChange={(checked) => updateOption("highlightDifferences", checked)}
              data-testid="switch-highlight-differences"
            />
            <Label htmlFor="highlightDifferences">Highlight Differences</Label>
          </div>
          <p className="text-sm text-muted-foreground">
            Upload two PDF files to compare and find differences between them.
          </p>
        </div>
      );

    case "pdf-tagger": {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Tag Structure</Label>
            <Select
              value={options.tagStructure || "auto"}
              onValueChange={(value) => updateOption("tagStructure", value as ToolOptions["tagStructure"])}
            >
              <SelectTrigger data-testid="select-tag-structure">
                <SelectValue placeholder="Select tag structure" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Automatic Detection</SelectItem>
                <SelectItem value="document">Document Structure</SelectItem>
                <SelectItem value="heading">Headings Only</SelectItem>
                <SelectItem value="paragraph">Paragraphs</SelectItem>
                <SelectItem value="list">Lists</SelectItem>
                <SelectItem value="table">Tables</SelectItem>
                <SelectItem value="figure">Figures</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="autoTagHeadings"
              checked={options.autoTagHeadings !== false}
              onCheckedChange={(checked) => updateOption("autoTagHeadings", checked)}
              data-testid="switch-auto-tag-headings"
            />
            <Label htmlFor="autoTagHeadings">Auto-tag Headings</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="autoTagLists"
              checked={options.autoTagLists !== false}
              onCheckedChange={(checked) => updateOption("autoTagLists", checked)}
              data-testid="switch-auto-tag-lists"
            />
            <Label htmlFor="autoTagLists">Auto-tag Lists</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="autoTagTables"
              checked={options.autoTagTables !== false}
              onCheckedChange={(checked) => updateOption("autoTagTables", checked)}
              data-testid="switch-auto-tag-tables"
            />
            <Label htmlFor="autoTagTables">Auto-tag Tables</Label>
          </div>
          <p className="text-sm text-muted-foreground">
            Add accessibility tags to make your PDF accessible for screen readers.
          </p>
        </div>
      );
    }

    case "pdf-read-order-editor": {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Reading Order Mode</Label>
            <Select
              value={options.readOrderMode || "left-to-right"}
              onValueChange={(value) => updateOption("readOrderMode", value as ToolOptions["readOrderMode"])}
            >
              <SelectTrigger data-testid="select-read-order-mode">
                <SelectValue placeholder="Select reading order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left-to-right">Left to Right</SelectItem>
                <SelectItem value="right-to-left">Right to Left</SelectItem>
                <SelectItem value="top-to-bottom">Top to Bottom</SelectItem>
                <SelectItem value="custom">Custom Order</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-muted-foreground">
            Define the reading order for screen readers and assistive technologies.
          </p>
        </div>
      );
    }

    case "pdf-alt-text-editor": {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Alt Text Mode</Label>
            <Select
              value={options.altTextMode || "add"}
              onValueChange={(value) => updateOption("altTextMode", value as ToolOptions["altTextMode"])}
            >
              <SelectTrigger data-testid="select-alt-text-mode">
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="add">Add Alt Text</SelectItem>
                <SelectItem value="edit">Edit Existing</SelectItem>
                <SelectItem value="remove">Remove Alt Text</SelectItem>
                <SelectItem value="auto-generate">Auto-Generate</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="altTextContent">Default Alt Text</Label>
            <Input
              id="altTextContent"
              placeholder="Enter default alt text for images"
              value={options.altTextContent || ""}
              onChange={(e) => updateOption("altTextContent", e.target.value)}
              data-testid="input-alt-text-content"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Add or edit alternative text for images in your PDF for accessibility.
          </p>
        </div>
      );
    }

    case "pdf-language-setter": {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Document Language</Label>
            <Select
              value={options.documentLanguage || "en"}
              onValueChange={(value) => updateOption("documentLanguage", value as ToolOptions["documentLanguage"])}
            >
              <SelectTrigger data-testid="select-document-language">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="en-US">English (US)</SelectItem>
                <SelectItem value="en-GB">English (UK)</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="de">German</SelectItem>
                <SelectItem value="it">Italian</SelectItem>
                <SelectItem value="pt">Portuguese</SelectItem>
                <SelectItem value="nl">Dutch</SelectItem>
                <SelectItem value="ru">Russian</SelectItem>
                <SelectItem value="ja">Japanese</SelectItem>
                <SelectItem value="zh">Chinese</SelectItem>
                <SelectItem value="ko">Korean</SelectItem>
                <SelectItem value="ar">Arabic</SelectItem>
                <SelectItem value="hi">Hindi</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="applyToAll"
              checked={options.applyToAll !== false}
              onCheckedChange={(checked) => updateOption("applyToAll", checked)}
              data-testid="switch-apply-to-all"
            />
            <Label htmlFor="applyToAll">Apply to All Content</Label>
          </div>
          <p className="text-sm text-muted-foreground">
            Set the document language for proper screen reader pronunciation.
          </p>
        </div>
      );
    }

    case "pdf-to-tagged-pdf": {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Tag Conversion Mode</Label>
            <Select
              value={options.tagConversionMode || "basic"}
              onValueChange={(value) => updateOption("tagConversionMode", value as ToolOptions["tagConversionMode"])}
            >
              <SelectTrigger data-testid="select-tag-conversion-mode">
                <SelectValue placeholder="Select conversion mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Basic Tagging</SelectItem>
                <SelectItem value="advanced">Advanced Structure</SelectItem>
                <SelectItem value="semantic">Semantic Tagging</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="preserveExistingTags"
              checked={options.preserveExistingTags !== false}
              onCheckedChange={(checked) => updateOption("preserveExistingTags", checked)}
              data-testid="switch-preserve-existing-tags"
            />
            <Label htmlFor="preserveExistingTags">Preserve Existing Tags</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="generateRoleMap"
              checked={options.generateRoleMap === true}
              onCheckedChange={(checked) => updateOption("generateRoleMap", checked)}
              data-testid="switch-generate-role-map"
            />
            <Label htmlFor="generateRoleMap">Generate Role Map</Label>
          </div>
          <p className="text-sm text-muted-foreground">
            Convert untagged PDF to a fully tagged accessible document.
          </p>
        </div>
      );
    }

    case "pdf-color-separations-viewer": {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Separation Mode</Label>
            <Select
              value={options.separationMode || "cmyk"}
              onValueChange={(value) => updateOption("separationMode", value as ToolOptions["separationMode"])}
            >
              <SelectTrigger data-testid="select-separation-mode">
                <SelectValue placeholder="Select separation mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cmyk">CMYK Only</SelectItem>
                <SelectItem value="spot-colors">Spot Colors Only</SelectItem>
                <SelectItem value="all">All Separations</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="showCyan"
              checked={options.showCyan !== false}
              onCheckedChange={(checked) => updateOption("showCyan", checked)}
              data-testid="switch-show-cyan"
            />
            <Label htmlFor="showCyan">Show Cyan</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="showMagenta"
              checked={options.showMagenta !== false}
              onCheckedChange={(checked) => updateOption("showMagenta", checked)}
              data-testid="switch-show-magenta"
            />
            <Label htmlFor="showMagenta">Show Magenta</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="showYellow"
              checked={options.showYellow !== false}
              onCheckedChange={(checked) => updateOption("showYellow", checked)}
              data-testid="switch-show-yellow"
            />
            <Label htmlFor="showYellow">Show Yellow</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="showBlack"
              checked={options.showBlack !== false}
              onCheckedChange={(checked) => updateOption("showBlack", checked)}
              data-testid="switch-show-black"
            />
            <Label htmlFor="showBlack">Show Black (Key)</Label>
          </div>
          <p className="text-sm text-muted-foreground">
            View CMYK and spot color separations for prepress analysis.
          </p>
        </div>
      );
    }

    case "pdf-ink-coverage-calculator": {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Coverage Mode</Label>
            <Select
              value={options.inkCoverageMode || "per-page"}
              onValueChange={(value) => updateOption("inkCoverageMode", value as ToolOptions["inkCoverageMode"])}
            >
              <SelectTrigger data-testid="select-ink-coverage-mode">
                <SelectValue placeholder="Select coverage mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="per-page">Per Page Analysis</SelectItem>
                <SelectItem value="total">Total Document</SelectItem>
                <SelectItem value="detailed">Detailed Breakdown</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="includeSpotColors"
              checked={options.includeSpotColors === true}
              onCheckedChange={(checked) => updateOption("includeSpotColors", checked)}
              data-testid="switch-include-spot-colors"
            />
            <Label htmlFor="includeSpotColors">Include Spot Colors</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="exportReport"
              checked={options.exportReport !== false}
              onCheckedChange={(checked) => updateOption("exportReport", checked)}
              data-testid="switch-export-report"
            />
            <Label htmlFor="exportReport">Export Report</Label>
          </div>
          <p className="text-sm text-muted-foreground">
            Calculate ink coverage percentages for print cost estimation.
          </p>
        </div>
      );
    }

    case "pdf-transparency-flattener": {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Flatten Resolution</Label>
            <Select
              value={options.flattenResolution || "300"}
              onValueChange={(value) => updateOption("flattenResolution", value as ToolOptions["flattenResolution"])}
            >
              <SelectTrigger data-testid="select-flatten-resolution">
                <SelectValue placeholder="Select resolution" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="72">72 DPI (Screen)</SelectItem>
                <SelectItem value="150">150 DPI (Low Quality)</SelectItem>
                <SelectItem value="300">300 DPI (High Quality)</SelectItem>
                <SelectItem value="600">600 DPI (Maximum)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="convertTextToOutlines"
              checked={options.convertTextToOutlines === true}
              onCheckedChange={(checked) => updateOption("convertTextToOutlines", checked)}
              data-testid="switch-convert-text-to-outlines"
            />
            <Label htmlFor="convertTextToOutlines">Convert Text to Outlines</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="convertStrokesToOutlines"
              checked={options.convertStrokesToOutlines === true}
              onCheckedChange={(checked) => updateOption("convertStrokesToOutlines", checked)}
              data-testid="switch-convert-strokes-to-outlines"
            />
            <Label htmlFor="convertStrokesToOutlines">Convert Strokes to Outlines</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="preserveOverprintSettings"
              checked={options.preserveOverprintSettings !== false}
              onCheckedChange={(checked) => updateOption("preserveOverprintSettings", checked)}
              data-testid="switch-preserve-overprint"
            />
            <Label htmlFor="preserveOverprintSettings">Preserve Overprint</Label>
          </div>
          <p className="text-sm text-muted-foreground">
            Flatten transparency effects for reliable printing on older equipment.
          </p>
        </div>
      );
    }

    case "pdf-overprint-preview": {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Overprint Simulation</Label>
            <Select
              value={options.overprintSimulation || "on"}
              onValueChange={(value) => updateOption("overprintSimulation", value as ToolOptions["overprintSimulation"])}
            >
              <SelectTrigger data-testid="select-overprint-simulation">
                <SelectValue placeholder="Select simulation mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="on">Overprint On</SelectItem>
                <SelectItem value="off">Overprint Off</SelectItem>
                <SelectItem value="simulate-overprint">Simulate Overprint</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="showOverprintAreas"
              checked={options.showOverprintAreas !== false}
              onCheckedChange={(checked) => updateOption("showOverprintAreas", checked)}
              data-testid="switch-show-overprint-areas"
            />
            <Label htmlFor="showOverprintAreas">Show Overprint Areas</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="highlightOverprint"
              checked={options.highlightOverprint === true}
              onCheckedChange={(checked) => updateOption("highlightOverprint", checked)}
              data-testid="switch-highlight-overprint"
            />
            <Label htmlFor="highlightOverprint">Highlight Overprint</Label>
          </div>
          <p className="text-sm text-muted-foreground">
            Preview how overprint settings will appear when printed.
          </p>
        </div>
      );
    }

    case "pdf-hairline-fixer": {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Fix Mode</Label>
            <Select
              value={options.fixMode || "auto"}
              onValueChange={(value) => updateOption("fixMode", value as ToolOptions["fixMode"])}
            >
              <SelectTrigger data-testid="select-fix-mode">
                <SelectValue placeholder="Select fix mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Automatic</SelectItem>
                <SelectItem value="manual">Manual Threshold</SelectItem>
                <SelectItem value="threshold">Custom Threshold</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="minimumStrokeWidth">Minimum Stroke Width (pt)</Label>
            <div className="flex items-center gap-4">
              <Slider
                id="minimumStrokeWidth"
                min={0.1}
                max={2}
                step={0.1}
                value={[options.minimumStrokeWidth || 0.25]}
                onValueChange={([value]) => updateOption("minimumStrokeWidth", value)}
                className="flex-1"
                data-testid="slider-minimum-stroke-width"
              />
              <span className="text-sm text-muted-foreground w-12">
                {options.minimumStrokeWidth || 0.25}pt
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="targetStrokeWidth">Target Stroke Width (pt)</Label>
            <div className="flex items-center gap-4">
              <Slider
                id="targetStrokeWidth"
                min={0.25}
                max={3}
                step={0.25}
                value={[options.targetStrokeWidth || 0.5]}
                onValueChange={([value]) => updateOption("targetStrokeWidth", value)}
                className="flex-1"
                data-testid="slider-target-stroke-width"
              />
              <span className="text-sm text-muted-foreground w-12">
                {options.targetStrokeWidth || 0.5}pt
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="applyToAllStrokes"
              checked={options.applyToAllStrokes === true}
              onCheckedChange={(checked) => updateOption("applyToAllStrokes", checked)}
              data-testid="switch-apply-to-all-strokes"
            />
            <Label htmlFor="applyToAllStrokes">Apply to All Strokes</Label>
          </div>
          <p className="text-sm text-muted-foreground">
            Fix thin hairline strokes that may not print correctly.
          </p>
        </div>
      );
    }

    case "pdf-to-pdfua":
    case "pdf-accessibility-checker":
      return null;

    case "pdf-rich-black-converter": {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Rich Black Mode</Label>
            <Select
              value={options.richBlackMode || "standard"}
              onValueChange={(value) => updateOption("richBlackMode", value as ToolOptions["richBlackMode"])}
            >
              <SelectTrigger data-testid="select-rich-black-mode">
                <SelectValue placeholder="Select rich black mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard (60C, 40M, 40Y, 100K)</SelectItem>
                <SelectItem value="aggressive">Aggressive (70C, 50M, 50Y, 100K)</SelectItem>
                <SelectItem value="subtle">Subtle (40C, 30M, 30Y, 100K)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="richBlackC">Cyan (C) %</Label>
            <div className="flex items-center gap-4">
              <Slider
                id="richBlackC"
                min={0}
                max={100}
                step={5}
                value={[options.richBlackC ?? 60]}
                onValueChange={([value]) => updateOption("richBlackC", value)}
                className="flex-1"
                data-testid="slider-rich-black-c"
              />
              <span className="text-sm text-muted-foreground w-12">
                {options.richBlackC ?? 60}%
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="richBlackM">Magenta (M) %</Label>
            <div className="flex items-center gap-4">
              <Slider
                id="richBlackM"
                min={0}
                max={100}
                step={5}
                value={[options.richBlackM ?? 40]}
                onValueChange={([value]) => updateOption("richBlackM", value)}
                className="flex-1"
                data-testid="slider-rich-black-m"
              />
              <span className="text-sm text-muted-foreground w-12">
                {options.richBlackM ?? 40}%
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="richBlackY">Yellow (Y) %</Label>
            <div className="flex items-center gap-4">
              <Slider
                id="richBlackY"
                min={0}
                max={100}
                step={5}
                value={[options.richBlackY ?? 40]}
                onValueChange={([value]) => updateOption("richBlackY", value)}
                className="flex-1"
                data-testid="slider-rich-black-y"
              />
              <span className="text-sm text-muted-foreground w-12">
                {options.richBlackY ?? 40}%
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="convertTextOnly"
              checked={options.convertTextOnly === true}
              onCheckedChange={(checked) => updateOption("convertTextOnly", checked)}
              data-testid="switch-convert-text-only"
            />
            <Label htmlFor="convertTextOnly">Convert Text Only</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="convertGraphicsOnly"
              checked={options.convertGraphicsOnly === true}
              onCheckedChange={(checked) => updateOption("convertGraphicsOnly", checked)}
              data-testid="switch-convert-graphics-only"
            />
            <Label htmlFor="convertGraphicsOnly">Convert Graphics Only</Label>
          </div>
          <p className="text-sm text-muted-foreground">
            Convert flat 100% K black to rich black for deeper, more vibrant print results.
          </p>
        </div>
      );
    }

    case "pdf-font-embedder": {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Embed Mode</Label>
            <Select
              value={options.fontEmbedMode || "all"}
              onValueChange={(value) => updateOption("fontEmbedMode", value as ToolOptions["fontEmbedMode"])}
            >
              <SelectTrigger data-testid="select-font-embed-mode">
                <SelectValue placeholder="Select embed mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Embed All Fonts</SelectItem>
                <SelectItem value="missing">Embed Missing Fonts Only</SelectItem>
                <SelectItem value="selected">Embed Selected Fonts</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {options.fontEmbedMode === "selected" && (
            <div className="space-y-2">
              <Label htmlFor="selectedFonts">Selected Fonts</Label>
              <Input
                id="selectedFonts"
                placeholder="e.g., Arial, Helvetica, Times New Roman"
                value={options.selectedFonts || ""}
                onChange={(e) => updateOption("selectedFonts", e.target.value)}
                data-testid="input-selected-fonts"
              />
              <p className="text-sm text-muted-foreground">
                Enter font names separated by commas.
              </p>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <Switch
              id="subsetFonts"
              checked={options.subsetFonts !== false}
              onCheckedChange={(checked) => updateOption("subsetFonts", checked)}
              data-testid="switch-subset-fonts"
            />
            <Label htmlFor="subsetFonts">Subset Fonts (Include only used characters)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="preserveEditability"
              checked={options.preserveEditability === true}
              onCheckedChange={(checked) => updateOption("preserveEditability", checked)}
              data-testid="switch-preserve-editability"
            />
            <Label htmlFor="preserveEditability">Preserve Editability</Label>
          </div>
          <p className="text-sm text-muted-foreground">
            Embed fonts to ensure consistent display on all devices.
          </p>
        </div>
      );
    }

    case "pdf-font-unembedder": {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="selectedFontsToRemove">Fonts to Un-embed (Optional)</Label>
            <Input
              id="selectedFontsToRemove"
              placeholder="Leave empty to un-embed all fonts"
              value={options.selectedFonts || ""}
              onChange={(e) => updateOption("selectedFonts", e.target.value)}
              data-testid="input-fonts-to-remove"
            />
            <p className="text-sm text-muted-foreground">
              Enter font names separated by commas, or leave empty to un-embed all fonts.
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            Remove embedded fonts to reduce file size. Note: Documents may display differently on systems without the required fonts installed.
          </p>
        </div>
      );
    }

    case "pdf-rgb-to-cmyk": {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Rendering Intent</Label>
            <Select
              value={options.renderingIntent || "relative-colorimetric"}
              onValueChange={(value) => updateOption("renderingIntent", value as ToolOptions["renderingIntent"])}
            >
              <SelectTrigger data-testid="select-rendering-intent">
                <SelectValue placeholder="Select rendering intent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="perceptual">Perceptual (Best for photos)</SelectItem>
                <SelectItem value="relative-colorimetric">Relative Colorimetric (Best for graphics)</SelectItem>
                <SelectItem value="saturation">Saturation (Vivid colors)</SelectItem>
                <SelectItem value="absolute-colorimetric">Absolute Colorimetric (Exact colors)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="preserveBlack"
              checked={options.preserveBlack !== false}
              onCheckedChange={(checked) => updateOption("preserveBlack", checked)}
              data-testid="switch-preserve-black"
            />
            <Label htmlFor="preserveBlack">Preserve Pure Black (K only)</Label>
          </div>
          <p className="text-sm text-muted-foreground">
            Convert RGB colors to CMYK for professional printing. Some colors may shift during conversion.
          </p>
        </div>
      );
    }

    case "pdf-cmyk-to-rgb": {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Rendering Intent</Label>
            <Select
              value={options.renderingIntent || "perceptual"}
              onValueChange={(value) => updateOption("renderingIntent", value as ToolOptions["renderingIntent"])}
            >
              <SelectTrigger data-testid="select-cmyk-rgb-rendering-intent">
                <SelectValue placeholder="Select rendering intent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="perceptual">Perceptual (Best for photos)</SelectItem>
                <SelectItem value="relative-colorimetric">Relative Colorimetric</SelectItem>
                <SelectItem value="saturation">Saturation (Vivid colors)</SelectItem>
                <SelectItem value="absolute-colorimetric">Absolute Colorimetric</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-muted-foreground">
            Convert CMYK colors to RGB for optimal digital display on screens, web, and email.
          </p>
        </div>
      );
    }

    case "convert-to-grayscale": {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Source Color Space</Label>
            <Select
              value={options.colorSpaceSource || "auto"}
              onValueChange={(value) => updateOption("colorSpaceSource", value as ToolOptions["colorSpaceSource"])}
            >
              <SelectTrigger data-testid="select-source-color-space">
                <SelectValue placeholder="Select source color space" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto Detect</SelectItem>
                <SelectItem value="rgb">RGB</SelectItem>
                <SelectItem value="cmyk">CMYK</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-muted-foreground">
            Convert color PDFs to professional grayscale for printing, archival, or cost savings.
          </p>
        </div>
      );
    }

    case "pdf-spot-color-replacer": {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="spotColorName">Spot Color Name</Label>
            <Input
              id="spotColorName"
              placeholder="e.g., PANTONE 185 C"
              value={options.spotColorName || ""}
              onChange={(e) => updateOption("spotColorName", e.target.value)}
              data-testid="input-spot-color-name"
            />
          </div>
          <div className="space-y-2">
            <Label>Replacement Color Type</Label>
            <Select
              value={options.replacementColorType || "cmyk"}
              onValueChange={(value) => updateOption("replacementColorType", value as ToolOptions["replacementColorType"])}
            >
              <SelectTrigger data-testid="select-replacement-color-type">
                <SelectValue placeholder="Select replacement type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cmyk">CMYK Process Color</SelectItem>
                <SelectItem value="rgb">RGB Color</SelectItem>
                <SelectItem value="grayscale">Grayscale</SelectItem>
                <SelectItem value="another-spot">Another Spot Color</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="replacementColorValue">Replacement Color Value</Label>
            <Input
              id="replacementColorValue"
              placeholder={options.replacementColorType === "rgb" ? "e.g., 255,0,0" : "e.g., 0,100,100,0"}
              value={options.replacementColorValue || ""}
              onChange={(e) => updateOption("replacementColorValue", e.target.value)}
              data-testid="input-replacement-color-value"
            />
            <p className="text-sm text-muted-foreground">
              {options.replacementColorType === "cmyk" && "Enter CMYK values (C,M,Y,K) from 0-100"}
              {options.replacementColorType === "rgb" && "Enter RGB values (R,G,B) from 0-255"}
              {options.replacementColorType === "grayscale" && "Enter gray value from 0-100"}
              {options.replacementColorType === "another-spot" && "Enter the spot color name"}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="matchSimilarColors"
              checked={options.matchSimilarColors === true}
              onCheckedChange={(checked) => updateOption("matchSimilarColors", checked)}
              data-testid="switch-match-similar-colors"
            />
            <Label htmlFor="matchSimilarColors">Match Similar Colors</Label>
          </div>
          {options.matchSimilarColors && (
            <div className="space-y-2">
              <Label htmlFor="spotColorTolerance">Color Tolerance (%)</Label>
              <div className="flex items-center gap-4">
                <Slider
                  id="spotColorTolerance"
                  min={0}
                  max={30}
                  step={1}
                  value={[options.spotColorTolerance || 5]}
                  onValueChange={([value]) => updateOption("spotColorTolerance", value)}
                  className="flex-1"
                  data-testid="slider-spot-color-tolerance"
                />
                <span className="text-sm text-muted-foreground w-12">
                  {options.spotColorTolerance || 5}%
                </span>
              </div>
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            Replace spot colors with CMYK or other colors to reduce printing costs.
          </p>
        </div>
      );
    }

    case "compress-image": {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="imageCompressionQuality">Compression Quality</Label>
            <div className="flex items-center gap-4">
              <Slider
                id="imageCompressionQuality"
                min={10}
                max={100}
                step={5}
                value={[options.imageCompressionQuality || 80]}
                onValueChange={([value]) => updateOption("imageCompressionQuality", value)}
                className="flex-1"
                data-testid="slider-image-compression-quality"
              />
              <span className="text-sm text-muted-foreground w-12">
                {options.imageCompressionQuality || 80}%
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Higher quality = larger file size, lower quality = smaller file size.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="imageMaxWidth">Max Width (px)</Label>
            <Input
              id="imageMaxWidth"
              type="number"
              placeholder="4096"
              value={options.imageMaxWidth || ""}
              onChange={(e) => updateOption("imageMaxWidth", parseInt(e.target.value) || undefined)}
              data-testid="input-image-max-width"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="imageMaxHeight">Max Height (px)</Label>
            <Input
              id="imageMaxHeight"
              type="number"
              placeholder="4096"
              value={options.imageMaxHeight || ""}
              onChange={(e) => updateOption("imageMaxHeight", parseInt(e.target.value) || undefined)}
              data-testid="input-image-max-height"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="preserveAspectRatio"
              checked={options.preserveAspectRatio !== false}
              onCheckedChange={(checked) => updateOption("preserveAspectRatio", checked)}
              data-testid="switch-preserve-aspect-ratio"
            />
            <Label htmlFor="preserveAspectRatio">Preserve Aspect Ratio</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="stripMetadata"
              checked={options.stripMetadata !== false}
              onCheckedChange={(checked) => updateOption("stripMetadata", checked)}
              data-testid="switch-strip-metadata"
            />
            <Label htmlFor="stripMetadata">Strip Metadata (EXIF, etc.)</Label>
          </div>
          <p className="text-sm text-muted-foreground">
            Compress images while maintaining quality for web, email, or storage.
          </p>
        </div>
      );
    }

    case "compress-jpg": {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="jpgCompressionQuality">JPEG Quality</Label>
            <div className="flex items-center gap-4">
              <Slider
                id="jpgCompressionQuality"
                min={10}
                max={100}
                step={5}
                value={[options.imageCompressionQuality || 80]}
                onValueChange={([value]) => updateOption("imageCompressionQuality", value)}
                className="flex-1"
                data-testid="slider-jpg-compression-quality"
              />
              <span className="text-sm text-muted-foreground w-12">
                {options.imageCompressionQuality || 80}%
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Higher quality = larger file, lower quality = smaller file with more compression artifacts.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="jpgMaxWidth">Max Width (px)</Label>
            <Input
              id="jpgMaxWidth"
              type="number"
              placeholder="4096"
              value={options.imageMaxWidth || ""}
              onChange={(e) => updateOption("imageMaxWidth", parseInt(e.target.value) || undefined)}
              data-testid="input-jpg-max-width"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="jpgMaxHeight">Max Height (px)</Label>
            <Input
              id="jpgMaxHeight"
              type="number"
              placeholder="4096"
              value={options.imageMaxHeight || ""}
              onChange={(e) => updateOption("imageMaxHeight", parseInt(e.target.value) || undefined)}
              data-testid="input-jpg-max-height"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Optimize JPEG images with MozJPEG for best compression results.
          </p>
        </div>
      );
    }

    case "compress-png": {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pngCompressionQuality">PNG Quality</Label>
            <div className="flex items-center gap-4">
              <Slider
                id="pngCompressionQuality"
                min={10}
                max={100}
                step={5}
                value={[options.imageCompressionQuality || 80]}
                onValueChange={([value]) => updateOption("imageCompressionQuality", value)}
                className="flex-1"
                data-testid="slider-png-compression-quality"
              />
              <span className="text-sm text-muted-foreground w-12">
                {options.imageCompressionQuality || 80}%
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Higher quality preserves more colors, lower quality uses palette optimization for smaller files.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="pngMaxWidth">Max Width (px)</Label>
            <Input
              id="pngMaxWidth"
              type="number"
              placeholder="4096"
              value={options.imageMaxWidth || ""}
              onChange={(e) => updateOption("imageMaxWidth", parseInt(e.target.value) || undefined)}
              data-testid="input-png-max-width"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pngMaxHeight">Max Height (px)</Label>
            <Input
              id="pngMaxHeight"
              type="number"
              placeholder="4096"
              value={options.imageMaxHeight || ""}
              onChange={(e) => updateOption("imageMaxHeight", parseInt(e.target.value) || undefined)}
              data-testid="input-png-max-height"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Compress PNG images while preserving transparency for web and graphics.
          </p>
        </div>
      );
    }

    case "compress-gif": {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="gifColors">Color Palette Size</Label>
            <div className="flex items-center gap-4">
              <Slider
                id="gifColors"
                min={2}
                max={256}
                step={1}
                value={[options.gifColors || 128]}
                onValueChange={([value]) => updateOption("gifColors", value)}
                className="flex-1"
                data-testid="slider-gif-colors"
              />
              <span className="text-sm text-muted-foreground w-12">
                {options.gifColors || 128}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Fewer colors result in smaller files. GIF supports max 256 colors.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="gifMaxWidth">Max Width (px)</Label>
            <Input
              id="gifMaxWidth"
              type="number"
              placeholder="800"
              value={options.imageMaxWidth || ""}
              onChange={(e) => updateOption("imageMaxWidth", parseInt(e.target.value) || undefined)}
              data-testid="input-gif-max-width"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gifMaxHeight">Max Height (px)</Label>
            <Input
              id="gifMaxHeight"
              type="number"
              placeholder="800"
              value={options.imageMaxHeight || ""}
              onChange={(e) => updateOption("imageMaxHeight", parseInt(e.target.value) || undefined)}
              data-testid="input-gif-max-height"
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="gifDither"
              checked={options.gifDither !== false}
              onCheckedChange={(checked) => updateOption("gifDither", checked)}
              data-testid="checkbox-gif-dither"
            />
            <Label htmlFor="gifDither" className="text-sm">Enable dithering for smoother gradients</Label>
          </div>
          <p className="text-sm text-muted-foreground">
            Compress animated GIF files while preserving animation frames.
          </p>
        </div>
      );
    }

    case "compress-svg": {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="svgPrecision">Coordinate Precision</Label>
            <div className="flex items-center gap-4">
              <Slider
                id="svgPrecision"
                min={0}
                max={6}
                step={1}
                value={[options.svgPrecision || 2]}
                onValueChange={([value]) => updateOption("svgPrecision", value)}
                className="flex-1"
                data-testid="slider-svg-precision"
              />
              <span className="text-sm text-muted-foreground w-12">
                {options.svgPrecision || 2} digits
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Lower precision reduces file size but may affect complex curves.
            </p>
          </div>
          <div className="space-y-3">
            <Label>Optimization Options</Label>
            <div className="flex items-center gap-2">
              <Checkbox
                id="svgRemoveComments"
                checked={options.svgRemoveComments !== false}
                onCheckedChange={(checked) => updateOption("svgRemoveComments", checked)}
                data-testid="checkbox-svg-remove-comments"
              />
              <Label htmlFor="svgRemoveComments" className="text-sm">Remove comments</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="svgRemoveMetadata"
                checked={options.svgRemoveMetadata !== false}
                onCheckedChange={(checked) => updateOption("svgRemoveMetadata", checked)}
                data-testid="checkbox-svg-remove-metadata"
              />
              <Label htmlFor="svgRemoveMetadata" className="text-sm">Remove metadata and XML declarations</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="svgMinifyStyles"
                checked={options.svgMinifyStyles !== false}
                onCheckedChange={(checked) => updateOption("svgMinifyStyles", checked)}
                data-testid="checkbox-svg-minify-styles"
              />
              <Label htmlFor="svgMinifyStyles" className="text-sm">Minify whitespace</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="svgRemoveUnused"
                checked={options.svgRemoveUnused !== false}
                onCheckedChange={(checked) => updateOption("svgRemoveUnused", checked)}
                data-testid="checkbox-svg-remove-unused"
              />
              <Label htmlFor="svgRemoveUnused" className="text-sm">Remove unused IDs</Label>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Optimize SVG vector graphics by removing unnecessary code.
          </p>
        </div>
      );
    }

    case "compress-webp": {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="webpCompressionQuality">WebP Quality</Label>
            <div className="flex items-center gap-4">
              <Slider
                id="webpCompressionQuality"
                min={10}
                max={100}
                step={5}
                value={[options.imageCompressionQuality || 80]}
                onValueChange={([value]) => updateOption("imageCompressionQuality", value)}
                className="flex-1"
                data-testid="slider-webp-compression-quality"
              />
              <span className="text-sm text-muted-foreground w-12">
                {options.imageCompressionQuality || 80}%
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Higher quality preserves more detail, lower quality creates smaller files.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="webpMaxWidth">Max Width (px)</Label>
            <Input
              id="webpMaxWidth"
              type="number"
              placeholder="4096"
              value={options.imageMaxWidth || ""}
              onChange={(e) => updateOption("imageMaxWidth", parseInt(e.target.value) || undefined)}
              data-testid="input-webp-max-width"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="webpMaxHeight">Max Height (px)</Label>
            <Input
              id="webpMaxHeight"
              type="number"
              placeholder="4096"
              value={options.imageMaxHeight || ""}
              onChange={(e) => updateOption("imageMaxHeight", parseInt(e.target.value) || undefined)}
              data-testid="input-webp-max-height"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            WebP offers superior compression with support for transparency and animation.
          </p>
        </div>
      );
    }

    case "compress-heic": {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="heicCompressionQuality">Output Quality</Label>
            <div className="flex items-center gap-4">
              <Slider
                id="heicCompressionQuality"
                min={10}
                max={100}
                step={5}
                value={[options.imageCompressionQuality || 80]}
                onValueChange={([value]) => updateOption("imageCompressionQuality", value)}
                className="flex-1"
                data-testid="slider-heic-compression-quality"
              />
              <span className="text-sm text-muted-foreground w-12">
                {options.imageCompressionQuality || 80}%
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              HEIC files will be converted to optimized JPEG format for compatibility.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="heicMaxWidth">Max Width (px)</Label>
            <Input
              id="heicMaxWidth"
              type="number"
              placeholder="4096"
              value={options.imageMaxWidth || ""}
              onChange={(e) => updateOption("imageMaxWidth", parseInt(e.target.value) || undefined)}
              data-testid="input-heic-max-width"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="heicMaxHeight">Max Height (px)</Label>
            <Input
              id="heicMaxHeight"
              type="number"
              placeholder="4096"
              value={options.imageMaxHeight || ""}
              onChange={(e) => updateOption("imageMaxHeight", parseInt(e.target.value) || undefined)}
              data-testid="input-heic-max-height"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Compress HEIC/HEIF images from iPhone and iPad for universal compatibility.
          </p>
        </div>
      );
    }

    case "resize-image":
    case "resize-jpg":
    case "resize-png":
    case "resize-webp": {
      const formatLabel = toolType === "resize-jpg" ? "JPG" : 
                          toolType === "resize-png" ? "PNG" : 
                          toolType === "resize-webp" ? "WebP" : "Image";
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Resize Mode</Label>
            <Select
              value={options.resizePercentage ? "percentage" : "dimensions"}
              onValueChange={(value) => {
                if (value === "percentage") {
                  updateOption("resizeTargetWidth", undefined);
                  updateOption("resizeTargetHeight", undefined);
                  updateOption("resizePercentage", 100);
                } else {
                  updateOption("resizePercentage", undefined);
                }
              }}
            >
              <SelectTrigger data-testid="select-resize-mode">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dimensions">Exact Dimensions</SelectItem>
                <SelectItem value="percentage">Scale by Percentage</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {options.resizePercentage !== undefined ? (
            <div className="space-y-2">
              <Label htmlFor="resizePercentage">Scale Percentage</Label>
              <div className="flex items-center gap-4">
                <Slider
                  id="resizePercentage"
                  min={10}
                  max={200}
                  step={5}
                  value={[options.resizePercentage || 100]}
                  onValueChange={([value]) => updateOption("resizePercentage", value)}
                  className="flex-1"
                  data-testid="slider-resize-percentage"
                />
                <span className="text-sm text-muted-foreground w-12">
                  {options.resizePercentage || 100}%
                </span>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="resizeWidth">Target Width (px)</Label>
                <Input
                  id="resizeWidth"
                  type="number"
                  placeholder="Enter width or leave blank"
                  value={options.resizeTargetWidth || ""}
                  onChange={(e) => updateOption("resizeTargetWidth", parseInt(e.target.value) || undefined)}
                  data-testid="input-resize-width"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="resizeHeight">Target Height (px)</Label>
                <Input
                  id="resizeHeight"
                  type="number"
                  placeholder="Enter height or leave blank"
                  value={options.resizeTargetHeight || ""}
                  onChange={(e) => updateOption("resizeTargetHeight", parseInt(e.target.value) || undefined)}
                  data-testid="input-resize-height"
                />
              </div>
            </>
          )}
          
          <div className="space-y-2">
            <Label>Resize Fit Mode</Label>
            <Select
              value={options.resizeFit || "inside"}
              onValueChange={(value) => updateOption("resizeFit", value)}
            >
              <SelectTrigger data-testid="select-resize-fit">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inside">Fit Inside (preserve aspect ratio)</SelectItem>
                <SelectItem value="cover">Cover (crop to fill)</SelectItem>
                <SelectItem value="contain">Contain (add padding)</SelectItem>
                <SelectItem value="fill">Fill (stretch to fit)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Scaling Algorithm</Label>
            <Select
              value={options.resizeKernel || "lanczos3"}
              onValueChange={(value) => updateOption("resizeKernel", value)}
            >
              <SelectTrigger data-testid="select-resize-kernel">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lanczos3">Lanczos3 (best quality)</SelectItem>
                <SelectItem value="lanczos2">Lanczos2 (balanced)</SelectItem>
                <SelectItem value="cubic">Cubic (smooth)</SelectItem>
                <SelectItem value="mitchell">Mitchell (text-friendly)</SelectItem>
                <SelectItem value="nearest">Nearest (pixel art)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {toolType === "resize-image" && (
            <div className="space-y-2">
              <Label>Output Format</Label>
              <Select
                value={options.outputFormat || "original"}
                onValueChange={(value) => updateOption("outputFormat", value)}
              >
                <SelectTrigger data-testid="select-output-format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="original">Keep Original Format</SelectItem>
                  <SelectItem value="jpeg">JPEG</SelectItem>
                  <SelectItem value="png">PNG</SelectItem>
                  <SelectItem value="webp">WebP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          <p className="text-sm text-muted-foreground">
            Resize {formatLabel} images to custom dimensions with high-quality resampling.
          </p>
        </div>
      );
    }

    case "resize-gif": {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Resize Mode</Label>
            <Select
              value={options.resizePercentage ? "percentage" : "dimensions"}
              onValueChange={(value) => {
                if (value === "percentage") {
                  updateOption("resizeTargetWidth", undefined);
                  updateOption("resizeTargetHeight", undefined);
                  updateOption("resizePercentage", 100);
                } else {
                  updateOption("resizePercentage", undefined);
                }
              }}
            >
              <SelectTrigger data-testid="select-gif-resize-mode">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dimensions">Exact Dimensions</SelectItem>
                <SelectItem value="percentage">Scale by Percentage</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {options.resizePercentage !== undefined ? (
            <div className="space-y-2">
              <Label htmlFor="gifResizePercentage">Scale Percentage</Label>
              <div className="flex items-center gap-4">
                <Slider
                  id="gifResizePercentage"
                  min={10}
                  max={200}
                  step={5}
                  value={[options.resizePercentage || 100]}
                  onValueChange={([value]) => updateOption("resizePercentage", value)}
                  className="flex-1"
                  data-testid="slider-gif-resize-percentage"
                />
                <span className="text-sm text-muted-foreground w-12">
                  {options.resizePercentage || 100}%
                </span>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="gifResizeWidth">Target Width (px)</Label>
                <Input
                  id="gifResizeWidth"
                  type="number"
                  placeholder="Enter width or leave blank"
                  value={options.resizeTargetWidth || ""}
                  onChange={(e) => updateOption("resizeTargetWidth", parseInt(e.target.value) || undefined)}
                  data-testid="input-gif-resize-width"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gifResizeHeight">Target Height (px)</Label>
                <Input
                  id="gifResizeHeight"
                  type="number"
                  placeholder="Enter height or leave blank"
                  value={options.resizeTargetHeight || ""}
                  onChange={(e) => updateOption("resizeTargetHeight", parseInt(e.target.value) || undefined)}
                  data-testid="input-gif-resize-height"
                />
              </div>
            </>
          )}
          
          <div className="space-y-2">
            <Label>Resize Fit Mode</Label>
            <Select
              value={options.resizeFit || "inside"}
              onValueChange={(value) => updateOption("resizeFit", value)}
            >
              <SelectTrigger data-testid="select-gif-resize-fit">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inside">Fit Inside (preserve aspect ratio)</SelectItem>
                <SelectItem value="cover">Cover (crop to fill)</SelectItem>
                <SelectItem value="fill">Fill (stretch to fit)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="gifColorsResize">Color Palette Size</Label>
            <div className="flex items-center gap-4">
              <Slider
                id="gifColorsResize"
                min={2}
                max={256}
                step={1}
                value={[options.gifColors || 256]}
                onValueChange={([value]) => updateOption("gifColors", value)}
                className="flex-1"
                data-testid="slider-gif-resize-colors"
              />
              <span className="text-sm text-muted-foreground w-12">
                {options.gifColors || 256}
              </span>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Resize animated GIF images while preserving all animation frames.
          </p>
        </div>
      );
    }

    case "resize-svg": {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="svgWidth">New Width</Label>
            <Input
              id="svgWidth"
              type="number"
              placeholder="Enter width (e.g., 800)"
              value={options.svgWidth || options.resizeTargetWidth || ""}
              onChange={(e) => updateOption("svgWidth", parseInt(e.target.value) || undefined)}
              data-testid="input-svg-width"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="svgHeight">New Height</Label>
            <Input
              id="svgHeight"
              type="number"
              placeholder="Enter height (e.g., 600)"
              value={options.svgHeight || options.resizeTargetHeight || ""}
              onChange={(e) => updateOption("svgHeight", parseInt(e.target.value) || undefined)}
              data-testid="input-svg-height"
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="svgPreserveAspectRatio"
              checked={options.svgPreserveAspectRatio !== false}
              onCheckedChange={(checked) => updateOption("svgPreserveAspectRatio", checked)}
              data-testid="checkbox-svg-preserve-aspect-ratio"
            />
            <Label htmlFor="svgPreserveAspectRatio" className="text-sm">Preserve aspect ratio</Label>
          </div>
          <p className="text-sm text-muted-foreground">
            Set SVG viewport dimensions. Vector quality is preserved at any size.
          </p>
        </div>
      );
    }

    case "resize-heic": {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Resize Mode</Label>
            <Select
              value={options.resizePercentage ? "percentage" : "dimensions"}
              onValueChange={(value) => {
                if (value === "percentage") {
                  updateOption("resizeTargetWidth", undefined);
                  updateOption("resizeTargetHeight", undefined);
                  updateOption("resizePercentage", 100);
                } else {
                  updateOption("resizePercentage", undefined);
                }
              }}
            >
              <SelectTrigger data-testid="select-resize-mode-heic">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dimensions">Exact Dimensions</SelectItem>
                <SelectItem value="percentage">Scale by Percentage</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {options.resizePercentage !== undefined ? (
            <div className="space-y-2">
              <Label htmlFor="resizePercentageHeic">Scale Percentage</Label>
              <div className="flex items-center gap-4">
                <Slider
                  id="resizePercentageHeic"
                  min={10}
                  max={200}
                  step={5}
                  value={[options.resizePercentage || 100]}
                  onValueChange={([value]) => updateOption("resizePercentage", value)}
                  className="flex-1"
                  data-testid="slider-resize-percentage-heic"
                />
                <span className="text-sm text-muted-foreground w-12">
                  {options.resizePercentage || 100}%
                </span>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="resizeWidthHeic">Target Width (px)</Label>
                <Input
                  id="resizeWidthHeic"
                  type="number"
                  placeholder="e.g., 1920"
                  value={options.resizeTargetWidth || ""}
                  onChange={(e) => updateOption("resizeTargetWidth", parseInt(e.target.value) || undefined)}
                  data-testid="input-resize-width-heic"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="resizeHeightHeic">Target Height (px)</Label>
                <Input
                  id="resizeHeightHeic"
                  type="number"
                  placeholder="e.g., 1080"
                  value={options.resizeTargetHeight || ""}
                  onChange={(e) => updateOption("resizeTargetHeight", parseInt(e.target.value) || undefined)}
                  data-testid="input-resize-height-heic"
                />
              </div>
            </>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="heicQuality">Output Quality</Label>
            <div className="flex items-center gap-4">
              <Slider
                id="heicQuality"
                min={10}
                max={100}
                step={5}
                value={[options.imageCompressionQuality || 90]}
                onValueChange={([value]) => updateOption("imageCompressionQuality", value)}
                className="flex-1"
                data-testid="slider-heic-quality"
              />
              <span className="text-sm text-muted-foreground w-12">
                {options.imageCompressionQuality || 90}%
              </span>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground">
            HEIC images will be converted to JPEG format after resizing.
          </p>
        </div>
      );
    }

    case "crop-image":
    case "crop-jpg":
    case "crop-png": {
      const formatLabel = toolType === "crop-jpg" ? "JPG" : 
                          toolType === "crop-png" ? "PNG" : "Image";
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Aspect Ratio</Label>
            <Select
              value={options.imageCropAspectRatio || "free"}
              onValueChange={(value) => updateOption("imageCropAspectRatio", value as any)}
            >
              <SelectTrigger data-testid="select-crop-aspect">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free Form</SelectItem>
                <SelectItem value="1:1">1:1 (Square)</SelectItem>
                <SelectItem value="4:3">4:3 (Standard)</SelectItem>
                <SelectItem value="16:9">16:9 (Widescreen)</SelectItem>
                <SelectItem value="3:2">3:2 (DSLR)</SelectItem>
                <SelectItem value="2:3">2:3 (Portrait)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cropX">Start X (px)</Label>
              <Input
                id="cropX"
                type="number"
                placeholder="0"
                value={options.imageCropX || ""}
                onChange={(e) => updateOption("imageCropX", parseInt(e.target.value) || 0)}
                data-testid="input-crop-x"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cropY">Start Y (px)</Label>
              <Input
                id="cropY"
                type="number"
                placeholder="0"
                value={options.imageCropY || ""}
                onChange={(e) => updateOption("imageCropY", parseInt(e.target.value) || 0)}
                data-testid="input-crop-y"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cropWidth">Width (px)</Label>
              <Input
                id="cropWidth"
                type="number"
                placeholder="e.g., 800"
                value={options.imageCropWidth || ""}
                onChange={(e) => updateOption("imageCropWidth", parseInt(e.target.value) || undefined)}
                data-testid="input-crop-width"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cropHeight">Height (px)</Label>
              <Input
                id="cropHeight"
                type="number"
                placeholder="e.g., 600"
                value={options.imageCropHeight || ""}
                onChange={(e) => updateOption("imageCropHeight", parseInt(e.target.value) || undefined)}
                data-testid="input-crop-height"
              />
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Crop your {formatLabel} image by specifying start coordinates and dimensions.
          </p>
        </div>
      );
    }

    case "rotate-image": {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Rotation Angle</Label>
            <Select
              value={options.imageRotation || "90"}
              onValueChange={(value) => updateOption("imageRotation", value as any)}
            >
              <SelectTrigger data-testid="select-image-rotation">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="90">90° Clockwise</SelectItem>
                <SelectItem value="180">180°</SelectItem>
                <SelectItem value="270">270° (90° Counter-clockwise)</SelectItem>
                <SelectItem value="custom">Custom Angle</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {options.imageRotation === "custom" && (
            <div className="space-y-2">
              <Label htmlFor="customAngle">Custom Angle (degrees)</Label>
              <Input
                id="customAngle"
                type="number"
                placeholder="e.g., 45"
                value={options.imageRotationAngle || ""}
                onChange={(e) => updateOption("imageRotationAngle", parseInt(e.target.value) || 0)}
                data-testid="input-custom-angle"
              />
            </div>
          )}
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Switch
                id="flipHorizontal"
                checked={options.imageFlipHorizontal || false}
                onCheckedChange={(checked) => updateOption("imageFlipHorizontal", checked)}
                data-testid="switch-flip-h"
              />
              <Label htmlFor="flipHorizontal" className="text-sm">Flip Horizontally (Mirror)</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="flipVertical"
                checked={options.imageFlipVertical || false}
                onCheckedChange={(checked) => updateOption("imageFlipVertical", checked)}
                data-testid="switch-flip-v"
              />
              <Label htmlFor="flipVertical" className="text-sm">Flip Vertically</Label>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Rotate or flip your image. Works with all common image formats.
          </p>
        </div>
      );
    }

    case "watermark-image": {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="watermarkText">Watermark Text</Label>
            <Input
              id="watermarkText"
              placeholder="e.g., Copyright 2024"
              value={options.imageWatermarkText || ""}
              onChange={(e) => updateOption("imageWatermarkText", e.target.value)}
              data-testid="input-watermark-text"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Position</Label>
            <Select
              value={options.imageWatermarkPosition || "center"}
              onValueChange={(value) => updateOption("imageWatermarkPosition", value as any)}
            >
              <SelectTrigger data-testid="select-watermark-position">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="top-left">Top Left</SelectItem>
                <SelectItem value="top-right">Top Right</SelectItem>
                <SelectItem value="bottom-left">Bottom Left</SelectItem>
                <SelectItem value="bottom-right">Bottom Right</SelectItem>
                <SelectItem value="tile">Tile (Repeat)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="watermarkOpacity">Opacity</Label>
            <div className="flex items-center gap-4">
              <Slider
                id="watermarkOpacity"
                min={0.1}
                max={1}
                step={0.1}
                value={[options.imageWatermarkOpacity || 0.5]}
                onValueChange={([value]) => updateOption("imageWatermarkOpacity", value)}
                className="flex-1"
                data-testid="slider-watermark-opacity"
              />
              <span className="text-sm text-muted-foreground w-12">
                {Math.round((options.imageWatermarkOpacity || 0.5) * 100)}%
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="watermarkColor">Text Color</Label>
              <Input
                id="watermarkColor"
                type="color"
                value={options.imageWatermarkColor || "#ffffff"}
                onChange={(e) => updateOption("imageWatermarkColor", e.target.value)}
                className="h-9"
                data-testid="input-watermark-color"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="watermarkFontSize">Font Size</Label>
              <Input
                id="watermarkFontSize"
                type="number"
                placeholder="48"
                value={options.imageWatermarkFontSize || ""}
                onChange={(e) => updateOption("imageWatermarkFontSize", parseInt(e.target.value) || 48)}
                data-testid="input-watermark-fontsize"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="watermarkRotation">Rotation (degrees)</Label>
            <Input
              id="watermarkRotation"
              type="number"
              placeholder="0"
              value={options.imageWatermarkRotation || ""}
              onChange={(e) => updateOption("imageWatermarkRotation", parseInt(e.target.value) || 0)}
              data-testid="input-watermark-rotation"
            />
          </div>
          
          <p className="text-sm text-muted-foreground">
            Add a text watermark to protect your images.
          </p>
        </div>
      );
    }

    case "add-text-to-image": {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="textContent">Text Content</Label>
            <Input
              id="textContent"
              placeholder="Enter your text"
              value={options.imageTextContent || ""}
              onChange={(e) => updateOption("imageTextContent", e.target.value)}
              data-testid="input-text-content"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="textX">X Position (px)</Label>
              <Input
                id="textX"
                type="number"
                placeholder="50"
                value={options.imageTextX || ""}
                onChange={(e) => updateOption("imageTextX", parseInt(e.target.value) || 50)}
                data-testid="input-text-x"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="textY">Y Position (px)</Label>
              <Input
                id="textY"
                type="number"
                placeholder="50"
                value={options.imageTextY || ""}
                onChange={(e) => updateOption("imageTextY", parseInt(e.target.value) || 50)}
                data-testid="input-text-y"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="textFontSize">Font Size</Label>
              <Input
                id="textFontSize"
                type="number"
                placeholder="32"
                value={options.imageTextFontSize || ""}
                onChange={(e) => updateOption("imageTextFontSize", parseInt(e.target.value) || 32)}
                data-testid="input-text-fontsize"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="textColor">Text Color</Label>
              <Input
                id="textColor"
                type="color"
                value={options.imageTextColor || "#000000"}
                onChange={(e) => updateOption("imageTextColor", e.target.value)}
                className="h-9"
                data-testid="input-text-color"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Font Family</Label>
            <Select
              value={options.imageTextFont || "sans-serif"}
              onValueChange={(value) => updateOption("imageTextFont", value as any)}
            >
              <SelectTrigger data-testid="select-text-font">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sans-serif">Sans-serif (Clean)</SelectItem>
                <SelectItem value="serif">Serif (Classic)</SelectItem>
                <SelectItem value="monospace">Monospace (Code)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="textBgColor">Background Color (optional)</Label>
            <Input
              id="textBgColor"
              type="color"
              value={options.imageTextBackgroundColor || "#ffffff"}
              onChange={(e) => updateOption("imageTextBackgroundColor", e.target.value)}
              className="h-9"
              data-testid="input-text-bgcolor"
            />
            <p className="text-xs text-muted-foreground">Leave empty for transparent background</p>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Add custom text overlay to your image.
          </p>
        </div>
      );
    }

    case "image-converter": {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Target Format</Label>
            <Select
              value={options.imageConvertFormat || "jpg"}
              onValueChange={(value) => updateOption("imageConvertFormat", value as any)}
            >
              <SelectTrigger data-testid="select-convert-format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="jpg">JPEG (.jpg)</SelectItem>
                <SelectItem value="png">PNG (.png)</SelectItem>
                <SelectItem value="webp">WebP (.webp)</SelectItem>
                <SelectItem value="gif">GIF (.gif)</SelectItem>
                <SelectItem value="tiff">TIFF (.tiff)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {(options.imageConvertFormat === "jpg" || options.imageConvertFormat === "webp" || !options.imageConvertFormat) && (
            <div className="space-y-2">
              <Label htmlFor="convertQuality">Quality</Label>
              <div className="flex items-center gap-4">
                <Slider
                  id="convertQuality"
                  min={10}
                  max={100}
                  step={5}
                  value={[options.imageConvertQuality || 90]}
                  onValueChange={([value]) => updateOption("imageConvertQuality", value)}
                  className="flex-1"
                  data-testid="slider-convert-quality"
                />
                <span className="text-sm text-muted-foreground w-12">
                  {options.imageConvertQuality || 90}%
                </span>
              </div>
            </div>
          )}
          
          <p className="text-sm text-muted-foreground">
            Convert your image to a different format while maintaining quality.
          </p>
        </div>
      );
    }

    case "png-to-jpg": {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="jpgQuality">JPEG Quality</Label>
            <div className="flex items-center gap-4">
              <Slider
                id="jpgQuality"
                min={10}
                max={100}
                step={5}
                value={[options.imageConvertQuality || 90]}
                onValueChange={([value]) => updateOption("imageConvertQuality", value)}
                className="flex-1"
                data-testid="slider-jpg-quality"
              />
              <span className="text-sm text-muted-foreground w-12">
                {options.imageConvertQuality || 90}%
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bgColor">Background Color</Label>
            <Input
              id="bgColor"
              type="color"
              value={options.imageTextBackgroundColor || "#ffffff"}
              onChange={(e) => updateOption("imageTextBackgroundColor", e.target.value)}
              className="h-9"
              data-testid="input-bg-color"
            />
            <p className="text-xs text-muted-foreground">
              This color replaces transparent areas (JPEG doesn't support transparency)
            </p>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Convert PNG images to JPEG format with custom quality settings.
          </p>
        </div>
      );
    }

    case "jpg-to-png": {
      return (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Convert JPEG images to PNG format for lossless quality.
            No additional options required.
          </p>
          <div className="bg-muted/50 p-3 rounded-md">
            <p className="text-sm">
              PNG format provides lossless compression, making it ideal for:
            </p>
            <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
              <li>Further image editing without quality loss</li>
              <li>Graphics with sharp edges and text</li>
              <li>Images that need transparency support later</li>
            </ul>
          </div>
        </div>
      );
    }

    case "heic-to-jpg": {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="heicQuality">JPEG Quality</Label>
            <div className="flex items-center gap-4">
              <Slider
                id="heicQuality"
                min={10}
                max={100}
                step={5}
                value={[options.imageConvertQuality || 90]}
                onValueChange={([value]) => updateOption("imageConvertQuality", value)}
                className="flex-1"
                data-testid="slider-heic-quality"
              />
              <span className="text-sm text-muted-foreground w-12">
                {options.imageConvertQuality || 90}%
              </span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Convert Apple HEIC/HEIF photos to universally compatible JPG format.
          </p>
        </div>
      );
    }

    case "webp-to-jpg": {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="webpQuality">JPEG Quality</Label>
            <div className="flex items-center gap-4">
              <Slider
                id="webpQuality"
                min={10}
                max={100}
                step={5}
                value={[options.imageConvertQuality || 90]}
                onValueChange={([value]) => updateOption("imageConvertQuality", value)}
                className="flex-1"
                data-testid="slider-webp-quality"
              />
              <span className="text-sm text-muted-foreground w-12">
                {options.imageConvertQuality || 90}%
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="webpBgColor">Background Color</Label>
            <Input
              id="webpBgColor"
              type="color"
              value={options.imageTextBackgroundColor || "#ffffff"}
              onChange={(e) => updateOption("imageTextBackgroundColor", e.target.value)}
              className="h-9"
              data-testid="input-webp-bg-color"
            />
            <p className="text-xs text-muted-foreground">
              This color replaces transparent areas in WebP images
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            Convert WebP images to JPG for maximum compatibility.
          </p>
        </div>
      );
    }

    case "image-to-base64": {
      return (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Upload an image to convert it to Base64 encoded string.
          </p>
          <div className="bg-muted/50 p-3 rounded-md">
            <p className="text-sm font-medium">Output includes:</p>
            <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
              <li>Complete data URI for HTML/CSS embedding</li>
              <li>Raw Base64 string for custom use</li>
              <li>Automatic MIME type detection</li>
            </ul>
          </div>
        </div>
      );
    }

    case "base64-to-image": {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="base64Input">Base64 String</Label>
            <textarea
              id="base64Input"
              placeholder="Paste your Base64 string or data URI here..."
              value={options.base64Input || ""}
              onChange={(e) => updateOption("base64Input", e.target.value)}
              className="w-full h-32 p-3 text-sm border rounded-md bg-background"
              data-testid="input-base64"
            />
            <p className="text-xs text-muted-foreground">
              Paste a complete data URI (data:image/...;base64,...) or raw Base64 string
            </p>
          </div>
        </div>
      );
    }

    case "image-editor":
    case "photo-editor": {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Rotation</Label>
            <Select
              value={String(options.imageRotation || "0")}
              onValueChange={(value) => updateOption("imageRotation", parseInt(value) as any)}
            >
              <SelectTrigger data-testid="select-rotation">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">No Rotation</SelectItem>
                <SelectItem value="90">90 Clockwise</SelectItem>
                <SelectItem value="180">180</SelectItem>
                <SelectItem value="270">270 Clockwise</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <Switch
                id="flipH"
                checked={options.imageFlipH || false}
                onCheckedChange={(checked) => updateOption("imageFlipH", checked)}
                data-testid="switch-flip-h"
              />
              <Label htmlFor="flipH">Flip Horizontal</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="flipV"
                checked={options.imageFlipV || false}
                onCheckedChange={(checked) => updateOption("imageFlipV", checked)}
                data-testid="switch-flip-v"
              />
              <Label htmlFor="flipV">Flip Vertical</Label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="resizeWidth">Resize Width (px)</Label>
              <Input
                id="resizeWidth"
                type="number"
                min={1}
                placeholder="Auto"
                value={options.imageResizeWidth || ""}
                onChange={(e) => updateOption("imageResizeWidth", e.target.value ? parseInt(e.target.value) : undefined)}
                data-testid="input-resize-width"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="resizeHeight">Resize Height (px)</Label>
              <Input
                id="resizeHeight"
                type="number"
                min={1}
                placeholder="Auto"
                value={options.imageResizeHeight || ""}
                onChange={(e) => updateOption("imageResizeHeight", e.target.value ? parseInt(e.target.value) : undefined)}
                data-testid="input-resize-height"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Brightness: {options.imageBrightness || 100}%</Label>
            <Slider
              min={0}
              max={200}
              step={5}
              value={[options.imageBrightness || 100]}
              onValueChange={([value]) => updateOption("imageBrightness", value)}
              data-testid="slider-brightness"
            />
          </div>

          <div className="space-y-2">
            <Label>Contrast: {options.imageContrast || 100}%</Label>
            <Slider
              min={0}
              max={200}
              step={5}
              value={[options.imageContrast || 100]}
              onValueChange={([value]) => updateOption("imageContrast", value)}
              data-testid="slider-contrast"
            />
          </div>

          <div className="space-y-2">
            <Label>Saturation: {options.imageSaturation || 100}%</Label>
            <Slider
              min={0}
              max={200}
              step={5}
              value={[options.imageSaturation || 100]}
              onValueChange={([value]) => updateOption("imageSaturation", value)}
              data-testid="slider-saturation"
            />
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="grayscale"
              checked={options.imageGrayscale || false}
              onCheckedChange={(checked) => updateOption("imageGrayscale", checked)}
              data-testid="switch-grayscale"
            />
            <Label htmlFor="grayscale">Convert to Grayscale</Label>
          </div>

          <div className="space-y-2">
            <Label>Blur: {options.imageBlur || 0}</Label>
            <Slider
              min={0}
              max={20}
              step={0.5}
              value={[options.imageBlur || 0]}
              onValueChange={([value]) => updateOption("imageBlur", value)}
              data-testid="slider-blur"
            />
          </div>

          <div className="space-y-2">
            <Label>Sharpen: {options.imageSharpen || 0}</Label>
            <Slider
              min={0}
              max={10}
              step={0.5}
              value={[options.imageSharpen || 0]}
              onValueChange={([value]) => updateOption("imageSharpen", value)}
              data-testid="slider-sharpen"
            />
          </div>

          <div className="space-y-2">
            <Label>Output Format</Label>
            <Select
              value={options.imageOutputFormat || "png"}
              onValueChange={(value) => updateOption("imageOutputFormat", value as any)}
            >
              <SelectTrigger data-testid="select-output-format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="png">PNG</SelectItem>
                <SelectItem value="jpg">JPEG</SelectItem>
                <SelectItem value="webp">WebP</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );
    }

    case "remove-image-background":
    case "image-background-remover": {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bgColor">Background Color to Remove</Label>
            <Input
              id="bgColor"
              type="color"
              value={options.bgRemoveColor || "#ffffff"}
              onChange={(e) => updateOption("bgRemoveColor", e.target.value)}
              className="h-9"
              data-testid="input-bg-remove-color"
            />
            <p className="text-xs text-muted-foreground">
              Select the background color to make transparent
            </p>
          </div>
          <div className="space-y-2">
            <Label>Threshold: {options.bgRemoveThreshold || 30}</Label>
            <Slider
              min={1}
              max={100}
              step={1}
              value={[options.bgRemoveThreshold || 30]}
              onValueChange={([value]) => updateOption("bgRemoveThreshold", value)}
              data-testid="slider-threshold"
            />
            <p className="text-xs text-muted-foreground">
              Higher values remove more similar colors (less precise)
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            Removes solid color backgrounds. Works best with high-contrast images.
          </p>
        </div>
      );
    }

    case "convert-to-ico":
    case "ico-converter": {
      return (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Convert your image to ICO format for use as a favicon or Windows icon.
          </p>
          <div className="bg-muted/50 p-3 rounded-md">
            <p className="text-sm font-medium">Generated sizes:</p>
            <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
              <li>16x16 (browser tabs)</li>
              <li>32x32 (taskbar)</li>
              <li>48x48 (desktop)</li>
              <li>64x64, 128x128, 256x256 (high DPI)</li>
            </ul>
          </div>
          <p className="text-xs text-muted-foreground">
            For best results, use a square image with at least 256x256 resolution.
          </p>
        </div>
      );
    }

    case "image-to-svg": {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Color Mode</Label>
            <Select
              value={options.svgColorMode || "color"}
              onValueChange={(value) => updateOption("svgColorMode", value as any)}
            >
              <SelectTrigger data-testid="select-svg-color-mode">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="color">Full Color</SelectItem>
                <SelectItem value="grayscale">Grayscale</SelectItem>
                <SelectItem value="monochrome">Monochrome (Black & White)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Path Simplification: {options.svgPathSimplify || 2}</Label>
            <Slider
              min={0}
              max={10}
              step={0.5}
              value={[options.svgPathSimplify || 2]}
              onValueChange={([value]) => updateOption("svgPathSimplify", value)}
              data-testid="slider-path-simplify"
            />
            <p className="text-xs text-muted-foreground">
              Higher values create simpler paths (smaller files), lower values preserve more detail
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="optCurve"
              checked={options.svgOptCurve !== false}
              onCheckedChange={(checked) => updateOption("svgOptCurve", checked)}
              data-testid="switch-opt-curve"
            />
            <Label htmlFor="optCurve">Optimize curves</Label>
          </div>
        </div>
      );
    }

    case "svg-to-png": {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="svgWidth">Width (pixels)</Label>
            <Input
              id="svgWidth"
              type="number"
              placeholder="Auto"
              value={options.svgToPngWidth || ""}
              onChange={(e) => updateOption("svgToPngWidth", e.target.value ? parseInt(e.target.value) : undefined)}
              data-testid="input-svg-width"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="svgHeight">Height (pixels)</Label>
            <Input
              id="svgHeight"
              type="number"
              placeholder="Auto"
              value={options.svgToPngHeight || ""}
              onChange={(e) => updateOption("svgToPngHeight", e.target.value ? parseInt(e.target.value) : undefined)}
              data-testid="input-svg-height"
            />
          </div>
          <div className="space-y-2">
            <Label>Scale: {options.svgToPngScale || 1}x</Label>
            <Slider
              min={0.5}
              max={4}
              step={0.5}
              value={[options.svgToPngScale || 1]}
              onValueChange={([value]) => updateOption("svgToPngScale", value)}
              data-testid="slider-svg-scale"
            />
            <p className="text-xs text-muted-foreground">
              Scale multiplier (ignored if width/height are set)
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bgColor">Background Color</Label>
            <Input
              id="bgColor"
              type="color"
              value={options.svgToPngBackground || "#ffffff"}
              onChange={(e) => updateOption("svgToPngBackground", e.target.value)}
              className="h-9"
              data-testid="input-svg-bg-color"
            />
            <p className="text-xs text-muted-foreground">
              Leave white for transparent background
            </p>
          </div>
        </div>
      );
    }

    case "upscale-image": {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Scale Factor</Label>
            <Select
              value={options.upscaleScale || "2"}
              onValueChange={(value) => updateOption("upscaleScale", value as any)}
            >
              <SelectTrigger data-testid="select-upscale-scale">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2x (Double size)</SelectItem>
                <SelectItem value="3">3x (Triple size)</SelectItem>
                <SelectItem value="4">4x (Quadruple size)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Upscaling Mode</Label>
            <Select
              value={options.upscaleMode || "standard"}
              onValueChange={(value) => updateOption("upscaleMode", value as any)}
            >
              <SelectTrigger data-testid="select-upscale-mode">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fast">Fast (Quick processing)</SelectItem>
                <SelectItem value="standard">Standard (Balanced)</SelectItem>
                <SelectItem value="quality">Quality (Best results)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-muted-foreground">
            Upscaling uses smart interpolation to enlarge your image while preserving details.
          </p>
        </div>
      );
    }

    case "ai-image-upscaler": {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Scale Factor</Label>
            <Select
              value={options.aiUpscaleScale || "2"}
              onValueChange={(value) => updateOption("aiUpscaleScale", value as any)}
            >
              <SelectTrigger data-testid="select-ai-upscale-scale">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2x</SelectItem>
                <SelectItem value="4">4x</SelectItem>
                <SelectItem value="8">8x (Maximum enhancement)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="enhance"
              checked={options.aiUpscaleEnhance !== false}
              onCheckedChange={(checked) => updateOption("aiUpscaleEnhance", checked)}
              data-testid="switch-ai-enhance"
            />
            <Label htmlFor="enhance">Enable AI enhancement</Label>
          </div>
          <div className="space-y-2">
            <Label>Noise Reduction: {options.aiUpscaleDenoising || 0}</Label>
            <Slider
              min={0}
              max={100}
              step={5}
              value={[options.aiUpscaleDenoising || 0]}
              onValueChange={([value]) => updateOption("aiUpscaleDenoising", value)}
              data-testid="slider-denoising"
            />
            <p className="text-xs text-muted-foreground">
              Reduce noise and grain in the upscaled image
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            AI-powered upscaling generates realistic details for stunning results.
          </p>
        </div>
      );
    }

    case "colorize-photo": {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Color Intensity: {options.colorizeIntensity || 100}%</Label>
            <Slider
              min={0}
              max={100}
              step={5}
              value={[options.colorizeIntensity || 100]}
              onValueChange={([value]) => updateOption("colorizeIntensity", value)}
              data-testid="slider-colorize-intensity"
            />
            <p className="text-xs text-muted-foreground">
              Lower values create a subtle, vintage effect
            </p>
          </div>
          <div className="space-y-2">
            <Label>Saturation: {options.colorizeSaturation || 100}%</Label>
            <Slider
              min={50}
              max={150}
              step={5}
              value={[options.colorizeSaturation || 100]}
              onValueChange={([value]) => updateOption("colorizeSaturation", value)}
              data-testid="slider-colorize-saturation"
            />
            <p className="text-xs text-muted-foreground">
              Adjust the vibrancy of colors
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            Automatically adds natural-looking colors to black and white photographs.
          </p>
        </div>
      );
    }

    case "image-color-picker": {
      return (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="extractPalette"
              checked={options.extractPalette !== false}
              onCheckedChange={(checked) => updateOption("extractPalette", checked)}
              data-testid="switch-extract-palette"
            />
            <Label htmlFor="extractPalette">Extract color palette</Label>
          </div>
          {options.extractPalette !== false && (
            <div className="space-y-2">
              <Label>Number of Colors: {options.paletteColors || 6}</Label>
              <Slider
                min={2}
                max={12}
                step={1}
                value={[options.paletteColors || 6]}
                onValueChange={([value]) => updateOption("paletteColors", value)}
                data-testid="slider-palette-colors"
              />
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            Extract dominant colors from your image and get color codes (HEX, RGB, HSL).
          </p>
        </div>
      );
    }

    case "gif-maker": {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Frame Delay: {options.gifFrameDelay || 100}ms</Label>
            <Slider
              min={20}
              max={1000}
              step={10}
              value={[options.gifFrameDelay || 100]}
              onValueChange={([value]) => updateOption("gifFrameDelay", value)}
              data-testid="slider-frame-delay"
            />
            <p className="text-xs text-muted-foreground">
              Time between frames (lower = faster animation)
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="gifWidth">Output Width (pixels)</Label>
            <Input
              id="gifWidth"
              type="number"
              placeholder="Auto"
              value={options.gifWidth || ""}
              onChange={(e) => updateOption("gifWidth", e.target.value ? parseInt(e.target.value) : undefined)}
              data-testid="input-gif-width"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="loop"
              checked={options.gifLoop !== false}
              onCheckedChange={(checked) => updateOption("gifLoop", checked)}
              data-testid="switch-gif-loop"
            />
            <Label htmlFor="loop">Loop animation</Label>
          </div>
          <div className="space-y-2">
            <Label>Quality: {options.gifQuality || 80}%</Label>
            <Slider
              min={10}
              max={100}
              step={5}
              value={[options.gifQuality || 80]}
              onValueChange={([value]) => updateOption("gifQuality", value)}
              data-testid="slider-gif-quality"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Upload multiple images to create an animated GIF.
          </p>
        </div>
      );
    }

    case "video-to-gif": {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="startTime">Start Time (seconds)</Label>
            <Input
              id="startTime"
              type="number"
              step="0.1"
              placeholder="0"
              value={options.videoStartTime || ""}
              onChange={(e) => updateOption("videoStartTime", e.target.value ? parseFloat(e.target.value) : undefined)}
              data-testid="input-start-time"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="duration">Duration (seconds)</Label>
            <Input
              id="duration"
              type="number"
              step="0.1"
              placeholder="5"
              value={options.videoDuration || ""}
              onChange={(e) => updateOption("videoDuration", e.target.value ? parseFloat(e.target.value) : undefined)}
              data-testid="input-duration"
            />
          </div>
          <div className="space-y-2">
            <Label>Frame Rate: {options.videoFps || 10} FPS</Label>
            <Slider
              min={5}
              max={30}
              step={1}
              value={[options.videoFps || 10]}
              onValueChange={([value]) => updateOption("videoFps", value)}
              data-testid="slider-fps"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gifWidth">Output Width (pixels)</Label>
            <Input
              id="gifWidth"
              type="number"
              placeholder="480"
              value={options.videoGifWidth || ""}
              onChange={(e) => updateOption("videoGifWidth", e.target.value ? parseInt(e.target.value) : undefined)}
              data-testid="input-video-gif-width"
            />
          </div>
          <div className="space-y-2">
            <Label>Quality: {options.videoGifQuality || 80}%</Label>
            <Slider
              min={10}
              max={100}
              step={5}
              value={[options.videoGifQuality || 80]}
              onValueChange={([value]) => updateOption("videoGifQuality", value)}
              data-testid="slider-video-gif-quality"
            />
          </div>
        </div>
      );
    }

    case "gif-to-mp4": {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Output Quality</Label>
            <Select
              value={options.gifToMp4Quality || "medium"}
              onValueChange={(value) => updateOption("gifToMp4Quality", value as any)}
            >
              <SelectTrigger data-testid="select-mp4-quality">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low (Smaller file)</SelectItem>
                <SelectItem value="medium">Medium (Balanced)</SelectItem>
                <SelectItem value="high">High (Best quality)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="mp4Loop"
              checked={options.gifToMp4Loop !== false}
              onCheckedChange={(checked) => updateOption("gifToMp4Loop", checked)}
              data-testid="switch-mp4-loop"
            />
            <Label htmlFor="mp4Loop">Create looping video</Label>
          </div>
          <p className="text-sm text-muted-foreground">
            Convert GIF to MP4 for better quality and smaller file size.
          </p>
        </div>
      );
    }

    case "apng-maker": {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Frame Delay: {options.apngFrameDelay || 100}ms</Label>
            <Slider
              min={20}
              max={1000}
              step={10}
              value={[options.apngFrameDelay || 100]}
              onValueChange={([value]) => updateOption("apngFrameDelay", value)}
              data-testid="slider-apng-delay"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="apngLoop"
              checked={options.apngLoop !== false}
              onCheckedChange={(checked) => updateOption("apngLoop", checked)}
              data-testid="switch-apng-loop"
            />
            <Label htmlFor="apngLoop">Loop animation</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="apngOptimize"
              checked={options.apngOptimize !== false}
              onCheckedChange={(checked) => updateOption("apngOptimize", checked)}
              data-testid="switch-apng-optimize"
            />
            <Label htmlFor="apngOptimize">Optimize file size</Label>
          </div>
          <p className="text-sm text-muted-foreground">
            Create animated PNG files with full transparency support. Better quality than GIF.
          </p>
        </div>
      );
    }

    case "gif-to-png": {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Frame Index (for animated GIFs)</Label>
            <Input
              type="number"
              min={0}
              value={options.frameIndex || 0}
              onChange={(e) => updateOption("frameIndex", e.target.value)}
              placeholder="0 = first frame"
              data-testid="input-frame-index"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Convert GIF to PNG with lossless quality. For animated GIFs, select which frame to extract.
          </p>
        </div>
      );
    }

    case "gif-to-jpg": {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Quality: {options.quality || 90}%</Label>
            <Slider
              min={10}
              max={100}
              step={5}
              value={[options.quality || 90]}
              onValueChange={([value]) => updateOption("quality", value)}
              data-testid="slider-jpg-quality"
            />
          </div>
          <div className="space-y-2">
            <Label>Frame Index (for animated GIFs)</Label>
            <Input
              type="number"
              min={0}
              value={options.frameIndex || 0}
              onChange={(e) => updateOption("frameIndex", e.target.value)}
              placeholder="0 = first frame"
              data-testid="input-frame-index-jpg"
            />
          </div>
          <div className="space-y-2">
            <Label>Background Color</Label>
            <Input
              type="color"
              value={options.backgroundColor || "#ffffff"}
              onChange={(e) => updateOption("backgroundColor", e.target.value)}
              className="h-10 w-full"
              data-testid="input-bg-color"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Convert GIF to compressed JPG format. Transparent areas will be filled with the background color.
          </p>
        </div>
      );
    }

    case "png-to-gif": {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Color Count: {options.colors || 256}</Label>
            <Slider
              min={2}
              max={256}
              step={2}
              value={[options.colors || 256]}
              onValueChange={([value]) => updateOption("colors", value)}
              data-testid="slider-gif-colors"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="dithering"
              checked={options.dithering !== 'false'}
              onCheckedChange={(checked) => updateOption("dithering", checked ? 'true' : 'false')}
              data-testid="switch-dithering"
            />
            <Label htmlFor="dithering">Enable dithering</Label>
          </div>
          <p className="text-sm text-muted-foreground">
            Convert PNG to GIF format. Dithering can help smooth out color transitions.
          </p>
        </div>
      );
    }

    case "jpg-to-gif": {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Color Count: {options.colors || 256}</Label>
            <Slider
              min={2}
              max={256}
              step={2}
              value={[options.colors || 256]}
              onValueChange={([value]) => updateOption("colors", value)}
              data-testid="slider-gif-colors-jpg"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="dithering-jpg"
              checked={options.dithering !== 'false'}
              onCheckedChange={(checked) => updateOption("dithering", checked ? 'true' : 'false')}
              data-testid="switch-dithering-jpg"
            />
            <Label htmlFor="dithering-jpg">Enable dithering</Label>
          </div>
          <p className="text-sm text-muted-foreground">
            Convert JPG to GIF format. Dithering helps simulate colors beyond GIF's 256 limit.
          </p>
        </div>
      );
    }

    case "bmp-to-jpg": {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Quality: {options.quality || 90}%</Label>
            <Slider
              min={10}
              max={100}
              step={5}
              value={[options.quality || 90]}
              onValueChange={([value]) => updateOption("quality", value)}
              data-testid="slider-bmp-jpg-quality"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Convert BMP bitmap to compressed JPG format. Higher quality = larger file size.
          </p>
        </div>
      );
    }

    case "jpg-to-bmp": {
      return (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Convert JPG to uncompressed BMP bitmap format. BMP files are larger but preserve quality without further compression.
          </p>
        </div>
      );
    }

    case "tiff-to-jpg": {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Quality: {options.quality || 90}%</Label>
            <Slider
              min={10}
              max={100}
              step={5}
              value={[options.quality || 90]}
              onValueChange={([value]) => updateOption("quality", value)}
              data-testid="slider-tiff-jpg-quality"
            />
          </div>
          <div className="space-y-2">
            <Label>Page Index (for multi-page TIFF)</Label>
            <Input
              type="number"
              min={0}
              value={options.pageIndex || 0}
              onChange={(e) => updateOption("pageIndex", e.target.value)}
              placeholder="0 = first page"
              data-testid="input-tiff-page"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Convert TIFF to compressed JPG format. For multi-page TIFFs, select which page to convert.
          </p>
        </div>
      );
    }

    case "jpg-to-tiff": {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Compression</Label>
            <Select
              value={options.compression || "lzw"}
              onValueChange={(value) => updateOption("compression", value)}
            >
              <SelectTrigger data-testid="select-tiff-compression">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None (Largest file)</SelectItem>
                <SelectItem value="lzw">LZW (Lossless)</SelectItem>
                <SelectItem value="deflate">Deflate (Lossless)</SelectItem>
                <SelectItem value="jpeg">JPEG (Lossy)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-muted-foreground">
            Convert JPG to TIFF format for professional printing and archival. LZW offers good lossless compression.
          </p>
        </div>
      );
    }

    case "webp-to-png": {
      return (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Convert WebP to PNG format with lossless quality. PNG is widely supported and ideal for graphics with transparency.
          </p>
        </div>
      );
    }

    case "png-to-webp": {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Quality: {options.quality || 90}%</Label>
            <Slider
              min={10}
              max={100}
              step={5}
              value={[options.quality || 90]}
              onValueChange={([value]) => updateOption("quality", value)}
              data-testid="slider-webp-quality"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="lossless"
              checked={options.lossless === 'true'}
              onCheckedChange={(checked) => updateOption("lossless", checked ? 'true' : 'false')}
              data-testid="switch-lossless"
            />
            <Label htmlFor="lossless">Lossless compression</Label>
          </div>
          <p className="text-sm text-muted-foreground">
            Convert PNG to WebP format for smaller file sizes. Enable lossless for perfect quality.
          </p>
        </div>
      );
    }

    case "webp-to-gif": {
      return (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Convert WebP images to GIF format for maximum compatibility. GIF is supported on virtually all platforms and devices.
          </p>
        </div>
      );
    }

    case "gif-to-webp": {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Quality: {options.quality || 80}%</Label>
            <Slider
              min={10}
              max={100}
              step={5}
              value={[options.quality || 80]}
              onValueChange={([value]) => updateOption("quality", value)}
              data-testid="slider-gif-webp-quality"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Convert GIF to WebP format for significantly smaller file sizes. WebP typically produces files 25-50% smaller.
          </p>
        </div>
      );
    }

    case "heic-to-png": {
      return (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Convert Apple HEIC/HEIF images to lossless PNG format. Perfect for editing and sharing iPhone photos with universal compatibility.
          </p>
        </div>
      );
    }

    case "heic-to-gif": {
      return (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Convert Apple HEIC/HEIF images to universally compatible GIF format. Ideal for sharing iPhone photos on any platform.
          </p>
        </div>
      );
    }

    case "avif-to-jpg": {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Quality: {options.quality || 90}%</Label>
            <Slider
              min={10}
              max={100}
              step={5}
              value={[options.quality || 90]}
              onValueChange={([value]) => updateOption("quality", value)}
              data-testid="slider-avif-jpg-quality"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Convert AVIF images to universally compatible JPG format. Higher quality produces larger files.
          </p>
        </div>
      );
    }

    case "jpg-to-avif": {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Quality: {options.quality || 80}%</Label>
            <Slider
              min={10}
              max={100}
              step={5}
              value={[options.quality || 80]}
              onValueChange={([value]) => updateOption("quality", value)}
              data-testid="slider-jpg-avif-quality"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Convert JPG to next-generation AVIF format. AVIF offers superior compression with 30-50% smaller files.
          </p>
        </div>
      );
    }

    case "avif-to-png": {
      return (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Convert AVIF images to lossless PNG format. Perfect for editing and archival with full transparency support.
          </p>
        </div>
      );
    }

    case "png-to-avif": {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Quality: {options.quality || 80}%</Label>
            <Slider
              min={10}
              max={100}
              step={5}
              value={[options.quality || 80]}
              onValueChange={([value]) => updateOption("quality", value)}
              data-testid="slider-png-avif-quality"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="lossless"
              checked={options.lossless === 'true'}
              onCheckedChange={(checked) => updateOption("lossless", checked ? 'true' : 'false')}
              data-testid="switch-avif-lossless"
            />
            <Label htmlFor="lossless">Lossless compression</Label>
          </div>
          <p className="text-sm text-muted-foreground">
            Convert PNG to AVIF format for maximum compression. AVIF supports both lossy and lossless modes.
          </p>
        </div>
      );
    }

    case "jpe-to-jpg": {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Quality: {options.quality || 95}%</Label>
            <Slider
              min={10}
              max={100}
              step={5}
              value={[options.quality || 95]}
              onValueChange={([value]) => updateOption("quality", value)}
              data-testid="slider-jpe-jpg-quality"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Convert JPE files to standard JPG format. JPE is an alternative extension for JPEG - this ensures compatibility with all applications.
          </p>
        </div>
      );
    }

    case "jfif-to-jpg": {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Quality: {options.quality || 95}%</Label>
            <Slider
              min={10}
              max={100}
              step={5}
              value={[options.quality || 95]}
              onValueChange={([value]) => updateOption("quality", value)}
              data-testid="slider-jfif-jpg-quality"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Convert JFIF files to standard JPG format. JFIF is the JPEG File Interchange Format - converting ensures universal compatibility.
          </p>
        </div>
      );
    }

    case "raw-to-jpg":
    case "cr2-to-jpg":
    case "nef-to-jpg":
    case "arw-to-jpg":
    case "dng-to-jpg": {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Quality: {options.quality || 90}%</Label>
            <Slider
              min={10}
              max={100}
              step={5}
              value={[options.quality || 90]}
              onValueChange={([value]) => updateOption("quality", value)}
              data-testid="slider-raw-quality"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Convert RAW camera files to high-quality JPG images. Supports Canon CR2, Nikon NEF, Sony ARW, Adobe DNG, and other RAW formats.
          </p>
        </div>
      );
    }

    case "svg-to-jpg": {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Quality: {options.quality || 90}%</Label>
            <Slider
              min={10}
              max={100}
              step={5}
              value={[options.quality || 90]}
              onValueChange={([value]) => updateOption("quality", value)}
              data-testid="slider-svg-jpg-quality"
            />
          </div>
          <div className="space-y-2">
            <Label>Width: {options.width || 1920}px</Label>
            <Slider
              min={100}
              max={4000}
              step={100}
              value={[options.width || 1920]}
              onValueChange={([value]) => updateOption("width", value)}
              data-testid="slider-svg-jpg-width"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Convert SVG vector graphics to JPG raster images with customizable quality and resolution.
          </p>
        </div>
      );
    }

    case "eps-to-png": {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Width: {options.width || 1920}px</Label>
            <Slider
              min={100}
              max={4000}
              step={100}
              value={[options.width || 1920]}
              onValueChange={([value]) => updateOption("width", value)}
              data-testid="slider-eps-png-width"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Convert EPS vector files to PNG format with transparency support.
          </p>
        </div>
      );
    }

    case "eps-to-jpg": {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Quality: {options.quality || 90}%</Label>
            <Slider
              min={10}
              max={100}
              step={5}
              value={[options.quality || 90]}
              onValueChange={([value]) => updateOption("quality", value)}
              data-testid="slider-eps-jpg-quality"
            />
          </div>
          <div className="space-y-2">
            <Label>Width: {options.width || 1920}px</Label>
            <Slider
              min={100}
              max={4000}
              step={100}
              value={[options.width || 1920]}
              onValueChange={([value]) => updateOption("width", value)}
              data-testid="slider-eps-jpg-width"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Convert EPS vector files to JPG raster format with customizable quality and resolution.
          </p>
        </div>
      );
    }

    case "psd-to-jpg": {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Quality: {options.quality || 90}%</Label>
            <Slider
              min={10}
              max={100}
              step={5}
              value={[options.quality || 90]}
              onValueChange={([value]) => updateOption("quality", value)}
              data-testid="slider-psd-jpg-quality"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Convert Photoshop PSD files to JPG format. All layers will be flattened into a single image.
          </p>
        </div>
      );
    }

    case "psd-to-png": {
      return (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Convert Photoshop PSD files to PNG format with transparency support. All visible layers will be flattened while preserving transparency.
          </p>
        </div>
      );
    }

    case "ai-to-jpg":
    case "ai-to-png":
    case "indd-to-jpg":
    case "flip-image-vertical":
    case "flip-image-horizontal": {
      return (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Upload your file and click process. No additional options needed.
          </p>
        </div>
      );
    }

    case "adjust-brightness": {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Brightness: {options.imageBrightness || 100}%</Label>
            <Slider
              min={0}
              max={200}
              step={5}
              value={[options.imageBrightness || 100]}
              onValueChange={([value]) => updateOption("imageBrightness", value)}
              data-testid="slider-brightness"
            />
            <p className="text-sm text-muted-foreground">
              100% is normal. Lower values darken, higher values brighten.
            </p>
          </div>
        </div>
      );
    }

    case "adjust-contrast": {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Contrast: {options.imageContrast || 100}%</Label>
            <Slider
              min={0}
              max={200}
              step={5}
              value={[options.imageContrast || 100]}
              onValueChange={([value]) => updateOption("imageContrast", value)}
              data-testid="slider-contrast"
            />
            <p className="text-sm text-muted-foreground">
              100% is normal. Lower values reduce contrast, higher values increase it.
            </p>
          </div>
        </div>
      );
    }

    case "adjust-saturation": {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Saturation: {options.imageSaturation || 100}%</Label>
            <Slider
              min={0}
              max={200}
              step={5}
              value={[options.imageSaturation || 100]}
              onValueChange={([value]) => updateOption("imageSaturation", value)}
              data-testid="slider-saturation"
            />
            <p className="text-sm text-muted-foreground">
              100% is normal. 0% is grayscale, higher values intensify colors.
            </p>
          </div>
        </div>
      );
    }

    case "image-sharpen": {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Sharpen Amount: {options.imageSharpen || 1}</Label>
            <Slider
              min={0.5}
              max={10}
              step={0.5}
              value={[options.imageSharpen || 1]}
              onValueChange={([value]) => updateOption("imageSharpen", value)}
              data-testid="slider-sharpen"
            />
            <p className="text-sm text-muted-foreground">
              Higher values increase sharpening. Recommended: 1-3 for subtle enhancement.
            </p>
          </div>
        </div>
      );
    }

    case "image-blur": {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Blur Amount: {options.imageBlur || 1}</Label>
            <Slider
              min={0.5}
              max={20}
              step={0.5}
              value={[options.imageBlur || 1]}
              onValueChange={([value]) => updateOption("imageBlur", value)}
              data-testid="slider-blur"
            />
            <p className="text-sm text-muted-foreground">
              Higher values increase blur effect. 1-5 for subtle blur, 10+ for heavy blur.
            </p>
          </div>
        </div>
      );
    }


    case "grayscale-image":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Convert your image to grayscale. The image will be processed automatically when you click the process button.
            </p>
          </div>
        </div>
      );

    case "invert-image-colors":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Invert all colors in your image to create a negative effect. The image will be processed automatically.
            </p>
          </div>
        </div>
      );

    case "add-border-to-image":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Border Width: {options.borderWidth || 10}px</Label>
            <Slider
              min={1}
              max={100}
              step={1}
              value={[options.borderWidth || 10]}
              onValueChange={([value]) => updateOption("borderWidth", value)}
              data-testid="slider-border-width"
            />
          </div>
          <div className="space-y-2">
            <Label>Border Color</Label>
            <div className="flex items-center gap-2">
              <Input
                type="color"
                value={options.borderColor || "#000000"}
                onChange={(e) => updateOption("borderColor", e.target.value)}
                className="w-16 h-9 p-1"
                data-testid="input-border-color"
              />
              <Input
                type="text"
                value={options.borderColor || "#000000"}
                onChange={(e) => updateOption("borderColor", e.target.value)}
                className="flex-1"
                placeholder="#000000"
                data-testid="input-border-color-text"
              />
            </div>
          </div>
        </div>
      );

    case "round-image-corners":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Corner Radius: {options.cornerRadius || 20}px</Label>
            <Slider
              min={1}
              max={200}
              step={1}
              value={[options.cornerRadius || 20]}
              onValueChange={([value]) => updateOption("cornerRadius", value)}
              data-testid="slider-corner-radius"
            />
            <p className="text-sm text-muted-foreground">
              Adjust the radius to control how round the corners appear. Higher values create more circular corners.
            </p>
          </div>
        </div>
      );

    case "image-filter-sepia":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Sepia Intensity: {options.filterIntensity || 100}%</Label>
            <Slider
              min={10}
              max={100}
              step={10}
              value={[options.filterIntensity || 100]}
              onValueChange={([value]) => updateOption("filterIntensity", value)}
              data-testid="slider-sepia-intensity"
            />
            <p className="text-sm text-muted-foreground">
              Apply a warm sepia tone for a vintage photograph look.
            </p>
          </div>
        </div>
      );

    case "image-filter-vintage":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Vintage Intensity: {options.filterIntensity || 100}%</Label>
            <Slider
              min={10}
              max={100}
              step={10}
              value={[options.filterIntensity || 100]}
              onValueChange={([value]) => updateOption("filterIntensity", value)}
              data-testid="slider-vintage-intensity"
            />
            <p className="text-sm text-muted-foreground">
              Apply a nostalgic vintage filter with faded colors and warm tones.
            </p>
          </div>
        </div>
      );

    case "image-filter-bw":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Convert your image to high-contrast black and white for a dramatic artistic effect.
            </p>
          </div>
        </div>
      );

    case "meme-generator":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="meme-top-text">Top Text</Label>
            <Input
              id="meme-top-text"
              placeholder="ENTER TOP TEXT"
              value={options.memeTopText || ""}
              onChange={(e) => updateOption("memeTopText", e.target.value)}
              data-testid="input-meme-top-text"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="meme-bottom-text">Bottom Text</Label>
            <Input
              id="meme-bottom-text"
              placeholder="ENTER BOTTOM TEXT"
              value={options.memeBottomText || ""}
              onChange={(e) => updateOption("memeBottomText", e.target.value)}
              data-testid="input-meme-bottom-text"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Text will appear in classic meme style with white Impact font and black outline.
          </p>
        </div>
      );

    case "add-text-to-photo":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="text-overlay">Text</Label>
            <Input
              id="text-overlay"
              placeholder="Enter your text"
              value={options.textOverlay || ""}
              onChange={(e) => updateOption("textOverlay", e.target.value)}
              data-testid="input-text-overlay"
            />
          </div>
          <div className="space-y-2">
            <Label>Text Position</Label>
            <Select
              value={options.textPosition || "center"}
              onValueChange={(value) => updateOption("textPosition", value as any)}
            >
              <SelectTrigger data-testid="select-text-position">
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="top-left">Top Left</SelectItem>
                <SelectItem value="top-center">Top Center</SelectItem>
                <SelectItem value="top-right">Top Right</SelectItem>
                <SelectItem value="center-left">Center Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="center-right">Center Right</SelectItem>
                <SelectItem value="bottom-left">Bottom Left</SelectItem>
                <SelectItem value="bottom-center">Bottom Center</SelectItem>
                <SelectItem value="bottom-right">Bottom Right</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Font Size: {options.textFontSize || 32}px</Label>
            <Slider
              min={12}
              max={120}
              step={2}
              value={[options.textFontSize || 32]}
              onValueChange={([value]) => updateOption("textFontSize", value)}
              data-testid="slider-text-font-size"
            />
          </div>
          <div className="space-y-2">
            <Label>Text Color</Label>
            <div className="flex items-center gap-2">
              <Input
                type="color"
                value={options.textColor || "#ffffff"}
                onChange={(e) => updateOption("textColor", e.target.value)}
                className="w-16 h-9 p-1"
                data-testid="input-text-color"
              />
              <Input
                type="text"
                value={options.textColor || "#ffffff"}
                onChange={(e) => updateOption("textColor", e.target.value)}
                className="flex-1"
                placeholder="#ffffff"
                data-testid="input-text-color-text"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="text-shadow"
              checked={options.textShadow !== false}
              onCheckedChange={(checked) => updateOption("textShadow", checked as boolean)}
              data-testid="checkbox-text-shadow"
            />
            <Label htmlFor="text-shadow">Add text shadow for better visibility</Label>
          </div>
        </div>
      );

    case "split-image":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Rows: {options.splitRows || 2}</Label>
            <Slider
              min={1}
              max={10}
              step={1}
              value={[options.splitRows || 2]}
              onValueChange={([value]) => updateOption("splitRows", value)}
              data-testid="slider-split-rows"
            />
          </div>
          <div className="space-y-2">
            <Label>Columns: {options.splitCols || 2}</Label>
            <Slider
              min={1}
              max={10}
              step={1}
              value={[options.splitCols || 2]}
              onValueChange={([value]) => updateOption("splitCols", value)}
              data-testid="slider-split-cols"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Split your image into {(options.splitRows || 2) * (options.splitCols || 2)} pieces. 
            Perfect for Instagram grids or puzzle creation.
          </p>
        </div>
      );


    case "merge-images":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Layout</Label>
            <Select
              value={options.mergeLayout || "grid"}
              onValueChange={(value) => updateOption("mergeLayout", value as any)}
            >
              <SelectTrigger data-testid="select-merge-layout">
                <SelectValue placeholder="Select layout" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grid">Grid (Auto)</SelectItem>
                <SelectItem value="horizontal">Horizontal Row</SelectItem>
                <SelectItem value="vertical">Vertical Stack</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Spacing: {options.mergeSpacing || 0}px</Label>
            <Slider
              min={0}
              max={50}
              step={5}
              value={[options.mergeSpacing || 0]}
              onValueChange={([value]) => updateOption("mergeSpacing", value)}
              data-testid="slider-merge-spacing"
            />
          </div>
          <div className="space-y-2">
            <Label>Background Color</Label>
            <div className="flex items-center gap-2">
              <Input
                type="color"
                value={options.mergeBackground || "#ffffff"}
                onChange={(e) => updateOption("mergeBackground", e.target.value)}
                className="w-16 h-9 p-1"
                data-testid="input-merge-background"
              />
              <Input
                type="text"
                value={options.mergeBackground || "#ffffff"}
                onChange={(e) => updateOption("mergeBackground", e.target.value)}
                className="flex-1"
                placeholder="#ffffff"
                data-testid="input-merge-background-text"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Output Format</Label>
            <Select
              value={options.outputFormat || "png"}
              onValueChange={(value) => updateOption("outputFormat", value as any)}
            >
              <SelectTrigger data-testid="select-output-format">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="png">PNG</SelectItem>
                <SelectItem value="jpg">JPEG</SelectItem>
                <SelectItem value="webp">WebP</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );

    case "image-combiner-horizontal":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Spacing Between Images: {options.horizontalSpacing || 0}px</Label>
            <Slider
              min={0}
              max={50}
              step={5}
              value={[options.horizontalSpacing || 0]}
              onValueChange={([value]) => updateOption("horizontalSpacing", value)}
              data-testid="slider-horizontal-spacing"
            />
          </div>
          <div className="space-y-2">
            <Label>Vertical Alignment</Label>
            <Select
              value={options.verticalAlign || "center"}
              onValueChange={(value) => updateOption("verticalAlign", value as any)}
            >
              <SelectTrigger data-testid="select-vertical-align">
                <SelectValue placeholder="Select alignment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="top">Top</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="bottom">Bottom</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Background Color</Label>
            <div className="flex items-center gap-2">
              <Input
                type="color"
                value={options.combineBackground || "#ffffff"}
                onChange={(e) => updateOption("combineBackground", e.target.value)}
                className="w-16 h-9 p-1"
                data-testid="input-combine-background"
              />
              <Input
                type="text"
                value={options.combineBackground || "#ffffff"}
                onChange={(e) => updateOption("combineBackground", e.target.value)}
                className="flex-1"
                placeholder="#ffffff"
                data-testid="input-combine-background-text"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Output Format</Label>
            <Select
              value={options.outputFormat || "png"}
              onValueChange={(value) => updateOption("outputFormat", value as any)}
            >
              <SelectTrigger data-testid="select-output-format">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="png">PNG</SelectItem>
                <SelectItem value="jpg">JPEG</SelectItem>
                <SelectItem value="webp">WebP</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-muted-foreground">
            Images will be combined side by side from left to right. Heights will be matched automatically.
          </p>
        </div>
      );

    case "image-combiner-vertical":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Spacing Between Images: {options.verticalSpacing || 0}px</Label>
            <Slider
              min={0}
              max={50}
              step={5}
              value={[options.verticalSpacing || 0]}
              onValueChange={([value]) => updateOption("verticalSpacing", value)}
              data-testid="slider-vertical-spacing"
            />
          </div>
          <div className="space-y-2">
            <Label>Horizontal Alignment</Label>
            <Select
              value={options.horizontalAlign || "center"}
              onValueChange={(value) => updateOption("horizontalAlign", value as any)}
            >
              <SelectTrigger data-testid="select-horizontal-align">
                <SelectValue placeholder="Select alignment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Background Color</Label>
            <div className="flex items-center gap-2">
              <Input
                type="color"
                value={options.combineBackground || "#ffffff"}
                onChange={(e) => updateOption("combineBackground", e.target.value)}
                className="w-16 h-9 p-1"
                data-testid="input-combine-background"
              />
              <Input
                type="text"
                value={options.combineBackground || "#ffffff"}
                onChange={(e) => updateOption("combineBackground", e.target.value)}
                className="flex-1"
                placeholder="#ffffff"
                data-testid="input-combine-background-text"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Output Format</Label>
            <Select
              value={options.outputFormat || "png"}
              onValueChange={(value) => updateOption("outputFormat", value as any)}
            >
              <SelectTrigger data-testid="select-output-format">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="png">PNG</SelectItem>
                <SelectItem value="jpg">JPEG</SelectItem>
                <SelectItem value="webp">WebP</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-muted-foreground">
            Images will be stacked vertically from top to bottom. Widths will be matched automatically.
          </p>
        </div>
      );

    case "favicon-generator":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Favicon Sizes</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="size-16"
                  checked={options.favicon16 !== false}
                  onCheckedChange={(checked) => updateOption("favicon16", checked as boolean)}
                  data-testid="checkbox-favicon-16"
                />
                <Label htmlFor="size-16">16x16</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="size-32"
                  checked={options.favicon32 !== false}
                  onCheckedChange={(checked) => updateOption("favicon32", checked as boolean)}
                  data-testid="checkbox-favicon-32"
                />
                <Label htmlFor="size-32">32x32</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="size-48"
                  checked={options.favicon48 !== false}
                  onCheckedChange={(checked) => updateOption("favicon48", checked as boolean)}
                  data-testid="checkbox-favicon-48"
                />
                <Label htmlFor="size-48">48x48</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="size-64"
                  checked={options.favicon64 !== false}
                  onCheckedChange={(checked) => updateOption("favicon64", checked as boolean)}
                  data-testid="checkbox-favicon-64"
                />
                <Label htmlFor="size-64">64x64</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="size-128"
                  checked={options.favicon128 !== false}
                  onCheckedChange={(checked) => updateOption("favicon128", checked as boolean)}
                  data-testid="checkbox-favicon-128"
                />
                <Label htmlFor="size-128">128x128</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="size-256"
                  checked={options.favicon256 !== false}
                  onCheckedChange={(checked) => updateOption("favicon256", checked as boolean)}
                  data-testid="checkbox-favicon-256"
                />
                <Label htmlFor="size-256">256x256</Label>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="generate-ico"
              checked={options.generateIco !== false}
              onCheckedChange={(checked) => updateOption("generateIco", checked as boolean)}
              data-testid="checkbox-generate-ico"
            />
            <Label htmlFor="generate-ico">Generate ICO file (contains all sizes)</Label>
          </div>
          <p className="text-sm text-muted-foreground">
            Upload a square image (at least 256x256 recommended) to generate favicons in multiple sizes.
          </p>
        </div>
      );

    case "ico-to-png":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Extract Size</Label>
            <Select
              value={options.icoExtractSize || "all"}
              onValueChange={(value) => updateOption("icoExtractSize", value as any)}
            >
              <SelectTrigger data-testid="select-ico-extract-size">
                <SelectValue placeholder="Select size to extract" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sizes</SelectItem>
                <SelectItem value="largest">Largest Only</SelectItem>
                <SelectItem value="16">16x16</SelectItem>
                <SelectItem value="32">32x32</SelectItem>
                <SelectItem value="48">48x48</SelectItem>
                <SelectItem value="64">64x64</SelectItem>
                <SelectItem value="128">128x128</SelectItem>
                <SelectItem value="256">256x256</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-muted-foreground">
            ICO files can contain multiple image sizes. Choose which size(s) to extract as PNG.
          </p>
        </div>
      );

    case "png-to-ico":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Include Sizes in ICO</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ico-16"
                  checked={options.ico16 !== false}
                  onCheckedChange={(checked) => updateOption("ico16", checked as boolean)}
                  data-testid="checkbox-ico-16"
                />
                <Label htmlFor="ico-16">16x16</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ico-32"
                  checked={options.ico32 !== false}
                  onCheckedChange={(checked) => updateOption("ico32", checked as boolean)}
                  data-testid="checkbox-ico-32"
                />
                <Label htmlFor="ico-32">32x32</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ico-48"
                  checked={options.ico48 !== false}
                  onCheckedChange={(checked) => updateOption("ico48", checked as boolean)}
                  data-testid="checkbox-ico-48"
                />
                <Label htmlFor="ico-48">48x48</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ico-256"
                  checked={options.ico256 !== false}
                  onCheckedChange={(checked) => updateOption("ico256", checked as boolean)}
                  data-testid="checkbox-ico-256"
                />
                <Label htmlFor="ico-256">256x256</Label>
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Create a multi-resolution ICO file from your PNG image. Windows will automatically use the appropriate size.
          </p>
        </div>
      );

    case "apng-to-gif":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>GIF Quality</Label>
            <Select
              value={options.gifQuality || "high"}
              onValueChange={(value) => updateOption("gifQuality", value as any)}
            >
              <SelectTrigger data-testid="select-gif-quality">
                <SelectValue placeholder="Select quality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High Quality (larger file)</SelectItem>
                <SelectItem value="medium">Medium Quality</SelectItem>
                <SelectItem value="low">Low Quality (smaller file)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="preserve-transparency"
              checked={options.preserveTransparency !== false}
              onCheckedChange={(checked) => updateOption("preserveTransparency", checked as boolean)}
              data-testid="checkbox-preserve-transparency"
            />
            <Label htmlFor="preserve-transparency">Preserve transparency (if present)</Label>
          </div>
          <p className="text-sm text-muted-foreground">
            Convert animated PNG (APNG) to GIF format for universal compatibility. Note: GIF is limited to 256 colors.
          </p>
        </div>
      );

    case "gif-to-apng":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>APNG Optimization</Label>
            <Select
              value={options.apngOptimization || "balanced"}
              onValueChange={(value) => updateOption("apngOptimization", value as any)}
            >
              <SelectTrigger data-testid="select-apng-optimization">
                <SelectValue placeholder="Select optimization level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No optimization (fastest)</SelectItem>
                <SelectItem value="balanced">Balanced</SelectItem>
                <SelectItem value="maximum">Maximum compression (slowest)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-muted-foreground">
            Convert GIF to animated PNG (APNG) for better quality. APNG supports millions of colors and alpha transparency.
          </p>
        </div>
      );

    case "image-to-ascii":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Output Width: {options.asciiWidth || 100} characters</Label>
            <Slider
              min={40}
              max={200}
              step={10}
              value={[options.asciiWidth || 100]}
              onValueChange={([value]) => updateOption("asciiWidth", value)}
              data-testid="slider-ascii-width"
            />
          </div>
          <div className="space-y-2">
            <Label>Character Set</Label>
            <Select
              value={options.asciiCharset || "standard"}
              onValueChange={(value) => updateOption("asciiCharset", value as any)}
            >
              <SelectTrigger data-testid="select-ascii-charset">
                <SelectValue placeholder="Select character set" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard (@%#*+=-:. )</SelectItem>
                <SelectItem value="blocks">Block Characters</SelectItem>
                <SelectItem value="detailed">Detailed (more characters)</SelectItem>
                <SelectItem value="simple">Simple (fewer characters)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="invert-ascii"
              checked={options.asciiInvert === true}
              onCheckedChange={(checked) => updateOption("asciiInvert", checked as boolean)}
              data-testid="checkbox-invert-ascii"
            />
            <Label htmlFor="invert-ascii">Invert colors (for dark backgrounds)</Label>
          </div>
          <p className="text-sm text-muted-foreground">
            Convert your image to ASCII art using text characters. Perfect for terminals, README files, and retro aesthetics.
          </p>
        </div>
      );

    case "image-metadata-viewer":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Metadata Categories</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show-basic"
                  checked={options.showBasicInfo !== false}
                  onCheckedChange={(checked) => updateOption("showBasicInfo", checked as boolean)}
                  data-testid="checkbox-show-basic"
                />
                <Label htmlFor="show-basic">Basic Info (dimensions, format, size)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show-exif"
                  checked={options.showExif !== false}
                  onCheckedChange={(checked) => updateOption("showExif", checked as boolean)}
                  data-testid="checkbox-show-exif"
                />
                <Label htmlFor="show-exif">EXIF Data (camera, settings)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show-gps"
                  checked={options.showGps !== false}
                  onCheckedChange={(checked) => updateOption("showGps", checked as boolean)}
                  data-testid="checkbox-show-gps"
                />
                <Label htmlFor="show-gps">GPS Location (if available)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show-iptc"
                  checked={options.showIptc !== false}
                  onCheckedChange={(checked) => updateOption("showIptc", checked as boolean)}
                  data-testid="checkbox-show-iptc"
                />
                <Label htmlFor="show-iptc">IPTC Data (copyright, description)</Label>
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            View all metadata stored in your image file including camera settings, location, and editing history.
          </p>
        </div>
      );

    case "remove-image-metadata":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Metadata to Remove</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remove-exif"
                  checked={options.removeExif !== false}
                  onCheckedChange={(checked) => updateOption("removeExif", checked as boolean)}
                  data-testid="checkbox-remove-exif"
                />
                <Label htmlFor="remove-exif">EXIF Data (camera settings, date/time)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remove-gps"
                  checked={options.removeGps !== false}
                  onCheckedChange={(checked) => updateOption("removeGps", checked as boolean)}
                  data-testid="checkbox-remove-gps"
                />
                <Label htmlFor="remove-gps">GPS Location Data</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remove-icc"
                  checked={options.removeIcc === true}
                  onCheckedChange={(checked) => updateOption("removeIcc", checked as boolean)}
                  data-testid="checkbox-remove-icc"
                />
                <Label htmlFor="remove-icc">ICC Color Profile</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remove-iptc"
                  checked={options.removeIptc !== false}
                  onCheckedChange={(checked) => updateOption("removeIptc", checked as boolean)}
                  data-testid="checkbox-remove-iptc"
                />
                <Label htmlFor="remove-iptc">IPTC Data (copyright, description)</Label>
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Remove metadata from your images to protect your privacy. GPS location and camera info are commonly stripped for security.
          </p>
        </div>
      );

    case "image-color-corrector":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Brightness: {options.brightness || 0}%</Label>
            <Slider
              value={[options.brightness || 0]}
              onValueChange={([value]) => updateOption("brightness", value)}
              min={-100}
              max={100}
              step={1}
              data-testid="slider-brightness"
            />
          </div>
          <div className="space-y-2">
            <Label>Contrast: {options.contrast || 0}%</Label>
            <Slider
              value={[options.contrast || 0]}
              onValueChange={([value]) => updateOption("contrast", value)}
              min={-100}
              max={100}
              step={1}
              data-testid="slider-contrast"
            />
          </div>
          <div className="space-y-2">
            <Label>Saturation: {options.saturation || 0}%</Label>
            <Slider
              value={[options.saturation || 0]}
              onValueChange={([value]) => updateOption("saturation", value)}
              min={-100}
              max={100}
              step={1}
              data-testid="slider-saturation"
            />
          </div>
          <div className="space-y-2">
            <Label>Hue Rotation: {options.hue || 0}°</Label>
            <Slider
              value={[options.hue || 0]}
              onValueChange={([value]) => updateOption("hue", value)}
              min={-180}
              max={180}
              step={1}
              data-testid="slider-hue"
            />
          </div>
          <div className="space-y-2">
            <Label>Gamma: {options.gamma || 1}</Label>
            <Slider
              value={[options.gamma || 1]}
              onValueChange={([value]) => updateOption("gamma", value)}
              min={0.1}
              max={3}
              step={0.1}
              data-testid="slider-gamma"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="auto-color"
              checked={options.autoColor === true}
              onCheckedChange={(checked) => updateOption("autoColor", checked as boolean)}
              data-testid="checkbox-auto-color"
            />
            <Label htmlFor="auto-color">Auto-correct colors (normalize)</Label>
          </div>
          <p className="text-sm text-muted-foreground">
            Adjust brightness, contrast, saturation, and other color properties to enhance your image.
          </p>
        </div>
      );

    case "change-image-dpi":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Target DPI</Label>
            <Select
              value={String(options.dpi || 300)}
              onValueChange={(value) => updateOption("dpi", parseInt(value))}
            >
              <SelectTrigger data-testid="select-dpi">
                <SelectValue placeholder="Select DPI" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="72">72 DPI (Screen/Web)</SelectItem>
                <SelectItem value="96">96 DPI (Windows Display)</SelectItem>
                <SelectItem value="150">150 DPI (Medium Quality Print)</SelectItem>
                <SelectItem value="300">300 DPI (High Quality Print)</SelectItem>
                <SelectItem value="600">600 DPI (Professional Print)</SelectItem>
                <SelectItem value="custom">Custom DPI</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {options.dpi === "custom" && (
            <div className="space-y-2">
              <Label>Custom DPI Value</Label>
              <Input
                type="number"
                min={1}
                max={2400}
                value={options.customDpi || 300}
                onChange={(e) => updateOption("customDpi", parseInt(e.target.value))}
                data-testid="input-custom-dpi"
              />
            </div>
          )}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="resample"
              checked={options.resample === true}
              onCheckedChange={(checked) => updateOption("resample", checked as boolean)}
              data-testid="checkbox-resample"
            />
            <Label htmlFor="resample">Resample image (change pixel dimensions)</Label>
          </div>
          <p className="text-sm text-muted-foreground">
            Change the DPI (dots per inch) of your image. Higher DPI is better for printing, lower DPI for web use.
          </p>
        </div>
      );

    case "image-enlarger":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Scale Factor: {options.scaleFactor || 2}x</Label>
            <Slider
              value={[options.scaleFactor || 2]}
              onValueChange={([value]) => updateOption("scaleFactor", value)}
              min={1.5}
              max={4}
              step={0.5}
              data-testid="slider-scale-factor"
            />
          </div>
          <div className="space-y-2">
            <Label>Upscale Method</Label>
            <Select
              value={options.upscaleMethod || "lanczos"}
              onValueChange={(value) => updateOption("upscaleMethod", value)}
            >
              <SelectTrigger data-testid="select-upscale-method">
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lanczos">Lanczos (Best Quality)</SelectItem>
                <SelectItem value="cubic">Cubic (Smooth)</SelectItem>
                <SelectItem value="nearest">Nearest (Sharp Pixels)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="enhance-details"
              checked={options.enhanceDetails !== false}
              onCheckedChange={(checked) => updateOption("enhanceDetails", checked as boolean)}
              data-testid="checkbox-enhance-details"
            />
            <Label htmlFor="enhance-details">Enhance details after enlarging</Label>
          </div>
          <p className="text-sm text-muted-foreground">
            Enlarge your image while preserving quality. Best results with photos and artwork.
          </p>
        </div>
      );

    case "image-deblur":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Deblur Strength: {options.deblurStrength || 50}%</Label>
            <Slider
              value={[options.deblurStrength || 50]}
              onValueChange={([value]) => updateOption("deblurStrength", value)}
              min={0}
              max={100}
              step={5}
              data-testid="slider-deblur-strength"
            />
          </div>
          <div className="space-y-2">
            <Label>Deblur Type</Label>
            <Select
              value={options.deblurType || "auto"}
              onValueChange={(value) => updateOption("deblurType", value)}
            >
              <SelectTrigger data-testid="select-deblur-type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto Detect</SelectItem>
                <SelectItem value="motion">Motion Blur</SelectItem>
                <SelectItem value="focus">Out of Focus</SelectItem>
                <SelectItem value="gaussian">Gaussian Blur</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="reduce-noise"
              checked={options.reduceNoise !== false}
              onCheckedChange={(checked) => updateOption("reduceNoise", checked as boolean)}
              data-testid="checkbox-reduce-noise"
            />
            <Label htmlFor="reduce-noise">Reduce noise after deblurring</Label>
          </div>
          <p className="text-sm text-muted-foreground">
            Remove blur from images caused by motion or focus issues. Works best on slightly blurred photos.
          </p>
        </div>
      );

    case "ai-image-generator":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Generation Style</Label>
            <Select
              value={options.generationStyle || "abstract"}
              onValueChange={(value) => updateOption("generationStyle", value)}
            >
              <SelectTrigger data-testid="select-generation-style">
                <SelectValue placeholder="Select style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="abstract">Abstract Art</SelectItem>
                <SelectItem value="geometric">Geometric Patterns</SelectItem>
                <SelectItem value="fractal">Fractal Art</SelectItem>
                <SelectItem value="gradient">Gradient Mesh</SelectItem>
                <SelectItem value="noise">Perlin Noise</SelectItem>
                <SelectItem value="plasma">Plasma Effect</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Image Size</Label>
            <Select
              value={options.generationSize || "1024x1024"}
              onValueChange={(value) => updateOption("generationSize", value)}
            >
              <SelectTrigger data-testid="select-generation-size">
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="512x512">512 x 512</SelectItem>
                <SelectItem value="1024x1024">1024 x 1024</SelectItem>
                <SelectItem value="1920x1080">1920 x 1080 (HD)</SelectItem>
                <SelectItem value="1080x1920">1080 x 1920 (Portrait)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Color Scheme</Label>
            <Select
              value={options.colorScheme || "vibrant"}
              onValueChange={(value) => updateOption("colorScheme", value)}
            >
              <SelectTrigger data-testid="select-color-scheme">
                <SelectValue placeholder="Select colors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vibrant">Vibrant</SelectItem>
                <SelectItem value="pastel">Pastel</SelectItem>
                <SelectItem value="monochrome">Monochrome</SelectItem>
                <SelectItem value="earth">Earth Tones</SelectItem>
                <SelectItem value="neon">Neon</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-muted-foreground">
            Generate unique algorithmic art and patterns. No external API required - all generation is done locally.
          </p>
        </div>
      );

    case "ai-photo-retouch":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Retouch Preset</Label>
            <Select
              value={options.retouchPreset || "portrait"}
              onValueChange={(value) => updateOption("retouchPreset", value)}
            >
              <SelectTrigger data-testid="select-retouch-preset">
                <SelectValue placeholder="Select preset" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="portrait">Portrait Enhancement</SelectItem>
                <SelectItem value="landscape">Landscape Enhancement</SelectItem>
                <SelectItem value="product">Product Photo</SelectItem>
                <SelectItem value="food">Food Photography</SelectItem>
                <SelectItem value="night">Night Photo Fix</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Enhancement Strength: {options.retouchStrength || 50}%</Label>
            <Slider
              value={[options.retouchStrength || 50]}
              onValueChange={([value]) => updateOption("retouchStrength", value)}
              min={0}
              max={100}
              step={5}
              data-testid="slider-retouch-strength"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="auto-enhance"
              checked={options.autoEnhance !== false}
              onCheckedChange={(checked) => updateOption("autoEnhance", checked as boolean)}
              data-testid="checkbox-auto-enhance"
            />
            <Label htmlFor="auto-enhance">Auto-enhance colors and exposure</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="sharpen-output"
              checked={options.sharpenOutput !== false}
              onCheckedChange={(checked) => updateOption("sharpenOutput", checked as boolean)}
              data-testid="checkbox-sharpen-output"
            />
            <Label htmlFor="sharpen-output">Sharpen output</Label>
          </div>
          <p className="text-sm text-muted-foreground">
            Automatically enhance and retouch photos using algorithmic improvements for different photo types.
          </p>
        </div>
      );

    case "ai-object-remover":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Removal Method</Label>
            <Select
              value={options.removalMethod || "inpaint"}
              onValueChange={(value) => updateOption("removalMethod", value)}
            >
              <SelectTrigger data-testid="select-removal-method">
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inpaint">Content-Aware Fill</SelectItem>
                <SelectItem value="blur">Blur Region</SelectItem>
                <SelectItem value="pixelate">Pixelate Region</SelectItem>
                <SelectItem value="color">Solid Color Fill</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {options.removalMethod === "color" && (
            <div className="space-y-2">
              <Label>Fill Color</Label>
              <Input
                type="color"
                value={options.fillColor || "#ffffff"}
                onChange={(e) => updateOption("fillColor", e.target.value)}
                className="h-10 w-full"
                data-testid="input-fill-color"
              />
            </div>
          )}
          <div className="space-y-2">
            <Label>Edge Feathering: {options.featherRadius || 5}px</Label>
            <Slider
              value={[options.featherRadius || 5]}
              onValueChange={([value]) => updateOption("featherRadius", value)}
              min={0}
              max={50}
              step={1}
              data-testid="slider-feather-radius"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Remove objects by selecting regions and filling with surrounding content or effects.
          </p>
        </div>
      );

    case "ai-face-swapper":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Blend Mode</Label>
            <Select
              value={options.blendMode || "smooth"}
              onValueChange={(value) => updateOption("blendMode", value)}
            >
              <SelectTrigger data-testid="select-blend-mode">
                <SelectValue placeholder="Select blend mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="smooth">Smooth Blend</SelectItem>
                <SelectItem value="hard">Hard Edge</SelectItem>
                <SelectItem value="gradient">Gradient Blend</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Color Matching: {options.colorMatching || 50}%</Label>
            <Slider
              value={[options.colorMatching || 50]}
              onValueChange={([value]) => updateOption("colorMatching", value)}
              min={0}
              max={100}
              step={5}
              data-testid="slider-color-matching"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="auto-align"
              checked={options.autoAlign !== false}
              onCheckedChange={(checked) => updateOption("autoAlign", checked as boolean)}
              data-testid="checkbox-auto-align"
            />
            <Label htmlFor="auto-align">Auto-align faces</Label>
          </div>
          <p className="text-sm text-muted-foreground">
            Swap faces between two photos. Upload the source face and target image for best results.
          </p>
        </div>
      );

    case "image-to-sketch":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Sketch Style</Label>
            <Select
              value={options.sketchStyle || "pencil"}
              onValueChange={(value) => updateOption("sketchStyle", value)}
            >
              <SelectTrigger data-testid="select-sketch-style">
                <SelectValue placeholder="Select style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pencil">Pencil Sketch</SelectItem>
                <SelectItem value="charcoal">Charcoal Drawing</SelectItem>
                <SelectItem value="ink">Ink Outline</SelectItem>
                <SelectItem value="colored">Colored Pencil</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Line Intensity: {options.lineIntensity || 50}%</Label>
            <Slider
              value={[options.lineIntensity || 50]}
              onValueChange={([value]) => updateOption("lineIntensity", value)}
              min={0}
              max={100}
              step={5}
              data-testid="slider-line-intensity"
            />
          </div>
          <div className="space-y-2">
            <Label>Detail Level: {options.detailLevel || 50}%</Label>
            <Slider
              value={[options.detailLevel || 50]}
              onValueChange={([value]) => updateOption("detailLevel", value)}
              min={0}
              max={100}
              step={5}
              data-testid="slider-detail-level"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="invert-sketch"
              checked={options.invertSketch === true}
              onCheckedChange={(checked) => updateOption("invertSketch", checked as boolean)}
              data-testid="checkbox-invert-sketch"
            />
            <Label htmlFor="invert-sketch">Invert colors (white on black)</Label>
          </div>
          <p className="text-sm text-muted-foreground">
            Transform your photo into an artistic sketch using edge detection and artistic filters.
          </p>
        </div>
      );

    default:
      return null;
  }
}
