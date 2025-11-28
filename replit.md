# PDF Tools - Online PDF Processing Application

## Overview
A comprehensive web application providing 32 powerful PDF manipulation tools. Built with React frontend and Express backend, featuring a beautiful, responsive design, SEO optimization, and secure file processing.

## Project Structure
```
client/
  src/
    components/         # React components
      ui/               # Shadcn UI components
      header.tsx        # Site header with navigation
      hero-section.tsx  # Landing page hero
      tool-card.tsx     # Individual tool card with emoji display
      tools-grid.tsx    # Grid of all tools
      tool-options.tsx  # Tool-specific options
      file-upload.tsx   # Drag-and-drop file upload
      features-section.tsx  # Features/benefits section
      footer.tsx        # Site footer
      theme-provider.tsx    # Dark/light mode support
      theme-toggle.tsx      # Theme toggle button
    pages/
      home.tsx          # Main homepage
      tool.tsx          # Individual tool page with SEO
      all-tools.tsx     # All tools listing page
    lib/
      queryClient.ts    # React Query setup
shared/
  schema.ts             # Shared TypeScript types and schemas with SEO fields
server/
  routes.ts             # API endpoints for PDF processing (22 tools)
  index.ts              # Express server setup
```

## 42 PDF Tools Available

### Merge Tools
1. **Merge PDF** - Combine multiple PDFs into one
2. **Interleave PDF** - Interleave pages from two PDFs alternately
3. **PDF Binder** - Bind multiple PDFs in order
4. **Merge with Bookmarks** - Merge with separator pages for navigation
5. **PDF+Images Combiner** - Combine PDFs and images together
6. **PDF+Word Merger** - Merge PDFs and Word documents

### Split Tools
7. **Split PDF** - Extract specific pages (single PDF output)
8. **PDF Splitter** - Extract pages to ZIP archive
9. **Divide PDF** - Split into equal parts
10. **Break PDF** - Split by custom page sections
11. **Split by Pages** - One page per PDF

### Advanced Split & Extraction Tools
12. **Split by Size** - Split PDF into parts with maximum file size limit
13. **Split by Bookmarks** - Split PDF at bookmark/outline boundaries
14. **Split by Text** - Split PDF at text pattern boundaries
15. **Split in Half** - Split PDF into two equal halves
16. **Split Every X Pages** - Split PDF at regular page intervals
17. **Extract Pages** - Extract multiple page ranges to separate PDFs
18. **Page Extractor** - Extract all pages as individual PDF files
19. **Page Remover** - Remove specific pages from PDF
20. **Extract Specific** - Extract specific pages into a single PDF

### Compression Tools (Standard)
21. **Compress PDF** - Reduce file size with customizable compression
22. **PDF Compressor** - Professional compression tool
23. **Reduce PDF Size** - Make PDFs smaller
24. **Optimize PDF** - Optimize PDF for smaller size
25. **PDF Optimizer** - Advanced PDF optimization

### Compression Tools (Specialized)
26. **High Compression PDF** - Maximum compression for smallest file size
27. **Basic Compression PDF** - Light compression preserving quality
28. **Custom PDF Compression** - Adjustable compression levels
29. **Compress PDF for Web** - Optimize PDFs for web delivery
30. **Compress PDF for Email** - Reduce size for email attachments
31. **Compress Scanned PDF** - Specialized compression for scanned documents
32. **PDF Size Reducer** - Simple file size reduction
33. **Shrink PDF** - Quick PDF shrinking
34. **PDF File Compressor** - Professional-grade compression
35. **Optimize PDF for Print** - Prepare high-quality print versions

### Transform Tools
36. **Rotate PDF** - Rotate pages 90°/180°/270°
37. **PDF to Images** - Convert pages to JPG/PNG
38. **Images to PDF** - Convert images to PDF

### Edit Tools
39. **Delete Pages** - Remove specific pages
40. **Add Page Numbers** - Insert page numbers
41. **Add Watermark** - Add text watermarks

### Security Tools
42. **Protect PDF** - Add password protection
43. **Unlock PDF** - Remove password protection

## Tech Stack
- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Express, Node.js
- **PDF Processing**: pdf-lib, sharp, archiver, mammoth
- **File Upload**: multer (server), drag-and-drop (client)

## Key Features
- Dark/light mode support
- Responsive design
- Drag-and-drop file upload
- Real-time processing progress
- Secure file handling (auto-deleted after 5 minutes)
- No registration required
- SEO optimized with meta tags and articles for each tool
- Emoji icons for visual appeal

## Running the Application
The application runs on port 5000. Start with:
```bash
npm run dev
```

## API Endpoints
- `POST /api/process` - Process PDF files
- `GET /api/download/:filename` - Download processed files

## SEO Features
Each tool has:
- Unique meta title
- Meta description
- 300-500 word SEO article with HTML formatting
- Emoji icon for visual identification

## User Preferences
- Primary color: Red/Orange (PDF-themed)
- Font: Inter
- Clean, professional design
- Focus on usability and speed
- Emoji support for visual appeal

## Recent Changes (November 2025)
- Added 10 new specialized PDF compression tools (high-compression-pdf, basic-compression-pdf, custom-pdf-compression, compress-pdf-for-web, compress-pdf-for-email, compress-scanned-pdf, pdf-size-reducer, shrink-pdf, pdf-file-compressor, optimize-pdf-for-print)
- Total tools now at 42
- Added specialized compression functions with different strategies (high compression, basic compression, web-optimized, email-optimized, scanned document, print-optimized)
- Added 10 advanced splitting and extraction tools (split-by-size, split-by-bookmarks, split-by-text, split-in-half, split-every-x-pages, extract-pages, page-extractor, page-remover, extract-specific)
- Added 10 previous tools (interleave, pdf-binder, merge-with-bookmarks, pdf-images-combiner, pdf-word-merger, split-pdf, pdf-splitter, divide-pdf, break-pdf, split-by-pages)
- Migrated from dialog-based to page-based navigation
- Added SEO optimization with meta tags and articles
- Added emoji support for tool icons
- Installed mammoth library for Word document processing
