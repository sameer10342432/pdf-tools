# PDF Tools - Online PDF Processing Application

## Overview
A comprehensive web application providing 10 powerful PDF manipulation tools. Built with React frontend and Express backend, featuring a beautiful, responsive design and secure file processing.

## Project Structure
```
client/
  src/
    components/         # React components
      ui/               # Shadcn UI components
      header.tsx        # Site header with navigation
      hero-section.tsx  # Landing page hero
      tool-card.tsx     # Individual tool card
      tools-grid.tsx    # Grid of all 10 tools
      tool-dialog.tsx   # Modal for tool processing
      tool-options.tsx  # Tool-specific options
      file-upload.tsx   # Drag-and-drop file upload
      features-section.tsx  # Features/benefits section
      footer.tsx        # Site footer
      theme-provider.tsx    # Dark/light mode support
      theme-toggle.tsx      # Theme toggle button
    pages/
      home.tsx          # Main homepage
    lib/
      queryClient.ts    # React Query setup
shared/
  schema.ts             # Shared TypeScript types and schemas
server/
  routes.ts             # API endpoints for PDF processing
  index.ts              # Express server setup
```

## 10 PDF Tools Available
1. **Merge PDF** - Combine multiple PDFs into one
2. **Split PDF** - Extract specific pages
3. **Compress PDF** - Reduce file size
4. **PDF to Images** - Convert pages to JPG/PNG
5. **Images to PDF** - Convert images to PDF
6. **Rotate PDF** - Rotate pages 90°/180°/270°
7. **Delete Pages** - Remove specific pages
8. **Merge Alternately** - Interleave pages from 2 PDFs
9. **Add Page Numbers** - Insert page numbers
10. **Add Watermark** - Add text watermarks

## Tech Stack
- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Express, Node.js
- **PDF Processing**: pdf-lib, sharp, archiver
- **File Upload**: multer (server), drag-and-drop (client)

## Key Features
- Dark/light mode support
- Responsive design
- Drag-and-drop file upload
- Real-time processing progress
- Secure file handling (auto-deleted after 5 minutes)
- No registration required

## Running the Application
The application runs on port 5000. Start with:
```bash
npm run dev
```

## API Endpoints
- `POST /api/process` - Process PDF files
- `GET /api/download/:filename` - Download processed files

## User Preferences
- Primary color: Red/Orange (PDF-themed)
- Font: Inter
- Clean, professional design
- Focus on usability and speed
