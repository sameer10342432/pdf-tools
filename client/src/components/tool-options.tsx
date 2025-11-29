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

    default:
      return null;
  }
}
