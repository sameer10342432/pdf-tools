# PDF Tools - Online PDF Processing Application

## Overview
A comprehensive web application providing 22 powerful PDF manipulation tools. Built with React frontend and Express backend, featuring a beautiful, responsive design, SEO optimization, and secure file processing.

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

## 22 PDF Tools Available

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

### Transform Tools
12. **Compress PDF** - Reduce file size
13. **Rotate PDF** - Rotate pages 90°/180°/270°
14. **PDF to Images** - Convert pages to JPG/PNG
15. **Images to PDF** - Convert images to PDF

### Edit Tools
16. **Delete Pages** - Remove specific pages
17. **Add Page Numbers** - Insert page numbers
18. **Add Watermark** - Add text watermarks

### Security Tools
19. **Protect PDF** - Add password protection
20. **Unlock PDF** - Remove password protection

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
- Added 10 new PDF tools (interleave, pdf-binder, merge-with-bookmarks, pdf-images-combiner, pdf-word-merger, split-pdf, pdf-splitter, divide-pdf, break-pdf, split-by-pages)
- Migrated from dialog-based to page-based navigation
- Added SEO optimization with meta tags and articles
- Added emoji support for tool icons
- Installed mammoth library for Word document processing
