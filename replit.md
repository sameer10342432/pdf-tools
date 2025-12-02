# PDF Tools - Online PDF Processing Application

## Overview
PDF Tools is a comprehensive web application offering over 140 powerful tools for PDF manipulation. It provides a user-friendly, responsive interface for tasks such as merging, splitting, compressing, converting, editing, securing, repairing, and OCR-processing PDF files. The application aims to be a go-to solution for all PDF-related needs, featuring secure file handling, no registration requirements, and strong SEO optimization.

## User Preferences
- Primary color: Red/Orange (PDF-themed)
- Font: Inter
- Clean, professional design
- Focus on usability and speed
- Emoji support for visual appeal

## System Architecture
The application is built with a React frontend and an Express.js backend.
- **Frontend**: Utilizes React, TypeScript, Tailwind CSS, and Shadcn UI for a modern, responsive user interface with dark/light mode support and drag-and-drop file upload. Each tool has a dedicated page with SEO-optimized content, including unique meta titles, descriptions, and 300-500 word articles, alongside emoji icons for visual identification.
- **Backend**: An Express.js and Node.js server handles PDF processing. It exposes API endpoints for various PDF operations and file downloads.
- **Core Features**:
    - Over 140 distinct PDF tools covering a wide range of functionalities from basic merging and splitting to advanced OCR, repair, and proprietary format conversions.
    - Secure file handling ensures uploaded files are automatically deleted after 5 minutes.
    - Real-time processing progress indication.
    - Dialog-based navigation has been migrated to page-based navigation for better SEO and user experience.

## Recent Changes (December 2025)
- Added 20 new image processing tools with full SEO optimization (500+ word articles each):
  
  **Image Format Conversion Tools:**
  - **HEIC to JPG**: Convert Apple HEIC/HEIF images to universally compatible JPG format
  - **HEIC to PNG**: Convert Apple HEIC/HEIF images to lossless PNG format
  - **HEIC to GIF**: Convert Apple HEIC/HEIF images to GIF format for universal compatibility
  - **WebP to JPG**: Convert WebP images to JPG with customizable quality settings
  - **WebP to GIF**: Convert WebP images/animations to universally compatible GIF format
  - **GIF to WebP**: Convert GIF animations to modern WebP for smaller file sizes
  - **AVIF to JPG**: Convert cutting-edge AVIF images to universally supported JPG format
  - **AVIF to PNG**: Convert AVIF images to lossless PNG format
  - **JPG to AVIF**: Convert JPG images to next-generation AVIF for superior compression
  - **PNG to AVIF**: Convert PNG images to AVIF for dramatically smaller file sizes
  - **JPE to JPG**: Standardize JPE file extensions to universally recognized JPG
  - **JFIF to JPG**: Convert JFIF images to standard JPG for maximum compatibility
  
  **Image Processing Tools:**
  - **Image to Base64**: Encode images to Base64 strings for web embedding
  - **Base64 to Image**: Decode Base64 strings back to downloadable image files
  - **Image Editor**: Comprehensive editor with rotate, flip, resize, brightness, contrast, saturation, grayscale, blur, and sharpen controls
  - **Photo Editor**: Same functionality as Image Editor (alternate naming)
  - **Remove Image Background**: Color-based background removal with adjustable threshold
  - **Image Background Remover**: Same functionality as Remove Image Background (alternate naming)
  - **Convert to ICO**: Create multi-size ICO favicon files (16x16 to 256x256)
  - **ICO Converter**: Same functionality as Convert to ICO (alternate naming)

- All tools include complete SEO metadata (metaTitle, metaDescription) and 500+ word seoArticle content

- Added 10 new professional image format conversion tools (December 2025):
  
  **Camera RAW Conversion Tools:**
  - **RAW to JPG**: Convert generic camera RAW files to high-quality JPG format
  - **CR2 to JPG**: Convert Canon CR2 RAW files to JPG with quality control
  - **NEF to JPG**: Convert Nikon NEF RAW files to JPG with quality control
  - **ARW to JPG**: Convert Sony ARW RAW files to JPG with quality control
  - **DNG to JPG**: Convert Adobe DNG files to universally compatible JPG format
  
  **Professional Format Conversion Tools:**
  - **SVG to JPG**: Convert scalable vector graphics to JPG with custom dimensions
  - **EPS to PNG**: Convert Encapsulated PostScript files to PNG with transparency
  - **EPS to JPG**: Convert EPS vector files to JPG with quality settings
  - **PSD to JPG**: Convert Adobe Photoshop files to JPG format
  - **PSD to PNG**: Convert Photoshop files to PNG with transparency support

  These tools use a multi-tier fallback system: Sharp library for compatible formats, Ghostscript for EPS files, and ImageMagick as a universal fallback. All tools include complete SEO articles (500+ words).

## External Dependencies
- **PDF Processing Libraries**: `pdf-lib` (for core PDF manipulation), `sharp` (for image processing), `archiver` (for creating zip archives).
- **Document Conversion**: `mammoth` (for Word document processing), `xlsx` (for Excel processing), `tesseract.js` (for OCR text recognition), `marked` (for Markdown parsing), `adm-zip` (for ODF file extraction).
- **File Upload**: `multer` (server-side).