import { z } from "zod";

export const pdfToolTypes = [
  "merge",
  "split",
  "compress",
  "pdf-to-images",
  "images-to-pdf",
  "rotate",
  "delete-pages",
  "merge-alternately",
  "add-page-numbers",
  "watermark",
] as const;

export type PdfToolType = (typeof pdfToolTypes)[number];

export const pdfToolSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  icon: z.string(),
  type: z.enum(pdfToolTypes),
  color: z.string(),
});

export type PdfTool = z.infer<typeof pdfToolSchema>;

export const processRequestSchema = z.object({
  toolType: z.enum(pdfToolTypes),
  options: z.record(z.any()).optional(),
});

export type ProcessRequest = z.infer<typeof processRequestSchema>;

export const processResponseSchema = z.object({
  success: z.boolean(),
  filename: z.string().optional(),
  downloadUrl: z.string().optional(),
  error: z.string().optional(),
  pageCount: z.number().optional(),
});

export type ProcessResponse = z.infer<typeof processResponseSchema>;

export const uploadedFileSchema = z.object({
  id: z.string(),
  name: z.string(),
  size: z.number(),
  type: z.string(),
  file: z.any(),
});

export type UploadedFile = z.infer<typeof uploadedFileSchema>;

export const toolOptionsSchema = z.object({
  pages: z.string().optional(),
  rotation: z.enum(["90", "180", "270"]).optional(),
  compressionLevel: z.enum(["low", "medium", "high"]).optional(),
  imageFormat: z.enum(["jpg", "png"]).optional(),
  watermarkText: z.string().optional(),
  watermarkPosition: z.enum(["center", "top-left", "top-right", "bottom-left", "bottom-right"]).optional(),
  pageNumberPosition: z.enum(["bottom-center", "bottom-left", "bottom-right", "top-center", "top-left", "top-right"]).optional(),
});

export type ToolOptions = z.infer<typeof toolOptionsSchema>;

export const pdfTools: PdfTool[] = [
  {
    id: "merge",
    name: "Merge PDF",
    description: "Combine multiple PDF files into one document",
    icon: "Layers",
    type: "merge",
    color: "bg-red-500",
  },
  {
    id: "split",
    name: "Split PDF",
    description: "Extract pages or split into separate files",
    icon: "Scissors",
    type: "split",
    color: "bg-orange-500",
  },
  {
    id: "compress",
    name: "Compress PDF",
    description: "Reduce PDF file size while maintaining quality",
    icon: "Archive",
    type: "compress",
    color: "bg-amber-500",
  },
  {
    id: "pdf-to-images",
    name: "Extract Pages",
    description: "Extract each page as a separate PDF file",
    icon: "Image",
    type: "pdf-to-images",
    color: "bg-emerald-500",
  },
  {
    id: "images-to-pdf",
    name: "Images to PDF",
    description: "Convert multiple images into a single PDF",
    icon: "FileImage",
    type: "images-to-pdf",
    color: "bg-teal-500",
  },
  {
    id: "rotate",
    name: "Rotate PDF",
    description: "Rotate pages 90, 180, or 270 degrees",
    icon: "RotateCw",
    type: "rotate",
    color: "bg-sky-500",
  },
  {
    id: "delete-pages",
    name: "Delete Pages",
    description: "Remove specific pages from your PDF",
    icon: "Trash2",
    type: "delete-pages",
    color: "bg-indigo-500",
  },
  {
    id: "merge-alternately",
    name: "Merge Alternately",
    description: "Combine two PDFs by alternating pages",
    icon: "Shuffle",
    type: "merge-alternately",
    color: "bg-violet-500",
  },
  {
    id: "add-page-numbers",
    name: "Add Page Numbers",
    description: "Insert page numbers to your PDF document",
    icon: "Hash",
    type: "add-page-numbers",
    color: "bg-purple-500",
  },
  {
    id: "watermark",
    name: "Add Watermark",
    description: "Add text watermark to your PDF pages",
    icon: "Stamp",
    type: "watermark",
    color: "bg-pink-500",
  },
];
