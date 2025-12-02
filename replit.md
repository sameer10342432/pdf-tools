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

- Added 10 new image processing and manipulation tools (December 2025):
  
  **Professional Format Conversion:**
  - **AI to JPG**: Convert Adobe Illustrator AI files to high-quality JPG format
  - **AI to PNG**: Convert Adobe Illustrator AI files to PNG with transparency
  - **INDD to JPG**: Convert Adobe InDesign files to JPG format

  **Image Flip Tools:**
  - **Flip Image Vertical**: Flip images vertically (upside down)
  - **Flip Image Horizontal**: Flip images horizontally (mirror)

  **Image Adjustment Tools:**
  - **Adjust Brightness**: Increase or decrease image brightness with slider control
  - **Adjust Contrast**: Adjust image contrast levels with slider control
  - **Adjust Saturation**: Control color saturation with slider control
  - **Image Sharpen**: Enhance image clarity and details with adjustable sharpening
  - **Image Blur**: Apply blur effect to images with adjustable intensity

  All adjustment tools feature real-time slider controls for precise adjustments. Processing uses Sharp library for high-quality output with ImageMagick fallback.

- Added 10 new image manipulation and creative tools (December 2025):
  
  **Image Effect Tools:**
  - **Grayscale Image**: Convert color images to professional black and white
  - **Invert Image Colors**: Create negative/inverted color effect for images
  - **Image Filter Sepia**: Apply warm sepia tones for vintage photography look
  - **Image Filter Vintage**: Add nostalgic faded vintage effect with warm tones
  - **Image Filter B&W**: Professional black & white conversion with contrast adjustment
  
  **Image Border and Shape Tools:**
  - **Add Border to Image**: Add customizable borders with color picker and width slider
  - **Round Image Corners**: Add rounded corners to images with adjustable radius
  
  **Creative and Text Tools:**
  - **Meme Generator**: Create memes with top/bottom text, customizable font size and colors
  - **Add Text to Photo**: Add custom text overlays with position and style controls
  - **Split Image**: Split images into grids (2x2, 3x3, 4x4, etc.) for social media

  All tools use Sharp library for high-quality image processing. Meme generator and text tools use SVG compositing with proper text escaping for security. Split tool generates ZIP files containing all image parts.

- Added 10 new image composition and utility tools (December 2025):
  
  **Image Composition Tools:**
  - **Merge Images**: Combine multiple images into a single composite image with layout options (horizontal, vertical, grid)
  - **Image Combiner Horizontal**: Combine images side by side horizontally
  - **Image Combiner Vertical**: Stack images vertically in a single column
  
  **Favicon and Icon Tools:**
  - **Favicon Generator**: Generate favicon.ico and other sized icons from an image (16x16 to 512x512)
  - **ICO to PNG**: Convert ICO files to PNG format
  - **PNG to ICO**: Convert PNG images to ICO format for favicon use
  
  **Animation Conversion Tools:**
  - **APNG to GIF**: Convert animated PNG files to GIF format for universal compatibility
  - **GIF to APNG**: Convert GIF animations to APNG format for better quality
  
  **Utility Tools:**
  - **Image to ASCII Art**: Convert images to text-based ASCII art with customizable width
  - **Image Metadata Viewer**: View and extract EXIF, IPTC, and XMP metadata from images

  All composition tools support multi-file uploads with drag-and-drop interface. Sharp library handles image processing with high-quality output.

- Added 10 new advanced image processing and AI-powered tools (December 2025):
  
  **Privacy and Metadata Tools:**
  - **Remove Image Metadata**: Strip EXIF, GPS, camera info, and other metadata from images for privacy protection
  
  **Image Enhancement Tools:**
  - **Image Color Corrector**: Adjust brightness, contrast, saturation, and hue with slider controls
  - **Change Image DPI**: Modify image resolution (DPI/PPI) for print or web optimization
  - **Image Enlarger**: Upscale images 2x, 3x, or 4x using Lanczos interpolation algorithm
  - **Image Deblur**: Sharpen blurry images using advanced unsharp masking algorithms
  
  **AI-Powered Tools (Algorithmic Implementations):**
  - **AI Image Generator**: Generate abstract art patterns using algorithmic noise and gradient generation
  - **AI Photo Retouch**: Enhance photos with automatic brightness, contrast, and saturation optimization
  - **AI Object Remover**: Remove objects from images using content-aware blur (edge-preserving smoothing)
  - **AI Face Swapper**: Blend faces from two images using alpha compositing (requires 2 image uploads)
  - **Image to Sketch**: Convert photos to pencil sketch or line art using edge detection algorithms

  All AI tools use Sharp-based algorithmic processing without external API keys. The tools support real-time preview and adjustable parameters for customization.

## External Dependencies
- **PDF Processing Libraries**: `pdf-lib` (for core PDF manipulation), `sharp` (for image processing), `archiver` (for creating zip archives).
- **Document Conversion**: `mammoth` (for Word document processing), `xlsx` (for Excel processing), `tesseract.js` (for OCR text recognition), `marked` (for Markdown parsing), `adm-zip` (for ODF file extraction).
- **File Upload**: `multer` (server-side).