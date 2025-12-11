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
    - Over 150 distinct tools covering PDF manipulation (merge, split, compress, convert, edit, secure, repair, OCR), and extensive image processing (conversion across numerous formats like HEIC, WebP, AVIF, RAW, SVG, EPS, PSD, AI; editing, filtering, composition, metadata handling, and AI-powered enhancements like object removal and image generation).
    - Support for various document conversions (Word, HTML, TXT, Excel, CSV, JSON, PPT, ODT, ODS, ODP) and ebook formats (EPUB, MOBI).
    - New universal file converter tools: File Converter, Document Converter, EPUB to TXT, XML to CSV, XML to JSON, JSON to XML, JSON to YAML, YAML to JSON, YAML to CSV, and CSV to YAML.
    - **10 New Developer Utility Tools** (December 2025): JS Beautifier, SQL Formatter, SQL Minifier, Lorem Ipsum Generator, UUID Generator, MD5 Hash Generator, SHA-256 Hash Generator, Base64 Encode, Base64 Decode, and URL Encoder. These tools use text input areas instead of file uploads for direct text processing.
    - **10 New Audio Conversion Tools** (December 2025): M4A to MP3, MP3 to M4A, FLAC to MP3, MP3 to FLAC, OGG to MP3, MP3 to OGG, AAC to MP3, MP3 to AAC, Video to MP3, and MP4 to MP3. These tools leverage FFmpeg for high-quality audio conversion with configurable bitrate options.
    - **10 New Audio Processing Tools** (December 2025): AVI to MP3, MOV to MP3, Cut Audio, Trim Audio, Audio Trimmer, Merge Audio, Combine Audio Files, Audio Joiner (with crossfade), Change Audio Volume, and Increase Audio Volume. These tools support multi-file operations for merging and include input validation for time formats and volume levels.
    - **10 New Advanced Audio Tools** (December 2025): Mute Video (removes audio from video files using FFmpeg), Voice Recorder (browser-based recording using MediaRecorder API), Online Voice Recorder (with playback and download), Text to Speech (using Web Speech API with voice selection), Speech to Text / Audio to Text / Transcribe Audio (audio transcription using Tesseract.js), Audio Metadata Editor / MP3 Tag Editor (view and edit ID3 tags), and Audio Visualizer (real-time waveform/frequency visualization using Web Audio API). Browser-based tools include capability detection with fallback UI for unsupported browsers.
    
    - **10 New Video Speed/Effect Tools** (December 2025): Change Video Speed, Speed Up Video, Slow Down Video, Loop Video, Stabilize Video, Video Deshaker, Reverse Video, Video Reverser, Add Filter to Video, and Video Color Correction. These tools use FFmpeg for video processing with options for speed control, loop creation, stabilization, reversal, and color grading.
    - **10 New Color/CSS Design Tools** (December 2025): Color Picker from Screen (uses EyeDropper API), Color Picker from Image, HEX to RGB Converter, RGB to HEX Converter, HEX to HSL Converter, RGB to CMYK Converter, Color Palette Generator (creates harmonious palettes), CSS Gradient Generator (linear, radial, conic), Box Shadow Generator (with presets), and Border Radius Generator. These tools provide instant color format conversions and CSS code generation with visual previews and one-click copying.
    - **35 AI-Powered Content Generation Tools** (December 2025): Using OpenAI GPT-4o integration for intelligent content generation:
      - *Original 10 Tools*: AI Logo Maker, AI Ad Copy Generator, AI Blog Post Writer, AI Email Writer, AI Social Media Generator, AI Product Description Generator, AI Video Script Writer, AI Music Generator, AI Code Generator, AI SQL Query Generator.
      - *10 Business/Productivity Tools*: AI Regex Generator (pattern matching from natural language), AI Excel Formula Generator (spreadsheet formulas), AI App Builder (app architecture and code), AI Chatbot Builder (conversation flows), AI Data Analyzer (data insights), AI Meeting Summarizer (meeting notes), AI Note Taker (structured notes), AI Homework Helper (educational assistance), AI Story Generator (creative writing), AI Resume Builder (professional resumes).
      - *15 New AI Tools*: AI Cover Letter Generator (professional cover letters), AI Interior Design (room design ideas), AI Tattoo Generator (custom tattoo designs), AI Fashion Designer (outfit recommendations), AI Recipe Generator (recipes from ingredients), AI Workout Planner (fitness plans), AI Travel Itinerary (trip planning), AI Horoscope Generator (personalized horoscopes), AI Dream Interpreter (dream analysis), AI Name Generator (business/product names), AI Slogan Generator (catchy slogans), AI Code Debugger (bug fixing), AI Code Reviewer (code analysis), AI Code Translator (language conversion), AI Unit Test Generator (test cases).
    - Secure file handling with automatic deletion after 5 minutes.
    - Real-time processing progress indication.
    - Page-based navigation for improved SEO and user experience.
    - Image processing tools utilize a multi-tier fallback system (Sharp, Ghostscript, ImageMagick).
    - AI-powered image tools use Sharp-based algorithmic processing for features like image generation, photo retouch, object removal, and face swapping.
    - Document conversions (PPT, ODT, ODS, ODP) leverage LibreOffice for accurate rendering.

## External Dependencies
- **PDF Processing Libraries**: `pdf-lib`
- **Image Processing Libraries**: `sharp`
- **Audio/Video Processing**: `ffmpeg` (system dependency for audio conversion and video-to-audio extraction)
- **Archiving**: `archiver`
- **Document Processing**: `mammoth` (Word), `xlsx` (Excel), `tesseract.js` (OCR), `marked` (Markdown), `adm-zip` (ODF/EPUB extraction).
- **File Upload**: `multer`