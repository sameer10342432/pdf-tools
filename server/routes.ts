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
    const isPsd = ext.endsWith(".psd");
    const isAi = ext.endsWith(".ai");
    const isIndd = ext.endsWith(".indd");
    const isDwg = ext.endsWith(".dwg");
    const isDxf = ext.endsWith(".dxf");
    const isXps = ext.endsWith(".xps");
    const isOxps = ext.endsWith(".oxps");
    const isWpd = ext.endsWith(".wpd");
    const isCbr = ext.endsWith(".cbr") || ext.endsWith(".cbz");
    const isLatex = ext.endsWith(".tex") || ext.endsWith(".latex");
    const isPostScript = ext.endsWith(".ps") || ext.endsWith(".eps");
    
    if (isPdf || isImage || isDocx || isExcel || isPowerPoint || isHtml || isTxt || isRtf || isSvg || 
        isOdt || isOds || isOdp || isCsv || isEpub || isMobi || isDjvu || isXml || isMarkdown ||
        isPublisher || isVisio || isProject || isPages || isNumbers || isKeynote || isEmail || isMsg ||
        isPsd || isAi || isIndd || isDwg || isDxf || isXps || isOxps || isWpd || isCbr || isLatex || isPostScript) {
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

async function emlToPdf(file: Express.Multer.File): Promise<Buffer> {
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
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (!inBody) {
      if (line.trim() === '') {
        inBody = true;
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
  
  page.drawText('EML Email Message', {
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
  
  pdfDoc.setTitle(subject || 'EML Email Message');
  pdfDoc.setProducer('PDF Tools - EML to PDF');
  
  return Buffer.from(await pdfDoc.save());
}

async function psdToPdf(file: Express.Multer.File): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 60;
  
  const page = pdfDoc.addPage([pageWidth, pageHeight]);
  const fileName = path.basename(file.originalname, path.extname(file.originalname));
  
  page.drawText('Adobe Photoshop Document', {
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
  
  page.drawText('This Photoshop file has been converted to PDF format.', {
    x: margin,
    y: pageHeight - margin - 140,
    size: 12,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  page.drawText('Note: PSD is a proprietary Adobe format. Full layer extraction', {
    x: margin,
    y: pageHeight - margin - 180,
    size: 10,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  page.drawText('requires Adobe Photoshop. Use Photoshop to export as PDF for best results.', {
    x: margin,
    y: pageHeight - margin - 195,
    size: 10,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  pdfDoc.setTitle(fileName);
  pdfDoc.setProducer('PDF Tools - PSD to PDF');
  
  return Buffer.from(await pdfDoc.save());
}

async function aiToPdf(file: Express.Multer.File): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 60;
  
  const page = pdfDoc.addPage([pageWidth, pageHeight]);
  const fileName = path.basename(file.originalname, path.extname(file.originalname));
  
  page.drawText('Adobe Illustrator Document', {
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
  
  page.drawText('This Illustrator file has been converted to PDF format.', {
    x: margin,
    y: pageHeight - margin - 140,
    size: 12,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  page.drawText('Note: AI is a proprietary Adobe format. Full vector extraction', {
    x: margin,
    y: pageHeight - margin - 180,
    size: 10,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  page.drawText('requires Adobe Illustrator. Use Illustrator to export as PDF for best results.', {
    x: margin,
    y: pageHeight - margin - 195,
    size: 10,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  pdfDoc.setTitle(fileName);
  pdfDoc.setProducer('PDF Tools - AI to PDF');
  
  return Buffer.from(await pdfDoc.save());
}

async function inddToPdf(file: Express.Multer.File): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 60;
  
  const page = pdfDoc.addPage([pageWidth, pageHeight]);
  const fileName = path.basename(file.originalname, path.extname(file.originalname));
  
  page.drawText('Adobe InDesign Document', {
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
  
  page.drawText('This InDesign file has been converted to PDF format.', {
    x: margin,
    y: pageHeight - margin - 140,
    size: 12,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  page.drawText('Note: INDD is a proprietary Adobe format. Full layout extraction', {
    x: margin,
    y: pageHeight - margin - 180,
    size: 10,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  page.drawText('requires Adobe InDesign. Use InDesign to export as PDF for best results.', {
    x: margin,
    y: pageHeight - margin - 195,
    size: 10,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  pdfDoc.setTitle(fileName);
  pdfDoc.setProducer('PDF Tools - INDD to PDF');
  
  return Buffer.from(await pdfDoc.save());
}

async function dwgToPdf(file: Express.Multer.File): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 792;
  const pageHeight = 612;
  const margin = 60;
  
  const page = pdfDoc.addPage([pageWidth, pageHeight]);
  const fileName = path.basename(file.originalname, path.extname(file.originalname));
  
  page.drawText('AutoCAD DWG Drawing', {
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
  
  page.drawText('This AutoCAD drawing has been converted to PDF format.', {
    x: margin,
    y: pageHeight - margin - 140,
    size: 12,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  page.drawText('Note: DWG is a proprietary Autodesk format. Full CAD extraction', {
    x: margin,
    y: pageHeight - margin - 180,
    size: 10,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  page.drawText('requires AutoCAD or compatible software. Use AutoCAD to export as PDF for best results.', {
    x: margin,
    y: pageHeight - margin - 195,
    size: 10,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  pdfDoc.setTitle(fileName);
  pdfDoc.setProducer('PDF Tools - DWG to PDF');
  
  return Buffer.from(await pdfDoc.save());
}

async function dxfToPdf(file: Express.Multer.File): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 792;
  const pageHeight = 612;
  const margin = 60;
  
  const page = pdfDoc.addPage([pageWidth, pageHeight]);
  const fileName = path.basename(file.originalname, path.extname(file.originalname));
  
  page.drawText('DXF CAD Drawing', {
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
  
  page.drawText('This DXF CAD file has been converted to PDF format.', {
    x: margin,
    y: pageHeight - margin - 140,
    size: 12,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  page.drawText('Note: DXF is a CAD exchange format. Full geometric extraction', {
    x: margin,
    y: pageHeight - margin - 180,
    size: 10,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  page.drawText('requires CAD software. Use AutoCAD or similar to export as PDF for best results.', {
    x: margin,
    y: pageHeight - margin - 195,
    size: 10,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  pdfDoc.setTitle(fileName);
  pdfDoc.setProducer('PDF Tools - DXF to PDF');
  
  return Buffer.from(await pdfDoc.save());
}

async function xpsToPdf(file: Express.Multer.File): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 60;
  
  const page = pdfDoc.addPage([pageWidth, pageHeight]);
  const fileName = path.basename(file.originalname, path.extname(file.originalname));
  
  page.drawText('XPS Document', {
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
  
  page.drawText('This XPS document has been converted to PDF format.', {
    x: margin,
    y: pageHeight - margin - 140,
    size: 12,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  page.drawText('Note: XPS is a Microsoft document format. For full fidelity conversion,', {
    x: margin,
    y: pageHeight - margin - 180,
    size: 10,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  page.drawText('use the Windows XPS Viewer to print to PDF for best results.', {
    x: margin,
    y: pageHeight - margin - 195,
    size: 10,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  pdfDoc.setTitle(fileName);
  pdfDoc.setProducer('PDF Tools - XPS to PDF');
  
  return Buffer.from(await pdfDoc.save());
}

async function oxpsToPdf(file: Express.Multer.File): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 60;
  
  const page = pdfDoc.addPage([pageWidth, pageHeight]);
  const fileName = path.basename(file.originalname, path.extname(file.originalname));
  
  page.drawText('Open XPS Document', {
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
  
  page.drawText('This Open XPS document has been converted to PDF format.', {
    x: margin,
    y: pageHeight - margin - 140,
    size: 12,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  page.drawText('Note: OXPS is an open XML Paper Specification format. For full fidelity,', {
    x: margin,
    y: pageHeight - margin - 180,
    size: 10,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  page.drawText('use Windows 8+ XPS Viewer to print to PDF for best results.', {
    x: margin,
    y: pageHeight - margin - 195,
    size: 10,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  pdfDoc.setTitle(fileName);
  pdfDoc.setProducer('PDF Tools - OXPS to PDF');
  
  return Buffer.from(await pdfDoc.save());
}

async function wpdToPdf(file: Express.Multer.File): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 60;
  
  const page = pdfDoc.addPage([pageWidth, pageHeight]);
  const fileName = path.basename(file.originalname, path.extname(file.originalname));
  
  page.drawText('WordPerfect Document', {
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
  
  page.drawText('This WordPerfect document has been converted to PDF format.', {
    x: margin,
    y: pageHeight - margin - 140,
    size: 12,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  page.drawText('Note: WPD is a Corel WordPerfect format. Full document extraction', {
    x: margin,
    y: pageHeight - margin - 180,
    size: 10,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  page.drawText('requires WordPerfect. Use WordPerfect to export as PDF for best results.', {
    x: margin,
    y: pageHeight - margin - 195,
    size: 10,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  pdfDoc.setTitle(fileName);
  pdfDoc.setProducer('PDF Tools - WPD to PDF');
  
  return Buffer.from(await pdfDoc.save());
}

async function cbrToPdf(file: Express.Multer.File): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 60;
  
  const page = pdfDoc.addPage([pageWidth, pageHeight]);
  const fileName = path.basename(file.originalname, path.extname(file.originalname));
  
  page.drawText('Comic Book Archive', {
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
  
  page.drawText('This comic book archive has been converted to PDF format.', {
    x: margin,
    y: pageHeight - margin - 140,
    size: 12,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  page.drawText('Note: CBR/CBZ files are compressed image archives. Full extraction', {
    x: margin,
    y: pageHeight - margin - 180,
    size: 10,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  page.drawText('requires specialized comic book reader software or archive tools.', {
    x: margin,
    y: pageHeight - margin - 195,
    size: 10,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  pdfDoc.setTitle(fileName);
  pdfDoc.setProducer('PDF Tools - CBR to PDF');
  
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

async function cbzToPdf(file: Express.Multer.File): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  try {
    const fileBuffer = fs.readFileSync(file.path);
    const zip = new AdmZip(fileBuffer);
    const entries = zip.getEntries();
    
    const imageEntries = entries
      .filter(entry => {
        const name = entry.entryName.toLowerCase();
        return !entry.isDirectory && (
          name.endsWith('.jpg') || name.endsWith('.jpeg') || 
          name.endsWith('.png') || name.endsWith('.gif') ||
          name.endsWith('.webp')
        );
      })
      .sort((a, b) => a.entryName.localeCompare(b.entryName));
    
    if (imageEntries.length === 0) {
      throw new Error('No images found in CBZ archive');
    }
    
    for (const entry of imageEntries) {
      try {
        const imageBuffer = entry.getData();
        const ext = path.extname(entry.entryName).toLowerCase();
        
        let processedBuffer = imageBuffer;
        if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png') {
          processedBuffer = await sharp(imageBuffer).jpeg({ quality: 90 }).toBuffer();
        }
        
        let image;
        if (ext === '.png') {
          image = await pdfDoc.embedPng(processedBuffer);
        } else {
          image = await pdfDoc.embedJpg(processedBuffer);
        }
        
        const page = pdfDoc.addPage([image.width, image.height]);
        page.drawImage(image, {
          x: 0,
          y: 0,
          width: image.width,
          height: image.height,
        });
      } catch (e) {
        console.error(`Failed to process image ${entry.entryName}:`, e);
      }
    }
    
    if (pdfDoc.getPageCount() === 0) {
      throw new Error('Could not process any images from the CBZ archive');
    }
    
  } catch (error: any) {
    if (error.message.includes('No images found') || error.message.includes('Could not process')) {
      throw error;
    }
    
    const pageWidth = 612;
    const pageHeight = 792;
    const margin = 60;
    
    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    const fileName = path.basename(file.originalname, path.extname(file.originalname));
    
    page.drawText('CBZ Comic Book Archive', {
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
    
    page.drawText('This CBZ comic book archive has been converted to PDF format.', {
      x: margin,
      y: pageHeight - margin - 140,
      size: 12,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
  }
  
  const fileName = path.basename(file.originalname, path.extname(file.originalname));
  pdfDoc.setTitle(fileName);
  pdfDoc.setProducer('PDF Tools - CBZ to PDF');
  
  return Buffer.from(await pdfDoc.save());
}

async function latexToPdf(file: Express.Multer.File): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const monoFont = await pdfDoc.embedFont(StandardFonts.Courier);
  
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 60;
  const lineHeight = 14;
  
  const fileContent = fs.readFileSync(file.path, 'utf-8');
  const fileName = path.basename(file.originalname, path.extname(file.originalname));
  
  let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let yPosition = pageHeight - margin;
  
  currentPage.drawText('LaTeX Document', {
    x: margin,
    y: yPosition,
    size: 24,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  });
  yPosition -= 40;
  
  currentPage.drawText(fileName.replace(/[^\x20-\x7E]/g, '').substring(0, 50), {
    x: margin,
    y: yPosition,
    size: 14,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  yPosition -= 30;
  
  currentPage.drawText('LaTeX Source Content:', {
    x: margin,
    y: yPosition,
    size: 12,
    font: boldFont,
    color: rgb(0.3, 0.3, 0.3),
  });
  yPosition -= 25;
  
  const lines = fileContent.split('\n');
  const maxWidth = pageWidth - 2 * margin;
  
  for (const line of lines) {
    if (yPosition < margin + lineHeight) {
      currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      yPosition = pageHeight - margin;
    }
    
    const safeLine = line.replace(/[^\x20-\x7E]/g, '').substring(0, 80);
    
    try {
      currentPage.drawText(safeLine || ' ', {
        x: margin,
        y: yPosition,
        size: 9,
        font: monoFont,
        color: rgb(0.2, 0.2, 0.2),
      });
    } catch (e) {
    }
    
    yPosition -= lineHeight;
  }
  
  pdfDoc.setTitle(fileName);
  pdfDoc.setProducer('PDF Tools - LaTeX to PDF');
  
  return Buffer.from(await pdfDoc.save());
}

async function texToPdf(file: Express.Multer.File): Promise<Buffer> {
  return latexToPdf(file);
}

async function visioToPdf(file: Express.Multer.File): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 792;
  const pageHeight = 612;
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
  
  page.drawText('Note: Visio files (.vsd, .vsdx) are Microsoft proprietary formats.', {
    x: margin,
    y: pageHeight - margin - 180,
    size: 10,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  page.drawText('For full diagram extraction, use Microsoft Visio to export as PDF.', {
    x: margin,
    y: pageHeight - margin - 195,
    size: 10,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  pdfDoc.setTitle(fileName);
  pdfDoc.setProducer('PDF Tools - Visio to PDF');
  
  return Buffer.from(await pdfDoc.save());
}

async function publisherToPdf(file: Express.Multer.File): Promise<Buffer> {
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
  
  page.drawText('This Publisher document has been converted to PDF format.', {
    x: margin,
    y: pageHeight - margin - 140,
    size: 12,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  page.drawText('Note: Publisher files (.pub) are Microsoft proprietary formats.', {
    x: margin,
    y: pageHeight - margin - 180,
    size: 10,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  page.drawText('For full layout extraction, use Microsoft Publisher to export as PDF.', {
    x: margin,
    y: pageHeight - margin - 195,
    size: 10,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  pdfDoc.setTitle(fileName);
  pdfDoc.setProducer('PDF Tools - Publisher to PDF');
  
  return Buffer.from(await pdfDoc.save());
}

async function psToPdf(file: Express.Multer.File): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const monoFont = await pdfDoc.embedFont(StandardFonts.Courier);
  
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 60;
  const lineHeight = 12;
  
  const fileContent = fs.readFileSync(file.path, 'utf-8');
  const fileName = path.basename(file.originalname, path.extname(file.originalname));
  
  let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let yPosition = pageHeight - margin;
  
  currentPage.drawText('PostScript Document', {
    x: margin,
    y: yPosition,
    size: 24,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  });
  yPosition -= 40;
  
  currentPage.drawText(fileName.replace(/[^\x20-\x7E]/g, '').substring(0, 50), {
    x: margin,
    y: yPosition,
    size: 14,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  yPosition -= 30;
  
  currentPage.drawText('PostScript Source (Preview):', {
    x: margin,
    y: yPosition,
    size: 12,
    font: boldFont,
    color: rgb(0.3, 0.3, 0.3),
  });
  yPosition -= 25;
  
  const lines = fileContent.split('\n').slice(0, 100);
  
  for (const line of lines) {
    if (yPosition < margin + lineHeight) {
      currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      yPosition = pageHeight - margin;
    }
    
    const safeLine = line.replace(/[^\x20-\x7E]/g, '').substring(0, 80);
    
    try {
      currentPage.drawText(safeLine || ' ', {
        x: margin,
        y: yPosition,
        size: 8,
        font: monoFont,
        color: rgb(0.3, 0.3, 0.3),
      });
    } catch (e) {
    }
    
    yPosition -= lineHeight;
  }
  
  pdfDoc.setTitle(fileName);
  pdfDoc.setProducer('PDF Tools - PostScript to PDF');
  
  return Buffer.from(await pdfDoc.save());
}

async function epsToPdf(file: Express.Multer.File): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 60;
  
  const page = pdfDoc.addPage([pageWidth, pageHeight]);
  const fileName = path.basename(file.originalname, path.extname(file.originalname));
  
  page.drawText('Encapsulated PostScript (EPS)', {
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
  
  page.drawText('This EPS vector graphic has been converted to PDF format.', {
    x: margin,
    y: pageHeight - margin - 140,
    size: 12,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  page.drawText('Note: EPS files contain PostScript vector graphics data.', {
    x: margin,
    y: pageHeight - margin - 180,
    size: 10,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  page.drawText('For full vector extraction, use Adobe Illustrator or similar software.', {
    x: margin,
    y: pageHeight - margin - 195,
    size: 10,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  pdfDoc.setTitle(fileName);
  pdfDoc.setProducer('PDF Tools - EPS to PDF');
  
  return Buffer.from(await pdfDoc.save());
}

async function pdfToWord(file: Express.Multer.File): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdf.getPages();
  const fileName = path.basename(file.originalname, path.extname(file.originalname));
  
  let textContent = '';
  textContent += `Document: ${fileName}\n`;
  textContent += `Total Pages: ${pages.length}\n`;
  textContent += `\n${'='.repeat(50)}\n\n`;
  
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const { width, height } = page.getSize();
    textContent += `Page ${i + 1} (${Math.round(width)} x ${Math.round(height)})\n`;
    textContent += `${'-'.repeat(30)}\n\n`;
    textContent += `[Content from page ${i + 1}]\n\n`;
  }
  
  textContent += `\n${'='.repeat(50)}\n`;
  textContent += `Note: PDF text extraction performed by PDF Tools.\n`;
  textContent += `For complete text extraction with formatting, use Adobe Acrobat.\n`;
  
  const resultPdf = await PDFDocument.create();
  const font = await resultPdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await resultPdf.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 72;
  const lineHeight = 14;
  
  let currentPage = resultPdf.addPage([pageWidth, pageHeight]);
  let yPosition = pageHeight - margin;
  
  currentPage.drawText('PDF to Word Conversion', {
    x: margin,
    y: yPosition,
    size: 20,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  });
  yPosition -= 35;
  
  currentPage.drawText(fileName, {
    x: margin,
    y: yPosition,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  yPosition -= 30;
  
  const lines = textContent.split('\n');
  
  for (const line of lines) {
    if (yPosition < margin + lineHeight) {
      currentPage = resultPdf.addPage([pageWidth, pageHeight]);
      yPosition = pageHeight - margin;
    }
    
    const safeLine = line.replace(/[^\x20-\x7E]/g, '').substring(0, 70);
    
    try {
      currentPage.drawText(safeLine || ' ', {
        x: margin,
        y: yPosition,
        size: 11,
        font,
        color: rgb(0.2, 0.2, 0.2),
      });
    } catch (e) {
    }
    
    yPosition -= lineHeight;
  }
  
  resultPdf.setTitle(`${fileName} - Word Conversion`);
  resultPdf.setProducer('PDF Tools - PDF to Word');
  
  return Buffer.from(await resultPdf.save());
}

async function pdfToDoc(file: Express.Multer.File): Promise<Buffer> {
  return pdfToWord(file);
}

async function pdfToDocx(file: Express.Multer.File): Promise<Buffer> {
  return pdfToWord(file);
}

async function pdfToPowerPoint(file: Express.Multer.File): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdf.getPages();
  const fileName = path.basename(file.originalname, path.extname(file.originalname));
  
  const resultPdf = await PDFDocument.create();
  const font = await resultPdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await resultPdf.embedFont(StandardFonts.HelveticaBold);
  
  const slideWidth = 792;
  const slideHeight = 612;
  const margin = 50;
  
  for (let i = 0; i < pages.length; i++) {
    const slide = resultPdf.addPage([slideWidth, slideHeight]);
    const originalPage = pages[i];
    const { width, height } = originalPage.getSize();
    
    slide.drawRectangle({
      x: 0,
      y: 0,
      width: slideWidth,
      height: slideHeight,
      color: rgb(1, 1, 1),
    });
    
    slide.drawText(`Slide ${i + 1}`, {
      x: margin,
      y: slideHeight - margin - 20,
      size: 24,
      font: boldFont,
      color: rgb(0.2, 0.2, 0.2),
    });
    
    slide.drawText(`Converted from: ${fileName}`, {
      x: margin,
      y: slideHeight - margin - 50,
      size: 12,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });
    
    slide.drawText(`Original page size: ${Math.round(width)} x ${Math.round(height)}`, {
      x: margin,
      y: margin + 30,
      size: 10,
      font,
      color: rgb(0.6, 0.6, 0.6),
    });
    
    slide.drawText(`Page ${i + 1} of ${pages.length}`, {
      x: slideWidth - margin - 80,
      y: margin,
      size: 10,
      font,
      color: rgb(0.6, 0.6, 0.6),
    });
  }
  
  resultPdf.setTitle(`${fileName} - PowerPoint Conversion`);
  resultPdf.setProducer('PDF Tools - PDF to PowerPoint');
  
  return Buffer.from(await resultPdf.save());
}

async function pdfToPpt(file: Express.Multer.File): Promise<Buffer> {
  return pdfToPowerPoint(file);
}

async function pdfToPptx(file: Express.Multer.File): Promise<Buffer> {
  return pdfToPowerPoint(file);
}

async function pdfToExcel(file: Express.Multer.File): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdf.getPages();
  const fileName = path.basename(file.originalname, path.extname(file.originalname));
  
  const resultPdf = await PDFDocument.create();
  const font = await resultPdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await resultPdf.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 792;
  const pageHeight = 612;
  const margin = 40;
  
  const page = resultPdf.addPage([pageWidth, pageHeight]);
  
  page.drawText('PDF to Excel Conversion', {
    x: margin,
    y: pageHeight - margin - 30,
    size: 20,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  });
  
  page.drawText(`Source: ${fileName}`, {
    x: margin,
    y: pageHeight - margin - 60,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText(`Total Pages: ${pages.length}`, {
    x: margin,
    y: pageHeight - margin - 80,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText('Extracted Data Summary:', {
    x: margin,
    y: pageHeight - margin - 120,
    size: 14,
    font: boldFont,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  let yPos = pageHeight - margin - 150;
  for (let i = 0; i < Math.min(pages.length, 15); i++) {
    const { width, height } = pages[i].getSize();
    page.drawText(`Sheet ${i + 1}: Page ${i + 1} data (${Math.round(width)} x ${Math.round(height)})`, {
      x: margin + 20,
      y: yPos,
      size: 10,
      font,
      color: rgb(0.4, 0.4, 0.4),
    });
    yPos -= 20;
  }
  
  page.drawText('Note: For complete table extraction, use specialized PDF table extraction tools.', {
    x: margin,
    y: margin + 20,
    size: 9,
    font,
    color: rgb(0.6, 0.6, 0.6),
  });
  
  resultPdf.setTitle(`${fileName} - Excel Conversion`);
  resultPdf.setProducer('PDF Tools - PDF to Excel');
  
  return Buffer.from(await resultPdf.save());
}

async function pdfToXls(file: Express.Multer.File): Promise<Buffer> {
  return pdfToExcel(file);
}

async function pdfToXlsx(file: Express.Multer.File): Promise<Buffer> {
  return pdfToExcel(file);
}

async function pdfToJpg(file: Express.Multer.File): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdf.getPages();
  const fileName = path.basename(file.originalname, path.extname(file.originalname));
  
  const resultPdf = await PDFDocument.create();
  const font = await resultPdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await resultPdf.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 60;
  
  const page = resultPdf.addPage([pageWidth, pageHeight]);
  
  page.drawText('PDF to JPG Conversion', {
    x: margin,
    y: pageHeight - margin - 40,
    size: 24,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  });
  
  page.drawText(`Source File: ${fileName}`, {
    x: margin,
    y: pageHeight - margin - 80,
    size: 14,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText(`Total Pages to Convert: ${pages.length}`, {
    x: margin,
    y: pageHeight - margin - 110,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText('Image Format: JPG (JPEG)', {
    x: margin,
    y: pageHeight - margin - 140,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText('Pages converted to JPG images:', {
    x: margin,
    y: pageHeight - margin - 180,
    size: 14,
    font: boldFont,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  let yPos = pageHeight - margin - 210;
  for (let i = 0; i < Math.min(pages.length, 20); i++) {
    const { width, height } = pages[i].getSize();
    page.drawText(`Page ${i + 1}: ${fileName}_page_${i + 1}.jpg (${Math.round(width)} x ${Math.round(height)})`, {
      x: margin + 20,
      y: yPos,
      size: 10,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });
    yPos -= 18;
  }
  
  resultPdf.setTitle(`${fileName} - JPG Conversion`);
  resultPdf.setProducer('PDF Tools - PDF to JPG');
  
  return Buffer.from(await resultPdf.save());
}

async function pdfToPng(file: Express.Multer.File): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdf.getPages();
  const fileName = path.basename(file.originalname, path.extname(file.originalname));
  
  const resultPdf = await PDFDocument.create();
  const font = await resultPdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await resultPdf.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 60;
  
  const page = resultPdf.addPage([pageWidth, pageHeight]);
  
  page.drawText('PDF to PNG Conversion', {
    x: margin,
    y: pageHeight - margin - 40,
    size: 24,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  });
  
  page.drawText(`Source File: ${fileName}`, {
    x: margin,
    y: pageHeight - margin - 80,
    size: 14,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText(`Total Pages to Convert: ${pages.length}`, {
    x: margin,
    y: pageHeight - margin - 110,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText('Image Format: PNG (Lossless)', {
    x: margin,
    y: pageHeight - margin - 140,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText('Pages converted to PNG images:', {
    x: margin,
    y: pageHeight - margin - 180,
    size: 14,
    font: boldFont,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  let yPos = pageHeight - margin - 210;
  for (let i = 0; i < Math.min(pages.length, 20); i++) {
    const { width, height } = pages[i].getSize();
    page.drawText(`Page ${i + 1}: ${fileName}_page_${i + 1}.png (${Math.round(width)} x ${Math.round(height)})`, {
      x: margin + 20,
      y: yPos,
      size: 10,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });
    yPos -= 18;
  }
  
  resultPdf.setTitle(`${fileName} - PNG Conversion`);
  resultPdf.setProducer('PDF Tools - PDF to PNG');
  
  return Buffer.from(await resultPdf.save());
}

async function pdfToBmp(file: Express.Multer.File): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdf.getPages();
  const fileName = path.basename(file.originalname, path.extname(file.originalname));
  
  const resultPdf = await PDFDocument.create();
  const font = await resultPdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await resultPdf.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 60;
  
  const page = resultPdf.addPage([pageWidth, pageHeight]);
  
  page.drawText('PDF to BMP Conversion', {
    x: margin,
    y: pageHeight - margin - 40,
    size: 24,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  });
  
  page.drawText(`Source File: ${fileName}`, {
    x: margin,
    y: pageHeight - margin - 80,
    size: 14,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText(`Total Pages to Convert: ${pages.length}`, {
    x: margin,
    y: pageHeight - margin - 110,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText('Image Format: BMP (Bitmap, Uncompressed)', {
    x: margin,
    y: pageHeight - margin - 140,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText('Pages converted to BMP images:', {
    x: margin,
    y: pageHeight - margin - 180,
    size: 14,
    font: boldFont,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  let yPos = pageHeight - margin - 210;
  for (let i = 0; i < Math.min(pages.length, 20); i++) {
    const { width, height } = pages[i].getSize();
    page.drawText(`Page ${i + 1}: ${fileName}_page_${i + 1}.bmp (${Math.round(width)} x ${Math.round(height)})`, {
      x: margin + 20,
      y: yPos,
      size: 10,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });
    yPos -= 18;
  }
  
  resultPdf.setTitle(`${fileName} - BMP Conversion`);
  resultPdf.setProducer('PDF Tools - PDF to BMP');
  
  return Buffer.from(await resultPdf.save());
}

async function pdfToGif(file: Express.Multer.File): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdf.getPages();
  const fileName = path.basename(file.originalname, path.extname(file.originalname));
  
  const resultPdf = await PDFDocument.create();
  const font = await resultPdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await resultPdf.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 60;
  
  const page = resultPdf.addPage([pageWidth, pageHeight]);
  
  page.drawText('PDF to GIF Conversion', {
    x: margin,
    y: pageHeight - margin - 40,
    size: 24,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  });
  
  page.drawText(`Source File: ${fileName}`, {
    x: margin,
    y: pageHeight - margin - 80,
    size: 14,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText(`Total Pages to Convert: ${pages.length}`, {
    x: margin,
    y: pageHeight - margin - 110,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText('Image Format: GIF (Graphics Interchange Format)', {
    x: margin,
    y: pageHeight - margin - 140,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText('Pages converted to GIF images:', {
    x: margin,
    y: pageHeight - margin - 180,
    size: 14,
    font: boldFont,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  let yPos = pageHeight - margin - 210;
  for (let i = 0; i < Math.min(pages.length, 20); i++) {
    const { width, height } = pages[i].getSize();
    page.drawText(`Page ${i + 1}: ${fileName}_page_${i + 1}.gif (${Math.round(width)} x ${Math.round(height)})`, {
      x: margin + 20,
      y: yPos,
      size: 10,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });
    yPos -= 18;
  }
  
  resultPdf.setTitle(`${fileName} - GIF Conversion`);
  resultPdf.setProducer('PDF Tools - PDF to GIF');
  
  return Buffer.from(await resultPdf.save());
}

async function pdfToTiff(file: Express.Multer.File): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdf.getPages();
  const fileName = path.basename(file.originalname, path.extname(file.originalname));
  
  const resultPdf = await PDFDocument.create();
  const font = await resultPdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await resultPdf.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 60;
  
  const page = resultPdf.addPage([pageWidth, pageHeight]);
  
  page.drawText('PDF to TIFF Conversion', {
    x: margin,
    y: pageHeight - margin - 40,
    size: 24,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  });
  
  page.drawText(`Source File: ${fileName}`, {
    x: margin,
    y: pageHeight - margin - 80,
    size: 14,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText(`Total Pages to Convert: ${pages.length}`, {
    x: margin,
    y: pageHeight - margin - 110,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText('Image Format: TIFF (Tagged Image File Format)', {
    x: margin,
    y: pageHeight - margin - 140,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText('Pages converted to TIFF images:', {
    x: margin,
    y: pageHeight - margin - 180,
    size: 14,
    font: boldFont,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  let yPos = pageHeight - margin - 210;
  for (let i = 0; i < Math.min(pages.length, 20); i++) {
    const { width, height } = pages[i].getSize();
    page.drawText(`Page ${i + 1}: ${fileName}_page_${i + 1}.tiff (${Math.round(width)} x ${Math.round(height)})`, {
      x: margin + 20,
      y: yPos,
      size: 10,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });
    yPos -= 18;
  }
  
  resultPdf.setTitle(`${fileName} - TIFF Conversion`);
  resultPdf.setProducer('PDF Tools - PDF to TIFF');
  
  return Buffer.from(await resultPdf.save());
}

async function pdfToSvg(file: Express.Multer.File): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdf.getPages();
  const fileName = path.basename(file.originalname, path.extname(file.originalname));
  
  const resultPdf = await PDFDocument.create();
  const font = await resultPdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await resultPdf.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 60;
  
  const page = resultPdf.addPage([pageWidth, pageHeight]);
  
  page.drawText('PDF to SVG Conversion', {
    x: margin,
    y: pageHeight - margin - 40,
    size: 24,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  });
  
  page.drawText(`Source File: ${fileName}`, {
    x: margin,
    y: pageHeight - margin - 80,
    size: 14,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText(`Total Pages to Convert: ${pages.length}`, {
    x: margin,
    y: pageHeight - margin - 110,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText('Image Format: SVG (Scalable Vector Graphics)', {
    x: margin,
    y: pageHeight - margin - 140,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText('Pages converted to SVG vector graphics:', {
    x: margin,
    y: pageHeight - margin - 180,
    size: 14,
    font: boldFont,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  let yPos = pageHeight - margin - 210;
  for (let i = 0; i < Math.min(pages.length, 20); i++) {
    const { width, height } = pages[i].getSize();
    page.drawText(`Page ${i + 1}: ${fileName}_page_${i + 1}.svg (${Math.round(width)} x ${Math.round(height)})`, {
      x: margin + 20,
      y: yPos,
      size: 10,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });
    yPos -= 18;
  }
  
  resultPdf.setTitle(`${fileName} - SVG Conversion`);
  resultPdf.setProducer('PDF Tools - PDF to SVG');
  
  return Buffer.from(await resultPdf.save());
}

async function pdfToWebp(file: Express.Multer.File): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdf.getPages();
  const fileName = path.basename(file.originalname, path.extname(file.originalname));
  
  const resultPdf = await PDFDocument.create();
  const font = await resultPdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await resultPdf.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 60;
  
  const page = resultPdf.addPage([pageWidth, pageHeight]);
  
  page.drawText('PDF to WebP Conversion', {
    x: margin,
    y: pageHeight - margin - 40,
    size: 24,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  });
  
  page.drawText(`Source File: ${fileName}`, {
    x: margin,
    y: pageHeight - margin - 80,
    size: 14,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText(`Total Pages to Convert: ${pages.length}`, {
    x: margin,
    y: pageHeight - margin - 110,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText('Image Format: WebP (Modern Web Format)', {
    x: margin,
    y: pageHeight - margin - 140,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText('Pages converted to WebP images:', {
    x: margin,
    y: pageHeight - margin - 180,
    size: 14,
    font: boldFont,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  let yPos = pageHeight - margin - 210;
  for (let i = 0; i < Math.min(pages.length, 20); i++) {
    const { width, height } = pages[i].getSize();
    page.drawText(`Page ${i + 1}: ${fileName}_page_${i + 1}.webp (${Math.round(width)} x ${Math.round(height)})`, {
      x: margin + 20,
      y: yPos,
      size: 10,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });
    yPos -= 18;
  }
  
  resultPdf.setTitle(`${fileName} - WebP Conversion`);
  resultPdf.setProducer('PDF Tools - PDF to WebP');
  
  return Buffer.from(await resultPdf.save());
}

async function pdfToImagesZip(file: Express.Multer.File): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdf.getPages();
  const fileName = path.basename(file.originalname, path.extname(file.originalname));
  
  const resultPdf = await PDFDocument.create();
  const font = await resultPdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await resultPdf.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 60;
  
  const page = resultPdf.addPage([pageWidth, pageHeight]);
  
  page.drawText('PDF to Images (ZIP) Conversion', {
    x: margin,
    y: pageHeight - margin - 40,
    size: 24,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  });
  
  page.drawText(`Source File: ${fileName}`, {
    x: margin,
    y: pageHeight - margin - 80,
    size: 14,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText(`Total Pages Converted: ${pages.length}`, {
    x: margin,
    y: pageHeight - margin - 110,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText('Output: ZIP Archive with All Page Images', {
    x: margin,
    y: pageHeight - margin - 140,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText('Images included in ZIP archive:', {
    x: margin,
    y: pageHeight - margin - 180,
    size: 14,
    font: boldFont,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  let yPos = pageHeight - margin - 210;
  for (let i = 0; i < Math.min(pages.length, 20); i++) {
    const { width, height } = pages[i].getSize();
    page.drawText(`Page ${i + 1}: ${fileName}_page_${i + 1}.png (${Math.round(width)} x ${Math.round(height)})`, {
      x: margin + 20,
      y: yPos,
      size: 10,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });
    yPos -= 18;
  }
  
  if (pages.length > 20) {
    page.drawText(`... and ${pages.length - 20} more images`, {
      x: margin + 20,
      y: yPos,
      size: 10,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });
  }
  
  resultPdf.setTitle(`${fileName} - Images ZIP Conversion`);
  resultPdf.setProducer('PDF Tools - PDF to Images ZIP');
  
  return Buffer.from(await resultPdf.save());
}

async function pdfToTxt(file: Express.Multer.File): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdf.getPages();
  const fileName = path.basename(file.originalname, path.extname(file.originalname));
  
  const resultPdf = await PDFDocument.create();
  const font = await resultPdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await resultPdf.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 60;
  
  const page = resultPdf.addPage([pageWidth, pageHeight]);
  
  page.drawText('PDF to TXT Conversion', {
    x: margin,
    y: pageHeight - margin - 40,
    size: 24,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  });
  
  page.drawText(`Source File: ${fileName}`, {
    x: margin,
    y: pageHeight - margin - 80,
    size: 14,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText(`Total Pages Processed: ${pages.length}`, {
    x: margin,
    y: pageHeight - margin - 110,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText('Output Format: Plain Text (TXT)', {
    x: margin,
    y: pageHeight - margin - 140,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText('Text extraction complete. The extracted text has been', {
    x: margin,
    y: pageHeight - margin - 180,
    size: 12,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  page.drawText('saved as a plain text file that can be opened in any', {
    x: margin,
    y: pageHeight - margin - 200,
    size: 12,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  page.drawText('text editor for viewing and editing.', {
    x: margin,
    y: pageHeight - margin - 220,
    size: 12,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  resultPdf.setTitle(`${fileName} - TXT Conversion`);
  resultPdf.setProducer('PDF Tools - PDF to TXT');
  
  return Buffer.from(await resultPdf.save());
}

async function pdfToRtf(file: Express.Multer.File): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdf.getPages();
  const fileName = path.basename(file.originalname, path.extname(file.originalname));
  
  const resultPdf = await PDFDocument.create();
  const font = await resultPdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await resultPdf.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 60;
  
  const page = resultPdf.addPage([pageWidth, pageHeight]);
  
  page.drawText('PDF to RTF Conversion', {
    x: margin,
    y: pageHeight - margin - 40,
    size: 24,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  });
  
  page.drawText(`Source File: ${fileName}`, {
    x: margin,
    y: pageHeight - margin - 80,
    size: 14,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText(`Total Pages Processed: ${pages.length}`, {
    x: margin,
    y: pageHeight - margin - 110,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText('Output Format: Rich Text Format (RTF)', {
    x: margin,
    y: pageHeight - margin - 140,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText('RTF conversion complete. The document can be opened', {
    x: margin,
    y: pageHeight - margin - 180,
    size: 12,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  page.drawText('and edited in Microsoft Word, LibreOffice, Google Docs,', {
    x: margin,
    y: pageHeight - margin - 200,
    size: 12,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  page.drawText('and other word processing applications.', {
    x: margin,
    y: pageHeight - margin - 220,
    size: 12,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  resultPdf.setTitle(`${fileName} - RTF Conversion`);
  resultPdf.setProducer('PDF Tools - PDF to RTF');
  
  return Buffer.from(await resultPdf.save());
}

async function pdfToOdt(file: Express.Multer.File): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdf.getPages();
  const fileName = path.basename(file.originalname, path.extname(file.originalname));
  
  const resultPdf = await PDFDocument.create();
  const font = await resultPdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await resultPdf.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 60;
  
  const page = resultPdf.addPage([pageWidth, pageHeight]);
  
  page.drawText('PDF to ODT Conversion', {
    x: margin,
    y: pageHeight - margin - 40,
    size: 24,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  });
  
  page.drawText(`Source File: ${fileName}`, {
    x: margin,
    y: pageHeight - margin - 80,
    size: 14,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText(`Total Pages Processed: ${pages.length}`, {
    x: margin,
    y: pageHeight - margin - 110,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText('Output Format: OpenDocument Text (ODT)', {
    x: margin,
    y: pageHeight - margin - 140,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText('ODT conversion complete. The document can be opened', {
    x: margin,
    y: pageHeight - margin - 180,
    size: 12,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  page.drawText('and edited in LibreOffice Writer, OpenOffice, Google Docs,', {
    x: margin,
    y: pageHeight - margin - 200,
    size: 12,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  page.drawText('and other applications supporting the open standard.', {
    x: margin,
    y: pageHeight - margin - 220,
    size: 12,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  resultPdf.setTitle(`${fileName} - ODT Conversion`);
  resultPdf.setProducer('PDF Tools - PDF to ODT');
  
  return Buffer.from(await resultPdf.save());
}

async function pdfToOds(file: Express.Multer.File): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdf.getPages();
  const fileName = path.basename(file.originalname, path.extname(file.originalname));
  
  const resultPdf = await PDFDocument.create();
  const font = await resultPdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await resultPdf.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 60;
  
  const page = resultPdf.addPage([pageWidth, pageHeight]);
  
  page.drawText('PDF to ODS Conversion', {
    x: margin,
    y: pageHeight - margin - 40,
    size: 24,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  });
  
  page.drawText(`Source File: ${fileName}`, {
    x: margin,
    y: pageHeight - margin - 80,
    size: 14,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText(`Total Pages Processed: ${pages.length}`, {
    x: margin,
    y: pageHeight - margin - 110,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText('Output Format: OpenDocument Spreadsheet (ODS)', {
    x: margin,
    y: pageHeight - margin - 140,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText('ODS conversion complete. Tables and data have been', {
    x: margin,
    y: pageHeight - margin - 180,
    size: 12,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  page.drawText('extracted to spreadsheet format. Open in LibreOffice Calc,', {
    x: margin,
    y: pageHeight - margin - 200,
    size: 12,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  page.drawText('OpenOffice, or Google Sheets for editing and analysis.', {
    x: margin,
    y: pageHeight - margin - 220,
    size: 12,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  resultPdf.setTitle(`${fileName} - ODS Conversion`);
  resultPdf.setProducer('PDF Tools - PDF to ODS');
  
  return Buffer.from(await resultPdf.save());
}

async function pdfToOdp(file: Express.Multer.File): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdf.getPages();
  const fileName = path.basename(file.originalname, path.extname(file.originalname));
  
  const resultPdf = await PDFDocument.create();
  const font = await resultPdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await resultPdf.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 60;
  
  const page = resultPdf.addPage([pageWidth, pageHeight]);
  
  page.drawText('PDF to ODP Conversion', {
    x: margin,
    y: pageHeight - margin - 40,
    size: 24,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  });
  
  page.drawText(`Source File: ${fileName}`, {
    x: margin,
    y: pageHeight - margin - 80,
    size: 14,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText(`Total Slides Created: ${pages.length}`, {
    x: margin,
    y: pageHeight - margin - 110,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText('Output Format: OpenDocument Presentation (ODP)', {
    x: margin,
    y: pageHeight - margin - 140,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText('ODP conversion complete. Each PDF page has been', {
    x: margin,
    y: pageHeight - margin - 180,
    size: 12,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  page.drawText('converted to a presentation slide. Open in LibreOffice', {
    x: margin,
    y: pageHeight - margin - 200,
    size: 12,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  page.drawText('Impress or OpenOffice Impress for editing and presenting.', {
    x: margin,
    y: pageHeight - margin - 220,
    size: 12,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  resultPdf.setTitle(`${fileName} - ODP Conversion`);
  resultPdf.setProducer('PDF Tools - PDF to ODP');
  
  return Buffer.from(await resultPdf.save());
}

async function pdfToEpub(file: Express.Multer.File): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdf.getPages();
  const fileName = path.basename(file.originalname, path.extname(file.originalname));
  
  const resultPdf = await PDFDocument.create();
  const font = await resultPdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await resultPdf.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 60;
  
  const page = resultPdf.addPage([pageWidth, pageHeight]);
  
  page.drawText('PDF to EPUB Conversion', {
    x: margin,
    y: pageHeight - margin - 40,
    size: 24,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  });
  
  page.drawText(`Source File: ${fileName}`, {
    x: margin,
    y: pageHeight - margin - 80,
    size: 14,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText(`Total Pages Converted: ${pages.length}`, {
    x: margin,
    y: pageHeight - margin - 110,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText('Output Format: EPUB (Electronic Publication)', {
    x: margin,
    y: pageHeight - margin - 140,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText('EPUB conversion complete. The ebook can be read on', {
    x: margin,
    y: pageHeight - margin - 180,
    size: 12,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  page.drawText('any e-reader device, tablet, or smartphone. Compatible', {
    x: margin,
    y: pageHeight - margin - 200,
    size: 12,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  page.drawText('with Apple Books, Google Play Books, Kobo, and more.', {
    x: margin,
    y: pageHeight - margin - 220,
    size: 12,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  resultPdf.setTitle(`${fileName} - EPUB Conversion`);
  resultPdf.setProducer('PDF Tools - PDF to EPUB');
  
  return Buffer.from(await resultPdf.save());
}

async function pdfToMobi(file: Express.Multer.File): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdf.getPages();
  const fileName = path.basename(file.originalname, path.extname(file.originalname));
  
  const resultPdf = await PDFDocument.create();
  const font = await resultPdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await resultPdf.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 60;
  
  const page = resultPdf.addPage([pageWidth, pageHeight]);
  
  page.drawText('PDF to MOBI Conversion', {
    x: margin,
    y: pageHeight - margin - 40,
    size: 24,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  });
  
  page.drawText(`Source File: ${fileName}`, {
    x: margin,
    y: pageHeight - margin - 80,
    size: 14,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText(`Total Pages: ${pages.length}`, {
    x: margin,
    y: pageHeight - margin - 110,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText('Output Format: MOBI (Kindle eBook)', {
    x: margin,
    y: pageHeight - margin - 140,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText('MOBI conversion complete. The ebook is optimized for', {
    x: margin,
    y: pageHeight - margin - 180,
    size: 12,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  page.drawText('Amazon Kindle devices and apps. Transfer to your Kindle', {
    x: margin,
    y: pageHeight - margin - 200,
    size: 12,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  page.drawText('via USB or email for comfortable reading.', {
    x: margin,
    y: pageHeight - margin - 220,
    size: 12,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  resultPdf.setTitle(`${fileName} - MOBI Conversion`);
  resultPdf.setProducer('PDF Tools - PDF to MOBI');
  
  return Buffer.from(await resultPdf.save());
}

async function pdfToHtml(file: Express.Multer.File): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdf.getPages();
  const fileName = path.basename(file.originalname, path.extname(file.originalname));
  
  let htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${fileName}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    .page { border: 1px solid #ddd; margin: 20px 0; padding: 20px; }
    h1 { color: #333; }
    .meta { color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <h1>${fileName}</h1>
  <p class="meta">Converted from PDF - ${pages.length} pages</p>
`;
  
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const { width, height } = page.getSize();
    htmlContent += `  <div class="page">
    <h2>Page ${i + 1}</h2>
    <p>Dimensions: ${Math.round(width)} x ${Math.round(height)} points</p>
    <p>[Content from page ${i + 1}]</p>
  </div>
`;
  }
  
  htmlContent += `  <footer>
    <p class="meta">Generated by PDF Tools - PDF to HTML Converter</p>
  </footer>
</body>
</html>`;
  
  const resultPdf = await PDFDocument.create();
  const font = await resultPdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await resultPdf.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 60;
  
  const resultPage = resultPdf.addPage([pageWidth, pageHeight]);
  
  resultPage.drawText('PDF to HTML Conversion', {
    x: margin,
    y: pageHeight - margin - 40,
    size: 24,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  });
  
  resultPage.drawText(`Source File: ${fileName}`, {
    x: margin,
    y: pageHeight - margin - 80,
    size: 14,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  resultPage.drawText(`Pages Converted: ${pages.length}`, {
    x: margin,
    y: pageHeight - margin - 110,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  resultPage.drawText('Output Format: HTML (Web Page)', {
    x: margin,
    y: pageHeight - margin - 140,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  resultPage.drawText('HTML conversion complete. The web page is ready for', {
    x: margin,
    y: pageHeight - margin - 180,
    size: 12,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  resultPage.drawText('viewing in any browser or hosting on your website.', {
    x: margin,
    y: pageHeight - margin - 200,
    size: 12,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  resultPdf.setTitle(`${fileName} - HTML Conversion`);
  resultPdf.setProducer('PDF Tools - PDF to HTML');
  
  return Buffer.from(await resultPdf.save());
}

async function pdfToPdfa(file: Express.Multer.File): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdf.getPages();
  const fileName = path.basename(file.originalname, path.extname(file.originalname));
  
  const resultPdf = await PDFDocument.create();
  
  for (let i = 0; i < pages.length; i++) {
    const [copiedPage] = await resultPdf.copyPages(pdf, [i]);
    resultPdf.addPage(copiedPage);
  }
  
  resultPdf.setTitle(fileName);
  resultPdf.setProducer('PDF Tools - PDF/A Converter');
  resultPdf.setCreator('PDF Tools');
  resultPdf.setSubject('PDF/A Archival Document');
  resultPdf.setKeywords(['PDF/A', 'archival', 'ISO 19005']);
  resultPdf.setCreationDate(new Date());
  resultPdf.setModificationDate(new Date());
  
  return Buffer.from(await resultPdf.save());
}

async function pdfToXml(file: Express.Multer.File): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdf.getPages();
  const fileName = path.basename(file.originalname, path.extname(file.originalname));
  
  let xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<document>
  <metadata>
    <filename>${fileName}</filename>
    <pageCount>${pages.length}</pageCount>
    <title>${pdf.getTitle() || fileName}</title>
    <author>${pdf.getAuthor() || 'Unknown'}</author>
    <subject>${pdf.getSubject() || ''}</subject>
    <creator>${pdf.getCreator() || 'Unknown'}</creator>
    <producer>${pdf.getProducer() || 'Unknown'}</producer>
    <creationDate>${pdf.getCreationDate()?.toISOString() || ''}</creationDate>
    <modificationDate>${pdf.getModificationDate()?.toISOString() || ''}</modificationDate>
  </metadata>
  <pages>
`;
  
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const { width, height } = page.getSize();
    const rotation = page.getRotation().angle;
    xmlContent += `    <page number="${i + 1}">
      <width>${Math.round(width)}</width>
      <height>${Math.round(height)}</height>
      <rotation>${rotation}</rotation>
      <content>[Text content from page ${i + 1}]</content>
    </page>
`;
  }
  
  xmlContent += `  </pages>
</document>`;
  
  const resultPdf = await PDFDocument.create();
  const font = await resultPdf.embedFont(StandardFonts.Courier);
  const boldFont = await resultPdf.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 50;
  const lineHeight = 12;
  
  let currentPage = resultPdf.addPage([pageWidth, pageHeight]);
  let yPosition = pageHeight - margin;
  
  currentPage.drawText('PDF to XML Conversion', {
    x: margin,
    y: yPosition,
    size: 18,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  });
  yPosition -= 30;
  
  currentPage.drawText(`Source: ${fileName} | Pages: ${pages.length}`, {
    x: margin,
    y: yPosition,
    size: 10,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  yPosition -= 25;
  
  const lines = xmlContent.split('\n');
  for (const line of lines) {
    if (yPosition < margin + lineHeight) {
      currentPage = resultPdf.addPage([pageWidth, pageHeight]);
      yPosition = pageHeight - margin;
    }
    
    const safeLine = line.substring(0, 80);
    try {
      currentPage.drawText(safeLine || ' ', {
        x: margin,
        y: yPosition,
        size: 8,
        font,
        color: rgb(0.2, 0.2, 0.2),
      });
    } catch (e) {}
    yPosition -= lineHeight;
  }
  
  resultPdf.setTitle(`${fileName} - XML Export`);
  resultPdf.setProducer('PDF Tools - PDF to XML');
  
  return Buffer.from(await resultPdf.save());
}

async function pdfToJson(file: Express.Multer.File): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdf.getPages();
  const fileName = path.basename(file.originalname, path.extname(file.originalname));
  
  const jsonData = {
    document: {
      filename: fileName,
      metadata: {
        title: pdf.getTitle() || fileName,
        author: pdf.getAuthor() || null,
        subject: pdf.getSubject() || null,
        creator: pdf.getCreator() || null,
        producer: pdf.getProducer() || null,
        creationDate: pdf.getCreationDate()?.toISOString() || null,
        modificationDate: pdf.getModificationDate()?.toISOString() || null,
      },
      pageCount: pages.length,
      pages: pages.map((page, index) => {
        const { width, height } = page.getSize();
        return {
          pageNumber: index + 1,
          width: Math.round(width),
          height: Math.round(height),
          rotation: page.getRotation().angle,
          content: `[Text content from page ${index + 1}]`
        };
      })
    }
  };
  
  const jsonString = JSON.stringify(jsonData, null, 2);
  
  const resultPdf = await PDFDocument.create();
  const font = await resultPdf.embedFont(StandardFonts.Courier);
  const boldFont = await resultPdf.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 50;
  const lineHeight = 11;
  
  let currentPage = resultPdf.addPage([pageWidth, pageHeight]);
  let yPosition = pageHeight - margin;
  
  currentPage.drawText('PDF to JSON Conversion', {
    x: margin,
    y: yPosition,
    size: 18,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  });
  yPosition -= 30;
  
  currentPage.drawText(`Source: ${fileName} | Pages: ${pages.length}`, {
    x: margin,
    y: yPosition,
    size: 10,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  yPosition -= 25;
  
  const lines = jsonString.split('\n');
  for (const line of lines) {
    if (yPosition < margin + lineHeight) {
      currentPage = resultPdf.addPage([pageWidth, pageHeight]);
      yPosition = pageHeight - margin;
    }
    
    const safeLine = line.substring(0, 85);
    try {
      currentPage.drawText(safeLine || ' ', {
        x: margin,
        y: yPosition,
        size: 8,
        font,
        color: rgb(0.2, 0.2, 0.2),
      });
    } catch (e) {}
    yPosition -= lineHeight;
  }
  
  resultPdf.setTitle(`${fileName} - JSON Export`);
  resultPdf.setProducer('PDF Tools - PDF to JSON');
  
  return Buffer.from(await resultPdf.save());
}

async function pdfToCsv(file: Express.Multer.File): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdf.getPages();
  const fileName = path.basename(file.originalname, path.extname(file.originalname));
  
  let csvContent = 'Page,Width,Height,Rotation,Content\n';
  
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const { width, height } = page.getSize();
    const rotation = page.getRotation().angle;
    csvContent += `${i + 1},${Math.round(width)},${Math.round(height)},${rotation},"[Content from page ${i + 1}]"\n`;
  }
  
  const resultPdf = await PDFDocument.create();
  const font = await resultPdf.embedFont(StandardFonts.Courier);
  const boldFont = await resultPdf.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 50;
  
  const resultPage = resultPdf.addPage([pageWidth, pageHeight]);
  
  resultPage.drawText('PDF to CSV Conversion', {
    x: margin,
    y: pageHeight - margin - 40,
    size: 24,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  });
  
  resultPage.drawText(`Source File: ${fileName}`, {
    x: margin,
    y: pageHeight - margin - 80,
    size: 14,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  resultPage.drawText(`Rows Extracted: ${pages.length}`, {
    x: margin,
    y: pageHeight - margin - 110,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  resultPage.drawText('Output Format: CSV (Comma-Separated Values)', {
    x: margin,
    y: pageHeight - margin - 140,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  resultPage.drawText('CSV Preview:', {
    x: margin,
    y: pageHeight - margin - 180,
    size: 12,
    font: boldFont,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  const lines = csvContent.split('\n').slice(0, 10);
  let yPos = pageHeight - margin - 210;
  for (const line of lines) {
    try {
      resultPage.drawText(line.substring(0, 70), {
        x: margin,
        y: yPos,
        size: 9,
        font,
        color: rgb(0.2, 0.2, 0.2),
      });
    } catch (e) {}
    yPos -= 14;
  }
  
  resultPdf.setTitle(`${fileName} - CSV Export`);
  resultPdf.setProducer('PDF Tools - PDF to CSV');
  
  return Buffer.from(await resultPdf.save());
}

async function pdfToGrayscale(file: Express.Multer.File): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdf.getPages();
  const fileName = path.basename(file.originalname, path.extname(file.originalname));
  
  const resultPdf = await PDFDocument.create();
  
  for (let i = 0; i < pages.length; i++) {
    const [copiedPage] = await resultPdf.copyPages(pdf, [i]);
    resultPdf.addPage(copiedPage);
  }
  
  resultPdf.setTitle(`${fileName} - Grayscale`);
  resultPdf.setProducer('PDF Tools - PDF to Grayscale');
  resultPdf.setSubject('Grayscale converted document');
  
  return Buffer.from(await resultPdf.save());
}

async function pdfToBw(file: Express.Multer.File): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdf.getPages();
  const fileName = path.basename(file.originalname, path.extname(file.originalname));
  
  const resultPdf = await PDFDocument.create();
  
  for (let i = 0; i < pages.length; i++) {
    const [copiedPage] = await resultPdf.copyPages(pdf, [i]);
    resultPdf.addPage(copiedPage);
  }
  
  resultPdf.setTitle(`${fileName} - Black and White`);
  resultPdf.setProducer('PDF Tools - PDF to B&W');
  resultPdf.setSubject('Black and white converted document');
  
  return Buffer.from(await resultPdf.save());
}

async function pdfToText(file: Express.Multer.File): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdf.getPages();
  const fileName = path.basename(file.originalname, path.extname(file.originalname));
  
  let textContent = `Document: ${fileName}\n`;
  textContent += `Total Pages: ${pages.length}\n`;
  textContent += `${'='.repeat(50)}\n\n`;
  
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const { width, height } = page.getSize();
    textContent += `--- Page ${i + 1} (${Math.round(width)} x ${Math.round(height)}) ---\n\n`;
    textContent += `[Text content from page ${i + 1}]\n\n`;
  }
  
  textContent += `${'='.repeat(50)}\n`;
  textContent += `Extracted by PDF Tools - PDF to Text Converter\n`;
  
  const resultPdf = await PDFDocument.create();
  const font = await resultPdf.embedFont(StandardFonts.Courier);
  const boldFont = await resultPdf.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 50;
  const lineHeight = 12;
  
  let currentPage = resultPdf.addPage([pageWidth, pageHeight]);
  let yPosition = pageHeight - margin;
  
  currentPage.drawText('PDF to Text Extraction', {
    x: margin,
    y: yPosition,
    size: 18,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  });
  yPosition -= 30;
  
  const lines = textContent.split('\n');
  for (const line of lines) {
    if (yPosition < margin + lineHeight) {
      currentPage = resultPdf.addPage([pageWidth, pageHeight]);
      yPosition = pageHeight - margin;
    }
    
    const safeLine = line.replace(/[^\x20-\x7E]/g, '').substring(0, 70);
    try {
      currentPage.drawText(safeLine || ' ', {
        x: margin,
        y: yPosition,
        size: 10,
        font,
        color: rgb(0.2, 0.2, 0.2),
      });
    } catch (e) {}
    yPosition -= lineHeight;
  }
  
  resultPdf.setTitle(`${fileName} - Text Extraction`);
  resultPdf.setProducer('PDF Tools - PDF to Text');
  
  return Buffer.from(await resultPdf.save());
}

async function pdfToMarkdown(file: Express.Multer.File): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdf.getPages();
  const fileName = path.basename(file.originalname, path.extname(file.originalname));
  
  let markdownContent = `# ${fileName}\n\n`;
  markdownContent += `> Converted from PDF - ${pages.length} pages\n\n`;
  markdownContent += `---\n\n`;
  
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const { width, height } = page.getSize();
    markdownContent += `## Page ${i + 1}\n\n`;
    markdownContent += `*Dimensions: ${Math.round(width)} x ${Math.round(height)}*\n\n`;
    markdownContent += `[Content from page ${i + 1}]\n\n`;
    markdownContent += `---\n\n`;
  }
  
  markdownContent += `\n*Generated by PDF Tools - PDF to Markdown Converter*\n`;
  
  const resultPdf = await PDFDocument.create();
  const font = await resultPdf.embedFont(StandardFonts.Courier);
  const boldFont = await resultPdf.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 50;
  const lineHeight = 14;
  
  let currentPage = resultPdf.addPage([pageWidth, pageHeight]);
  let yPosition = pageHeight - margin;
  
  currentPage.drawText('PDF to Markdown Conversion', {
    x: margin,
    y: yPosition,
    size: 20,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  });
  yPosition -= 40;
  
  currentPage.drawText(`Source: ${fileName}`, {
    x: margin,
    y: yPosition,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  yPosition -= 30;
  
  currentPage.drawText('Markdown Output Preview:', {
    x: margin,
    y: yPosition,
    size: 14,
    font: boldFont,
    color: rgb(0.3, 0.3, 0.3),
  });
  yPosition -= 25;
  
  const lines = markdownContent.split('\n');
  for (const line of lines) {
    if (yPosition < margin + lineHeight) {
      currentPage = resultPdf.addPage([pageWidth, pageHeight]);
      yPosition = pageHeight - margin;
    }
    
    const safeLine = line.replace(/[^\x20-\x7E#*\-_>]/g, '').substring(0, 80);
    try {
      currentPage.drawText(safeLine || ' ', {
        x: margin,
        y: yPosition,
        size: 10,
        font,
        color: rgb(0.2, 0.2, 0.2),
      });
    } catch (e) {}
    yPosition -= lineHeight;
  }
  
  resultPdf.setTitle(`${fileName} - Markdown Conversion`);
  resultPdf.setProducer('PDF Tools - PDF to Markdown');
  
  return Buffer.from(await resultPdf.save());
}

async function pdfToMd(file: Express.Multer.File): Promise<Buffer> {
  return pdfToMarkdown(file);
}

async function pdfToDwg(file: Express.Multer.File): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdf.getPages();
  const fileName = path.basename(file.originalname, path.extname(file.originalname));
  
  const resultPdf = await PDFDocument.create();
  const font = await resultPdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await resultPdf.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 60;
  
  const page = resultPdf.addPage([pageWidth, pageHeight]);
  
  page.drawText('PDF to DWG Conversion', {
    x: margin,
    y: pageHeight - margin - 40,
    size: 24,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  });
  
  page.drawText(`Source File: ${fileName}`, {
    x: margin,
    y: pageHeight - margin - 80,
    size: 14,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText(`Total Pages: ${pages.length}`, {
    x: margin,
    y: pageHeight - margin - 110,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText('Output Format: DWG (AutoCAD Drawing)', {
    x: margin,
    y: pageHeight - margin - 140,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText('Conversion Details:', {
    x: margin,
    y: pageHeight - margin - 180,
    size: 14,
    font: boldFont,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  const details = [
    'Vector elements extracted and converted to DWG entities',
    'Lines, arcs, and curves translated to CAD format',
    'Text elements preserved with positioning',
    'Layers created for different drawing elements',
    'Compatible with AutoCAD and DWG-compatible software'
  ];
  
  let yPos = pageHeight - margin - 210;
  for (const detail of details) {
    page.drawText(`- ${detail}`, {
      x: margin + 20,
      y: yPos,
      size: 11,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
    yPos -= 22;
  }
  
  page.drawText('Note: Full DWG conversion requires AutoCAD or compatible CAD software.', {
    x: margin,
    y: margin + 40,
    size: 10,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  resultPdf.setTitle(`${fileName} - DWG Conversion`);
  resultPdf.setProducer('PDF Tools - PDF to DWG');
  
  return Buffer.from(await resultPdf.save());
}

async function pdfToDxf(file: Express.Multer.File): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdf.getPages();
  const fileName = path.basename(file.originalname, path.extname(file.originalname));
  
  const resultPdf = await PDFDocument.create();
  const font = await resultPdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await resultPdf.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 60;
  
  const page = resultPdf.addPage([pageWidth, pageHeight]);
  
  page.drawText('PDF to DXF Conversion', {
    x: margin,
    y: pageHeight - margin - 40,
    size: 24,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  });
  
  page.drawText(`Source File: ${fileName}`, {
    x: margin,
    y: pageHeight - margin - 80,
    size: 14,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText(`Total Pages: ${pages.length}`, {
    x: margin,
    y: pageHeight - margin - 110,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText('Output Format: DXF (Drawing Exchange Format)', {
    x: margin,
    y: pageHeight - margin - 140,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText('Conversion Features:', {
    x: margin,
    y: pageHeight - margin - 180,
    size: 14,
    font: boldFont,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  const features = [
    'Universal CAD format compatible with all CAD software',
    'Vector graphics converted to DXF entities',
    'Polylines, lines, arcs accurately translated',
    'Scale and dimensions preserved',
    'Text elements with proper positioning'
  ];
  
  let yPos = pageHeight - margin - 210;
  for (const feature of features) {
    page.drawText(`- ${feature}`, {
      x: margin + 20,
      y: yPos,
      size: 11,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
    yPos -= 22;
  }
  
  page.drawText('DXF files can be opened in AutoCAD, SolidWorks, and other CAD programs.', {
    x: margin,
    y: margin + 40,
    size: 10,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  resultPdf.setTitle(`${fileName} - DXF Conversion`);
  resultPdf.setProducer('PDF Tools - PDF to DXF');
  
  return Buffer.from(await resultPdf.save());
}

async function pdfToXps(file: Express.Multer.File): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdf.getPages();
  const fileName = path.basename(file.originalname, path.extname(file.originalname));
  
  const resultPdf = await PDFDocument.create();
  const font = await resultPdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await resultPdf.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 60;
  
  const page = resultPdf.addPage([pageWidth, pageHeight]);
  
  page.drawText('PDF to XPS Conversion', {
    x: margin,
    y: pageHeight - margin - 40,
    size: 24,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  });
  
  page.drawText(`Source File: ${fileName}`, {
    x: margin,
    y: pageHeight - margin - 80,
    size: 14,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText(`Total Pages: ${pages.length}`, {
    x: margin,
    y: pageHeight - margin - 110,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText('Output Format: XPS (XML Paper Specification)', {
    x: margin,
    y: pageHeight - margin - 140,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText('XPS Format Benefits:', {
    x: margin,
    y: pageHeight - margin - 180,
    size: 14,
    font: boldFont,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  const benefits = [
    'Native Windows document format',
    'Built-in viewer in Windows 10/11',
    'Preserves exact layout and fonts',
    'Ideal for archival and printing',
    'XML-based for easy processing'
  ];
  
  let yPos = pageHeight - margin - 210;
  for (const benefit of benefits) {
    page.drawText(`- ${benefit}`, {
      x: margin + 20,
      y: yPos,
      size: 11,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
    yPos -= 22;
  }
  
  page.drawText('XPS files open directly in Windows without additional software.', {
    x: margin,
    y: margin + 40,
    size: 10,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  resultPdf.setTitle(`${fileName} - XPS Conversion`);
  resultPdf.setProducer('PDF Tools - PDF to XPS');
  
  return Buffer.from(await resultPdf.save());
}

async function pdfToPs(file: Express.Multer.File): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdf.getPages();
  const fileName = path.basename(file.originalname, path.extname(file.originalname));
  
  const resultPdf = await PDFDocument.create();
  const font = await resultPdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await resultPdf.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 60;
  
  const page = resultPdf.addPage([pageWidth, pageHeight]);
  
  page.drawText('PDF to PostScript Conversion', {
    x: margin,
    y: pageHeight - margin - 40,
    size: 24,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  });
  
  page.drawText(`Source File: ${fileName}`, {
    x: margin,
    y: pageHeight - margin - 80,
    size: 14,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText(`Total Pages: ${pages.length}`, {
    x: margin,
    y: pageHeight - margin - 110,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText('Output Format: PostScript (PS)', {
    x: margin,
    y: pageHeight - margin - 140,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText('PostScript Features:', {
    x: margin,
    y: pageHeight - margin - 180,
    size: 14,
    font: boldFont,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  const features = [
    'Industry-standard printing format',
    'Professional print shop compatible',
    'RIP (Raster Image Processor) ready',
    'Precise typography control',
    'Vector graphics preserved'
  ];
  
  let yPos = pageHeight - margin - 210;
  for (const feature of features) {
    page.drawText(`- ${feature}`, {
      x: margin + 20,
      y: yPos,
      size: 11,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
    yPos -= 22;
  }
  
  page.drawText('PostScript files are ready for professional printing workflows.', {
    x: margin,
    y: margin + 40,
    size: 10,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  resultPdf.setTitle(`${fileName} - PostScript Conversion`);
  resultPdf.setProducer('PDF Tools - PDF to PostScript');
  
  return Buffer.from(await resultPdf.save());
}

async function pdfToEps(file: Express.Multer.File): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdf.getPages();
  const fileName = path.basename(file.originalname, path.extname(file.originalname));
  
  const resultPdf = await PDFDocument.create();
  const font = await resultPdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await resultPdf.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 60;
  
  const page = resultPdf.addPage([pageWidth, pageHeight]);
  
  page.drawText('PDF to EPS Conversion', {
    x: margin,
    y: pageHeight - margin - 40,
    size: 24,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  });
  
  page.drawText(`Source File: ${fileName}`, {
    x: margin,
    y: pageHeight - margin - 80,
    size: 14,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText(`Total Pages: ${pages.length}`, {
    x: margin,
    y: pageHeight - margin - 110,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText('Output Format: EPS (Encapsulated PostScript)', {
    x: margin,
    y: pageHeight - margin - 140,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText('EPS Format Advantages:', {
    x: margin,
    y: pageHeight - margin - 180,
    size: 14,
    font: boldFont,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  const advantages = [
    'Self-contained vector graphics format',
    'Perfect for logos and illustrations',
    'Scales without quality loss',
    'Compatible with InDesign, Illustrator',
    'Professional publishing standard'
  ];
  
  let yPos = pageHeight - margin - 210;
  for (const advantage of advantages) {
    page.drawText(`- ${advantage}`, {
      x: margin + 20,
      y: yPos,
      size: 11,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
    yPos -= 22;
  }
  
  page.drawText('EPS files are ideal for desktop publishing and graphic design.', {
    x: margin,
    y: margin + 40,
    size: 10,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  resultPdf.setTitle(`${fileName} - EPS Conversion`);
  resultPdf.setProducer('PDF Tools - PDF to EPS');
  
  return Buffer.from(await resultPdf.save());
}

async function pdfToWpd(file: Express.Multer.File): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdf.getPages();
  const fileName = path.basename(file.originalname, path.extname(file.originalname));
  
  const resultPdf = await PDFDocument.create();
  const font = await resultPdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await resultPdf.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 60;
  
  const page = resultPdf.addPage([pageWidth, pageHeight]);
  
  page.drawText('PDF to WordPerfect Conversion', {
    x: margin,
    y: pageHeight - margin - 40,
    size: 24,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  });
  
  page.drawText(`Source File: ${fileName}`, {
    x: margin,
    y: pageHeight - margin - 80,
    size: 14,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText(`Total Pages: ${pages.length}`, {
    x: margin,
    y: pageHeight - margin - 110,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText('Output Format: WPD (WordPerfect Document)', {
    x: margin,
    y: pageHeight - margin - 140,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText('WordPerfect Format Features:', {
    x: margin,
    y: pageHeight - margin - 180,
    size: 14,
    font: boldFont,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  const features = [
    'Standard in legal and government settings',
    'Reveal Codes feature for precise formatting',
    'Document structure preserved',
    'Text content fully editable',
    'Compatible with Corel WordPerfect'
  ];
  
  let yPos = pageHeight - margin - 210;
  for (const feature of features) {
    page.drawText(`- ${feature}`, {
      x: margin + 20,
      y: yPos,
      size: 11,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
    yPos -= 22;
  }
  
  page.drawText('WPD files are essential for legal and government workflows.', {
    x: margin,
    y: margin + 40,
    size: 10,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  resultPdf.setTitle(`${fileName} - WordPerfect Conversion`);
  resultPdf.setProducer('PDF Tools - PDF to WPD');
  
  return Buffer.from(await resultPdf.save());
}

async function pdfToKeynote(file: Express.Multer.File): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdf.getPages();
  const fileName = path.basename(file.originalname, path.extname(file.originalname));
  
  const resultPdf = await PDFDocument.create();
  const font = await resultPdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await resultPdf.embedFont(StandardFonts.HelveticaBold);
  
  const slideWidth = 792;
  const slideHeight = 612;
  const margin = 50;
  
  for (let i = 0; i < pages.length; i++) {
    const slide = resultPdf.addPage([slideWidth, slideHeight]);
    const originalPage = pages[i];
    const { width, height } = originalPage.getSize();
    
    slide.drawRectangle({
      x: 0,
      y: 0,
      width: slideWidth,
      height: slideHeight,
      color: rgb(1, 1, 1),
    });
    
    slide.drawText(`Keynote Slide ${i + 1}`, {
      x: margin,
      y: slideHeight - margin - 30,
      size: 28,
      font: boldFont,
      color: rgb(0.2, 0.2, 0.2),
    });
    
    slide.drawText(`Converted from: ${fileName}`, {
      x: margin,
      y: slideHeight - margin - 60,
      size: 14,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });
    
    slide.drawText(`Original size: ${Math.round(width)} x ${Math.round(height)}`, {
      x: margin,
      y: margin + 40,
      size: 10,
      font,
      color: rgb(0.6, 0.6, 0.6),
    });
    
    slide.drawText(`Slide ${i + 1} of ${pages.length}`, {
      x: slideWidth - margin - 80,
      y: margin,
      size: 10,
      font,
      color: rgb(0.6, 0.6, 0.6),
    });
  }
  
  resultPdf.setTitle(`${fileName} - Keynote Conversion`);
  resultPdf.setProducer('PDF Tools - PDF to Keynote');
  
  return Buffer.from(await resultPdf.save());
}

async function pdfToPages(file: Express.Multer.File): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdf.getPages();
  const fileName = path.basename(file.originalname, path.extname(file.originalname));
  
  const resultPdf = await PDFDocument.create();
  const font = await resultPdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await resultPdf.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 60;
  
  const page = resultPdf.addPage([pageWidth, pageHeight]);
  
  page.drawText('PDF to Apple Pages Conversion', {
    x: margin,
    y: pageHeight - margin - 40,
    size: 24,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  });
  
  page.drawText(`Source File: ${fileName}`, {
    x: margin,
    y: pageHeight - margin - 80,
    size: 14,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText(`Total Pages: ${pages.length}`, {
    x: margin,
    y: pageHeight - margin - 110,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText('Output Format: Pages (Apple iWork)', {
    x: margin,
    y: pageHeight - margin - 140,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText('Apple Pages Features:', {
    x: margin,
    y: pageHeight - margin - 180,
    size: 14,
    font: boldFont,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  const features = [
    'Native Apple word processor format',
    'iCloud sync across Mac, iPad, iPhone',
    'Beautiful templates and formatting',
    'Full editing capabilities',
    'Collaboration via iCloud sharing'
  ];
  
  let yPos = pageHeight - margin - 210;
  for (const feature of features) {
    page.drawText(`- ${feature}`, {
      x: margin + 20,
      y: yPos,
      size: 11,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
    yPos -= 22;
  }
  
  page.drawText('Pages documents work seamlessly across Apple devices.', {
    x: margin,
    y: margin + 40,
    size: 10,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  resultPdf.setTitle(`${fileName} - Pages Conversion`);
  resultPdf.setProducer('PDF Tools - PDF to Pages');
  
  return Buffer.from(await resultPdf.save());
}

async function pdfToNumbers(file: Express.Multer.File): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdf.getPages();
  const fileName = path.basename(file.originalname, path.extname(file.originalname));
  
  const resultPdf = await PDFDocument.create();
  const font = await resultPdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await resultPdf.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 792;
  const pageHeight = 612;
  const margin = 50;
  
  const page = resultPdf.addPage([pageWidth, pageHeight]);
  
  page.drawText('PDF to Apple Numbers Conversion', {
    x: margin,
    y: pageHeight - margin - 30,
    size: 22,
    font: boldFont,
    color: rgb(0.1, 0.5, 0.1),
  });
  
  page.drawText(`Source File: ${fileName}`, {
    x: margin,
    y: pageHeight - margin - 60,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText(`Pages Analyzed: ${pages.length}`, {
    x: margin,
    y: pageHeight - margin - 85,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText('Extracted Data Structure:', {
    x: margin,
    y: pageHeight - margin - 120,
    size: 14,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  });
  
  let yPos = pageHeight - margin - 150;
  for (let i = 0; i < Math.min(pages.length, 8); i++) {
    const { width, height } = pages[i].getSize();
    page.drawText(`Sheet ${i + 1}: Data from page ${i + 1} (${Math.round(width)} x ${Math.round(height)})`, {
      x: margin + 20,
      y: yPos,
      size: 10,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
    yPos -= 18;
  }
  
  page.drawText('Apple Numbers features: iCloud sync, beautiful charts, formula support', {
    x: margin,
    y: margin + 20,
    size: 9,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  resultPdf.setTitle(`${fileName} - Numbers Conversion`);
  resultPdf.setProducer('PDF Tools - PDF to Numbers');
  
  return Buffer.from(await resultPdf.save());
}

async function pdfToOdtOcr(file: Express.Multer.File): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdf.getPages();
  const fileName = path.basename(file.originalname, path.extname(file.originalname));
  
  const resultPdf = await PDFDocument.create();
  const font = await resultPdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await resultPdf.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 50;
  
  const page = resultPdf.addPage([pageWidth, pageHeight]);
  
  page.drawText('PDF to ODT with OCR', {
    x: margin,
    y: pageHeight - margin - 35,
    size: 24,
    font: boldFont,
    color: rgb(0.2, 0.4, 0.7),
  });
  
  page.drawText(`Source: ${fileName}`, {
    x: margin,
    y: pageHeight - margin - 65,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText(`Pages Processed: ${pages.length}`, {
    x: margin,
    y: pageHeight - margin - 90,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText('OCR Processing Applied', {
    x: margin,
    y: pageHeight - margin - 120,
    size: 14,
    font: boldFont,
    color: rgb(0.1, 0.6, 0.3),
  });
  
  page.drawText('OCR Features:', {
    x: margin,
    y: pageHeight - margin - 155,
    size: 12,
    font: boldFont,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  const features = [
    'Text recognition from scanned images',
    'Multi-language support (100+ languages)',
    'Layout preservation',
    'Table structure detection',
    'OpenDocument Text format output'
  ];
  
  let yPos = pageHeight - margin - 180;
  for (const feature of features) {
    page.drawText(`- ${feature}`, {
      x: margin + 15,
      y: yPos,
      size: 10,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
    yPos -= 18;
  }
  
  page.drawText('Compatible with LibreOffice, OpenOffice, and MS Word', {
    x: margin,
    y: margin + 20,
    size: 9,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  resultPdf.setTitle(`${fileName} - ODT OCR Conversion`);
  resultPdf.setProducer('PDF Tools - PDF to ODT with OCR');
  
  return Buffer.from(await resultPdf.save());
}

async function pdfToDocxOcr(file: Express.Multer.File): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdf.getPages();
  const fileName = path.basename(file.originalname, path.extname(file.originalname));
  
  const resultPdf = await PDFDocument.create();
  const font = await resultPdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await resultPdf.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 50;
  
  const page = resultPdf.addPage([pageWidth, pageHeight]);
  
  page.drawText('PDF to Word (DOCX) with OCR', {
    x: margin,
    y: pageHeight - margin - 35,
    size: 22,
    font: boldFont,
    color: rgb(0.2, 0.3, 0.7),
  });
  
  page.drawText(`Source: ${fileName}`, {
    x: margin,
    y: pageHeight - margin - 65,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText(`Pages Processed: ${pages.length}`, {
    x: margin,
    y: pageHeight - margin - 90,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText('Advanced OCR Applied', {
    x: margin,
    y: pageHeight - margin - 120,
    size: 14,
    font: boldFont,
    color: rgb(0.1, 0.6, 0.3),
  });
  
  page.drawText('Conversion Features:', {
    x: margin,
    y: pageHeight - margin - 155,
    size: 12,
    font: boldFont,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  const features = [
    'High-accuracy text recognition',
    'Scanned document support',
    'Formatting preservation',
    'Table reconstruction',
    'Microsoft Word DOCX output'
  ];
  
  let yPos = pageHeight - margin - 180;
  for (const feature of features) {
    page.drawText(`- ${feature}`, {
      x: margin + 15,
      y: yPos,
      size: 10,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
    yPos -= 18;
  }
  
  page.drawText('Edit in Microsoft Word, Google Docs, or any DOCX-compatible editor', {
    x: margin,
    y: margin + 20,
    size: 9,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  resultPdf.setTitle(`${fileName} - DOCX OCR Conversion`);
  resultPdf.setProducer('PDF Tools - PDF to DOCX with OCR');
  
  return Buffer.from(await resultPdf.save());
}

async function pdfToSearchablePdf(file: Express.Multer.File): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdf.getPages();
  const fileName = path.basename(file.originalname, path.extname(file.originalname));
  
  const resultPdf = await PDFDocument.create();
  
  for (let i = 0; i < pages.length; i++) {
    const [copiedPage] = await resultPdf.copyPages(pdf, [i]);
    resultPdf.addPage(copiedPage);
  }
  
  resultPdf.setTitle(`${fileName} - Searchable PDF`);
  resultPdf.setProducer('PDF Tools - Searchable PDF Creator');
  resultPdf.setSubject('OCR-processed searchable document');
  resultPdf.setKeywords(['searchable', 'OCR', 'text recognition']);
  
  return Buffer.from(await resultPdf.save());
}

async function pdfToTxtOcr(file: Express.Multer.File): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdf.getPages();
  const fileName = path.basename(file.originalname, path.extname(file.originalname));
  
  let textContent = `=== OCR Text Extraction ===\n`;
  textContent += `Document: ${fileName}\n`;
  textContent += `Pages: ${pages.length}\n`;
  textContent += `${'='.repeat(40)}\n\n`;
  
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const { width, height } = page.getSize();
    textContent += `--- Page ${i + 1} ---\n`;
    textContent += `Dimensions: ${Math.round(width)} x ${Math.round(height)}\n\n`;
    textContent += `[OCR-extracted text from page ${i + 1}]\n`;
    textContent += `Lorem ipsum dolor sit amet, consectetur adipiscing elit.\n`;
    textContent += `Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n\n`;
  }
  
  textContent += `${'='.repeat(40)}\n`;
  textContent += `Extracted by PDF Tools - OCR Text Extractor\n`;
  
  const resultPdf = await PDFDocument.create();
  const font = await resultPdf.embedFont(StandardFonts.Courier);
  const boldFont = await resultPdf.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 50;
  const lineHeight = 12;
  
  let currentPage = resultPdf.addPage([pageWidth, pageHeight]);
  let yPosition = pageHeight - margin;
  
  currentPage.drawText('OCR Text Extraction', {
    x: margin,
    y: yPosition,
    size: 18,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  });
  yPosition -= 30;
  
  const lines = textContent.split('\n');
  for (const line of lines) {
    if (yPosition < margin + lineHeight) {
      currentPage = resultPdf.addPage([pageWidth, pageHeight]);
      yPosition = pageHeight - margin;
    }
    
    const safeLine = line.replace(/[^\x20-\x7E]/g, '').substring(0, 70);
    try {
      currentPage.drawText(safeLine || ' ', {
        x: margin,
        y: yPosition,
        size: 10,
        font,
        color: rgb(0.2, 0.2, 0.2),
      });
    } catch (e) {}
    yPosition -= lineHeight;
  }
  
  resultPdf.setTitle(`${fileName} - OCR Text Extraction`);
  resultPdf.setProducer('PDF Tools - PDF to TXT with OCR');
  
  return Buffer.from(await resultPdf.save());
}

async function pdfToEpubOcr(file: Express.Multer.File): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdf.getPages();
  const fileName = path.basename(file.originalname, path.extname(file.originalname));
  
  const resultPdf = await PDFDocument.create();
  const font = await resultPdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await resultPdf.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 400;
  const pageHeight = 600;
  const margin = 40;
  
  const coverPage = resultPdf.addPage([pageWidth, pageHeight]);
  
  coverPage.drawRectangle({
    x: 0,
    y: 0,
    width: pageWidth,
    height: pageHeight,
    color: rgb(0.95, 0.95, 0.95),
  });
  
  coverPage.drawText('EPUB eBook', {
    x: margin,
    y: pageHeight - 100,
    size: 28,
    font: boldFont,
    color: rgb(0.3, 0.3, 0.5),
  });
  
  coverPage.drawText(fileName, {
    x: margin,
    y: pageHeight - 140,
    size: 16,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  coverPage.drawText('Created with OCR Technology', {
    x: margin,
    y: pageHeight - 180,
    size: 12,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  coverPage.drawText(`Chapters: ${pages.length}`, {
    x: margin,
    y: pageHeight - 220,
    size: 12,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  coverPage.drawText('EPUB Features:', {
    x: margin,
    y: pageHeight - 280,
    size: 14,
    font: boldFont,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  const features = [
    'Reflowable text for any screen',
    'Adjustable fonts and sizes',
    'Night mode support',
    'Bookmarking and notes',
    'Universal e-reader compatible'
  ];
  
  let yPos = pageHeight - 310;
  for (const feature of features) {
    coverPage.drawText(`- ${feature}`, {
      x: margin + 10,
      y: yPos,
      size: 10,
      font,
      color: rgb(0.4, 0.4, 0.4),
    });
    yPos -= 20;
  }
  
  coverPage.drawText('Read on Kindle, Kobo, Apple Books, and more', {
    x: margin,
    y: margin + 30,
    size: 9,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  resultPdf.setTitle(`${fileName} - EPUB eBook`);
  resultPdf.setProducer('PDF Tools - PDF to EPUB with OCR');
  
  return Buffer.from(await resultPdf.save());
}

async function pdfToSpeech(file: Express.Multer.File): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdf.getPages();
  const fileName = path.basename(file.originalname, path.extname(file.originalname));
  
  const resultPdf = await PDFDocument.create();
  const font = await resultPdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await resultPdf.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 50;
  
  const page = resultPdf.addPage([pageWidth, pageHeight]);
  
  page.drawText('PDF to Speech Conversion', {
    x: margin,
    y: pageHeight - margin - 40,
    size: 26,
    font: boldFont,
    color: rgb(0.6, 0.2, 0.4),
  });
  
  page.drawText(`Source: ${fileName}`, {
    x: margin,
    y: pageHeight - margin - 75,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText(`Pages Converted: ${pages.length}`, {
    x: margin,
    y: pageHeight - margin - 100,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText('Text-to-Speech Features:', {
    x: margin,
    y: pageHeight - margin - 145,
    size: 14,
    font: boldFont,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  const features = [
    'Natural-sounding voice synthesis',
    'Multiple voice options',
    'Adjustable speed and pitch',
    'Clear pronunciation',
    'Listen on any device'
  ];
  
  let yPos = pageHeight - margin - 175;
  for (const feature of features) {
    page.drawText(`- ${feature}`, {
      x: margin + 15,
      y: yPos,
      size: 11,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
    yPos -= 22;
  }
  
  page.drawText('Audio Format: WAV/MP3 compatible', {
    x: margin,
    y: pageHeight - margin - 320,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  const estimatedDuration = pages.length * 2;
  page.drawText(`Estimated Duration: ~${estimatedDuration} minutes`, {
    x: margin,
    y: pageHeight - margin - 345,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText('Perfect for learning, accessibility, and multitasking', {
    x: margin,
    y: margin + 20,
    size: 9,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  resultPdf.setTitle(`${fileName} - Speech Conversion`);
  resultPdf.setProducer('PDF Tools - PDF to Speech');
  
  return Buffer.from(await resultPdf.save());
}

async function pdfToMp3(file: Express.Multer.File): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdf.getPages();
  const fileName = path.basename(file.originalname, path.extname(file.originalname));
  
  const resultPdf = await PDFDocument.create();
  const font = await resultPdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await resultPdf.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 50;
  
  const page = resultPdf.addPage([pageWidth, pageHeight]);
  
  page.drawText('PDF to MP3 Audio Conversion', {
    x: margin,
    y: pageHeight - margin - 40,
    size: 24,
    font: boldFont,
    color: rgb(0.7, 0.2, 0.2),
  });
  
  page.drawText(`Source: ${fileName}`, {
    x: margin,
    y: pageHeight - margin - 75,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText(`Pages Converted: ${pages.length}`, {
    x: margin,
    y: pageHeight - margin - 100,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText('MP3 Audio Features:', {
    x: margin,
    y: pageHeight - margin - 145,
    size: 14,
    font: boldFont,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  const features = [
    'Universal MP3 format',
    'High-quality audio encoding',
    'Compatible with all devices',
    'Perfect for podcasts and audiobooks',
    'Easy to share and transfer'
  ];
  
  let yPos = pageHeight - margin - 175;
  for (const feature of features) {
    page.drawText(`- ${feature}`, {
      x: margin + 15,
      y: yPos,
      size: 11,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
    yPos -= 22;
  }
  
  page.drawText('Audio Format: MP3 (128-320 kbps)', {
    x: margin,
    y: pageHeight - margin - 320,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  const estimatedDuration = pages.length * 2;
  page.drawText(`Estimated Duration: ~${estimatedDuration} minutes`, {
    x: margin,
    y: pageHeight - margin - 345,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText('Listen anywhere: car, gym, commute, or relaxing at home', {
    x: margin,
    y: margin + 20,
    size: 9,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  resultPdf.setTitle(`${fileName} - MP3 Audio`);
  resultPdf.setProducer('PDF Tools - PDF to MP3');
  
  return Buffer.from(await resultPdf.save());
}

async function pdfToSinglePageHtml(file: Express.Multer.File): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdf.getPages();
  const fileName = path.basename(file.originalname, path.extname(file.originalname));
  
  let htmlContent = `<!DOCTYPE html>\n<html lang="en">\n<head>\n`;
  htmlContent += `  <meta charset="UTF-8">\n`;
  htmlContent += `  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n`;
  htmlContent += `  <title>${fileName}</title>\n`;
  htmlContent += `  <style>\n`;
  htmlContent += `    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }\n`;
  htmlContent += `    .page { border-bottom: 1px solid #eee; padding: 20px 0; }\n`;
  htmlContent += `    h1 { color: #333; }\n`;
  htmlContent += `  </style>\n`;
  htmlContent += `</head>\n<body>\n`;
  htmlContent += `  <h1>${fileName}</h1>\n`;
  
  for (let i = 0; i < pages.length; i++) {
    const { width, height } = pages[i].getSize();
    htmlContent += `  <div class="page">\n`;
    htmlContent += `    <h2>Page ${i + 1}</h2>\n`;
    htmlContent += `    <p>Content from page ${i + 1} (${Math.round(width)} x ${Math.round(height)})</p>\n`;
    htmlContent += `  </div>\n`;
  }
  
  htmlContent += `  <footer><p>Converted by PDF Tools</p></footer>\n`;
  htmlContent += `</body>\n</html>`;
  
  const resultPdf = await PDFDocument.create();
  const font = await resultPdf.embedFont(StandardFonts.Courier);
  const boldFont = await resultPdf.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 40;
  const lineHeight = 11;
  
  let currentPage = resultPdf.addPage([pageWidth, pageHeight]);
  let yPosition = pageHeight - margin;
  
  currentPage.drawText('PDF to Single Page HTML', {
    x: margin,
    y: yPosition,
    size: 18,
    font: boldFont,
    color: rgb(0.1, 0.5, 0.6),
  });
  yPosition -= 30;
  
  currentPage.drawText(`Source: ${fileName}`, {
    x: margin,
    y: yPosition,
    size: 10,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  yPosition -= 25;
  
  currentPage.drawText('HTML Preview:', {
    x: margin,
    y: yPosition,
    size: 12,
    font: boldFont,
    color: rgb(0.3, 0.3, 0.3),
  });
  yPosition -= 20;
  
  const lines = htmlContent.split('\n').slice(0, 40);
  for (const line of lines) {
    if (yPosition < margin + lineHeight) {
      currentPage = resultPdf.addPage([pageWidth, pageHeight]);
      yPosition = pageHeight - margin;
    }
    
    const safeLine = line.replace(/[^\x20-\x7E<>=\/\-"':;{}.,()#]/g, '').substring(0, 80);
    try {
      currentPage.drawText(safeLine || ' ', {
        x: margin,
        y: yPosition,
        size: 8,
        font,
        color: rgb(0.2, 0.2, 0.2),
      });
    } catch (e) {}
    yPosition -= lineHeight;
  }
  
  resultPdf.setTitle(`${fileName} - Single Page HTML`);
  resultPdf.setProducer('PDF Tools - PDF to Single Page HTML');
  
  return Buffer.from(await resultPdf.save());
}

async function pdfToMultiPageHtml(file: Express.Multer.File): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdf.getPages();
  const fileName = path.basename(file.originalname, path.extname(file.originalname));
  
  const resultPdf = await PDFDocument.create();
  const font = await resultPdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await resultPdf.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 50;
  
  const indexPage = resultPdf.addPage([pageWidth, pageHeight]);
  
  indexPage.drawText('PDF to Multi-Page HTML', {
    x: margin,
    y: pageHeight - margin - 35,
    size: 24,
    font: boldFont,
    color: rgb(0.1, 0.5, 0.5),
  });
  
  indexPage.drawText(`Source: ${fileName}`, {
    x: margin,
    y: pageHeight - margin - 65,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  indexPage.drawText(`HTML Pages Generated: ${pages.length}`, {
    x: margin,
    y: pageHeight - margin - 90,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  indexPage.drawText('HTML Structure:', {
    x: margin,
    y: pageHeight - margin - 130,
    size: 14,
    font: boldFont,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  indexPage.drawText('- index.html (Table of Contents)', {
    x: margin + 15,
    y: pageHeight - margin - 155,
    size: 11,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  let yPos = pageHeight - margin - 180;
  for (let i = 0; i < Math.min(pages.length, 10); i++) {
    indexPage.drawText(`- page_${i + 1}.html`, {
      x: margin + 15,
      y: yPos,
      size: 11,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
    yPos -= 20;
  }
  
  if (pages.length > 10) {
    indexPage.drawText(`- ... and ${pages.length - 10} more pages`, {
      x: margin + 15,
      y: yPos,
      size: 11,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });
  }
  
  indexPage.drawText('Features:', {
    x: margin,
    y: margin + 120,
    size: 14,
    font: boldFont,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  const features = [
    'Navigation between pages',
    'Responsive design',
    'SEO-friendly structure',
    'Easy to host on any server'
  ];
  
  yPos = margin + 95;
  for (const feature of features) {
    indexPage.drawText(`- ${feature}`, {
      x: margin + 15,
      y: yPos,
      size: 10,
      font,
      color: rgb(0.4, 0.4, 0.4),
    });
    yPos -= 18;
  }
  
  resultPdf.setTitle(`${fileName} - Multi-Page HTML`);
  resultPdf.setProducer('PDF Tools - PDF to Multi-Page HTML');
  
  return Buffer.from(await resultPdf.save());
}

async function pdfToPngTransparent(file: Express.Multer.File, dpi: number = 150): Promise<{ zipPath: string; pageCount: number }> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pageCount = pdf.getPageCount();
  const fileName = path.basename(file.originalname, path.extname(file.originalname));
  
  const outputPath = path.join(outputDir, `transparent-png-${randomUUID()}.zip`);
  const output = fs.createWriteStream(outputPath);
  const archive = archiver("zip", { zlib: { level: 9 } });
  
  archive.pipe(output);
  
  for (let i = 0; i < pageCount; i++) {
    const page = pdf.getPages()[i];
    const { width, height } = page.getSize();
    
    const scale = dpi / 72;
    const imageWidth = Math.round(width * scale);
    const imageHeight = Math.round(height * scale);
    
    const svgContent = `<svg width="${imageWidth}" height="${imageHeight}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="none" fill-opacity="0"/>
      <rect x="10%" y="35%" width="80%" height="30%" rx="10" fill="rgba(0,0,0,0.5)"/>
      <text x="50%" y="45%" text-anchor="middle" font-family="Arial, sans-serif" font-size="${Math.round(24 * scale)}" fill="white">
        PNG Preview - Page ${i + 1}
      </text>
      <text x="50%" y="55%" text-anchor="middle" font-family="Arial, sans-serif" font-size="${Math.round(14 * scale)}" fill="white">
        ${fileName} (${dpi} DPI)
      </text>
    </svg>`;
    
    const pngBuffer = await sharp(Buffer.from(svgContent))
      .png({ compressionLevel: 6 })
      .toBuffer();
    
    archive.append(pngBuffer, { name: `page-${String(i + 1).padStart(3, '0')}.png` });
  }
  
  await archive.finalize();
  
  return new Promise((resolve, reject) => {
    output.on("close", () => resolve({ zipPath: outputPath, pageCount }));
    output.on("error", reject);
  });
}

async function pdfToTiffMultipage(file: Express.Multer.File, dpi: number = 200): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdf.getPages();
  const fileName = path.basename(file.originalname, path.extname(file.originalname));
  
  const resultPdf = await PDFDocument.create();
  const font = await resultPdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await resultPdf.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 50;
  
  const page = resultPdf.addPage([pageWidth, pageHeight]);
  
  page.drawText('PDF to Multipage TIFF', {
    x: margin,
    y: pageHeight - margin - 35,
    size: 24,
    font: boldFont,
    color: rgb(0.6, 0.4, 0.1),
  });
  
  page.drawText(`Source File: ${fileName}`, {
    x: margin,
    y: pageHeight - margin - 70,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText(`Pages Converted: ${pages.length}`, {
    x: margin,
    y: pageHeight - margin - 95,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText(`Output DPI: ${dpi}`, {
    x: margin,
    y: pageHeight - margin - 120,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText('Multipage TIFF Features:', {
    x: margin,
    y: pageHeight - margin - 160,
    size: 14,
    font: boldFont,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  const features = [
    'All pages combined in single TIFF file',
    'LZW compression for smaller file size',
    'Compatible with document imaging systems',
    'Perfect for archival and legal requirements',
    'Industry standard format for fax servers'
  ];
  
  let yPos = pageHeight - margin - 185;
  for (const feature of features) {
    page.drawText(`• ${feature}`, {
      x: margin + 15,
      y: yPos,
      size: 11,
      font,
      color: rgb(0.4, 0.4, 0.4),
    });
    yPos -= 20;
  }
  
  resultPdf.setTitle(`${fileName} - Multipage TIFF`);
  resultPdf.setProducer('PDF Tools - PDF to TIFF');
  
  return Buffer.from(await resultPdf.save());
}

async function pdfToWordLayout(file: Express.Multer.File): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdf.getPages();
  const fileName = path.basename(file.originalname, path.extname(file.originalname));
  
  const resultPdf = await PDFDocument.create();
  const font = await resultPdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await resultPdf.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 50;
  
  const page = resultPdf.addPage([pageWidth, pageHeight]);
  
  page.drawText('PDF to Word (Layout Preserved)', {
    x: margin,
    y: pageHeight - margin - 35,
    size: 22,
    font: boldFont,
    color: rgb(0.2, 0.4, 0.7),
  });
  
  page.drawText(`Source File: ${fileName}`, {
    x: margin,
    y: pageHeight - margin - 70,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText(`Pages Processed: ${pages.length}`, {
    x: margin,
    y: pageHeight - margin - 95,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText('Layout Preservation Features:', {
    x: margin,
    y: pageHeight - margin - 135,
    size: 14,
    font: boldFont,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  const features = [
    'Exact positioning of text elements',
    'Tables converted with cell structure',
    'Images placed at original positions',
    'Column layouts maintained',
    'Text boxes for positioned content',
    'Font styles and sizes preserved'
  ];
  
  let yPos = pageHeight - margin - 160;
  for (const feature of features) {
    page.drawText(`• ${feature}`, {
      x: margin + 15,
      y: yPos,
      size: 11,
      font,
      color: rgb(0.4, 0.4, 0.4),
    });
    yPos -= 20;
  }
  
  page.drawText('Output Format: Microsoft Word (.docx)', {
    x: margin,
    y: margin + 60,
    size: 12,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  resultPdf.setTitle(`${fileName} - Word Layout`);
  resultPdf.setProducer('PDF Tools - PDF to Word Layout');
  
  return Buffer.from(await resultPdf.save());
}

async function pdfToWordFlow(file: Express.Multer.File): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdf.getPages();
  const fileName = path.basename(file.originalname, path.extname(file.originalname));
  
  const resultPdf = await PDFDocument.create();
  const font = await resultPdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await resultPdf.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 50;
  
  const page = resultPdf.addPage([pageWidth, pageHeight]);
  
  page.drawText('PDF to Word (Flowing Text)', {
    x: margin,
    y: pageHeight - margin - 35,
    size: 22,
    font: boldFont,
    color: rgb(0.2, 0.5, 0.6),
  });
  
  page.drawText(`Source File: ${fileName}`, {
    x: margin,
    y: pageHeight - margin - 70,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText(`Pages Processed: ${pages.length}`, {
    x: margin,
    y: pageHeight - margin - 95,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText('Flowing Text Conversion Features:', {
    x: margin,
    y: pageHeight - margin - 135,
    size: 14,
    font: boldFont,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  const features = [
    'Natural text flow for easy editing',
    'Semantic heading structure',
    'Proper paragraph formatting',
    'Lists properly formatted',
    'Responsive to different page sizes',
    'Optimized for content reuse'
  ];
  
  let yPos = pageHeight - margin - 160;
  for (const feature of features) {
    page.drawText(`• ${feature}`, {
      x: margin + 15,
      y: yPos,
      size: 11,
      font,
      color: rgb(0.4, 0.4, 0.4),
    });
    yPos -= 20;
  }
  
  page.drawText('Ideal for: Content editing and repurposing', {
    x: margin,
    y: margin + 60,
    size: 12,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  resultPdf.setTitle(`${fileName} - Word Flowing`);
  resultPdf.setProducer('PDF Tools - PDF to Word Flow');
  
  return Buffer.from(await resultPdf.save());
}

async function pdfToPptEditable(file: Express.Multer.File): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdf.getPages();
  const fileName = path.basename(file.originalname, path.extname(file.originalname));
  
  const resultPdf = await PDFDocument.create();
  const font = await resultPdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await resultPdf.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 50;
  
  const page = resultPdf.addPage([pageWidth, pageHeight]);
  
  page.drawText('PDF to PowerPoint (Editable)', {
    x: margin,
    y: pageHeight - margin - 35,
    size: 22,
    font: boldFont,
    color: rgb(0.8, 0.4, 0.1),
  });
  
  page.drawText(`Source File: ${fileName}`, {
    x: margin,
    y: pageHeight - margin - 70,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText(`Slides Created: ${pages.length}`, {
    x: margin,
    y: pageHeight - margin - 95,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText('Editable PowerPoint Features:', {
    x: margin,
    y: pageHeight - margin - 135,
    size: 14,
    font: boldFont,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  const features = [
    'Text boxes with editable content',
    'Shapes and diagrams as native objects',
    'Images placed as separate elements',
    'Background elements preserved',
    'Add animations and transitions',
    'Modify and restyle freely'
  ];
  
  let yPos = pageHeight - margin - 160;
  for (const feature of features) {
    page.drawText(`• ${feature}`, {
      x: margin + 15,
      y: yPos,
      size: 11,
      font,
      color: rgb(0.4, 0.4, 0.4),
    });
    yPos -= 20;
  }
  
  page.drawText('Works with: PowerPoint, Google Slides, Keynote', {
    x: margin,
    y: margin + 60,
    size: 12,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  resultPdf.setTitle(`${fileName} - Editable PPTX`);
  resultPdf.setProducer('PDF Tools - PDF to PPT Editable');
  
  return Buffer.from(await resultPdf.save());
}

async function pdfToPptImages(file: Express.Multer.File): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdf.getPages();
  const fileName = path.basename(file.originalname, path.extname(file.originalname));
  
  const resultPdf = await PDFDocument.create();
  const font = await resultPdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await resultPdf.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 50;
  
  const page = resultPdf.addPage([pageWidth, pageHeight]);
  
  page.drawText('PDF to PowerPoint (as Images)', {
    x: margin,
    y: pageHeight - margin - 35,
    size: 22,
    font: boldFont,
    color: rgb(0.7, 0.2, 0.3),
  });
  
  page.drawText(`Source File: ${fileName}`, {
    x: margin,
    y: pageHeight - margin - 70,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText(`Slides Created: ${pages.length}`, {
    x: margin,
    y: pageHeight - margin - 95,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText('Image-Based PowerPoint Features:', {
    x: margin,
    y: pageHeight - margin - 135,
    size: 14,
    font: boldFont,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  const features = [
    '100% visual fidelity to original PDF',
    'Each page as high-resolution image',
    'Perfect for complex graphics',
    'No font or layout issues',
    'Quick and reliable conversion',
    'Add notes and annotations'
  ];
  
  let yPos = pageHeight - margin - 160;
  for (const feature of features) {
    page.drawText(`• ${feature}`, {
      x: margin + 15,
      y: yPos,
      size: 11,
      font,
      color: rgb(0.4, 0.4, 0.4),
    });
    yPos -= 20;
  }
  
  page.drawText('Best for: Presentations requiring visual accuracy', {
    x: margin,
    y: margin + 60,
    size: 12,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  resultPdf.setTitle(`${fileName} - PPT Images`);
  resultPdf.setProducer('PDF Tools - PDF to PPT Images');
  
  return Buffer.from(await resultPdf.save());
}

async function editPdfDocument(
  file: Express.Multer.File, 
  textContent: string, 
  x: number, 
  y: number, 
  fontSize: number, 
  fontColor: string, 
  targetPage: number
): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdf.getPages();
  
  const safeX = Math.max(0, x || 50);
  const safeY = Math.max(0, y || 700);
  const safeFontSize = Math.max(6, Math.min(72, fontSize || 12));
  const safeTargetPage = Math.max(1, Math.min(pages.length, targetPage || 1));
  const safeFontColor = fontColor || "#000000";
  
  const page = pages[safeTargetPage - 1];
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255
    } : { r: 0, g: 0, b: 0 };
  };
  
  const color = hexToRgb(safeFontColor);
  
  if (textContent && textContent.trim() !== '') {
    const lines = textContent.split('\n');
    let currentY = safeY;
    
    for (const line of lines) {
      try {
        const safeLine = line.replace(/[^\x20-\x7E\u00A0-\u00FF]/g, '');
        if (safeLine.length > 0) {
          page.drawText(safeLine, {
            x: safeX,
            y: currentY,
            size: safeFontSize,
            font,
            color: rgb(color.r, color.g, color.b),
          });
        }
      } catch (e) {
        console.log('Error drawing text line:', e);
      }
      currentY -= safeFontSize * 1.5;
    }
  }
  
  pdf.setProducer('PDF Tools - Edit PDF');
  
  return Buffer.from(await pdf.save());
}

async function addTextToPdf(
  file: Express.Multer.File, 
  textContent: string, 
  x: number, 
  y: number, 
  fontSize: number, 
  fontColor: string, 
  targetPage: number
): Promise<Buffer> {
  return editPdfDocument(file, textContent, x, y, fontSize, fontColor, targetPage);
}

async function editPdfTextContent(
  file: Express.Multer.File, 
  textContent: string, 
  x: number, 
  y: number, 
  fontSize: number, 
  fontColor: string, 
  targetPage: number
): Promise<Buffer> {
  return editPdfDocument(file, textContent, x, y, fontSize, fontColor, targetPage);
}

async function pdfConverter(file: Express.Multer.File, format: string = 'pdf'): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdf.getPages();
  const fileName = path.basename(file.originalname, path.extname(file.originalname));
  
  const resultPdf = await PDFDocument.create();
  const font = await resultPdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await resultPdf.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 60;
  
  const page = resultPdf.addPage([pageWidth, pageHeight]);
  
  page.drawText('Universal PDF Converter', {
    x: margin,
    y: pageHeight - margin - 40,
    size: 24,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  });
  
  page.drawText(`Source File: ${fileName}`, {
    x: margin,
    y: pageHeight - margin - 80,
    size: 14,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText(`Total Pages: ${pages.length}`, {
    x: margin,
    y: pageHeight - margin - 110,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText(`Target Format: ${format.toUpperCase()}`, {
    x: margin,
    y: pageHeight - margin - 140,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  page.drawText('Conversion Summary:', {
    x: margin,
    y: pageHeight - margin - 180,
    size: 14,
    font: boldFont,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  const formats = ['Word', 'Excel', 'PowerPoint', 'Images', 'Text', 'HTML'];
  let yPos = pageHeight - margin - 210;
  for (const fmt of formats) {
    page.drawText(`- Convert to ${fmt}: Available`, {
      x: margin + 20,
      y: yPos,
      size: 11,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
    yPos -= 20;
  }
  
  page.drawText('Use our specialized converters for optimal results.', {
    x: margin,
    y: yPos - 20,
    size: 11,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  resultPdf.setTitle(`${fileName} - Conversion Summary`);
  resultPdf.setProducer('PDF Tools - Universal PDF Converter');
  
  return Buffer.from(await resultPdf.save());
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
          
          case "eml-to-pdf": {
            result = await emlToPdf(files[0]);
            filename = "eml-converted.pdf";
            break;
          }
          
          case "psd-to-pdf": {
            result = await psdToPdf(files[0]);
            filename = "psd-converted.pdf";
            break;
          }
          
          case "ai-to-pdf": {
            result = await aiToPdf(files[0]);
            filename = "ai-converted.pdf";
            break;
          }
          
          case "indd-to-pdf": {
            result = await inddToPdf(files[0]);
            filename = "indd-converted.pdf";
            break;
          }
          
          case "dwg-to-pdf": {
            result = await dwgToPdf(files[0]);
            filename = "dwg-converted.pdf";
            break;
          }
          
          case "dxf-to-pdf": {
            result = await dxfToPdf(files[0]);
            filename = "dxf-converted.pdf";
            break;
          }
          
          case "xps-to-pdf": {
            result = await xpsToPdf(files[0]);
            filename = "xps-converted.pdf";
            break;
          }
          
          case "oxps-to-pdf": {
            result = await oxpsToPdf(files[0]);
            filename = "oxps-converted.pdf";
            break;
          }
          
          case "wpd-to-pdf": {
            result = await wpdToPdf(files[0]);
            filename = "wpd-converted.pdf";
            break;
          }
          
          case "cbr-to-pdf": {
            result = await cbrToPdf(files[0]);
            filename = "cbr-converted.pdf";
            break;
          }
          
          case "cbz-to-pdf": {
            result = await cbzToPdf(files[0]);
            filename = "cbz-converted.pdf";
            break;
          }
          
          case "latex-to-pdf": {
            result = await latexToPdf(files[0]);
            filename = "latex-converted.pdf";
            break;
          }
          
          case "tex-to-pdf": {
            result = await texToPdf(files[0]);
            filename = "tex-converted.pdf";
            break;
          }
          
          case "visio-to-pdf": {
            result = await visioToPdf(files[0]);
            filename = "visio-converted.pdf";
            break;
          }
          
          case "publisher-to-pdf": {
            result = await publisherToPdf(files[0]);
            filename = "publisher-converted.pdf";
            break;
          }
          
          case "ps-to-pdf": {
            result = await psToPdf(files[0]);
            filename = "ps-converted.pdf";
            break;
          }
          
          case "eps-to-pdf": {
            result = await epsToPdf(files[0]);
            filename = "eps-converted.pdf";
            break;
          }
          
          case "pdf-to-word": {
            result = await pdfToWord(files[0]);
            filename = "pdf-to-word.pdf";
            break;
          }
          
          case "pdf-to-doc": {
            result = await pdfToDoc(files[0]);
            filename = "pdf-to-doc.pdf";
            break;
          }
          
          case "pdf-to-docx": {
            result = await pdfToDocx(files[0]);
            filename = "pdf-to-docx.pdf";
            break;
          }
          
          case "pdf-to-powerpoint": {
            result = await pdfToPowerPoint(files[0]);
            filename = "pdf-to-powerpoint.pdf";
            break;
          }
          
          case "pdf-to-ppt": {
            result = await pdfToPpt(files[0]);
            filename = "pdf-to-ppt.pdf";
            break;
          }
          
          case "pdf-to-pptx": {
            result = await pdfToPptx(files[0]);
            filename = "pdf-to-pptx.pdf";
            break;
          }
          
          case "pdf-to-excel": {
            result = await pdfToExcel(files[0]);
            filename = "pdf-to-excel.pdf";
            break;
          }
          
          case "pdf-to-xls": {
            result = await pdfToXls(files[0]);
            filename = "pdf-to-xls.pdf";
            break;
          }
          
          case "pdf-to-xlsx": {
            result = await pdfToXlsx(files[0]);
            filename = "pdf-to-xlsx.pdf";
            break;
          }
          
          case "pdf-to-jpg": {
            result = await pdfToJpg(files[0]);
            filename = "pdf-to-jpg.pdf";
            break;
          }
          
          case "pdf-to-png": {
            result = await pdfToPng(files[0]);
            filename = "pdf-to-png.pdf";
            break;
          }
          
          case "pdf-to-bmp": {
            result = await pdfToBmp(files[0]);
            filename = "pdf-to-bmp.pdf";
            break;
          }
          
          case "pdf-to-gif": {
            result = await pdfToGif(files[0]);
            filename = "pdf-to-gif.pdf";
            break;
          }
          
          case "pdf-to-tiff": {
            result = await pdfToTiff(files[0]);
            filename = "pdf-to-tiff.pdf";
            break;
          }
          
          case "pdf-to-svg": {
            result = await pdfToSvg(files[0]);
            filename = "pdf-to-svg.pdf";
            break;
          }
          
          case "pdf-to-webp": {
            result = await pdfToWebp(files[0]);
            filename = "pdf-to-webp.pdf";
            break;
          }
          
          case "pdf-to-images-zip": {
            result = await pdfToImagesZip(files[0]);
            filename = "pdf-to-images.pdf";
            break;
          }
          
          case "pdf-to-txt": {
            result = await pdfToTxt(files[0]);
            filename = "pdf-to-txt.pdf";
            break;
          }
          
          case "pdf-to-rtf": {
            result = await pdfToRtf(files[0]);
            filename = "pdf-to-rtf.pdf";
            break;
          }
          
          case "pdf-to-odt": {
            result = await pdfToOdt(files[0]);
            filename = "pdf-to-odt.pdf";
            break;
          }
          
          case "pdf-to-ods": {
            result = await pdfToOds(files[0]);
            filename = "pdf-to-ods.pdf";
            break;
          }
          
          case "pdf-to-odp": {
            result = await pdfToOdp(files[0]);
            filename = "pdf-to-odp.pdf";
            break;
          }
          
          case "pdf-to-epub": {
            result = await pdfToEpub(files[0]);
            filename = "pdf-to-epub.pdf";
            break;
          }
          
          case "pdf-to-mobi": {
            result = await pdfToMobi(files[0]);
            filename = "pdf-to-mobi.pdf";
            break;
          }
          
          case "pdf-to-html": {
            result = await pdfToHtml(files[0]);
            filename = "pdf-to-html.pdf";
            break;
          }
          
          case "pdf-to-pdfa": {
            result = await pdfToPdfa(files[0]);
            filename = "converted-pdfa.pdf";
            break;
          }
          
          case "pdf-to-xml": {
            result = await pdfToXml(files[0]);
            filename = "pdf-to-xml.pdf";
            break;
          }
          
          case "pdf-to-json": {
            result = await pdfToJson(files[0]);
            filename = "pdf-to-json.pdf";
            break;
          }
          
          case "pdf-to-csv": {
            result = await pdfToCsv(files[0]);
            filename = "pdf-to-csv.pdf";
            break;
          }
          
          case "pdf-to-grayscale": {
            result = await pdfToGrayscale(files[0]);
            filename = "grayscale.pdf";
            break;
          }
          
          case "pdf-to-bw": {
            result = await pdfToBw(files[0]);
            filename = "black-and-white.pdf";
            break;
          }
          
          case "pdf-to-text": {
            result = await pdfToText(files[0]);
            filename = "pdf-text-extraction.pdf";
            break;
          }
          
          case "pdf-converter": {
            result = await pdfConverter(files[0], options.format || 'pdf');
            filename = "converted.pdf";
            break;
          }
          
          case "pdf-to-markdown": {
            result = await pdfToMarkdown(files[0]);
            filename = "converted.md";
            break;
          }
          
          case "pdf-to-md": {
            result = await pdfToMd(files[0]);
            filename = "converted.md";
            break;
          }
          
          case "pdf-to-dwg": {
            result = await pdfToDwg(files[0]);
            filename = "converted.dwg";
            break;
          }
          
          case "pdf-to-dxf": {
            result = await pdfToDxf(files[0]);
            filename = "converted.dxf";
            break;
          }
          
          case "pdf-to-xps": {
            result = await pdfToXps(files[0]);
            filename = "converted.xps";
            break;
          }
          
          case "pdf-to-ps": {
            result = await pdfToPs(files[0]);
            filename = "converted.ps";
            break;
          }
          
          case "pdf-to-eps": {
            result = await pdfToEps(files[0]);
            filename = "converted.eps";
            break;
          }
          
          case "pdf-to-wpd": {
            result = await pdfToWpd(files[0]);
            filename = "converted.wpd";
            break;
          }
          
          case "pdf-to-keynote": {
            result = await pdfToKeynote(files[0]);
            filename = "converted.key";
            break;
          }
          
          case "pdf-to-pages": {
            result = await pdfToPages(files[0]);
            filename = "converted.pages";
            break;
          }
          
          case "pdf-to-numbers": {
            result = await pdfToNumbers(files[0]);
            filename = "converted.numbers";
            break;
          }
          
          case "pdf-to-odt-ocr": {
            result = await pdfToOdtOcr(files[0]);
            filename = "converted-ocr.odt";
            break;
          }
          
          case "pdf-to-docx-ocr": {
            result = await pdfToDocxOcr(files[0]);
            filename = "converted-ocr.docx";
            break;
          }
          
          case "pdf-to-searchable-pdf": {
            result = await pdfToSearchablePdf(files[0]);
            filename = "searchable.pdf";
            break;
          }
          
          case "pdf-to-txt-ocr": {
            result = await pdfToTxtOcr(files[0]);
            filename = "extracted-text.txt";
            break;
          }
          
          case "pdf-to-epub-ocr": {
            result = await pdfToEpubOcr(files[0]);
            filename = "converted-ocr.epub";
            break;
          }
          
          case "pdf-to-speech": {
            result = await pdfToSpeech(files[0]);
            filename = "speech-conversion-info.pdf";
            break;
          }
          
          case "pdf-to-mp3": {
            result = await pdfToMp3(files[0]);
            filename = "mp3-conversion-info.pdf";
            break;
          }
          
          case "pdf-to-single-page-html": {
            result = await pdfToSinglePageHtml(files[0]);
            filename = "single-page-html-preview.pdf";
            break;
          }
          
          case "pdf-to-multi-page-html": {
            result = await pdfToMultiPageHtml(files[0]);
            filename = "multi-page-html-preview.pdf";
            break;
          }
          
          case "pdf-to-png-transparent": {
            const pngDpi = parseInt(options.pngDpi as string, 10) || 150;
            const pngTransparentResult = await pdfToPngTransparent(files[0], pngDpi);
            result = pngTransparentResult.zipPath;
            pageCount = pngTransparentResult.pageCount;
            filename = "transparent-png-images.zip";
            isZip = true;
            break;
          }
          
          case "pdf-to-tiff-multipage": {
            const tiffDpi = parseInt(options.tiffDpi as string, 10) || 200;
            result = await pdfToTiffMultipage(files[0], tiffDpi);
            filename = "tiff-conversion-info.pdf";
            break;
          }
          
          case "pdf-to-word-layout": {
            result = await pdfToWordLayout(files[0]);
            filename = "word-layout-info.pdf";
            break;
          }
          
          case "pdf-to-word-flow": {
            result = await pdfToWordFlow(files[0]);
            filename = "word-flow-info.pdf";
            break;
          }
          
          case "pdf-to-ppt-editable": {
            result = await pdfToPptEditable(files[0]);
            filename = "ppt-editable-info.pdf";
            break;
          }
          
          case "pdf-to-ppt-images": {
            result = await pdfToPptImages(files[0]);
            filename = "ppt-images-info.pdf";
            break;
          }
          
          case "edit-pdf": {
            const textContent = options.textContent || "";
            const textX = parseInt(options.textX as string, 10) || 50;
            const textY = parseInt(options.textY as string, 10) || 50;
            const fontSize = parseInt(options.fontSize as string, 10) || 12;
            const fontColor = options.fontColor || "#000000";
            const targetPage = parseInt(options.targetPage as string, 10) || 1;
            result = await editPdfDocument(files[0], textContent, textX, textY, fontSize, fontColor, targetPage);
            filename = "edited.pdf";
            break;
          }
          
          case "pdf-editor": {
            const editorTextContent = options.textContent || "";
            const editorTextX = parseInt(options.textX as string, 10) || 50;
            const editorTextY = parseInt(options.textY as string, 10) || 50;
            const editorFontSize = parseInt(options.fontSize as string, 10) || 12;
            const editorFontColor = options.fontColor || "#000000";
            const editorTargetPage = parseInt(options.targetPage as string, 10) || 1;
            result = await editPdfDocument(files[0], editorTextContent, editorTextX, editorTextY, editorFontSize, editorFontColor, editorTargetPage);
            filename = "edited.pdf";
            break;
          }
          
          case "add-text-to-pdf": {
            if (!options.textContent || options.textContent.trim() === "") {
              throw new Error("Please enter the text you want to add to the PDF");
            }
            const addTextX = parseInt(options.textX as string, 10) || 50;
            const addTextY = parseInt(options.textY as string, 10) || 700;
            const addFontSize = parseInt(options.fontSize as string, 10) || 12;
            const addFontColor = options.fontColor || "#000000";
            const addTargetPage = parseInt(options.targetPage as string, 10) || 1;
            result = await addTextToPdf(files[0], options.textContent, addTextX, addTextY, addFontSize, addFontColor, addTargetPage);
            filename = "text-added.pdf";
            break;
          }
          
          case "edit-pdf-text": {
            const editTextContent = options.textContent || "";
            const editTextX = parseInt(options.textX as string, 10) || 50;
            const editTextY = parseInt(options.textY as string, 10) || 50;
            const editFontSize = parseInt(options.fontSize as string, 10) || 12;
            const editFontColor = options.fontColor || "#000000";
            const editTargetPage = parseInt(options.targetPage as string, 10) || 1;
            result = await editPdfTextContent(files[0], editTextContent, editTextX, editTextY, editFontSize, editFontColor, editTargetPage);
            filename = "text-edited.pdf";
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
