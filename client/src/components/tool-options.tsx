import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
              onValueChange={(value) => updateOption("bookletBinding", value as "left" | "right" | "top")}
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
              onValueChange={(value) => updateOption("bookletPageSize", value as "a4" | "letter" | "a3" | "tabloid")}
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
              onValueChange={(value) => updateOption("impositionLayout", value as "2-up-saddle" | "4-up-perfect" | "step-repeat" | "cut-stack")}
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
              onValueChange={(value) => updateOption("impositionSheetSize", value as "a4" | "a3" | "letter" | "tabloid" | "custom")}
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
              value={options.gutterSize || ""}
              onChange={(e) => updateOption("gutterSize", parseInt(e.target.value) || undefined)}
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
              onValueChange={(value) => updateOption("gutterPosition", value as "left" | "right" | "both")}
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
              onValueChange={(value) => updateOption("colorChangeMode", value as "exact" | "similar" | "range")}
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
              onValueChange={(value) => updateOption("annotationTypesToRemove", value as "all" | "highlights" | "notes" | "drawings" | "stamps" | "links")}
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

    default:
      return null;
  }
}
