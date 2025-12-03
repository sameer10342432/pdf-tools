# PDF Tools - Online PDF Processing Application

## Overview
PDF Tools is a comprehensive web application offering over 140 powerful tools for PDF and image manipulation. Its purpose is to provide a user-friendly, responsive solution for tasks such as merging, splitting, compressing, converting, editing, securing, repairing, and OCR-processing PDF files, along with extensive image format conversion and manipulation capabilities. The project aims to be a go-to online utility for diverse document and image processing needs, emphasizing secure file handling and no registration.

## User Preferences
- Primary color: Red/Orange (PDF-themed)
- Font: Inter
- Clean, professional design
- Focus on usability and speed
- Emoji support for visual appeal

## System Architecture
The application is built with a React frontend and an Express.js backend.
- **Frontend**: Utilizes React, TypeScript, Tailwind CSS, and Shadcn UI for a modern, responsive interface supporting dark/light modes and drag-and-drop file uploads. Each tool features a dedicated, SEO-optimized page with unique meta titles, descriptions, and supporting articles (300-500 words), enhanced with emoji icons.
- **Backend**: An Express.js and Node.js server handles all PDF and image processing, exposing API endpoints for operations and file downloads.
- **Core Features**:
    - Over 140 distinct tools covering PDF manipulation (merge, split, compress, convert, edit, secure, repair, OCR), and extensive image processing (conversion across numerous formats like HEIC, WebP, AVIF, RAW, SVG, EPS, PSD, AI; editing, filtering, composition, metadata handling, and AI-powered enhancements like object removal and image generation).
    - Support for various document conversions (Word, HTML, TXT, Excel, CSV, JSON, PPT, ODT, ODS, ODP) and ebook formats (EPUB, MOBI).
    - New universal file converter tools: File Converter, Document Converter, EPUB to TXT, XML to CSV, XML to JSON, JSON to XML, JSON to YAML, YAML to JSON, YAML to CSV, and CSV to YAML.
    - Secure file handling with automatic deletion after 5 minutes.
    - Real-time processing progress indication.
    - Page-based navigation for improved SEO and user experience.
    - Image processing tools utilize a multi-tier fallback system (Sharp, Ghostscript, ImageMagick).
    - AI-powered image tools use Sharp-based algorithmic processing for features like image generation, photo retouch, object removal, and face swapping.
    - Document conversions (PPT, ODT, ODS, ODP) leverage LibreOffice for accurate rendering.

## External Dependencies
- **PDF Processing Libraries**: `pdf-lib`
- **Image Processing Libraries**: `sharp`
- **Archiving**: `archiver`
- **Document Processing**: `mammoth` (Word), `xlsx` (Excel), `tesseract.js` (OCR), `marked` (Markdown), `adm-zip` (ODF/EPUB extraction).
- **File Upload**: `multer`