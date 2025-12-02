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

    default:
      return null;
  }
}
