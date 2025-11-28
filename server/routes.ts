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
    const isPdf = file.mimetype === "application/pdf" || file.originalname.toLowerCase().endsWith(".pdf");
    const isImage = file.mimetype.startsWith("image/") || 
      [".jpg", ".jpeg", ".png", ".gif", ".webp"].some(ext => file.originalname.toLowerCase().endsWith(ext));
    const isDocx = file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || 
      file.originalname.toLowerCase().endsWith(".docx");
    
    if (isPdf || isImage || isDocx) {
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

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.post(
    "/api/process",
    upload.array("files", 50),
    async (req: Request, res: Response) => {
      const files = req.files as Express.Multer.File[] | undefined;
      
      if (!files || files.length === 0) {
        return res.status(400).json({ 
          success: false, 
          error: "No files uploaded. Please select at least one file." 
        });
      }
      
      const { toolType, options: optionsStr } = req.body;
      
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
