import { z } from "zod";

export const pdfToolTypes = [
  "merge",
  "split",
  "compress",
  "pdf-to-images",
  "images-to-pdf",
  "rotate",
  "delete-pages",
  "merge-alternately",
  "add-page-numbers",
  "watermark",
  "protect",
  "unlock",
  "interleave-pdf",
  "pdf-binder",
  "merge-with-bookmarks",
  "pdf-images-combiner",
  "pdf-word-merger",
  "split-pdf",
  "pdf-splitter",
  "divide-pdf",
  "break-pdf",
  "split-by-pages",
  "split-by-size",
  "split-by-bookmarks",
  "split-by-text",
  "split-in-half",
  "split-every-x-pages",
  "extract-pages",
  "page-extractor",
  "page-remover",
  "extract-specific",
] as const;

export type PdfToolType = (typeof pdfToolTypes)[number];

export const pdfToolSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  icon: z.string(),
  type: z.enum(pdfToolTypes),
  color: z.string(),
  emoji: z.string(),
  metaTitle: z.string(),
  metaDescription: z.string(),
  seoArticle: z.string(),
});

export type PdfTool = z.infer<typeof pdfToolSchema>;

export const processRequestSchema = z.object({
  toolType: z.enum(pdfToolTypes),
  options: z.record(z.any()).optional(),
});

export type ProcessRequest = z.infer<typeof processRequestSchema>;

export const processResponseSchema = z.object({
  success: z.boolean(),
  filename: z.string().optional(),
  downloadUrl: z.string().optional(),
  error: z.string().optional(),
  pageCount: z.number().optional(),
});

export type ProcessResponse = z.infer<typeof processResponseSchema>;

export const uploadedFileSchema = z.object({
  id: z.string(),
  name: z.string(),
  size: z.number(),
  type: z.string(),
  file: z.any(),
});

export type UploadedFile = z.infer<typeof uploadedFileSchema>;

export const toolOptionsSchema = z.object({
  pages: z.string().optional(),
  rotation: z.enum(["90", "180", "270"]).optional(),
  compressionLevel: z.enum(["low", "medium", "high"]).optional(),
  imageFormat: z.enum(["jpg", "png"]).optional(),
  watermarkText: z.string().optional(),
  watermarkPosition: z.enum(["center", "top-left", "top-right", "bottom-left", "bottom-right"]).optional(),
  pageNumberPosition: z.enum(["bottom-center", "bottom-left", "bottom-right", "top-center", "top-left", "top-right"]).optional(),
  password: z.string().optional(),
  unlockPassword: z.string().optional(),
  parts: z.number().optional(),
  sections: z.string().optional(),
  sizeLimitMB: z.number().optional(),
  searchText: z.string().optional(),
  pageInterval: z.number().optional(),
});

export type ToolOptions = z.infer<typeof toolOptionsSchema>;

export const pdfTools: PdfTool[] = [
  {
    id: "merge",
    name: "Merge PDF",
    description: "Combine multiple PDF files into one document",
    icon: "Layers",
    type: "merge",
    color: "bg-red-500",
    emoji: "📎",
    metaTitle: "Merge PDF Online Free - Combine PDF Files Instantly | PDF Tools",
    metaDescription: "Merge multiple PDF files into one document online for free. Fast, secure, and easy-to-use PDF combiner. No registration required.",
    seoArticle: `<h2>Merge PDF Files Online - The Ultimate Guide</h2>
<p>Combining multiple PDF documents into a single file has never been easier. Our free online PDF merger tool allows you to seamlessly join PDFs without installing any software. Whether you're consolidating reports, combining contracts, or organizing research papers, this tool handles it all with precision.</p>

<h2>Why Use Our PDF Merge Tool?</h2>
<p>Our PDF merger stands out for its simplicity and reliability. Simply drag and drop your files, arrange them in your preferred order, and click merge. The entire process takes just seconds, regardless of file size. Your merged PDF maintains the original quality of each document, preserving formatting, images, and fonts exactly as they appear in the source files.</p>

<h2>Key Features of Our PDF Combiner</h2>
<p>Security is our top priority. All uploaded files are processed on secure servers and automatically deleted after processing. You can merge unlimited PDFs without any file size restrictions. The tool supports all PDF versions and handles password-protected files when you provide the correct password.</p>

<h2>How to Merge PDFs Step by Step</h2>
<p>Start by uploading your PDF files using the upload button or drag-and-drop area. Once uploaded, you can reorder the files by dragging them into your desired sequence. Preview each document to ensure correct ordering. Click the merge button to combine your files, and download the unified PDF instantly.</p>

<h2>Perfect for Business and Personal Use</h2>
<p>Professionals use our tool daily for creating comprehensive proposals, merging financial statements, and combining legal documents. Students find it invaluable for compiling research materials and creating study guides. Whatever your need, our PDF merger delivers consistent, professional results every time.</p>`,
  },
  {
    id: "split",
    name: "Split PDF",
    description: "Extract pages or split into separate files",
    icon: "Scissors",
    type: "split",
    color: "bg-orange-500",
    emoji: "✂️",
    metaTitle: "Split PDF Online Free - Extract Pages from PDF | PDF Tools",
    metaDescription: "Split PDF files into multiple documents or extract specific pages online for free. Fast and secure PDF splitter with no installation needed.",
    seoArticle: `<h2>Split PDF Files Online - Complete Guide</h2>
<p>Need to extract specific pages from a large PDF or divide a document into smaller parts? Our free online PDF splitter makes it effortless. Whether you're separating chapters of an ebook, extracting individual invoices, or creating handouts from a presentation, this tool provides the precision you need.</p>

<h2>Flexible Splitting Options</h2>
<p>Our PDF splitter offers multiple ways to divide your documents. Extract specific page ranges like pages 1-5 or 10-15. Split every page into individual PDFs. Divide into equal parts automatically. Remove unwanted pages while keeping the rest. The choice is yours, and the process is instantaneous.</p>

<h2>Maintain Document Quality</h2>
<p>When you split a PDF with our tool, each resulting file maintains the exact quality of the original. Fonts, images, formatting, and interactive elements remain intact. Your split PDFs are ready for immediate use, whether for printing, sharing, or archiving.</p>

<h2>How to Split Your PDF</h2>
<p>Upload your PDF file using our secure uploader. Choose your splitting method: by page range, fixed intervals, or specific pages. Preview the results before confirming. Download individual files or get all split PDFs in a convenient ZIP archive. The entire process takes just moments.</p>

<h2>Secure and Private Processing</h2>
<p>Your documents are handled with the utmost security. All files are encrypted during upload and automatically deleted from our servers after processing. No one can access your documents, and no data is stored. Split your confidential documents with complete peace of mind.</p>`,
  },
  {
    id: "compress",
    name: "Compress PDF",
    description: "Reduce PDF file size while maintaining quality",
    icon: "Archive",
    type: "compress",
    color: "bg-amber-500",
    emoji: "🗜️",
    metaTitle: "Compress PDF Online Free - Reduce PDF File Size | PDF Tools",
    metaDescription: "Compress PDF files online for free without losing quality. Reduce PDF size by up to 90%. Fast, secure compression with no software needed.",
    seoArticle: `<h2>Compress PDF Files Online - Reduce Size Instantly</h2>
<p>Large PDF files can be problematic for email attachments, website uploads, and storage. Our free online PDF compressor reduces file sizes dramatically while preserving visual quality. Shrink your PDFs by up to 90% without noticeable quality loss, making sharing and storing documents effortless.</p>

<h2>Smart Compression Technology</h2>
<p>Our compression algorithm intelligently analyzes your PDF content and applies optimal compression settings. Images are resized and recompressed using advanced techniques. Redundant data is eliminated. Font subsets are optimized. The result is a significantly smaller file that looks virtually identical to the original.</p>

<h2>Choose Your Compression Level</h2>
<p>We offer three compression levels to suit your needs. Low compression maintains maximum quality with moderate size reduction. Medium compression provides the best balance between quality and file size. High compression achieves maximum size reduction, ideal for web uploads or email attachments.</p>

<h2>Easy Three-Step Process</h2>
<p>Compressing your PDF takes just seconds. Upload your file using our drag-and-drop interface. Select your preferred compression level. Download your optimized PDF immediately. There's no waiting, no registration, and no limits on how many files you can compress.</p>

<h2>Perfect for Email and Web</h2>
<p>Email providers typically limit attachment sizes to 25MB. Our compressor helps you fit large documents within these limits. Web developers use our tool to optimize PDFs for faster page loading. Businesses reduce storage costs by compressing archived documents. Whatever your goal, compression makes PDF management easier.</p>`,
  },
  {
    id: "pdf-to-images",
    name: "Extract Pages",
    description: "Extract each page as a separate PDF file",
    icon: "Image",
    type: "pdf-to-images",
    color: "bg-emerald-500",
    emoji: "🖼️",
    metaTitle: "Extract PDF Pages Online Free - Separate PDF Pages | PDF Tools",
    metaDescription: "Extract individual pages from PDF files online for free. Convert each PDF page to separate files instantly. No software installation required.",
    seoArticle: `<h2>Extract PDF Pages Online - Separate Pages Instantly</h2>
<p>Sometimes you need individual pages from a multi-page PDF document. Our free page extraction tool lets you separate every page into its own file with a single click. Perfect for creating individual handouts, sharing specific pages, or organizing document sections separately.</p>

<h2>Automatic Page Separation</h2>
<p>Our extraction tool processes your entire PDF and creates individual files for each page automatically. A 50-page document becomes 50 separate PDFs, each perfectly formatted and ready for use. The original page quality, formatting, and all content elements are preserved in every extracted page.</p>

<h2>Convenient Download Options</h2>
<p>After extraction, download pages individually or get all extracted pages in a single ZIP file for convenience. Each file is named systematically for easy organization. You can immediately share specific pages without sending the entire document, protecting sensitive information in other sections.</p>

<h2>How Page Extraction Works</h2>
<p>Upload your PDF document using our secure uploader. Our tool automatically processes and separates each page. Preview the extracted pages to verify content. Download individual pages or the complete set. The process is fast, typically completing in seconds regardless of document length.</p>

<h2>Use Cases for Page Extraction</h2>
<p>Teachers extract quiz pages from textbooks for distribution. Legal professionals separate contract pages for individual signing. Researchers isolate specific pages for citation purposes. Event planners extract registration forms from information packets. The applications are endless, and our tool makes it simple.</p>`,
  },
  {
    id: "images-to-pdf",
    name: "Images to PDF",
    description: "Convert multiple images into a single PDF",
    icon: "FileImage",
    type: "images-to-pdf",
    color: "bg-teal-500",
    emoji: "📷",
    metaTitle: "Images to PDF Converter Online Free - JPG PNG to PDF | PDF Tools",
    metaDescription: "Convert JPG, PNG, and other images to PDF online for free. Combine multiple images into one PDF document. Fast and easy image to PDF converter.",
    seoArticle: `<h2>Convert Images to PDF Online - Free and Fast</h2>
<p>Transform your images into professional PDF documents with our free online converter. Whether you're scanning receipts, creating photo albums, or compiling product catalogs, converting images to PDF makes sharing and printing easier. Our tool supports JPG, PNG, GIF, BMP, and TIFF formats.</p>

<h2>Combine Multiple Images Into One PDF</h2>
<p>Upload multiple images and combine them into a single, organized PDF document. Arrange images in your preferred order by simply dragging and dropping. Each image becomes a page in your PDF, maintaining original quality and dimensions. Create professional-looking documents from your photo collections instantly.</p>

<h2>Preserve Image Quality</h2>
<p>Our converter maintains the full resolution and quality of your original images. Colors remain vibrant, details stay sharp, and image integrity is preserved throughout the conversion process. The resulting PDF looks exactly as you expect, whether viewed on screen or printed.</p>

<h2>Simple Conversion Process</h2>
<p>Converting images to PDF takes just three steps. Upload your images using drag-and-drop or file selection. Arrange them in your desired order. Click convert and download your PDF. No registration required, no watermarks added, and no limits on the number of conversions.</p>

<h2>Perfect for Documentation</h2>
<p>Digitize paper documents by photographing and converting to PDF. Create portfolios for job applications or client presentations. Compile warranty cards, receipts, and manuals into organized PDF archives. Share photo collections as easy-to-view PDF albums. Our image to PDF converter serves countless purposes.</p>`,
  },
  {
    id: "rotate",
    name: "Rotate PDF",
    description: "Rotate pages 90, 180, or 270 degrees",
    icon: "RotateCw",
    type: "rotate",
    color: "bg-sky-500",
    emoji: "🔄",
    metaTitle: "Rotate PDF Online Free - Rotate PDF Pages 90 180 270 | PDF Tools",
    metaDescription: "Rotate PDF pages online for free. Turn PDF pages 90, 180, or 270 degrees. Fix upside-down or sideways scanned documents instantly.",
    seoArticle: `<h2>Rotate PDF Pages Online - Fix Document Orientation</h2>
<p>Scanned documents often end up sideways or upside down. Our free online PDF rotation tool fixes orientation issues instantly. Rotate individual pages or entire documents by 90, 180, or 270 degrees with a single click. Perfect for correcting scanning errors and ensuring documents display correctly.</p>

<h2>Flexible Rotation Options</h2>
<p>Our tool offers complete control over page rotation. Rotate all pages uniformly for consistent orientation. Select specific pages to rotate while leaving others unchanged. Choose clockwise or counterclockwise rotation in 90-degree increments. Preview changes before saving to ensure perfect results.</p>

<h2>Maintain Document Integrity</h2>
<p>Rotating pages with our tool preserves all document elements perfectly. Text, images, annotations, and interactive features remain intact and properly oriented. Links continue to work, forms remain fillable, and bookmarks stay functional. Your rotated PDF is immediately ready for use.</p>

<h2>How to Rotate Your PDF</h2>
<p>Upload your PDF document to our secure platform. Select the pages you want to rotate. Choose your rotation angle: 90, 180, or 270 degrees. Preview the rotated document. Download your correctly oriented PDF. The entire process takes just seconds, even for large documents.</p>

<h2>Common Rotation Scenarios</h2>
<p>Fix landscape pages scanned in portrait mode. Correct documents scanned upside down. Adjust architectural drawings for proper viewing. Orient legal documents for signing. Prepare presentations with mixed page orientations. Whatever your rotation need, our tool handles it effortlessly.</p>`,
  },
  {
    id: "delete-pages",
    name: "Delete Pages",
    description: "Remove specific pages from your PDF",
    icon: "Trash2",
    type: "delete-pages",
    color: "bg-indigo-500",
    emoji: "🗑️",
    metaTitle: "Delete PDF Pages Online Free - Remove Pages from PDF | PDF Tools",
    metaDescription: "Delete unwanted pages from PDF files online for free. Remove specific pages instantly. Easy PDF page remover with no software installation.",
    seoArticle: `<h2>Delete PDF Pages Online - Remove Unwanted Content</h2>
<p>Need to remove certain pages from a PDF document? Our free online page deletion tool makes it simple. Remove cover pages, blank pages, or any unwanted content without affecting the rest of your document. Perfect for cleaning up scanned documents, removing outdated information, or customizing PDFs for specific recipients.</p>

<h2>Selective Page Removal</h2>
<p>Our tool gives you complete control over which pages to delete. Remove a single page or multiple pages at once. Delete consecutive page ranges or scattered individual pages. Preview your document to identify exactly which pages to remove. The remaining pages are automatically renumbered.</p>

<h2>Preserve Document Quality</h2>
<p>Deleting pages doesn't affect the quality of remaining content. Text, images, and formatting stay perfect. Interactive elements like links and bookmarks are preserved or updated appropriately. Your edited PDF maintains professional quality suitable for any purpose.</p>

<h2>Easy Deletion Process</h2>
<p>Upload your PDF using our secure uploader. Navigate through pages using thumbnails or preview. Select pages to delete by clicking or entering page numbers. Confirm deletion and download your streamlined PDF. Changes are applied instantly with no waiting.</p>

<h2>Practical Applications</h2>
<p>Remove blank pages from scanned documents. Delete cover pages before sharing content. Remove appendices or attachments from reports. Clean up trial documents by removing watermarked pages. Create custom versions of documents for different audiences. Page deletion opens many possibilities.</p>`,
  },
  {
    id: "merge-alternately",
    name: "Merge Alternately",
    description: "Combine two PDFs by alternating pages",
    icon: "Shuffle",
    type: "merge-alternately",
    color: "bg-violet-500",
    emoji: "🔀",
    metaTitle: "Merge PDF Alternately Online Free - Interleave PDF Pages | PDF Tools",
    metaDescription: "Merge two PDF files by alternating pages online for free. Perfect for combining front and back scans. Easy alternate page merging tool.",
    seoArticle: `<h2>Merge PDFs Alternately - Combine Front and Back Pages</h2>
<p>When scanning double-sided documents on a single-sided scanner, you end up with separate files for front and back pages. Our alternate merge tool combines these files perfectly, interleaving pages to recreate the original document order. This specialized tool solves a common scanning challenge effortlessly.</p>

<h2>How Alternate Merging Works</h2>
<p>Upload two PDF files: one containing front pages (1, 3, 5...) and another with back pages (2, 4, 6...). Our tool interleaves them automatically, creating a single document with pages in correct order. The result matches the original double-sided document perfectly.</p>

<h2>Perfect for Duplex Reconstruction</h2>
<p>Single-sided scanners are common in homes and small offices. Scanning double-sided documents requires scanning all front pages, then flipping and scanning all back pages. Our alternate merge tool reunites these halves seamlessly, saving you from manual page-by-page organization.</p>

<h2>Simple Three-Step Process</h2>
<p>Upload your front-pages PDF first, then your back-pages PDF. Our tool automatically calculates the interleaving pattern. Preview the combined result to verify correct page order. Download your perfectly merged document instantly. No complex settings or configurations needed.</p>

<h2>Additional Use Cases</h2>
<p>Beyond scan reconstruction, alternate merging serves other purposes. Combine matching pages from different document versions for comparison. Interleave question sheets with answer sheets. Merge translated documents with originals page by page. Creative applications abound for this unique merging method.</p>`,
  },
  {
    id: "add-page-numbers",
    name: "Add Page Numbers",
    description: "Insert page numbers to your PDF document",
    icon: "Hash",
    type: "add-page-numbers",
    color: "bg-purple-500",
    emoji: "🔢",
    metaTitle: "Add Page Numbers to PDF Online Free - Number PDF Pages | PDF Tools",
    metaDescription: "Add page numbers to PDF files online for free. Customize position and format. Professional PDF page numbering tool with no installation needed.",
    seoArticle: `<h2>Add Page Numbers to PDF - Professional Document Formatting</h2>
<p>Page numbers make documents easier to navigate and reference. Our free online tool adds professional page numbering to any PDF document. Whether preparing reports, manuscripts, or presentations, proper page numbering adds polish and functionality to your documents.</p>

<h2>Customizable Positioning</h2>
<p>Place page numbers exactly where you want them. Choose from six positions: top-left, top-center, top-right, bottom-left, bottom-center, or bottom-right. Select the position that best complements your document layout and avoids overlapping with existing content.</p>

<h2>Professional Appearance</h2>
<p>Our page numbers integrate seamlessly with your document's appearance. Clean, readable fonts ensure numbers are clearly visible without distracting from content. Consistent sizing and placement throughout the document maintains professional appearance.</p>

<h2>How to Add Page Numbers</h2>
<p>Upload your PDF document using our secure uploader. Select your preferred position for page numbers. Preview the numbered document to confirm placement. Download your professionally numbered PDF. The process takes seconds regardless of document length.</p>

<h2>When to Use Page Numbers</h2>
<p>Academic papers require page numbers for proper citation. Business reports benefit from numbered pages for easy reference during meetings. Legal documents need page numbers for record-keeping. Manuals and guides are more navigable with numbered pages. Almost any multi-page document improves with page numbering.</p>`,
  },
  {
    id: "watermark",
    name: "Add Watermark",
    description: "Add text watermark to your PDF pages",
    icon: "Stamp",
    type: "watermark",
    color: "bg-pink-500",
    emoji: "💧",
    metaTitle: "Add Watermark to PDF Online Free - PDF Watermark Tool | PDF Tools",
    metaDescription: "Add text watermarks to PDF files online for free. Customize text, position, and opacity. Protect your documents with professional watermarks.",
    seoArticle: `<h2>Add Watermark to PDF - Protect Your Documents</h2>
<p>Watermarks serve multiple purposes: protecting intellectual property, indicating document status, or branding materials. Our free online tool adds customizable text watermarks to any PDF document. Mark documents as confidential, add your company name, or indicate draft status with professional-looking watermarks.</p>

<h2>Customizable Watermark Options</h2>
<p>Create watermarks that match your needs perfectly. Enter any text for your watermark message. Position it in the center or any corner of the page. Adjust opacity to make watermarks prominent or subtle. The watermark appears on every page consistently.</p>

<h2>Professional Protection</h2>
<p>Watermarks deter unauthorized use of your documents. Mark confidential documents before sharing with external parties. Add copyright notices to protect creative works. Indicate draft status to prevent outdated versions from being used. Watermarks add a layer of professionalism and protection.</p>

<h2>Easy Watermarking Process</h2>
<p>Upload your PDF document to our secure platform. Enter your watermark text. Choose position and adjust opacity as desired. Preview the watermarked document. Download your protected PDF immediately. All pages receive consistent watermarking automatically.</p>

<h2>Common Watermark Uses</h2>
<p>Mark documents as CONFIDENTIAL, DRAFT, or APPROVED. Add company logos or names to branded materials. Include copyright notices on distributed documents. Indicate document origin for tracking purposes. Professional watermarking adds credibility and security to your PDF documents.</p>`,
  },
  {
    id: "protect",
    name: "Protect PDF",
    description: "Add password protection to your PDF",
    icon: "Lock",
    type: "protect",
    color: "bg-rose-500",
    emoji: "🔒",
    metaTitle: "Protect PDF with Password Online Free - Encrypt PDF | PDF Tools",
    metaDescription: "Password protect PDF files online for free. Add encryption to secure your documents. Easy PDF protection tool with no software installation.",
    seoArticle: `<h2>Protect PDF with Password - Secure Your Documents</h2>
<p>Sensitive documents require protection. Our free online PDF protection tool adds password encryption to prevent unauthorized access. Whether securing financial records, legal documents, or personal information, password protection ensures only authorized recipients can view your content.</p>

<h2>Strong Encryption Security</h2>
<p>We use industry-standard AES encryption to protect your documents. This same encryption standard is used by banks and government agencies. Your password-protected PDF is genuinely secure, not just superficially locked. Without the correct password, the content is completely inaccessible.</p>

<h2>Simple Protection Process</h2>
<p>Upload your PDF using our secure uploader. Enter your desired password. Confirm the password to prevent typos. Download your encrypted PDF. Share the password separately through a secure channel. Recipients must enter the password to view the document.</p>

<h2>Choose Strong Passwords</h2>
<p>For maximum security, use strong passwords with mixed characters, numbers, and symbols. Avoid common words or personal information. Longer passwords provide stronger protection. Store passwords securely and share them only through trusted communication channels.</p>

<h2>When to Protect PDFs</h2>
<p>Protect documents containing personal identification information. Secure financial statements and tax documents. Encrypt contracts before email transmission. Password-protect medical records and sensitive communications. Any document containing private information benefits from password protection.</p>`,
  },
  {
    id: "unlock",
    name: "Unlock PDF",
    description: "Remove password from protected PDF",
    icon: "Unlock",
    type: "unlock",
    color: "bg-cyan-500",
    emoji: "🔓",
    metaTitle: "Unlock PDF Online Free - Remove PDF Password | PDF Tools",
    metaDescription: "Unlock password-protected PDF files online for free. Remove PDF passwords when you know the password. Easy PDF unlocker tool.",
    seoArticle: `<h2>Unlock PDF - Remove Password Protection</h2>
<p>Have a password-protected PDF that you need to access freely? When you know the password, our free online tool removes the protection, creating an unlocked copy for unrestricted access. Perfect for documents you own but no longer need secured, or for creating shareable versions of protected files.</p>

<h2>How PDF Unlocking Works</h2>
<p>You must know the document password to unlock a PDF. Our tool doesn't crack or bypass passwords, which would be unethical and illegal. Instead, it authenticates with the correct password and creates an unprotected copy. This legitimate use ensures you can freely access documents you're authorized to view.</p>

<h2>Simple Unlocking Process</h2>
<p>Upload your protected PDF. Enter the document password when prompted. Our tool verifies the password and removes protection. Download your unlocked PDF ready for unrestricted use. The original file remains unchanged while you receive an unprotected copy.</p>

<h2>Why Unlock PDFs?</h2>
<p>Remove protection from old documents where passwords are no longer needed. Create shareable versions of protected files you own. Enable text selection and copying in previously restricted documents. Prepare documents for archiving without password dependencies.</p>

<h2>Legal and Ethical Use</h2>
<p>Only unlock PDFs you own or have explicit permission to access. Our tool requires the correct password, ensuring only authorized users can remove protection. Respect copyright and confidentiality when working with any document. Use this tool responsibly for legitimate purposes only.</p>`,
  },
  {
    id: "interleave-pdf",
    name: "Interleave PDF",
    description: "Merge PDF pages in alternating order",
    icon: "Layers",
    type: "interleave-pdf",
    color: "bg-orange-600",
    emoji: "📑",
    metaTitle: "Interleave PDF Online Free - Merge Pages Alternately | PDF Tools",
    metaDescription: "Interleave PDF pages from multiple documents online for free. Merge PDFs in alternating page order. Perfect for combining scanned documents.",
    seoArticle: `<h2>Interleave PDF Pages - Advanced Document Merging</h2>
<p>Interleaving PDF pages is a specialized merging technique where pages from multiple documents are combined in alternating order. This powerful feature is essential for reconstructing double-sided scans, creating comparison documents, or merging related materials in a logical sequence that alternates between sources.</p>

<h2>Understanding Page Interleaving</h2>
<p>When you interleave two PDFs, pages alternate between documents. Document A page 1, Document B page 1, Document A page 2, Document B page 2, and so on. This creates a unified document where content from both sources appears in an organized, alternating pattern throughout.</p>

<h2>Perfect for Scan Reconstruction</h2>
<p>Single-sided scanners require scanning front pages separately from back pages. Interleaving automatically reconstructs the original page order. Simply upload your fronts file and backs file, and our tool creates the properly ordered complete document. No manual page sorting required.</p>

<h2>How to Interleave PDFs</h2>
<p>Upload your first PDF document containing odd pages or primary content. Upload your second PDF with even pages or secondary content. Our tool automatically interleaves pages in the correct alternating sequence. Preview the result and download your merged document.</p>

<h2>Creative Applications</h2>
<p>Beyond scan reconstruction, interleaving serves creative purposes. Combine a document with its translation, alternating original and translated pages. Merge question papers with answer keys page by page. Create before-and-after comparison documents. Interleaving opens unique document organization possibilities.</p>

<h2>Maintaining Quality Throughout</h2>
<p>Each page in the interleaved document maintains its original quality. Text remains crisp, images stay sharp, and formatting is preserved perfectly. The resulting PDF is indistinguishable in quality from the source documents, ready for professional use immediately.</p>`,
  },
  {
    id: "pdf-binder",
    name: "PDF Binder",
    description: "Bind multiple PDFs into one organized document",
    icon: "BookOpen",
    type: "pdf-binder",
    color: "bg-blue-500",
    emoji: "📚",
    metaTitle: "PDF Binder Online Free - Bind Multiple PDFs Together | PDF Tools",
    metaDescription: "Bind multiple PDF files into one organized document online for free. Create professional bound PDF documents with our easy-to-use PDF binder tool.",
    seoArticle: `<h2>PDF Binder - Create Professionally Bound Documents</h2>
<p>Transform scattered PDF files into a single, professionally organized document with our free PDF Binder tool. Whether compiling reports, assembling portfolios, or creating comprehensive documentation packages, binding PDFs together creates cohesive, easy-to-navigate documents that impress recipients.</p>

<h2>More Than Simple Merging</h2>
<p>PDF binding goes beyond basic merging by focusing on document organization and presentation. When you bind PDFs, you create a unified document that feels intentionally assembled rather than hastily combined. The result is a polished, professional package ready for distribution or archiving.</p>

<h2>Organize Complex Document Sets</h2>
<p>Binding is ideal for complex document collections that need logical organization. Combine cover letters with resumes and portfolios. Assemble project documentation including specifications, drawings, and correspondence. Create comprehensive client packages with proposals, contracts, and supporting materials.</p>

<h2>Simple Binding Process</h2>
<p>Upload all PDF files you want to bind together. Arrange them in your desired order using drag-and-drop. Preview the bound document to verify organization. Download your professionally bound PDF. The process handles any number of files efficiently.</p>

<h2>Professional Applications</h2>
<p>Law firms bind case documents for court submissions. Architects compile project documentation for clients. Consultants create comprehensive proposal packages. HR departments assemble employee handbooks from multiple policy documents. Any profession requiring organized document compilation benefits from PDF binding.</p>

<h2>Perfect for Print and Digital</h2>
<p>Bound PDFs work excellently for both digital distribution and printing. Recipients can navigate easily through organized sections. Printed versions maintain professional appearance throughout. Your bound documents serve every purpose with consistent quality and organization.</p>`,
  },
  {
    id: "merge-with-bookmarks",
    name: "Merge PDF with Bookmarks",
    description: "Merge while preserving or adding bookmarks",
    icon: "Bookmark",
    type: "merge-with-bookmarks",
    color: "bg-green-500",
    emoji: "🔖",
    metaTitle: "Merge PDF with Bookmarks Online Free - Preserve Bookmarks | PDF Tools",
    metaDescription: "Merge PDF files while preserving bookmarks online for free. Combine PDFs and maintain navigation structure. Advanced PDF merger with bookmark support.",
    seoArticle: `<h2>Merge PDFs While Preserving Bookmarks</h2>
<p>Bookmarks make PDF navigation effortless, especially in long documents. Our advanced merge tool preserves existing bookmarks from source documents and can create new ones based on merged file names. The result is a combined document that remains easy to navigate despite its increased length.</p>

<h2>Why Bookmarks Matter</h2>
<p>In lengthy PDF documents, bookmarks serve as a table of contents, allowing readers to jump directly to specific sections. Without bookmarks, users must scroll through potentially hundreds of pages to find information. Preserving bookmarks during merging maintains this valuable navigation capability.</p>

<h2>Intelligent Bookmark Handling</h2>
<p>Our tool handles bookmarks intelligently during the merge process. Existing bookmarks from each source document are preserved and properly adjusted for their new page positions. Additionally, bookmarks for each merged document are created automatically, providing clear section demarcation in the final file.</p>

<h2>How Bookmark Merging Works</h2>
<p>Upload your PDF files, each potentially containing its own bookmark structure. Arrange files in your preferred order. Our tool merges the documents while preserving all bookmarks and adjusting page references automatically. Download a fully navigable combined document.</p>

<h2>Perfect for Large Document Sets</h2>
<p>Technical manuals combining multiple chapters retain section bookmarks. Legal document compilations maintain individual document navigation. Annual report packages keep each section easily accessible. Any large combined document benefits from bookmark preservation.</p>

<h2>Enhanced Document Usability</h2>
<p>The final merged document is more usable than a simple combination. Readers appreciate maintained navigation structure. Professional appearance is enhanced through organized bookmarks. Distribution and review become more efficient when documents are properly bookmarked.</p>`,
  },
  {
    id: "pdf-images-combiner",
    name: "PDF + Images Combiner",
    description: "Merge PDFs and images into one file",
    icon: "ImagePlus",
    type: "pdf-images-combiner",
    color: "bg-purple-600",
    emoji: "🖼️",
    metaTitle: "Combine PDF and Images Online Free - Merge PDF with Photos | PDF Tools",
    metaDescription: "Combine PDF files and images into one document online for free. Merge photos with PDFs seamlessly. Easy PDF and image combiner tool.",
    seoArticle: `<h2>Combine PDFs and Images Into One Document</h2>
<p>Sometimes you need to merge different file types into a single PDF. Our PDF and Images Combiner handles this seamlessly, accepting both PDF files and image formats (JPG, PNG, GIF, BMP) and combining them into one cohesive document. Perfect for creating comprehensive packages that include both documents and photographs.</p>

<h2>Flexible File Type Support</h2>
<p>Upload any combination of PDFs and images. Each image is automatically converted to a PDF page at full quality. PDFs are incorporated with all their pages intact. The final document seamlessly integrates both file types with consistent quality throughout.</p>

<h2>Real-World Applications</h2>
<p>Real estate agents combine property documents with listing photos. Insurance adjusters merge claim forms with damage photographs. Project managers compile reports with supporting imagery. Students create presentations combining research papers with diagrams. The applications are limitless.</p>

<h2>Simple Combination Process</h2>
<p>Upload your mix of PDF files and images using our drag-and-drop interface. Arrange all items in your desired order regardless of file type. Preview the combined document to verify layout. Download your unified PDF containing all content.</p>

<h2>Maintain Image Quality</h2>
<p>Images are converted to PDF pages at their original resolution. No quality is lost during the conversion and combination process. Colors remain accurate, details stay sharp, and the final document looks professional whether viewed on screen or printed.</p>

<h2>Create Professional Packages</h2>
<p>Combined PDF and image documents appear polished and intentional. Recipients see a single, organized file rather than multiple attachments. This professional presentation enhances your communication and makes document review easier for everyone involved.</p>`,
  },
  {
    id: "pdf-word-merger",
    name: "PDF + Word Merger",
    description: "Merge a PDF with a Word (.docx) file",
    icon: "FileText",
    type: "pdf-word-merger",
    color: "bg-indigo-600",
    emoji: "✍️",
    metaTitle: "Merge PDF with Word Document Online Free - Combine DOCX PDF | PDF Tools",
    metaDescription: "Merge PDF files with Word documents online for free. Combine DOCX and PDF into one file. Easy PDF and Word document merger tool.",
    seoArticle: `<h2>Merge PDF and Word Documents Together</h2>
<p>Working with both PDF and Word documents is common in modern workflows. Our PDF and Word Merger combines these different formats into a single PDF document seamlessly. Convert and merge Word files with existing PDFs without needing multiple software applications or complex conversions.</p>

<h2>Seamless Format Integration</h2>
<p>Upload Word documents (.docx) alongside PDF files. Our tool converts Word content to PDF format automatically while preserving formatting, fonts, and layout. The converted content merges seamlessly with existing PDF files, creating a unified document with consistent quality.</p>

<h2>Preserve Word Formatting</h2>
<p>Word documents often contain careful formatting: headers, footers, tables, images, and styled text. Our conversion process maintains these elements accurately. The converted pages look virtually identical to how they appear in Microsoft Word, ensuring your hard work on document design is preserved.</p>

<h2>Easy Merging Workflow</h2>
<p>Upload your PDF files and Word documents in any order. Arrange all files in your desired sequence. Our tool handles the conversion and merging automatically. Preview the combined result and download your unified PDF. The entire process takes just moments.</p>

<h2>Business Use Cases</h2>
<p>Combine contract templates (Word) with signed agreements (PDF). Merge proposal documents with supporting materials. Add Word-based cover letters to PDF portfolios. Create comprehensive documentation packages from mixed format sources. Business workflows become more efficient.</p>

<h2>One Document, Multiple Sources</h2>
<p>The final merged document is a standard PDF that opens anywhere. Recipients don't need Word installed to view content that was originally in Word format. This universality makes sharing and archiving simpler while maintaining professional document quality throughout.</p>`,
  },
  {
    id: "split-pdf",
    name: "Split PDF",
    description: "Divide a PDF into multiple files",
    icon: "Scissors",
    type: "split-pdf",
    color: "bg-red-600",
    emoji: "✂️",
    metaTitle: "Split PDF Into Multiple Files Online Free - Divide PDF | PDF Tools",
    metaDescription: "Split PDF documents into multiple files online for free. Divide PDFs by pages or sections. Fast and easy PDF splitting tool.",
    seoArticle: `<h2>Split PDF Into Multiple Files - Complete Control</h2>
<p>Large PDF documents often need division into smaller, more manageable files. Our Split PDF tool provides complete control over how your document is divided. Whether separating chapters, extracting specific sections, or creating individual page files, splitting gives you exactly the files you need.</p>

<h2>Multiple Splitting Methods</h2>
<p>Choose how to split your PDF based on your specific needs. Split into individual pages where each page becomes its own file. Divide by page ranges to create specific sections. Split into equal parts for uniform distribution. Extract only certain pages while discarding others. Complete flexibility is at your fingertips.</p>

<h2>Precise Page Selection</h2>
<p>Specify exactly which pages go into each resulting file. Use ranges like 1-5, 10-15, or list individual pages like 1, 3, 7, 12. Combine ranges and individual pages as needed. Preview your selections before splitting to ensure accuracy. Get exactly the files you need every time.</p>

<h2>How to Split Your PDF</h2>
<p>Upload your PDF document using our secure uploader. Choose your splitting method from available options. Define page ranges or splitting parameters. Preview the planned split results. Process and download individual files or a ZIP archive containing all split PDFs.</p>

<h2>Practical Applications</h2>
<p>Separate chapters from ebooks for easier reading. Extract specific forms from multi-form documents. Create individual client files from batch-scanned documents. Divide large reports into departmental sections. Split presentations for targeted distribution. The uses are endless.</p>

<h2>Quality Preservation</h2>
<p>Each split file maintains the exact quality of the corresponding pages in the original document. Text, images, formatting, and interactive elements are preserved perfectly. Your split PDFs are immediately ready for use, sharing, or further processing.</p>`,
  },
  {
    id: "pdf-splitter",
    name: "PDF Splitter",
    description: "Split by page ranges or total pages",
    icon: "FileOutput",
    type: "pdf-splitter",
    color: "bg-yellow-500",
    emoji: "📄",
    metaTitle: "PDF Splitter Online Free - Split by Page Range | PDF Tools",
    metaDescription: "Split PDF files by page ranges or page count online for free. Advanced PDF splitter with flexible options. No installation required.",
    seoArticle: `<h2>PDF Splitter - Advanced Page Range Splitting</h2>
<p>Our PDF Splitter offers sophisticated splitting options beyond basic page separation. Define specific page ranges, split at regular intervals, or divide based on total page count. This advanced tool handles complex splitting requirements that simpler tools can't manage effectively.</p>

<h2>Page Range Splitting</h2>
<p>Extract specific page ranges with precise control. Create files from pages 1-10, 11-25, and 26-end. Define multiple ranges in a single operation. Overlap ranges if needed to include pages in multiple output files. Complete flexibility for complex document division requirements.</p>

<h2>Interval-Based Splitting</h2>
<p>Split large documents at regular intervals automatically. Divide a 100-page document into 10-page sections. Create equal-sized portions for distribution. Set any interval that suits your needs. The tool handles the mathematics while you focus on your goals.</p>

<h2>Smart Page Count Division</h2>
<p>Specify how many files you want and let the tool calculate page distribution. Divide evenly into a specific number of parts. Handle uneven divisions gracefully with slightly varied file sizes. Perfect for distributing content among multiple recipients or storage locations.</p>

<h2>Easy Splitting Process</h2>
<p>Upload your PDF document securely. Choose your splitting method: ranges, intervals, or count-based. Configure your specific parameters. Preview the planned division. Download your split files individually or as a convenient ZIP archive.</p>

<h2>Professional Document Management</h2>
<p>Large organizations use splitting for document workflow management. Legal teams divide case files for team distribution. Publishing houses separate manuscript sections for different editors. Educational institutions split course materials by module. The PDF Splitter serves sophisticated document management needs.</p>`,
  },
  {
    id: "divide-pdf",
    name: "Divide PDF",
    description: "Break PDF into equal parts",
    icon: "Divide",
    type: "divide-pdf",
    color: "bg-teal-600",
    emoji: "➗",
    metaTitle: "Divide PDF Into Equal Parts Online Free - Split Evenly | PDF Tools",
    metaDescription: "Divide PDF files into equal parts online for free. Split documents evenly into multiple sections. Easy PDF divider tool with no installation.",
    seoArticle: `<h2>Divide PDF Into Equal Parts - Even Distribution</h2>
<p>When you need to split a document into equal portions, our Divide PDF tool calculates the perfect division automatically. Simply specify how many parts you want, and the tool distributes pages evenly across resulting files. Ideal for distributing workload, creating study sections, or organizing content systematically.</p>

<h2>Automatic Even Distribution</h2>
<p>Upload a PDF and specify your desired number of output files. Our tool calculates page distribution automatically. A 50-page document divided into 5 parts yields five 10-page files. Uneven page counts are handled intelligently, with some files receiving one extra page when necessary.</p>

<h2>Perfect for Team Distribution</h2>
<p>Divide research materials among team members evenly. Split review documents for parallel processing. Distribute reading assignments fairly. Create equal workload portions for data entry tasks. Even division ensures fair distribution of work or content.</p>

<h2>Simple Division Process</h2>
<p>Upload your PDF document using our secure interface. Enter the number of parts you want. Our tool previews how pages will be distributed. Confirm and process the division. Download individual files or get all parts in a ZIP archive.</p>

<h2>Handling Uneven Page Counts</h2>
<p>Real documents rarely divide perfectly evenly. A 53-page document split into 5 parts might yield three 11-page files and two 10-page files. Our tool handles these situations automatically, ensuring the most balanced distribution possible while keeping all pages accounted for.</p>

<h2>Quality Across All Parts</h2>
<p>Each divided section maintains full document quality. Text, images, and formatting remain perfect in every output file. Bookmarks and links within each section continue functioning. Your divided PDFs are ready for immediate use in any application.</p>`,
  },
  {
    id: "break-pdf",
    name: "Break PDF",
    description: "Extract sections into separate PDFs",
    icon: "FileMinus",
    type: "break-pdf",
    color: "bg-rose-600",
    emoji: "💔",
    metaTitle: "Break PDF Into Sections Online Free - Extract PDF Parts | PDF Tools",
    metaDescription: "Break PDF documents into separate sections online for free. Extract parts of PDFs into individual files. Easy PDF breaking tool.",
    seoArticle: `<h2>Break PDF Into Sections - Extract Document Parts</h2>
<p>Sometimes you need to extract specific sections from a PDF rather than split it uniformly. Our Break PDF tool lets you define exactly which parts to extract as separate files. Perfect for isolating chapters, extracting appendices, or pulling out specific content from comprehensive documents.</p>

<h2>Targeted Section Extraction</h2>
<p>Define specific sections to extract based on page numbers. Pull out the introduction (pages 1-5), main content (pages 6-50), and appendix (pages 51-75) as separate files. Each section becomes an independent PDF while the original remains untouched.</p>

<h2>Non-Destructive Processing</h2>
<p>Breaking a PDF creates new files without modifying the original. Your source document remains complete and unchanged. Extracted sections are copies, allowing you to break the same document multiple ways for different purposes.</p>

<h2>How to Break Your PDF</h2>
<p>Upload your PDF document securely. Define the sections you want to extract by specifying page ranges. Name each section for easy identification. Process all extractions simultaneously. Download your broken-out sections individually or as a batch.</p>

<h2>Real-World Applications</h2>
<p>Extract contract sections for focused review. Pull specific chapters from textbooks for study. Isolate appendices for reference materials. Break presentations into topic-focused segments. Create excerpt files for sharing without distributing entire documents.</p>

<h2>Maintain Section Integrity</h2>
<p>Each extracted section is a complete, functional PDF. Page quality matches the original exactly. Any interactive elements within sections continue working. Extracted files are immediately ready for distribution, annotation, or further processing.</p>`,
  },
  {
    id: "split-by-pages",
    name: "Split PDF by Pages",
    description: "Generate PDFs per individual page",
    icon: "Files",
    type: "split-by-pages",
    color: "bg-cyan-600",
    emoji: "📉",
    metaTitle: "Split PDF by Pages Online Free - One Page Per File | PDF Tools",
    metaDescription: "Split PDF into individual pages online for free. Create separate PDFs for each page. Easy page-by-page PDF splitter tool.",
    seoArticle: `<h2>Split PDF Into Individual Pages - One Page Per File</h2>
<p>Transform any multi-page PDF into individual single-page files with our Split by Pages tool. Each page becomes its own PDF document, perfect for organizing, sorting, or distributing content page by page. This granular splitting approach provides maximum flexibility for document management.</p>

<h2>Complete Page Separation</h2>
<p>Upload a PDF of any length and receive individual files for every single page. A 100-page document becomes 100 separate PDFs. Each file contains exactly one page with full quality preserved. File naming follows a logical sequence for easy organization.</p>

<h2>Why Split Into Individual Pages</h2>
<p>Individual page files offer unique advantages. Sort and reorder pages in file managers. Share specific pages without editing PDFs. Archive pages separately for granular retrieval. Process pages independently in batch workflows. Maximum flexibility for any document task.</p>

<h2>Simple Splitting Process</h2>
<p>Upload your PDF document using our secure uploader. Select the split-by-pages option. Our tool processes every page automatically. Download all pages in a organized ZIP archive. Each file is named systematically for easy identification and sorting.</p>

<h2>Practical Use Cases</h2>
<p>Scan multi-item receipts and separate for individual expense tracking. Split form submissions for separate processing. Divide questionnaire responses for different analysts. Create individual slides from PDF presentations. Separate certificate pages for individual distribution.</p>

<h2>Batch Processing Ready</h2>
<p>Individual page files are perfect for automated workflows. Process each page through OCR separately. Apply different treatments to different pages. Upload individual pages to document management systems. Page-by-page splitting enables sophisticated document automation.</p>`,
  },
  {
    id: "split-by-size",
    name: "Split PDF by Size",
    description: "Split PDF when parts exceed size limit",
    icon: "HardDrive",
    type: "split-by-size",
    color: "bg-amber-600",
    emoji: "📦",
    metaTitle: "Split PDF by Size Online Free - Divide by File Size | PDF Tools",
    metaDescription: "Split PDF files by maximum file size online for free. Divide large PDFs into smaller parts based on MB limit. Easy size-based PDF splitter.",
    seoArticle: `<h2>Split PDF by File Size - Manage Large Documents</h2>
<p>Large PDF files often exceed email attachment limits or storage quotas. Our Split by Size tool divides your PDF into smaller parts based on your specified size limit. Set a maximum file size in megabytes, and the tool automatically creates multiple PDFs that each stay under your limit while preserving complete pages.</p>

<h2>How Size-Based Splitting Works</h2>
<p>Specify your maximum file size limit in megabytes. Our tool analyzes your PDF and groups pages together until adding another page would exceed your limit. Each resulting file contains complete pages and stays within your size constraint. This intelligent approach ensures no page is split or corrupted.</p>

<h2>Perfect for Email Attachments</h2>
<p>Most email services limit attachments to 25MB or less. A 100MB PDF report becomes impossible to email directly. With size-based splitting, you can divide it into 20MB chunks that email easily. Recipients receive all content without download issues or bounced messages.</p>

<h2>Cloud Storage Optimization</h2>
<p>Some cloud services have per-file size limits. Split large archival PDFs into compliant-sized portions for reliable storage. Each chunk uploads successfully and downloads quickly. Organize split files with consistent naming for easy reassembly when needed.</p>

<h2>Simple Size-Based Splitting</h2>
<p>Upload your PDF document securely. Enter your maximum file size in megabytes. Our tool calculates optimal page groupings automatically. Preview the planned splits before processing. Download all resulting files in a convenient ZIP archive.</p>

<h2>Maintain Document Quality</h2>
<p>Each split file maintains full original quality. Pages are never compressed or degraded to meet size limits. If a single page exceeds your size limit, you will be notified to adjust. Quality preservation is guaranteed across all output files.</p>`,
  },
  {
    id: "split-by-bookmarks",
    name: "Split PDF by Bookmarks",
    description: "Split at bookmark locations",
    icon: "BookMarked",
    type: "split-by-bookmarks",
    color: "bg-violet-600",
    emoji: "📑",
    metaTitle: "Split PDF by Bookmarks Online Free - Divide at Chapters | PDF Tools",
    metaDescription: "Split PDF files at bookmark locations online for free. Divide documents by chapters or sections automatically. Smart bookmark-based PDF splitter.",
    seoArticle: `<h2>Split PDF by Bookmarks - Chapter-Based Division</h2>
<p>PDFs with bookmarks contain natural division points marking chapters, sections, or topics. Our Split by Bookmarks tool recognizes these markers and creates separate files for each bookmarked section automatically. Transform a multi-chapter document into individual chapter files with a single click.</p>

<h2>Automatic Section Detection</h2>
<p>Our tool reads the PDF bookmark structure and identifies top-level bookmarks as split points. Each bookmark becomes the start of a new file. The resulting files are named based on bookmark titles for easy identification. No manual page counting or range specification required.</p>

<h2>Ideal for Structured Documents</h2>
<p>Ebooks with chapter bookmarks split into individual chapter files. Technical manuals divide into topic-specific sections. Training materials separate into module files. Any document with bookmarked organization splits logically and automatically.</p>

<h2>How Bookmark Splitting Works</h2>
<p>Upload your bookmarked PDF document. Our tool analyzes the bookmark structure automatically. Each top-level bookmark defines a split point. Preview the planned divisions based on bookmark names. Process and download individual section files.</p>

<h2>Preserve Nested Bookmarks</h2>
<p>Documents often have multiple bookmark levels. Our tool splits at top-level bookmarks while preserving sub-bookmarks within each resulting file. Chapter files retain their section bookmarks for continued navigation. The internal structure of each split file remains intact.</p>

<h2>Perfect for Publishing Workflows</h2>
<p>Publishers use bookmark splitting to separate manuscript chapters for different editors. Authors extract specific sections for review or sharing. Educators divide course materials into lesson-specific files. Bookmark-based splitting streamlines complex document workflows.</p>`,
  },
  {
    id: "split-by-text",
    name: "Split PDF by Text",
    description: "Split at pages containing specific text",
    icon: "FileSearch",
    type: "split-by-text",
    color: "bg-fuchsia-600",
    emoji: "🔍",
    metaTitle: "Split PDF by Text Online Free - Divide at Keywords | PDF Tools",
    metaDescription: "Split PDF files at pages containing specific text online for free. Divide documents by keyword occurrence. Smart text-based PDF splitter.",
    seoArticle: `<h2>Split PDF by Text Content - Keyword-Based Division</h2>
<p>Some documents have consistent text markers that indicate section breaks. Our Split by Text tool finds pages containing your specified text and uses them as split points. Whether documents start with "Chapter", "Section", or custom headers, text-based splitting creates files at exactly the right locations.</p>

<h2>Text Pattern Recognition</h2>
<p>Enter the text that marks your split points. Our tool scans every page for your specified text. When found, that page begins a new file. Multiple occurrences create multiple splits. The search is thorough and accurate across the entire document.</p>

<h2>Perfect for Standardized Documents</h2>
<p>Monthly reports starting with "Report Date:" split into individual monthly files. Forms beginning with "Application Number" separate into individual applications. Any document with consistent text headers benefits from text-based splitting.</p>

<h2>Simple Text-Based Splitting</h2>
<p>Upload your PDF document securely. Enter the text pattern that marks split points. Our tool identifies all occurrences throughout the document. Preview which pages will start new files. Process and download your split documents.</p>

<h2>Handling Multiple Matches</h2>
<p>Documents may contain your search text multiple times on some pages. Our tool uses the first occurrence on a page to determine if it is a split point. Pages without your text are included in the preceding section. The logic is straightforward and predictable.</p>

<h2>Automate Document Processing</h2>
<p>Text-based splitting enables automated document workflows. Process batches of combined documents into separate files. Extract specific sections from compiled reports. Create systematic file organization from merged document collections. Text patterns drive intelligent separation.</p>`,
  },
  {
    id: "split-in-half",
    name: "Split PDF in Half",
    description: "Divide PDF into two equal parts",
    icon: "Scissors",
    type: "split-in-half",
    color: "bg-lime-600",
    emoji: "✂️",
    metaTitle: "Split PDF in Half Online Free - Divide Into Two Parts | PDF Tools",
    metaDescription: "Split PDF files exactly in half online for free. Divide documents into two equal parts instantly. Easy PDF halving tool with no installation.",
    seoArticle: `<h2>Split PDF in Half - Simple Two-Part Division</h2>
<p>Sometimes you need the simplest possible split: dividing a document exactly in half. Our Split in Half tool does precisely that. Upload your PDF and receive two files, each containing half the pages. No configuration needed, no page numbers to specify. Just simple, clean division.</p>

<h2>Automatic Midpoint Calculation</h2>
<p>Our tool calculates the exact midpoint of your document automatically. A 50-page PDF becomes two 25-page files. For odd page counts, the first half receives the extra page. The calculation is instant and the split is perfectly balanced.</p>

<h2>When to Use Half Splitting</h2>
<p>Share large documents with two people for parallel reading. Divide workload between two processors. Create first-half and second-half archives. Split semester materials into two term portions. Sometimes the simplest division is exactly what you need.</p>

<h2>One-Click Simplicity</h2>
<p>Upload your PDF document. Click split. Download two files. No options to configure, no decisions to make. The tool handles everything automatically. Your two half-sized files are ready in seconds.</p>

<h2>Perfect Balance</h2>
<p>Both halves contain roughly equal content. For documents with varying page complexity, the page count split ensures fair division. Neither half is significantly larger in file size than the other. Balance is maintained across both resulting files.</p>

<h2>Quality Preservation</h2>
<p>Both halves maintain the exact quality of the original document. No compression, no degradation, no quality loss. Each half is a perfect subset of the original, ready for any purpose. Professional quality is guaranteed in both output files.</p>`,
  },
  {
    id: "split-every-x-pages",
    name: "Split PDF Every X Pages",
    description: "Split at regular page intervals",
    icon: "LayoutGrid",
    type: "split-every-x-pages",
    color: "bg-sky-600",
    emoji: "📊",
    metaTitle: "Split PDF Every X Pages Online Free - Regular Intervals | PDF Tools",
    metaDescription: "Split PDF files at regular page intervals online for free. Divide every 5, 10, or custom number of pages. Easy interval-based PDF splitter.",
    seoArticle: `<h2>Split PDF Every X Pages - Regular Interval Division</h2>
<p>Need to divide a document into consistent-sized portions? Our Split Every X Pages tool creates files at regular intervals you specify. Set the interval to 10 pages, and a 100-page document becomes ten 10-page files. Perfect for creating uniform document batches with predictable sizes.</p>

<h2>Customizable Intervals</h2>
<p>Choose any interval that suits your needs. Split every 5 pages for small portions. Every 25 pages for quarter-document divisions. Every 100 pages for manageable chunks of massive documents. You control the rhythm of the split.</p>

<h2>Automatic File Creation</h2>
<p>Specify your interval and let the tool handle everything else. Each file contains exactly your specified number of pages (except possibly the last file if pages do not divide evenly). File naming follows logical sequences for easy organization.</p>

<h2>Simple Interval Splitting</h2>
<p>Upload your PDF document securely. Enter your desired page interval. Our tool calculates how many files will result. Preview the planned division. Process and download all files in a convenient archive.</p>

<h2>Handling Remainders</h2>
<p>When page counts do not divide evenly, the final file contains the remaining pages. A 53-page document split every 10 pages creates five 10-page files plus one 3-page file. Nothing is lost, and the final portion is clearly identified.</p>

<h2>Batch Processing Applications</h2>
<p>Create uniform work batches for data entry teams. Divide scanned documents for parallel OCR processing. Split large archives into manageable portions. Create consistent-sized backups of long documents. Regular intervals enable systematic document handling.</p>`,
  },
  {
    id: "extract-pages",
    name: "Extract PDF Pages",
    description: "Extract page ranges to separate files",
    icon: "FileOutput",
    type: "extract-pages",
    color: "bg-emerald-600",
    emoji: "📤",
    metaTitle: "Extract PDF Pages Online Free - Pull Pages from PDF | PDF Tools",
    metaDescription: "Extract specific pages from PDF files online for free. Pull page ranges into separate documents. Easy PDF page extraction tool.",
    seoArticle: `<h2>Extract PDF Pages - Pull Specific Content</h2>
<p>Extract exactly the pages you need from any PDF document. Specify page ranges and receive separate files for each range. Pull out chapters, sections, or scattered pages without affecting the original document. Page extraction gives you precise control over document content.</p>

<h2>Multiple Range Extraction</h2>
<p>Extract multiple page ranges in a single operation. Pull pages 1-5, 15-20, and 45-50 simultaneously. Each range becomes its own PDF file. Process complex extraction requirements efficiently without multiple passes through the document.</p>

<h2>Non-Destructive Extraction</h2>
<p>The original PDF remains completely unchanged. Extracted pages are copies, not removals. Extract the same pages multiple times for different purposes. Your source document stays intact for future extractions or reference.</p>

<h2>How Page Extraction Works</h2>
<p>Upload your PDF document securely. Specify page ranges using simple notation (1-5, 10, 15-20). Our tool creates separate files for each specified range. Preview extractions before processing. Download individual files or get all extractions in a ZIP.</p>

<h2>Practical Applications</h2>
<p>Extract contract signature pages for quick reference. Pull executive summaries from lengthy reports. Extract specific chapters for focused study. Create handout files from presentation decks. Extraction enables targeted content distribution.</p>

<h2>Quality Guarantee</h2>
<p>Extracted pages maintain exact original quality. Fonts, images, and formatting remain perfect. Interactive elements within extracted pages continue functioning. Your extracted files are immediately ready for any professional use.</p>`,
  },
  {
    id: "page-extractor",
    name: "PDF Page Extractor",
    description: "Extract each page as a separate PDF",
    icon: "FileStack",
    type: "page-extractor",
    color: "bg-orange-500",
    emoji: "📋",
    metaTitle: "PDF Page Extractor Online Free - Extract All Pages | PDF Tools",
    metaDescription: "Extract every page from PDF as separate files online for free. Create individual PDFs from each page. Complete page extraction tool.",
    seoArticle: `<h2>PDF Page Extractor - Individual Page Files</h2>
<p>Transform any multi-page PDF into a collection of single-page files with our Page Extractor. Every page becomes its own PDF document, giving you maximum flexibility for organizing, distributing, or processing document content. Complete page-by-page extraction with a single click.</p>

<h2>Complete Page Separation</h2>
<p>Upload any PDF and receive individual files for every page. A 75-page document yields 75 separate single-page PDFs. Each file is properly formatted and immediately usable. Systematic file naming enables easy organization and retrieval.</p>

<h2>Why Extract Every Page</h2>
<p>Individual page files offer unique workflow possibilities. Sort pages in file managers. Share single pages without PDF editing. Process pages independently through different tools. Archive pages separately for granular version control. Maximum control over document content.</p>

<h2>Simple Extraction Process</h2>
<p>Upload your PDF using our secure interface. Our tool automatically processes every page. Each page becomes a separate PDF file. Download all pages in an organized ZIP archive. File names follow a logical sequence.</p>

<h2>Perfect for Document Processing</h2>
<p>Run OCR on individual pages for parallel processing. Apply different treatments to different pages. Upload pages to document management systems separately. Enable automated workflows that handle pages independently.</p>

<h2>Quality Preservation</h2>
<p>Each extracted page maintains full original quality. Text remains sharp, images stay detailed, formatting is perfect. Single-page PDFs are complete, functional documents ready for any purpose. No quality loss during the extraction process.</p>`,
  },
  {
    id: "page-remover",
    name: "PDF Page Remover",
    description: "Remove unwanted pages from PDF",
    icon: "FileX",
    type: "page-remover",
    color: "bg-red-500",
    emoji: "🚫",
    metaTitle: "Remove PDF Pages Online Free - Delete Unwanted Pages | PDF Tools",
    metaDescription: "Remove unwanted pages from PDF files online for free. Delete specific pages instantly. Easy PDF page removal tool with no software needed.",
    seoArticle: `<h2>PDF Page Remover - Clean Up Your Documents</h2>
<p>Remove unwanted pages from any PDF document with our Page Remover tool. Delete blank pages, remove outdated content, or eliminate sensitive sections before sharing. Create clean, focused documents containing only the pages you want to keep.</p>

<h2>Selective Page Deletion</h2>
<p>Specify exactly which pages to remove using simple notation. Delete page 3, pages 10-15, or scattered pages like 2, 7, 12, 20. Our tool removes only the pages you specify while keeping everything else intact. Precise control over document content.</p>

<h2>Clean Document Creation</h2>
<p>The result is a new PDF without the removed pages. Page numbers adjust automatically. The document flows smoothly without gaps. Recipients see only the content you intend them to see.</p>

<h2>Easy Removal Process</h2>
<p>Upload your PDF document securely. Enter the pages you want to remove. Our tool creates a new PDF excluding those pages. Preview the result before downloading. Get your cleaned document instantly.</p>

<h2>Common Removal Scenarios</h2>
<p>Remove cover pages before distribution. Delete blank pages from scanned documents. Eliminate outdated sections from manuals. Remove confidential pages before sharing externally. Clean up documents for professional presentation.</p>

<h2>Safe and Non-Destructive</h2>
<p>Page removal creates a new file without modifying your original. The source PDF remains unchanged with all pages intact. Create multiple versions with different pages removed. Experiment with removal without permanent consequences.</p>`,
  },
  {
    id: "extract-specific",
    name: "Extract Specific Pages",
    description: "Extract selected pages as single PDF",
    icon: "FileCheck",
    type: "extract-specific",
    color: "bg-blue-600",
    emoji: "✅",
    metaTitle: "Extract Specific PDF Pages Online Free - Select and Extract | PDF Tools",
    metaDescription: "Extract specific pages from PDF into one file online for free. Select pages and create a new PDF. Easy specific page extraction tool.",
    seoArticle: `<h2>Extract Specific Pages - Create Focused Documents</h2>
<p>Pull exactly the pages you need from any PDF and combine them into a single new document. Unlike splitting which divides documents, specific page extraction lets you cherry-pick pages from anywhere in the document to create a new, focused PDF containing only your selected content.</p>

<h2>Cherry-Pick Any Pages</h2>
<p>Select pages from anywhere in your document. Extract pages 1, 5, 23, and 47 into one file. Combine non-consecutive pages that share a theme. Create compilations from scattered content. Your selections become one cohesive document.</p>

<h2>Unified Output</h2>
<p>Unlike tools that create separate files for each selection, specific page extraction creates one combined PDF. All your selected pages appear in sequence in a single file. Perfect for creating summary documents, excerpt collections, or focused handouts.</p>

<h2>How Specific Extraction Works</h2>
<p>Upload your source PDF document. Specify the pages you want using comma-separated lists and ranges. Our tool extracts and combines your selections. Download a single PDF containing only your chosen pages.</p>

<h2>Practical Applications</h2>
<p>Create meeting handouts from comprehensive reports. Extract key pages for executive summaries. Compile relevant sections from different document areas. Build portfolios from selected work samples. Create focused documents from comprehensive sources.</p>

<h2>Maintain Page Order</h2>
<p>Extracted pages appear in the order you specify them. List pages in any order you prefer. The output PDF follows your sequence exactly. Create logical flow regardless of original page positions. Full control over the final document structure.</p>`,
  },
];
