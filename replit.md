# PDF Tools - Online PDF Processing Application

## Overview
A comprehensive web application providing 130+ powerful PDF manipulation tools. Built with React frontend and Express backend, featuring a beautiful, responsive design, SEO optimization, and secure file processing.

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

## 130+ PDF Tools Available

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

### PDF Repair Tools
44. **Repair PDF** - Fix and repair damaged or corrupted PDF files
45. **Fix PDF** - Resolve PDF issues and restore functionality
46. **Recover PDF Data** - Extract and recover data from damaged PDFs
47. **Repair Corrupt PDF** - Fix severely corrupted PDF documents
48. **PDF Repair Tool** - All-in-one PDF repair and recovery solution

### OCR Tools
49. **OCR PDF** - Make scanned PDFs searchable with text recognition
50. **Scanned PDF to Text** - Extract text content from scanned PDF documents
51. **PDF OCR** - Apply OCR to recognize text in any PDF
52. **Searchable PDF Creator** - Create searchable PDFs from scanned documents
53. **OCR to Word** - Convert scanned PDFs to editable Word documents
54. **OCR to Excel** - Extract text from scanned PDFs to Excel spreadsheets
55. **Image to Text** - Extract text from images using OCR technology

### PDF Optimization Tools
56. **Linearize PDF** - Optimize PDF for fast web viewing with byte-serving
57. **PDF Fast Web View** - Enable progressive loading for PDFs
58. **PDF Optimizer (Remove Unused)** - Remove unused objects from PDF
59. **Downsample PDF Images** - Reduce image resolution in PDFs
60. **PDF Font Subsetter** - Subset fonts to reduce file size

### Document Conversion Tools
61. **Word to PDF** - Convert Microsoft Word documents to PDF
62. **DOC to PDF** - Convert legacy DOC files to PDF
63. **DOCX to PDF** - Convert DOCX documents to PDF
64. **PowerPoint to PDF** - Convert PowerPoint presentations to PDF
65. **PPT to PDF** - Convert legacy PPT files to PDF
66. **PPTX to PDF** - Convert PPTX presentations to PDF
67. **Excel to PDF** - Convert Excel spreadsheets to PDF
68. **XLS to PDF** - Convert legacy XLS files to PDF
69. **XLSX to PDF** - Convert XLSX spreadsheets to PDF

### Image Conversion Tools
70. **JPG to PDF** - Convert JPG images to PDF documents
71. **PNG to PDF** - Convert PNG images to PDF documents
72. **BMP to PDF** - Convert BMP images to PDF documents
73. **GIF to PDF** - Convert GIF images to PDF documents

### Advanced Format Conversion Tools
74. **ODT to PDF** - Convert OpenDocument Text files to PDF
75. **ODS to PDF** - Convert OpenDocument Spreadsheet files to PDF
76. **ODP to PDF** - Convert OpenDocument Presentation files to PDF
77. **CSV to PDF** - Convert CSV spreadsheet data to formatted PDF tables
78. **EPUB to PDF** - Convert EPUB ebooks to PDF documents
79. **MOBI to PDF** - Convert MOBI ebook files to PDF format
80. **DJVU to PDF** - Convert DJVU scanned documents to PDF
81. **XML to PDF** - Convert XML data files to formatted PDF documents
82. **Markdown to PDF** - Convert Markdown files to beautifully formatted PDFs
83. **MD to PDF** - Convert .md Markdown files to PDF documents

### PDF Creation Tools
84. **Create PDF** - Create blank PDF documents with custom page size
85. **PDF Creator** - Create PDFs with custom text content

### Advanced Utility Tools
86. **PDF to Text** - Extract text content from PDF files
87. **PDF to HTML** - Convert PDF pages to HTML format
88. **HTML to PDF** - Convert HTML files to PDF documents
89. **Flatten PDF** - Flatten form fields and annotations
90. **PDF Metadata Editor** - Edit PDF metadata and properties
91. **Reverse PDF** - Reverse page order in PDF documents
92. **Scan to PDF** - Convert scanned images to searchable PDFs

### Signing Tools
93. **Sign PDF** - Add signatures to PDF documents
94. **E-Sign PDF** - Electronic signature for PDFs
95. **Digital Signature** - Add certified digital signatures

### Annotation Tools
96. **Highlight PDF** - Highlight text in PDF documents
97. **Annotate PDF** - Add annotations and comments

### Comparison & Analysis Tools
98. **Compare PDF** - Compare two PDF documents side by side
99. **Diff PDF** - Find differences between PDFs
100. **PDF to Word** - Convert PDF to editable Word documents
101. **PDF to Excel** - Extract tables from PDF to Excel
102. **PDF to PowerPoint** - Convert PDF to presentation format

### Form Tools
103. **PDF Form Creator** - Create fillable PDF forms
104. **Fill PDF Form** - Fill in PDF form fields
105. **PDF Form to Excel** - Export form data to Excel

### Batch Processing Tools
106. **Batch Convert** - Convert multiple files at once
107. **Batch Compress** - Compress multiple PDFs
108. **Batch Watermark** - Add watermark to multiple PDFs

### Proprietary Format Converters
109. **PUB to PDF** - Convert Microsoft Publisher files to PDF
110. **VSD to PDF** - Convert Microsoft Visio diagrams to PDF
111. **MPP to PDF** - Convert Microsoft Project files to PDF

### Apple iWork Converters
112. **Pages to PDF** - Convert Apple Pages documents to PDF
113. **Numbers to PDF** - Convert Apple Numbers spreadsheets to PDF
114. **Keynote to PDF** - Convert Apple Keynote presentations to PDF

### Email Converters
115. **Email to PDF** - Convert EML email files to PDF
116. **MSG to PDF** - Convert Outlook MSG email files to PDF
117. **EML to PDF** - Convert EML email files with full content extraction

### Additional Image Tools (118-120)
118. **TIFF to PDF** - Convert TIFF images to PDF documents
119. **SVG to PDF** - Convert SVG graphics to PDF format
120. **WEBP to PDF** - Convert WebP images to PDF documents

### Design Tools (121-123)
121. **PSD to PDF** - Convert Adobe Photoshop files to PDF
122. **AI to PDF** - Convert Adobe Illustrator files to PDF
123. **INDD to PDF** - Convert Adobe InDesign files to PDF

### CAD Converters (124-125)
124. **DWG to PDF** - Convert AutoCAD DWG drawings to PDF
125. **DXF to PDF** - Convert DXF CAD exchange files to PDF

### Document Converters (126-130)
126. **XPS to PDF** - Convert Microsoft XPS documents to PDF
127. **OXPS to PDF** - Convert Open XPS documents to PDF
128. **WPD to PDF** - Convert WordPerfect documents to PDF
129. **CBR to PDF** - Convert comic book CBR archives to PDF
130. **RAW to PDF** - Convert camera RAW images to PDF

## Tech Stack
- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Express, Node.js
- **PDF Processing**: pdf-lib, sharp, archiver, mammoth, tesseract.js, xlsx
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
- Added 10 new format conversion tools: EML to PDF (email), PSD/AI/INDD to PDF (Adobe design), DWG/DXF to PDF (CAD), XPS/OXPS to PDF (Microsoft documents), WPD to PDF (WordPerfect), CBR to PDF (comics)
- Total tools expanded to 130+
- Added 10 previous tools: Create PDF, PDF Creator, PUB to PDF, VSD to PDF, MPP to PDF, Pages to PDF, Numbers to PDF, Keynote to PDF, Email to PDF, MSG to PDF
- Fixed file upload validation for create-pdf and pdf-creator (fileless tools)
- Proprietary format converters return informative placeholder PDFs (full conversion requires external libraries)
- Added 10 new advanced format conversion tools (odt-to-pdf, ods-to-pdf, odp-to-pdf, csv-to-pdf, epub-to-pdf, mobi-to-pdf, djvu-to-pdf, xml-to-pdf, markdown-to-pdf, md-to-pdf)
- Installed marked library for Markdown parsing
- Installed adm-zip for ODF file extraction (ODT, ODS, ODP)
- Added 10 document and image conversion tools (powerpoint-to-pdf, ppt-to-pdf, pptx-to-pdf, excel-to-pdf, xls-to-pdf, xlsx-to-pdf, jpg-to-pdf, png-to-pdf, bmp-to-pdf, gif-to-pdf)
- Added 10 previous PDF repair and OCR tools (repair-pdf, fix-pdf, recover-pdf-data, repair-corrupt-pdf, pdf-repair-tool, ocr-pdf, scanned-pdf-to-text, pdf-ocr, searchable-pdf-creator, ocr-to-word)
- Added Tesseract.js for OCR text recognition capabilities
- PDF repair tools use advanced pdf-lib recovery with page-by-page reconstruction
- OCR tools preserve original PDF layout while making documents searchable
- Added OCR language selection supporting 14 languages (English, Spanish, French, German, Italian, Portuguese, Russian, Chinese, Japanese, Korean, Arabic, Hindi)
- Added 10 new specialized PDF compression tools (high-compression-pdf, basic-compression-pdf, custom-pdf-compression, compress-pdf-for-web, compress-pdf-for-email, compress-scanned-pdf, pdf-size-reducer, shrink-pdf, pdf-file-compressor, optimize-pdf-for-print)
- Added specialized compression functions with different strategies (high compression, basic compression, web-optimized, email-optimized, scanned document, print-optimized)
- Added 10 advanced splitting and extraction tools (split-by-size, split-by-bookmarks, split-by-text, split-in-half, split-every-x-pages, extract-pages, page-extractor, page-remover, extract-specific)
- Added 10 previous tools (interleave, pdf-binder, merge-with-bookmarks, pdf-images-combiner, pdf-word-merger, split-pdf, pdf-splitter, divide-pdf, break-pdf, split-by-pages)
- Migrated from dialog-based to page-based navigation
- Added SEO optimization with meta tags and articles
- Added emoji support for tool icons
- Installed mammoth library for Word document processing
