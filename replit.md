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

## External Dependencies
- **PDF Processing Libraries**: `pdf-lib` (for core PDF manipulation), `sharp` (for image processing), `archiver` (for creating zip archives).
- **Document Conversion**: `mammoth` (for Word document processing), `xlsx` (for Excel processing), `tesseract.js` (for OCR text recognition), `marked` (for Markdown parsing), `adm-zip` (for ODF file extraction).
- **File Upload**: `multer` (server-side).