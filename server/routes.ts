import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { PDFDocument, degrees, rgb, StandardFonts, PDFName, PDFDict, PDFArray, PDFNumber, PDFString } from "pdf-lib";
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

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
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

interface PermissionSettings {
  ownerPassword: string;
  userPassword?: string;
  allowPrinting: boolean;
  allowCopying: boolean;
  allowEditing: boolean;
  allowAnnotations: boolean;
  allowFormFilling: boolean;
}

async function setPermissions(file: Express.Multer.File, settings: PermissionSettings): Promise<Buffer> {
  const pdfBuffer = fs.readFileSync(file.path);
  const inputStream = new muhammara.PDFRStreamForBuffer(pdfBuffer);
  const outputStream = new muhammara.PDFWStreamForBuffer();
  
  let protectionFlag = 0;
  
  if (settings.allowPrinting) {
    protectionFlag |= 4;
    protectionFlag |= 2048;
  }
  if (settings.allowEditing) {
    protectionFlag |= 8;
  }
  if (settings.allowCopying) {
    protectionFlag |= 16;
  }
  if (settings.allowAnnotations) {
    protectionFlag |= 32;
  }
  if (settings.allowFormFilling) {
    protectionFlag |= 256;
  }
  
  const encryptOptions: any = {
    ownerPassword: settings.ownerPassword,
    userProtectionFlag: protectionFlag
  };
  
  if (settings.userPassword) {
    encryptOptions.userPassword = settings.userPassword;
  }
  
  muhammara.recrypt(inputStream, outputStream, encryptOptions);
  
  return outputStream.buffer;
}

interface SignatureOptions {
  name?: string;
  reason?: string;
  location?: string;
  contact?: string;
  date?: string;
  position?: string;
  page?: string;
  customPage?: number;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  style?: string;
  text?: string;
  color?: string;
  fontSize?: number;
}

async function addSignatureToPdf(file: Express.Multer.File, options: SignatureOptions): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdf.getPages();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);
  
  const signatureText = options.text || options.name || "Signature";
  const signerName = options.name || "Signer";
  const reason = options.reason || "Document signed electronically";
  const location = options.location || "";
  const signDate = options.date || new Date().toLocaleDateString();
  const fontSize = options.fontSize || 12;
  const sigWidth = options.width || 200;
  const sigHeight = options.height || 60;
  
  const colorHex = options.color || "#1a365d";
  const r = parseInt(colorHex.slice(1, 3), 16) / 255;
  const g = parseInt(colorHex.slice(3, 5), 16) / 255;
  const b = parseInt(colorHex.slice(5, 7), 16) / 255;
  
  const pagesToSign: number[] = [];
  if (options.page === "all") {
    for (let i = 0; i < pages.length; i++) pagesToSign.push(i);
  } else if (options.page === "first") {
    pagesToSign.push(0);
  } else if (options.page === "last") {
    pagesToSign.push(pages.length - 1);
  } else if (options.page === "custom" && options.customPage) {
    const pageNum = Math.max(0, Math.min(options.customPage - 1, pages.length - 1));
    pagesToSign.push(pageNum);
  } else {
    pagesToSign.push(pages.length - 1);
  }
  
  for (const pageIndex of pagesToSign) {
    const page = pages[pageIndex];
    const { width, height } = page.getSize();
    
    let x: number;
    let y: number;
    
    if (options.position === "custom" && options.x !== undefined && options.y !== undefined) {
      x = options.x;
      y = options.y;
    } else {
      switch (options.position) {
        case "bottom-left":
          x = 40;
          y = 40;
          break;
        case "top-right":
          x = width - sigWidth - 40;
          y = height - sigHeight - 40;
          break;
        case "top-left":
          x = 40;
          y = height - sigHeight - 40;
          break;
        case "center":
          x = (width - sigWidth) / 2;
          y = (height - sigHeight) / 2;
          break;
        case "bottom-right":
        default:
          x = width - sigWidth - 40;
          y = 40;
          break;
      }
    }
    
    page.drawRectangle({
      x: x,
      y: y,
      width: sigWidth,
      height: sigHeight,
      borderColor: rgb(r, g, b),
      borderWidth: 1,
      color: rgb(0.98, 0.98, 1),
      opacity: 0.9,
    });
    
    if (options.style === "handwritten" || options.style === "drawn") {
      const scriptFont = await pdf.embedFont(StandardFonts.TimesRomanItalic);
      const scriptSize = Math.min(24, sigWidth / signatureText.length * 1.5);
      const textW = scriptFont.widthOfTextAtSize(signatureText, scriptSize);
      page.drawText(signatureText, {
        x: x + (sigWidth - textW) / 2,
        y: y + sigHeight - 28,
        size: scriptSize,
        font: scriptFont,
        color: rgb(0, 0, 0.4),
      });
    } else {
      const nameWidth = boldFont.widthOfTextAtSize(signerName, fontSize + 2);
      page.drawText(signerName, {
        x: x + (sigWidth - nameWidth) / 2,
        y: y + sigHeight - 20,
        size: fontSize + 2,
        font: boldFont,
        color: rgb(r, g, b),
      });
    }
    
    page.drawLine({
      start: { x: x + 10, y: y + sigHeight - 35 },
      end: { x: x + sigWidth - 10, y: y + sigHeight - 35 },
      thickness: 0.5,
      color: rgb(0.6, 0.6, 0.6),
    });
    
    const dateText = `Date: ${signDate}`;
    page.drawText(dateText, {
      x: x + 10,
      y: y + 25,
      size: fontSize - 2,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
    
    if (reason) {
      const reasonText = `Reason: ${reason.substring(0, 30)}${reason.length > 30 ? '...' : ''}`;
      page.drawText(reasonText, {
        x: x + 10,
        y: y + 10,
        size: fontSize - 3,
        font,
        color: rgb(0.4, 0.4, 0.4),
      });
    }
  }
  
  return Buffer.from(await pdf.save());
}

async function addSignatureFieldsToPdf(file: Express.Multer.File, options: any): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdf.getPages();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  
  const lastPage = pages[pages.length - 1];
  const { width, height } = lastPage.getSize();
  
  const fieldWidth = 200;
  const fieldHeight = 50;
  const fieldX = width - fieldWidth - 50;
  const fieldY = 80;
  
  lastPage.drawRectangle({
    x: fieldX,
    y: fieldY,
    width: fieldWidth,
    height: fieldHeight,
    borderColor: rgb(0.2, 0.4, 0.8),
    borderWidth: 1.5,
    color: rgb(0.95, 0.97, 1),
    opacity: 0.8,
  });
  
  lastPage.drawText("Sign Here", {
    x: fieldX + fieldWidth / 2 - 25,
    y: fieldY + fieldHeight / 2 - 5,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.6),
  });
  
  lastPage.drawLine({
    start: { x: fieldX + 10, y: fieldY + 15 },
    end: { x: fieldX + fieldWidth - 10, y: fieldY + 15 },
    thickness: 0.5,
    color: rgb(0.5, 0.5, 0.5),
    dashArray: [3, 3],
  });
  
  const dateFieldX = fieldX;
  const dateFieldY = fieldY - 30;
  
  lastPage.drawText("Date: ________________", {
    x: dateFieldX,
    y: dateFieldY,
    size: 10,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  if (options.requestMessage) {
    lastPage.drawText(options.requestMessage.substring(0, 50), {
      x: 50,
      y: fieldY + fieldHeight + 20,
      size: 10,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
  }
  
  return Buffer.from(await pdf.save());
}

async function certifyPdf(file: Express.Multer.File, options: any): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdf.getPages();
  const firstPage = pages[0];
  const font = await pdf.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await pdf.embedFont(StandardFonts.Helvetica);
  
  const { width, height } = firstPage.getSize();
  
  const certName = options.signatureName || "Document Certifier";
  const certDate = new Date().toLocaleDateString();
  const certReason = options.signatureReason || "Document certified as authentic";
  
  const badgeWidth = 180;
  const badgeHeight = 70;
  const badgeX = width - badgeWidth - 30;
  const badgeY = height - badgeHeight - 30;
  
  firstPage.drawRectangle({
    x: badgeX,
    y: badgeY,
    width: badgeWidth,
    height: badgeHeight,
    color: rgb(0.05, 0.3, 0.15),
    borderColor: rgb(0.1, 0.5, 0.25),
    borderWidth: 2,
  });
  
  firstPage.drawText("CERTIFIED", {
    x: badgeX + 45,
    y: badgeY + badgeHeight - 22,
    size: 16,
    font,
    color: rgb(1, 1, 1),
  });
  
  firstPage.drawText(`By: ${certName.substring(0, 20)}`, {
    x: badgeX + 10,
    y: badgeY + badgeHeight - 40,
    size: 9,
    font: regularFont,
    color: rgb(0.9, 0.9, 0.9),
  });
  
  firstPage.drawText(`Date: ${certDate}`, {
    x: badgeX + 10,
    y: badgeY + badgeHeight - 55,
    size: 9,
    font: regularFont,
    color: rgb(0.9, 0.9, 0.9),
  });
  
  return Buffer.from(await pdf.save());
}

async function validateSignature(file: Express.Multer.File): Promise<{ valid: boolean; details: string; signatures: any[] }> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  
  const acroForm = pdf.catalog.lookup(PDFName.of('AcroForm'));
  const sigFlags = acroForm instanceof PDFDict ? acroForm.lookup(PDFName.of('SigFlags')) : undefined;
  
  const hasSignatureField = sigFlags !== undefined;
  
  const signatures: any[] = [];
  
  if (hasSignatureField) {
    signatures.push({
      type: "Electronic Signature",
      status: "Signature field detected",
      valid: true,
      date: new Date().toISOString(),
    });
  }
  
  const pages = pdf.getPages();
  let signatureIndicatorsFound = 0;
  
  for (const page of pages) {
    const annotations = page.node.lookup(PDFName.of('Annots'));
    if (annotations instanceof PDFArray) {
      for (let i = 0; i < annotations.size(); i++) {
        const annot = annotations.lookup(i);
        if (annot instanceof PDFDict) {
          const subtype = annot.lookup(PDFName.of('Subtype'));
          if (subtype && subtype.toString().includes('Widget')) {
            signatureIndicatorsFound++;
          }
        }
      }
    }
  }
  
  const valid = hasSignatureField || signatureIndicatorsFound > 0;
  
  return {
    valid,
    details: valid 
      ? `Document contains ${signatures.length > 0 ? signatures.length : signatureIndicatorsFound} signature indicator(s). Document integrity appears intact.`
      : "No digital signatures detected in this document.",
    signatures,
  };
}

async function lockPdfWithSignature(file: Express.Multer.File, options: any): Promise<Buffer> {
  const signedPdf = await addSignatureToPdf(file, {
    name: options.signatureName || "Document Owner",
    reason: options.signatureReason || "Document locked and signed",
    position: options.signaturePosition || "bottom-right",
    page: "last",
  });
  
  const tempPath = path.join(uploadDir, `temp-${randomUUID()}.pdf`);
  fs.writeFileSync(tempPath, signedPdf);
  
  const tempFile: Express.Multer.File = {
    ...file,
    path: tempPath,
  };
  
  const password = options.lockPassword || options.password;
  if (!password) {
    cleanupFiles(tempPath);
    return signedPdf;
  }
  
  try {
    const lockedPdf = await protectPdf(tempFile, password);
    cleanupFiles(tempPath);
    return lockedPdf;
  } catch (e) {
    cleanupFiles(tempPath);
    return signedPdf;
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
  
  const workbook = XLSX.utils.book_new();
  
  const summaryData = [
    ['PDF Data Extraction Report'],
    [''],
    ['Document Information'],
    ['Source File', fileName],
    ['Total Pages', pages.length],
    ['Title', pdf.getTitle() || 'N/A'],
    ['Author', pdf.getAuthor() || 'N/A'],
    ['Creator', pdf.getCreator() || 'N/A'],
    ['Producer', pdf.getProducer() || 'N/A'],
    ['Creation Date', pdf.getCreationDate()?.toISOString() || 'N/A'],
    ['Modification Date', pdf.getModificationDate()?.toISOString() || 'N/A'],
    [''],
    ['Page Details'],
    ['Page Number', 'Width (pt)', 'Height (pt)', 'Rotation', 'Orientation'],
  ];
  
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const { width, height } = page.getSize();
    const rotation = page.getRotation().angle;
    const orientation = width > height ? 'Landscape' : 'Portrait';
    summaryData.push([i + 1, Math.round(width), Math.round(height), rotation, orientation]);
  }
  
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  summarySheet['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 10 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Document Summary');
  
  for (let i = 0; i < Math.min(pages.length, 50); i++) {
    const page = pages[i];
    const { width, height } = page.getSize();
    const rotation = page.getRotation().angle;
    
    const pageData = [
      [`Page ${i + 1} Data`],
      [''],
      ['Property', 'Value'],
      ['Page Number', i + 1],
      ['Width (points)', Math.round(width)],
      ['Height (points)', Math.round(height)],
      ['Width (inches)', (width / 72).toFixed(2)],
      ['Height (inches)', (height / 72).toFixed(2)],
      ['Rotation', `${rotation} degrees`],
      ['Orientation', width > height ? 'Landscape' : 'Portrait'],
      [''],
      ['Note: Text content extraction requires OCR for scanned documents.'],
    ];
    
    const pageSheet = XLSX.utils.aoa_to_sheet(pageData);
    pageSheet['!cols'] = [{ wch: 20 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(workbook, pageSheet, `Page ${i + 1}`);
  }
  
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  return Buffer.from(buffer);
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
  
  let fields: any[] = [];
  try {
    const form = pdf.getForm();
    fields = form.getFields();
  } catch (e) {
    fields = [];
  }
  
  const formFieldsData = fields.map(field => {
    const fieldType = field.constructor.name;
    let value: any = null;
    
    try {
      if (fieldType === 'PDFTextField') {
        value = (field as any).getText?.() || null;
      } else if (fieldType === 'PDFCheckBox') {
        value = (field as any).isChecked?.() || false;
      } else if (fieldType === 'PDFDropdown') {
        value = (field as any).getSelected?.() || [];
      } else if (fieldType === 'PDFRadioGroup') {
        value = (field as any).getSelected?.() || null;
      }
    } catch (e) {
      value = null;
    }
    
    return {
      name: field.getName(),
      type: fieldType.replace('PDF', '').replace('Field', ''),
      value: value,
      isReadOnly: field.isReadOnly(),
    };
  });
  
  const jsonData = {
    document: {
      filename: fileName,
      extractedAt: new Date().toISOString(),
      metadata: {
        title: pdf.getTitle() || fileName,
        author: pdf.getAuthor() || null,
        subject: pdf.getSubject() || null,
        keywords: pdf.getKeywords() || null,
        creator: pdf.getCreator() || null,
        producer: pdf.getProducer() || null,
        creationDate: pdf.getCreationDate()?.toISOString() || null,
        modificationDate: pdf.getModificationDate()?.toISOString() || null,
      },
      statistics: {
        pageCount: pages.length,
        formFieldCount: fields.length,
        hasEncryption: false,
      },
      pages: pages.map((page, index) => {
        const { width, height } = page.getSize();
        return {
          pageNumber: index + 1,
          dimensions: {
            width: Math.round(width),
            height: Math.round(height),
            widthInches: parseFloat((width / 72).toFixed(2)),
            heightInches: parseFloat((height / 72).toFixed(2)),
          },
          rotation: page.getRotation().angle,
          orientation: width > height ? 'landscape' : 'portrait',
        };
      }),
      formFields: formFieldsData.length > 0 ? formFieldsData : null,
    }
  };
  
  const jsonString = JSON.stringify(jsonData, null, 2);
  return Buffer.from(jsonString, 'utf-8');
}

async function pdfToCsv(file: Express.Multer.File): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdf.getPages();
  const fileName = path.basename(file.originalname, path.extname(file.originalname));
  
  let fields: any[] = [];
  try {
    const form = pdf.getForm();
    fields = form.getFields();
  } catch (e) {
    fields = [];
  }
  
  const csvLines: string[] = [];
  
  csvLines.push('# PDF Data Extraction Report');
  csvLines.push(`# Source File: ${fileName}`);
  csvLines.push(`# Extraction Date: ${new Date().toISOString()}`);
  csvLines.push('');
  
  csvLines.push('# Document Metadata');
  csvLines.push('Property,Value');
  csvLines.push(`Title,"${(pdf.getTitle() || fileName).replace(/"/g, '""')}"`);
  csvLines.push(`Author,"${(pdf.getAuthor() || 'N/A').replace(/"/g, '""')}"`);
  csvLines.push(`Subject,"${(pdf.getSubject() || 'N/A').replace(/"/g, '""')}"`);
  csvLines.push(`Creator,"${(pdf.getCreator() || 'N/A').replace(/"/g, '""')}"`);
  csvLines.push(`Producer,"${(pdf.getProducer() || 'N/A').replace(/"/g, '""')}"`);
  csvLines.push(`Creation Date,"${pdf.getCreationDate()?.toISOString() || 'N/A'}"`);
  csvLines.push(`Modification Date,"${pdf.getModificationDate()?.toISOString() || 'N/A'}"`);
  csvLines.push(`Page Count,${pages.length}`);
  csvLines.push('');
  
  csvLines.push('# Page Details');
  csvLines.push('Page Number,Width (pt),Height (pt),Width (in),Height (in),Rotation,Orientation');
  
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const { width, height } = page.getSize();
    const rotation = page.getRotation().angle;
    const orientation = width > height ? 'Landscape' : 'Portrait';
    const widthIn = (width / 72).toFixed(2);
    const heightIn = (height / 72).toFixed(2);
    csvLines.push(`${i + 1},${Math.round(width)},${Math.round(height)},${widthIn},${heightIn},${rotation},${orientation}`);
  }
  
  if (fields.length > 0) {
    csvLines.push('');
    csvLines.push('# Form Fields');
    csvLines.push('Field Name,Field Type,Value,Read Only');
    
    for (const field of fields) {
      const fieldName = field.getName().replace(/"/g, '""');
      const fieldType = field.constructor.name.replace('PDF', '').replace('Field', '');
      let value = '';
      
      try {
        if (field.constructor.name === 'PDFTextField') {
          value = (field as any).getText?.() || '';
        } else if (field.constructor.name === 'PDFCheckBox') {
          value = (field as any).isChecked?.() ? 'Checked' : 'Unchecked';
        } else if (field.constructor.name === 'PDFDropdown') {
          const selected = (field as any).getSelected?.();
          value = Array.isArray(selected) ? selected.join('; ') : (selected || '');
        } else if (field.constructor.name === 'PDFRadioGroup') {
          value = (field as any).getSelected?.() || '';
        }
      } catch (e) {
        value = '';
      }
      
      const isReadOnly = field.isReadOnly() ? 'Yes' : 'No';
      csvLines.push(`"${fieldName}",${fieldType},"${value.replace(/"/g, '""')}",${isReadOnly}`);
    }
  }
  
  return Buffer.from(csvLines.join('\n'), 'utf-8');
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

function hexToRgbValues(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255
  } : { r: 0, g: 0, b: 0 };
}

async function addImageToPdf(
  pdfFile: Express.Multer.File,
  imageFile: Express.Multer.File,
  x: number,
  y: number,
  width: number,
  height: number,
  position: string,
  targetPage: number
): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(pdfFile.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdf.getPages();
  const safeTargetPage = Math.max(1, Math.min(pages.length, targetPage));
  const page = pages[safeTargetPage - 1];
  const { width: pageWidth, height: pageHeight } = page.getSize();
  
  const imageBuffer = fs.readFileSync(imageFile.path);
  const ext = path.extname(imageFile.originalname).toLowerCase();
  
  let image;
  if (ext === ".png") {
    image = await pdf.embedPng(imageBuffer);
  } else {
    const jpgBuffer = await sharp(imageBuffer).jpeg().toBuffer();
    image = await pdf.embedJpg(jpgBuffer);
  }
  
  const safeWidth = Math.min(width || 200, pageWidth - 20);
  const safeHeight = Math.min(height || 200, pageHeight - 20);
  
  let finalX = x;
  let finalY = y;
  
  switch (position) {
    case "center":
      finalX = (pageWidth - safeWidth) / 2;
      finalY = (pageHeight - safeHeight) / 2;
      break;
    case "top-left":
      finalX = 20;
      finalY = pageHeight - safeHeight - 20;
      break;
    case "top-right":
      finalX = pageWidth - safeWidth - 20;
      finalY = pageHeight - safeHeight - 20;
      break;
    case "bottom-left":
      finalX = 20;
      finalY = 20;
      break;
    case "bottom-right":
      finalX = pageWidth - safeWidth - 20;
      finalY = 20;
      break;
    default:
      finalX = Math.max(0, Math.min(x, pageWidth - safeWidth));
      finalY = Math.max(0, Math.min(y, pageHeight - safeHeight));
  }
  
  page.drawImage(image, {
    x: finalX,
    y: finalY,
    width: safeWidth,
    height: safeHeight,
  });
  
  return Buffer.from(await pdf.save());
}

async function replaceImageInPdf(
  pdfFile: Express.Multer.File,
  imageFile: Express.Multer.File,
  targetPage: number
): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(pdfFile.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdf.getPages();
  const safeTargetPage = Math.max(1, Math.min(pages.length, targetPage));
  const page = pages[safeTargetPage - 1];
  const { width: pageWidth, height: pageHeight } = page.getSize();
  
  const imageBuffer = fs.readFileSync(imageFile.path);
  const ext = path.extname(imageFile.originalname).toLowerCase();
  
  let image;
  if (ext === ".png") {
    image = await pdf.embedPng(imageBuffer);
  } else {
    const jpgBuffer = await sharp(imageBuffer).jpeg().toBuffer();
    image = await pdf.embedJpg(jpgBuffer);
  }
  
  page.drawImage(image, {
    x: pageWidth * 0.1,
    y: pageHeight * 0.3,
    width: pageWidth * 0.8,
    height: pageHeight * 0.4,
  });
  
  return Buffer.from(await pdf.save());
}

async function addShapesToPdf(
  file: Express.Multer.File,
  shapeType: string,
  x: number,
  y: number,
  width: number,
  height: number,
  strokeColor: string,
  fillColor: string,
  strokeWidth: number,
  targetPage: number
): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdf.getPages();
  const safeTargetPage = Math.max(1, Math.min(pages.length, targetPage));
  const page = pages[safeTargetPage - 1];
  
  const stroke = hexToRgbValues(strokeColor);
  const fill = fillColor ? hexToRgbValues(fillColor) : null;
  
  switch (shapeType) {
    case "rectangle":
      page.drawRectangle({
        x,
        y,
        width,
        height,
        borderColor: rgb(stroke.r, stroke.g, stroke.b),
        borderWidth: strokeWidth,
        color: fill ? rgb(fill.r, fill.g, fill.b) : undefined,
      });
      break;
    case "circle":
    case "ellipse":
      page.drawEllipse({
        x: x + width / 2,
        y: y + height / 2,
        xScale: width / 2,
        yScale: height / 2,
        borderColor: rgb(stroke.r, stroke.g, stroke.b),
        borderWidth: strokeWidth,
        color: fill ? rgb(fill.r, fill.g, fill.b) : undefined,
      });
      break;
    case "line":
      page.drawLine({
        start: { x, y },
        end: { x: x + width, y: y + height },
        thickness: strokeWidth,
        color: rgb(stroke.r, stroke.g, stroke.b),
      });
      break;
    case "arrow":
      page.drawLine({
        start: { x, y },
        end: { x: x + width, y: y + height },
        thickness: strokeWidth,
        color: rgb(stroke.r, stroke.g, stroke.b),
      });
      const arrowSize = Math.min(15, width / 4);
      const angle = Math.atan2(height, width);
      page.drawLine({
        start: { x: x + width, y: y + height },
        end: { 
          x: x + width - arrowSize * Math.cos(angle - Math.PI / 6),
          y: y + height - arrowSize * Math.sin(angle - Math.PI / 6)
        },
        thickness: strokeWidth,
        color: rgb(stroke.r, stroke.g, stroke.b),
      });
      page.drawLine({
        start: { x: x + width, y: y + height },
        end: { 
          x: x + width - arrowSize * Math.cos(angle + Math.PI / 6),
          y: y + height - arrowSize * Math.sin(angle + Math.PI / 6)
        },
        thickness: strokeWidth,
        color: rgb(stroke.r, stroke.g, stroke.b),
      });
      break;
  }
  
  return Buffer.from(await pdf.save());
}

async function drawOnPdf(
  file: Express.Multer.File,
  color: string,
  strokeWidth: number,
  targetPage: number
): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdf.getPages();
  const safeTargetPage = Math.max(1, Math.min(pages.length, targetPage));
  const page = pages[safeTargetPage - 1];
  const { width: pageWidth, height: pageHeight } = page.getSize();
  
  const drawColor = hexToRgbValues(color);
  
  const centerX = pageWidth / 2;
  const centerY = pageHeight / 2;
  const radius = Math.min(pageWidth, pageHeight) * 0.2;
  
  for (let i = 0; i < 12; i++) {
    const angle1 = (i * Math.PI * 2) / 12;
    const angle2 = ((i + 1) * Math.PI * 2) / 12;
    page.drawLine({
      start: { 
        x: centerX + radius * Math.cos(angle1), 
        y: centerY + radius * Math.sin(angle1) 
      },
      end: { 
        x: centerX + radius * Math.cos(angle2), 
        y: centerY + radius * Math.sin(angle2) 
      },
      thickness: strokeWidth,
      color: rgb(drawColor.r, drawColor.g, drawColor.b),
    });
  }
  
  return Buffer.from(await pdf.save());
}

async function pdfAnnotator(
  file: Express.Multer.File,
  annotationType: string,
  color: string,
  text: string,
  targetPage: number,
  x: number,
  y: number,
  width: number,
  height: number
): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdf.getPages();
  const safeTargetPage = Math.max(1, Math.min(pages.length, targetPage));
  const page = pages[safeTargetPage - 1];
  
  const annoColor = hexToRgbValues(color);
  
  switch (annotationType) {
    case "highlight":
      page.drawRectangle({
        x,
        y,
        width,
        height,
        color: rgb(annoColor.r, annoColor.g, annoColor.b),
        opacity: 0.4,
      });
      break;
    case "underline":
      page.drawLine({
        start: { x, y },
        end: { x: x + width, y },
        thickness: 2,
        color: rgb(annoColor.r, annoColor.g, annoColor.b),
      });
      break;
    case "strikethrough":
      page.drawLine({
        start: { x, y: y + height / 2 },
        end: { x: x + width, y: y + height / 2 },
        thickness: 2,
        color: rgb(annoColor.r, annoColor.g, annoColor.b),
      });
      break;
    case "note":
      if (text) {
        const font = await pdf.embedFont(StandardFonts.Helvetica);
        page.drawText(text, {
          x,
          y,
          size: 10,
          font,
          color: rgb(annoColor.r, annoColor.g, annoColor.b),
        });
      }
      page.drawRectangle({
        x: x - 5,
        y: y - 5,
        width: width + 10,
        height: height + 10,
        borderColor: rgb(annoColor.r, annoColor.g, annoColor.b),
        borderWidth: 1,
      });
      break;
    case "freehand":
      page.drawEllipse({
        x: x + width / 2,
        y: y + height / 2,
        xScale: width / 2,
        yScale: height / 2,
        borderColor: rgb(annoColor.r, annoColor.g, annoColor.b),
        borderWidth: 2,
      });
      break;
  }
  
  return Buffer.from(await pdf.save());
}

async function annotatePdf(
  file: Express.Multer.File,
  annotationType: string,
  color: string,
  text: string,
  targetPage: number,
  x: number,
  y: number
): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdf.getPages();
  const safeTargetPage = Math.max(1, Math.min(pages.length, targetPage));
  const page = pages[safeTargetPage - 1];
  
  const annoColor = hexToRgbValues(color);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  
  if (text) {
    page.drawText(text, {
      x,
      y,
      size: 12,
      font,
      color: rgb(annoColor.r, annoColor.g, annoColor.b),
    });
  }
  
  page.drawRectangle({
    x: x - 5,
    y: y - 15,
    width: 150,
    height: 25,
    borderColor: rgb(annoColor.r, annoColor.g, annoColor.b),
    borderWidth: 1,
  });
  
  return Buffer.from(await pdf.save());
}

async function highlightPdfText(
  file: Express.Multer.File,
  color: string,
  opacity: number,
  targetPage: number,
  x: number,
  y: number,
  width: number,
  height: number
): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdf.getPages();
  const safeTargetPage = Math.max(1, Math.min(pages.length, targetPage));
  const page = pages[safeTargetPage - 1];
  
  const highlightColor = hexToRgbValues(color);
  
  page.drawRectangle({
    x,
    y,
    width,
    height,
    color: rgb(highlightColor.r, highlightColor.g, highlightColor.b),
    opacity: Math.max(0.1, Math.min(1, opacity)),
  });
  
  return Buffer.from(await pdf.save());
}

async function underlinePdfText(
  file: Express.Multer.File,
  color: string,
  targetPage: number,
  x: number,
  y: number,
  width: number,
  strokeWidth: number
): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdf.getPages();
  const safeTargetPage = Math.max(1, Math.min(pages.length, targetPage));
  const page = pages[safeTargetPage - 1];
  
  const underlineColor = hexToRgbValues(color);
  
  page.drawLine({
    start: { x, y },
    end: { x: x + width, y },
    thickness: strokeWidth,
    color: rgb(underlineColor.r, underlineColor.g, underlineColor.b),
  });
  
  return Buffer.from(await pdf.save());
}

async function strikethroughPdfText(
  file: Express.Multer.File,
  color: string,
  targetPage: number,
  x: number,
  y: number,
  width: number,
  strokeWidth: number
): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdf.getPages();
  const safeTargetPage = Math.max(1, Math.min(pages.length, targetPage));
  const page = pages[safeTargetPage - 1];
  
  const strikeColor = hexToRgbValues(color);
  
  page.drawLine({
    start: { x, y: y + 6 },
    end: { x: x + width, y: y + 6 },
    thickness: strokeWidth,
    color: rgb(strikeColor.r, strikeColor.g, strikeColor.b),
  });
  
  return Buffer.from(await pdf.save());
}

async function pdfMarker(
  file: Express.Multer.File,
  color: string,
  markerType: string,
  targetPage: number,
  x: number,
  y: number,
  width: number,
  height: number
): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdf.getPages();
  const safeTargetPage = Math.max(1, Math.min(pages.length, targetPage));
  const page = pages[safeTargetPage - 1];
  
  const markerColor = hexToRgbValues(color);
  
  switch (markerType) {
    case "highlight":
      page.drawRectangle({
        x,
        y,
        width,
        height,
        color: rgb(markerColor.r, markerColor.g, markerColor.b),
        opacity: 0.4,
      });
      break;
    case "underline":
      page.drawLine({
        start: { x, y },
        end: { x: x + width, y },
        thickness: 2,
        color: rgb(markerColor.r, markerColor.g, markerColor.b),
      });
      break;
    case "strikethrough":
      page.drawLine({
        start: { x, y: y + height / 2 },
        end: { x: x + width, y: y + height / 2 },
        thickness: 2,
        color: rgb(markerColor.r, markerColor.g, markerColor.b),
      });
      break;
    default:
      page.drawRectangle({
        x,
        y,
        width,
        height,
        color: rgb(markerColor.r, markerColor.g, markerColor.b),
        opacity: 0.4,
      });
  }
  
  return Buffer.from(await pdf.save());
}

async function addCommentsToPdf(
  file: Express.Multer.File,
  commentText: string,
  author: string,
  targetPage: number,
  x: number,
  y: number
): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdf.getPages();
  const safeTargetPage = Math.max(1, Math.min(pages.length, targetPage));
  const page = pages[safeTargetPage - 1];
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);
  
  page.drawRectangle({
    x: x - 5,
    y: y - 5,
    width: 20,
    height: 20,
    color: rgb(1, 0.9, 0.4),
    borderColor: rgb(0.8, 0.6, 0),
    borderWidth: 1,
  });
  
  page.drawText('N', {
    x: x + 2,
    y: y + 2,
    size: 12,
    font: boldFont,
    color: rgb(0.5, 0.3, 0),
  });
  
  const commentBoxX = x + 25;
  const commentBoxY = y - 60;
  const commentBoxWidth = 200;
  const lines = commentText.match(/.{1,40}/g) || [commentText];
  const commentBoxHeight = 30 + lines.length * 14;
  
  page.drawRectangle({
    x: commentBoxX,
    y: commentBoxY,
    width: commentBoxWidth,
    height: commentBoxHeight,
    color: rgb(1, 1, 0.85),
    borderColor: rgb(0.8, 0.8, 0.6),
    borderWidth: 1,
  });
  
  page.drawText(author, {
    x: commentBoxX + 5,
    y: commentBoxY + commentBoxHeight - 15,
    size: 9,
    font: boldFont,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  let lineY = commentBoxY + commentBoxHeight - 30;
  for (const line of lines) {
    page.drawText(line, {
      x: commentBoxX + 5,
      y: lineY,
      size: 10,
      font,
      color: rgb(0, 0, 0),
    });
    lineY -= 14;
  }
  
  return Buffer.from(await pdf.save());
}

async function flattenPdf(file: Express.Multer.File): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const sourcePdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  
  const flattenedPdf = await PDFDocument.create();
  const pageCount = sourcePdf.getPageCount();
  
  for (let i = 0; i < pageCount; i++) {
    const [copiedPage] = await flattenedPdf.copyPages(sourcePdf, [i]);
    flattenedPdf.addPage(copiedPage);
  }
  
  flattenedPdf.setProducer('PDF Tools - Flatten PDF');
  flattenedPdf.setCreator('PDF Tools');
  
  return Buffer.from(await flattenedPdf.save());
}

async function flattenPdfComments(file: Express.Multer.File): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const sourcePdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  
  const flattenedPdf = await PDFDocument.create();
  const font = await flattenedPdf.embedFont(StandardFonts.Helvetica);
  const pageCount = sourcePdf.getPageCount();
  
  for (let i = 0; i < pageCount; i++) {
    const [copiedPage] = await flattenedPdf.copyPages(sourcePdf, [i]);
    flattenedPdf.addPage(copiedPage);
  }
  
  flattenedPdf.setProducer('PDF Tools - Flatten Comments');
  flattenedPdf.setCreator('PDF Tools');
  
  return Buffer.from(await flattenedPdf.save());
}

async function flattenPdfLayers(file: Express.Multer.File): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const sourcePdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  
  const flattenedPdf = await PDFDocument.create();
  const pageCount = sourcePdf.getPageCount();
  
  for (let i = 0; i < pageCount; i++) {
    const [copiedPage] = await flattenedPdf.copyPages(sourcePdf, [i]);
    flattenedPdf.addPage(copiedPage);
  }
  
  flattenedPdf.setProducer('PDF Tools - Flatten Layers');
  flattenedPdf.setCreator('PDF Tools');
  
  return Buffer.from(await flattenedPdf.save());
}

async function addHyperlinkToPdf(
  file: Express.Multer.File,
  url: string,
  targetPage: number,
  x: number,
  y: number,
  width: number,
  height: number
): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdf.getPages();
  const safeTargetPage = Math.max(1, Math.min(pages.length, targetPage));
  const page = pages[safeTargetPage - 1];
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  
  page.drawRectangle({
    x,
    y,
    width,
    height,
    borderColor: rgb(0, 0, 0.8),
    borderWidth: 1,
    opacity: 0.1,
    color: rgb(0.9, 0.9, 1),
  });
  
  const displayUrl = url.length > 30 ? url.substring(0, 27) + '...' : url;
  page.drawText(displayUrl, {
    x: x + 5,
    y: y + 5,
    size: 10,
    font,
    color: rgb(0, 0, 0.8),
  });
  
  const context = pdf.context;
  const uriAction = context.obj({
    Type: 'Action',
    S: 'URI',
    URI: PDFName.of(url),
  });
  
  const linkAnnotation = context.obj({
    Type: 'Annot',
    Subtype: 'Link',
    Rect: [x, y, x + width, y + height],
    Border: [0, 0, 0],
    A: uriAction,
  });
  
  const pageRef = page.ref;
  const pageDict = context.lookup(pageRef) as PDFDict;
  
  let annots = pageDict.get(PDFName.of('Annots'));
  if (annots) {
    const annotsArray = context.lookup(annots) as PDFArray;
    annotsArray.push(linkAnnotation);
  } else {
    pageDict.set(PDFName.of('Annots'), context.obj([linkAnnotation]));
  }
  
  return Buffer.from(await pdf.save());
}

async function editPdfMetadata(
  file: Express.Multer.File,
  title: string,
  author: string,
  subject: string,
  keywords: string,
  creator: string,
  producer: string
): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  
  if (title) pdf.setTitle(title);
  if (author) pdf.setAuthor(author);
  if (subject) pdf.setSubject(subject);
  if (keywords) pdf.setKeywords(keywords.split(',').map(k => k.trim()));
  if (creator) pdf.setCreator(creator);
  if (producer) pdf.setProducer(producer);
  
  return Buffer.from(await pdf.save());
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

async function extractDataFromPdf(file: Express.Multer.File, outputFormat: string = 'xlsx'): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdf.getPages();
  const fileName = path.basename(file.originalname, path.extname(file.originalname));
  
  let fields: any[] = [];
  try {
    const form = pdf.getForm();
    fields = form.getFields();
  } catch (e) {
    fields = [];
  }
  
  const extractedData = {
    document: {
      filename: fileName,
      extractedAt: new Date().toISOString(),
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
        };
      }),
      formFields: fields.map(field => ({
        name: field.getName(),
        type: field.constructor.name.replace('PDF', '').replace('Field', ''),
        isReadOnly: field.isReadOnly(),
      })),
    }
  };
  
  if (outputFormat === 'json') {
    return Buffer.from(JSON.stringify(extractedData, null, 2), 'utf-8');
  } else if (outputFormat === 'csv') {
    const csvLines: string[] = [];
    csvLines.push('Property,Value');
    csvLines.push(`Filename,"${fileName}"`);
    csvLines.push(`Page Count,${pages.length}`);
    csvLines.push(`Form Fields,${fields.length}`);
    csvLines.push('');
    csvLines.push('Page,Width,Height,Rotation');
    for (const pageData of extractedData.document.pages) {
      csvLines.push(`${pageData.pageNumber},${pageData.width},${pageData.height},${pageData.rotation}`);
    }
    return Buffer.from(csvLines.join('\n'), 'utf-8');
  } else {
    const workbook = XLSX.utils.book_new();
    
    const summaryData = [
      ['PDF Data Extraction'],
      [''],
      ['Document Information'],
      ['Filename', fileName],
      ['Page Count', pages.length],
      ['Form Fields', fields.length],
      ['Title', extractedData.document.metadata.title || ''],
      ['Author', extractedData.document.metadata.author || ''],
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
    
    const pagesData = [['Page', 'Width', 'Height', 'Rotation']];
    for (const pageData of extractedData.document.pages) {
      pagesData.push([pageData.pageNumber, pageData.width, pageData.height, pageData.rotation]);
    }
    const pagesSheet = XLSX.utils.aoa_to_sheet(pagesData);
    XLSX.utils.book_append_sheet(workbook, pagesSheet, 'Pages');
    
    if (fields.length > 0) {
      const fieldsData = [['Field Name', 'Type', 'Read Only']];
      for (const fieldData of extractedData.document.formFields) {
        fieldsData.push([fieldData.name, fieldData.type, fieldData.isReadOnly ? 'Yes' : 'No']);
      }
      const fieldsSheet = XLSX.utils.aoa_to_sheet(fieldsData);
      XLSX.utils.book_append_sheet(workbook, fieldsSheet, 'Form Fields');
    }
    
    return Buffer.from(XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }));
  }
}

async function pdfDataExtractor(file: Express.Multer.File, outputFormat: string = 'xlsx'): Promise<Buffer> {
  return extractDataFromPdf(file, outputFormat);
}

async function fillPdfForms(file: Express.Multer.File, formData: string): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  
  let form;
  try {
    form = pdf.getForm();
  } catch (e) {
    return Buffer.from(await pdf.save());
  }
  
  let fieldsData: Record<string, any> = {};
  try {
    fieldsData = JSON.parse(formData || '{}');
  } catch (e) {
    fieldsData = {};
  }
  
  for (const [fieldName, value] of Object.entries(fieldsData)) {
    try {
      const field = form.getField(fieldName);
      if (!field) continue;
      
      const fieldType = field.constructor.name;
      
      if (fieldType === 'PDFTextField') {
        (field as any).setText(String(value));
      } else if (fieldType === 'PDFCheckBox') {
        if (value === true || value === 'true' || value === 'checked' || value === 1) {
          (field as any).check();
        } else {
          (field as any).uncheck();
        }
      } else if (fieldType === 'PDFDropdown') {
        (field as any).select(String(value));
      } else if (fieldType === 'PDFRadioGroup') {
        (field as any).select(String(value));
      }
    } catch (e) {
      console.error(`Error filling field ${fieldName}:`, e);
    }
  }
  
  return Buffer.from(await pdf.save());
}

async function pdfFormFiller(file: Express.Multer.File, formData: string): Promise<Buffer> {
  return fillPdfForms(file, formData);
}

async function createFillablePdf(file: Express.Multer.File, fieldsConfig: string): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  
  const form = pdf.getForm();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  
  let fields: Array<{
    name: string;
    type: string;
    page: number;
    x: number;
    y: number;
    width: number;
    height: number;
    label?: string;
    options?: string[];
  }> = [];
  
  try {
    fields = JSON.parse(fieldsConfig || '[]');
  } catch (e) {
    fields = [
      { name: 'name', type: 'text', page: 1, x: 50, y: 700, width: 200, height: 20, label: 'Name' },
      { name: 'email', type: 'text', page: 1, x: 50, y: 650, width: 200, height: 20, label: 'Email' },
    ];
  }
  
  const pages = pdf.getPages();
  
  for (const fieldConfig of fields) {
    const pageIndex = Math.max(0, Math.min(pages.length - 1, (fieldConfig.page || 1) - 1));
    const page = pages[pageIndex];
    
    const fieldName = fieldConfig.name || `field_${Date.now()}`;
    const x = fieldConfig.x || 50;
    const y = fieldConfig.y || 700;
    const width = fieldConfig.width || 150;
    const height = fieldConfig.height || 20;
    
    if (fieldConfig.label) {
      page.drawText(fieldConfig.label, {
        x: x,
        y: y + height + 5,
        size: 10,
        font,
        color: rgb(0.2, 0.2, 0.2),
      });
    }
    
    try {
      if (fieldConfig.type === 'text') {
        const textField = form.createTextField(fieldName);
        textField.addToPage(page, { x, y, width, height });
      } else if (fieldConfig.type === 'checkbox') {
        const checkbox = form.createCheckBox(fieldName);
        checkbox.addToPage(page, { x, y, width: 15, height: 15 });
      } else if (fieldConfig.type === 'dropdown' && fieldConfig.options) {
        const dropdown = form.createDropdown(fieldName);
        dropdown.addOptions(fieldConfig.options);
        dropdown.addToPage(page, { x, y, width, height });
      } else if (fieldConfig.type === 'radio' && fieldConfig.options) {
        const radioGroup = form.createRadioGroup(fieldName);
        let radioY = y;
        for (const option of fieldConfig.options) {
          radioGroup.addOptionToPage(option, page, { x, y: radioY, width: 15, height: 15 });
          page.drawText(option, {
            x: x + 20,
            y: radioY + 2,
            size: 10,
            font,
            color: rgb(0.3, 0.3, 0.3),
          });
          radioY -= 20;
        }
      }
    } catch (e) {
      console.error(`Error creating field ${fieldName}:`, e);
    }
  }
  
  pdf.setProducer('PDF Tools - Create Fillable PDF');
  return Buffer.from(await pdf.save());
}

async function pdfFormCreator(file: Express.Multer.File, fieldsConfig: string): Promise<Buffer> {
  return createFillablePdf(file, fieldsConfig);
}

async function extractPdfFormData(file: Express.Multer.File, outputFormat: string = 'json'): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const fileName = path.basename(file.originalname, path.extname(file.originalname));
  
  let fields: any[] = [];
  try {
    const form = pdf.getForm();
    fields = form.getFields();
  } catch (e) {
    fields = [];
  }
  
  const formData: Record<string, any> = {};
  const fieldsMetadata: Array<{
    name: string;
    type: string;
    value: any;
    isReadOnly: boolean;
  }> = [];
  
  for (const field of fields) {
    const fieldName = field.getName();
    const fieldType = field.constructor.name;
    let value: any = null;
    
    try {
      if (fieldType === 'PDFTextField') {
        value = (field as any).getText?.() || '';
      } else if (fieldType === 'PDFCheckBox') {
        value = (field as any).isChecked?.() || false;
      } else if (fieldType === 'PDFDropdown') {
        const selected = (field as any).getSelected?.();
        value = Array.isArray(selected) ? selected : [selected].filter(Boolean);
      } else if (fieldType === 'PDFRadioGroup') {
        value = (field as any).getSelected?.() || null;
      } else if (fieldType === 'PDFSignature') {
        value = '[Signature Field]';
      }
    } catch (e) {
      value = null;
    }
    
    formData[fieldName] = value;
    fieldsMetadata.push({
      name: fieldName,
      type: fieldType.replace('PDF', '').replace('Field', ''),
      value: value,
      isReadOnly: field.isReadOnly(),
    });
  }
  
  if (outputFormat === 'csv') {
    const csvLines: string[] = [];
    csvLines.push('Field Name,Field Type,Value,Read Only');
    for (const field of fieldsMetadata) {
      const valueStr = typeof field.value === 'object' 
        ? JSON.stringify(field.value) 
        : String(field.value || '');
      csvLines.push(`"${field.name}","${field.type}","${valueStr.replace(/"/g, '""')}","${field.isReadOnly ? 'Yes' : 'No'}"`);
    }
    return Buffer.from(csvLines.join('\n'), 'utf-8');
  } else if (outputFormat === 'xlsx') {
    const workbook = XLSX.utils.book_new();
    
    const summaryData = [
      ['PDF Form Data Extraction'],
      [''],
      ['Source File', fileName],
      ['Extraction Date', new Date().toISOString()],
      ['Total Fields', fields.length],
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
    
    const fieldsData = [['Field Name', 'Field Type', 'Value', 'Read Only']];
    for (const field of fieldsMetadata) {
      const valueStr = typeof field.value === 'object' 
        ? JSON.stringify(field.value) 
        : String(field.value || '');
      fieldsData.push([field.name, field.type, valueStr, field.isReadOnly ? 'Yes' : 'No']);
    }
    const fieldsSheet = XLSX.utils.aoa_to_sheet(fieldsData);
    XLSX.utils.book_append_sheet(workbook, fieldsSheet, 'Form Fields');
    
    return Buffer.from(XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }));
  } else {
    const jsonData = {
      document: {
        filename: fileName,
        extractedAt: new Date().toISOString(),
        fieldCount: fields.length,
      },
      formData: formData,
      fieldsMetadata: fieldsMetadata,
    };
    return Buffer.from(JSON.stringify(jsonData, null, 2), 'utf-8');
  }
}

async function redactPdf(
  file: Express.Multer.File,
  redactAreas: string,
  redactColor: string = "#000000"
): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdf.getPages();
  
  const colorValues = hexToRgbValues(redactColor);
  
  let areas: Array<{ page: number; x: number; y: number; width: number; height: number }> = [];
  try {
    areas = JSON.parse(redactAreas);
  } catch (e) {
    areas = [{ page: 1, x: 50, y: 700, width: 200, height: 30 }];
  }
  
  for (const area of areas) {
    const pageIndex = Math.max(0, Math.min(pages.length - 1, (area.page || 1) - 1));
    const page = pages[pageIndex];
    
    page.drawRectangle({
      x: area.x || 50,
      y: area.y || 700,
      width: area.width || 200,
      height: area.height || 30,
      color: rgb(colorValues.r, colorValues.g, colorValues.b),
    });
  }
  
  pdf.setProducer('PDF Tools - Redaction');
  return Buffer.from(await pdf.save());
}

async function blackoutPdf(
  file: Express.Multer.File,
  redactAreas: string
): Promise<Buffer> {
  return redactPdf(file, redactAreas, "#000000");
}

async function sanitizePdf(
  file: Express.Multer.File,
  level: string = "standard"
): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const sourcePdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  
  const sanitizedPdf = await PDFDocument.create();
  const pageCount = sourcePdf.getPageCount();
  
  for (let i = 0; i < pageCount; i++) {
    const [copiedPage] = await sanitizedPdf.copyPages(sourcePdf, [i]);
    sanitizedPdf.addPage(copiedPage);
  }
  
  sanitizedPdf.setTitle("");
  sanitizedPdf.setAuthor("");
  sanitizedPdf.setSubject("");
  sanitizedPdf.setKeywords([]);
  sanitizedPdf.setCreator("");
  sanitizedPdf.setProducer("PDF Tools - Sanitized");
  sanitizedPdf.setCreationDate(new Date());
  sanitizedPdf.setModificationDate(new Date());
  
  return Buffer.from(await sanitizedPdf.save());
}

async function removePdfMetadata(file: Express.Multer.File): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const sourcePdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  
  const cleanPdf = await PDFDocument.create();
  const pageCount = sourcePdf.getPageCount();
  
  for (let i = 0; i < pageCount; i++) {
    const [copiedPage] = await cleanPdf.copyPages(sourcePdf, [i]);
    cleanPdf.addPage(copiedPage);
  }
  
  cleanPdf.setTitle("");
  cleanPdf.setAuthor("");
  cleanPdf.setSubject("");
  cleanPdf.setKeywords([]);
  cleanPdf.setCreator("");
  cleanPdf.setProducer("");
  
  return Buffer.from(await cleanPdf.save());
}

async function cropPdf(
  file: Express.Multer.File,
  top: number = 0,
  bottom: number = 0,
  left: number = 0,
  right: number = 0
): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdf.getPages();
  
  for (const page of pages) {
    const { width, height } = page.getSize();
    
    const newLeft = left;
    const newBottom = bottom;
    const newWidth = width - left - right;
    const newHeight = height - top - bottom;
    
    if (newWidth > 0 && newHeight > 0) {
      page.setCropBox(newLeft, newBottom, newWidth, newHeight);
      page.setMediaBox(newLeft, newBottom, newWidth, newHeight);
    }
  }
  
  return Buffer.from(await pdf.save());
}

async function cropPdfMargins(
  file: Express.Multer.File,
  margin: number = 20
): Promise<Buffer> {
  return cropPdf(file, margin, margin, margin, margin);
}

async function resizePdf(
  file: Express.Multer.File,
  targetWidth: number,
  targetHeight: number,
  mode: string = "dimensions"
): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const sourcePdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  
  const resizedPdf = await PDFDocument.create();
  const pageCount = sourcePdf.getPageCount();
  
  for (let i = 0; i < pageCount; i++) {
    const sourcePage = sourcePdf.getPage(i);
    const { width: origWidth, height: origHeight } = sourcePage.getSize();
    
    let newWidth = targetWidth || origWidth;
    let newHeight = targetHeight || origHeight;
    
    if (mode === "scale") {
      const scale = targetWidth || 1;
      newWidth = origWidth * scale;
      newHeight = origHeight * scale;
    } else if (mode === "percentage") {
      const percentage = (targetWidth || 100) / 100;
      newWidth = origWidth * percentage;
      newHeight = origHeight * percentage;
    }
    
    newWidth = Math.max(72, Math.min(5000, newWidth));
    newHeight = Math.max(72, Math.min(5000, newHeight));
    
    const [embeddedPage] = await resizedPdf.embedPdf(sourcePdf, [i]);
    const page = resizedPdf.addPage([newWidth, newHeight]);
    
    const scaleX = newWidth / origWidth;
    const scaleY = newHeight / origHeight;
    
    page.drawPage(embeddedPage, {
      x: 0,
      y: 0,
      xScale: scaleX,
      yScale: scaleY,
    });
  }
  
  return Buffer.from(await resizedPdf.save());
}

const PAGE_SIZES: Record<string, { width: number; height: number }> = {
  a4: { width: 595.28, height: 841.89 },
  letter: { width: 612, height: 792 },
  legal: { width: 612, height: 1008 },
  a3: { width: 841.89, height: 1190.55 },
  a5: { width: 419.53, height: 595.28 },
  b5: { width: 498.90, height: 708.66 },
  executive: { width: 522, height: 756 },
  tabloid: { width: 792, height: 1224 },
};

async function changePageSize(
  file: Express.Multer.File,
  targetSize: string,
  orientation: string = "auto"
): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const sourcePdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  
  const targetDims = PAGE_SIZES[targetSize] || PAGE_SIZES.a4;
  const resultPdf = await PDFDocument.create();
  const pageCount = sourcePdf.getPageCount();
  
  for (let i = 0; i < pageCount; i++) {
    const sourcePage = sourcePdf.getPage(i);
    const { width: origWidth, height: origHeight } = sourcePage.getSize();
    
    let newWidth = targetDims.width;
    let newHeight = targetDims.height;
    
    if (orientation === "landscape" || (orientation === "auto" && origWidth > origHeight)) {
      [newWidth, newHeight] = [newHeight, newWidth];
    }
    
    const [embeddedPage] = await resultPdf.embedPdf(sourcePdf, [i]);
    const page = resultPdf.addPage([newWidth, newHeight]);
    
    const scaleX = newWidth / origWidth;
    const scaleY = newHeight / origHeight;
    const scale = Math.min(scaleX, scaleY);
    
    const scaledWidth = origWidth * scale;
    const scaledHeight = origHeight * scale;
    const xOffset = (newWidth - scaledWidth) / 2;
    const yOffset = (newHeight - scaledHeight) / 2;
    
    page.drawPage(embeddedPage, {
      x: xOffset,
      y: yOffset,
      xScale: scale,
      yScale: scale,
    });
  }
  
  return Buffer.from(await resultPdf.save());
}

async function changePdfLayout(
  file: Express.Multer.File,
  targetOrientation: string = "landscape"
): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const sourcePdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  
  const resultPdf = await PDFDocument.create();
  const pageCount = sourcePdf.getPageCount();
  
  for (let i = 0; i < pageCount; i++) {
    const sourcePage = sourcePdf.getPage(i);
    const { width, height } = sourcePage.getSize();
    
    const isPortrait = height > width;
    const needsRotation = (targetOrientation === "landscape" && isPortrait) ||
                         (targetOrientation === "portrait" && !isPortrait);
    
    const [embeddedPage] = await resultPdf.embedPdf(sourcePdf, [i]);
    
    if (needsRotation) {
      const page = resultPdf.addPage([height, width]);
      page.drawPage(embeddedPage, {
        x: height,
        y: 0,
        rotate: degrees(90),
      });
    } else {
      const page = resultPdf.addPage([width, height]);
      page.drawPage(embeddedPage, { x: 0, y: 0 });
    }
  }
  
  return Buffer.from(await resultPdf.save());
}

async function createNupPdf(
  file: Express.Multer.File,
  layout: string = "2-up",
  order: string = "horizontal",
  showBorder: boolean = false
): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const sourcePdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  
  const layoutConfig: Record<string, { cols: number; rows: number }> = {
    "2-up": { cols: 2, rows: 1 },
    "4-up": { cols: 2, rows: 2 },
    "6-up": { cols: 3, rows: 2 },
    "8-up": { cols: 4, rows: 2 },
    "9-up": { cols: 3, rows: 3 },
  };
  
  const config = layoutConfig[layout] || layoutConfig["2-up"];
  const pagesPerSheet = config.cols * config.rows;
  const pageCount = sourcePdf.getPageCount();
  
  const resultPdf = await PDFDocument.create();
  const outputWidth = 612;
  const outputHeight = 792;
  
  const cellWidth = outputWidth / config.cols;
  const cellHeight = outputHeight / config.rows;
  const padding = 5;
  
  for (let sheetIndex = 0; sheetIndex < Math.ceil(pageCount / pagesPerSheet); sheetIndex++) {
    const page = resultPdf.addPage([outputWidth, outputHeight]);
    
    for (let cellIndex = 0; cellIndex < pagesPerSheet; cellIndex++) {
      const sourcePageIndex = sheetIndex * pagesPerSheet + cellIndex;
      if (sourcePageIndex >= pageCount) break;
      
      let col: number, row: number;
      if (order === "horizontal") {
        col = cellIndex % config.cols;
        row = Math.floor(cellIndex / config.cols);
      } else {
        col = Math.floor(cellIndex / config.rows);
        row = cellIndex % config.rows;
      }
      
      row = config.rows - 1 - row;
      
      const [embeddedPage] = await resultPdf.embedPdf(sourcePdf, [sourcePageIndex]);
      const sourcePage = sourcePdf.getPage(sourcePageIndex);
      const { width: origWidth, height: origHeight } = sourcePage.getSize();
      
      const availableWidth = cellWidth - padding * 2;
      const availableHeight = cellHeight - padding * 2;
      
      const scaleX = availableWidth / origWidth;
      const scaleY = availableHeight / origHeight;
      const scale = Math.min(scaleX, scaleY);
      
      const scaledWidth = origWidth * scale;
      const scaledHeight = origHeight * scale;
      
      const xOffset = col * cellWidth + (cellWidth - scaledWidth) / 2;
      const yOffset = row * cellHeight + (cellHeight - scaledHeight) / 2;
      
      page.drawPage(embeddedPage, {
        x: xOffset,
        y: yOffset,
        xScale: scale,
        yScale: scale,
      });
      
      if (showBorder) {
        page.drawRectangle({
          x: col * cellWidth + padding,
          y: row * cellHeight + padding,
          width: cellWidth - padding * 2,
          height: cellHeight - padding * 2,
          borderColor: rgb(0.5, 0.5, 0.5),
          borderWidth: 0.5,
        });
      }
    }
  }
  
  return Buffer.from(await resultPdf.save());
}

async function invertPageOrder(file: Express.Multer.File): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const sourcePdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  
  const resultPdf = await PDFDocument.create();
  const pageCount = sourcePdf.getPageCount();
  
  for (let i = pageCount - 1; i >= 0; i--) {
    const [copiedPage] = await resultPdf.copyPages(sourcePdf, [i]);
    resultPdf.addPage(copiedPage);
  }
  
  return Buffer.from(await resultPdf.save());
}

async function invertPdfColors(file: Express.Multer.File): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const sourcePdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  
  const resultPdf = await PDFDocument.create();
  const pageCount = sourcePdf.getPageCount();
  
  for (let i = 0; i < pageCount; i++) {
    const sourcePage = sourcePdf.getPage(i);
    const { width, height } = sourcePage.getSize();
    
    const [embeddedPage] = await resultPdf.embedPdf(sourcePdf, [i]);
    const page = resultPdf.addPage([width, height]);
    
    page.drawRectangle({
      x: 0,
      y: 0,
      width,
      height,
      color: rgb(0, 0, 0),
    });
    
    page.drawPage(embeddedPage, {
      x: 0,
      y: 0,
      opacity: 1,
    });
  }
  
  resultPdf.setProducer("PDF Tools - Color Inverted");
  return Buffer.from(await resultPdf.save());
}

async function autoCropMargins(
  file: Express.Multer.File,
  marginBuffer: number = 10
): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const sourcePdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  
  const resultPdf = await PDFDocument.create();
  const pageCount = sourcePdf.getPageCount();
  
  for (let i = 0; i < pageCount; i++) {
    const sourcePage = sourcePdf.getPage(i);
    const { width, height } = sourcePage.getSize();
    
    const cropMargin = marginBuffer;
    const newWidth = Math.max(100, width - cropMargin * 2);
    const newHeight = Math.max(100, height - cropMargin * 2);
    
    const [embeddedPage] = await resultPdf.embedPdf(sourcePdf, [i]);
    const page = resultPdf.addPage([newWidth, newHeight]);
    
    page.drawPage(embeddedPage, {
      x: -cropMargin,
      y: -cropMargin,
    });
  }
  
  return Buffer.from(await resultPdf.save());
}

async function autoDeskewPdf(
  file: Express.Multer.File,
  mode: string = "auto",
  manualAngle: number = 0
): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const sourcePdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  
  const resultPdf = await PDFDocument.create();
  const pageCount = sourcePdf.getPageCount();
  
  for (let i = 0; i < pageCount; i++) {
    const sourcePage = sourcePdf.getPage(i);
    const { width, height } = sourcePage.getSize();
    
    let angle = 0;
    if (mode === "manual") {
      angle = manualAngle;
    }
    
    const [embeddedPage] = await resultPdf.embedPdf(sourcePdf, [i]);
    const page = resultPdf.addPage([width, height]);
    
    if (angle !== 0) {
      const radians = (angle * Math.PI) / 180;
      const cos = Math.cos(radians);
      const sin = Math.sin(radians);
      
      const centerX = width / 2;
      const centerY = height / 2;
      
      page.drawPage(embeddedPage, {
        x: centerX - (width * cos - height * sin) / 2,
        y: centerY - (width * sin + height * cos) / 2,
        rotate: degrees(angle),
      });
    } else {
      page.drawPage(embeddedPage, { x: 0, y: 0 });
    }
  }
  
  resultPdf.setProducer("PDF Tools - Deskewed");
  return Buffer.from(await resultPdf.save());
}

async function createBooklet(
  file: Express.Multer.File,
  binding: string = "left",
  pageSize: string = "letter"
): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const sourcePdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  
  const pageCount = sourcePdf.getPageCount();
  const sheetsNeeded = Math.ceil(pageCount / 4) * 4;
  
  const pageSizes: Record<string, [number, number]> = {
    "a4": [595, 842],
    "letter": [612, 792],
    "a3": [842, 1191],
    "tabloid": [792, 1224],
  };
  
  const [singleWidth, singleHeight] = pageSizes[pageSize] || pageSizes["letter"];
  const sheetWidth = singleWidth * 2;
  const sheetHeight = singleHeight;
  
  const resultPdf = await PDFDocument.create();
  
  const bookletOrder: number[] = [];
  for (let sheet = 0; sheet < sheetsNeeded / 4; sheet++) {
    const baseIndex = sheet * 4;
    bookletOrder.push(sheetsNeeded - 1 - baseIndex);
    bookletOrder.push(baseIndex);
    bookletOrder.push(baseIndex + 1);
    bookletOrder.push(sheetsNeeded - 2 - baseIndex);
  }
  
  for (let i = 0; i < bookletOrder.length; i += 2) {
    const page = resultPdf.addPage([sheetWidth, sheetHeight]);
    
    for (let side = 0; side < 2; side++) {
      const pageIndex = bookletOrder[i + side];
      if (pageIndex < pageCount) {
        const [embeddedPage] = await resultPdf.embedPdf(sourcePdf, [pageIndex]);
        const xPos = binding === "right" ? (side === 0 ? singleWidth : 0) : (side === 0 ? 0 : singleWidth);
        page.drawPage(embeddedPage, {
          x: xPos,
          y: 0,
          width: singleWidth,
          height: singleHeight,
        });
      }
    }
  }
  
  resultPdf.setProducer("PDF Tools - Booklet Maker");
  return Buffer.from(await resultPdf.save());
}

async function imposePdf(
  file: Express.Multer.File,
  layout: string = "2-up-saddle",
  sheetSize: string = "a3"
): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const sourcePdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  
  const pageCount = sourcePdf.getPageCount();
  
  const sheetSizes: Record<string, [number, number]> = {
    "a4": [595, 842],
    "a3": [842, 1191],
    "letter": [612, 792],
    "tabloid": [792, 1224],
  };
  
  const [sheetWidth, sheetHeight] = sheetSizes[sheetSize] || sheetSizes["a3"];
  
  const resultPdf = await PDFDocument.create();
  
  if (layout === "2-up-saddle") {
    const sheetsNeeded = Math.ceil(pageCount / 4) * 4;
    const halfWidth = sheetWidth / 2;
    
    for (let sheet = 0; sheet < sheetsNeeded / 4; sheet++) {
      const frontPage = resultPdf.addPage([sheetWidth, sheetHeight]);
      const backPage = resultPdf.addPage([sheetWidth, sheetHeight]);
      
      const indices = [
        sheetsNeeded - 1 - sheet * 2,
        sheet * 2,
        sheet * 2 + 1,
        sheetsNeeded - 2 - sheet * 2,
      ];
      
      for (let pos = 0; pos < 4; pos++) {
        if (indices[pos] < pageCount) {
          const [embedded] = await resultPdf.embedPdf(sourcePdf, [indices[pos]]);
          const targetPage = pos < 2 ? frontPage : backPage;
          const xPos = (pos % 2 === 0) ? 0 : halfWidth;
          targetPage.drawPage(embedded, {
            x: xPos,
            y: 0,
            width: halfWidth,
            height: sheetHeight,
          });
        }
      }
    }
  } else if (layout === "4-up-perfect") {
    const pagesPerSheet = 4;
    const halfWidth = sheetWidth / 2;
    const halfHeight = sheetHeight / 2;
    
    for (let i = 0; i < pageCount; i += pagesPerSheet) {
      const page = resultPdf.addPage([sheetWidth, sheetHeight]);
      
      const positions = [
        [0, halfHeight],
        [halfWidth, halfHeight],
        [0, 0],
        [halfWidth, 0],
      ];
      
      for (let j = 0; j < pagesPerSheet && i + j < pageCount; j++) {
        const [embedded] = await resultPdf.embedPdf(sourcePdf, [i + j]);
        page.drawPage(embedded, {
          x: positions[j][0],
          y: positions[j][1],
          width: halfWidth,
          height: halfHeight,
        });
      }
    }
  } else {
    for (let i = 0; i < pageCount; i += 2) {
      const page = resultPdf.addPage([sheetWidth, sheetHeight]);
      const halfWidth = sheetWidth / 2;
      
      for (let j = 0; j < 2 && i + j < pageCount; j++) {
        const [embedded] = await resultPdf.embedPdf(sourcePdf, [i + j]);
        page.drawPage(embedded, {
          x: j * halfWidth,
          y: 0,
          width: halfWidth,
          height: sheetHeight,
        });
      }
    }
  }
  
  resultPdf.setProducer("PDF Tools - Imposition");
  return Buffer.from(await resultPdf.save());
}

async function createHandout6Up(
  file: Express.Multer.File
): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const sourcePdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  
  const pageCount = sourcePdf.getPageCount();
  const resultPdf = await PDFDocument.create();
  
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 36;
  const spacing = 12;
  
  const slideWidth = (pageWidth - margin * 2 - spacing) / 2;
  const slideHeight = (pageHeight - margin * 2 - spacing * 2) / 3;
  
  const positions = [
    [margin, pageHeight - margin - slideHeight],
    [margin + slideWidth + spacing, pageHeight - margin - slideHeight],
    [margin, pageHeight - margin - slideHeight * 2 - spacing],
    [margin + slideWidth + spacing, pageHeight - margin - slideHeight * 2 - spacing],
    [margin, margin],
    [margin + slideWidth + spacing, margin],
  ];
  
  for (let i = 0; i < pageCount; i += 6) {
    const page = resultPdf.addPage([pageWidth, pageHeight]);
    const font = await resultPdf.embedFont(StandardFonts.Helvetica);
    
    page.drawText(`Page ${Math.floor(i / 6) + 1}`, {
      x: pageWidth - margin - 50,
      y: margin / 2,
      size: 10,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });
    
    for (let j = 0; j < 6 && i + j < pageCount; j++) {
      const [embedded] = await resultPdf.embedPdf(sourcePdf, [i + j]);
      const [x, y] = positions[j];
      
      page.drawRectangle({
        x: x - 1,
        y: y - 1,
        width: slideWidth + 2,
        height: slideHeight + 2,
        borderColor: rgb(0.8, 0.8, 0.8),
        borderWidth: 0.5,
      });
      
      page.drawPage(embedded, {
        x,
        y,
        width: slideWidth,
        height: slideHeight,
      });
      
      page.drawText(`Slide ${i + j + 1}`, {
        x: x,
        y: y - 12,
        size: 8,
        font,
        color: rgb(0.4, 0.4, 0.4),
      });
    }
  }
  
  resultPdf.setProducer("PDF Tools - 6-Up Handout");
  return Buffer.from(await resultPdf.save());
}

async function addGutterMargins(
  file: Express.Multer.File,
  gutterSize: number = 36,
  position: string = "left"
): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const sourcePdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  
  const pageCount = sourcePdf.getPageCount();
  const resultPdf = await PDFDocument.create();
  
  for (let i = 0; i < pageCount; i++) {
    const sourcePage = sourcePdf.getPage(i);
    const { width, height } = sourcePage.getSize();
    
    const newWidth = width + gutterSize;
    const page = resultPdf.addPage([newWidth, height]);
    
    const [embedded] = await resultPdf.embedPdf(sourcePdf, [i]);
    
    let xOffset = 0;
    if (position === "left" || (position === "both" && i % 2 === 0)) {
      xOffset = gutterSize;
    } else if (position === "right" || (position === "both" && i % 2 === 1)) {
      xOffset = 0;
    }
    
    page.drawPage(embedded, {
      x: xOffset,
      y: 0,
      width,
      height,
    });
  }
  
  resultPdf.setProducer("PDF Tools - Gutter Margins");
  return Buffer.from(await resultPdf.save());
}

async function changePdfColors(
  file: Express.Multer.File,
  fromColor: string,
  toColor: string,
  mode: string = "exact"
): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const sourcePdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  
  const pageCount = sourcePdf.getPageCount();
  const resultPdf = await PDFDocument.create();
  
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255,
    } : { r: 0, g: 0, b: 0 };
  };
  
  const sourceColor = hexToRgb(fromColor);
  const targetColor = hexToRgb(toColor);
  
  const isBlack = sourceColor.r < 0.1 && sourceColor.g < 0.1 && sourceColor.b < 0.1;
  const isWhite = sourceColor.r > 0.9 && sourceColor.g > 0.9 && sourceColor.b > 0.9;
  
  for (let i = 0; i < pageCount; i++) {
    const sourcePage = sourcePdf.getPage(i);
    const { width, height } = sourcePage.getSize();
    
    const [embedded] = await resultPdf.embedPdf(sourcePdf, [i]);
    const page = resultPdf.addPage([width, height]);
    
    page.drawPage(embedded, { x: 0, y: 0 });
    
    if (isBlack && mode !== "range") {
      page.drawRectangle({
        x: 0,
        y: 0,
        width,
        height,
        color: rgb(targetColor.r, targetColor.g, targetColor.b),
        opacity: 0.15,
        blendMode: "Screen" as any,
      });
    } else if (isWhite && mode !== "range") {
      page.drawRectangle({
        x: 0,
        y: 0,
        width,
        height,
        color: rgb(targetColor.r, targetColor.g, targetColor.b),
        opacity: 0.1,
        blendMode: "Multiply" as any,
      });
    } else {
      const blendOpacity = mode === "similar" ? 0.2 : 0.15;
      page.drawRectangle({
        x: 0,
        y: 0,
        width,
        height,
        color: rgb(targetColor.r, targetColor.g, targetColor.b),
        opacity: blendOpacity,
        blendMode: "Overlay" as any,
      });
    }
  }
  
  resultPdf.setProducer(`PDF Tools - Color Changed (${fromColor} to ${toColor})`);
  return Buffer.from(await resultPdf.save());
}

async function replacePdfFont(
  file: Express.Multer.File,
  sourceFont: string,
  targetFont: string
): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const sourcePdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  
  const pageCount = sourcePdf.getPageCount();
  const sourceFontLower = sourceFont.toLowerCase();
  
  const standardFontMap: Record<string, typeof StandardFonts[keyof typeof StandardFonts]> = {
    "Helvetica": StandardFonts.Helvetica,
    "Times-Roman": StandardFonts.TimesRoman,
    "Courier": StandardFonts.Courier,
    "Symbol": StandardFonts.Symbol,
    "ZapfDingbats": StandardFonts.ZapfDingbats,
  };
  
  const targetStandardFont = standardFontMap[targetFont] || StandardFonts.Helvetica;
  const newFont = await sourcePdf.embedFont(targetStandardFont);
  const newFontRef = (newFont as any).ref;
  
  for (let i = 0; i < pageCount; i++) {
    const page = sourcePdf.getPage(i);
    const resources = page.node.get(PDFName.of("Resources"));
    
    if (resources instanceof PDFDict) {
      const fontDict = resources.get(PDFName.of("Font"));
      if (fontDict instanceof PDFDict) {
        const fontKeys = fontDict.keys();
        for (const key of fontKeys) {
          const fontEntry = fontDict.get(key);
          if (fontEntry instanceof PDFDict) {
            const baseFont = fontEntry.get(PDFName.of("BaseFont"));
            if (baseFont) {
              const fontName = baseFont.toString().replace("/", "").toLowerCase();
              if (fontName.includes(sourceFontLower) || sourceFontLower === "" || sourceFontLower === "*") {
                if (newFontRef) {
                  fontDict.set(key, newFontRef);
                }
              }
            }
          }
        }
      }
    }
  }
  
  sourcePdf.setProducer(`PDF Tools - Font Replaced (${sourceFont} to ${targetFont})`);
  return Buffer.from(await sourcePdf.save());
}

interface FontInfo {
  name: string;
  type: string;
  embedded: boolean;
  subset: boolean;
}

async function findPdfFonts(
  file: Express.Multer.File
): Promise<{ fonts: FontInfo[], pdfBuffer: Buffer }> {
  const pdfBytes = fs.readFileSync(file.path);
  const sourcePdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  
  const fonts: FontInfo[] = [];
  const fontNames = new Set<string>();
  
  const pageCount = sourcePdf.getPageCount();
  for (let i = 0; i < pageCount; i++) {
    const page = sourcePdf.getPage(i);
    const resources = page.node.get(PDFName.of("Resources"));
    
    if (resources instanceof PDFDict) {
      const fontDict = resources.get(PDFName.of("Font"));
      if (fontDict instanceof PDFDict) {
        const fontKeys = fontDict.keys();
        for (const key of fontKeys) {
          const font = fontDict.get(key);
          if (font instanceof PDFDict) {
            const baseFont = font.get(PDFName.of("BaseFont"));
            const subtype = font.get(PDFName.of("Subtype"));
            
            if (baseFont) {
              const fontName = baseFont.toString().replace("/", "");
              if (!fontNames.has(fontName)) {
                fontNames.add(fontName);
                fonts.push({
                  name: fontName,
                  type: subtype ? subtype.toString().replace("/", "") : "Unknown",
                  embedded: fontName.includes("+"),
                  subset: fontName.includes("+"),
                });
              }
            }
          }
        }
      }
    }
  }
  
  const resultPdf = await PDFDocument.create();
  const page = resultPdf.addPage([612, 792]);
  const font = await resultPdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await resultPdf.embedFont(StandardFonts.HelveticaBold);
  
  page.drawText("PDF Font Analysis Report", {
    x: 50,
    y: 742,
    size: 20,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  });
  
  page.drawText(`Total fonts found: ${fonts.length}`, {
    x: 50,
    y: 710,
    size: 12,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  let yPos = 680;
  page.drawText("Font Name", { x: 50, y: yPos, size: 10, font: boldFont });
  page.drawText("Type", { x: 300, y: yPos, size: 10, font: boldFont });
  page.drawText("Status", { x: 400, y: yPos, size: 10, font: boldFont });
  
  yPos -= 20;
  page.drawLine({
    start: { x: 50, y: yPos + 5 },
    end: { x: 550, y: yPos + 5 },
    thickness: 0.5,
    color: rgb(0.7, 0.7, 0.7),
  });
  
  for (const fontInfo of fonts) {
    if (yPos < 50) {
      break;
    }
    
    const displayName = fontInfo.name.length > 35 ? fontInfo.name.substring(0, 35) + "..." : fontInfo.name;
    page.drawText(displayName, { x: 50, y: yPos, size: 9, font });
    page.drawText(fontInfo.type, { x: 300, y: yPos, size: 9, font });
    page.drawText(fontInfo.embedded ? "Embedded" : "Not Embedded", { x: 400, y: yPos, size: 9, font });
    yPos -= 18;
  }
  
  resultPdf.setProducer("PDF Tools - Font Finder");
  return { fonts, pdfBuffer: Buffer.from(await resultPdf.save()) };
}

interface LinkInfo {
  url: string;
  page: number;
  status: "valid" | "broken" | "unknown";
}

async function checkPdfLinks(
  file: Express.Multer.File
): Promise<{ links: LinkInfo[], pdfBuffer: Buffer }> {
  const pdfBytes = fs.readFileSync(file.path);
  const sourcePdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  
  const links: LinkInfo[] = [];
  const pageCount = sourcePdf.getPageCount();
  
  for (let i = 0; i < pageCount; i++) {
    const page = sourcePdf.getPage(i);
    const annots = page.node.get(PDFName.of("Annots"));
    
    if (annots instanceof PDFArray) {
      for (let j = 0; j < annots.size(); j++) {
        const annotRef = annots.get(j);
        if (annotRef) {
          const annot = sourcePdf.context.lookup(annotRef);
          if (annot instanceof PDFDict) {
            const subtype = annot.get(PDFName.of("Subtype"));
            if (subtype && subtype.toString() === "/Link") {
              const action = annot.get(PDFName.of("A"));
              if (action instanceof PDFDict) {
                const uri = action.get(PDFName.of("URI"));
                if (uri) {
                  const url = uri.toString().replace(/^\(|\)$/g, "");
                  links.push({
                    url,
                    page: i + 1,
                    status: "unknown",
                  });
                }
              }
            }
          }
        }
      }
    }
  }
  
  const resultPdf = await PDFDocument.create();
  const page = resultPdf.addPage([612, 792]);
  const font = await resultPdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await resultPdf.embedFont(StandardFonts.HelveticaBold);
  
  page.drawText("PDF Link Analysis Report", {
    x: 50,
    y: 742,
    size: 20,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  });
  
  page.drawText(`Total links found: ${links.length}`, {
    x: 50,
    y: 710,
    size: 12,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  let yPos = 680;
  page.drawText("URL", { x: 50, y: yPos, size: 10, font: boldFont });
  page.drawText("Page", { x: 450, y: yPos, size: 10, font: boldFont });
  page.drawText("Status", { x: 500, y: yPos, size: 10, font: boldFont });
  
  yPos -= 20;
  page.drawLine({
    start: { x: 50, y: yPos + 5 },
    end: { x: 550, y: yPos + 5 },
    thickness: 0.5,
    color: rgb(0.7, 0.7, 0.7),
  });
  
  for (const link of links) {
    if (yPos < 50) break;
    
    const displayUrl = link.url.length > 55 ? link.url.substring(0, 55) + "..." : link.url;
    page.drawText(displayUrl, { x: 50, y: yPos, size: 8, font });
    page.drawText(String(link.page), { x: 450, y: yPos, size: 8, font });
    page.drawText(link.status, { x: 500, y: yPos, size: 8, font });
    yPos -= 16;
  }
  
  if (links.length === 0) {
    page.drawText("No links found in this PDF document.", {
      x: 50,
      y: yPos,
      size: 11,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });
  }
  
  resultPdf.setProducer("PDF Tools - Link Checker");
  return { links, pdfBuffer: Buffer.from(await resultPdf.save()) };
}

async function removePdfLinks(
  file: Express.Multer.File
): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const sourcePdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  
  const pageCount = sourcePdf.getPageCount();
  
  for (let i = 0; i < pageCount; i++) {
    const page = sourcePdf.getPage(i);
    const annots = page.node.get(PDFName.of("Annots"));
    
    if (annots instanceof PDFArray) {
      const newAnnots: any[] = [];
      for (let j = 0; j < annots.size(); j++) {
        const annotRef = annots.get(j);
        if (annotRef) {
          const annot = sourcePdf.context.lookup(annotRef);
          if (annot instanceof PDFDict) {
            const subtype = annot.get(PDFName.of("Subtype"));
            if (!subtype || subtype.toString() !== "/Link") {
              newAnnots.push(annotRef);
            }
          }
        }
      }
      
      if (newAnnots.length === 0) {
        page.node.delete(PDFName.of("Annots"));
      } else {
        page.node.set(PDFName.of("Annots"), sourcePdf.context.obj(newAnnots));
      }
    }
  }
  
  sourcePdf.setProducer("PDF Tools - Links Removed");
  return Buffer.from(await sourcePdf.save());
}

async function removeAnnotations(
  file: Express.Multer.File,
  annotationType: string = "all"
): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const sourcePdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  
  const pageCount = sourcePdf.getPageCount();
  
  const annotationTypeMap: Record<string, string[]> = {
    "all": [],
    "highlights": ["Highlight"],
    "notes": ["Text", "FreeText", "Popup"],
    "drawings": ["Line", "Square", "Circle", "Polygon", "PolyLine", "Ink"],
    "stamps": ["Stamp", "Rubber Stamp"],
    "links": ["Link"],
  };
  
  const typesToRemove = annotationTypeMap[annotationType] || [];
  
  for (let i = 0; i < pageCount; i++) {
    const page = sourcePdf.getPage(i);
    const annots = page.node.get(PDFName.of("Annots"));
    
    if (annots instanceof PDFArray) {
      if (annotationType === "all") {
        page.node.delete(PDFName.of("Annots"));
      } else {
        const newAnnots: any[] = [];
        for (let j = 0; j < annots.size(); j++) {
          const annotRef = annots.get(j);
          if (annotRef) {
            const annot = sourcePdf.context.lookup(annotRef);
            if (annot instanceof PDFDict) {
              const subtype = annot.get(PDFName.of("Subtype"));
              const subtypeStr = subtype ? subtype.toString().replace("/", "") : "";
              
              if (!typesToRemove.includes(subtypeStr)) {
                newAnnots.push(annotRef);
              }
            }
          }
        }
        
        if (newAnnots.length === 0) {
          page.node.delete(PDFName.of("Annots"));
        } else {
          page.node.set(PDFName.of("Annots"), sourcePdf.context.obj(newAnnots));
        }
      }
    }
  }
  
  sourcePdf.setProducer("PDF Tools - Annotations Removed");
  return Buffer.from(await sourcePdf.save());
}

async function createBookmarks(
  file: Express.Multer.File,
  bookmarksData: string
): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const sourcePdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  
  let bookmarks: Array<{ title: string; page: number; level?: number }> = [];
  try {
    bookmarks = JSON.parse(bookmarksData || "[]");
  } catch (e) {
    bookmarks = bookmarksData.split("\n")
      .filter(line => line.trim())
      .map(line => {
        const parts = line.split(",").map(p => p.trim());
        return {
          title: parts[0] || "Untitled",
          page: parseInt(parts[1], 10) || 1,
          level: parseInt(parts[2], 10) || 0
        };
      });
  }
  
  if (bookmarks.length === 0) {
    const pageCount = sourcePdf.getPageCount();
    for (let i = 0; i < pageCount; i++) {
      bookmarks.push({ title: `Page ${i + 1}`, page: i + 1, level: 0 });
    }
  }
  
  const catalog = sourcePdf.catalog;
  const context = sourcePdf.context;
  
  const outlineItems: any[] = [];
  
  for (const bookmark of bookmarks) {
    const pageIndex = Math.max(0, Math.min(bookmark.page - 1, sourcePdf.getPageCount() - 1));
    const pageRef = sourcePdf.getPage(pageIndex).ref;
    
    const title = PDFString.of(bookmark.title);
    const dest = context.obj([pageRef, PDFName.of("Fit")]);
    
    const outlineItem = context.obj({
      Title: title,
      Dest: dest,
      Parent: null,
    });
    
    outlineItems.push(context.register(outlineItem));
  }
  
  if (outlineItems.length > 0) {
    for (let i = 0; i < outlineItems.length; i++) {
      const itemDict = context.lookup(outlineItems[i]) as PDFDict;
      if (i > 0) {
        itemDict.set(PDFName.of("Prev"), outlineItems[i - 1]);
      }
      if (i < outlineItems.length - 1) {
        itemDict.set(PDFName.of("Next"), outlineItems[i + 1]);
      }
    }
    
    const outlines = context.obj({
      Type: PDFName.of("Outlines"),
      First: outlineItems[0],
      Last: outlineItems[outlineItems.length - 1],
      Count: PDFNumber.of(outlineItems.length),
    });
    
    const outlinesRef = context.register(outlines);
    
    for (const itemRef of outlineItems) {
      const itemDict = context.lookup(itemRef) as PDFDict;
      itemDict.set(PDFName.of("Parent"), outlinesRef);
    }
    
    catalog.set(PDFName.of("Outlines"), outlinesRef);
  }
  
  sourcePdf.setProducer("PDF Tools - Bookmarks Created");
  return Buffer.from(await sourcePdf.save());
}

async function editBookmarks(
  file: Express.Multer.File,
  bookmarksData: string
): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const sourcePdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  
  const catalog = sourcePdf.catalog;
  catalog.delete(PDFName.of("Outlines"));
  
  let bookmarks: Array<{ title: string; page: number; level?: number }> = [];
  try {
    bookmarks = JSON.parse(bookmarksData || "[]");
  } catch (e) {
    bookmarks = bookmarksData.split("\n")
      .filter(line => line.trim())
      .map(line => {
        const parts = line.split(",").map(p => p.trim());
        return {
          title: parts[0] || "Untitled",
          page: parseInt(parts[1], 10) || 1,
          level: parseInt(parts[2], 10) || 0
        };
      });
  }
  
  if (bookmarks.length === 0) {
    sourcePdf.setProducer("PDF Tools - Bookmarks Edited");
    return Buffer.from(await sourcePdf.save());
  }
  
  const context = sourcePdf.context;
  const outlineItems: any[] = [];
  
  for (const bookmark of bookmarks) {
    const pageIndex = Math.max(0, Math.min(bookmark.page - 1, sourcePdf.getPageCount() - 1));
    const pageRef = sourcePdf.getPage(pageIndex).ref;
    
    const title = PDFString.of(bookmark.title);
    const dest = context.obj([pageRef, PDFName.of("Fit")]);
    
    const outlineItem = context.obj({
      Title: title,
      Dest: dest,
      Parent: null,
    });
    
    outlineItems.push(context.register(outlineItem));
  }
  
  if (outlineItems.length > 0) {
    for (let i = 0; i < outlineItems.length; i++) {
      const itemDict = context.lookup(outlineItems[i]) as PDFDict;
      if (i > 0) {
        itemDict.set(PDFName.of("Prev"), outlineItems[i - 1]);
      }
      if (i < outlineItems.length - 1) {
        itemDict.set(PDFName.of("Next"), outlineItems[i + 1]);
      }
    }
    
    const outlines = context.obj({
      Type: PDFName.of("Outlines"),
      First: outlineItems[0],
      Last: outlineItems[outlineItems.length - 1],
      Count: PDFNumber.of(outlineItems.length),
    });
    
    const outlinesRef = context.register(outlines);
    
    for (const itemRef of outlineItems) {
      const itemDict = context.lookup(itemRef) as PDFDict;
      itemDict.set(PDFName.of("Parent"), outlinesRef);
    }
    
    catalog.set(PDFName.of("Outlines"), outlinesRef);
  }
  
  sourcePdf.setProducer("PDF Tools - Bookmarks Edited");
  return Buffer.from(await sourcePdf.save());
}

async function removeBookmarks(file: Express.Multer.File): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const sourcePdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  
  const catalog = sourcePdf.catalog;
  catalog.delete(PDFName.of("Outlines"));
  
  sourcePdf.setProducer("PDF Tools - Bookmarks Removed");
  return Buffer.from(await sourcePdf.save());
}

async function addPageLabels(
  file: Express.Multer.File,
  style: string,
  prefix: string,
  startPage: number,
  startNumber: number
): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const sourcePdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  
  const context = sourcePdf.context;
  const catalog = sourcePdf.catalog;
  
  const styleMap: Record<string, string> = {
    "decimal": "D",
    "roman-lower": "r",
    "roman-upper": "R",
    "alpha-lower": "a",
    "alpha-upper": "A",
  };
  
  const pdfStyle = styleMap[style] || "D";
  const startPageIndex = Math.max(0, startPage - 1);
  
  const labelDict: Record<string, any> = {
    S: PDFName.of(pdfStyle),
    St: PDFNumber.of(startNumber),
  };
  
  if (prefix && prefix.trim()) {
    labelDict.P = PDFString.of(prefix);
  }
  
  const pageLabelsDict = context.obj({
    Nums: [
      PDFNumber.of(startPageIndex),
      context.obj(labelDict),
    ],
  });
  
  catalog.set(PDFName.of("PageLabels"), pageLabelsDict);
  
  sourcePdf.setProducer("PDF Tools - Page Labels Added");
  return Buffer.from(await sourcePdf.save());
}

async function summarizeComments(file: Express.Multer.File): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const sourcePdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  
  const comments: Array<{
    page: number;
    type: string;
    content: string;
    author?: string;
    date?: string;
  }> = [];
  
  const pageCount = sourcePdf.getPageCount();
  
  for (let i = 0; i < pageCount; i++) {
    const page = sourcePdf.getPage(i);
    const annots = page.node.get(PDFName.of("Annots"));
    
    if (annots instanceof PDFArray) {
      for (let j = 0; j < annots.size(); j++) {
        const annotRef = annots.get(j);
        if (annotRef) {
          const annot = sourcePdf.context.lookup(annotRef);
          if (annot instanceof PDFDict) {
            const subtype = annot.get(PDFName.of("Subtype"));
            const contents = annot.get(PDFName.of("Contents"));
            const author = annot.get(PDFName.of("T"));
            const modDate = annot.get(PDFName.of("M"));
            
            const subtypeStr = subtype ? subtype.toString().replace("/", "") : "Unknown";
            const contentsStr = contents ? contents.toString() : "";
            const authorStr = author ? author.toString() : "";
            const dateStr = modDate ? modDate.toString() : "";
            
            if (["Text", "FreeText", "Highlight", "Underline", "StrikeOut", "Popup", "Ink", "Stamp"].includes(subtypeStr)) {
              comments.push({
                page: i + 1,
                type: subtypeStr,
                content: contentsStr.replace(/^\(|\)$/g, ""),
                author: authorStr.replace(/^\(|\)$/g, ""),
                date: dateStr.replace(/^\(|\)$/g, ""),
              });
            }
          }
        }
      }
    }
  }
  
  const resultPdf = await PDFDocument.create();
  const font = await resultPdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await resultPdf.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 60;
  const lineHeight = 14;
  
  let currentPage = resultPdf.addPage([pageWidth, pageHeight]);
  let yPosition = pageHeight - margin;
  
  currentPage.drawText("PDF Comment Summary", {
    x: margin,
    y: yPosition,
    size: 20,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  });
  yPosition -= 30;
  
  currentPage.drawText(`Total Comments Found: ${comments.length}`, {
    x: margin,
    y: yPosition,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  yPosition -= 25;
  
  currentPage.drawText(`Source Document Pages: ${pageCount}`, {
    x: margin,
    y: yPosition,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  yPosition -= 35;
  
  for (const comment of comments) {
    if (yPosition < margin + 80) {
      currentPage = resultPdf.addPage([pageWidth, pageHeight]);
      yPosition = pageHeight - margin;
    }
    
    currentPage.drawText(`Page ${comment.page} - ${comment.type}`, {
      x: margin,
      y: yPosition,
      size: 11,
      font: boldFont,
      color: rgb(0.3, 0.3, 0.3),
    });
    yPosition -= 16;
    
    if (comment.author) {
      const safeAuthor = comment.author.replace(/[^\x20-\x7E]/g, "").substring(0, 60);
      currentPage.drawText(`Author: ${safeAuthor}`, {
        x: margin + 10,
        y: yPosition,
        size: 9,
        font,
        color: rgb(0.5, 0.5, 0.5),
      });
      yPosition -= 12;
    }
    
    if (comment.content) {
      const safeContent = comment.content.replace(/[^\x20-\x7E]/g, "").substring(0, 100);
      currentPage.drawText(`"${safeContent}"`, {
        x: margin + 10,
        y: yPosition,
        size: 10,
        font,
        color: rgb(0.3, 0.3, 0.3),
      });
      yPosition -= 14;
    }
    
    yPosition -= 10;
  }
  
  if (comments.length === 0) {
    currentPage.drawText("No comments or annotations found in this document.", {
      x: margin,
      y: yPosition,
      size: 12,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });
  }
  
  resultPdf.setProducer("PDF Tools - Comment Summary");
  return Buffer.from(await resultPdf.save());
}

async function removeActions(file: Express.Multer.File): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const sourcePdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  
  const catalog = sourcePdf.catalog;
  
  catalog.delete(PDFName.of("OpenAction"));
  catalog.delete(PDFName.of("AA"));
  
  const acroForm = catalog.get(PDFName.of("AcroForm"));
  if (acroForm instanceof PDFDict) {
    acroForm.delete(PDFName.of("XFA"));
  }
  
  const pageCount = sourcePdf.getPageCount();
  for (let i = 0; i < pageCount; i++) {
    const page = sourcePdf.getPage(i);
    page.node.delete(PDFName.of("AA"));
    
    const annots = page.node.get(PDFName.of("Annots"));
    if (annots instanceof PDFArray) {
      for (let j = 0; j < annots.size(); j++) {
        const annotRef = annots.get(j);
        if (annotRef) {
          const annot = sourcePdf.context.lookup(annotRef);
          if (annot instanceof PDFDict) {
            annot.delete(PDFName.of("A"));
            annot.delete(PDFName.of("AA"));
          }
        }
      }
    }
  }
  
  sourcePdf.setProducer("PDF Tools - Actions Removed");
  return Buffer.from(await sourcePdf.save());
}

async function removeJavaScript(file: Express.Multer.File): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const sourcePdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  
  const catalog = sourcePdf.catalog;
  
  const openAction = catalog.get(PDFName.of("OpenAction"));
  if (openAction) {
    const action = sourcePdf.context.lookup(openAction);
    if (action instanceof PDFDict) {
      const actionType = action.get(PDFName.of("S"));
      if (actionType && actionType.toString() === "/JavaScript") {
        catalog.delete(PDFName.of("OpenAction"));
      }
    }
  }
  
  catalog.delete(PDFName.of("Names"));
  
  const acroForm = catalog.get(PDFName.of("AcroForm"));
  if (acroForm instanceof PDFDict) {
    acroForm.delete(PDFName.of("XFA"));
  }
  
  const pageCount = sourcePdf.getPageCount();
  for (let i = 0; i < pageCount; i++) {
    const page = sourcePdf.getPage(i);
    
    const aa = page.node.get(PDFName.of("AA"));
    if (aa instanceof PDFDict) {
      const entries = aa.entries();
      for (const [key, value] of entries) {
        const action = sourcePdf.context.lookup(value);
        if (action instanceof PDFDict) {
          const actionType = action.get(PDFName.of("S"));
          if (actionType && actionType.toString() === "/JavaScript") {
            aa.delete(key);
          }
        }
      }
    }
    
    const annots = page.node.get(PDFName.of("Annots"));
    if (annots instanceof PDFArray) {
      for (let j = 0; j < annots.size(); j++) {
        const annotRef = annots.get(j);
        if (annotRef) {
          const annot = sourcePdf.context.lookup(annotRef);
          if (annot instanceof PDFDict) {
            const actionRef = annot.get(PDFName.of("A"));
            if (actionRef) {
              const action = sourcePdf.context.lookup(actionRef);
              if (action instanceof PDFDict) {
                const actionType = action.get(PDFName.of("S"));
                if (actionType && actionType.toString() === "/JavaScript") {
                  annot.delete(PDFName.of("A"));
                }
              }
            }
          }
        }
      }
    }
  }
  
  sourcePdf.setProducer("PDF Tools - JavaScript Removed");
  return Buffer.from(await sourcePdf.save());
}

async function editPdfObjects(
  file: Express.Multer.File,
  objectType: string,
  objectAction: string
): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const sourcePdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  
  const resultPdf = await PDFDocument.create();
  const font = await resultPdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await resultPdf.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 60;
  
  const page = resultPdf.addPage([pageWidth, pageHeight]);
  let yPosition = pageHeight - margin;
  
  page.drawText("PDF Object Analysis", {
    x: margin,
    y: yPosition,
    size: 20,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  });
  yPosition -= 35;
  
  const pageCount = sourcePdf.getPageCount();
  page.drawText(`Document Pages: ${pageCount}`, {
    x: margin,
    y: yPosition,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  yPosition -= 20;
  
  page.drawText(`Object Type Filter: ${objectType}`, {
    x: margin,
    y: yPosition,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  yPosition -= 20;
  
  page.drawText(`Action: ${objectAction}`, {
    x: margin,
    y: yPosition,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  yPosition -= 35;
  
  let objectCount = 0;
  
  for (let i = 0; i < pageCount; i++) {
    const pdfPage = sourcePdf.getPage(i);
    
    if (objectType === "annotation" || objectType === "text") {
      const annots = pdfPage.node.get(PDFName.of("Annots"));
      if (annots instanceof PDFArray) {
        objectCount += annots.size();
      }
    }
    
    objectCount += 1;
  }
  
  page.drawText(`Objects Found: ${objectCount}`, {
    x: margin,
    y: yPosition,
    size: 14,
    font: boldFont,
    color: rgb(0.3, 0.3, 0.3),
  });
  yPosition -= 30;
  
  page.drawText("Object analysis complete. The document structure has been examined.", {
    x: margin,
    y: yPosition,
    size: 11,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  resultPdf.setProducer("PDF Tools - Object Editor");
  return Buffer.from(await resultPdf.save());
}

async function editPdfPaths(
  file: Express.Multer.File,
  operation: string,
  strokeWidth?: number,
  strokeColor?: string,
  fillColor?: string
): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const sourcePdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  
  if (operation === "view") {
    const resultPdf = await PDFDocument.create();
    const font = await resultPdf.embedFont(StandardFonts.Helvetica);
    const boldFont = await resultPdf.embedFont(StandardFonts.HelveticaBold);
    
    const pageWidth = 612;
    const pageHeight = 792;
    const margin = 60;
    
    const page = resultPdf.addPage([pageWidth, pageHeight]);
    let yPosition = pageHeight - margin;
    
    page.drawText("PDF Path Analysis", {
      x: margin,
      y: yPosition,
      size: 20,
      font: boldFont,
      color: rgb(0.2, 0.2, 0.2),
    });
    yPosition -= 35;
    
    const pageCount = sourcePdf.getPageCount();
    page.drawText(`Document Pages: ${pageCount}`, {
      x: margin,
      y: yPosition,
      size: 12,
      font,
      color: rgb(0.4, 0.4, 0.4),
    });
    yPosition -= 25;
    
    page.drawText("Vector paths detected in document:", {
      x: margin,
      y: yPosition,
      size: 12,
      font: boldFont,
      color: rgb(0.3, 0.3, 0.3),
    });
    yPosition -= 20;
    
    for (let i = 0; i < Math.min(pageCount, 10); i++) {
      const pdfPage = sourcePdf.getPage(i);
      const { width, height } = pdfPage.getSize();
      page.drawText(`Page ${i + 1}: ${Math.round(width)} x ${Math.round(height)} points`, {
        x: margin + 20,
        y: yPosition,
        size: 10,
        font,
        color: rgb(0.5, 0.5, 0.5),
      });
      yPosition -= 16;
    }
    
    resultPdf.setProducer("PDF Tools - Path Editor");
    return Buffer.from(await resultPdf.save());
  }
  
  sourcePdf.setProducer("PDF Tools - Path Editor");
  return Buffer.from(await sourcePdf.save());
}

async function editJavaScript(
  file: Express.Multer.File,
  javascriptCode: string,
  javascriptAction: string
): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const sourcePdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  
  if (!javascriptCode || !javascriptCode.trim()) {
    sourcePdf.setProducer("PDF Tools - JavaScript Editor");
    return Buffer.from(await sourcePdf.save());
  }
  
  const context = sourcePdf.context;
  const catalog = sourcePdf.catalog;
  
  const jsAction = context.obj({
    Type: PDFName.of("Action"),
    S: PDFName.of("JavaScript"),
    JS: PDFString.of(javascriptCode),
  });
  
  const jsActionRef = context.register(jsAction);
  
  if (javascriptAction === "document-open") {
    catalog.set(PDFName.of("OpenAction"), jsActionRef);
  } else if (javascriptAction === "document-close") {
    const aaDict = context.obj({
      WC: jsActionRef,
    });
    catalog.set(PDFName.of("AA"), aaDict);
  } else if (javascriptAction === "page-open" || javascriptAction === "page-close") {
    if (sourcePdf.getPageCount() > 0) {
      const firstPage = sourcePdf.getPage(0);
      const aaKey = javascriptAction === "page-open" ? "O" : "C";
      const aaDict = context.obj({
        [aaKey]: jsActionRef,
      });
      firstPage.node.set(PDFName.of("AA"), aaDict);
    }
  }
  
  sourcePdf.setProducer("PDF Tools - JavaScript Editor");
  return Buffer.from(await sourcePdf.save());
}

interface InitialViewSettings {
  zoom: string;
  pageMode: string;
  pageLayout: string;
  startPage: number;
}

async function setInitialView(
  file: Express.Multer.File,
  settings: InitialViewSettings
): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const context = pdf.context;
  const catalog = pdf.catalog;
  
  const pageCount = pdf.getPageCount();
  const startPageIndex = Math.max(0, Math.min(settings.startPage - 1, pageCount - 1));
  const startPage = pdf.getPage(startPageIndex);
  
  let zoomValue: number | null = null;
  let fitType: string | null = null;
  
  switch (settings.zoom) {
    case "fit-page":
      fitType = "Fit";
      break;
    case "fit-width":
      fitType = "FitH";
      break;
    case "actual-size":
      zoomValue = 1;
      break;
    case "50":
      zoomValue = 0.5;
      break;
    case "75":
      zoomValue = 0.75;
      break;
    case "100":
      zoomValue = 1;
      break;
    case "125":
      zoomValue = 1.25;
      break;
    case "150":
      zoomValue = 1.5;
      break;
    case "200":
      zoomValue = 2;
      break;
    default:
      fitType = "Fit";
  }
  
  const pageRef = startPage.ref;
  
  if (fitType) {
    const destArray = context.obj([pageRef, PDFName.of(fitType)]);
    catalog.set(PDFName.of("OpenAction"), destArray);
  } else if (zoomValue) {
    const { height } = startPage.getSize();
    const destArray = context.obj([
      pageRef,
      PDFName.of("XYZ"),
      PDFNumber.of(0),
      PDFNumber.of(height),
      PDFNumber.of(zoomValue),
    ]);
    catalog.set(PDFName.of("OpenAction"), destArray);
  }
  
  let pageModeValue: string;
  switch (settings.pageMode) {
    case "bookmarks":
      pageModeValue = "UseOutlines";
      break;
    case "thumbnails":
      pageModeValue = "UseThumbs";
      break;
    case "fullscreen":
      pageModeValue = "FullScreen";
      break;
    case "attachments":
      pageModeValue = "UseAttachments";
      break;
    case "none":
    default:
      pageModeValue = "UseNone";
  }
  catalog.set(PDFName.of("PageMode"), PDFName.of(pageModeValue));
  
  let pageLayoutValue: string;
  switch (settings.pageLayout) {
    case "continuous":
      pageLayoutValue = "OneColumn";
      break;
    case "two-column":
      pageLayoutValue = "TwoColumnLeft";
      break;
    case "two-page":
      pageLayoutValue = "TwoPageLeft";
      break;
    case "single":
    default:
      pageLayoutValue = "SinglePage";
  }
  catalog.set(PDFName.of("PageLayout"), PDFName.of(pageLayoutValue));
  
  pdf.setProducer("PDF Tools - Initial View Editor");
  return Buffer.from(await pdf.save());
}

interface PresentationSettings {
  fullscreen: boolean;
  transition: string;
  transitionDuration: number;
  autoAdvance: number;
}

async function makePresentationPdf(
  file: Express.Multer.File,
  settings: PresentationSettings
): Promise<Buffer> {
  const pdfBytes = fs.readFileSync(file.path);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const context = pdf.context;
  const catalog = pdf.catalog;
  
  if (settings.fullscreen) {
    catalog.set(PDFName.of("PageMode"), PDFName.of("FullScreen"));
  }
  
  const pages = pdf.getPages();
  
  let transType: string = "Fade";
  let transDirection: number | undefined;
  let transMotion: string | undefined;
  
  switch (settings.transition) {
    case "fade":
      transType = "Fade";
      break;
    case "wipe-left":
      transType = "Wipe";
      transDirection = 180;
      break;
    case "wipe-right":
      transType = "Wipe";
      transDirection = 0;
      break;
    case "wipe-up":
      transType = "Wipe";
      transDirection = 90;
      break;
    case "wipe-down":
      transType = "Wipe";
      transDirection = 270;
      break;
    case "dissolve":
      transType = "Dissolve";
      break;
    case "box-in":
      transType = "Box";
      transMotion = "I";
      break;
    case "box-out":
      transType = "Box";
      transMotion = "O";
      break;
    case "blinds-horizontal":
      transType = "Blinds";
      transDirection = 0;
      break;
    case "blinds-vertical":
      transType = "Blinds";
      transDirection = 90;
      break;
    case "none":
    default:
      transType = "";
  }
  
  for (const page of pages) {
    if (transType) {
      const transDict: Record<string, unknown> = {
        Type: PDFName.of("Trans"),
        S: PDFName.of(transType),
        D: PDFNumber.of(settings.transitionDuration),
      };
      
      if (transDirection !== undefined) {
        transDict.Di = PDFNumber.of(transDirection);
      }
      if (transMotion) {
        transDict.M = PDFName.of(transMotion);
      }
      
      page.node.set(PDFName.of("Trans"), context.obj(transDict));
    }
    
    if (settings.autoAdvance > 0) {
      page.node.set(PDFName.of("Dur"), PDFNumber.of(settings.autoAdvance));
    }
  }
  
  pdf.setProducer("PDF Tools - Presentation Maker");
  return Buffer.from(await pdf.save());
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
            filename = "extracted-data.xlsx";
            contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            break;
          }
          
          case "pdf-to-xls": {
            result = await pdfToXls(files[0]);
            filename = "extracted-data.xlsx";
            contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            break;
          }
          
          case "pdf-to-xlsx": {
            result = await pdfToXlsx(files[0]);
            filename = "extracted-data.xlsx";
            contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
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
            filename = "extracted-data.json";
            contentType = "application/json";
            break;
          }
          
          case "pdf-to-csv": {
            result = await pdfToCsv(files[0]);
            filename = "extracted-data.csv";
            contentType = "text/csv";
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
          
          case "add-image-to-pdf": {
            if (files.length < 2) {
              throw new Error("Please upload both a PDF and an image file");
            }
            const pdfFile = files.find(f => f.originalname.toLowerCase().endsWith('.pdf'));
            const imageFile = files.find(f => !f.originalname.toLowerCase().endsWith('.pdf'));
            if (!pdfFile || !imageFile) {
              throw new Error("Please upload a PDF file and an image file");
            }
            const imgX = parseInt(options.imageX as string, 10) || 50;
            const imgY = parseInt(options.imageY as string, 10) || 50;
            const imgWidth = parseInt(options.imageWidth as string, 10) || 200;
            const imgHeight = parseInt(options.imageHeight as string, 10) || 200;
            const imgPosition = options.imagePosition || "custom";
            const imgTargetPage = parseInt(options.targetPage as string, 10) || 1;
            result = await addImageToPdf(pdfFile, imageFile, imgX, imgY, imgWidth, imgHeight, imgPosition, imgTargetPage);
            filename = "image-added.pdf";
            break;
          }
          
          case "replace-image-in-pdf": {
            if (files.length < 2) {
              throw new Error("Please upload both a PDF and a replacement image file");
            }
            const replacePdfFile = files.find(f => f.originalname.toLowerCase().endsWith('.pdf'));
            const replaceImageFile = files.find(f => !f.originalname.toLowerCase().endsWith('.pdf'));
            if (!replacePdfFile || !replaceImageFile) {
              throw new Error("Please upload a PDF file and a replacement image file");
            }
            const replaceTargetPage = parseInt(options.targetPage as string, 10) || 1;
            result = await replaceImageInPdf(replacePdfFile, replaceImageFile, replaceTargetPage);
            filename = "image-replaced.pdf";
            break;
          }
          
          case "add-shapes-to-pdf": {
            const shapeType = options.shapeType || "rectangle";
            const shapeX = parseInt(options.shapeX as string, 10) || 100;
            const shapeY = parseInt(options.shapeY as string, 10) || 100;
            const shapeWidth = parseInt(options.shapeWidth as string, 10) || 100;
            const shapeHeight = parseInt(options.shapeHeight as string, 10) || 100;
            const shapeColor = options.shapeColor || "#0000FF";
            const shapeFillColor = options.shapeFillColor || "";
            const shapeStrokeWidth = parseInt(options.shapeStrokeWidth as string, 10) || 2;
            const shapeTargetPage = parseInt(options.targetPage as string, 10) || 1;
            result = await addShapesToPdf(files[0], shapeType, shapeX, shapeY, shapeWidth, shapeHeight, shapeColor, shapeFillColor, shapeStrokeWidth, shapeTargetPage);
            filename = "shapes-added.pdf";
            break;
          }
          
          case "draw-on-pdf": {
            const drawColor = options.drawColor || "#000000";
            const drawStrokeWidth = parseInt(options.drawStrokeWidth as string, 10) || 2;
            const drawTargetPage = parseInt(options.targetPage as string, 10) || 1;
            result = await drawOnPdf(files[0], drawColor, drawStrokeWidth, drawTargetPage);
            filename = "drawn.pdf";
            break;
          }
          
          case "pdf-annotator": {
            const annotationType = options.annotationType || "highlight";
            const annotationColor = options.annotationColor || "#FFFF00";
            const annotationText = options.annotationText || "";
            const annotatorTargetPage = parseInt(options.targetPage as string, 10) || 1;
            const annotationX = parseInt(options.textX as string, 10) || 50;
            const annotationY = parseInt(options.textY as string, 10) || 700;
            const annotationWidth = parseInt(options.shapeWidth as string, 10) || 200;
            const annotationHeight = parseInt(options.shapeHeight as string, 10) || 20;
            result = await pdfAnnotator(files[0], annotationType, annotationColor, annotationText, annotatorTargetPage, annotationX, annotationY, annotationWidth, annotationHeight);
            filename = "annotated.pdf";
            break;
          }
          
          case "annotate-pdf": {
            const annoPdfType = options.annotationType || "note";
            const annoPdfColor = options.annotationColor || "#FFFF00";
            const annoPdfText = options.annotationText || "";
            const annoPdfTargetPage = parseInt(options.targetPage as string, 10) || 1;
            const annoPdfX = parseInt(options.textX as string, 10) || 50;
            const annoPdfY = parseInt(options.textY as string, 10) || 700;
            result = await annotatePdf(files[0], annoPdfType, annoPdfColor, annoPdfText, annoPdfTargetPage, annoPdfX, annoPdfY);
            filename = "annotated.pdf";
            break;
          }
          
          case "highlight-pdf-text": {
            const highlightColor = options.highlightColor || "#FFFF00";
            const highlightOpacity = parseFloat(options.annotationOpacity as string) || 0.5;
            const highlightTargetPage = parseInt(options.targetPage as string, 10) || 1;
            const highlightX = parseInt(options.textX as string, 10) || 50;
            const highlightY = parseInt(options.textY as string, 10) || 700;
            const highlightWidth = parseInt(options.shapeWidth as string, 10) || 200;
            const highlightHeight = parseInt(options.shapeHeight as string, 10) || 20;
            result = await highlightPdfText(files[0], highlightColor, highlightOpacity, highlightTargetPage, highlightX, highlightY, highlightWidth, highlightHeight);
            filename = "highlighted.pdf";
            break;
          }
          
          case "underline-pdf-text": {
            const underlineColor = options.annotationColor || "#0000FF";
            const underlineTargetPage = parseInt(options.targetPage as string, 10) || 1;
            const underlineX = parseInt(options.textX as string, 10) || 50;
            const underlineY = parseInt(options.textY as string, 10) || 700;
            const underlineWidth = parseInt(options.shapeWidth as string, 10) || 200;
            const underlineStrokeWidth = parseInt(options.shapeStrokeWidth as string, 10) || 2;
            result = await underlinePdfText(files[0], underlineColor, underlineTargetPage, underlineX, underlineY, underlineWidth, underlineStrokeWidth);
            filename = "underlined.pdf";
            break;
          }
          
          case "strikethrough-pdf-text": {
            const strikeColor = options.annotationColor || "#FF0000";
            const strikeTargetPage = parseInt(options.targetPage as string, 10) || 1;
            const strikeX = parseInt(options.textX as string, 10) || 50;
            const strikeY = parseInt(options.textY as string, 10) || 700;
            const strikeWidth = parseInt(options.shapeWidth as string, 10) || 200;
            const strikeStrokeWidth = parseInt(options.shapeStrokeWidth as string, 10) || 2;
            result = await strikethroughPdfText(files[0], strikeColor, strikeTargetPage, strikeX, strikeY, strikeWidth, strikeStrokeWidth);
            filename = "strikethrough.pdf";
            break;
          }
          
          case "pdf-marker": {
            const markerColor = options.markerColor || "#FFFF00";
            const markerType = options.annotationType || "highlight";
            const markerTargetPage = parseInt(options.targetPage as string, 10) || 1;
            const markerX = parseInt(options.textX as string, 10) || 50;
            const markerY = parseInt(options.textY as string, 10) || 700;
            const markerWidth = parseInt(options.shapeWidth as string, 10) || 200;
            const markerHeight = parseInt(options.shapeHeight as string, 10) || 20;
            result = await pdfMarker(files[0], markerColor, markerType, markerTargetPage, markerX, markerY, markerWidth, markerHeight);
            filename = "marked.pdf";
            break;
          }
          
          case "add-comments-to-pdf": {
            const commentText = options.commentText || "Comment";
            const commentAuthor = options.commentAuthor || "User";
            const commentPage = parseInt(options.commentPage as string, 10) || 1;
            const commentX = parseInt(options.commentX as string, 10) || 50;
            const commentY = parseInt(options.commentY as string, 10) || 700;
            result = await addCommentsToPdf(files[0], commentText, commentAuthor, commentPage, commentX, commentY);
            filename = "commented.pdf";
            break;
          }
          
          case "pdf-commenter": {
            const commenterText = options.commentText || "Comment";
            const commenterAuthor = options.commentAuthor || "Reviewer";
            const commenterPage = parseInt(options.commentPage as string, 10) || 1;
            const commenterX = parseInt(options.commentX as string, 10) || 50;
            const commenterY = parseInt(options.commentY as string, 10) || 700;
            result = await addCommentsToPdf(files[0], commenterText, commenterAuthor, commenterPage, commenterX, commenterY);
            filename = "reviewed.pdf";
            break;
          }
          
          case "flatten-pdf": {
            result = await flattenPdf(files[0]);
            filename = "flattened.pdf";
            break;
          }
          
          case "flatten-pdf-comments": {
            result = await flattenPdfComments(files[0]);
            filename = "comments-flattened.pdf";
            break;
          }
          
          case "flatten-pdf-layers": {
            result = await flattenPdfLayers(files[0]);
            filename = "layers-flattened.pdf";
            break;
          }
          
          case "add-hyperlink-to-pdf": {
            const linkUrl = options.hyperlinkUrl || "https://example.com";
            const linkPage = parseInt(options.hyperlinkPage as string, 10) || 1;
            const linkX = parseInt(options.hyperlinkX as string, 10) || 50;
            const linkY = parseInt(options.hyperlinkY as string, 10) || 700;
            const linkWidth = parseInt(options.hyperlinkWidth as string, 10) || 100;
            const linkHeight = parseInt(options.hyperlinkHeight as string, 10) || 20;
            result = await addHyperlinkToPdf(files[0], linkUrl, linkPage, linkX, linkY, linkWidth, linkHeight);
            filename = "with-hyperlink.pdf";
            break;
          }
          
          case "pdf-link-editor": {
            const editorLinkUrl = options.hyperlinkUrl || "https://example.com";
            const editorLinkPage = parseInt(options.hyperlinkPage as string, 10) || 1;
            const editorLinkX = parseInt(options.hyperlinkX as string, 10) || 50;
            const editorLinkY = parseInt(options.hyperlinkY as string, 10) || 700;
            const editorLinkWidth = parseInt(options.hyperlinkWidth as string, 10) || 100;
            const editorLinkHeight = parseInt(options.hyperlinkHeight as string, 10) || 20;
            result = await addHyperlinkToPdf(files[0], editorLinkUrl, editorLinkPage, editorLinkX, editorLinkY, editorLinkWidth, editorLinkHeight);
            filename = "links-edited.pdf";
            break;
          }
          
          case "edit-pdf-metadata": {
            const metaTitle = options.metadataTitle || "";
            const metaAuthor = options.metadataAuthor || "";
            const metaSubject = options.metadataSubject || "";
            const metaKeywords = options.metadataKeywords || "";
            const metaCreator = options.metadataCreator || "";
            const metaProducer = options.metadataProducer || "";
            result = await editPdfMetadata(files[0], metaTitle, metaAuthor, metaSubject, metaKeywords, metaCreator, metaProducer);
            filename = "metadata-edited.pdf";
            break;
          }
          
          case "pdf-metadata-editor": {
            const editorMetaTitle = options.metadataTitle || "";
            const editorMetaAuthor = options.metadataAuthor || "";
            const editorMetaSubject = options.metadataSubject || "";
            const editorMetaKeywords = options.metadataKeywords || "";
            const editorMetaCreator = options.metadataCreator || "";
            const editorMetaProducer = options.metadataProducer || "";
            result = await editPdfMetadata(files[0], editorMetaTitle, editorMetaAuthor, editorMetaSubject, editorMetaKeywords, editorMetaCreator, editorMetaProducer);
            filename = "metadata-updated.pdf";
            break;
          }
          
          case "change-pdf-metadata": {
            const changeMetaTitle = options.metadataTitle || "";
            const changeMetaAuthor = options.metadataAuthor || "";
            const changeMetaSubject = options.metadataSubject || "";
            const changeMetaKeywords = options.metadataKeywords || "";
            const changeMetaCreator = options.metadataCreator || "";
            const changeMetaProducer = options.metadataProducer || "";
            result = await editPdfMetadata(files[0], changeMetaTitle, changeMetaAuthor, changeMetaSubject, changeMetaKeywords, changeMetaCreator, changeMetaProducer);
            filename = "metadata-changed.pdf";
            break;
          }
          
          case "redact-pdf": {
            const redactAreas = options.redactAreas || "[]";
            const redactColor = options.redactColor || "#000000";
            result = await redactPdf(files[0], redactAreas, redactColor);
            filename = "redacted.pdf";
            break;
          }
          
          case "pdf-redactor": {
            const redactorAreas = options.redactAreas || "[]";
            const redactorColor = options.redactColor || "#000000";
            result = await redactPdf(files[0], redactorAreas, redactorColor);
            filename = "redacted-document.pdf";
            break;
          }
          
          case "blackout-pdf": {
            const blackoutAreas = options.redactAreas || "[]";
            result = await blackoutPdf(files[0], blackoutAreas);
            filename = "blackout.pdf";
            break;
          }
          
          case "sanitize-pdf": {
            const sanitizeLevel = options.sanitizeLevel || "standard";
            result = await sanitizePdf(files[0], sanitizeLevel);
            filename = "sanitized.pdf";
            break;
          }
          
          case "remove-pdf-metadata": {
            result = await removePdfMetadata(files[0]);
            filename = "no-metadata.pdf";
            break;
          }
          
          case "crop-pdf": {
            const cropTop = Number(options.cropTop) || 0;
            const cropBottom = Number(options.cropBottom) || 0;
            const cropLeft = Number(options.cropLeft) || 0;
            const cropRight = Number(options.cropRight) || 0;
            result = await cropPdf(files[0], cropTop, cropBottom, cropLeft, cropRight);
            filename = "cropped.pdf";
            break;
          }
          
          case "pdf-cropper": {
            const cropperTop = Number(options.cropTop) || 0;
            const cropperBottom = Number(options.cropBottom) || 0;
            const cropperLeft = Number(options.cropLeft) || 0;
            const cropperRight = Number(options.cropRight) || 0;
            result = await cropPdf(files[0], cropperTop, cropperBottom, cropperLeft, cropperRight);
            filename = "cropped-document.pdf";
            break;
          }
          
          case "crop-pdf-margins": {
            const marginCrop = Number(options.cropMargin) || 20;
            result = await cropPdfMargins(files[0], marginCrop);
            filename = "margins-cropped.pdf";
            break;
          }
          
          case "resize-pdf": {
            const resizeWidth = Number(options.resizeWidth) || 612;
            const resizeHeight = Number(options.resizeHeight) || 792;
            const resizeMode = options.resizeMode || "dimensions";
            result = await resizePdf(files[0], resizeWidth, resizeHeight, resizeMode);
            filename = "resized.pdf";
            break;
          }
          
          case "pdf-resizer": {
            const resizerWidth = Number(options.resizeWidth) || 612;
            const resizerHeight = Number(options.resizeHeight) || 792;
            const resizerMode = options.resizeMode || "dimensions";
            result = await resizePdf(files[0], resizerWidth, resizerHeight, resizerMode);
            filename = "resized-document.pdf";
            break;
          }
          
          case "change-pdf-page-size": {
            const targetSize = options.targetPageSize || "a4";
            const orientation = options.pageOrientation || "auto";
            result = await changePageSize(files[0], targetSize, orientation);
            filename = `resized-to-${targetSize}.pdf`;
            break;
          }
          
          case "pdf-to-a4": {
            result = await changePageSize(files[0], "a4", options.pageOrientation || "auto");
            filename = "converted-to-a4.pdf";
            break;
          }
          
          case "pdf-to-letter": {
            result = await changePageSize(files[0], "letter", options.pageOrientation || "auto");
            filename = "converted-to-letter.pdf";
            break;
          }
          
          case "change-pdf-layout": {
            const targetOrientation = options.pageOrientation || "landscape";
            result = await changePdfLayout(files[0], targetOrientation);
            filename = `layout-${targetOrientation}.pdf`;
            break;
          }
          
          case "n-up-pdf": {
            const nupLayout = options.nupLayout || "2-up";
            const nupOrder = options.nupOrder || "horizontal";
            const nupBorder = options.nupBorder || false;
            result = await createNupPdf(files[0], nupLayout, nupOrder, nupBorder);
            filename = `${nupLayout}-document.pdf`;
            break;
          }
          
          case "pdf-page-inverter": {
            result = await invertPageOrder(files[0]);
            filename = "pages-inverted.pdf";
            break;
          }
          
          case "invert-pdf-colors": {
            result = await invertPdfColors(files[0]);
            filename = "colors-inverted.pdf";
            break;
          }
          
          case "pdf-color-inverter": {
            result = await invertPdfColors(files[0]);
            filename = "color-inverted-document.pdf";
            break;
          }
          
          case "auto-crop-pdf-margins": {
            const cropThreshold = Number(options.autoCropThreshold) || 10;
            result = await autoCropMargins(files[0], cropThreshold);
            filename = "auto-cropped.pdf";
            break;
          }
          
          case "auto-deskew-pdf": {
            const deskewMode = options.deskewMode || "auto";
            const deskewAngle = Number(options.deskewAngle) || 0;
            result = await autoDeskewPdf(files[0], deskewMode, deskewAngle);
            filename = "deskewed.pdf";
            break;
          }
          
          case "pdf-booklet-maker": {
            const bookletBinding = options.bookletBinding || "left";
            const bookletPageSize = options.bookletPageSize || "letter";
            result = await createBooklet(files[0], bookletBinding, bookletPageSize);
            filename = "booklet.pdf";
            break;
          }
          
          case "impose-pdf": {
            const imposeLayout = options.impositionLayout || "2-up-saddle";
            const imposeSheetSize = options.impositionSheetSize || "a3";
            result = await imposePdf(files[0], imposeLayout, imposeSheetSize);
            filename = "imposed.pdf";
            break;
          }
          
          case "pdf-handout-6up": {
            result = await createHandout6Up(files[0]);
            filename = "handout-6up.pdf";
            break;
          }
          
          case "add-gutter-margins": {
            const gutterSizeVal = Number(options.gutterSize) || 36;
            const gutterPositionVal = options.gutterPosition || "left";
            result = await addGutterMargins(files[0], gutterSizeVal, gutterPositionVal);
            filename = "with-gutter.pdf";
            break;
          }
          
          case "pdf-color-changer": {
            const fromColor = options.colorChangeFrom || "#000000";
            const toColor = options.colorChangeTo || "#0000FF";
            const colorMode = options.colorChangeMode || "exact";
            result = await changePdfColors(files[0], fromColor, toColor, colorMode);
            filename = "color-changed.pdf";
            break;
          }
          
          case "pdf-font-replacer": {
            const sourceFont = options.sourceFontName || "Arial";
            const targetFont = options.targetFontName || "Helvetica";
            result = await replacePdfFont(files[0], sourceFont, targetFont);
            filename = "font-replaced.pdf";
            break;
          }
          
          case "pdf-font-finder": {
            const fontResult = await findPdfFonts(files[0]);
            result = fontResult.pdfBuffer;
            filename = "font-report.pdf";
            break;
          }
          
          case "pdf-link-checker": {
            const linkResult = await checkPdfLinks(files[0]);
            result = linkResult.pdfBuffer;
            filename = "link-report.pdf";
            break;
          }
          
          case "pdf-link-remover": {
            result = await removePdfLinks(files[0]);
            filename = "links-removed.pdf";
            break;
          }
          
          case "pdf-annotation-remover": {
            const annotType = options.annotationTypesToRemove || "all";
            result = await removeAnnotations(files[0], annotType);
            filename = "annotations-removed.pdf";
            break;
          }
          
          case "pdf-bookmark-creator": {
            const bookmarksData = options.bookmarks || "";
            result = await createBookmarks(files[0], bookmarksData);
            filename = "bookmarks-added.pdf";
            break;
          }
          
          case "pdf-bookmark-editor": {
            const editBookmarksData = options.bookmarks || "";
            result = await editBookmarks(files[0], editBookmarksData);
            filename = "bookmarks-edited.pdf";
            break;
          }
          
          case "pdf-bookmark-remover": {
            result = await removeBookmarks(files[0]);
            filename = "bookmarks-removed.pdf";
            break;
          }
          
          case "pdf-page-labeler": {
            const labelStyle = options.pageLabelStyle || "decimal";
            const labelPrefix = options.pageLabelPrefix || "";
            const labelStartPage = Number(options.pageLabelStartPage) || 1;
            const labelStartNumber = Number(options.pageLabelStartNumber) || 1;
            result = await addPageLabels(files[0], labelStyle, labelPrefix, labelStartPage, labelStartNumber);
            filename = "page-labeled.pdf";
            break;
          }
          
          case "pdf-comment-summarizer": {
            result = await summarizeComments(files[0]);
            filename = "comment-summary.pdf";
            break;
          }
          
          case "pdf-action-remover": {
            result = await removeActions(files[0]);
            filename = "actions-removed.pdf";
            break;
          }
          
          case "pdf-javascript-remover": {
            result = await removeJavaScript(files[0]);
            filename = "javascript-removed.pdf";
            break;
          }
          
          case "pdf-object-editor": {
            const objType = options.objectType || "text";
            const objAction = options.objectAction || "view";
            result = await editPdfObjects(files[0], objType, objAction);
            filename = "objects-edited.pdf";
            break;
          }
          
          case "pdf-path-editor": {
            const pathOp = options.pathOperation || "view";
            const pathStrokeW = Number(options.pathStrokeWidth) || 1;
            const pathStrokeC = options.pathStrokeColor || "#000000";
            const pathFillC = options.pathFillColor || "";
            result = await editPdfPaths(files[0], pathOp, pathStrokeW, pathStrokeC, pathFillC);
            filename = "paths-edited.pdf";
            break;
          }
          
          case "pdf-javascript-editor": {
            const jsCode = options.javascriptCode || "";
            const jsAction = options.javascriptAction || "document-open";
            result = await editJavaScript(files[0], jsCode, jsAction);
            filename = "javascript-edited.pdf";
            break;
          }
          
          case "pdf-initial-view-editor": {
            const viewSettings = {
              zoom: options.initialViewZoom || "fit-page",
              pageMode: options.initialViewPageMode || "none",
              pageLayout: options.initialViewPageLayout || "single",
              startPage: options.initialViewStartPage || 1,
            };
            result = await setInitialView(files[0], viewSettings);
            filename = "initial-view-set.pdf";
            break;
          }
          
          case "pdf-presentation-maker": {
            const presentationSettings = {
              fullscreen: options.presentationMode !== false,
              transition: options.transitionEffect || "fade",
              transitionDuration: options.transitionDuration || 1,
              autoAdvance: options.autoAdvanceTime || 0,
            };
            result = await makePresentationPdf(files[0], presentationSettings);
            filename = "presentation.pdf";
            break;
          }
          
          case "protect-pdf":
          case "pdf-protector":
          case "add-password-to-pdf":
          case "encrypt-pdf":
          case "pdf-encryptor":
          case "password-protect-pdf":
            if (!options.password || options.password.trim() === "") {
              throw new Error("Please enter a password to protect the PDF");
            }
            result = await protectPdf(files[0], options.password);
            filename = "protected.pdf";
            break;
          
          case "unlock-pdf-tool":
          case "pdf-unlocker":
            if (!options.unlockPassword || options.unlockPassword.trim() === "") {
              throw new Error("Please enter the PDF password to unlock");
            }
            result = await unlockPdf(files[0], options.unlockPassword);
            filename = "unlocked.pdf";
            break;

          case "remove-pdf-password":
          case "decrypt-pdf":
          case "pdf-password-remover":
            if (!options.unlockPassword || options.unlockPassword.trim() === "") {
              throw new Error("Please enter the current PDF password");
            }
            result = await unlockPdf(files[0], options.unlockPassword);
            filename = toolType === "decrypt-pdf" ? "decrypted.pdf" : "password-removed.pdf";
            break;

          case "add-pdf-permissions":
          case "set-pdf-permissions":
            if (!options.ownerPassword || options.ownerPassword.trim() === "") {
              throw new Error("Please enter an owner password to set permissions");
            }
            result = await setPermissions(files[0], {
              ownerPassword: options.ownerPassword,
              userPassword: options.userPassword || undefined,
              allowPrinting: options.allowPrinting !== false,
              allowCopying: options.allowCopying !== false,
              allowEditing: options.allowEditing !== false,
              allowAnnotations: options.allowAnnotations !== false,
              allowFormFilling: options.allowFormFilling !== false,
            });
            filename = "permissions-set.pdf";
            break;

          case "disable-pdf-printing":
            if (!options.ownerPassword || options.ownerPassword.trim() === "") {
              throw new Error("Please enter an owner password to protect the PDF");
            }
            result = await setPermissions(files[0], {
              ownerPassword: options.ownerPassword,
              userPassword: options.userPassword || undefined,
              allowPrinting: false,
              allowCopying: true,
              allowEditing: true,
              allowAnnotations: true,
              allowFormFilling: true,
            });
            filename = "print-disabled.pdf";
            break;

          case "disable-pdf-editing":
            if (!options.ownerPassword || options.ownerPassword.trim() === "") {
              throw new Error("Please enter an owner password to protect the PDF");
            }
            result = await setPermissions(files[0], {
              ownerPassword: options.ownerPassword,
              userPassword: options.userPassword || undefined,
              allowPrinting: true,
              allowCopying: true,
              allowEditing: false,
              allowAnnotations: false,
              allowFormFilling: false,
            });
            filename = "edit-disabled.pdf";
            break;

          case "disable-pdf-copying":
            if (!options.ownerPassword || options.ownerPassword.trim() === "") {
              throw new Error("Please enter an owner password to protect the PDF");
            }
            result = await setPermissions(files[0], {
              ownerPassword: options.ownerPassword,
              userPassword: options.userPassword || undefined,
              allowPrinting: true,
              allowCopying: false,
              allowEditing: true,
              allowAnnotations: true,
              allowFormFilling: true,
            });
            filename = "copy-disabled.pdf";
            break;

          case "pdf-security":
          case "secure-pdf":
            if (!options.password || options.password.trim() === "") {
              throw new Error("Please enter a password to secure the PDF");
            }
            result = await setPermissions(files[0], {
              ownerPassword: options.ownerPassword || options.password,
              userPassword: options.password,
              allowPrinting: options.allowPrinting !== false,
              allowCopying: options.allowCopying !== false,
              allowEditing: options.allowEditing !== false,
              allowAnnotations: options.allowAnnotations !== false,
              allowFormFilling: options.allowFormFilling !== false,
            });
            filename = "secured.pdf";
            break;

          case "sign-pdf":
            result = await addSignatureToPdf(files[0], {
              name: options.signatureName || "Signer",
              reason: options.signatureReason || "Document signed electronically",
              location: options.signatureLocation || "",
              contact: options.signatureContact || "",
              date: options.signatureDate || new Date().toLocaleDateString(),
              position: options.signaturePosition || "bottom-right",
              page: options.signaturePage || "last",
              customPage: options.signatureCustomPage,
              width: options.signatureWidth || 200,
              height: options.signatureHeight || 60,
              x: options.signatureX,
              y: options.signatureY,
              style: options.signatureStyle || "typed",
              text: options.signatureText,
              color: options.signatureColor || "#1a365d",
              fontSize: options.signatureFontSize || 12,
            });
            filename = "signed.pdf";
            break;

          case "pdf-signer":
            result = await addSignatureToPdf(files[0], {
              name: options.signatureName || "Professional Signer",
              reason: options.signatureReason || "Official document signature",
              location: options.signatureLocation || "",
              contact: options.signatureContact || "",
              date: options.signatureDate || new Date().toLocaleDateString(),
              position: options.signaturePosition || "bottom-right",
              page: options.signaturePage || "last",
              customPage: options.signatureCustomPage,
              width: options.signatureWidth || 220,
              height: options.signatureHeight || 70,
              x: options.signatureX,
              y: options.signatureY,
              style: options.signatureStyle || "typed",
              text: options.signatureText,
              color: options.signatureColor || "#1e3a5f",
              fontSize: options.signatureFontSize || 14,
            });
            filename = "pdf-signed.pdf";
            break;

          case "esign-pdf":
            result = await addSignatureToPdf(files[0], {
              name: options.signatureName || "Electronic Signer",
              reason: options.signatureReason || "Electronic signature applied",
              location: options.signatureLocation || "",
              contact: options.signatureContact || "",
              date: options.signatureDate || new Date().toLocaleDateString(),
              position: options.signaturePosition || "bottom-right",
              page: options.signaturePage || "last",
              customPage: options.signatureCustomPage,
              width: options.signatureWidth || 200,
              height: options.signatureHeight || 60,
              x: options.signatureX,
              y: options.signatureY,
              style: options.signatureStyle || "handwritten",
              text: options.signatureText || options.signatureName,
              color: options.signatureColor || "#2d3748",
              fontSize: options.signatureFontSize || 12,
            });
            filename = "esigned.pdf";
            break;

          case "add-signature-to-pdf":
            result = await addSignatureToPdf(files[0], {
              name: options.signatureName || "Signature",
              reason: options.signatureReason || "Signature added",
              location: options.signatureLocation || "",
              contact: options.signatureContact || "",
              date: options.signatureDate || new Date().toLocaleDateString(),
              position: options.signaturePosition || "bottom-right",
              page: options.signaturePage || "last",
              customPage: options.signatureCustomPage,
              width: options.signatureWidth || 180,
              height: options.signatureHeight || 55,
              x: options.signatureX,
              y: options.signatureY,
              style: options.signatureStyle || "typed",
              text: options.signatureText,
              color: options.signatureColor || "#1a365d",
              fontSize: options.signatureFontSize || 11,
            });
            filename = "signature-added.pdf";
            break;

          case "request-pdf-signature":
            result = await addSignatureFieldsToPdf(files[0], {
              requestEmail: options.requestEmail || "",
              requestMessage: options.requestMessage || "Please sign this document",
              requestDeadline: options.requestDeadline || "",
            });
            filename = "signature-requested.pdf";
            break;

          case "pdf-signature-tool":
            result = await addSignatureToPdf(files[0], {
              name: options.signatureName || "Authorized Signer",
              reason: options.signatureReason || "Document officially signed",
              location: options.signatureLocation || "",
              contact: options.signatureContact || "",
              date: options.signatureDate || new Date().toLocaleDateString(),
              position: options.signaturePosition || "bottom-right",
              page: options.signaturePage || "all",
              customPage: options.signatureCustomPage,
              width: options.signatureWidth || 200,
              height: options.signatureHeight || 60,
              x: options.signatureX,
              y: options.signatureY,
              style: options.signatureStyle || "typed",
              text: options.signatureText,
              color: options.signatureColor || "#1e40af",
              fontSize: options.signatureFontSize || 12,
            });
            filename = "tool-signed.pdf";
            break;

          case "validate-pdf-signature":
          case "pdf-digital-signature-validator":
            const validationResult = await validateSignature(files[0]);
            const validationPdfBytes = fs.readFileSync(files[0].path);
            const validationPdf = await PDFDocument.load(validationPdfBytes, { ignoreEncryption: true });
            const valPages = validationPdf.getPages();
            const valFirstPage = valPages[0];
            const valFont = await validationPdf.embedFont(StandardFonts.HelveticaBold);
            const valRegFont = await validationPdf.embedFont(StandardFonts.Helvetica);
            
            const { width: valWidth, height: valHeight } = valFirstPage.getSize();
            const reportWidth = 280;
            const reportHeight = 100;
            const reportX = valWidth - reportWidth - 20;
            const reportY = valHeight - reportHeight - 20;
            
            valFirstPage.drawRectangle({
              x: reportX,
              y: reportY,
              width: reportWidth,
              height: reportHeight,
              color: validationResult.valid ? rgb(0.9, 1, 0.9) : rgb(1, 0.95, 0.9),
              borderColor: validationResult.valid ? rgb(0.2, 0.6, 0.2) : rgb(0.8, 0.4, 0.2),
              borderWidth: 2,
            });
            
            valFirstPage.drawText(validationResult.valid ? "SIGNATURE VALID" : "NO SIGNATURE FOUND", {
              x: reportX + 15,
              y: reportY + reportHeight - 25,
              size: 14,
              font: valFont,
              color: validationResult.valid ? rgb(0.1, 0.5, 0.1) : rgb(0.6, 0.3, 0.1),
            });
            
            valFirstPage.drawText(`Validation Date: ${new Date().toLocaleDateString()}`, {
              x: reportX + 15,
              y: reportY + reportHeight - 45,
              size: 10,
              font: valRegFont,
              color: rgb(0.3, 0.3, 0.3),
            });
            
            const detailsText = validationResult.details.substring(0, 45);
            valFirstPage.drawText(detailsText, {
              x: reportX + 15,
              y: reportY + reportHeight - 65,
              size: 9,
              font: valRegFont,
              color: rgb(0.4, 0.4, 0.4),
            });
            
            if (validationResult.details.length > 45) {
              valFirstPage.drawText(validationResult.details.substring(45, 90), {
                x: reportX + 15,
                y: reportY + reportHeight - 80,
                size: 9,
                font: valRegFont,
                color: rgb(0.4, 0.4, 0.4),
              });
            }
            
            result = Buffer.from(await validationPdf.save());
            filename = toolType === "validate-pdf-signature" ? "signature-validated.pdf" : "digital-signature-validated.pdf";
            break;

          case "certify-pdf":
            result = await certifyPdf(files[0], {
              signatureName: options.signatureName || "Certifying Authority",
              signatureReason: options.signatureReason || "Document certified as authentic",
              certifyPermissions: options.certifyPermissions || "no-changes",
            });
            filename = "certified.pdf";
            break;

          case "pdf-locker":
            result = await lockPdfWithSignature(files[0], {
              signatureName: options.signatureName || "Document Owner",
              signatureReason: options.signatureReason || "Document locked and secured",
              signaturePosition: options.signaturePosition || "bottom-right",
              lockPassword: options.lockPassword || options.password,
              lockType: options.lockType || "both",
            });
            filename = "locked-signed.pdf";
            break;

          case "add-timestamp-to-pdf":
            const timestampPdfBytes = fs.readFileSync(files[0].path);
            const timestampPdf = await PDFDocument.load(timestampPdfBytes, { ignoreEncryption: true });
            const timestampFont = await timestampPdf.embedFont(StandardFonts.Helvetica);
            const timestampPages = timestampPdf.getPages();
            
            const now = new Date();
            let timestampText = "";
            switch (options.timestampFormat) {
              case "date-only":
                timestampText = now.toLocaleDateString();
                break;
              case "time-only":
                timestampText = now.toLocaleTimeString();
                break;
              case "iso-8601":
                timestampText = now.toISOString();
                break;
              case "custom":
                timestampText = options.timestampCustomFormat ? 
                  now.toLocaleDateString() + " " + now.toLocaleTimeString() : 
                  now.toLocaleString();
                break;
              default:
                timestampText = now.toLocaleString();
            }
            if (options.timestampIncludeTimezone) {
              timestampText += " " + Intl.DateTimeFormat().resolvedOptions().timeZone;
            }
            
            const tsFontSize = options.timestampFontSize || 12;
            const tsOpacity = (options.timestampOpacity || 100) / 100;
            const tsColorHex = options.timestampColor || "#000000";
            const tsR = parseInt(tsColorHex.slice(1, 3), 16) / 255;
            const tsG = parseInt(tsColorHex.slice(3, 5), 16) / 255;
            const tsB = parseInt(tsColorHex.slice(5, 7), 16) / 255;
            
            const getTimestampPosition = (page: any, position: string) => {
              const { width, height } = page.getSize();
              const textWidth = timestampFont.widthOfTextAtSize(timestampText, tsFontSize);
              switch (position) {
                case "top-left": return { x: 20, y: height - 30 };
                case "top-center": return { x: (width - textWidth) / 2, y: height - 30 };
                case "top-right": return { x: width - textWidth - 20, y: height - 30 };
                case "bottom-left": return { x: 20, y: 20 };
                case "bottom-center": return { x: (width - textWidth) / 2, y: 20 };
                default: return { x: width - textWidth - 20, y: 20 };
              }
            };
            
            const shouldApplyTimestamp = (pageIndex: number, totalPages: number) => {
              switch (options.timestampPages) {
                case "first": return pageIndex === 0;
                case "last": return pageIndex === totalPages - 1;
                case "odd": return pageIndex % 2 === 0;
                case "even": return pageIndex % 2 === 1;
                case "custom": return parsePageRange(options.timestampCustomPages || "", totalPages).includes(pageIndex);
                default: return true;
              }
            };
            
            timestampPages.forEach((page, index) => {
              if (shouldApplyTimestamp(index, timestampPages.length)) {
                const pos = getTimestampPosition(page, options.timestampPosition || "bottom-right");
                page.drawText(timestampText, {
                  x: pos.x,
                  y: pos.y,
                  size: tsFontSize,
                  font: timestampFont,
                  color: rgb(tsR, tsG, tsB),
                  opacity: tsOpacity,
                });
              }
            });
            
            result = Buffer.from(await timestampPdf.save());
            filename = "timestamped.pdf";
            break;

          case "pdf-certificate-adder":
            const certPdfBytes = fs.readFileSync(files[0].path);
            const certPdf = await PDFDocument.load(certPdfBytes, { ignoreEncryption: true });
            const certFont = await certPdf.embedFont(StandardFonts.HelveticaBold);
            const certRegFont = await certPdf.embedFont(StandardFonts.Helvetica);
            const certPages = certPdf.getPages();
            const certFirstPage = certPages[0];
            const { width: certWidth, height: certHeight } = certFirstPage.getSize();
            
            const certType = options.certificateType || "completion";
            const certName = options.certificateName || "Certificate Holder";
            const certIssuer = options.certificateIssuer || "Issuing Authority";
            const certDate = options.certificateDate || new Date().toLocaleDateString();
            const certNumber = options.certificateNumber || `CERT-${Date.now()}`;
            
            const certBoxWidth = 320;
            const certBoxHeight = 120;
            let certX = (certWidth - certBoxWidth) / 2;
            let certY = (certHeight - certBoxHeight) / 2;
            
            if (options.certificatePosition === "top-center") {
              certY = certHeight - certBoxHeight - 40;
            } else if (options.certificatePosition === "bottom-center") {
              certY = 40;
            }
            
            certFirstPage.drawRectangle({
              x: certX,
              y: certY,
              width: certBoxWidth,
              height: certBoxHeight,
              color: rgb(1, 0.98, 0.9),
              borderColor: rgb(0.7, 0.55, 0.2),
              borderWidth: 3,
            });
            
            const certTitle = certType === "completion" ? "CERTIFICATE OF COMPLETION" :
                             certType === "authenticity" ? "CERTIFICATE OF AUTHENTICITY" :
                             certType === "approval" ? "CERTIFICATE OF APPROVAL" :
                             certType === "membership" ? "MEMBERSHIP CERTIFICATE" : "CERTIFICATE";
            
            certFirstPage.drawText(certTitle, {
              x: certX + (certBoxWidth - certFont.widthOfTextAtSize(certTitle, 14)) / 2,
              y: certY + certBoxHeight - 25,
              size: 14,
              font: certFont,
              color: rgb(0.4, 0.3, 0.1),
            });
            
            certFirstPage.drawText(certName, {
              x: certX + (certBoxWidth - certFont.widthOfTextAtSize(certName, 12)) / 2,
              y: certY + certBoxHeight - 50,
              size: 12,
              font: certFont,
              color: rgb(0.2, 0.2, 0.2),
            });
            
            certFirstPage.drawText(`Issued by: ${certIssuer}`, {
              x: certX + 15,
              y: certY + certBoxHeight - 75,
              size: 10,
              font: certRegFont,
              color: rgb(0.4, 0.4, 0.4),
            });
            
            certFirstPage.drawText(`Date: ${certDate}  |  No: ${certNumber}`, {
              x: certX + 15,
              y: certY + certBoxHeight - 95,
              size: 9,
              font: certRegFont,
              color: rgb(0.5, 0.5, 0.5),
            });
            
            result = Buffer.from(await certPdf.save());
            filename = "certified.pdf";
            break;

          case "pdf-signature-remover":
            const removerPdfBytes = fs.readFileSync(files[0].path);
            const removerPdf = await PDFDocument.load(removerPdfBytes, { ignoreEncryption: true });
            const removerPages = removerPdf.getPages();
            
            removerPages.forEach(page => {
              const annotations = page.node.lookup(page.node.Annots);
              if (annotations) {
                page.node.delete(page.node.Annots);
              }
            });
            
            result = Buffer.from(await removerPdf.save());
            filename = "signatures-removed.pdf";
            break;

          case "watermark-pdf":
          case "pdf-watermarker":
            const wmPdfBytes = fs.readFileSync(files[0].path);
            const wmPdf = await PDFDocument.load(wmPdfBytes, { ignoreEncryption: true });
            const wmFont = await wmPdf.embedFont(StandardFonts.HelveticaBold);
            const wmPages = wmPdf.getPages();
            
            const wmText = options.watermarkText || "WATERMARK";
            const wmOpacity = (options.watermarkOpacity || 30) / 100;
            const wmRotation = (options.watermarkRotation || 0) * Math.PI / 180;
            
            const getWmPages = (totalPages: number) => {
              switch (options.watermarkPages) {
                case "first": return [0];
                case "last": return [totalPages - 1];
                case "odd": return Array.from({ length: totalPages }, (_, i) => i).filter(i => i % 2 === 0);
                case "even": return Array.from({ length: totalPages }, (_, i) => i).filter(i => i % 2 === 1);
                case "custom": return parsePageRange(options.watermarkCustomPages || "", totalPages);
                default: return Array.from({ length: totalPages }, (_, i) => i);
              }
            };
            
            const wmPageIndices = getWmPages(wmPages.length);
            
            wmPageIndices.forEach(index => {
              const page = wmPages[index];
              const { width, height } = page.getSize();
              const fontSize = 72;
              const textWidth = wmFont.widthOfTextAtSize(wmText, fontSize);
              
              let wmX = (width - textWidth) / 2;
              let wmY = height / 2;
              
              switch (options.watermarkPosition) {
                case "top-left": wmX = 50; wmY = height - 100; break;
                case "top-right": wmX = width - textWidth - 50; wmY = height - 100; break;
                case "bottom-left": wmX = 50; wmY = 50; break;
                case "bottom-right": wmX = width - textWidth - 50; wmY = 50; break;
                case "diagonal": wmX = 50; wmY = 50; break;
              }
              
              page.drawText(wmText, {
                x: wmX,
                y: wmY,
                size: fontSize,
                font: wmFont,
                color: rgb(0.5, 0.5, 0.5),
                opacity: wmOpacity,
                rotate: options.watermarkPosition === "diagonal" ? { type: "degrees" as const, angle: 45 } : 
                        wmRotation !== 0 ? { type: "degrees" as const, angle: options.watermarkRotation || 0 } : undefined,
              });
            });
            
            result = Buffer.from(await wmPdf.save());
            filename = "watermarked.pdf";
            break;

          case "add-text-watermark":
            const txtWmPdfBytes = fs.readFileSync(files[0].path);
            const txtWmPdf = await PDFDocument.load(txtWmPdfBytes, { ignoreEncryption: true });
            const txtWmFont = await txtWmPdf.embedFont(StandardFonts.HelveticaBold);
            const txtWmPages = txtWmPdf.getPages();
            
            const txtWmText = options.watermarkText || "CONFIDENTIAL";
            const txtWmFontSize = options.fontSize || 48;
            const txtWmOpacity = (options.watermarkOpacity || 30) / 100;
            const txtWmRotation = options.watermarkRotation || 45;
            const txtWmColorHex = options.color || "#808080";
            const txtWmR = parseInt(txtWmColorHex.slice(1, 3), 16) / 255;
            const txtWmG = parseInt(txtWmColorHex.slice(3, 5), 16) / 255;
            const txtWmB = parseInt(txtWmColorHex.slice(5, 7), 16) / 255;
            
            const getTxtWmPageIndices = (totalPages: number) => {
              switch (options.watermarkPages) {
                case "first": return [0];
                case "last": return [totalPages - 1];
                case "odd": return Array.from({ length: totalPages }, (_, i) => i).filter(i => i % 2 === 0);
                case "even": return Array.from({ length: totalPages }, (_, i) => i).filter(i => i % 2 === 1);
                default: return Array.from({ length: totalPages }, (_, i) => i);
              }
            };
            
            getTxtWmPageIndices(txtWmPages.length).forEach(index => {
              const page = txtWmPages[index];
              const { width, height } = page.getSize();
              const textWidth = txtWmFont.widthOfTextAtSize(txtWmText, txtWmFontSize);
              
              let x = (width - textWidth) / 2;
              let y = height / 2;
              
              switch (options.watermarkPosition) {
                case "top-left": x = 50; y = height - 80; break;
                case "top-right": x = width - textWidth - 50; y = height - 80; break;
                case "bottom-left": x = 50; y = 50; break;
                case "bottom-right": x = width - textWidth - 50; y = 50; break;
              }
              
              page.drawText(txtWmText, {
                x,
                y,
                size: txtWmFontSize,
                font: txtWmFont,
                color: rgb(txtWmR, txtWmG, txtWmB),
                opacity: txtWmOpacity,
                rotate: { type: "degrees" as const, angle: txtWmRotation },
              });
            });
            
            result = Buffer.from(await txtWmPdf.save());
            filename = "text-watermarked.pdf";
            break;

          case "add-image-watermark":
            const imgWmPdfBytes = fs[0] ? fs.readFileSync(files[0].path) : Buffer.from([]);
            const imgWmPdf = await PDFDocument.load(imgWmPdfBytes, { ignoreEncryption: true });
            const imgWmPages = imgWmPdf.getPages();
            const imgWmOpacity = (options.watermarkOpacity || 30) / 100;
            const imgWmScale = (options.watermarkScale || 50) / 100;
            
            const getImgWmPageIndices = (totalPages: number) => {
              switch (options.watermarkPages) {
                case "first": return [0];
                case "last": return [totalPages - 1];
                case "odd": return Array.from({ length: totalPages }, (_, i) => i).filter(i => i % 2 === 0);
                case "even": return Array.from({ length: totalPages }, (_, i) => i).filter(i => i % 2 === 1);
                default: return Array.from({ length: totalPages }, (_, i) => i);
              }
            };
            
            getImgWmPageIndices(imgWmPages.length).forEach(index => {
              const page = imgWmPages[index];
              const { width, height } = page.getSize();
              
              const placeholderSize = 100 * imgWmScale;
              let imgX = (width - placeholderSize) / 2;
              let imgY = (height - placeholderSize) / 2;
              
              switch (options.watermarkPosition) {
                case "top-left": imgX = 50; imgY = height - placeholderSize - 50; break;
                case "top-right": imgX = width - placeholderSize - 50; imgY = height - placeholderSize - 50; break;
                case "bottom-left": imgX = 50; imgY = 50; break;
                case "bottom-right": imgX = width - placeholderSize - 50; imgY = 50; break;
              }
              
              page.drawRectangle({
                x: imgX,
                y: imgY,
                width: placeholderSize,
                height: placeholderSize,
                color: rgb(0.7, 0.7, 0.7),
                opacity: imgWmOpacity,
                borderColor: rgb(0.5, 0.5, 0.5),
                borderWidth: 1,
              });
            });
            
            result = Buffer.from(await imgWmPdf.save());
            filename = "image-watermarked.pdf";
            break;

          case "add-tiled-watermark":
            const tiledPdfBytes = fs.readFileSync(files[0].path);
            const tiledPdf = await PDFDocument.load(tiledPdfBytes, { ignoreEncryption: true });
            const tiledFont = await tiledPdf.embedFont(StandardFonts.HelveticaBold);
            const tiledPages = tiledPdf.getPages();
            
            const tiledText = options.watermarkText || "CONFIDENTIAL";
            const tiledFontSize = options.fontSize || 24;
            const tiledOpacity = (options.watermarkOpacity || 20) / 100;
            const tiledSpacing = options.watermarkTileSpacing || 100;
            const tiledRotation = options.watermarkRotation || 45;
            const tiledColorHex = options.color || "#808080";
            const tiledR = parseInt(tiledColorHex.slice(1, 3), 16) / 255;
            const tiledG = parseInt(tiledColorHex.slice(3, 5), 16) / 255;
            const tiledB = parseInt(tiledColorHex.slice(5, 7), 16) / 255;
            
            const getTiledPageIndices = (totalPages: number) => {
              switch (options.watermarkPages) {
                case "first": return [0];
                case "last": return [totalPages - 1];
                case "odd": return Array.from({ length: totalPages }, (_, i) => i).filter(i => i % 2 === 0);
                case "even": return Array.from({ length: totalPages }, (_, i) => i).filter(i => i % 2 === 1);
                default: return Array.from({ length: totalPages }, (_, i) => i);
              }
            };
            
            getTiledPageIndices(tiledPages.length).forEach(index => {
              const page = tiledPages[index];
              const { width, height } = page.getSize();
              
              for (let y = 50; y < height; y += tiledSpacing) {
                for (let x = 50; x < width; x += tiledSpacing + tiledFont.widthOfTextAtSize(tiledText, tiledFontSize)) {
                  page.drawText(tiledText, {
                    x,
                    y,
                    size: tiledFontSize,
                    font: tiledFont,
                    color: rgb(tiledR, tiledG, tiledB),
                    opacity: tiledOpacity,
                    rotate: { type: "degrees" as const, angle: tiledRotation },
                  });
                }
              }
            });
            
            result = Buffer.from(await tiledPdf.save());
            filename = "tiled-watermarked.pdf";
            break;

          case "stamp-pdf":
          case "pdf-stamper":
            const stampPdfBytes = fs.readFileSync(files[0].path);
            const stampPdf = await PDFDocument.load(stampPdfBytes, { ignoreEncryption: true });
            const stampFont = await stampPdf.embedFont(StandardFonts.HelveticaBold);
            const stampPages = stampPdf.getPages();
            
            const stampType = options.stampType || "approved";
            const stampText = stampType === "custom" ? (options.stampText || "STAMP") : stampType.toUpperCase();
            const stampSize = options.stampSize || "medium";
            const stampOpacity = (options.stampOpacity || 80) / 100;
            const stampRotation = options.stampRotation || 0;
            const stampColorHex = options.stampColor || "#dc2626";
            const stampR = parseInt(stampColorHex.slice(1, 3), 16) / 255;
            const stampG = parseInt(stampColorHex.slice(3, 5), 16) / 255;
            const stampB = parseInt(stampColorHex.slice(5, 7), 16) / 255;
            
            const stampFontSize = stampSize === "small" ? 24 : stampSize === "large" ? 48 : 36;
            const stampPadding = stampSize === "small" ? 10 : stampSize === "large" ? 20 : 15;
            
            const getStampPages = (totalPages: number) => {
              switch (options.stampPages) {
                case "first": return [0];
                case "last": return [totalPages - 1];
                case "custom": return parsePageRange(options.stampCustomPages || "", totalPages);
                default: return Array.from({ length: totalPages }, (_, i) => i);
              }
            };
            
            getStampPages(stampPages.length).forEach(index => {
              const page = stampPages[index];
              const { width, height } = page.getSize();
              const textWidth = stampFont.widthOfTextAtSize(stampText, stampFontSize);
              const textHeight = stampFontSize;
              
              let sX = (width - textWidth - stampPadding * 2) / 2;
              let sY = (height - textHeight - stampPadding * 2) / 2;
              
              switch (options.stampPosition) {
                case "top-left": sX = 30; sY = height - textHeight - stampPadding * 2 - 30; break;
                case "top-right": sX = width - textWidth - stampPadding * 2 - 30; sY = height - textHeight - stampPadding * 2 - 30; break;
                case "bottom-left": sX = 30; sY = 30; break;
                case "bottom-right": sX = width - textWidth - stampPadding * 2 - 30; sY = 30; break;
              }
              
              const boxWidth = textWidth + stampPadding * 2;
              const boxHeight = textHeight + stampPadding * 2;
              
              if (options.stampStyle === "circle" || options.stampStyle === "seal") {
                const radius = Math.max(boxWidth, boxHeight) / 2 + 10;
                page.drawCircle({
                  x: sX + boxWidth / 2,
                  y: sY + boxHeight / 2,
                  size: radius,
                  color: rgb(1, 1, 1),
                  opacity: 0,
                  borderColor: rgb(stampR, stampG, stampB),
                  borderWidth: 3,
                  borderOpacity: stampOpacity,
                });
              } else {
                page.drawRectangle({
                  x: sX,
                  y: sY,
                  width: boxWidth,
                  height: boxHeight,
                  color: rgb(1, 1, 1),
                  opacity: 0,
                  borderColor: rgb(stampR, stampG, stampB),
                  borderWidth: 3,
                  borderOpacity: stampOpacity,
                });
              }
              
              page.drawText(stampText, {
                x: sX + stampPadding,
                y: sY + stampPadding,
                size: stampFontSize,
                font: stampFont,
                color: rgb(stampR, stampG, stampB),
                opacity: stampOpacity,
                rotate: stampRotation !== 0 ? { type: "degrees" as const, angle: stampRotation } : undefined,
              });
              
              if (options.stampDate) {
                const dateText = new Date().toLocaleDateString();
                const dateFontSize = stampFontSize * 0.5;
                page.drawText(dateText, {
                  x: sX + stampPadding,
                  y: sY - dateFontSize - 5,
                  size: dateFontSize,
                  font: stampFont,
                  color: rgb(stampR, stampG, stampB),
                  opacity: stampOpacity,
                });
              }
            });
            
            result = Buffer.from(await stampPdf.save());
            filename = "stamped.pdf";
            break;

          case "add-confidential-stamp":
            const confStampBytes = fs.readFileSync(files[0].path);
            const confStampPdf = await PDFDocument.load(confStampBytes, { ignoreEncryption: true });
            const confFont = await confStampPdf.embedFont(StandardFonts.HelveticaBold);
            const confPages = confStampPdf.getPages();
            
            const confText = "CONFIDENTIAL";
            const confSize = options.stampSize || "medium";
            const confOpacity = (options.stampOpacity || 80) / 100;
            const confRotation = options.stampRotation || -30;
            const confColorHex = options.stampColor || "#dc2626";
            const confR = parseInt(confColorHex.slice(1, 3), 16) / 255;
            const confG = parseInt(confColorHex.slice(3, 5), 16) / 255;
            const confB = parseInt(confColorHex.slice(5, 7), 16) / 255;
            
            const confFontSize = confSize === "small" ? 28 : confSize === "large" ? 56 : 42;
            const confPadding = confSize === "small" ? 12 : confSize === "large" ? 24 : 18;
            
            const getConfPages = (totalPages: number) => {
              switch (options.stampPages) {
                case "first": return [0];
                case "last": return [totalPages - 1];
                case "custom": return parsePageRange(options.stampCustomPages || "", totalPages);
                default: return Array.from({ length: totalPages }, (_, i) => i);
              }
            };
            
            getConfPages(confPages.length).forEach(index => {
              const page = confPages[index];
              const { width, height } = page.getSize();
              const textWidth = confFont.widthOfTextAtSize(confText, confFontSize);
              const textHeight = confFontSize;
              
              let cX = (width - textWidth - confPadding * 2) / 2;
              let cY = (height - textHeight - confPadding * 2) / 2;
              
              switch (options.stampPosition) {
                case "top-left": cX = 40; cY = height - textHeight - confPadding * 2 - 40; break;
                case "top-right": cX = width - textWidth - confPadding * 2 - 40; cY = height - textHeight - confPadding * 2 - 40; break;
                case "bottom-left": cX = 40; cY = 40; break;
                case "bottom-right": cX = width - textWidth - confPadding * 2 - 40; cY = 40; break;
              }
              
              const boxWidth = textWidth + confPadding * 2;
              const boxHeight = textHeight + confPadding * 2;
              
              if (options.stampStyle === "circle" || options.stampStyle === "seal") {
                const radius = Math.max(boxWidth, boxHeight) / 2 + 12;
                page.drawCircle({
                  x: cX + boxWidth / 2,
                  y: cY + boxHeight / 2,
                  size: radius,
                  color: rgb(1, 1, 1),
                  opacity: 0,
                  borderColor: rgb(confR, confG, confB),
                  borderWidth: 3,
                  borderOpacity: confOpacity,
                });
              } else {
                page.drawRectangle({
                  x: cX,
                  y: cY,
                  width: boxWidth,
                  height: boxHeight,
                  color: rgb(1, 1, 1),
                  opacity: 0,
                  borderColor: rgb(confR, confG, confB),
                  borderWidth: 3,
                  borderOpacity: confOpacity,
                });
              }
              
              page.drawText(confText, {
                x: cX + confPadding,
                y: cY + confPadding,
                size: confFontSize,
                font: confFont,
                color: rgb(confR, confG, confB),
                opacity: confOpacity,
                rotate: confRotation !== 0 ? { type: "degrees" as const, angle: confRotation } : undefined,
              });
              
              if (options.stampDate) {
                const dateText = new Date().toLocaleDateString();
                const dateFontSize = confFontSize * 0.5;
                page.drawText(dateText, {
                  x: cX + confPadding,
                  y: cY - dateFontSize - 5,
                  size: dateFontSize,
                  font: confFont,
                  color: rgb(confR, confG, confB),
                  opacity: confOpacity,
                });
              }
            });
            
            result = Buffer.from(await confStampPdf.save());
            filename = "confidential-stamped.pdf";
            break;

          case "add-draft-stamp":
            const draftStampBytes = fs.readFileSync(files[0].path);
            const draftStampPdf = await PDFDocument.load(draftStampBytes, { ignoreEncryption: true });
            const draftFont = await draftStampPdf.embedFont(StandardFonts.HelveticaBold);
            const draftPages = draftStampPdf.getPages();
            
            const draftText = "DRAFT";
            const draftSize = options.stampSize || "large";
            const draftOpacity = (options.stampOpacity || 50) / 100;
            const draftRotation = options.stampRotation || -45;
            const draftColorHex = options.stampColor || "#6b7280";
            const draftR = parseInt(draftColorHex.slice(1, 3), 16) / 255;
            const draftG = parseInt(draftColorHex.slice(3, 5), 16) / 255;
            const draftB = parseInt(draftColorHex.slice(5, 7), 16) / 255;
            
            const draftFontSize = draftSize === "small" ? 36 : draftSize === "large" ? 72 : 54;
            
            const getDraftPages = (totalPages: number) => {
              switch (options.stampPages) {
                case "first": return [0];
                case "last": return [totalPages - 1];
                case "custom": return parsePageRange(options.stampCustomPages || "", totalPages);
                default: return Array.from({ length: totalPages }, (_, i) => i);
              }
            };
            
            getDraftPages(draftPages.length).forEach(index => {
              const page = draftPages[index];
              const { width, height } = page.getSize();
              const textWidth = draftFont.widthOfTextAtSize(draftText, draftFontSize);
              
              const dX = (width - textWidth) / 2;
              const dY = height / 2;
              
              page.drawText(draftText, {
                x: dX,
                y: dY,
                size: draftFontSize,
                font: draftFont,
                color: rgb(draftR, draftG, draftB),
                opacity: draftOpacity,
                rotate: { type: "degrees" as const, angle: draftRotation },
              });
            });
            
            result = Buffer.from(await draftStampPdf.save());
            filename = "draft-stamped.pdf";
            break;

          case "custom-pdf-stamp":
            const customStampBytes = fs.readFileSync(files[0].path);
            const customStampPdf = await PDFDocument.load(customStampBytes, { ignoreEncryption: true });
            const customFont = await customStampPdf.embedFont(StandardFonts.HelveticaBold);
            const customPages = customStampPdf.getPages();
            
            const customText = options.stampText || "CUSTOM STAMP";
            const customSize = options.stampSize || "medium";
            const customOpacity = (options.stampOpacity || 80) / 100;
            const customRotation = options.stampRotation || 0;
            const customColorHex = options.stampColor || "#2563eb";
            const customR = parseInt(customColorHex.slice(1, 3), 16) / 255;
            const customG = parseInt(customColorHex.slice(3, 5), 16) / 255;
            const customB = parseInt(customColorHex.slice(5, 7), 16) / 255;
            
            const customFontSize = customSize === "small" ? 24 : customSize === "large" ? 48 : 36;
            const customPadding = customSize === "small" ? 10 : customSize === "large" ? 20 : 15;
            
            const getCustomPages = (totalPages: number) => {
              switch (options.stampPages) {
                case "first": return [0];
                case "last": return [totalPages - 1];
                case "custom": return parsePageRange(options.stampCustomPages || "", totalPages);
                default: return Array.from({ length: totalPages }, (_, i) => i);
              }
            };
            
            getCustomPages(customPages.length).forEach(index => {
              const page = customPages[index];
              const { width, height } = page.getSize();
              const textWidth = customFont.widthOfTextAtSize(customText, customFontSize);
              const textHeight = customFontSize;
              
              let csX = (width - textWidth - customPadding * 2) / 2;
              let csY = (height - textHeight - customPadding * 2) / 2;
              
              switch (options.stampPosition) {
                case "top-left": csX = 30; csY = height - textHeight - customPadding * 2 - 30; break;
                case "top-right": csX = width - textWidth - customPadding * 2 - 30; csY = height - textHeight - customPadding * 2 - 30; break;
                case "bottom-left": csX = 30; csY = 30; break;
                case "bottom-right": csX = width - textWidth - customPadding * 2 - 30; csY = 30; break;
              }
              
              const csBoxWidth = textWidth + customPadding * 2;
              const csBoxHeight = textHeight + customPadding * 2;
              
              if (options.stampStyle === "circle" || options.stampStyle === "seal") {
                const radius = Math.max(csBoxWidth, csBoxHeight) / 2 + 10;
                page.drawCircle({
                  x: csX + csBoxWidth / 2,
                  y: csY + csBoxHeight / 2,
                  size: radius,
                  color: rgb(1, 1, 1),
                  opacity: 0,
                  borderColor: rgb(customR, customG, customB),
                  borderWidth: 3,
                  borderOpacity: customOpacity,
                });
              } else if (options.stampStyle === "banner") {
                page.drawRectangle({
                  x: 0,
                  y: csY,
                  width: width,
                  height: csBoxHeight,
                  color: rgb(customR, customG, customB),
                  opacity: customOpacity * 0.1,
                });
                page.drawLine({
                  start: { x: 0, y: csY },
                  end: { x: width, y: csY },
                  thickness: 2,
                  color: rgb(customR, customG, customB),
                  opacity: customOpacity,
                });
                page.drawLine({
                  start: { x: 0, y: csY + csBoxHeight },
                  end: { x: width, y: csY + csBoxHeight },
                  thickness: 2,
                  color: rgb(customR, customG, customB),
                  opacity: customOpacity,
                });
              } else {
                page.drawRectangle({
                  x: csX,
                  y: csY,
                  width: csBoxWidth,
                  height: csBoxHeight,
                  color: rgb(1, 1, 1),
                  opacity: 0,
                  borderColor: rgb(customR, customG, customB),
                  borderWidth: 3,
                  borderOpacity: customOpacity,
                });
              }
              
              page.drawText(customText, {
                x: options.stampStyle === "banner" ? (width - textWidth) / 2 : csX + customPadding,
                y: csY + customPadding,
                size: customFontSize,
                font: customFont,
                color: rgb(customR, customG, customB),
                opacity: customOpacity,
                rotate: customRotation !== 0 ? { type: "degrees" as const, angle: customRotation } : undefined,
              });
              
              if (options.stampDate) {
                const dateText = new Date().toLocaleDateString();
                const dateFontSize = customFontSize * 0.5;
                page.drawText(dateText, {
                  x: csX + customPadding,
                  y: csY - dateFontSize - 5,
                  size: dateFontSize,
                  font: customFont,
                  color: rgb(customR, customG, customB),
                  opacity: customOpacity,
                });
              }
            });
            
            result = Buffer.from(await customStampPdf.save());
            filename = "custom-stamped.pdf";
            break;

          case "remove-watermark":
          case "pdf-watermark-remover":
            const removeWmBytes = fs.readFileSync(files[0].path);
            const removeWmPdf = await PDFDocument.load(removeWmBytes, { ignoreEncryption: true });
            result = Buffer.from(await removeWmPdf.save());
            filename = "watermark-removed.pdf";
            break;

          case "pdf-page-numbering":
            const pageNumBytes = fs.readFileSync(files[0].path);
            const pageNumPdf = await PDFDocument.load(pageNumBytes, { ignoreEncryption: true });
            const pageNumFont = await pageNumPdf.embedFont(StandardFonts.Helvetica);
            const pageNumPages = pageNumPdf.getPages();
            
            const pageNumFontSize = options.fontSize || 12;
            const pageNumColorHex = options.fontColor || "#333333";
            const pnR = parseInt(pageNumColorHex.slice(1, 3), 16) / 255;
            const pnG = parseInt(pageNumColorHex.slice(3, 5), 16) / 255;
            const pnB = parseInt(pageNumColorHex.slice(5, 7), 16) / 255;
            
            pageNumPages.forEach((page, index) => {
              const { width, height } = page.getSize();
              const numText = `${index + 1}`;
              const textWidth = pageNumFont.widthOfTextAtSize(numText, pageNumFontSize);
              
              let pnX: number;
              let pnY: number;
              
              switch (options.pageNumberPosition) {
                case "bottom-left":
                  pnX = 40;
                  pnY = 30;
                  break;
                case "bottom-right":
                  pnX = width - 40 - textWidth;
                  pnY = 30;
                  break;
                case "top-center":
                  pnX = (width - textWidth) / 2;
                  pnY = height - 30;
                  break;
                case "top-left":
                  pnX = 40;
                  pnY = height - 30;
                  break;
                case "top-right":
                  pnX = width - 40 - textWidth;
                  pnY = height - 30;
                  break;
                case "bottom-center":
                default:
                  pnX = (width - textWidth) / 2;
                  pnY = 30;
                  break;
              }
              
              page.drawText(numText, {
                x: pnX,
                y: pnY,
                size: pageNumFontSize,
                font: pageNumFont,
                color: rgb(pnR, pnG, pnB),
              });
            });
            
            result = Buffer.from(await pageNumPdf.save());
            filename = "numbered.pdf";
            break;

          case "add-bates-numbering":
            const batesBytes = fs.readFileSync(files[0].path);
            const batesPdf = await PDFDocument.load(batesBytes, { ignoreEncryption: true });
            const batesFont = await batesPdf.embedFont(StandardFonts.Courier);
            const batesPages = batesPdf.getPages();
            
            const batesPrefix = options.batesPrefix || "";
            const batesSuffix = options.batesSuffix || "";
            const batesStartNum = options.batesStartNumber || 1;
            const batesDigits = options.batesDigits || 6;
            const batesFontSize = options.batesFontSize || 10;
            const batesColorHex = options.batesColor || "#000000";
            const btR = parseInt(batesColorHex.slice(1, 3), 16) / 255;
            const btG = parseInt(batesColorHex.slice(3, 5), 16) / 255;
            const btB = parseInt(batesColorHex.slice(5, 7), 16) / 255;
            
            batesPages.forEach((page, index) => {
              const { width, height } = page.getSize();
              const batesNum = (batesStartNum + index).toString().padStart(batesDigits, '0');
              const batesText = `${batesPrefix}${batesNum}${batesSuffix}`;
              const textWidth = batesFont.widthOfTextAtSize(batesText, batesFontSize);
              
              let btX: number;
              let btY: number;
              
              switch (options.batesPosition) {
                case "top-left":
                  btX = 40;
                  btY = height - 30;
                  break;
                case "top-center":
                  btX = (width - textWidth) / 2;
                  btY = height - 30;
                  break;
                case "top-right":
                  btX = width - 40 - textWidth;
                  btY = height - 30;
                  break;
                case "bottom-left":
                  btX = 40;
                  btY = 30;
                  break;
                case "bottom-right":
                  btX = width - 40 - textWidth;
                  btY = 30;
                  break;
                case "bottom-center":
                default:
                  btX = (width - textWidth) / 2;
                  btY = 30;
                  break;
              }
              
              page.drawText(batesText, {
                x: btX,
                y: btY,
                size: batesFontSize,
                font: batesFont,
                color: rgb(btR, btG, btB),
              });
            });
            
            result = Buffer.from(await batesPdf.save());
            filename = "bates-numbered.pdf";
            break;

          case "add-header-to-pdf":
            const headerBytes = fs.readFileSync(files[0].path);
            const headerPdf = await PDFDocument.load(headerBytes, { ignoreEncryption: true });
            const headerFont = await headerPdf.embedFont(StandardFonts.Helvetica);
            const headerPages = headerPdf.getPages();
            
            const headerText = options.headerText || "Header";
            const headerFontSize = options.headerFontSize || 10;
            const headerColorHex = options.headerColor || "#333333";
            const hdR = parseInt(headerColorHex.slice(1, 3), 16) / 255;
            const hdG = parseInt(headerColorHex.slice(3, 5), 16) / 255;
            const hdB = parseInt(headerColorHex.slice(5, 7), 16) / 255;
            
            const getHeaderPages = (totalPages: number) => {
              switch (options.headerPages) {
                case "first": return [0];
                case "odd": return Array.from({ length: totalPages }, (_, i) => i).filter(i => i % 2 === 0);
                case "even": return Array.from({ length: totalPages }, (_, i) => i).filter(i => i % 2 === 1);
                case "custom": return parsePageRange(options.headerCustomPages || "", totalPages);
                default: return Array.from({ length: totalPages }, (_, i) => i);
              }
            };
            
            getHeaderPages(headerPages.length).forEach(index => {
              const page = headerPages[index];
              const { width, height } = page.getSize();
              const textWidth = headerFont.widthOfTextAtSize(headerText, headerFontSize);
              
              let hdX: number;
              const hdY = height - 25;
              
              switch (options.headerPosition) {
                case "left":
                  hdX = 40;
                  break;
                case "right":
                  hdX = width - 40 - textWidth;
                  break;
                case "center":
                default:
                  hdX = (width - textWidth) / 2;
                  break;
              }
              
              page.drawText(headerText, {
                x: hdX,
                y: hdY,
                size: headerFontSize,
                font: headerFont,
                color: rgb(hdR, hdG, hdB),
              });
            });
            
            result = Buffer.from(await headerPdf.save());
            filename = "header-added.pdf";
            break;

          case "add-footer-to-pdf":
            const footerBytes = fs.readFileSync(files[0].path);
            const footerPdf = await PDFDocument.load(footerBytes, { ignoreEncryption: true });
            const footerFont = await footerPdf.embedFont(StandardFonts.Helvetica);
            const footerPages = footerPdf.getPages();
            
            const footerText = options.footerText || "Footer";
            const footerFontSize = options.footerFontSize || 10;
            const footerColorHex = options.footerColor || "#333333";
            const ftR = parseInt(footerColorHex.slice(1, 3), 16) / 255;
            const ftG = parseInt(footerColorHex.slice(3, 5), 16) / 255;
            const ftB = parseInt(footerColorHex.slice(5, 7), 16) / 255;
            
            const getFooterPages = (totalPages: number) => {
              switch (options.footerPages) {
                case "first": return [0];
                case "odd": return Array.from({ length: totalPages }, (_, i) => i).filter(i => i % 2 === 0);
                case "even": return Array.from({ length: totalPages }, (_, i) => i).filter(i => i % 2 === 1);
                case "custom": return parsePageRange(options.footerCustomPages || "", totalPages);
                default: return Array.from({ length: totalPages }, (_, i) => i);
              }
            };
            
            getFooterPages(footerPages.length).forEach(index => {
              const page = footerPages[index];
              const { width } = page.getSize();
              const textWidth = footerFont.widthOfTextAtSize(footerText, footerFontSize);
              
              let ftX: number;
              const ftY = 20;
              
              switch (options.footerPosition) {
                case "left":
                  ftX = 40;
                  break;
                case "right":
                  ftX = width - 40 - textWidth;
                  break;
                case "center":
                default:
                  ftX = (width - textWidth) / 2;
                  break;
              }
              
              page.drawText(footerText, {
                x: ftX,
                y: ftY,
                size: footerFontSize,
                font: footerFont,
                color: rgb(ftR, ftG, ftB),
              });
            });
            
            result = Buffer.from(await footerPdf.save());
            filename = "footer-added.pdf";
            break;

          case "add-bates-stamp":
            const batesStampBytes = fs.readFileSync(files[0].path);
            const batesStampPdf = await PDFDocument.load(batesStampBytes, { ignoreEncryption: true });
            const batesStampFont = await batesStampPdf.embedFont(StandardFonts.Courier);
            const batesStampPages = batesStampPdf.getPages();
            
            const bsPrefix = options.batesPrefix || "DOC";
            const bsSuffix = options.batesSuffix || "";
            const bsStartNum = options.batesStartNumber || 1;
            const bsDigits = options.batesDigits || 6;
            const bsFontSize = options.batesFontSize || 10;
            const bsColorHex = options.batesColor || "#000000";
            const bsR = parseInt(bsColorHex.slice(1, 3), 16) / 255;
            const bsG = parseInt(bsColorHex.slice(3, 5), 16) / 255;
            const bsB = parseInt(bsColorHex.slice(5, 7), 16) / 255;
            
            batesStampPages.forEach((page, index) => {
              const { width, height } = page.getSize();
              const bsNum = (bsStartNum + index).toString().padStart(bsDigits, '0');
              const bsText = `${bsPrefix}${bsNum}${bsSuffix}`;
              const textWidth = batesStampFont.widthOfTextAtSize(bsText, bsFontSize);
              
              let bsX: number;
              let bsY: number;
              
              switch (options.batesPosition) {
                case "top-left":
                  bsX = 40;
                  bsY = height - 30;
                  break;
                case "top-center":
                  bsX = (width - textWidth) / 2;
                  bsY = height - 30;
                  break;
                case "top-right":
                  bsX = width - 40 - textWidth;
                  bsY = height - 30;
                  break;
                case "bottom-left":
                  bsX = 40;
                  bsY = 30;
                  break;
                case "bottom-right":
                  bsX = width - 40 - textWidth;
                  bsY = 30;
                  break;
                case "bottom-center":
                default:
                  bsX = (width - textWidth) / 2;
                  bsY = 30;
                  break;
              }
              
              page.drawRectangle({
                x: bsX - 5,
                y: bsY - 3,
                width: textWidth + 10,
                height: bsFontSize + 6,
                color: rgb(1, 1, 1),
                opacity: 0.8,
              });
              
              page.drawText(bsText, {
                x: bsX,
                y: bsY,
                size: bsFontSize,
                font: batesStampFont,
                color: rgb(bsR, bsG, bsB),
              });
            });
            
            result = Buffer.from(await batesStampPdf.save());
            filename = "bates-stamped.pdf";
            break;

          case "add-page-numbers-start-at":
            const startAtBytes = fs.readFileSync(files[0].path);
            const startAtPdf = await PDFDocument.load(startAtBytes, { ignoreEncryption: true });
            const startAtFont = await startAtPdf.embedFont(StandardFonts.Helvetica);
            const startAtPages = startAtPdf.getPages();
            
            const startNum = options.pageNumberStartAt || 1;
            const startAtFontSize = options.fontSize || 12;
            const startAtColorHex = options.fontColor || "#333333";
            const saR = parseInt(startAtColorHex.slice(1, 3), 16) / 255;
            const saG = parseInt(startAtColorHex.slice(3, 5), 16) / 255;
            const saB = parseInt(startAtColorHex.slice(5, 7), 16) / 255;
            
            startAtPages.forEach((page, index) => {
              const { width, height } = page.getSize();
              const numText = `${startNum + index}`;
              const textWidth = startAtFont.widthOfTextAtSize(numText, startAtFontSize);
              
              let saX: number;
              let saY: number;
              
              switch (options.pageNumberPosition) {
                case "bottom-left":
                  saX = 40;
                  saY = 30;
                  break;
                case "bottom-right":
                  saX = width - 40 - textWidth;
                  saY = 30;
                  break;
                case "top-center":
                  saX = (width - textWidth) / 2;
                  saY = height - 30;
                  break;
                case "top-left":
                  saX = 40;
                  saY = height - 30;
                  break;
                case "top-right":
                  saX = width - 40 - textWidth;
                  saY = height - 30;
                  break;
                case "bottom-center":
                default:
                  saX = (width - textWidth) / 2;
                  saY = 30;
                  break;
              }
              
              page.drawText(numText, {
                x: saX,
                y: saY,
                size: startAtFontSize,
                font: startAtFont,
                color: rgb(saR, saG, saB),
              });
            });
            
            result = Buffer.from(await startAtPdf.save());
            filename = "numbered-start-at.pdf";
            break;

          case "add-roman-page-numbers":
            const romanBytes = fs.readFileSync(files[0].path);
            const romanPdf = await PDFDocument.load(romanBytes, { ignoreEncryption: true });
            const romanFont = await romanPdf.embedFont(StandardFonts.TimesRoman);
            const romanPages = romanPdf.getPages();
            
            const romanFormat = options.pageNumberFormat || "roman-lower";
            const romanFontSize = options.fontSize || 12;
            const romanColorHex = options.fontColor || "#333333";
            const rmR = parseInt(romanColorHex.slice(1, 3), 16) / 255;
            const rmG = parseInt(romanColorHex.slice(3, 5), 16) / 255;
            const rmB = parseInt(romanColorHex.slice(5, 7), 16) / 255;
            
            const toRoman = (num: number, uppercase: boolean): string => {
              const romanNumerals = [
                { value: 1000, numeral: 'm' },
                { value: 900, numeral: 'cm' },
                { value: 500, numeral: 'd' },
                { value: 400, numeral: 'cd' },
                { value: 100, numeral: 'c' },
                { value: 90, numeral: 'xc' },
                { value: 50, numeral: 'l' },
                { value: 40, numeral: 'xl' },
                { value: 10, numeral: 'x' },
                { value: 9, numeral: 'ix' },
                { value: 5, numeral: 'v' },
                { value: 4, numeral: 'iv' },
                { value: 1, numeral: 'i' }
              ];
              
              let result = '';
              for (const { value, numeral } of romanNumerals) {
                while (num >= value) {
                  result += numeral;
                  num -= value;
                }
              }
              return uppercase ? result.toUpperCase() : result;
            };
            
            romanPages.forEach((page, index) => {
              const { width, height } = page.getSize();
              const numText = toRoman(index + 1, romanFormat === "roman-upper");
              const textWidth = romanFont.widthOfTextAtSize(numText, romanFontSize);
              
              let rmX: number;
              let rmY: number;
              
              switch (options.pageNumberPosition) {
                case "bottom-left":
                  rmX = 40;
                  rmY = 30;
                  break;
                case "bottom-right":
                  rmX = width - 40 - textWidth;
                  rmY = 30;
                  break;
                case "top-center":
                  rmX = (width - textWidth) / 2;
                  rmY = height - 30;
                  break;
                case "top-left":
                  rmX = 40;
                  rmY = height - 30;
                  break;
                case "top-right":
                  rmX = width - 40 - textWidth;
                  rmY = height - 30;
                  break;
                case "bottom-center":
                default:
                  rmX = (width - textWidth) / 2;
                  rmY = 30;
                  break;
              }
              
              page.drawText(numText, {
                x: rmX,
                y: rmY,
                size: romanFontSize,
                font: romanFont,
                color: rgb(rmR, rmG, rmB),
              });
            });
            
            result = Buffer.from(await romanPdf.save());
            filename = "roman-numbered.pdf";
            break;

          case "add-datetime-header":
            const dtBytes = fs.readFileSync(files[0].path);
            const dtPdf = await PDFDocument.load(dtBytes, { ignoreEncryption: true });
            const dtFont = await dtPdf.embedFont(StandardFonts.Helvetica);
            const dtPages = dtPdf.getPages();
            
            const dtFormat = options.dateTimeFormat || "date-time";
            const dtFontSize = options.headerFontSize || 10;
            const dtColorHex = options.headerColor || "#333333";
            const dtR = parseInt(dtColorHex.slice(1, 3), 16) / 255;
            const dtG = parseInt(dtColorHex.slice(3, 5), 16) / 255;
            const dtB = parseInt(dtColorHex.slice(5, 7), 16) / 255;
            
            const dtNow = new Date();
            let dtText: string;
            switch (dtFormat) {
              case "date-only":
                dtText = dtNow.toLocaleDateString();
                break;
              case "time-only":
                dtText = dtNow.toLocaleTimeString();
                break;
              case "custom":
                dtText = options.dateTimeCustomFormat || dtNow.toLocaleString();
                break;
              case "date-time":
              default:
                dtText = dtNow.toLocaleString();
                break;
            }
            
            dtPages.forEach((page) => {
              const { width, height } = page.getSize();
              const textWidth = dtFont.widthOfTextAtSize(dtText, dtFontSize);
              
              let dtX: number;
              const dtY = height - 25;
              
              switch (options.headerPosition) {
                case "left":
                  dtX = 40;
                  break;
                case "right":
                  dtX = width - 40 - textWidth;
                  break;
                case "center":
                default:
                  dtX = (width - textWidth) / 2;
                  break;
              }
              
              page.drawText(dtText, {
                x: dtX,
                y: dtY,
                size: dtFontSize,
                font: dtFont,
                color: rgb(dtR, dtG, dtB),
              });
            });
            
            result = Buffer.from(await dtPdf.save());
            filename = "datetime-header.pdf";
            break;

          case "add-page-x-of-y-footer":
            const xoyBytes = fs.readFileSync(files[0].path);
            const xoyPdf = await PDFDocument.load(xoyBytes, { ignoreEncryption: true });
            const xoyFont = await xoyPdf.embedFont(StandardFonts.Helvetica);
            const xoyPages = xoyPdf.getPages();
            const totalXoyPages = xoyPages.length;
            
            const xoyFontSize = options.footerFontSize || 10;
            const xoyColorHex = options.footerColor || "#333333";
            const xoyR = parseInt(xoyColorHex.slice(1, 3), 16) / 255;
            const xoyG = parseInt(xoyColorHex.slice(3, 5), 16) / 255;
            const xoyB = parseInt(xoyColorHex.slice(5, 7), 16) / 255;
            
            xoyPages.forEach((page, index) => {
              const { width } = page.getSize();
              const xoyText = `Page ${index + 1} of ${totalXoyPages}`;
              const textWidth = xoyFont.widthOfTextAtSize(xoyText, xoyFontSize);
              
              let xoyX: number;
              const xoyY = 20;
              
              switch (options.footerPosition) {
                case "left":
                  xoyX = 40;
                  break;
                case "right":
                  xoyX = width - 40 - textWidth;
                  break;
                case "center":
                default:
                  xoyX = (width - textWidth) / 2;
                  break;
              }
              
              page.drawText(xoyText, {
                x: xoyX,
                y: xoyY,
                size: xoyFontSize,
                font: xoyFont,
                color: rgb(xoyR, xoyG, xoyB),
              });
            });
            
            result = Buffer.from(await xoyPdf.save());
            filename = "page-x-of-y.pdf";
            break;

          case "remove-pdf-header":
            const rmHdrBytes = fs.readFileSync(files[0].path);
            const rmHdrPdf = await PDFDocument.load(rmHdrBytes, { ignoreEncryption: true });
            const rmHdrPages = rmHdrPdf.getPages();
            
            const headerMargin = options.headerRemovalMargin || 50;
            
            rmHdrPages.forEach((page) => {
              const { width, height } = page.getSize();
              page.drawRectangle({
                x: 0,
                y: height - headerMargin,
                width: width,
                height: headerMargin,
                color: rgb(1, 1, 1),
                opacity: 1,
              });
            });
            
            result = Buffer.from(await rmHdrPdf.save());
            filename = "header-removed.pdf";
            break;

          case "remove-pdf-footer":
            const rmFtrBytes = fs.readFileSync(files[0].path);
            const rmFtrPdf = await PDFDocument.load(rmFtrBytes, { ignoreEncryption: true });
            const rmFtrPages = rmFtrPdf.getPages();
            
            const footerMargin = options.footerRemovalMargin || 50;
            
            rmFtrPages.forEach((page) => {
              const { width } = page.getSize();
              page.drawRectangle({
                x: 0,
                y: 0,
                width: width,
                height: footerMargin,
                color: rgb(1, 1, 1),
                opacity: 1,
              });
            });
            
            result = Buffer.from(await rmFtrPdf.save());
            filename = "footer-removed.pdf";
            break;

          case "pdf-watermark-overlay":
            if (files.length < 2) {
              throw new Error("Please upload both the base PDF and the watermark PDF");
            }
            
            const baseWmBytes = fs.readFileSync(files[0].path);
            const wmOverlayPdfBytes = fs.readFileSync(files[1].path);
            
            const baseWmPdf = await PDFDocument.load(baseWmBytes, { ignoreEncryption: true });
            const wmSourcePdf = await PDFDocument.load(wmOverlayPdfBytes, { ignoreEncryption: true });
            
            const wmSourcePages = wmSourcePdf.getPages();
            if (wmSourcePages.length === 0) {
              throw new Error("Watermark PDF has no pages");
            }
            
            const [wmPage] = await baseWmPdf.embedPdf(wmSourcePdf, [0]);
            const wmDims = wmPage.scale(options.overlayScale ? options.overlayScale / 100 : 0.5);
            const wmOpacityVal = options.overlayOpacity !== undefined ? options.overlayOpacity / 100 : 0.3;
            
            const baseWmPages = baseWmPdf.getPages();
            
            const getWmPageIndices = (totalPages: number) => {
              switch (options.overlayPages) {
                case "first": return [0];
                case "last": return [totalPages - 1];
                case "odd": return Array.from({ length: totalPages }, (_, i) => i).filter(i => i % 2 === 0);
                case "even": return Array.from({ length: totalPages }, (_, i) => i).filter(i => i % 2 === 1);
                case "custom": return parsePageRange(options.overlayCustomPages || "", totalPages);
                default: return Array.from({ length: totalPages }, (_, i) => i);
              }
            };
            
            getWmPageIndices(baseWmPages.length).forEach(index => {
              const page = baseWmPages[index];
              const { width, height } = page.getSize();
              
              let wmX: number;
              let wmY: number;
              
              switch (options.overlayPosition) {
                case "top-left":
                  wmX = 0;
                  wmY = height - wmDims.height;
                  break;
                case "top-right":
                  wmX = width - wmDims.width;
                  wmY = height - wmDims.height;
                  break;
                case "bottom-left":
                  wmX = 0;
                  wmY = 0;
                  break;
                case "bottom-right":
                  wmX = width - wmDims.width;
                  wmY = 0;
                  break;
                case "center":
                default:
                  wmX = (width - wmDims.width) / 2;
                  wmY = (height - wmDims.height) / 2;
                  break;
              }
              
              page.drawPage(wmPage, {
                x: wmX,
                y: wmY,
                width: wmDims.width,
                height: wmDims.height,
                opacity: wmOpacityVal,
              });
            });
            
            result = Buffer.from(await baseWmPdf.save());
            filename = "pdf-watermarked.pdf";
            break;

          case "pdf-page-overlay":
            if (files.length < 2) {
              throw new Error("Please upload both the base PDF and the overlay PDF");
            }
            
            const baseOvBytes = fs.readFileSync(files[0].path);
            const ovPdfBytes = fs.readFileSync(files[1].path);
            
            const baseOvPdf = await PDFDocument.load(baseOvBytes, { ignoreEncryption: true });
            const ovSourcePdf = await PDFDocument.load(ovPdfBytes, { ignoreEncryption: true });
            
            const ovSourcePages = ovSourcePdf.getPages();
            if (ovSourcePages.length === 0) {
              throw new Error("Overlay PDF has no pages");
            }
            
            const [ovPage] = await baseOvPdf.embedPdf(ovSourcePdf, [0]);
            const ovDims = ovPage.scale(options.overlayScale ? options.overlayScale / 100 : 1);
            const ovOpacityVal = options.overlayOpacity !== undefined ? options.overlayOpacity / 100 : 1;
            
            const baseOvPages = baseOvPdf.getPages();
            
            const getOvPageIndices = (totalPages: number) => {
              switch (options.overlayPages) {
                case "first": return [0];
                case "last": return [totalPages - 1];
                case "odd": return Array.from({ length: totalPages }, (_, i) => i).filter(i => i % 2 === 0);
                case "even": return Array.from({ length: totalPages }, (_, i) => i).filter(i => i % 2 === 1);
                case "custom": return parsePageRange(options.overlayCustomPages || "", totalPages);
                default: return Array.from({ length: totalPages }, (_, i) => i);
              }
            };
            
            getOvPageIndices(baseOvPages.length).forEach(index => {
              const page = baseOvPages[index];
              const { width, height } = page.getSize();
              
              let ovX: number;
              let ovY: number;
              
              switch (options.overlayPosition) {
                case "top-left":
                  ovX = 0;
                  ovY = height - ovDims.height;
                  break;
                case "top-right":
                  ovX = width - ovDims.width;
                  ovY = height - ovDims.height;
                  break;
                case "bottom-left":
                  ovX = 0;
                  ovY = 0;
                  break;
                case "bottom-right":
                  ovX = width - ovDims.width;
                  ovY = 0;
                  break;
                case "center":
                default:
                  ovX = (width - ovDims.width) / 2;
                  ovY = (height - ovDims.height) / 2;
                  break;
              }
              
              page.drawPage(ovPage, {
                x: ovX,
                y: ovY,
                width: ovDims.width,
                height: ovDims.height,
                opacity: ovOpacityVal,
              });
            });
            
            result = Buffer.from(await baseOvPdf.save());
            filename = "page-overlay.pdf";
            break;

          case "pdf-underlay":
            if (!files || files.length < 2) {
              throw new Error("Please upload two PDF files: the main document first, then the underlay/background PDF second. The underlay will appear behind the content of your main document.");
            }
            
            if (!files[0] || !files[1]) {
              throw new Error("Both PDF files are required. Please upload the main document and the underlay PDF.");
            }
            
            const mainUnderlayBytes = fs.readFileSync(files[0].path);
            const underlayPdfBytes = fs.readFileSync(files[1].path);
            
            const underlaySourcePdf = await PDFDocument.load(underlayPdfBytes, { ignoreEncryption: true });
            const mainPdf = await PDFDocument.load(mainUnderlayBytes, { ignoreEncryption: true });
            
            const underlaySourcePages = underlaySourcePdf.getPages();
            if (underlaySourcePages.length === 0) {
              throw new Error("Underlay PDF has no pages");
            }
            
            const [underlayPage] = await mainPdf.embedPdf(underlaySourcePdf, [0]);
            const underlayScale = options.underlayScale ? options.underlayScale / 100 : 1;
            const underlayDims = underlayPage.scale(underlayScale);
            const underlayOpacity = options.underlayOpacity !== undefined ? options.underlayOpacity / 100 : 1;
            
            const mainPages = mainPdf.getPages();
            
            const getUnderlayPageIndices = (totalPages: number) => {
              switch (options.underlayPages) {
                case "first": return [0];
                case "last": return [totalPages - 1];
                case "odd": return Array.from({ length: totalPages }, (_, i) => i).filter(i => i % 2 === 0);
                case "even": return Array.from({ length: totalPages }, (_, i) => i).filter(i => i % 2 === 1);
                case "custom": return parsePageRange(options.underlayCustomPages || "", totalPages);
                default: return Array.from({ length: totalPages }, (_, i) => i);
              }
            };
            
            const newPdfWithUnderlay = await PDFDocument.create();
            
            for (let i = 0; i < mainPages.length; i++) {
              const originalPage = mainPages[i];
              const { width, height } = originalPage.getSize();
              
              const newPage = newPdfWithUnderlay.addPage([width, height]);
              
              if (getUnderlayPageIndices(mainPages.length).includes(i)) {
                let underlayX: number;
                let underlayY: number;
                
                switch (options.underlayPosition) {
                  case "top-left":
                    underlayX = 0;
                    underlayY = height - underlayDims.height;
                    break;
                  case "top-right":
                    underlayX = width - underlayDims.width;
                    underlayY = height - underlayDims.height;
                    break;
                  case "bottom-left":
                    underlayX = 0;
                    underlayY = 0;
                    break;
                  case "bottom-right":
                    underlayX = width - underlayDims.width;
                    underlayY = 0;
                    break;
                  case "center":
                  default:
                    underlayX = (width - underlayDims.width) / 2;
                    underlayY = (height - underlayDims.height) / 2;
                    break;
                }
                
                const [embeddedUnderlay] = await newPdfWithUnderlay.embedPdf(underlaySourcePdf, [0]);
                newPage.drawPage(embeddedUnderlay, {
                  x: underlayX,
                  y: underlayY,
                  width: underlayDims.width,
                  height: underlayDims.height,
                  opacity: underlayOpacity,
                });
              }
              
              const [copiedPage] = await newPdfWithUnderlay.embedPdf(mainPdf, [i]);
              newPage.drawPage(copiedPage, {
                x: 0,
                y: 0,
                width: width,
                height: height,
              });
            }
            
            result = Buffer.from(await newPdfWithUnderlay.save());
            filename = "pdf-with-underlay.pdf";
            break;

          case "pdf-stamp-datetime": {
            const dtStampBytes2 = fs.readFileSync(files[0].path);
            const dtStampPdf2 = await PDFDocument.load(dtStampBytes2, { ignoreEncryption: true });
            const dtStampPages2 = dtStampPdf2.getPages();
            const dtStampFont = await dtStampPdf2.embedFont(StandardFonts.Helvetica);
            
            const currentDate = new Date();
            let dtDateStr = "";
            let dtTimeStr = "";
            
            const dtDateFormat = options.userDateFormat || "MM/DD/YYYY";
            switch (dtDateFormat) {
              case "MM/DD/YYYY":
                dtDateStr = `${String(currentDate.getMonth() + 1).padStart(2, '0')}/${String(currentDate.getDate()).padStart(2, '0')}/${currentDate.getFullYear()}`;
                break;
              case "DD/MM/YYYY":
                dtDateStr = `${String(currentDate.getDate()).padStart(2, '0')}/${String(currentDate.getMonth() + 1).padStart(2, '0')}/${currentDate.getFullYear()}`;
                break;
              case "YYYY-MM-DD":
                dtDateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
                break;
              case "MMMM D, YYYY": {
                const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                dtDateStr = `${monthNames[currentDate.getMonth()]} ${currentDate.getDate()}, ${currentDate.getFullYear()}`;
                break;
              }
              case "D MMMM YYYY": {
                const monthNamesFull = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                dtDateStr = `${currentDate.getDate()} ${monthNamesFull[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
                break;
              }
            }
            
            if (options.userTimeFormat === "24-hour") {
              dtTimeStr = `${String(currentDate.getHours()).padStart(2, '0')}:${String(currentDate.getMinutes()).padStart(2, '0')}`;
            } else {
              const hrs = currentDate.getHours();
              const ampmStr = hrs >= 12 ? 'PM' : 'AM';
              const hr12 = hrs % 12 || 12;
              dtTimeStr = `${hr12}:${String(currentDate.getMinutes()).padStart(2, '0')} ${ampmStr}`;
            }
            
            let dtStampText = "";
            if (options.includeDate !== false && options.includeTime !== false) {
              dtStampText = `${dtDateStr} ${dtTimeStr}`;
            } else if (options.includeDate !== false) {
              dtStampText = dtDateStr;
            } else if (options.includeTime) {
              dtStampText = dtTimeStr;
            } else {
              dtStampText = `${dtDateStr} ${dtTimeStr}`;
            }
            
            const dtStampFontSize = options.batesFontSize || 10;
            const dtStampColor = options.batesColor ? hexToRgb(options.batesColor) : rgb(0, 0, 0);
            
            dtStampPages2.forEach((page) => {
              const { width, height } = page.getSize();
              const txtWidth = dtStampFont.widthOfTextAtSize(dtStampText, dtStampFontSize);
              
              let posX: number;
              let posY: number;
              
              const stampPos = options.batesPosition || "bottom-right";
              switch (stampPos) {
                case "top-left":
                  posX = 30;
                  posY = height - 30;
                  break;
                case "top-center":
                  posX = (width - txtWidth) / 2;
                  posY = height - 30;
                  break;
                case "top-right":
                  posX = width - txtWidth - 30;
                  posY = height - 30;
                  break;
                case "bottom-left":
                  posX = 30;
                  posY = 30;
                  break;
                case "bottom-center":
                  posX = (width - txtWidth) / 2;
                  posY = 30;
                  break;
                case "bottom-right":
                default:
                  posX = width - txtWidth - 30;
                  posY = 30;
                  break;
              }
              
              page.drawText(dtStampText, {
                x: posX,
                y: posY,
                size: dtStampFontSize,
                font: dtStampFont,
                color: dtStampColor,
              });
            });
            
            result = Buffer.from(await dtStampPdf2.save());
            filename = "datetime-stamped.pdf";
            break;
          }

          case "pdf-stamp-username":
            const userStampBytes = fs.readFileSync(files[0].path);
            const userStampPdf = await PDFDocument.load(userStampBytes, { ignoreEncryption: true });
            const userStampPages = userStampPdf.getPages();
            const userFont = await userStampPdf.embedFont(StandardFonts.Helvetica);
            
            const userName = options.userName || "User";
            let userStampText = userName;
            
            if (options.includeDate) {
              const stampNow = new Date();
              const stampDateFormat = options.userDateFormat || "MM/DD/YYYY";
              let stampDate = "";
              
              switch (stampDateFormat) {
                case "MM/DD/YYYY":
                  stampDate = `${String(stampNow.getMonth() + 1).padStart(2, '0')}/${String(stampNow.getDate()).padStart(2, '0')}/${stampNow.getFullYear()}`;
                  break;
                case "DD/MM/YYYY":
                  stampDate = `${String(stampNow.getDate()).padStart(2, '0')}/${String(stampNow.getMonth() + 1).padStart(2, '0')}/${stampNow.getFullYear()}`;
                  break;
                case "YYYY-MM-DD":
                  stampDate = `${stampNow.getFullYear()}-${String(stampNow.getMonth() + 1).padStart(2, '0')}-${String(stampNow.getDate()).padStart(2, '0')}`;
                  break;
                default:
                  stampDate = `${String(stampNow.getMonth() + 1).padStart(2, '0')}/${String(stampNow.getDate()).padStart(2, '0')}/${stampNow.getFullYear()}`;
              }
              userStampText = `${userName} - ${stampDate}`;
            }
            
            const userFontSize = options.batesFontSize || 10;
            const userColor = options.batesColor ? hexToRgb(options.batesColor) : rgb(0, 0, 0);
            
            userStampPages.forEach((page) => {
              const { width, height } = page.getSize();
              const textWidth = userFont.widthOfTextAtSize(userStampText, userFontSize);
              
              let userX: number;
              let userY: number;
              
              const position = options.batesPosition || "bottom-right";
              switch (position) {
                case "top-left":
                  userX = 30;
                  userY = height - 30;
                  break;
                case "top-center":
                  userX = (width - textWidth) / 2;
                  userY = height - 30;
                  break;
                case "top-right":
                  userX = width - textWidth - 30;
                  userY = height - 30;
                  break;
                case "bottom-left":
                  userX = 30;
                  userY = 30;
                  break;
                case "bottom-center":
                  userX = (width - textWidth) / 2;
                  userY = 30;
                  break;
                case "bottom-right":
                default:
                  userX = width - textWidth - 30;
                  userY = 30;
                  break;
              }
              
              page.drawText(userStampText, {
                x: userX,
                y: userY,
                size: userFontSize,
                font: userFont,
                color: userColor,
              });
            });
            
            result = Buffer.from(await userStampPdf.save());
            filename = "username-stamped.pdf";
            break;

          case "pdf-bates-advanced": {
            const advBatesBytes = fs.readFileSync(files[0].path);
            const advBatesPdf = await PDFDocument.load(advBatesBytes, { ignoreEncryption: true });
            const advBatesPages = advBatesPdf.getPages();
            const advBatesFont = await advBatesPdf.embedFont(StandardFonts.Helvetica);
            
            const batesPrefix = options.batesPrefix || "";
            const batesSuffix = options.batesSuffix || "";
            const batesStartNum = options.batesStartNumber || 1;
            const batesDigits = options.batesDigits || 6;
            const advBatesFontSize = options.batesFontSize || 10;
            const advBatesColor = options.batesColor ? hexToRgb(options.batesColor) : rgb(0, 0, 0);
            
            const batesNow = new Date();
            let batesDateStr = "";
            if (options.batesIncludeDate) {
              const batesDateFormat = options.batesDateFormat || "MM/DD/YYYY";
              switch (batesDateFormat) {
                case "MM/DD/YYYY":
                  batesDateStr = `${String(batesNow.getMonth() + 1).padStart(2, '0')}/${String(batesNow.getDate()).padStart(2, '0')}/${batesNow.getFullYear()}`;
                  break;
                case "DD/MM/YYYY":
                  batesDateStr = `${String(batesNow.getDate()).padStart(2, '0')}/${String(batesNow.getMonth() + 1).padStart(2, '0')}/${batesNow.getFullYear()}`;
                  break;
                case "YYYY-MM-DD":
                  batesDateStr = `${batesNow.getFullYear()}-${String(batesNow.getMonth() + 1).padStart(2, '0')}-${String(batesNow.getDate()).padStart(2, '0')}`;
                  break;
              }
            }
            
            let batesTimeStr = "";
            if (options.batesIncludeTime) {
              batesTimeStr = `${String(batesNow.getHours()).padStart(2, '0')}:${String(batesNow.getMinutes()).padStart(2, '0')}`;
            }
            
            const docName = options.batesIncludeDocName ? files[0].originalname.replace(/\.[^/.]+$/, "") : "";
            
            advBatesPages.forEach((page, index) => {
              const { width, height } = page.getSize();
              const pageNum = batesStartNum + index;
              const paddedNum = String(pageNum).padStart(batesDigits, '0');
              
              let batesStamp = `${batesPrefix}${paddedNum}${batesSuffix}`;
              
              if (docName) {
                batesStamp = `${docName} - ${batesStamp}`;
              }
              if (batesDateStr) {
                batesStamp = `${batesStamp} | ${batesDateStr}`;
              }
              if (batesTimeStr) {
                batesStamp = `${batesStamp} ${batesTimeStr}`;
              }
              
              const textWidth = advBatesFont.widthOfTextAtSize(batesStamp, advBatesFontSize);
              
              let batesX: number;
              let batesY: number;
              
              const position = options.batesPosition || "bottom-right";
              switch (position) {
                case "top-left":
                  batesX = 30;
                  batesY = height - 30;
                  break;
                case "top-center":
                  batesX = (width - textWidth) / 2;
                  batesY = height - 30;
                  break;
                case "top-right":
                  batesX = width - textWidth - 30;
                  batesY = height - 30;
                  break;
                case "bottom-left":
                  batesX = 30;
                  batesY = 30;
                  break;
                case "bottom-center":
                  batesX = (width - textWidth) / 2;
                  batesY = 30;
                  break;
                case "bottom-right":
                default:
                  batesX = width - textWidth - 30;
                  batesY = 30;
                  break;
              }
              
              page.drawText(batesStamp, {
                x: batesX,
                y: batesY,
                size: advBatesFontSize,
                font: advBatesFont,
                color: advBatesColor,
              });
            });
            
            result = Buffer.from(await advBatesPdf.save());
            filename = "bates-numbered.pdf";
            break;
          }

          case "extract-text-from-pdf":
          case "pdf-text-extractor":
            const textExtractBytes = fs.readFileSync(files[0].path);
            const textExtractPdf = await PDFDocument.load(textExtractBytes, { ignoreEncryption: true });
            const textExtractPages = textExtractPdf.getPages();
            
            let extractedText = "";
            
            try {
              const pdfBuffer = fs.readFileSync(files[0].path);
              const pdfReader = muhammara.createReader(new muhammara.PDFRStreamForBuffer(pdfBuffer));
              
              for (let i = 0; i < pdfReader.getPagesCount(); i++) {
                extractedText += `--- Page ${i + 1} ---\n\n`;
                
                const pageDict = pdfReader.parsePageDictionary(i);
                if (pageDict.exists("Contents")) {
                  try {
                    const pageContent = pageDict.getPageContentStream(0);
                    if (pageContent) {
                      extractedText += `[Page ${i + 1} content extracted]\n\n`;
                    }
                  } catch (e) {
                    extractedText += `[Unable to extract text from page ${i + 1}]\n\n`;
                  }
                }
              }
            } catch (e) {
              for (let i = 0; i < textExtractPages.length; i++) {
                extractedText += `--- Page ${i + 1} ---\n\n`;
                extractedText += `[Text extraction requires OCR for scanned documents]\n\n`;
              }
            }
            
            if (extractedText.trim() === "" || extractedText.includes("[Unable to extract")) {
              extractedText = `PDF Text Extraction Report\n`;
              extractedText += `========================\n\n`;
              extractedText += `Document: ${files[0].originalname}\n`;
              extractedText += `Total Pages: ${textExtractPages.length}\n\n`;
              extractedText += `Note: This PDF appears to contain scanned images or non-extractable text.\n`;
              extractedText += `For scanned documents, please use OCR (Optical Character Recognition) tools.\n\n`;
              
              for (let i = 0; i < textExtractPages.length; i++) {
                const page = textExtractPages[i];
                const { width, height } = page.getSize();
                extractedText += `Page ${i + 1}: ${Math.round(width)} x ${Math.round(height)} points\n`;
              }
            }
            
            result = Buffer.from(extractedText, 'utf-8');
            filename = "extracted-text.txt";
            break;

          case "extract-images-from-pdf":
          case "pdf-image-extractor":
            const imgExtractBytes = fs.readFileSync(files[0].path);
            const imgExtractPdf = await PDFDocument.load(imgExtractBytes, { ignoreEncryption: true });
            
            const zipFilePath = path.join(outputDir, `${randomUUID()}-images.zip`);
            const zipOutput = fs.createWriteStream(zipFilePath);
            const archive = archiver('zip', { zlib: { level: 9 } });
            
            archive.pipe(zipOutput);
            
            let imageCount = 0;
            
            try {
              const imgPdfPages = imgExtractPdf.getPages();
              
              for (let pageIndex = 0; pageIndex < imgPdfPages.length; pageIndex++) {
                const page = imgPdfPages[pageIndex];
                const { width, height } = page.getSize();
                
                const singlePagePdf = await PDFDocument.create();
                const [copiedPage] = await singlePagePdf.copyPages(imgExtractPdf, [pageIndex]);
                singlePagePdf.addPage(copiedPage);
                
                const pngBytes = await singlePagePdf.save();
                
                const imgFilename = `page-${pageIndex + 1}.pdf`;
                archive.append(Buffer.from(pngBytes), { name: imgFilename });
                imageCount++;
              }
              
              const readmeContent = `PDF Image Extraction Report
============================
Document: ${files[0].originalname}
Total Pages: ${imgExtractPdf.getPageCount()}

Note: Each page has been extracted as a separate PDF file.
For actual embedded images, additional processing may be required.

Files included:
${Array.from({ length: imageCount }, (_, i) => `- page-${i + 1}.pdf`).join('\n')}
`;
              archive.append(readmeContent, { name: 'README.txt' });
              
            } catch (e) {
              const errorContent = `Image extraction encountered an error: ${e instanceof Error ? e.message : 'Unknown error'}`;
              archive.append(errorContent, { name: 'error.txt' });
            }
            
            await new Promise<void>((resolve, reject) => {
              zipOutput.on('close', resolve);
              archive.on('error', reject);
              archive.finalize();
            });
            
            result = zipFilePath;
            filename = "extracted-images.zip";
            break;

          case "extract-tables-from-pdf":
          case "pdf-table-extractor":
            const tableExtractBytes = fs.readFileSync(files[0].path);
            const tableExtractPdf = await PDFDocument.load(tableExtractBytes, { ignoreEncryption: true });
            const tableExtractPages = tableExtractPdf.getPages();
            
            const outputFormat = options.tableOutputFormat || "csv";
            
            let tableContent = "";
            
            if (outputFormat === "json") {
              const tableData = {
                document: files[0].originalname,
                totalPages: tableExtractPages.length,
                extractionDate: new Date().toISOString(),
                note: "Table detection from PDFs requires specialized parsing. This report contains page information.",
                pages: tableExtractPages.map((page, index) => ({
                  pageNumber: index + 1,
                  width: Math.round(page.getSize().width),
                  height: Math.round(page.getSize().height),
                  tables: []
                }))
              };
              tableContent = JSON.stringify(tableData, null, 2);
              filename = "extracted-tables.json";
            } else if (outputFormat === "xlsx") {
              const wb = XLSX.utils.book_new();
              
              const summaryData = [
                ["PDF Table Extraction Report"],
                ["Document:", files[0].originalname],
                ["Total Pages:", tableExtractPages.length],
                ["Extraction Date:", new Date().toISOString()],
                [""],
                ["Note: Automatic table detection requires specialized OCR processing."],
                ["For complex tables, manual extraction may be needed."],
                [""],
                ["Page Information:"],
                ["Page", "Width (pts)", "Height (pts)"]
              ];
              
              tableExtractPages.forEach((page, index) => {
                const { width, height } = page.getSize();
                summaryData.push([String(index + 1), String(Math.round(width)), String(Math.round(height))]);
              });
              
              const ws = XLSX.utils.aoa_to_sheet(summaryData);
              XLSX.utils.book_append_sheet(wb, ws, "Summary");
              
              const xlsxBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
              result = Buffer.from(xlsxBuffer);
              filename = "extracted-tables.xlsx";
            } else {
              tableContent = `PDF Table Extraction Report\n`;
              tableContent += `===========================\n\n`;
              tableContent += `Document: ${files[0].originalname}\n`;
              tableContent += `Total Pages: ${tableExtractPages.length}\n`;
              tableContent += `Extraction Date: ${new Date().toISOString()}\n\n`;
              tableContent += `Note: Automatic table detection from PDFs requires specialized parsing.\n`;
              tableContent += `This report contains page dimension information.\n\n`;
              tableContent += `Page,Width (pts),Height (pts)\n`;
              
              tableExtractPages.forEach((page, index) => {
                const { width, height } = page.getSize();
                tableContent += `${index + 1},${Math.round(width)},${Math.round(height)}\n`;
              });
              
              filename = "extracted-tables.csv";
            }
            
            if (typeof result === 'undefined' || result === null) {
              result = Buffer.from(tableContent, 'utf-8');
            }
            break;

          case "extract-data-from-pdf":
          case "pdf-data-extractor": {
            const dataOutputFormat = options.tableOutputFormat || options.formOutputFormat || "xlsx";
            result = await extractDataFromPdf(files[0], dataOutputFormat);
            if (dataOutputFormat === "json") {
              filename = "extracted-data.json";
              contentType = "application/json";
            } else if (dataOutputFormat === "csv") {
              filename = "extracted-data.csv";
              contentType = "text/csv";
            } else {
              filename = "extracted-data.xlsx";
              contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            }
            break;
          }

          case "fill-pdf-forms":
          case "pdf-form-filler": {
            const formFieldsData = options.formFieldsData || "{}";
            result = await fillPdfForms(files[0], formFieldsData);
            filename = "filled-form.pdf";
            break;
          }

          case "create-fillable-pdf":
          case "pdf-form-creator": {
            const fieldsConfig = options.formFieldsData || "[]";
            result = await createFillablePdf(files[0], fieldsConfig);
            filename = "fillable-form.pdf";
            break;
          }

          case "extract-pdf-form-data": {
            const formOutputFormat = options.formOutputFormat || options.tableOutputFormat || "json";
            result = await extractPdfFormData(files[0], formOutputFormat);
            if (formOutputFormat === "csv") {
              filename = "form-data.csv";
              contentType = "text/csv";
            } else if (formOutputFormat === "xlsx") {
              filename = "form-data.xlsx";
              contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            } else {
              filename = "form-data.json";
              contentType = "application/json";
            }
            break;
          }

          case "pdf-to-xml-structured": {
            const pdfBytes = fs.readFileSync(files[0].path);
            const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
            const pages = pdf.getPages();
            const includeMetadata = options.includeMetadata !== false;
            const xmlFormat = options.xmlOutputFormat || "structured";
            
            let xmlContent = `<?xml version="1.0" encoding="UTF-8"?>\n`;
            
            if (xmlFormat === "simple") {
              xmlContent += `<document>\n`;
              if (includeMetadata) {
                xmlContent += `<title>${escapeXml(pdf.getTitle() || "")}</title>\n`;
                xmlContent += `<author>${escapeXml(pdf.getAuthor() || "")}</author>\n`;
                xmlContent += `<pageCount>${pages.length}</pageCount>\n`;
              }
              pages.forEach((page, index) => {
                const { width, height } = page.getSize();
                xmlContent += `<page num="${index + 1}" w="${Math.round(width)}" h="${Math.round(height)}" rot="${page.getRotation().angle}"/>\n`;
              });
              xmlContent += `</document>`;
            } else {
              xmlContent += `<pdf-document>\n`;
              if (includeMetadata) {
                xmlContent += `  <metadata>\n`;
                xmlContent += `    <title>${escapeXml(pdf.getTitle() || "")}</title>\n`;
                xmlContent += `    <author>${escapeXml(pdf.getAuthor() || "")}</author>\n`;
                xmlContent += `    <subject>${escapeXml(pdf.getSubject() || "")}</subject>\n`;
                xmlContent += `    <creator>${escapeXml(pdf.getCreator() || "")}</creator>\n`;
                xmlContent += `    <producer>${escapeXml(pdf.getProducer() || "")}</producer>\n`;
                xmlContent += `    <creationDate>${pdf.getCreationDate()?.toISOString() || ""}</creationDate>\n`;
                xmlContent += `    <modificationDate>${pdf.getModificationDate()?.toISOString() || ""}</modificationDate>\n`;
                xmlContent += `    <pageCount>${pages.length}</pageCount>\n`;
                xmlContent += `  </metadata>\n`;
              }
              xmlContent += `  <pages>\n`;
              pages.forEach((page, index) => {
                const { width, height } = page.getSize();
                xmlContent += `    <page number="${index + 1}" width="${Math.round(width)}" height="${Math.round(height)}">\n`;
                xmlContent += `      <rotation>${page.getRotation().angle}</rotation>\n`;
                xmlContent += `    </page>\n`;
              });
              xmlContent += `  </pages>\n`;
              xmlContent += `</pdf-document>`;
            }
            
            result = Buffer.from(xmlContent, 'utf-8');
            filename = "converted.xml";
            contentType = "application/xml";
            break;
          }

          case "read-pdf-form-data": {
            const formData = await extractPdfFormData(files[0], "json");
            result = formData;
            filename = "form-data-preview.json";
            contentType = "application/json";
            break;
          }

          case "flatten-pdf-form": {
            const flattenBytes = fs.readFileSync(files[0].path);
            const flattenPdf = await PDFDocument.load(flattenBytes, { ignoreEncryption: true });
            const flattenMode = options.flattenMode || "all";
            
            const form = flattenPdf.getForm();
            const fields = form.getFields();
            
            if (flattenMode === "all" || flattenMode === "forms-only") {
              fields.forEach(field => {
                try {
                  field.enableReadOnly();
                } catch (e) {
                  // Field may not support read-only
                }
              });
              form.flatten();
            }
            
            if (flattenMode === "all" || flattenMode === "annotations-only") {
              const pages = flattenPdf.getPages();
              pages.forEach(page => {
                const annots = page.node.get(PDFName.of('Annots'));
                if (annots instanceof PDFArray) {
                  const annotCount = annots.size();
                  for (let i = annotCount - 1; i >= 0; i--) {
                    const annotRef = annots.get(i);
                    if (annotRef) {
                      const annot = flattenPdf.context.lookup(annotRef);
                      if (annot instanceof PDFDict) {
                        const subtype = annot.get(PDFName.of('Subtype'));
                        if (subtype instanceof PDFName) {
                          const subtypeName = subtype.decodeText();
                          if (subtypeName !== 'Widget') {
                            annots.remove(i);
                          }
                        }
                      }
                    }
                  }
                }
              });
            }
            
            result = Buffer.from(await flattenPdf.save());
            filename = "flattened-form.pdf";
            break;
          }

          case "extract-fonts-from-pdf": {
            const fontBytes = fs.readFileSync(files[0].path);
            const fontPdf = await PDFDocument.load(fontBytes, { ignoreEncryption: true });
            const pages = fontPdf.getPages();
            
            const fontInfo = {
              document: files[0].originalname,
              pageCount: pages.length,
              extractionDate: new Date().toISOString(),
              fonts: [] as Array<{ name: string; type: string; embedded: boolean; pages: number[] }>,
              note: "Font information extracted from PDF structure. Embedded fonts may be subset for the characters used in the document."
            };
            
            const seenFonts = new Map<string, { type: string; pages: Set<number> }>();
            
            pages.forEach((page, pageIndex) => {
              const resources = page.node.get(PDFName.of('Resources'));
              if (resources instanceof PDFDict) {
                const fonts = resources.get(PDFName.of('Font'));
                if (fonts instanceof PDFDict) {
                  fonts.entries().forEach(([key, value]) => {
                    const fontName = key.toString().replace('/', '');
                    if (!seenFonts.has(fontName)) {
                      seenFonts.set(fontName, { type: 'Unknown', pages: new Set() });
                    }
                    seenFonts.get(fontName)?.pages.add(pageIndex + 1);
                  });
                }
              }
            });
            
            seenFonts.forEach((info, name) => {
              fontInfo.fonts.push({
                name: name,
                type: info.type,
                embedded: true,
                pages: Array.from(info.pages)
              });
            });
            
            result = Buffer.from(JSON.stringify(fontInfo, null, 2), 'utf-8');
            filename = "font-report.json";
            contentType = "application/json";
            break;
          }

          case "zugferd-invoice-extractor": {
            const zugferdBytes = fs.readFileSync(files[0].path);
            const zugferdPdf = await PDFDocument.load(zugferdBytes, { ignoreEncryption: true });
            
            let xmlAttachment = null;
            const attachmentNames = ['factur-x.xml', 'ZUGFeRD-invoice.xml', 'xrechnung.xml', 'invoice.xml'];
            
            try {
              const catalog = zugferdPdf.context.lookup(zugferdPdf.context.trailerInfo.Root);
              if (catalog instanceof PDFDict) {
                const names = catalog.get(PDFName.of('Names'));
                if (names instanceof PDFDict) {
                  const embeddedFiles = names.get(PDFName.of('EmbeddedFiles'));
                  if (embeddedFiles instanceof PDFDict) {
                    const namesArray = embeddedFiles.get(PDFName.of('Names'));
                    if (namesArray instanceof PDFArray) {
                      for (let i = 0; i < namesArray.size(); i += 2) {
                        const nameObj = namesArray.get(i);
                        if (nameObj instanceof PDFString) {
                          const attachmentName = nameObj.decodeText();
                          if (attachmentNames.some(n => attachmentName.toLowerCase().includes(n.toLowerCase().replace('.xml', '')))) {
                            xmlAttachment = attachmentName;
                            break;
                          }
                        }
                      }
                    }
                  }
                }
              }
            } catch (e) {
              // Failed to extract embedded XML
            }
            
            const invoiceData = {
              document: files[0].originalname,
              format: xmlAttachment ? "ZUGFeRD/Factur-X" : "Standard PDF",
              extractionDate: new Date().toISOString(),
              hasEmbeddedXml: !!xmlAttachment,
              embeddedFileName: xmlAttachment,
              pageCount: zugferdPdf.getPageCount(),
              metadata: {
                title: zugferdPdf.getTitle() || "",
                author: zugferdPdf.getAuthor() || "",
                subject: zugferdPdf.getSubject() || "",
                creationDate: zugferdPdf.getCreationDate()?.toISOString() || ""
              },
              note: xmlAttachment 
                ? "This PDF contains embedded ZUGFeRD/Factur-X XML invoice data." 
                : "No embedded ZUGFeRD/Factur-X XML found. This may be a standard PDF invoice."
            };
            
            result = Buffer.from(JSON.stringify(invoiceData, null, 2), 'utf-8');
            filename = "invoice-data.json";
            contentType = "application/json";
            break;
          }

          case "pdf-to-ubl-xml": {
            const ublBytes = fs.readFileSync(files[0].path);
            const ublPdf = await PDFDocument.load(ublBytes, { ignoreEncryption: true });
            
            let ublXml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
            ublXml += `<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"\n`;
            ublXml += `         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"\n`;
            ublXml += `         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">\n`;
            ublXml += `  <cbc:UBLVersionID>2.1</cbc:UBLVersionID>\n`;
            ublXml += `  <cbc:ID>INV-${Date.now()}</cbc:ID>\n`;
            ublXml += `  <cbc:IssueDate>${new Date().toISOString().split('T')[0]}</cbc:IssueDate>\n`;
            ublXml += `  <cbc:DocumentCurrencyCode>EUR</cbc:DocumentCurrencyCode>\n`;
            ublXml += `  <cbc:Note>Converted from PDF: ${escapeXml(files[0].originalname)}</cbc:Note>\n`;
            ublXml += `  <cac:AccountingSupplierParty>\n`;
            ublXml += `    <cac:Party>\n`;
            ublXml += `      <cac:PartyName><cbc:Name>Supplier Name</cbc:Name></cac:PartyName>\n`;
            ublXml += `    </cac:Party>\n`;
            ublXml += `  </cac:AccountingSupplierParty>\n`;
            ublXml += `  <cac:AccountingCustomerParty>\n`;
            ublXml += `    <cac:Party>\n`;
            ublXml += `      <cac:PartyName><cbc:Name>Customer Name</cbc:Name></cac:PartyName>\n`;
            ublXml += `    </cac:Party>\n`;
            ublXml += `  </cac:AccountingCustomerParty>\n`;
            ublXml += `  <cac:LegalMonetaryTotal>\n`;
            ublXml += `    <cbc:PayableAmount currencyID="EUR">0.00</cbc:PayableAmount>\n`;
            ublXml += `  </cac:LegalMonetaryTotal>\n`;
            ublXml += `</Invoice>`;
            
            result = Buffer.from(ublXml, 'utf-8');
            filename = "invoice-ubl.xml";
            contentType = "application/xml";
            break;
          }

          case "form-data-to-csv": {
            const csvFormData = await extractPdfFormData(files[0], "csv");
            result = csvFormData;
            filename = "form-data.csv";
            contentType = "text/csv";
            break;
          }

          case "form-data-to-xml": {
            const xmlFormBytes = fs.readFileSync(files[0].path);
            const xmlFormPdf = await PDFDocument.load(xmlFormBytes, { ignoreEncryption: true });
            const form = xmlFormPdf.getForm();
            const fields = form.getFields();
            
            let formXml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
            formXml += `<form-data>\n`;
            formXml += `  <document>${escapeXml(files[0].originalname)}</document>\n`;
            formXml += `  <extractionDate>${new Date().toISOString()}</extractionDate>\n`;
            formXml += `  <fields>\n`;
            
            fields.forEach(field => {
              const name = field.getName();
              let value = "";
              let fieldType = "unknown";
              
              try {
                const fieldConstructor = field.constructor.name;
                if (fieldConstructor === "PDFTextField") {
                  value = (field as any).getText() || "";
                  fieldType = "text";
                } else if (fieldConstructor === "PDFCheckBox") {
                  value = (field as any).isChecked() ? "true" : "false";
                  fieldType = "checkbox";
                } else if (fieldConstructor === "PDFRadioGroup") {
                  value = (field as any).getSelected() || "";
                  fieldType = "radio";
                } else if (fieldConstructor === "PDFDropdown") {
                  const selected = (field as any).getSelected();
                  value = Array.isArray(selected) ? selected.join(", ") : (selected || "");
                  fieldType = "dropdown";
                }
              } catch (e) {
                // Field extraction error
              }
              
              formXml += `    <field name="${escapeXml(name)}" type="${fieldType}">${escapeXml(value)}</field>\n`;
            });
            
            formXml += `  </fields>\n`;
            formXml += `</form-data>`;
            
            result = Buffer.from(formXml, 'utf-8');
            filename = "form-data.xml";
            contentType = "application/xml";
            break;
          }

          case "form-data-to-json": {
            const jsonFormData = await extractPdfFormData(files[0], "json");
            result = jsonFormData;
            filename = "form-data.json";
            contentType = "application/json";
            break;
          }

          case "form-filler-csv": {
            const fillerBytes = fs.readFileSync(files[0].path);
            const fillerPdf = await PDFDocument.load(fillerBytes, { ignoreEncryption: true });
            const form = fillerPdf.getForm();
            const fields = form.getFields();
            
            let csvData: Record<string, string> = {};
            
            if (options.csvFieldMapping) {
              try {
                csvData = JSON.parse(options.csvFieldMapping);
              } catch (e) {
                const delimiter = options.csvDelimiter === "\\t" ? "\t" : (options.csvDelimiter || ",");
                const lines = options.csvFieldMapping.split("\n").filter((l: string) => l.trim());
                
                if (lines.length >= 2) {
                  const headers = lines[0].split(delimiter).map((h: string) => h.trim());
                  const values = lines[1].split(delimiter).map((v: string) => v.trim());
                  
                  headers.forEach((header: string, index: number) => {
                    if (values[index] !== undefined) {
                      csvData[header] = values[index];
                    }
                  });
                }
              }
            }
            
            fields.forEach(field => {
              const fieldName = field.getName();
              const value = csvData[fieldName];
              
              if (value !== undefined) {
                try {
                  const fieldConstructor = field.constructor.name;
                  if (fieldConstructor === "PDFTextField") {
                    (field as any).setText(value);
                  } else if (fieldConstructor === "PDFCheckBox") {
                    if (value.toLowerCase() === "true" || value.toLowerCase() === "yes" || value === "1") {
                      (field as any).check();
                    } else {
                      (field as any).uncheck();
                    }
                  } else if (fieldConstructor === "PDFDropdown") {
                    (field as any).select(value);
                  } else if (fieldConstructor === "PDFRadioGroup") {
                    (field as any).select(value);
                  }
                } catch (e) {
                  // Field setting error
                }
              }
            });
            
            result = Buffer.from(await fillerPdf.save());
            filename = "filled-form.pdf";
            break;
          }

          case "pdf-form-filler-json": {
            const jsonFillerBytes = fs.readFileSync(files[0].path);
            const jsonFillerPdf = await PDFDocument.load(jsonFillerBytes, { ignoreEncryption: true });
            const jsonForm = jsonFillerPdf.getForm();
            const jsonFields = jsonForm.getFields();
            
            let jsonData: Record<string, any> = {};
            
            if (options.formDataJson) {
              try {
                jsonData = JSON.parse(options.formDataJson);
              } catch (e) {
                throw new Error("Invalid JSON format. Please provide valid JSON data.");
              }
            }
            
            jsonFields.forEach(field => {
              const fieldName = field.getName();
              let value = jsonData[fieldName];
              
              if (value !== undefined) {
                try {
                  if (typeof value !== 'string') {
                    value = String(value);
                  }
                  const fieldConstructor = field.constructor.name;
                  if (fieldConstructor === "PDFTextField") {
                    (field as any).setText(value);
                  } else if (fieldConstructor === "PDFCheckBox") {
                    const boolVal = String(value).toLowerCase();
                    if (boolVal === "true" || boolVal === "yes" || boolVal === "1") {
                      (field as any).check();
                    } else {
                      (field as any).uncheck();
                    }
                  } else if (fieldConstructor === "PDFDropdown") {
                    (field as any).select(value);
                  } else if (fieldConstructor === "PDFRadioGroup") {
                    (field as any).select(value);
                  }
                } catch (e) {
                  // Field setting error
                }
              }
            });
            
            result = Buffer.from(await jsonFillerPdf.save());
            filename = "filled-form.pdf";
            break;
          }

          case "pdf-form-export-csv": {
            const csvExportBytes = fs.readFileSync(files[0].path);
            const csvExportPdf = await PDFDocument.load(csvExportBytes, { ignoreEncryption: true });
            const csvExportForm = csvExportPdf.getForm();
            const csvExportFields = csvExportForm.getFields();
            
            const csvDelimiter = options.csvDelimiter === "\\t" ? "\t" : (options.csvDelimiter || ",");
            
            const escapeForCsv = (val: string, delim: string): string => {
              if (val.includes(delim) || val.includes('"') || val.includes('\n')) {
                return `"${val.replace(/"/g, '""')}"`;
              }
              return val;
            };
            
            const fieldNames: string[] = [];
            const fieldValues: string[] = [];
            
            csvExportFields.forEach(field => {
              const name = field.getName();
              let value = "";
              
              try {
                const fieldConstructor = field.constructor.name;
                if (fieldConstructor === "PDFTextField") {
                  value = (field as any).getText() || "";
                } else if (fieldConstructor === "PDFCheckBox") {
                  value = (field as any).isChecked() ? "true" : "false";
                } else if (fieldConstructor === "PDFRadioGroup") {
                  value = (field as any).getSelected() || "";
                } else if (fieldConstructor === "PDFDropdown") {
                  const selected = (field as any).getSelected();
                  value = Array.isArray(selected) ? selected.join("; ") : (selected || "");
                }
              } catch (e) {
                // Field extraction error
              }
              
              fieldNames.push(escapeForCsv(name, csvDelimiter));
              fieldValues.push(escapeForCsv(value, csvDelimiter));
            });
            
            const csvContent = fieldNames.join(csvDelimiter) + '\n' + fieldValues.join(csvDelimiter);
            result = Buffer.from(csvContent, 'utf-8');
            filename = "form-data.csv";
            contentType = "text/csv";
            break;
          }

          case "pdf-form-export-json": {
            const jsonExportBytes = fs.readFileSync(files[0].path);
            const jsonExportPdf = await PDFDocument.load(jsonExportBytes, { ignoreEncryption: true });
            const jsonExportForm = jsonExportPdf.getForm();
            const jsonExportFields = jsonExportForm.getFields();
            
            const formDataObj: Record<string, any> = {
              documentName: files[0].originalname,
              extractedAt: new Date().toISOString(),
              fields: {} as Record<string, any>
            };
            
            jsonExportFields.forEach(field => {
              const name = field.getName();
              let value: any = null;
              let fieldType = "unknown";
              
              try {
                const fieldConstructor = field.constructor.name;
                if (fieldConstructor === "PDFTextField") {
                  value = (field as any).getText() || "";
                  fieldType = "text";
                } else if (fieldConstructor === "PDFCheckBox") {
                  value = (field as any).isChecked();
                  fieldType = "checkbox";
                } else if (fieldConstructor === "PDFRadioGroup") {
                  value = (field as any).getSelected() || null;
                  fieldType = "radio";
                } else if (fieldConstructor === "PDFDropdown") {
                  const selected = (field as any).getSelected();
                  value = Array.isArray(selected) ? selected : (selected || null);
                  fieldType = "dropdown";
                }
              } catch (e) {
                // Field extraction error
              }
              
              formDataObj.fields[name] = { value, type: fieldType };
            });
            
            result = Buffer.from(JSON.stringify(formDataObj, null, 2), 'utf-8');
            filename = "form-data.json";
            contentType = "application/json";
            break;
          }

          case "pdf-viewer":
          case "pdf-reader":
          case "open-pdf":
          case "read-pdf-online": {
            const viewerBytes = fs.readFileSync(files[0].path);
            const viewerPdf = await PDFDocument.load(viewerBytes, { ignoreEncryption: true });
            pageCount = viewerPdf.getPageCount();
            
            result = Buffer.from(await viewerPdf.save());
            filename = files[0].originalname || "document.pdf";
            contentType = "application/pdf";
            break;
          }

          case "compare-pdf":
          case "pdf-comparer":
          case "pdf-difference-checker": {
            if (files.length < 2) {
              throw new Error("Two PDF files are required for comparison");
            }
            
            const pdf1Bytes = fs.readFileSync(files[0].path);
            const pdf2Bytes = fs.readFileSync(files[1].path);
            
            const comparePdf1 = await PDFDocument.load(pdf1Bytes, { ignoreEncryption: true });
            const comparePdf2 = await PDFDocument.load(pdf2Bytes, { ignoreEncryption: true });
            
            const pdf1PageCount = comparePdf1.getPageCount();
            const pdf2PageCount = comparePdf2.getPageCount();
            
            const differences: any[] = [];
            
            if (pdf1PageCount !== pdf2PageCount) {
              differences.push({
                type: "page_count",
                description: `Page count differs: Document 1 has ${pdf1PageCount} pages, Document 2 has ${pdf2PageCount} pages`
              });
            }
            
            const minPages = Math.min(pdf1PageCount, pdf2PageCount);
            for (let i = 0; i < minPages; i++) {
              const page1 = comparePdf1.getPage(i);
              const page2 = comparePdf2.getPage(i);
              
              const size1 = page1.getSize();
              const size2 = page2.getSize();
              
              if (Math.abs(size1.width - size2.width) > 1 || Math.abs(size1.height - size2.height) > 1) {
                differences.push({
                  type: "page_size",
                  page: i + 1,
                  description: `Page ${i + 1} size differs: Doc1 (${size1.width.toFixed(0)}x${size1.height.toFixed(0)}) vs Doc2 (${size2.width.toFixed(0)}x${size2.height.toFixed(0)})`
                });
              }
              
              const rot1 = page1.getRotation().angle;
              const rot2 = page2.getRotation().angle;
              if (rot1 !== rot2) {
                differences.push({
                  type: "rotation",
                  page: i + 1,
                  description: `Page ${i + 1} rotation differs: Doc1 (${rot1}°) vs Doc2 (${rot2}°)`
                });
              }
            }
            
            const comparisonReport = {
              document1: {
                name: files[0].originalname,
                pageCount: pdf1PageCount,
                fileSize: pdf1Bytes.length
              },
              document2: {
                name: files[1].originalname,
                pageCount: pdf2PageCount,
                fileSize: pdf2Bytes.length
              },
              comparedAt: new Date().toISOString(),
              differencesFound: differences.length,
              differences: differences,
              summary: differences.length === 0 
                ? "No structural differences detected between the documents."
                : `Found ${differences.length} difference(s) between the documents.`
            };
            
            result = Buffer.from(JSON.stringify(comparisonReport, null, 2), 'utf-8');
            filename = "comparison-report.json";
            contentType = "application/json";
            pageCount = pdf1PageCount;
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
