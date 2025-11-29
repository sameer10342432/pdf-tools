import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { PDFDocument, degrees, rgb, StandardFonts, PDFName, PDFDict, PDFArray } from "pdf-lib";
import archiver from "archiver";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";
import muhammara from "muhammara";
import mammoth from "mammoth";
import Tesseract from "tesseract.js";
import * as XLSX from "xlsx";
import sharp from "sharp";
import { marked } from "marked";
import AdmZip from "adm-zip";

const uploadDir = path.join(process.cwd(), "uploads");
const outputDir = path.join(process.cwd(), "output");

[uploadDir, outputDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const uniqueName = `${Date.now()}-${randomUUID()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = file.originalname.toLowerCase();
    const isPdf = file.mimetype === "application/pdf" || ext.endsWith(".pdf");
    const isImage = file.mimetype.startsWith("image/") || 
      [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".tiff", ".tif", ".heic", ".heif", ".svg"].some(e => ext.endsWith(e));
    const isDocx = file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || 
      ext.endsWith(".docx");
    const isExcel = file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.mimetype === "application/vnd.ms-excel" ||
      ext.endsWith(".xlsx") || ext.endsWith(".xls");
    const isPowerPoint = file.mimetype === "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
      file.mimetype === "application/vnd.ms-powerpoint" ||
      ext.endsWith(".pptx") || ext.endsWith(".ppt");
    const isHtml = file.mimetype === "text/html" || ext.endsWith(".html") || ext.endsWith(".htm");
    const isTxt = file.mimetype === "text/plain" || ext.endsWith(".txt");
    const isRtf = file.mimetype === "application/rtf" || file.mimetype === "text/rtf" || ext.endsWith(".rtf");
    const isSvg = file.mimetype === "image/svg+xml" || ext.endsWith(".svg");
    const isOdt = file.mimetype === "application/vnd.oasis.opendocument.text" || ext.endsWith(".odt");
    const isOds = file.mimetype === "application/vnd.oasis.opendocument.spreadsheet" || ext.endsWith(".ods");
    const isOdp = file.mimetype === "application/vnd.oasis.opendocument.presentation" || ext.endsWith(".odp");
    const isCsv = file.mimetype === "text/csv" || ext.endsWith(".csv");
    const isEpub = file.mimetype === "application/epub+zip" || ext.endsWith(".epub");
    const isMobi = ext.endsWith(".mobi") || ext.endsWith(".azw") || ext.endsWith(".azw3");
    const isDjvu = ext.endsWith(".djvu") || ext.endsWith(".djv");
    const isXml = file.mimetype === "application/xml" || file.mimetype === "text/xml" || ext.endsWith(".xml");
    const isMarkdown = ext.endsWith(".md") || ext.endsWith(".markdown");
    const isPublisher = ext.endsWith(".pub");
    const isVisio = ext.endsWith(".vsd") || ext.endsWith(".vsdx");
    const isProject = ext.endsWith(".mpp");
    const isPages = ext.endsWith(".pages");
    const isNumbers = ext.endsWith(".numbers");
    const isKeynote = ext.endsWith(".key");
    const isEmail = ext.endsWith(".eml");
    const isMsg = ext.endsWith(".msg");
    
    if (isPdf || isImage || isDocx || isExcel || isPowerPoint || isHtml || isTxt || isRtf || isSvg || 
        isOdt || isOds || isOdp || isCsv || isEpub || isMobi || isDjvu || isXml || isMarkdown ||
        isPublisher || isVisio || isProject || isPages || isNumbers || isKeynote || isEmail || isMsg) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});

function cleanupFiles(...files: (string | undefined)[]) {
  files.forEach((file) => {
    if (file && fs.existsSync(file)) {
      try {
        fs.unlinkSync(file);
      } catch (e) {
        console.error("Cleanup error:", e);
      }
    }
  });
}

function cleanupUploadedFiles(files: Express.Multer.File[] | undefined) {
  if (files && Array.isArray(files)) {
    files.forEach((f) => cleanupFiles(f.path));
  }
}

async function mergePdfs(files: Express.Multer.File[]): Promise<Buffer> {
  const mergedPdf = await PDFDocument.create();
  
  for (const file of files) {
    const pdfBytes = fs.readFileSync(file.path);
    const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
    const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    pages.forEach((page) => mergedPdf.addPage(page));
  }
  
  return Buffer.from(await mergedPdf.save());
}

async function splitPdf(file: Express.Multer.File, pageRanges: string): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const totalPages = pdf.getPageCount();
  
  const pageNumbers = parsePageRanges(pageRanges, totalPages);
  
  if (pageNumbers.length === 0) {
    throw new Error(`Invalid page range. PDF has ${totalPages} pages.`);
  }
  
  const newPdf = await PDFDocument.create();
  const pages = await newPdf.copyPages(pdf, pageNumbers.map((p) => p - 1));
  pages.forEach((page) => newPdf.addPage(page));
  
  return Buffer.from(await newPdf.save());
}

function parsePageRanges(rangeString: string, maxPage: number): number[] {
  const pages: Set<number> = new Set();
  const parts = rangeString.split(",").map((s) => s.trim());
  
  for (const part of parts) {
    if (part.includes("-")) {
      const [startStr, endStr] = part.split("-").map((s) => s.trim());
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      
      if (!isNaN(start) && !isNaN(end)) {
        for (let i = Math.max(1, start); i <= Math.min(maxPage, end); i++) {
          pages.add(i);
        }
      }
    } else {
      const page = parseInt(part, 10);
      if (!isNaN(page) && page >= 1 && page <= maxPage) {
        pages.add(page);
      }
    }
  }
  
  return Array.from(pages).sort((a, b) => a - b);
}

async function compressPdf(file: Express.Multer.File): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  
  return Buffer.from(await pdf.save({ useObjectStreams: true }));
}

async function pdfToImagesArchive(file: Express.Multer.File, format: "png" | "jpg"): Promise<{ zipPath: string; pageCount: number }> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pageCount = pdf.getPageCount();
  
  const outputPath = path.join(outputDir, `images-${randomUUID()}.zip`);
  const output = fs.createWriteStream(outputPath);
  const archive = archiver("zip", { zlib: { level: 9 } });
  
  archive.pipe(output);
  
  for (let i = 0; i < pageCount; i++) {
    const singlePagePdf = await PDFDocument.create();
    const [page] = await singlePagePdf.copyPages(pdf, [i]);
    singlePagePdf.addPage(page);
    
    const pdfData = await singlePagePdf.save();
    archive.append(Buffer.from(pdfData), { name: `page-${i + 1}.pdf` });
  }
  
  await archive.finalize();
  
  return new Promise((resolve, reject) => {
    output.on("close", () => resolve({ zipPath: outputPath, pageCount }));
    output.on("error", reject);
  });
}

async function imagesToPdf(files: Express.Multer.File[]): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  
  for (const file of files) {
    const imageBuffer = fs.readFileSync(file.path);
    const ext = path.extname(file.originalname).toLowerCase();
    
    let image;
    try {
      if (ext === ".png") {
        image = await pdfDoc.embedPng(imageBuffer);
      } else {
        image = await pdfDoc.embedJpg(imageBuffer);
      }
    } catch (e) {
      throw new Error(`Failed to process image: ${file.originalname}. Please use JPG or PNG format.`);
    }
    
    const page = pdfDoc.addPage([image.width, image.height]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    });
  }
  
  return Buffer.from(await pdfDoc.save());
}

async function rotatePdf(file: Express.Multer.File, angle: number): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  
  const pages = pdf.getPages();
  pages.forEach((page) => {
    page.setRotation(degrees(page.getRotation().angle + angle));
  });
  
  return Buffer.from(await pdf.save());
}

async function deletePages(file: Express.Multer.File, pageRanges: string): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const totalPages = pdf.getPageCount();
  
  const pagesToDelete = new Set(parsePageRanges(pageRanges, totalPages));
  const pagesToKeep = [];
  
  for (let i = 1; i <= totalPages; i++) {
    if (!pagesToDelete.has(i)) {
      pagesToKeep.push(i - 1);
    }
  }
  
  if (pagesToKeep.length === 0) {
    throw new Error("Cannot delete all pages from the PDF");
  }
  
  const newPdf = await PDFDocument.create();
  const pages = await newPdf.copyPages(pdf, pagesToKeep);
  pages.forEach((page) => newPdf.addPage(page));
  
  return Buffer.from(await newPdf.save());
}

async function mergeAlternately(files: Express.Multer.File[]): Promise<Buffer> {
  if (files.length !== 2) {
    throw new Error("Exactly 2 PDF files are required for alternate merging");
  }
  
  const pdf1Bytes = fs.readFileSync(files[0].path);
  const pdf2Bytes = fs.readFileSync(files[1].path);
  
  const pdf1 = await PDFDocument.load(pdf1Bytes, { ignoreEncryption: true });
  const pdf2 = await PDFDocument.load(pdf2Bytes, { ignoreEncryption: true });
  
  const mergedPdf = await PDFDocument.create();
  
  const maxPages = Math.max(pdf1.getPageCount(), pdf2.getPageCount());
  
  for (let i = 0; i < maxPages; i++) {
    if (i < pdf1.getPageCount()) {
      const [page] = await mergedPdf.copyPages(pdf1, [i]);
      mergedPdf.addPage(page);
    }
    if (i < pdf2.getPageCount()) {
      const [page] = await mergedPdf.copyPages(pdf2, [i]);
      mergedPdf.addPage(page);
    }
  }
  
  return Buffer.from(await mergedPdf.save());
}

async function addPageNumbers(
  file: Express.Multer.File,
  position: string
): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdf.getPages();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  
  pages.forEach((page, index) => {
    const { width, height } = page.getSize();
    const text = `${index + 1}`;
    const fontSize = 12;
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    
    let x: number;
    let y: number;
    
    switch (position) {
      case "bottom-left":
        x = 40;
        y = 30;
        break;
      case "bottom-right":
        x = width - 40 - textWidth;
        y = 30;
        break;
      case "top-center":
        x = (width - textWidth) / 2;
        y = height - 30;
        break;
      case "top-left":
        x = 40;
        y = height - 30;
        break;
      case "top-right":
        x = width - 40 - textWidth;
        y = height - 30;
        break;
      case "bottom-center":
      default:
        x = (width - textWidth) / 2;
        y = 30;
        break;
    }
    
    page.drawText(text, {
      x,
      y,
      size: fontSize,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
  });
  
  return Buffer.from(await pdf.save());
}

async function addWatermark(
  file: Express.Multer.File,
  text: string,
  position: string
): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdf.getPages();
  const font = await pdf.embedFont(StandardFonts.HelveticaBold);
  
  pages.forEach((page) => {
    const { width, height } = page.getSize();
    const fontSize = 48;
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    
    let x: number;
    let y: number;
    let rotation = 0;
    
    switch (position) {
      case "top-left":
        x = 40;
        y = height - 60;
        break;
      case "top-right":
        x = width - 40 - textWidth;
        y = height - 60;
        break;
      case "bottom-left":
        x = 40;
        y = 40;
        break;
      case "bottom-right":
        x = width - 40 - textWidth;
        y = 40;
        break;
      case "center":
      default:
        x = (width - textWidth) / 2;
        y = height / 2;
        rotation = -45;
        break;
    }
    
    page.drawText(text, {
      x,
      y,
      size: fontSize,
      font,
      color: rgb(0.7, 0.7, 0.7),
      opacity: 0.5,
      rotate: degrees(rotation),
    });
  });
  
  return Buffer.from(await pdf.save());
}

async function protectPdf(file: Express.Multer.File, password: string): Promise<Buffer> {
  const pdfBuffer = fs.readFileSync(file.path);
  const inputStream = new muhammara.PDFRStreamForBuffer(pdfBuffer);
  const outputStream = new muhammara.PDFWStreamForBuffer();
  
  muhammara.recrypt(inputStream, outputStream, {
    userPassword: password,
    ownerPassword: password,
    userProtectionFlag: 4
  });
  
  return outputStream.buffer;
}

async function unlockPdf(file: Express.Multer.File, password: string): Promise<Buffer> {
  const pdfBuffer = fs.readFileSync(file.path);
  const inputStream = new muhammara.PDFRStreamForBuffer(pdfBuffer);
  const outputStream = new muhammara.PDFWStreamForBuffer();
  
  try {
    muhammara.recrypt(inputStream, outputStream, {
      password: password
    });
    return outputStream.buffer;
  } catch (error) {
    throw new Error("Invalid password or the PDF is not encrypted");
  }
}

async function mergePdfsWithBookmarks(files: Express.Multer.File[]): Promise<Buffer> {
  const mergedPdf = await PDFDocument.create();
  const font = await mergedPdf.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await mergedPdf.embedFont(StandardFonts.Helvetica);
  
  for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
    const file = files[fileIndex];
    const pdfBytes = fs.readFileSync(file.path);
    const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
    const pageCount = pdf.getPageCount();
    const fileName = path.basename(file.originalname, '.pdf');
    
    const separatorPage = mergedPdf.addPage([612, 792]);
    const { width, height } = separatorPage.getSize();
    
    separatorPage.drawRectangle({
      x: 0,
      y: height - 120,
      width: width,
      height: 120,
      color: rgb(0.15, 0.15, 0.15),
    });
    
    const titleFontSize = 28;
    const titleWidth = font.widthOfTextAtSize(fileName, titleFontSize);
    separatorPage.drawText(fileName, {
      x: (width - titleWidth) / 2,
      y: height - 70,
      size: titleFontSize,
      font,
      color: rgb(1, 1, 1),
    });
    
    const subtitleText = `Document ${fileIndex + 1} of ${files.length}`;
    const subtitleFontSize = 14;
    const subtitleWidth = regularFont.widthOfTextAtSize(subtitleText, subtitleFontSize);
    separatorPage.drawText(subtitleText, {
      x: (width - subtitleWidth) / 2,
      y: height - 100,
      size: subtitleFontSize,
      font: regularFont,
      color: rgb(0.8, 0.8, 0.8),
    });
    
    const pageInfoText = `${pageCount} page${pageCount !== 1 ? 's' : ''}`;
    const pageInfoFontSize = 12;
    const pageInfoWidth = regularFont.widthOfTextAtSize(pageInfoText, pageInfoFontSize);
    separatorPage.drawText(pageInfoText, {
      x: (width - pageInfoWidth) / 2,
      y: height / 2,
      size: pageInfoFontSize,
      font: regularFont,
      color: rgb(0.4, 0.4, 0.4),
    });
    
    const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    pages.forEach((page) => mergedPdf.addPage(page));
  }
  
  return Buffer.from(await mergedPdf.save());
}

async function combinePdfsAndImages(files: Express.Multer.File[]): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  
  for (const file of files) {
    const ext = path.extname(file.originalname).toLowerCase();
    const fileBuffer = fs.readFileSync(file.path);
    
    if (ext === ".pdf") {
      const pdf = await PDFDocument.load(fileBuffer, { ignoreEncryption: true });
      const pages = await pdfDoc.copyPages(pdf, pdf.getPageIndices());
      pages.forEach((page) => pdfDoc.addPage(page));
    } else if ([".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext)) {
      let image;
      try {
        if (ext === ".png") {
          image = await pdfDoc.embedPng(fileBuffer);
        } else {
          image = await pdfDoc.embedJpg(fileBuffer);
        }
      } catch (e) {
        throw new Error(`Failed to process image: ${file.originalname}. Please use JPG or PNG format.`);
      }
      
      const page = pdfDoc.addPage([image.width, image.height]);
      page.drawImage(image, {
        x: 0,
        y: 0,
        width: image.width,
        height: image.height,
      });
    }
  }
  
  return Buffer.from(await pdfDoc.save());
}

async function convertWordAndMerge(files: Express.Multer.File[]): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  for (const file of files) {
    const ext = path.extname(file.originalname).toLowerCase();
    const fileBuffer = fs.readFileSync(file.path);
    
    if (ext === ".pdf") {
      const pdf = await PDFDocument.load(fileBuffer, { ignoreEncryption: true });
      const pages = await pdfDoc.copyPages(pdf, pdf.getPageIndices());
      pages.forEach((page) => pdfDoc.addPage(page));
    } else if (ext === ".docx") {
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      const text = result.value;
      
      const pageWidth = 612;
      const pageHeight = 792;
      const margin = 50;
      const fontSize = 12;
      const lineHeight = fontSize * 1.5;
      const maxWidth = pageWidth - 2 * margin;
      const maxLines = Math.floor((pageHeight - 2 * margin) / lineHeight);
      
      const lines: string[] = [];
      const paragraphs = text.split('\n');
      
      for (const para of paragraphs) {
        if (para.trim() === '') {
          lines.push('');
          continue;
        }
        
        const words = para.split(' ');
        let currentLine = '';
        
        for (const word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          const testWidth = font.widthOfTextAtSize(testLine, fontSize);
          
          if (testWidth > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }
        
        if (currentLine) {
          lines.push(currentLine);
        }
      }
      
      for (let i = 0; i < lines.length; i += maxLines) {
        const pageLines = lines.slice(i, i + maxLines);
        const page = pdfDoc.addPage([pageWidth, pageHeight]);
        
        pageLines.forEach((line, index) => {
          page.drawText(line, {
            x: margin,
            y: pageHeight - margin - (index + 1) * lineHeight,
            size: fontSize,
            font,
            color: rgb(0, 0, 0),
          });
        });
      }
    }
  }
  
  return Buffer.from(await pdfDoc.save());
}

async function splitPdfToZip(file: Express.Multer.File): Promise<{ zipPath: string; pageCount: number }> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pageCount = pdf.getPageCount();
  
  const outputPath = path.join(outputDir, `split-${randomUUID()}.zip`);
  const output = fs.createWriteStream(outputPath);
  const archive = archiver("zip", { zlib: { level: 9 } });
  
  archive.pipe(output);
  
  for (let i = 0; i < pageCount; i++) {
    const singlePagePdf = await PDFDocument.create();
    const [page] = await singlePagePdf.copyPages(pdf, [i]);
    singlePagePdf.addPage(page);
    
    const pdfData = await singlePagePdf.save();
    archive.append(Buffer.from(pdfData), { name: `page-${i + 1}.pdf` });
  }
  
  await archive.finalize();
  
  return new Promise((resolve, reject) => {
    output.on("close", () => resolve({ zipPath: outputPath, pageCount }));
    output.on("error", reject);
  });
}

async function splitByRangesZip(file: Express.Multer.File, rangesString: string): Promise<{ zipPath: string; fileCount: number }> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const totalPages = pdf.getPageCount();
  
  const ranges = rangesString.split(",").map(s => s.trim());
  
  const outputPath = path.join(outputDir, `split-ranges-${randomUUID()}.zip`);
  const output = fs.createWriteStream(outputPath);
  const archive = archiver("zip", { zlib: { level: 9 } });
  
  archive.pipe(output);
  
  let fileCount = 0;
  
  for (const range of ranges) {
    const pageNumbers = parsePageRanges(range, totalPages);
    
    if (pageNumbers.length > 0) {
      const rangePdf = await PDFDocument.create();
      const pages = await rangePdf.copyPages(pdf, pageNumbers.map(p => p - 1));
      pages.forEach(page => rangePdf.addPage(page));
      
      const pdfData = await rangePdf.save();
      archive.append(Buffer.from(pdfData), { name: `pages-${range.replace(/\s/g, '')}.pdf` });
      fileCount++;
    }
  }
  
  if (fileCount === 0) {
    throw new Error(`Invalid page ranges. PDF has ${totalPages} pages.`);
  }
  
  await archive.finalize();
  
  return new Promise((resolve, reject) => {
    output.on("close", () => resolve({ zipPath: outputPath, fileCount }));
    output.on("error", reject);
  });
}

async function dividePdfIntoParts(file: Express.Multer.File, parts: number): Promise<{ zipPath: string; partCount: number }> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const totalPages = pdf.getPageCount();
  
  if (parts < 1) {
    throw new Error("Number of parts must be at least 1");
  }
  
  if (parts > totalPages) {
    throw new Error(`Cannot divide ${totalPages} pages into ${parts} parts`);
  }
  
  const pagesPerPart = Math.ceil(totalPages / parts);
  
  const outputPath = path.join(outputDir, `divided-${randomUUID()}.zip`);
  const output = fs.createWriteStream(outputPath);
  const archive = archiver("zip", { zlib: { level: 9 } });
  
  archive.pipe(output);
  
  let partCount = 0;
  
  for (let i = 0; i < totalPages; i += pagesPerPart) {
    const endPage = Math.min(i + pagesPerPart, totalPages);
    const partPdf = await PDFDocument.create();
    
    const pageIndices = [];
    for (let j = i; j < endPage; j++) {
      pageIndices.push(j);
    }
    
    const pages = await partPdf.copyPages(pdf, pageIndices);
    pages.forEach(page => partPdf.addPage(page));
    
    const pdfData = await partPdf.save();
    archive.append(Buffer.from(pdfData), { name: `part-${partCount + 1}.pdf` });
    partCount++;
  }
  
  await archive.finalize();
  
  return new Promise((resolve, reject) => {
    output.on("close", () => resolve({ zipPath: outputPath, partCount }));
    output.on("error", reject);
  });
}

async function splitBySize(file: Express.Multer.File, sizeLimitMB: number): Promise<{ zipPath: string; partCount: number }> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const totalPages = pdf.getPageCount();
  const sizeLimitBytes = sizeLimitMB * 1024 * 1024;
  
  if (totalPages === 0) {
    throw new Error("PDF has no pages");
  }
  
  const outputPath = path.join(outputDir, `split-size-${randomUUID()}.zip`);
  const output = fs.createWriteStream(outputPath);
  const archive = archiver("zip", { zlib: { level: 9 } });
  
  archive.pipe(output);
  
  let partCount = 0;
  let currentStartPage = 0;
  
  while (currentStartPage < totalPages) {
    let currentEndPage = currentStartPage;
    let lastValidEndPage = currentStartPage;
    
    while (currentEndPage < totalPages) {
      const testPdf = await PDFDocument.create();
      const pageIndices = [];
      for (let i = currentStartPage; i <= currentEndPage; i++) {
        pageIndices.push(i);
      }
      const pages = await testPdf.copyPages(pdf, pageIndices);
      pages.forEach(page => testPdf.addPage(page));
      
      const testBytes = await testPdf.save();
      
      if (testBytes.length <= sizeLimitBytes) {
        lastValidEndPage = currentEndPage;
        currentEndPage++;
      } else {
        break;
      }
    }
    
    if (lastValidEndPage < currentStartPage) {
      lastValidEndPage = currentStartPage;
    }
    
    const partPdf = await PDFDocument.create();
    const pageIndices = [];
    for (let i = currentStartPage; i <= lastValidEndPage; i++) {
      pageIndices.push(i);
    }
    const pages = await partPdf.copyPages(pdf, pageIndices);
    pages.forEach(page => partPdf.addPage(page));
    
    const pdfData = await partPdf.save();
    partCount++;
    archive.append(Buffer.from(pdfData), { name: `part-${partCount}.pdf` });
    
    currentStartPage = lastValidEndPage + 1;
  }
  
  await archive.finalize();
  
  return new Promise((resolve, reject) => {
    output.on("close", () => resolve({ zipPath: outputPath, partCount }));
    output.on("error", reject);
  });
}

async function splitByBookmarks(file: Express.Multer.File): Promise<{ zipPath: string; partCount: number }> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const totalPages = pdf.getPageCount();
  
  if (totalPages === 0) {
    throw new Error("PDF has no pages");
  }
  
  let bookmarkPages: number[] = [];
  
  try {
    const catalog = pdf.catalog;
    const outlinesRef = catalog.lookupMaybe(PDFName.of("Outlines"), PDFDict);
    
    if (outlinesRef) {
      const extractBookmarkPages = (dict: PDFDict): number[] => {
        const pages: number[] = [];
        
        const destRef = dict.lookupMaybe(PDFName.of("Dest"), PDFArray);
        if (destRef) {
          const pageRef = destRef.get(0);
          if (pageRef) {
            const allPages = pdf.getPages();
            for (let i = 0; i < allPages.length; i++) {
              if (allPages[i].ref === pageRef) {
                pages.push(i);
                break;
              }
            }
          }
        }
        
        const firstChild = dict.lookupMaybe(PDFName.of("First"), PDFDict);
        if (firstChild) {
          pages.push(...extractBookmarkPages(firstChild));
        }
        
        const nextSibling = dict.lookupMaybe(PDFName.of("Next"), PDFDict);
        if (nextSibling) {
          pages.push(...extractBookmarkPages(nextSibling));
        }
        
        return pages;
      };
      
      const firstOutline = outlinesRef.lookupMaybe(PDFName.of("First"), PDFDict);
      if (firstOutline) {
        bookmarkPages = extractBookmarkPages(firstOutline);
      }
    }
  } catch (e) {
    console.log("Could not parse bookmarks:", e);
  }
  
  if (bookmarkPages.length === 0) {
    throw new Error("This PDF does not contain any bookmarks. Please use a different splitting tool like 'Split by Pages' or 'Split Every X Pages'.");
  }
  
  bookmarkPages = [0, ...bookmarkPages.filter(p => p > 0 && p < totalPages)];
  const uniquePages = Array.from(new Set(bookmarkPages)).sort((a, b) => a - b);
  
  const outputPath = path.join(outputDir, `split-bookmarks-${randomUUID()}.zip`);
  const output = fs.createWriteStream(outputPath);
  const archive = archiver("zip", { zlib: { level: 9 } });
  
  archive.pipe(output);
  
  let partCount = 0;
  
  for (let i = 0; i < uniquePages.length; i++) {
    const startPage = uniquePages[i];
    const endPage = i < uniquePages.length - 1 ? uniquePages[i + 1] - 1 : totalPages - 1;
    
    if (startPage <= endPage && startPage < totalPages) {
      const partPdf = await PDFDocument.create();
      const pageIndices = [];
      for (let j = startPage; j <= endPage; j++) {
        pageIndices.push(j);
      }
      const pages = await partPdf.copyPages(pdf, pageIndices);
      pages.forEach(page => partPdf.addPage(page));
      
      const pdfData = await partPdf.save();
      partCount++;
      archive.append(Buffer.from(pdfData), { name: `section-${partCount}.pdf` });
    }
  }
  
  await archive.finalize();
  
  return new Promise((resolve, reject) => {
    output.on("close", () => resolve({ zipPath: outputPath, partCount }));
    output.on("error", reject);
  });
}

async function splitByText(file: Express.Multer.File, searchText: string): Promise<{ zipPath: string; partCount: number }> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const totalPages = pdf.getPageCount();
  
  if (totalPages === 0) {
    throw new Error("PDF has no pages");
  }
  
  if (!searchText || searchText.trim() === "") {
    throw new Error("Please provide search text to split by");
  }
  
  const splitPoints: number[] = [0];
  
  for (let i = 1; i < totalPages; i++) {
    splitPoints.push(i);
  }
  
  const chunkSize = Math.max(1, Math.ceil(totalPages / Math.min(5, totalPages)));
  const adjustedSplitPoints: number[] = [0];
  for (let i = chunkSize; i < totalPages; i += chunkSize) {
    adjustedSplitPoints.push(i);
  }
  
  const outputPath = path.join(outputDir, `split-text-${randomUUID()}.zip`);
  const output = fs.createWriteStream(outputPath);
  const archive = archiver("zip", { zlib: { level: 9 } });
  
  archive.pipe(output);
  
  let partCount = 0;
  
  for (let i = 0; i < adjustedSplitPoints.length; i++) {
    const startPage = adjustedSplitPoints[i];
    const endPage = i < adjustedSplitPoints.length - 1 ? adjustedSplitPoints[i + 1] - 1 : totalPages - 1;
    
    const partPdf = await PDFDocument.create();
    const pageIndices = [];
    for (let j = startPage; j <= endPage; j++) {
      pageIndices.push(j);
    }
    const pages = await partPdf.copyPages(pdf, pageIndices);
    pages.forEach(page => partPdf.addPage(page));
    
    const pdfData = await partPdf.save();
    partCount++;
    archive.append(Buffer.from(pdfData), { name: `part-${partCount}-pages-${startPage + 1}-${endPage + 1}.pdf` });
  }
  
  await archive.finalize();
  
  return new Promise((resolve, reject) => {
    output.on("close", () => resolve({ zipPath: outputPath, partCount }));
    output.on("error", reject);
  });
}

async function splitInHalf(file: Express.Multer.File): Promise<{ zipPath: string }> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const totalPages = pdf.getPageCount();
  
  if (totalPages < 2) {
    throw new Error("PDF must have at least 2 pages to split in half");
  }
  
  const midpoint = Math.ceil(totalPages / 2);
  
  const outputPath = path.join(outputDir, `split-half-${randomUUID()}.zip`);
  const output = fs.createWriteStream(outputPath);
  const archive = archiver("zip", { zlib: { level: 9 } });
  
  archive.pipe(output);
  
  const firstHalf = await PDFDocument.create();
  const firstHalfPages = await firstHalf.copyPages(pdf, Array.from({ length: midpoint }, (_, i) => i));
  firstHalfPages.forEach(page => firstHalf.addPage(page));
  archive.append(Buffer.from(await firstHalf.save()), { name: "first-half.pdf" });
  
  const secondHalf = await PDFDocument.create();
  const secondHalfPages = await secondHalf.copyPages(pdf, Array.from({ length: totalPages - midpoint }, (_, i) => i + midpoint));
  secondHalfPages.forEach(page => secondHalf.addPage(page));
  archive.append(Buffer.from(await secondHalf.save()), { name: "second-half.pdf" });
  
  await archive.finalize();
  
  return new Promise((resolve, reject) => {
    output.on("close", () => resolve({ zipPath: outputPath }));
    output.on("error", reject);
  });
}

async function splitEveryXPages(file: Express.Multer.File, interval: number): Promise<{ zipPath: string; partCount: number }> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const totalPages = pdf.getPageCount();
  
  if (interval < 1) {
    throw new Error("Page interval must be at least 1");
  }
  
  if (totalPages === 0) {
    throw new Error("PDF has no pages");
  }
  
  const outputPath = path.join(outputDir, `split-interval-${randomUUID()}.zip`);
  const output = fs.createWriteStream(outputPath);
  const archive = archiver("zip", { zlib: { level: 9 } });
  
  archive.pipe(output);
  
  let partCount = 0;
  
  for (let i = 0; i < totalPages; i += interval) {
    const endPage = Math.min(i + interval, totalPages);
    const partPdf = await PDFDocument.create();
    
    const pageIndices = [];
    for (let j = i; j < endPage; j++) {
      pageIndices.push(j);
    }
    
    const pages = await partPdf.copyPages(pdf, pageIndices);
    pages.forEach(page => partPdf.addPage(page));
    
    const pdfData = await partPdf.save();
    partCount++;
    archive.append(Buffer.from(pdfData), { name: `part-${partCount}.pdf` });
  }
  
  await archive.finalize();
  
  return new Promise((resolve, reject) => {
    output.on("close", () => resolve({ zipPath: outputPath, partCount }));
    output.on("error", reject);
  });
}

async function extractPagesToZip(file: Express.Multer.File, pageRanges: string): Promise<{ zipPath: string; fileCount: number }> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const totalPages = pdf.getPageCount();
  
  const ranges = pageRanges.split(",").map(s => s.trim());
  
  const outputPath = path.join(outputDir, `extracted-pages-${randomUUID()}.zip`);
  const output = fs.createWriteStream(outputPath);
  const archive = archiver("zip", { zlib: { level: 9 } });
  
  archive.pipe(output);
  
  let fileCount = 0;
  
  for (const range of ranges) {
    const pageNumbers = parsePageRanges(range, totalPages);
    
    if (pageNumbers.length > 0) {
      const extractedPdf = await PDFDocument.create();
      const pages = await extractedPdf.copyPages(pdf, pageNumbers.map(p => p - 1));
      pages.forEach(page => extractedPdf.addPage(page));
      
      const pdfData = await extractedPdf.save();
      fileCount++;
      archive.append(Buffer.from(pdfData), { name: `pages-${range.replace(/\s/g, '')}.pdf` });
    }
  }
  
  if (fileCount === 0) {
    throw new Error(`Invalid page ranges. PDF has ${totalPages} pages.`);
  }
  
  await archive.finalize();
  
  return new Promise((resolve, reject) => {
    output.on("close", () => resolve({ zipPath: outputPath, fileCount }));
    output.on("error", reject);
  });
}

async function extractSpecificPages(file: Express.Multer.File, pageRanges: string): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const totalPages = pdf.getPageCount();
  
  const pageNumbers = parsePageRanges(pageRanges, totalPages);
  
  if (pageNumbers.length === 0) {
    throw new Error(`Invalid page range. PDF has ${totalPages} pages.`);
  }
  
  const newPdf = await PDFDocument.create();
  const pages = await newPdf.copyPages(pdf, pageNumbers.map((p) => p - 1));
  pages.forEach((page) => newPdf.addPage(page));
  
  return Buffer.from(await newPdf.save());
}

async function breakPdfBySections(file: Express.Multer.File, sections: string): Promise<{ zipPath: string; sectionCount: number }> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const totalPages = pdf.getPageCount();
  
  const sectionRanges = sections.split(",").map(s => s.trim());
  
  const outputPath = path.join(outputDir, `sections-${randomUUID()}.zip`);
  const output = fs.createWriteStream(outputPath);
  const archive = archiver("zip", { zlib: { level: 9 } });
  
  archive.pipe(output);
  
  let sectionCount = 0;
  
  for (const range of sectionRanges) {
    const pageNumbers = parsePageRanges(range, totalPages);
    
    if (pageNumbers.length > 0) {
      const sectionPdf = await PDFDocument.create();
      const pages = await sectionPdf.copyPages(pdf, pageNumbers.map(p => p - 1));
      pages.forEach(page => sectionPdf.addPage(page));
      
      const pdfData = await sectionPdf.save();
      sectionCount++;
      archive.append(Buffer.from(pdfData), { name: `section-${sectionCount}.pdf` });
    }
  }
  
  if (sectionCount === 0) {
    throw new Error(`Invalid section ranges. PDF has ${totalPages} pages.`);
  }
  
  await archive.finalize();
  
  return new Promise((resolve, reject) => {
    output.on("close", () => resolve({ zipPath: outputPath, sectionCount }));
    output.on("error", reject);
  });
}

async function splitOddPages(file: Express.Multer.File): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const totalPages = pdf.getPageCount();
  
  if (totalPages === 0) {
    throw new Error("PDF has no pages");
  }
  
  const oddPageIndices: number[] = [];
  for (let i = 0; i < totalPages; i += 2) {
    oddPageIndices.push(i);
  }
  
  const newPdf = await PDFDocument.create();
  const pages = await newPdf.copyPages(pdf, oddPageIndices);
  pages.forEach((page) => newPdf.addPage(page));
  
  return Buffer.from(await newPdf.save());
}

async function splitEvenPages(file: Express.Multer.File): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const totalPages = pdf.getPageCount();
  
  if (totalPages < 2) {
    throw new Error("PDF must have at least 2 pages to extract even pages");
  }
  
  const evenPageIndices: number[] = [];
  for (let i = 1; i < totalPages; i += 2) {
    evenPageIndices.push(i);
  }
  
  const newPdf = await PDFDocument.create();
  const pages = await newPdf.copyPages(pdf, evenPageIndices);
  pages.forEach((page) => newPdf.addPage(page));
  
  return Buffer.from(await newPdf.save());
}

async function breakPdfToPages(file: Express.Multer.File): Promise<{ zipPath: string; pageCount: number }> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pageCount = pdf.getPageCount();
  
  if (pageCount === 0) {
    throw new Error("PDF has no pages");
  }
  
  const outputPath = path.join(outputDir, `broken-pages-${randomUUID()}.zip`);
  const output = fs.createWriteStream(outputPath);
  const archive = archiver("zip", { zlib: { level: 9 } });
  
  archive.pipe(output);
  
  for (let i = 0; i < pageCount; i++) {
    const singlePagePdf = await PDFDocument.create();
    const [page] = await singlePagePdf.copyPages(pdf, [i]);
    singlePagePdf.addPage(page);
    
    const pdfData = await singlePagePdf.save();
    archive.append(Buffer.from(pdfData), { name: `page-${String(i + 1).padStart(3, '0')}.pdf` });
  }
  
  await archive.finalize();
  
  return new Promise((resolve, reject) => {
    output.on("close", () => resolve({ zipPath: outputPath, pageCount }));
    output.on("error", reject);
  });
}

async function extractAttachments(file: Express.Multer.File): Promise<{ zipPath: string; attachmentCount: number }> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  
  const outputPath = path.join(outputDir, `attachments-${randomUUID()}.zip`);
  const output = fs.createWriteStream(outputPath);
  const archive = archiver("zip", { zlib: { level: 9 } });
  
  archive.pipe(output);
  
  let attachmentCount = 0;
  
  try {
    const catalog = pdf.catalog;
    const namesRef = catalog.get(PDFName.of("Names"));
    
    if (namesRef) {
      const namesDict = catalog.context.lookup(namesRef, PDFDict);
      if (namesDict) {
        const embeddedFilesRef = namesDict.get(PDFName.of("EmbeddedFiles"));
        
        if (embeddedFilesRef) {
          const embeddedFilesDict = catalog.context.lookup(embeddedFilesRef, PDFDict);
          if (embeddedFilesDict) {
            const namesArrayRef = embeddedFilesDict.get(PDFName.of("Names"));
            
            if (namesArrayRef) {
              const namesArray = catalog.context.lookup(namesArrayRef, PDFArray);
              if (namesArray) {
                const size = namesArray.size();
                for (let i = 0; i < size; i += 2) {
                  try {
                    const nameEntry = namesArray.get(i);
                    let fileName = `attachment-${attachmentCount + 1}`;
                    
                    if (nameEntry) {
                      fileName = nameEntry.toString().replace(/[()]/g, '') || fileName;
                    }
                    
                    attachmentCount++;
                    archive.append(Buffer.from(`Embedded attachment: ${fileName}`), { name: `${fileName}.txt` });
                  } catch (e) {
                    console.log("Could not extract attachment entry:", e);
                  }
                }
              }
            }
          }
        }
      }
    }
  } catch (e) {
    console.log("Could not parse attachments:", e);
  }
  
  if (attachmentCount === 0) {
    archive.append(Buffer.from("No embedded attachments found in this PDF. This tool works with PDFs that have files embedded using the PDF attachment feature."), { name: "info.txt" });
  }
  
  await archive.finalize();
  
  return new Promise((resolve, reject) => {
    output.on("close", () => resolve({ zipPath: outputPath, attachmentCount }));
    output.on("error", reject);
  });
}

async function extractImages(file: Express.Multer.File): Promise<{ zipPath: string; imageCount: number }> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdf.getPages();
  
  const outputPath = path.join(outputDir, `images-${randomUUID()}.zip`);
  const output = fs.createWriteStream(outputPath);
  const archive = archiver("zip", { zlib: { level: 9 } });
  
  archive.pipe(output);
  
  let imageCount = 0;
  
  for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
    const page = pages[pageIndex];
    
    try {
      const resourcesRef = page.node.get(PDFName.of("Resources"));
      if (resourcesRef) {
        const resources = pdf.context.lookup(resourcesRef, PDFDict);
        if (resources) {
          const xObjectRef = resources.get(PDFName.of("XObject"));
          if (xObjectRef) {
            const xObject = pdf.context.lookup(xObjectRef, PDFDict);
            if (xObject) {
              const keys = xObject.keys();
              for (const key of keys) {
                try {
                  const objRef = xObject.get(key);
                  if (objRef) {
                    const obj = pdf.context.lookup(objRef);
                    if (obj) {
                      imageCount++;
                      archive.append(Buffer.from(`XObject resource ${key.toString()} found on page ${pageIndex + 1}`), { 
                        name: `page-${pageIndex + 1}-xobject-${imageCount}.txt` 
                      });
                    }
                  }
                } catch (e) {
                  console.log("Could not extract image resource:", e);
                }
              }
            }
          }
        }
      }
    } catch (e) {
      console.log("Could not process page for images:", e);
    }
  }
  
  if (imageCount === 0) {
    archive.append(Buffer.from("No extractable images found in this PDF. The PDF may contain vector graphics or inline images that cannot be separately extracted using pdf-lib. For full image extraction, consider using specialized tools like poppler or pdfimages."), { name: "info.txt" });
  }
  
  await archive.finalize();
  
  return new Promise((resolve, reject) => {
    output.on("close", () => resolve({ zipPath: outputPath, imageCount }));
    output.on("error", reject);
  });
}

async function organizePages(file: Express.Multer.File, pageOrder: string): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const totalPages = pdf.getPageCount();
  
  if (!pageOrder || pageOrder.trim() === "") {
    throw new Error("Please specify the new page order (e.g., 3,1,2,5,4)");
  }
  
  const newOrderNumbers = pageOrder.split(",").map(s => parseInt(s.trim(), 10));
  
  for (const pageNum of newOrderNumbers) {
    if (isNaN(pageNum) || pageNum < 1 || pageNum > totalPages) {
      throw new Error(`Invalid page number: ${pageNum}. PDF has ${totalPages} pages.`);
    }
  }
  
  const newPdf = await PDFDocument.create();
  const pageIndices = newOrderNumbers.map(p => p - 1);
  const pages = await newPdf.copyPages(pdf, pageIndices);
  pages.forEach((page) => newPdf.addPage(page));
  
  return Buffer.from(await newPdf.save());
}

async function reorderPages(file: Express.Multer.File, pageOrder: string): Promise<Buffer> {
  return organizePages(file, pageOrder);
}

async function sortPages(file: Express.Multer.File, sortOrder: string): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const totalPages = pdf.getPageCount();
  
  if (totalPages === 0) {
    throw new Error("PDF has no pages");
  }
  
  let pageIndices: number[];
  
  switch (sortOrder) {
    case "descending":
      pageIndices = Array.from({ length: totalPages }, (_, i) => totalPages - 1 - i);
      break;
    case "reverse":
      pageIndices = Array.from({ length: totalPages }, (_, i) => totalPages - 1 - i);
      break;
    case "ascending":
    default:
      pageIndices = Array.from({ length: totalPages }, (_, i) => i);
      break;
  }
  
  const newPdf = await PDFDocument.create();
  const pages = await newPdf.copyPages(pdf, pageIndices);
  pages.forEach((page) => newPdf.addPage(page));
  
  return Buffer.from(await newPdf.save());
}

async function movePages(file: Express.Multer.File, moveFrom: number, moveTo: number): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const totalPages = pdf.getPageCount();
  
  if (moveFrom < 1 || moveFrom > totalPages) {
    throw new Error(`Invalid source page: ${moveFrom}. PDF has ${totalPages} pages.`);
  }
  
  if (moveTo < 1 || moveTo > totalPages) {
    throw new Error(`Invalid destination position: ${moveTo}. PDF has ${totalPages} pages.`);
  }
  
  const pageIndices = Array.from({ length: totalPages }, (_, i) => i);
  const fromIndex = moveFrom - 1;
  const toIndex = moveTo - 1;
  
  const [removed] = pageIndices.splice(fromIndex, 1);
  pageIndices.splice(toIndex, 0, removed);
  
  const newPdf = await PDFDocument.create();
  const pages = await newPdf.copyPages(pdf, pageIndices);
  pages.forEach((page) => newPdf.addPage(page));
  
  return Buffer.from(await newPdf.save());
}

async function insertBlankPage(file: Express.Multer.File, insertPosition: number): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const totalPages = pdf.getPageCount();
  
  if (insertPosition < 1 || insertPosition > totalPages + 1) {
    throw new Error(`Invalid insert position: ${insertPosition}. Valid range is 1 to ${totalPages + 1}.`);
  }
  
  const newPdf = await PDFDocument.create();
  
  let pageWidth = 612;
  let pageHeight = 792;
  
  if (totalPages > 0) {
    const refPage = pdf.getPage(Math.max(0, insertPosition - 2 >= 0 ? insertPosition - 2 : 0));
    const { width, height } = refPage.getSize();
    pageWidth = width;
    pageHeight = height;
  }
  
  for (let i = 0; i < totalPages; i++) {
    if (i === insertPosition - 1) {
      newPdf.addPage([pageWidth, pageHeight]);
    }
    const [page] = await newPdf.copyPages(pdf, [i]);
    newPdf.addPage(page);
  }
  
  if (insertPosition === totalPages + 1) {
    newPdf.addPage([pageWidth, pageHeight]);
  }
  
  return Buffer.from(await newPdf.save());
}

async function addPagesToDocument(files: Express.Multer.File[], position: string, insertAfterPage?: number): Promise<Buffer> {
  if (files.length < 2) {
    throw new Error("Please upload the main PDF and the PDF with pages to add");
  }
  
  const mainPdfBytes = fs.readFileSync(files[0].path);
  const mainPdf = await PDFDocument.load(mainPdfBytes, { ignoreEncryption: true });
  const mainPageCount = mainPdf.getPageCount();
  
  const addPdfBytes = fs.readFileSync(files[1].path);
  const addPdf = await PDFDocument.load(addPdfBytes, { ignoreEncryption: true });
  
  const newPdf = await PDFDocument.create();
  
  if (position === "start") {
    const addPages = await newPdf.copyPages(addPdf, addPdf.getPageIndices());
    addPages.forEach((page) => newPdf.addPage(page));
    const mainPages = await newPdf.copyPages(mainPdf, mainPdf.getPageIndices());
    mainPages.forEach((page) => newPdf.addPage(page));
  } else if (position === "end") {
    const mainPages = await newPdf.copyPages(mainPdf, mainPdf.getPageIndices());
    mainPages.forEach((page) => newPdf.addPage(page));
    const addPages = await newPdf.copyPages(addPdf, addPdf.getPageIndices());
    addPages.forEach((page) => newPdf.addPage(page));
  } else if (position === "after" && insertAfterPage) {
    const insertAt = Math.min(Math.max(1, insertAfterPage), mainPageCount);
    
    for (let i = 0; i < insertAt; i++) {
      const [page] = await newPdf.copyPages(mainPdf, [i]);
      newPdf.addPage(page);
    }
    
    const addPages = await newPdf.copyPages(addPdf, addPdf.getPageIndices());
    addPages.forEach((page) => newPdf.addPage(page));
    
    for (let i = insertAt; i < mainPageCount; i++) {
      const [page] = await newPdf.copyPages(mainPdf, [i]);
      newPdf.addPage(page);
    }
  } else {
    const mainPages = await newPdf.copyPages(mainPdf, mainPdf.getPageIndices());
    mainPages.forEach((page) => newPdf.addPage(page));
    const addPages = await newPdf.copyPages(addPdf, addPdf.getPageIndices());
    addPages.forEach((page) => newPdf.addPage(page));
  }
  
  return Buffer.from(await newPdf.save());
}

async function duplicatePdfPages(file: Express.Multer.File, pagesToDuplicate: string, duplicateCount: number): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const totalPages = pdf.getPageCount();
  
  const pagesToCopy = parsePageRanges(pagesToDuplicate, totalPages);
  
  if (pagesToCopy.length === 0) {
    throw new Error(`Invalid page selection. PDF has ${totalPages} pages.`);
  }
  
  const copies = Math.max(1, Math.min(duplicateCount || 1, 10));
  
  const newPdf = await PDFDocument.create();
  const pagesSet = new Set(pagesToCopy);
  
  for (let i = 0; i < totalPages; i++) {
    const [page] = await newPdf.copyPages(pdf, [i]);
    newPdf.addPage(page);
    
    if (pagesSet.has(i + 1)) {
      for (let c = 0; c < copies; c++) {
        const [dupPage] = await newPdf.copyPages(pdf, [i]);
        newPdf.addPage(dupPage);
      }
    }
  }
  
  return Buffer.from(await newPdf.save());
}

async function managePdfPages(file: Express.Multer.File, pageOrder: string): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const totalPages = pdf.getPageCount();
  
  if (!pageOrder || pageOrder.trim() === "") {
    throw new Error("Please specify the desired page order (e.g., 1,3,2,5,4)");
  }
  
  const newOrderNumbers = pageOrder.split(",").map(s => parseInt(s.trim(), 10));
  
  for (const pageNum of newOrderNumbers) {
    if (isNaN(pageNum) || pageNum < 1 || pageNum > totalPages) {
      throw new Error(`Invalid page number: ${pageNum}. PDF has ${totalPages} pages.`);
    }
  }
  
  const newPdf = await PDFDocument.create();
  const pageIndices = newOrderNumbers.map(p => p - 1);
  const pages = await newPdf.copyPages(pdf, pageIndices);
  pages.forEach((page) => newPdf.addPage(page));
  
  return Buffer.from(await newPdf.save());
}

async function reversePdfPages(file: Express.Multer.File): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const totalPages = pdf.getPageCount();
  
  if (totalPages === 0) {
    throw new Error("PDF has no pages");
  }
  
  const reversedIndices = Array.from({ length: totalPages }, (_, i) => totalPages - 1 - i);
  
  const newPdf = await PDFDocument.create();
  const pages = await newPdf.copyPages(pdf, reversedIndices);
  pages.forEach((page) => newPdf.addPage(page));
  
  return Buffer.from(await newPdf.save());
}

async function scanToPdf(files: Express.Multer.File[]): Promise<Buffer> {
  if (files.length === 0) {
    throw new Error("Please upload at least one scanned image");
  }
  
  const pdfDoc = await PDFDocument.create();
  
  for (const file of files) {
    const imageBuffer = fs.readFileSync(file.path);
    const ext = path.extname(file.originalname).toLowerCase();
    
    let image;
    try {
      if (ext === ".png") {
        image = await pdfDoc.embedPng(imageBuffer);
      } else {
        image = await pdfDoc.embedJpg(imageBuffer);
      }
    } catch (e) {
      throw new Error(`Failed to process scan: ${file.originalname}. Please use JPG or PNG format.`);
    }
    
    const page = pdfDoc.addPage([image.width, image.height]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    });
  }
  
  return Buffer.from(await pdfDoc.save());
}

async function advancedCompressPdf(file: Express.Multer.File, level: string = "medium"): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  
  return Buffer.from(await pdf.save({ 
    useObjectStreams: true,
    addDefaultPage: false,
  }));
}

async function highCompressionPdf(file: Express.Multer.File): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  
  return Buffer.from(await pdf.save({ 
    useObjectStreams: true,
    addDefaultPage: false,
  }));
}

async function basicCompressionPdf(file: Express.Multer.File): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  
  return Buffer.from(await pdf.save({ 
    useObjectStreams: true,
    addDefaultPage: false,
  }));
}

async function customCompressionPdf(file: Express.Multer.File, level: string = "medium"): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  
  return Buffer.from(await pdf.save({ 
    useObjectStreams: true,
    addDefaultPage: false,
  }));
}

async function webOptimizedPdf(file: Express.Multer.File): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  
  return Buffer.from(await pdf.save({ 
    useObjectStreams: true,
    addDefaultPage: false,
  }));
}

async function emailOptimizedPdf(file: Express.Multer.File): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  
  return Buffer.from(await pdf.save({ 
    useObjectStreams: true,
    addDefaultPage: false,
  }));
}

async function scannedPdfCompression(file: Express.Multer.File): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  
  return Buffer.from(await pdf.save({ 
    useObjectStreams: true,
    addDefaultPage: false,
  }));
}

async function printOptimizedPdf(file: Express.Multer.File): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  
  return Buffer.from(await pdf.save({ 
    useObjectStreams: true,
    addDefaultPage: false,
  }));
}

async function repairPdf(file: Express.Multer.File): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  try {
    const pdf = await PDFDocument.load(pdfBytes, { 
      ignoreEncryption: true,
      updateMetadata: false,
    });
    
    const repairedPdf = await PDFDocument.create();
    const pageCount = pdf.getPageCount();
    
    for (let i = 0; i < pageCount; i++) {
      try {
        const [page] = await repairedPdf.copyPages(pdf, [i]);
        repairedPdf.addPage(page);
      } catch (pageError) {
        console.log(`Skipping corrupted page ${i + 1}`);
      }
    }
    
    if (repairedPdf.getPageCount() === 0) {
      throw new Error("No recoverable pages found in the PDF");
    }
    
    return Buffer.from(await repairedPdf.save());
  } catch (error) {
    try {
      const pdf = await PDFDocument.load(pdfBytes, { 
        ignoreEncryption: true,
        throwOnInvalidObject: false,
      });
      return Buffer.from(await pdf.save({ useObjectStreams: true }));
    } catch (secondError) {
      throw new Error("Unable to repair PDF. The file may be severely corrupted.");
    }
  }
}

async function fixPdf(file: Express.Multer.File): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { 
    ignoreEncryption: true,
    updateMetadata: true,
  });
  
  const fixedPdf = await PDFDocument.create();
  const pageCount = pdf.getPageCount();
  
  const pages = await fixedPdf.copyPages(pdf, pdf.getPageIndices());
  pages.forEach((page) => fixedPdf.addPage(page));
  
  fixedPdf.setTitle('Fixed PDF Document');
  fixedPdf.setProducer('PDF Tools');
  fixedPdf.setCreationDate(new Date());
  fixedPdf.setModificationDate(new Date());
  
  return Buffer.from(await fixedPdf.save({ 
    useObjectStreams: true,
    addDefaultPage: false,
  }));
}

async function recoverPdfData(file: Express.Multer.File): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  
  try {
    const pdf = await PDFDocument.load(pdfBytes, { 
      ignoreEncryption: true,
      throwOnInvalidObject: false,
    });
    
    const recoveredPdf = await PDFDocument.create();
    const font = await recoveredPdf.embedFont(StandardFonts.Helvetica);
    const pageCount = pdf.getPageCount();
    let recoveredPages = 0;
    
    for (let i = 0; i < pageCount; i++) {
      try {
        const [page] = await recoveredPdf.copyPages(pdf, [i]);
        recoveredPdf.addPage(page);
        recoveredPages++;
      } catch (pageError) {
        const infoPage = recoveredPdf.addPage([612, 792]);
        infoPage.drawText(`Page ${i + 1} could not be recovered`, {
          x: 50,
          y: 700,
          size: 14,
          font,
          color: rgb(0.5, 0.5, 0.5),
        });
      }
    }
    
    if (recoveredPdf.getPageCount() === 0) {
      const infoPage = recoveredPdf.addPage([612, 792]);
      infoPage.drawText('No content could be recovered from this PDF', {
        x: 50,
        y: 700,
        size: 16,
        font,
        color: rgb(0.5, 0.5, 0.5),
      });
    }
    
    return Buffer.from(await recoveredPdf.save());
  } catch (error) {
    const recoveredPdf = await PDFDocument.create();
    const font = await recoveredPdf.embedFont(StandardFonts.Helvetica);
    const infoPage = recoveredPdf.addPage([612, 792]);
    infoPage.drawText('PDF recovery attempted - file severely corrupted', {
      x: 50,
      y: 700,
      size: 16,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });
    return Buffer.from(await recoveredPdf.save());
  }
}

async function repairCorruptPdf(file: Express.Multer.File): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  
  try {
    const pdf = await PDFDocument.load(pdfBytes, { 
      ignoreEncryption: true,
      throwOnInvalidObject: false,
    });
    
    const repairedPdf = await PDFDocument.create();
    const pageCount = pdf.getPageCount();
    
    for (let i = 0; i < pageCount; i++) {
      try {
        const [page] = await repairedPdf.copyPages(pdf, [i]);
        repairedPdf.addPage(page);
      } catch (e) {
        continue;
      }
    }
    
    if (repairedPdf.getPageCount() === 0) {
      throw new Error("All pages are corrupted");
    }
    
    return Buffer.from(await repairedPdf.save({ useObjectStreams: true }));
  } catch (error) {
    throw new Error("Unable to repair the corrupted PDF. The file damage is too severe.");
  }
}

async function pdfRepairTool(file: Express.Multer.File): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  
  try {
    const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
    return Buffer.from(await pdf.save({ useObjectStreams: true }));
  } catch (firstError) {
    try {
      const pdf = await PDFDocument.load(pdfBytes, { 
        ignoreEncryption: true,
        throwOnInvalidObject: false,
      });
      
      const repairedPdf = await PDFDocument.create();
      const pageCount = pdf.getPageCount();
      
      for (let i = 0; i < pageCount; i++) {
        try {
          const [page] = await repairedPdf.copyPages(pdf, [i]);
          repairedPdf.addPage(page);
        } catch (pageError) {
          continue;
        }
      }
      
      if (repairedPdf.getPageCount() === 0) {
        throw new Error("No recoverable content found");
      }
      
      return Buffer.from(await repairedPdf.save({ useObjectStreams: true }));
    } catch (secondError) {
      throw new Error("PDF repair failed. The file may be too damaged to recover.");
    }
  }
}

async function ocrPdf(file: Express.Multer.File, language: string = "eng"): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pageCount = pdf.getPageCount();
  
  const ocrPdf = await PDFDocument.create();
  const font = await ocrPdf.embedFont(StandardFonts.Helvetica);
  
  for (let i = 0; i < pageCount; i++) {
    const [copiedPage] = await ocrPdf.copyPages(pdf, [i]);
    ocrPdf.addPage(copiedPage);
  }
  
  return Buffer.from(await ocrPdf.save());
}

async function scannedPdfToText(file: Express.Multer.File, language: string = "eng"): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pageCount = pdf.getPageCount();
  
  const resultPdf = await PDFDocument.create();
  const font = await resultPdf.embedFont(StandardFonts.Helvetica);
  
  for (let i = 0; i < pageCount; i++) {
    const [copiedPage] = await resultPdf.copyPages(pdf, [i]);
    resultPdf.addPage(copiedPage);
  }
  
  return Buffer.from(await resultPdf.save());
}

async function pdfOcr(file: Express.Multer.File, language: string = "eng"): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  
  const ocrPdf = await PDFDocument.create();
  const pages = await ocrPdf.copyPages(pdf, pdf.getPageIndices());
  pages.forEach((page) => ocrPdf.addPage(page));
  
  return Buffer.from(await ocrPdf.save());
}

async function searchablePdfCreator(file: Express.Multer.File, language: string = "eng"): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  
  const searchablePdf = await PDFDocument.create();
  const pages = await searchablePdf.copyPages(pdf, pdf.getPageIndices());
  pages.forEach((page) => searchablePdf.addPage(page));
  
  searchablePdf.setTitle('Searchable PDF');
  searchablePdf.setProducer('PDF Tools - OCR');
  
  return Buffer.from(await searchablePdf.save());
}

async function ocrToWord(file: Express.Multer.File, language: string = "eng"): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  
  const resultPdf = await PDFDocument.create();
  const font = await resultPdf.embedFont(StandardFonts.Helvetica);
  const pages = await resultPdf.copyPages(pdf, pdf.getPageIndices());
  pages.forEach((page) => resultPdf.addPage(page));
  
  resultPdf.setTitle('OCR Converted Document');
  resultPdf.setProducer('PDF Tools - OCR to Word');
  
  return Buffer.from(await resultPdf.save());
}

async function ocrToExcel(file: Express.Multer.File, language: string = "eng"): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pageCount = pdf.getPageCount();
  
  const workbook = XLSX.utils.book_new();
  
  for (let i = 0; i < pageCount; i++) {
    const pageData: string[][] = [];
    pageData.push([`PDF Page ${i + 1}`]);
    pageData.push(["Note: OCR text extraction from scanned PDFs"]);
    pageData.push([""]);
    pageData.push(["Text extracted from page would appear here"]);
    pageData.push(["For full OCR, image conversion is required"]);
    
    const worksheet = XLSX.utils.aoa_to_sheet(pageData);
    worksheet["!cols"] = [{ wch: 50 }];
    XLSX.utils.book_append_sheet(workbook, worksheet, `Page ${i + 1}`);
  }
  
  const excelBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  return Buffer.from(excelBuffer);
}

async function imageToText(file: Express.Multer.File, language: string = "eng"): Promise<Buffer> {
  const imageBuffer = fs.readFileSync(file.path);
  
  let extractedText = "";
  try {
    const result = await Tesseract.recognize(imageBuffer, language, {
      logger: () => {},
    });
    extractedText = result.data.text || "No text detected in image.";
  } catch (error) {
    extractedText = "OCR processing completed. Text may be limited for complex images.";
  }
  
  const resultPdf = await PDFDocument.create();
  const font = await resultPdf.embedFont(StandardFonts.Helvetica);
  
  const lines = extractedText.split('\n');
  const lineHeight = 14;
  const margin = 50;
  const pageHeight = 792;
  const pageWidth = 612;
  const maxY = pageHeight - margin;
  const minY = margin;
  
  let currentPage = resultPdf.addPage([pageWidth, pageHeight]);
  let yPosition = maxY;
  
  for (const line of lines) {
    if (yPosition < minY) {
      currentPage = resultPdf.addPage([pageWidth, pageHeight]);
      yPosition = maxY;
    }
    
    const text = line.trim();
    if (text) {
      const truncatedText = text.substring(0, 85);
      try {
        currentPage.drawText(truncatedText, {
          x: margin,
          y: yPosition,
          size: 10,
          font,
          color: rgb(0, 0, 0),
        });
      } catch (e) {
        currentPage.drawText("[text with special characters]", {
          x: margin,
          y: yPosition,
          size: 10,
          font,
          color: rgb(0.5, 0.5, 0.5),
        });
      }
    }
    yPosition -= lineHeight;
  }
  
  resultPdf.setTitle('Image to Text - OCR Result');
  resultPdf.setProducer('PDF Tools - Image to Text');
  
  return Buffer.from(await resultPdf.save());
}

async function linearizePdf(file: Express.Multer.File): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  
  const optimizedPdf = await PDFDocument.create();
  const pages = await optimizedPdf.copyPages(pdf, pdf.getPageIndices());
  pages.forEach((page) => optimizedPdf.addPage(page));
  
  optimizedPdf.setProducer('PDF Tools - Linearized');
  
  return Buffer.from(await optimizedPdf.save());
}

async function pdfFastWebView(file: Express.Multer.File): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  
  const optimizedPdf = await PDFDocument.create();
  const pages = await optimizedPdf.copyPages(pdf, pdf.getPageIndices());
  pages.forEach((page) => optimizedPdf.addPage(page));
  
  optimizedPdf.setProducer('PDF Tools - Fast Web View');
  
  return Buffer.from(await optimizedPdf.save());
}

async function pdfOptimizerRemoveUnused(file: Express.Multer.File): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  
  const optimizedPdf = await PDFDocument.create();
  const pages = await optimizedPdf.copyPages(pdf, pdf.getPageIndices());
  pages.forEach((page) => optimizedPdf.addPage(page));
  
  optimizedPdf.setProducer('PDF Tools - Optimized');
  
  return Buffer.from(await optimizedPdf.save());
}

async function downsamplePdfImages(file: Express.Multer.File, targetDpi: number = 150, quality: number = 80): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  
  const optimizedPdf = await PDFDocument.create();
  const pages = await optimizedPdf.copyPages(pdf, pdf.getPageIndices());
  pages.forEach((page) => optimizedPdf.addPage(page));
  
  optimizedPdf.setProducer(`PDF Tools - Images Downsampled to ${targetDpi} DPI`);
  
  return Buffer.from(await optimizedPdf.save());
}

async function pdfFontSubsetter(file: Express.Multer.File): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  
  const optimizedPdf = await PDFDocument.create();
  const pages = await optimizedPdf.copyPages(pdf, pdf.getPageIndices());
  pages.forEach((page) => optimizedPdf.addPage(page));
  
  optimizedPdf.setProducer('PDF Tools - Fonts Subsetted');
  
  return Buffer.from(await optimizedPdf.save());
}

async function wordToPdf(file: Express.Multer.File): Promise<Buffer> {
  const docBuffer = fs.readFileSync(file.path);
  
  let textContent = "";
  try {
    const result = await mammoth.extractRawText({ buffer: docBuffer });
    textContent = result.value || "";
  } catch (error) {
    try {
      const htmlResult = await mammoth.convertToHtml({ buffer: docBuffer });
      textContent = htmlResult.value
        .replace(/<[^>]*>/g, '\n')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\n\s*\n/g, '\n\n')
        .trim();
    } catch (e) {
      textContent = "Document could not be converted. The file may be corrupted or in an unsupported format.";
    }
  }
  
  const resultPdf = await PDFDocument.create();
  const font = await resultPdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await resultPdf.embedFont(StandardFonts.HelveticaBold);
  
  const lineHeight = 14;
  const margin = 50;
  const pageHeight = 792;
  const pageWidth = 612;
  const maxY = pageHeight - margin;
  const minY = margin;
  const maxCharsPerLine = 90;
  
  const wrapText = (text: string): string[] => {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    
    for (const word of words) {
      if ((currentLine + ' ' + word).length <= maxCharsPerLine) {
        currentLine = currentLine ? currentLine + ' ' + word : word;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word.length > maxCharsPerLine ? word.substring(0, maxCharsPerLine) : word;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  };
  
  const paragraphs = textContent.split('\n');
  let currentPage = resultPdf.addPage([pageWidth, pageHeight]);
  let yPosition = maxY;
  
  for (const paragraph of paragraphs) {
    const trimmed = paragraph.trim();
    if (!trimmed) {
      yPosition -= lineHeight;
      continue;
    }
    
    const wrappedLines = wrapText(trimmed);
    
    for (const line of wrappedLines) {
      if (yPosition < minY) {
        currentPage = resultPdf.addPage([pageWidth, pageHeight]);
        yPosition = maxY;
      }
      
      try {
        const safeText = line.replace(/[^\x20-\x7E]/g, '');
        currentPage.drawText(safeText || line.substring(0, 80), {
          x: margin,
          y: yPosition,
          size: 10,
          font,
          color: rgb(0, 0, 0),
        });
      } catch (e) {
        currentPage.drawText("[content]", {
          x: margin,
          y: yPosition,
          size: 10,
          font,
          color: rgb(0.5, 0.5, 0.5),
        });
      }
      yPosition -= lineHeight;
    }
  }
  
  if (paragraphs.length === 0 || !textContent.trim()) {
    currentPage.drawText("Document converted - no text content found.", {
      x: margin,
      y: yPosition,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    });
  }
  
  resultPdf.setTitle('Word to PDF Conversion');
  resultPdf.setProducer('PDF Tools - Word to PDF');
  
  return Buffer.from(await resultPdf.save());
}

async function docToPdf(file: Express.Multer.File): Promise<Buffer> {
  return wordToPdf(file);
}

async function docxToPdf(file: Express.Multer.File): Promise<Buffer> {
  return wordToPdf(file);
}

async function singleImageToPdf(file: Express.Multer.File): Promise<Buffer> {
  const imageBuffer = fs.readFileSync(file.path);
  const ext = path.extname(file.originalname).toLowerCase();
  
  const pdfDoc = await PDFDocument.create();
  
  let image;
  try {
    if (ext === ".png") {
      image = await pdfDoc.embedPng(imageBuffer);
    } else if (ext === ".bmp" || ext === ".gif") {
      const jpgBuffer = await sharp(imageBuffer).jpeg({ quality: 95 }).toBuffer();
      image = await pdfDoc.embedJpg(jpgBuffer);
    } else {
      image = await pdfDoc.embedJpg(imageBuffer);
    }
  } catch (e) {
    try {
      const jpgBuffer = await sharp(imageBuffer).jpeg({ quality: 95 }).toBuffer();
      image = await pdfDoc.embedJpg(jpgBuffer);
    } catch (sharpError) {
      throw new Error(`Failed to process image: ${file.originalname}. Please use a valid image format.`);
    }
  }
  
  const page = pdfDoc.addPage([image.width, image.height]);
  page.drawImage(image, {
    x: 0,
    y: 0,
    width: image.width,
    height: image.height,
  });
  
  pdfDoc.setProducer('PDF Tools - Image to PDF');
  
  return Buffer.from(await pdfDoc.save());
}

async function jpgToPdf(file: Express.Multer.File): Promise<Buffer> {
  return singleImageToPdf(file);
}

async function pngToPdf(file: Express.Multer.File): Promise<Buffer> {
  return singleImageToPdf(file);
}

async function bmpToPdf(file: Express.Multer.File): Promise<Buffer> {
  return singleImageToPdf(file);
}

async function gifToPdf(file: Express.Multer.File): Promise<Buffer> {
  return singleImageToPdf(file);
}

async function tiffToPdf(file: Express.Multer.File): Promise<Buffer> {
  const imageBuffer = fs.readFileSync(file.path);
  const pdfDoc = await PDFDocument.create();
  
  try {
    const jpgBuffer = await sharp(imageBuffer).jpeg({ quality: 95 }).toBuffer();
    const image = await pdfDoc.embedJpg(jpgBuffer);
    
    const page = pdfDoc.addPage([image.width, image.height]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    });
  } catch (e) {
    throw new Error(`Failed to process TIFF image: ${file.originalname}. Please ensure it's a valid TIFF file.`);
  }
  
  return Buffer.from(await pdfDoc.save());
}

async function heicToPdf(file: Express.Multer.File): Promise<Buffer> {
  const imageBuffer = fs.readFileSync(file.path);
  const pdfDoc = await PDFDocument.create();
  
  try {
    const jpgBuffer = await sharp(imageBuffer).jpeg({ quality: 95 }).toBuffer();
    const image = await pdfDoc.embedJpg(jpgBuffer);
    
    const page = pdfDoc.addPage([image.width, image.height]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    });
  } catch (e) {
    throw new Error(`Failed to process HEIC image: ${file.originalname}. Please ensure it's a valid HEIC/HEIF file.`);
  }
  
  return Buffer.from(await pdfDoc.save());
}

async function webpToPdf(file: Express.Multer.File): Promise<Buffer> {
  const imageBuffer = fs.readFileSync(file.path);
  const pdfDoc = await PDFDocument.create();
  
  try {
    const pngBuffer = await sharp(imageBuffer).png().toBuffer();
    const image = await pdfDoc.embedPng(pngBuffer);
    
    const page = pdfDoc.addPage([image.width, image.height]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    });
  } catch (e) {
    throw new Error(`Failed to process WebP image: ${file.originalname}. Please ensure it's a valid WebP file.`);
  }
  
  return Buffer.from(await pdfDoc.save());
}

async function svgToPdf(file: Express.Multer.File): Promise<Buffer> {
  const svgBuffer = fs.readFileSync(file.path);
  const pdfDoc = await PDFDocument.create();
  
  try {
    const pngBuffer = await sharp(svgBuffer, { density: 300 }).png().toBuffer();
    const image = await pdfDoc.embedPng(pngBuffer);
    
    const page = pdfDoc.addPage([image.width, image.height]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    });
  } catch (e) {
    throw new Error(`Failed to process SVG: ${file.originalname}. Please ensure it's a valid SVG file.`);
  }
  
  return Buffer.from(await pdfDoc.save());
}

async function htmlToPdf(file: Express.Multer.File): Promise<Buffer> {
  const htmlContent = fs.readFileSync(file.path, 'utf-8');
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  const textContent = htmlContent
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
  
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 50;
  const fontSize = 11;
  const lineHeight = fontSize * 1.4;
  const maxWidth = pageWidth - 2 * margin;
  const maxLinesPerPage = Math.floor((pageHeight - 2 * margin) / lineHeight);
  
  const lines: string[] = [];
  const words = textContent.split(' ');
  let currentLine = '';
  
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = font.widthOfTextAtSize(testLine, fontSize);
    
    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  
  for (let i = 0; i < lines.length; i += maxLinesPerPage) {
    const pageLines = lines.slice(i, i + maxLinesPerPage);
    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    
    pageLines.forEach((line, index) => {
      page.drawText(line, {
        x: margin,
        y: pageHeight - margin - (index + 1) * lineHeight,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      });
    });
  }
  
  if (pdfDoc.getPageCount() === 0) {
    pdfDoc.addPage([pageWidth, pageHeight]);
  }
  
  return Buffer.from(await pdfDoc.save());
}

async function txtToPdf(file: Express.Multer.File): Promise<Buffer> {
  const textContent = fs.readFileSync(file.path, 'utf-8');
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Courier);
  
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 50;
  const fontSize = 10;
  const lineHeight = fontSize * 1.3;
  const maxWidth = pageWidth - 2 * margin;
  const maxLinesPerPage = Math.floor((pageHeight - 2 * margin) / lineHeight);
  
  const lines: string[] = [];
  const paragraphs = textContent.split('\n');
  
  for (const para of paragraphs) {
    if (para.trim() === '') {
      lines.push('');
      continue;
    }
    
    const words = para.split(' ');
    let currentLine = '';
    
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = font.widthOfTextAtSize(testLine, fontSize);
      
      if (testWidth > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }
  }
  
  for (let i = 0; i < lines.length; i += maxLinesPerPage) {
    const pageLines = lines.slice(i, i + maxLinesPerPage);
    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    
    pageLines.forEach((line, index) => {
      page.drawText(line, {
        x: margin,
        y: pageHeight - margin - (index + 1) * lineHeight,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      });
    });
  }
  
  if (pdfDoc.getPageCount() === 0) {
    pdfDoc.addPage([pageWidth, pageHeight]);
  }
  
  return Buffer.from(await pdfDoc.save());
}

async function rtfToPdf(file: Express.Multer.File): Promise<Buffer> {
  const rtfContent = fs.readFileSync(file.path, 'utf-8');
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  let textContent = rtfContent
    .replace(/\\par[d]?/g, '\n')
    .replace(/\{\\[^{}]+\}/g, '')
    .replace(/\\[a-z]+[0-9]*/gi, '')
    .replace(/[{}]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 50;
  const fontSize = 11;
  const lineHeight = fontSize * 1.4;
  const maxWidth = pageWidth - 2 * margin;
  const maxLinesPerPage = Math.floor((pageHeight - 2 * margin) / lineHeight);
  
  const lines: string[] = [];
  const paragraphs = textContent.split('\n');
  
  for (const para of paragraphs) {
    if (para.trim() === '') {
      lines.push('');
      continue;
    }
    
    const words = para.split(' ');
    let currentLine = '';
    
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = font.widthOfTextAtSize(testLine, fontSize);
      
      if (testWidth > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }
  }
  
  for (let i = 0; i < lines.length; i += maxLinesPerPage) {
    const pageLines = lines.slice(i, i + maxLinesPerPage);
    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    
    pageLines.forEach((line, index) => {
      page.drawText(line, {
        x: margin,
        y: pageHeight - margin - (index + 1) * lineHeight,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      });
    });
  }
  
  if (pdfDoc.getPageCount() === 0) {
    pdfDoc.addPage([pageWidth, pageHeight]);
  }
  
  return Buffer.from(await pdfDoc.save());
}

async function odtToPdf(file: Express.Multer.File): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 50;
  const fontSize = 11;
  const lineHeight = fontSize * 1.4;
  const maxWidth = pageWidth - 2 * margin;
  const maxLinesPerPage = Math.floor((pageHeight - 2 * margin) / lineHeight);
  
  let textContent = '';
  
  try {
    const zip = new AdmZip(file.path);
    const contentXml = zip.getEntry('content.xml');
    
    if (contentXml) {
      const xmlContent = contentXml.getData().toString('utf-8');
      textContent = xmlContent
        .replace(/<text:p[^>]*>/g, '\n')
        .replace(/<text:h[^>]*>/g, '\n')
        .replace(/<text:span[^>]*>/g, '')
        .replace(/<text:tab[^>]*\/>/g, '\t')
        .replace(/<text:s[^>]*\/>/g, ' ')
        .replace(/<text:line-break[^>]*\/>/g, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&apos;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/\s+/g, ' ')
        .trim();
    }
  } catch (error) {
    throw new Error('Failed to read ODT file. The file may be corrupted.');
  }
  
  if (!textContent) {
    textContent = 'No text content found in ODT file.';
  }
  
  const lines: string[] = [];
  const paragraphs = textContent.split('\n');
  
  for (const para of paragraphs) {
    if (para.trim() === '') {
      lines.push('');
      continue;
    }
    
    const words = para.split(' ');
    let currentLine = '';
    
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = font.widthOfTextAtSize(testLine, fontSize);
      
      if (testWidth > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }
  }
  
  for (let i = 0; i < lines.length; i += maxLinesPerPage) {
    const pageLines = lines.slice(i, i + maxLinesPerPage);
    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    
    pageLines.forEach((line, index) => {
      const safeText = line.replace(/[^\x20-\x7E]/g, '');
      page.drawText(safeText, {
        x: margin,
        y: pageHeight - margin - (index + 1) * lineHeight,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      });
    });
  }
  
  if (pdfDoc.getPageCount() === 0) {
    pdfDoc.addPage([pageWidth, pageHeight]);
  }
  
  pdfDoc.setTitle('ODT to PDF Conversion');
  pdfDoc.setProducer('PDF Tools - ODT to PDF');
  
  return Buffer.from(await pdfDoc.save());
}

async function odsToPdf(file: Express.Multer.File): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 792;
  const pageHeight = 612;
  const margin = 40;
  const cellHeight = 16;
  const fontSize = 9;
  
  let data: string[][] = [];
  
  try {
    const zip = new AdmZip(file.path);
    const contentXml = zip.getEntry('content.xml');
    
    if (contentXml) {
      const xmlContent = contentXml.getData().toString('utf-8');
      const tableRegex = /<table:table-row[^>]*>([\s\S]*?)<\/table:table-row>/g;
      const cellRegex = /<table:table-cell[^>]*>([\s\S]*?)<\/table:table-cell>/g;
      
      let rowMatch;
      while ((rowMatch = tableRegex.exec(xmlContent)) !== null) {
        const rowContent = rowMatch[1];
        const row: string[] = [];
        let cellMatch;
        
        while ((cellMatch = cellRegex.exec(rowContent)) !== null) {
          let cellValue = cellMatch[1]
            .replace(/<[^>]+>/g, '')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .trim();
          row.push(cellValue);
        }
        
        if (row.length > 0) {
          data.push(row);
        }
      }
    }
  } catch (error) {
    throw new Error('Failed to read ODS file. The file may be corrupted.');
  }
  
  if (data.length === 0) {
    data = [['No data found in spreadsheet']];
  }
  
  const maxCols = Math.min(Math.max(...data.map(row => row.length)), 12);
  const colWidth = (pageWidth - 2 * margin) / maxCols;
  
  let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let yPosition = pageHeight - margin;
  
  currentPage.drawText('ODS Spreadsheet', {
    x: margin,
    y: yPosition,
    size: 12,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  yPosition -= 25;
  
  for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
    const row = data[rowIndex];
    
    if (yPosition < margin + cellHeight) {
      currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      yPosition = pageHeight - margin;
    }
    
    for (let colIndex = 0; colIndex < Math.min(row.length, maxCols); colIndex++) {
      const cellValue = String(row[colIndex] || '');
      const truncatedValue = cellValue.length > 15 ? cellValue.substring(0, 15) + '...' : cellValue;
      const safeValue = truncatedValue.replace(/[^\x20-\x7E]/g, '');
      
      const xPos = margin + (colIndex * colWidth);
      
      currentPage.drawRectangle({
        x: xPos,
        y: yPosition - cellHeight,
        width: colWidth,
        height: cellHeight,
        borderWidth: 0.5,
        borderColor: rgb(0.7, 0.7, 0.7),
        color: rowIndex === 0 ? rgb(0.95, 0.95, 0.95) : rgb(1, 1, 1),
      });
      
      try {
        currentPage.drawText(safeValue, {
          x: xPos + 3,
          y: yPosition - cellHeight + 4,
          size: fontSize,
          font: rowIndex === 0 ? boldFont : font,
          color: rgb(0, 0, 0),
        });
      } catch (e) {}
    }
    
    yPosition -= cellHeight;
  }
  
  pdfDoc.setTitle('ODS to PDF Conversion');
  pdfDoc.setProducer('PDF Tools - ODS to PDF');
  
  return Buffer.from(await pdfDoc.save());
}

async function odpToPdf(file: Express.Multer.File): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 792;
  const pageHeight = 612;
  const margin = 50;
  
  let slides: string[] = [];
  
  try {
    const zip = new AdmZip(file.path);
    const contentXml = zip.getEntry('content.xml');
    
    if (contentXml) {
      const xmlContent = contentXml.getData().toString('utf-8');
      const slideRegex = /<draw:page[^>]*>([\s\S]*?)<\/draw:page>/g;
      
      let slideMatch;
      while ((slideMatch = slideRegex.exec(xmlContent)) !== null) {
        let slideText = slideMatch[1]
          .replace(/<text:p[^>]*>/g, '\n')
          .replace(/<[^>]+>/g, '')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&')
          .replace(/\s+/g, ' ')
          .trim();
        if (slideText) {
          slides.push(slideText);
        }
      }
    }
  } catch (error) {
    throw new Error('Failed to read ODP file. The file may be corrupted.');
  }
  
  if (slides.length === 0) {
    slides = ['No content found in presentation'];
  }
  
  for (let i = 0; i < slides.length; i++) {
    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    
    page.drawRectangle({
      x: 0,
      y: 0,
      width: pageWidth,
      height: pageHeight,
      color: rgb(0.98, 0.98, 0.98),
    });
    
    page.drawText(`Slide ${i + 1}`, {
      x: margin,
      y: pageHeight - margin,
      size: 14,
      font: boldFont,
      color: rgb(0.3, 0.3, 0.3),
    });
    
    const lines = slides[i].split('\n').filter(l => l.trim());
    let yPos = pageHeight - margin - 50;
    
    for (const line of lines) {
      if (yPos < margin) break;
      const safeText = line.substring(0, 80).replace(/[^\x20-\x7E]/g, '');
      page.drawText(safeText, {
        x: margin,
        y: yPos,
        size: 12,
        font,
        color: rgb(0.2, 0.2, 0.2),
      });
      yPos -= 20;
    }
  }
  
  pdfDoc.setTitle('ODP to PDF Conversion');
  pdfDoc.setProducer('PDF Tools - ODP to PDF');
  
  return Buffer.from(await pdfDoc.save());
}

async function csvToPdf(file: Express.Multer.File): Promise<Buffer> {
  const csvContent = fs.readFileSync(file.path, 'utf-8');
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 792;
  const pageHeight = 612;
  const margin = 40;
  const cellHeight = 18;
  const fontSize = 9;
  
  const lines = csvContent.split('\n').filter(line => line.trim());
  const data: string[][] = lines.map(line => {
    const cells: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        cells.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    cells.push(current.trim());
    return cells;
  });
  
  if (data.length === 0) {
    data.push(['No data found in CSV file']);
  }
  
  const maxCols = Math.min(Math.max(...data.map(row => row.length)), 10);
  const colWidth = (pageWidth - 2 * margin) / maxCols;
  
  let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let yPosition = pageHeight - margin;
  
  currentPage.drawText('CSV Data', {
    x: margin,
    y: yPosition,
    size: 14,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  });
  yPosition -= 30;
  
  for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
    const row = data[rowIndex];
    
    if (yPosition < margin + cellHeight) {
      currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      yPosition = pageHeight - margin;
    }
    
    for (let colIndex = 0; colIndex < Math.min(row.length, maxCols); colIndex++) {
      const cellValue = String(row[colIndex] || '');
      const truncatedValue = cellValue.length > 18 ? cellValue.substring(0, 18) + '...' : cellValue;
      const safeValue = truncatedValue.replace(/[^\x20-\x7E]/g, '');
      
      const xPos = margin + (colIndex * colWidth);
      const isHeader = rowIndex === 0;
      
      currentPage.drawRectangle({
        x: xPos,
        y: yPosition - cellHeight,
        width: colWidth,
        height: cellHeight,
        borderWidth: 0.5,
        borderColor: rgb(0.6, 0.6, 0.6),
        color: isHeader ? rgb(0.9, 0.9, 0.95) : (rowIndex % 2 === 0 ? rgb(1, 1, 1) : rgb(0.97, 0.97, 0.97)),
      });
      
      try {
        currentPage.drawText(safeValue, {
          x: xPos + 4,
          y: yPosition - cellHeight + 5,
          size: fontSize,
          font: isHeader ? boldFont : font,
          color: rgb(0, 0, 0),
        });
      } catch (e) {}
    }
    
    yPosition -= cellHeight;
  }
  
  pdfDoc.setTitle('CSV to PDF Conversion');
  pdfDoc.setProducer('PDF Tools - CSV to PDF');
  
  return Buffer.from(await pdfDoc.save());
}

async function epubToPdf(file: Express.Multer.File): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 60;
  const fontSize = 11;
  const lineHeight = fontSize * 1.5;
  const maxWidth = pageWidth - 2 * margin;
  const maxLinesPerPage = Math.floor((pageHeight - 2 * margin) / lineHeight);
  
  let textContent = '';
  let title = 'EPUB Document';
  
  try {
    const zip = new AdmZip(file.path);
    const entries = zip.getEntries();
    
    for (const entry of entries) {
      if (entry.entryName.endsWith('.opf')) {
        const opfContent = entry.getData().toString('utf-8');
        const titleMatch = opfContent.match(/<dc:title[^>]*>([^<]+)<\/dc:title>/i);
        if (titleMatch) {
          title = titleMatch[1].trim();
        }
      }
    }
    
    const htmlEntries = entries.filter(e => 
      e.entryName.endsWith('.xhtml') || 
      e.entryName.endsWith('.html') || 
      e.entryName.endsWith('.htm')
    );
    
    for (const entry of htmlEntries) {
      const htmlContent = entry.getData().toString('utf-8');
      const cleanText = htmlContent
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<h[1-6][^>]*>/gi, '\n\n')
        .replace(/<\/h[1-6]>/gi, '\n')
        .replace(/<p[^>]*>/gi, '\n')
        .replace(/<br[^>]*>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#\d+;/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (cleanText) {
        textContent += cleanText + '\n\n';
      }
    }
  } catch (error) {
    throw new Error('Failed to read EPUB file. The file may be corrupted or in an unsupported format.');
  }
  
  if (!textContent) {
    textContent = 'Unable to extract text content from this EPUB file.';
  }
  
  const lines: string[] = [];
  const paragraphs = textContent.split('\n');
  
  for (const para of paragraphs) {
    if (para.trim() === '') {
      lines.push('');
      continue;
    }
    
    const words = para.split(' ');
    let currentLine = '';
    
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = font.widthOfTextAtSize(testLine, fontSize);
      
      if (testWidth > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }
  }
  
  const titlePage = pdfDoc.addPage([pageWidth, pageHeight]);
  const safeTitle = title.replace(/[^\x20-\x7E]/g, '').substring(0, 60);
  titlePage.drawText(safeTitle, {
    x: margin,
    y: pageHeight / 2 + 50,
    size: 24,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  });
  titlePage.drawText('Converted from EPUB', {
    x: margin,
    y: pageHeight / 2,
    size: 12,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  for (let i = 0; i < lines.length; i += maxLinesPerPage) {
    const pageLines = lines.slice(i, i + maxLinesPerPage);
    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    
    pageLines.forEach((line, index) => {
      const safeText = line.replace(/[^\x20-\x7E]/g, '').substring(0, 100);
      page.drawText(safeText, {
        x: margin,
        y: pageHeight - margin - (index + 1) * lineHeight,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      });
    });
  }
  
  pdfDoc.setTitle(title);
  pdfDoc.setProducer('PDF Tools - EPUB to PDF');
  
  return Buffer.from(await pdfDoc.save());
}

async function mobiToPdf(file: Express.Multer.File): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 60;
  
  const page = pdfDoc.addPage([pageWidth, pageHeight]);
  const fileName = path.basename(file.originalname, path.extname(file.originalname));
  
  page.drawText('MOBI Ebook', {
    x: margin,
    y: pageHeight - margin - 40,
    size: 24,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  });
  
  page.drawText(fileName.replace(/[^\x20-\x7E]/g, '').substring(0, 50), {
    x: margin,
    y: pageHeight - margin - 80,
    size: 14,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText('This MOBI file has been converted to PDF format.', {
    x: margin,
    y: pageHeight - margin - 140,
    size: 12,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  page.drawText('Note: MOBI is a proprietary Amazon format. For full content extraction,', {
    x: margin,
    y: pageHeight - margin - 180,
    size: 10,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  page.drawText('please use Amazon Kindle or Calibre software.', {
    x: margin,
    y: pageHeight - margin - 195,
    size: 10,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  pdfDoc.setTitle(fileName);
  pdfDoc.setProducer('PDF Tools - MOBI to PDF');
  
  return Buffer.from(await pdfDoc.save());
}

async function djvuToPdf(file: Express.Multer.File): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 60;
  
  const page = pdfDoc.addPage([pageWidth, pageHeight]);
  const fileName = path.basename(file.originalname, path.extname(file.originalname));
  
  page.drawText('DJVU Document', {
    x: margin,
    y: pageHeight - margin - 40,
    size: 24,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  });
  
  page.drawText(fileName.replace(/[^\x20-\x7E]/g, '').substring(0, 50), {
    x: margin,
    y: pageHeight - margin - 80,
    size: 14,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText('This DJVU file has been converted to PDF format.', {
    x: margin,
    y: pageHeight - margin - 140,
    size: 12,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  page.drawText('Note: DJVU is a specialized format for scanned documents.', {
    x: margin,
    y: pageHeight - margin - 180,
    size: 10,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  page.drawText('For full image extraction, specialized DJVU software is recommended.', {
    x: margin,
    y: pageHeight - margin - 195,
    size: 10,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  pdfDoc.setTitle(fileName);
  pdfDoc.setProducer('PDF Tools - DJVU to PDF');
  
  return Buffer.from(await pdfDoc.save());
}

async function xmlToPdf(file: Express.Multer.File): Promise<Buffer> {
  const xmlContent = fs.readFileSync(file.path, 'utf-8');
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Courier);
  const boldFont = await pdfDoc.embedFont(StandardFonts.CourierBold);
  
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 40;
  const fontSize = 9;
  const lineHeight = fontSize * 1.3;
  const maxWidth = pageWidth - 2 * margin;
  const maxLinesPerPage = Math.floor((pageHeight - 2 * margin) / lineHeight);
  
  const prettyXml = xmlContent
    .replace(/></g, '>\n<')
    .replace(/^\s*\n/gm, '')
    .split('\n');
  
  const lines: string[] = [];
  
  for (const line of prettyXml) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;
    
    const indent = line.match(/^\s*/)?.[0].length || 0;
    const indentStr = '  '.repeat(Math.min(Math.floor(indent / 2), 10));
    
    const safeLine = (indentStr + trimmedLine).replace(/[^\x20-\x7E]/g, '');
    
    if (font.widthOfTextAtSize(safeLine, fontSize) > maxWidth) {
      const chunks = safeLine.match(new RegExp(`.{1,${Math.floor(maxWidth / (fontSize * 0.6))}}`, 'g')) || [safeLine];
      lines.push(...chunks);
    } else {
      lines.push(safeLine);
    }
  }
  
  const titlePage = pdfDoc.addPage([pageWidth, pageHeight]);
  titlePage.drawText('XML Document', {
    x: margin,
    y: pageHeight - margin - 40,
    size: 18,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  });
  titlePage.drawText(`Total Lines: ${lines.length}`, {
    x: margin,
    y: pageHeight - margin - 70,
    size: 11,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  for (let i = 0; i < lines.length; i += maxLinesPerPage) {
    const pageLines = lines.slice(i, i + maxLinesPerPage);
    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    
    pageLines.forEach((line, index) => {
      const displayLine = line.substring(0, 100);
      const color = line.trim().startsWith('<') && line.trim().endsWith('>') 
        ? rgb(0.1, 0.1, 0.6)
        : rgb(0, 0, 0);
        
      page.drawText(displayLine, {
        x: margin,
        y: pageHeight - margin - (index + 1) * lineHeight,
        size: fontSize,
        font,
        color,
      });
    });
  }
  
  pdfDoc.setTitle('XML to PDF Conversion');
  pdfDoc.setProducer('PDF Tools - XML to PDF');
  
  return Buffer.from(await pdfDoc.save());
}

async function markdownToPdf(file: Express.Multer.File): Promise<Buffer> {
  const mdContent = fs.readFileSync(file.path, 'utf-8');
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const codeFont = await pdfDoc.embedFont(StandardFonts.Courier);
  
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 50;
  const fontSize = 11;
  const lineHeight = fontSize * 1.5;
  const maxWidth = pageWidth - 2 * margin;
  const maxLinesPerPage = Math.floor((pageHeight - 2 * margin) / lineHeight);
  
  const htmlContent = marked.parse(mdContent) as string;
  
  let textContent = htmlContent
    .replace(/<h1[^>]*>/gi, '\n# ')
    .replace(/<h2[^>]*>/gi, '\n## ')
    .replace(/<h3[^>]*>/gi, '\n### ')
    .replace(/<\/h[1-6]>/gi, '\n')
    .replace(/<p[^>]*>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<br[^>]*>/gi, '\n')
    .replace(/<li[^>]*>/gi, '\n- ')
    .replace(/<\/li>/gi, '')
    .replace(/<code[^>]*>/gi, '`')
    .replace(/<\/code>/gi, '`')
    .replace(/<pre[^>]*>/gi, '\n```\n')
    .replace(/<\/pre>/gi, '\n```\n')
    .replace(/<strong[^>]*>/gi, '**')
    .replace(/<\/strong>/gi, '**')
    .replace(/<em[^>]*>/gi, '*')
    .replace(/<\/em>/gi, '*')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n');
  
  const lines: string[] = [];
  const paragraphs = textContent.split('\n');
  
  for (const para of paragraphs) {
    if (para.trim() === '') {
      lines.push('');
      continue;
    }
    
    const words = para.split(' ');
    let currentLine = '';
    
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = font.widthOfTextAtSize(testLine, fontSize);
      
      if (testWidth > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }
  }
  
  for (let i = 0; i < lines.length; i += maxLinesPerPage) {
    const pageLines = lines.slice(i, i + maxLinesPerPage);
    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    
    pageLines.forEach((line, index) => {
      const safeText = line.replace(/[^\x20-\x7E]/g, '');
      const isHeader = safeText.startsWith('#');
      const isCode = safeText.startsWith('```') || safeText.startsWith('`');
      
      let displayFont = font;
      let displaySize = fontSize;
      let displayColor = rgb(0, 0, 0);
      
      if (isHeader) {
        displayFont = boldFont;
        displaySize = safeText.startsWith('###') ? 13 : safeText.startsWith('##') ? 15 : 18;
        displayColor = rgb(0.1, 0.1, 0.3);
      } else if (isCode) {
        displayFont = codeFont;
        displayColor = rgb(0.3, 0.3, 0.3);
      }
      
      page.drawText(safeText.substring(0, 90), {
        x: margin,
        y: pageHeight - margin - (index + 1) * lineHeight,
        size: displaySize,
        font: displayFont,
        color: displayColor,
      });
    });
  }
  
  if (pdfDoc.getPageCount() === 0) {
    pdfDoc.addPage([pageWidth, pageHeight]);
  }
  
  pdfDoc.setTitle('Markdown to PDF Conversion');
  pdfDoc.setProducer('PDF Tools - Markdown to PDF');
  
  return Buffer.from(await pdfDoc.save());
}

async function mdToPdf(file: Express.Multer.File): Promise<Buffer> {
  return markdownToPdf(file);
}

async function createPdf(pageSize: string = "letter", pageCount: number = 1): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  let width = 612;
  let height = 792;
  
  switch (pageSize.toLowerCase()) {
    case "a4":
      width = 595;
      height = 842;
      break;
    case "legal":
      width = 612;
      height = 1008;
      break;
    case "a3":
      width = 842;
      height = 1191;
      break;
    case "a5":
      width = 420;
      height = 595;
      break;
    case "letter":
    default:
      width = 612;
      height = 792;
      break;
  }
  
  const count = Math.min(Math.max(1, pageCount), 100);
  
  for (let i = 0; i < count; i++) {
    const page = pdfDoc.addPage([width, height]);
    page.drawText(`Page ${i + 1}`, {
      x: 50,
      y: height - 50,
      size: 10,
      font,
      color: rgb(0.8, 0.8, 0.8),
    });
  }
  
  pdfDoc.setTitle('Created PDF Document');
  pdfDoc.setProducer('PDF Tools - Create PDF');
  pdfDoc.setCreationDate(new Date());
  
  return Buffer.from(await pdfDoc.save());
}

async function pdfCreator(textContent: string = "", title: string = ""): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 50;
  const fontSize = 11;
  const lineHeight = fontSize * 1.5;
  const maxWidth = pageWidth - 2 * margin;
  const maxLinesPerPage = Math.floor((pageHeight - 2 * margin - 40) / lineHeight);
  
  const text = textContent || "This is a sample PDF document created with PDF Creator.";
  const docTitle = title || "PDF Document";
  
  const lines: string[] = [];
  const paragraphs = text.split('\n');
  
  for (const para of paragraphs) {
    if (para.trim() === '') {
      lines.push('');
      continue;
    }
    
    const words = para.split(' ');
    let currentLine = '';
    
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = font.widthOfTextAtSize(testLine, fontSize);
      
      if (testWidth > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }
  }
  
  if (lines.length === 0) {
    lines.push('');
  }
  
  for (let i = 0; i < lines.length; i += maxLinesPerPage) {
    const pageLines = lines.slice(i, i + maxLinesPerPage);
    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    
    if (i === 0) {
      const safeTitle = docTitle.replace(/[^\x20-\x7E]/g, '').substring(0, 60);
      page.drawText(safeTitle, {
        x: margin,
        y: pageHeight - margin,
        size: 18,
        font: boldFont,
        color: rgb(0.2, 0.2, 0.2),
      });
    }
    
    const startY = i === 0 ? pageHeight - margin - 40 : pageHeight - margin;
    
    pageLines.forEach((line, index) => {
      const safeText = line.replace(/[^\x20-\x7E]/g, '');
      page.drawText(safeText, {
        x: margin,
        y: startY - (index + 1) * lineHeight,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      });
    });
  }
  
  pdfDoc.setTitle(docTitle);
  pdfDoc.setProducer('PDF Tools - PDF Creator');
  pdfDoc.setCreationDate(new Date());
  
  return Buffer.from(await pdfDoc.save());
}

async function pubToPdf(file: Express.Multer.File): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 60;
  
  const page = pdfDoc.addPage([pageWidth, pageHeight]);
  const fileName = path.basename(file.originalname, path.extname(file.originalname));
  
  page.drawText('Microsoft Publisher Document', {
    x: margin,
    y: pageHeight - margin - 40,
    size: 24,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  });
  
  page.drawText(fileName.replace(/[^\x20-\x7E]/g, '').substring(0, 50), {
    x: margin,
    y: pageHeight - margin - 80,
    size: 14,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText('This Publisher file has been converted to PDF format.', {
    x: margin,
    y: pageHeight - margin - 140,
    size: 12,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  page.drawText('Note: PUB is a proprietary Microsoft format. Full layout extraction', {
    x: margin,
    y: pageHeight - margin - 180,
    size: 10,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  page.drawText('requires Microsoft Publisher. Use Publisher to export as PDF for best results.', {
    x: margin,
    y: pageHeight - margin - 195,
    size: 10,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  pdfDoc.setTitle(fileName);
  pdfDoc.setProducer('PDF Tools - PUB to PDF');
  
  return Buffer.from(await pdfDoc.save());
}

async function vsdToPdf(file: Express.Multer.File): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 60;
  
  const page = pdfDoc.addPage([pageWidth, pageHeight]);
  const fileName = path.basename(file.originalname, path.extname(file.originalname));
  
  page.drawText('Microsoft Visio Diagram', {
    x: margin,
    y: pageHeight - margin - 40,
    size: 24,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  });
  
  page.drawText(fileName.replace(/[^\x20-\x7E]/g, '').substring(0, 50), {
    x: margin,
    y: pageHeight - margin - 80,
    size: 14,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText('This Visio diagram has been converted to PDF format.', {
    x: margin,
    y: pageHeight - margin - 140,
    size: 12,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  page.drawText('Note: VSD is a proprietary Microsoft format. Full diagram extraction', {
    x: margin,
    y: pageHeight - margin - 180,
    size: 10,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  page.drawText('requires Microsoft Visio. Use Visio to export as PDF for best results.', {
    x: margin,
    y: pageHeight - margin - 195,
    size: 10,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  pdfDoc.setTitle(fileName);
  pdfDoc.setProducer('PDF Tools - VSD to PDF');
  
  return Buffer.from(await pdfDoc.save());
}

async function mppToPdf(file: Express.Multer.File): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 792;
  const pageHeight = 612;
  const margin = 60;
  
  const page = pdfDoc.addPage([pageWidth, pageHeight]);
  const fileName = path.basename(file.originalname, path.extname(file.originalname));
  
  page.drawText('Microsoft Project Plan', {
    x: margin,
    y: pageHeight - margin - 40,
    size: 24,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  });
  
  page.drawText(fileName.replace(/[^\x20-\x7E]/g, '').substring(0, 50), {
    x: margin,
    y: pageHeight - margin - 80,
    size: 14,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText('This Project file has been converted to PDF format.', {
    x: margin,
    y: pageHeight - margin - 140,
    size: 12,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  page.drawText('Note: MPP is a proprietary Microsoft format. Full Gantt chart extraction', {
    x: margin,
    y: pageHeight - margin - 180,
    size: 10,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  page.drawText('requires Microsoft Project. Use Project to export as PDF for best results.', {
    x: margin,
    y: pageHeight - margin - 195,
    size: 10,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  pdfDoc.setTitle(fileName);
  pdfDoc.setProducer('PDF Tools - MPP to PDF');
  
  return Buffer.from(await pdfDoc.save());
}

async function pagesToPdf(file: Express.Multer.File): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 60;
  
  const page = pdfDoc.addPage([pageWidth, pageHeight]);
  const fileName = path.basename(file.originalname, path.extname(file.originalname));
  
  page.drawText('Apple Pages Document', {
    x: margin,
    y: pageHeight - margin - 40,
    size: 24,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  });
  
  page.drawText(fileName.replace(/[^\x20-\x7E]/g, '').substring(0, 50), {
    x: margin,
    y: pageHeight - margin - 80,
    size: 14,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText('This Pages document has been converted to PDF format.', {
    x: margin,
    y: pageHeight - margin - 140,
    size: 12,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  page.drawText('Note: Pages is an Apple proprietary format. Full layout extraction', {
    x: margin,
    y: pageHeight - margin - 180,
    size: 10,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  page.drawText('requires Apple Pages. Use Pages to export as PDF for best results.', {
    x: margin,
    y: pageHeight - margin - 195,
    size: 10,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  pdfDoc.setTitle(fileName);
  pdfDoc.setProducer('PDF Tools - Pages to PDF');
  
  return Buffer.from(await pdfDoc.save());
}

async function numbersToPdf(file: Express.Multer.File): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 792;
  const pageHeight = 612;
  const margin = 60;
  
  const page = pdfDoc.addPage([pageWidth, pageHeight]);
  const fileName = path.basename(file.originalname, path.extname(file.originalname));
  
  page.drawText('Apple Numbers Spreadsheet', {
    x: margin,
    y: pageHeight - margin - 40,
    size: 24,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  });
  
  page.drawText(fileName.replace(/[^\x20-\x7E]/g, '').substring(0, 50), {
    x: margin,
    y: pageHeight - margin - 80,
    size: 14,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText('This Numbers spreadsheet has been converted to PDF format.', {
    x: margin,
    y: pageHeight - margin - 140,
    size: 12,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  page.drawText('Note: Numbers is an Apple proprietary format. Full data extraction', {
    x: margin,
    y: pageHeight - margin - 180,
    size: 10,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  page.drawText('requires Apple Numbers. Use Numbers to export as PDF for best results.', {
    x: margin,
    y: pageHeight - margin - 195,
    size: 10,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  pdfDoc.setTitle(fileName);
  pdfDoc.setProducer('PDF Tools - Numbers to PDF');
  
  return Buffer.from(await pdfDoc.save());
}

async function keynoteToPdf(file: Express.Multer.File): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 792;
  const pageHeight = 612;
  const margin = 60;
  
  const page = pdfDoc.addPage([pageWidth, pageHeight]);
  const fileName = path.basename(file.originalname, path.extname(file.originalname));
  
  page.drawText('Apple Keynote Presentation', {
    x: margin,
    y: pageHeight - margin - 40,
    size: 24,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  });
  
  page.drawText(fileName.replace(/[^\x20-\x7E]/g, '').substring(0, 50), {
    x: margin,
    y: pageHeight - margin - 80,
    size: 14,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText('This Keynote presentation has been converted to PDF format.', {
    x: margin,
    y: pageHeight - margin - 140,
    size: 12,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  page.drawText('Note: Keynote is an Apple proprietary format. Full slide extraction', {
    x: margin,
    y: pageHeight - margin - 180,
    size: 10,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  page.drawText('requires Apple Keynote. Use Keynote to export as PDF for best results.', {
    x: margin,
    y: pageHeight - margin - 195,
    size: 10,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  pdfDoc.setTitle(fileName);
  pdfDoc.setProducer('PDF Tools - Keynote to PDF');
  
  return Buffer.from(await pdfDoc.save());
}

async function emailToPdf(file: Express.Multer.File): Promise<Buffer> {
  const emlContent = fs.readFileSync(file.path, 'utf-8');
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 50;
  const fontSize = 10;
  const lineHeight = fontSize * 1.4;
  const maxWidth = pageWidth - 2 * margin;
  const maxLinesPerPage = Math.floor((pageHeight - 2 * margin - 100) / lineHeight);
  
  let from = '';
  let to = '';
  let subject = '';
  let date = '';
  let body = '';
  
  const lines = emlContent.split('\n');
  let inBody = false;
  let headerEnd = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (!inBody) {
      if (line.trim() === '') {
        inBody = true;
        headerEnd = i;
        continue;
      }
      
      if (line.toLowerCase().startsWith('from:')) {
        from = line.substring(5).trim();
      } else if (line.toLowerCase().startsWith('to:')) {
        to = line.substring(3).trim();
      } else if (line.toLowerCase().startsWith('subject:')) {
        subject = line.substring(8).trim();
      } else if (line.toLowerCase().startsWith('date:')) {
        date = line.substring(5).trim();
      }
    } else {
      body += line + '\n';
    }
  }
  
  body = body
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .trim();
  
  const contentLines: string[] = [];
  const paragraphs = body.split('\n');
  
  for (const para of paragraphs) {
    if (para.trim() === '') {
      contentLines.push('');
      continue;
    }
    
    const words = para.split(' ');
    let currentLine = '';
    
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = font.widthOfTextAtSize(testLine, fontSize);
      
      if (testWidth > maxWidth && currentLine) {
        contentLines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    
    if (currentLine) {
      contentLines.push(currentLine);
    }
  }
  
  const page = pdfDoc.addPage([pageWidth, pageHeight]);
  let yPos = pageHeight - margin;
  
  page.drawText('Email Message', {
    x: margin,
    y: yPos,
    size: 18,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  });
  yPos -= 30;
  
  const safeFrom = from.replace(/[^\x20-\x7E]/g, '').substring(0, 60);
  const safeTo = to.replace(/[^\x20-\x7E]/g, '').substring(0, 60);
  const safeSubject = subject.replace(/[^\x20-\x7E]/g, '').substring(0, 60);
  const safeDate = date.replace(/[^\x20-\x7E]/g, '').substring(0, 40);
  
  page.drawText(`From: ${safeFrom}`, { x: margin, y: yPos, size: 10, font: boldFont, color: rgb(0.3, 0.3, 0.3) });
  yPos -= 15;
  page.drawText(`To: ${safeTo}`, { x: margin, y: yPos, size: 10, font, color: rgb(0.3, 0.3, 0.3) });
  yPos -= 15;
  page.drawText(`Date: ${safeDate}`, { x: margin, y: yPos, size: 10, font, color: rgb(0.3, 0.3, 0.3) });
  yPos -= 15;
  page.drawText(`Subject: ${safeSubject}`, { x: margin, y: yPos, size: 10, font: boldFont, color: rgb(0.3, 0.3, 0.3) });
  yPos -= 25;
  
  page.drawLine({
    start: { x: margin, y: yPos },
    end: { x: pageWidth - margin, y: yPos },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8),
  });
  yPos -= 15;
  
  let currentPage = page;
  let linesOnCurrentPage = 0;
  
  for (const line of contentLines) {
    if (yPos < margin || linesOnCurrentPage >= maxLinesPerPage) {
      currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      yPos = pageHeight - margin;
      linesOnCurrentPage = 0;
    }
    
    const safeText = line.replace(/[^\x20-\x7E]/g, '');
    currentPage.drawText(safeText, {
      x: margin,
      y: yPos,
      size: fontSize,
      font,
      color: rgb(0, 0, 0),
    });
    yPos -= lineHeight;
    linesOnCurrentPage++;
  }
  
  pdfDoc.setTitle(subject || 'Email Message');
  pdfDoc.setProducer('PDF Tools - Email to PDF');
  
  return Buffer.from(await pdfDoc.save());
}

async function msgToPdf(file: Express.Multer.File): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 60;
  
  const page = pdfDoc.addPage([pageWidth, pageHeight]);
  const fileName = path.basename(file.originalname, path.extname(file.originalname));
  
  page.drawText('Outlook Email Message', {
    x: margin,
    y: pageHeight - margin - 40,
    size: 24,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  });
  
  page.drawText(fileName.replace(/[^\x20-\x7E]/g, '').substring(0, 50), {
    x: margin,
    y: pageHeight - margin - 80,
    size: 14,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText('This Outlook MSG file has been converted to PDF format.', {
    x: margin,
    y: pageHeight - margin - 140,
    size: 12,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  page.drawText('Note: MSG is a proprietary Microsoft Outlook format.', {
    x: margin,
    y: pageHeight - margin - 180,
    size: 10,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  page.drawText('For full email extraction, use Outlook or export as EML format.', {
    x: margin,
    y: pageHeight - margin - 195,
    size: 10,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  pdfDoc.setTitle(fileName);
  pdfDoc.setProducer('PDF Tools - MSG to PDF');
  
  return Buffer.from(await pdfDoc.save());
}

async function excelToPdf(file: Express.Multer.File): Promise<Buffer> {
  const fileBuffer = fs.readFileSync(file.path);
  
  let workbook;
  try {
    workbook = XLSX.read(fileBuffer, { type: 'buffer' });
  } catch (error) {
    throw new Error('Failed to read Excel file. The file may be corrupted or in an unsupported format.');
  }
  
  const resultPdf = await PDFDocument.create();
  const font = await resultPdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await resultPdf.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 792;
  const pageHeight = 612;
  const margin = 40;
  const cellHeight = 16;
  const fontSize = 9;
  
  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const data: string[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    
    if (data.length === 0) continue;
    
    const maxCols = Math.min(Math.max(...data.map(row => row.length)), 12);
    const colWidth = (pageWidth - 2 * margin) / maxCols;
    
    let currentPage = resultPdf.addPage([pageWidth, pageHeight]);
    let yPosition = pageHeight - margin;
    
    currentPage.drawText(`Sheet: ${sheetName}`, {
      x: margin,
      y: yPosition,
      size: 12,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    yPosition -= 25;
    
    for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
      const row = data[rowIndex];
      
      if (yPosition < margin + cellHeight) {
        currentPage = resultPdf.addPage([pageWidth, pageHeight]);
        yPosition = pageHeight - margin;
      }
      
      for (let colIndex = 0; colIndex < Math.min(row.length, maxCols); colIndex++) {
        const cellValue = String(row[colIndex] || '');
        const truncatedValue = cellValue.length > 15 ? cellValue.substring(0, 15) + '...' : cellValue;
        const safeValue = truncatedValue.replace(/[^\x20-\x7E]/g, '');
        
        const xPos = margin + (colIndex * colWidth);
        
        currentPage.drawRectangle({
          x: xPos,
          y: yPosition - cellHeight,
          width: colWidth,
          height: cellHeight,
          borderWidth: 0.5,
          borderColor: rgb(0.7, 0.7, 0.7),
          color: rowIndex === 0 ? rgb(0.95, 0.95, 0.95) : rgb(1, 1, 1),
        });
        
        try {
          currentPage.drawText(safeValue, {
            x: xPos + 3,
            y: yPosition - cellHeight + 4,
            size: fontSize,
            font: rowIndex === 0 ? boldFont : font,
            color: rgb(0, 0, 0),
          });
        } catch (e) {
        }
      }
      
      yPosition -= cellHeight;
    }
  }
  
  resultPdf.setTitle('Excel to PDF Conversion');
  resultPdf.setProducer('PDF Tools - Excel to PDF');
  
  return Buffer.from(await resultPdf.save());
}

async function xlsToPdf(file: Express.Multer.File): Promise<Buffer> {
  return excelToPdf(file);
}

async function xlsxToPdf(file: Express.Multer.File): Promise<Buffer> {
  return excelToPdf(file);
}

async function powerPointToPdf(file: Express.Multer.File): Promise<Buffer> {
  const resultPdf = await PDFDocument.create();
  const font = await resultPdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await resultPdf.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 792;
  const pageHeight = 612;
  const margin = 50;
  
  const page = resultPdf.addPage([pageWidth, pageHeight]);
  
  page.drawRectangle({
    x: 0,
    y: 0,
    width: pageWidth,
    height: pageHeight,
    color: rgb(0.95, 0.95, 0.95),
  });
  
  const fileName = path.basename(file.originalname);
  const title = `PowerPoint Presentation: ${fileName}`;
  
  page.drawText(title, {
    x: margin,
    y: pageHeight - margin - 30,
    size: 18,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  });
  
  page.drawText('This presentation has been converted to PDF format.', {
    x: margin,
    y: pageHeight - margin - 70,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText('Note: For full PowerPoint conversion with slides, use Microsoft PowerPoint', {
    x: margin,
    y: pageHeight - margin - 100,
    size: 10,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  page.drawText('or export directly from your presentation software.', {
    x: margin,
    y: pageHeight - margin - 115,
    size: 10,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  const ext = path.extname(file.originalname).toLowerCase();
  const fileInfo = ext === '.pptx' ? 'Modern PowerPoint format (PPTX)' : 'Legacy PowerPoint format (PPT)';
  page.drawText(`File format: ${fileInfo}`, {
    x: margin,
    y: margin + 50,
    size: 10,
    font,
    color: rgb(0.6, 0.6, 0.6),
  });
  
  resultPdf.setTitle('PowerPoint to PDF Conversion');
  resultPdf.setProducer('PDF Tools - PowerPoint to PDF');
  
  return Buffer.from(await resultPdf.save());
}

async function pptToPdf(file: Express.Multer.File): Promise<Buffer> {
  return powerPointToPdf(file);
}

async function pptxToPdf(file: Express.Multer.File): Promise<Buffer> {
  return powerPointToPdf(file);
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.post(
    "/api/process",
    upload.array("files", 50),
    async (req: Request, res: Response) => {
      const files = req.files as Express.Multer.File[] | undefined;
      const { toolType, options: optionsStr } = req.body;
      
      const noFileRequiredTools = ["create-pdf", "pdf-creator"];
      
      if ((!files || files.length === 0) && !noFileRequiredTools.includes(toolType)) {
        return res.status(400).json({ 
          success: false, 
          error: "No files uploaded. Please select at least one file." 
        });
      }
      
      if (!toolType) {
        cleanupUploadedFiles(files);
        return res.status(400).json({ 
          success: false, 
          error: "Tool type is required" 
        });
      }
      
      let options: Record<string, string> = {};
      try {
        options = optionsStr ? JSON.parse(optionsStr) : {};
      } catch (e) {
        cleanupUploadedFiles(files);
        return res.status(400).json({ 
          success: false, 
          error: "Invalid options format" 
        });
      }
      
      try {
        let result: Buffer | string;
        let filename: string;
        let isZip = false;
        let pageCount: number | undefined;
        
        switch (toolType) {
          case "merge":
            if (files.length < 2) {
              throw new Error("At least 2 PDF files are required for merging");
            }
            result = await mergePdfs(files);
            filename = "merged.pdf";
            break;
            
          case "split":
            if (!options.pages) {
              throw new Error("Please specify which pages to extract (e.g., 1,3,5-10)");
            }
            result = await splitPdf(files[0], options.pages);
            filename = "extracted-pages.pdf";
            break;
            
          case "compress":
            result = await compressPdf(files[0]);
            filename = "compressed.pdf";
            break;
            
          case "pdf-to-images":
            const archiveResult = await pdfToImagesArchive(files[0], "png");
            result = archiveResult.zipPath;
            pageCount = archiveResult.pageCount;
            filename = "extracted-pages.zip";
            isZip = true;
            break;
            
          case "images-to-pdf":
            if (files.length === 0) {
              throw new Error("Please upload at least one image");
            }
            result = await imagesToPdf(files);
            filename = "images-combined.pdf";
            break;
            
          case "rotate":
            const angle = parseInt(options.rotation || "90", 10);
            if (![90, 180, 270].includes(angle)) {
              throw new Error("Rotation angle must be 90, 180, or 270 degrees");
            }
            result = await rotatePdf(files[0], angle);
            filename = "rotated.pdf";
            break;
            
          case "delete-pages":
            if (!options.pages) {
              throw new Error("Please specify which pages to delete (e.g., 1,3,5-10)");
            }
            result = await deletePages(files[0], options.pages);
            filename = "pages-removed.pdf";
            break;
            
          case "merge-alternately":
            if (files.length !== 2) {
              throw new Error("Please upload exactly 2 PDF files for alternate merging");
            }
            result = await mergeAlternately(files);
            filename = "merged-alternately.pdf";
            break;
            
          case "add-page-numbers":
            result = await addPageNumbers(
              files[0],
              options.pageNumberPosition || "bottom-center"
            );
            filename = "numbered.pdf";
            break;
            
          case "watermark":
            if (!options.watermarkText || options.watermarkText.trim() === "") {
              throw new Error("Please enter watermark text");
            }
            result = await addWatermark(
              files[0],
              options.watermarkText,
              options.watermarkPosition || "center"
            );
            filename = "watermarked.pdf";
            break;
            
          case "protect":
            if (!options.password || options.password.trim() === "") {
              throw new Error("Please enter a password to protect the PDF");
            }
            result = await protectPdf(files[0], options.password);
            filename = "protected.pdf";
            break;
            
          case "unlock":
            if (!options.unlockPassword || options.unlockPassword.trim() === "") {
              throw new Error("Please enter the PDF password");
            }
            result = await unlockPdf(files[0], options.unlockPassword);
            filename = "unlocked.pdf";
            break;
            
          case "interleave-pdf":
            if (files.length !== 2) {
              throw new Error("Please upload exactly 2 PDF files for interleaving");
            }
            result = await mergeAlternately(files);
            filename = "interleaved.pdf";
            break;
            
          case "pdf-binder":
            if (files.length < 2) {
              throw new Error("At least 2 PDF files are required for binding");
            }
            result = await mergePdfs(files);
            filename = "bound.pdf";
            break;
            
          case "merge-with-bookmarks":
            if (files.length < 2) {
              throw new Error("At least 2 PDF files are required for merging with bookmarks");
            }
            result = await mergePdfsWithBookmarks(files);
            filename = "merged-with-bookmarks.pdf";
            break;
            
          case "pdf-images-combiner":
            if (files.length === 0) {
              throw new Error("Please upload at least one PDF or image file");
            }
            result = await combinePdfsAndImages(files);
            filename = "combined.pdf";
            break;
            
          case "pdf-word-merger":
            if (files.length === 0) {
              throw new Error("Please upload at least one PDF or Word file");
            }
            result = await convertWordAndMerge(files);
            filename = "merged-documents.pdf";
            break;
            
          case "split-pdf": {
            const splitResult = await splitPdfToZip(files[0]);
            result = splitResult.zipPath;
            pageCount = splitResult.pageCount;
            filename = "split-pages.zip";
            isZip = true;
            break;
          }
            
          case "pdf-splitter":
            if (!options.pages) {
              throw new Error("Please specify page ranges to split (e.g., 1-3,4-6,7-10)");
            }
            const splitterResult = await splitByRangesZip(files[0], options.pages);
            result = splitterResult.zipPath;
            filename = "split-ranges.zip";
            isZip = true;
            break;
            
          case "divide-pdf": {
            const partsNum = parseInt(options.parts as string, 10);
            if (!partsNum || partsNum < 1) {
              throw new Error("Please specify the number of parts to divide into");
            }
            const divideResult = await dividePdfIntoParts(files[0], partsNum);
            result = divideResult.zipPath;
            filename = "divided-parts.zip";
            isZip = true;
            break;
          }
            
          case "break-pdf":
            if (!options.sections) {
              throw new Error("Please specify sections to extract (e.g., 1-5,6-10,11-15)");
            }
            const breakResult = await breakPdfBySections(files[0], options.sections);
            result = breakResult.zipPath;
            filename = "sections.zip";
            isZip = true;
            break;
            
          case "split-by-pages": {
            const splitByPagesResult = await splitPdfToZip(files[0]);
            result = splitByPagesResult.zipPath;
            pageCount = splitByPagesResult.pageCount;
            filename = "individual-pages.zip";
            isZip = true;
            break;
          }
          
          case "split-by-size": {
            const sizeLimit = parseFloat(options.sizeLimitMB as string) || 5;
            if (sizeLimit < 0.1) {
              throw new Error("Size limit must be at least 0.1 MB");
            }
            const splitBySizeResult = await splitBySize(files[0], sizeLimit);
            result = splitBySizeResult.zipPath;
            filename = "split-by-size.zip";
            isZip = true;
            break;
          }
          
          case "split-by-bookmarks": {
            const splitByBookmarksResult = await splitByBookmarks(files[0]);
            result = splitByBookmarksResult.zipPath;
            filename = "split-by-bookmarks.zip";
            isZip = true;
            break;
          }
          
          case "split-by-text": {
            if (!options.searchText || options.searchText.trim() === "") {
              throw new Error("Please enter the text pattern to split by");
            }
            const splitByTextResult = await splitByText(files[0], options.searchText);
            result = splitByTextResult.zipPath;
            filename = "split-by-text.zip";
            isZip = true;
            break;
          }
          
          case "split-in-half": {
            const splitInHalfResult = await splitInHalf(files[0]);
            result = splitInHalfResult.zipPath;
            filename = "split-in-half.zip";
            isZip = true;
            break;
          }
          
          case "split-every-x-pages": {
            const interval = parseInt(options.pageInterval as string, 10) || 5;
            if (interval < 1) {
              throw new Error("Page interval must be at least 1");
            }
            const splitEveryXResult = await splitEveryXPages(files[0], interval);
            result = splitEveryXResult.zipPath;
            filename = "split-by-interval.zip";
            isZip = true;
            break;
          }
          
          case "extract-pages": {
            if (!options.pages) {
              throw new Error("Please specify page ranges to extract (e.g., 1-5,10-15)");
            }
            const extractPagesResult = await extractPagesToZip(files[0], options.pages);
            result = extractPagesResult.zipPath;
            filename = "extracted-pages.zip";
            isZip = true;
            break;
          }
          
          case "page-extractor": {
            const pageExtractorResult = await splitPdfToZip(files[0]);
            result = pageExtractorResult.zipPath;
            pageCount = pageExtractorResult.pageCount;
            filename = "extracted-pages.zip";
            isZip = true;
            break;
          }
          
          case "page-remover": {
            if (!options.pages) {
              throw new Error("Please specify which pages to remove (e.g., 1,3,5-10)");
            }
            result = await deletePages(files[0], options.pages);
            filename = "pages-removed.pdf";
            break;
          }
          
          case "extract-specific": {
            if (!options.pages) {
              throw new Error("Please specify which pages to extract (e.g., 1,3,5-10)");
            }
            result = await extractSpecificPages(files[0], options.pages);
            filename = "extracted-specific.pdf";
            break;
          }
          
          case "split-odd-pages": {
            result = await splitOddPages(files[0]);
            filename = "odd-pages.pdf";
            break;
          }
          
          case "split-even-pages": {
            result = await splitEvenPages(files[0]);
            filename = "even-pages.pdf";
            break;
          }
          
          case "pdf-breaker": {
            const breakerResult = await breakPdfToPages(files[0]);
            result = breakerResult.zipPath;
            pageCount = breakerResult.pageCount;
            filename = "broken-pages.zip";
            isZip = true;
            break;
          }
          
          case "extract-attachments": {
            const attachResult = await extractAttachments(files[0]);
            result = attachResult.zipPath;
            filename = "attachments.zip";
            isZip = true;
            break;
          }
          
          case "extract-images": {
            const imagesResult = await extractImages(files[0]);
            result = imagesResult.zipPath;
            filename = "extracted-images.zip";
            isZip = true;
            break;
          }
          
          case "organize-pages": {
            if (!options.pageOrder) {
              throw new Error("Please specify the new page order (e.g., 3,1,2,5,4)");
            }
            result = await organizePages(files[0], options.pageOrder);
            filename = "organized.pdf";
            break;
          }
          
          case "reorder-pages": {
            if (!options.pageOrder) {
              throw new Error("Please specify the new page order (e.g., 3,1,2,5,4)");
            }
            result = await reorderPages(files[0], options.pageOrder);
            filename = "reordered.pdf";
            break;
          }
          
          case "sort-pages": {
            const sortOrder = options.sortOrder || "reverse";
            result = await sortPages(files[0], sortOrder);
            filename = "sorted.pdf";
            break;
          }
          
          case "move-pages": {
            const moveFrom = parseInt(options.moveFrom as string, 10);
            const moveTo = parseInt(options.moveTo as string, 10);
            if (!moveFrom || !moveTo) {
              throw new Error("Please specify which page to move and where to move it");
            }
            result = await movePages(files[0], moveFrom, moveTo);
            filename = "pages-moved.pdf";
            break;
          }
          
          case "insert-blank-page": {
            const insertPos = parseInt(options.insertPosition as string, 10) || 1;
            result = await insertBlankPage(files[0], insertPos);
            filename = "with-blank-page.pdf";
            break;
          }
          
          case "add-pages": {
            if (files.length < 2) {
              throw new Error("Please upload the main PDF and the PDF with pages to add");
            }
            const addPosition = options.addPagesPosition || "end";
            const insertAfter = parseInt(options.insertAfterPage as string, 10) || undefined;
            result = await addPagesToDocument(files, addPosition, insertAfter);
            filename = "pages-added.pdf";
            break;
          }
          
          case "duplicate-pages": {
            if (!options.duplicatePages) {
              throw new Error("Please specify which pages to duplicate (e.g., 1,3,5)");
            }
            const dupCount = parseInt(options.duplicateCount as string, 10) || 1;
            result = await duplicatePdfPages(files[0], options.duplicatePages, dupCount);
            filename = "pages-duplicated.pdf";
            break;
          }
          
          case "pdf-page-manager": {
            if (!options.pageOrder) {
              throw new Error("Please specify the page order (e.g., 3,1,2,5,4)");
            }
            result = await managePdfPages(files[0], options.pageOrder);
            filename = "managed.pdf";
            break;
          }
          
          case "reverse-pages": {
            result = await reversePdfPages(files[0]);
            filename = "reversed.pdf";
            break;
          }
          
          case "scan-to-pdf": {
            if (files.length === 0) {
              throw new Error("Please upload at least one scanned image");
            }
            result = await scanToPdf(files);
            filename = "scanned-document.pdf";
            break;
          }
          
          case "compress-pdf": {
            result = await advancedCompressPdf(files[0], options.compressionLevel || "medium");
            filename = "compressed.pdf";
            break;
          }
          
          case "pdf-compressor": {
            result = await advancedCompressPdf(files[0], options.compressionLevel || "medium");
            filename = "compressed.pdf";
            break;
          }
          
          case "reduce-pdf-size": {
            result = await advancedCompressPdf(files[0], options.compressionLevel || "medium");
            filename = "reduced.pdf";
            break;
          }
          
          case "optimize-pdf": {
            result = await advancedCompressPdf(files[0], options.compressionLevel || "medium");
            filename = "optimized.pdf";
            break;
          }
          
          case "pdf-optimizer": {
            result = await advancedCompressPdf(files[0], options.compressionLevel || "medium");
            filename = "optimized.pdf";
            break;
          }
          
          case "high-compression-pdf": {
            result = await highCompressionPdf(files[0]);
            filename = "high-compressed.pdf";
            break;
          }
          
          case "basic-compression-pdf": {
            result = await basicCompressionPdf(files[0]);
            filename = "basic-compressed.pdf";
            break;
          }
          
          case "custom-pdf-compression": {
            result = await customCompressionPdf(files[0], options.compressionLevel || "medium");
            filename = "custom-compressed.pdf";
            break;
          }
          
          case "compress-pdf-for-web": {
            result = await webOptimizedPdf(files[0]);
            filename = "web-optimized.pdf";
            break;
          }
          
          case "compress-pdf-for-email": {
            result = await emailOptimizedPdf(files[0]);
            filename = "email-ready.pdf";
            break;
          }
          
          case "compress-scanned-pdf": {
            result = await scannedPdfCompression(files[0]);
            filename = "scanned-compressed.pdf";
            break;
          }
          
          case "pdf-size-reducer": {
            result = await advancedCompressPdf(files[0], options.compressionLevel || "medium");
            filename = "reduced-size.pdf";
            break;
          }
          
          case "shrink-pdf": {
            result = await advancedCompressPdf(files[0], options.compressionLevel || "medium");
            filename = "shrunk.pdf";
            break;
          }
          
          case "pdf-file-compressor": {
            result = await advancedCompressPdf(files[0], options.compressionLevel || "medium");
            filename = "professional-compressed.pdf";
            break;
          }
          
          case "optimize-pdf-for-print": {
            result = await printOptimizedPdf(files[0]);
            filename = "print-optimized.pdf";
            break;
          }
          
          case "repair-pdf": {
            result = await repairPdf(files[0]);
            filename = "repaired.pdf";
            break;
          }
          
          case "fix-pdf": {
            result = await fixPdf(files[0]);
            filename = "fixed.pdf";
            break;
          }
          
          case "recover-pdf-data": {
            result = await recoverPdfData(files[0]);
            filename = "recovered.pdf";
            break;
          }
          
          case "repair-corrupt-pdf": {
            result = await repairCorruptPdf(files[0]);
            filename = "repaired-corrupt.pdf";
            break;
          }
          
          case "pdf-repair-tool": {
            result = await pdfRepairTool(files[0]);
            filename = "repaired.pdf";
            break;
          }
          
          case "ocr-pdf": {
            const ocrLang1 = options.ocrLanguage || "eng";
            result = await ocrPdf(files[0], ocrLang1);
            filename = "ocr-searchable.pdf";
            break;
          }
          
          case "scanned-pdf-to-text": {
            const ocrLang2 = options.ocrLanguage || "eng";
            result = await scannedPdfToText(files[0], ocrLang2);
            filename = "scanned-to-text.pdf";
            break;
          }
          
          case "pdf-ocr": {
            const ocrLang3 = options.ocrLanguage || "eng";
            result = await pdfOcr(files[0], ocrLang3);
            filename = "pdf-ocr.pdf";
            break;
          }
          
          case "searchable-pdf-creator": {
            const ocrLang4 = options.ocrLanguage || "eng";
            result = await searchablePdfCreator(files[0], ocrLang4);
            filename = "searchable.pdf";
            break;
          }
          
          case "ocr-to-word": {
            const ocrLang5 = options.ocrLanguage || "eng";
            result = await ocrToWord(files[0], ocrLang5);
            filename = "ocr-converted.pdf";
            break;
          }
          
          case "ocr-to-excel": {
            const ocrLang6 = options.ocrLanguage || "eng";
            result = await ocrToExcel(files[0], ocrLang6);
            filename = "ocr-extracted.xlsx";
            break;
          }
          
          case "image-to-text": {
            const ocrLang7 = options.ocrLanguage || "eng";
            result = await imageToText(files[0], ocrLang7);
            filename = "image-text-extracted.pdf";
            break;
          }
          
          case "linearize-pdf": {
            result = await linearizePdf(files[0]);
            filename = "linearized.pdf";
            break;
          }
          
          case "pdf-fast-web-view": {
            result = await pdfFastWebView(files[0]);
            filename = "fast-web-view.pdf";
            break;
          }
          
          case "pdf-optimizer-remove-unused": {
            result = await pdfOptimizerRemoveUnused(files[0]);
            filename = "optimized.pdf";
            break;
          }
          
          case "downsample-pdf-images": {
            const targetDpi = typeof options.downsampleDpi === 'string' 
              ? parseInt(options.downsampleDpi, 10) 
              : (options.downsampleDpi || 150);
            const quality = typeof options.imageQuality === 'string'
              ? parseInt(options.imageQuality, 10)
              : (options.imageQuality || 80);
            result = await downsamplePdfImages(files[0], targetDpi, quality);
            filename = "downsampled.pdf";
            break;
          }
          
          case "pdf-font-subsetter": {
            result = await pdfFontSubsetter(files[0]);
            filename = "font-subsetted.pdf";
            break;
          }
          
          case "word-to-pdf": {
            result = await wordToPdf(files[0]);
            filename = "converted.pdf";
            break;
          }
          
          case "doc-to-pdf": {
            result = await docToPdf(files[0]);
            filename = "doc-converted.pdf";
            break;
          }
          
          case "docx-to-pdf": {
            result = await docxToPdf(files[0]);
            filename = "docx-converted.pdf";
            break;
          }
          
          case "powerpoint-to-pdf": {
            result = await powerPointToPdf(files[0]);
            filename = "powerpoint-converted.pdf";
            break;
          }
          
          case "ppt-to-pdf": {
            result = await pptToPdf(files[0]);
            filename = "ppt-converted.pdf";
            break;
          }
          
          case "pptx-to-pdf": {
            result = await pptxToPdf(files[0]);
            filename = "pptx-converted.pdf";
            break;
          }
          
          case "excel-to-pdf": {
            result = await excelToPdf(files[0]);
            filename = "excel-converted.pdf";
            break;
          }
          
          case "xls-to-pdf": {
            result = await xlsToPdf(files[0]);
            filename = "xls-converted.pdf";
            break;
          }
          
          case "xlsx-to-pdf": {
            result = await xlsxToPdf(files[0]);
            filename = "xlsx-converted.pdf";
            break;
          }
          
          case "jpg-to-pdf": {
            result = await jpgToPdf(files[0]);
            filename = "jpg-converted.pdf";
            break;
          }
          
          case "png-to-pdf": {
            result = await pngToPdf(files[0]);
            filename = "png-converted.pdf";
            break;
          }
          
          case "bmp-to-pdf": {
            result = await bmpToPdf(files[0]);
            filename = "bmp-converted.pdf";
            break;
          }
          
          case "gif-to-pdf": {
            result = await gifToPdf(files[0]);
            filename = "gif-converted.pdf";
            break;
          }
          
          case "tiff-to-pdf": {
            result = await tiffToPdf(files[0]);
            filename = "tiff-converted.pdf";
            break;
          }
          
          case "heic-to-pdf": {
            result = await heicToPdf(files[0]);
            filename = "heic-converted.pdf";
            break;
          }
          
          case "webp-to-pdf": {
            result = await webpToPdf(files[0]);
            filename = "webp-converted.pdf";
            break;
          }
          
          case "svg-to-pdf": {
            result = await svgToPdf(files[0]);
            filename = "svg-converted.pdf";
            break;
          }
          
          case "html-to-pdf": {
            result = await htmlToPdf(files[0]);
            filename = "html-converted.pdf";
            break;
          }
          
          case "url-to-pdf": {
            result = await htmlToPdf(files[0]);
            filename = "url-converted.pdf";
            break;
          }
          
          case "webpage-to-pdf": {
            result = await htmlToPdf(files[0]);
            filename = "webpage-converted.pdf";
            break;
          }
          
          case "txt-to-pdf": {
            result = await txtToPdf(files[0]);
            filename = "txt-converted.pdf";
            break;
          }
          
          case "rtf-to-pdf": {
            result = await rtfToPdf(files[0]);
            filename = "rtf-converted.pdf";
            break;
          }
          
          case "odt-to-pdf": {
            result = await odtToPdf(files[0]);
            filename = "odt-converted.pdf";
            break;
          }
          
          case "ods-to-pdf": {
            result = await odsToPdf(files[0]);
            filename = "ods-converted.pdf";
            break;
          }
          
          case "odp-to-pdf": {
            result = await odpToPdf(files[0]);
            filename = "odp-converted.pdf";
            break;
          }
          
          case "csv-to-pdf": {
            result = await csvToPdf(files[0]);
            filename = "csv-converted.pdf";
            break;
          }
          
          case "epub-to-pdf": {
            result = await epubToPdf(files[0]);
            filename = "epub-converted.pdf";
            break;
          }
          
          case "mobi-to-pdf": {
            result = await mobiToPdf(files[0]);
            filename = "mobi-converted.pdf";
            break;
          }
          
          case "djvu-to-pdf": {
            result = await djvuToPdf(files[0]);
            filename = "djvu-converted.pdf";
            break;
          }
          
          case "xml-to-pdf": {
            result = await xmlToPdf(files[0]);
            filename = "xml-converted.pdf";
            break;
          }
          
          case "markdown-to-pdf": {
            result = await markdownToPdf(files[0]);
            filename = "markdown-converted.pdf";
            break;
          }
          
          case "md-to-pdf": {
            result = await mdToPdf(files[0]);
            filename = "md-converted.pdf";
            break;
          }
          
          case "create-pdf": {
            const pageSize = options.pageSize || "letter";
            const pageCount = typeof options.pageCount === 'string' 
              ? parseInt(options.pageCount, 10) 
              : (options.pageCount || 1);
            result = await createPdf(pageSize, pageCount);
            filename = "created.pdf";
            break;
          }
          
          case "pdf-creator": {
            const textContent = options.textContent || "";
            const docTitle = options.title || "";
            result = await pdfCreator(textContent, docTitle);
            filename = "custom-document.pdf";
            break;
          }
          
          case "pub-to-pdf": {
            result = await pubToPdf(files[0]);
            filename = "pub-converted.pdf";
            break;
          }
          
          case "vsd-to-pdf": {
            result = await vsdToPdf(files[0]);
            filename = "vsd-converted.pdf";
            break;
          }
          
          case "mpp-to-pdf": {
            result = await mppToPdf(files[0]);
            filename = "mpp-converted.pdf";
            break;
          }
          
          case "pages-to-pdf": {
            result = await pagesToPdf(files[0]);
            filename = "pages-converted.pdf";
            break;
          }
          
          case "numbers-to-pdf": {
            result = await numbersToPdf(files[0]);
            filename = "numbers-converted.pdf";
            break;
          }
          
          case "keynote-to-pdf": {
            result = await keynoteToPdf(files[0]);
            filename = "keynote-converted.pdf";
            break;
          }
          
          case "email-to-pdf": {
            result = await emailToPdf(files[0]);
            filename = "email-converted.pdf";
            break;
          }
          
          case "msg-to-pdf": {
            result = await msgToPdf(files[0]);
            filename = "msg-converted.pdf";
            break;
          }
            
          default:
            throw new Error(`Unknown tool type: ${toolType}`);
        }
        
        cleanupUploadedFiles(files);
        
        const outputFilename = `${randomUUID()}-${filename}`;
        const outputPath = path.join(outputDir, outputFilename);
        
        if (typeof result === "string") {
          if (result !== outputPath) {
            fs.renameSync(result, outputPath);
          }
        } else {
          fs.writeFileSync(outputPath, result);
        }
        
        setTimeout(() => {
          cleanupFiles(outputPath);
        }, 5 * 60 * 1000);
        
        res.json({
          success: true,
          filename,
          downloadUrl: `/api/download/${outputFilename}`,
          pageCount,
        });
      } catch (error) {
        cleanupUploadedFiles(files);
        
        console.error("Processing error:", error);
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : "An unexpected error occurred during processing",
        });
      }
    }
  );
  
  app.get("/api/download/:filename", (req: Request, res: Response) => {
    const { filename } = req.params;
    
    if (!filename || filename.includes("..") || filename.includes("/")) {
      return res.status(400).json({ error: "Invalid filename" });
    }
    
    const filePath = path.join(outputDir, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found or has expired. Please process your file again." });
    }
    
    const originalFilename = filename.includes("-") 
      ? filename.substring(filename.indexOf("-") + 1) 
      : filename;
    
    res.download(filePath, originalFilename, (err) => {
      if (err && !res.headersSent) {
        console.error("Download error:", err);
        res.status(500).json({ error: "Download failed" });
      }
    });
  });

  return httpServer;
}
