const fs = require('fs');
let content = fs.readFileSync('shared/schema.ts', 'utf8');

const newTools = `
  {
    id: "image-to-painting",
    name: "Image to Painting",
    description: "Transform photos into artistic oil painting style",
    icon: "Palette",
    type: "image-to-painting",
    color: "bg-purple-600",
    emoji: "🎨",
    metaTitle: "Image to Painting Converter Online Free - Photo to Art | PDF Tools",
    metaDescription: "Convert photos to beautiful oil painting style online for free. Transform any image into artistic paintings with adjustable styles and effects.",
    seoArticle: \`<h2>Image to Painting Converter - Transform Your Photos into Art</h2>
<p>Transform any photograph into a stunning oil painting masterpiece with our free online Image to Painting converter. Using advanced artistic filters and algorithms, this tool recreates the look and feel of classic oil paintings, complete with brush strokes, texture, and rich color depth.</p>

<h2>Multiple Painting Styles Available</h2>
<p>Choose from various artistic styles including impressionist, renaissance, modern abstract, and watercolor effects. Each style applies unique brush techniques and color treatments to create authentic-looking paintings from your photos. Perfect for creating personalized artwork from family photos or landscapes.</p>

<h2>Professional Quality Results</h2>
<p>Our painting converter produces high-resolution outputs suitable for printing and framing. The algorithm analyzes your image composition, color palette, and subject matter to apply appropriate brush strokes and artistic effects that enhance the natural beauty of your original photo.</p>

<h2>Easy to Use Process</h2>
<p>Simply upload your image, select your preferred painting style and intensity, then download your transformed artwork. No artistic skills required - our tool does all the work. Adjust brush size, color saturation, and texture intensity for customized results.</p>

<h2>Perfect for Gifts and Decor</h2>
<p>Create unique gifts by turning memorable photos into paintings. Print and frame for beautiful wall decor. Use for social media profiles, digital art projects, or personalized merchandise. Transform everyday snapshots into gallery-worthy artwork.</p>\`,
  },
  {
    id: "image-color-palette",
    name: "Image Color Palette Generator",
    description: "Extract dominant colors and create color palettes from images",
    icon: "Pipette",
    type: "image-color-palette",
    color: "bg-pink-500",
    emoji: "🎨",
    metaTitle: "Image Color Palette Generator Online Free - Extract Colors | PDF Tools",
    metaDescription: "Extract dominant colors from any image online for free. Generate color palettes with HEX, RGB, and HSL values. Perfect for designers and artists.",
    seoArticle: \`<h2>Image Color Palette Generator - Extract Beautiful Colors</h2>
<p>Discover the perfect color palette hidden within any image with our free online Color Palette Generator. Whether you're a designer seeking inspiration, a developer matching brand colors, or an artist exploring color harmonies, this tool extracts dominant colors with precision and presents them in multiple formats.</p>

<h2>Advanced Color Extraction Algorithm</h2>
<p>Our tool uses sophisticated color clustering algorithms to identify the most visually significant colors in your image. It analyzes thousands of pixels, groups similar hues, and returns a harmonious palette that captures the essence of your image. Get anywhere from 3 to 10 dominant colors based on your needs.</p>

<h2>Multiple Color Formats</h2>
<p>Each extracted color is provided in HEX, RGB, and HSL formats for maximum compatibility. Copy values with a single click for use in CSS, design software, or any application. The visual palette display shows exact color swatches for easy reference.</p>

<h2>Perfect for Design Projects</h2>
<p>Use extracted palettes for website design, brand identity, interior design, fashion coordination, or digital art. Match colors from photographs to create cohesive visual experiences. Generate complementary color schemes from nature photos, artwork, or product images.</p>

<h2>Download and Share</h2>
<p>Export your generated palette as a PNG image for easy sharing and reference. Include color values in the export for documentation. Create mood boards by combining palettes from multiple images. Save your favorite palettes for future projects.</p>\`,
  },
  {
    id: "image-histogram",
    name: "Image Histogram Generator",
    description: "Analyze image color distribution with detailed histograms",
    icon: "BarChart3",
    type: "image-histogram",
    color: "bg-cyan-600",
    emoji: "📊",
    metaTitle: "Image Histogram Generator Online Free - Color Analysis | PDF Tools",
    metaDescription: "Generate detailed color histograms from any image online for free. Analyze RGB channels, luminosity, and color distribution for photography and design.",
    seoArticle: \`<h2>Image Histogram Generator - Understand Your Image Colors</h2>
<p>Analyze the color distribution of any image with our free online Histogram Generator. Essential for photographers, designers, and digital artists, this tool provides detailed visual breakdowns of RGB channels, luminosity, and overall color distribution to help you understand and improve your images.</p>

<h2>Comprehensive Color Analysis</h2>
<p>View separate histograms for Red, Green, and Blue color channels, plus a combined luminosity histogram. Identify underexposed or overexposed areas, check for clipped highlights or crushed shadows, and understand the overall tonal range of your image. Professional-grade analysis in seconds.</p>

<h2>Essential for Photography</h2>
<p>Use histogram analysis to evaluate exposure before and after editing. Identify color casts that need correction. Ensure prints will reproduce accurately by checking for data in extreme highlights and shadows. Compare histograms between images for consistent processing.</p>

<h2>Interactive Visualization</h2>
<p>Our histograms display smooth curves with clear channel separation. Hover over specific areas to see exact pixel counts at each brightness level. Toggle individual channels on and off for focused analysis. Zoom in on specific tonal ranges for detailed examination.</p>

<h2>Export and Documentation</h2>
<p>Download histogram images for portfolios, tutorials, or documentation. Compare before and after histograms when demonstrating editing techniques. Include statistical data like mean brightness, standard deviation, and channel balance in exports.</p>\`,
  },
  {
    id: "word-to-txt",
    name: "Word to TXT",
    description: "Convert Word documents to plain text files",
    icon: "FileText",
    type: "word-to-txt",
    color: "bg-blue-600",
    emoji: "📄",
    metaTitle: "Word to TXT Converter Online Free - DOCX to Text | PDF Tools",
    metaDescription: "Convert Word documents to plain text files online for free. Extract text from DOCX and DOC files. Preserve formatting or get clean plain text.",
    seoArticle: \`<h2>Word to TXT Converter - Extract Pure Text</h2>
<p>Convert Microsoft Word documents to plain text files instantly with our free online converter. Whether you need to extract text content for analysis, remove formatting for clean data processing, or simply access Word content in a universal format, this tool delivers fast and accurate results.</p>

<h2>Preserve or Remove Formatting</h2>
<p>Choose between maintaining basic paragraph structure or stripping all formatting for pure plain text. Our converter intelligently handles lists, tables, and multi-column layouts to produce readable text output. Special characters and symbols are preserved or converted to ASCII equivalents based on your preference.</p>

<h2>Support for All Word Formats</h2>
<p>Upload DOC, DOCX, DOT, or DOTX files with confidence. Our converter handles Word documents from Office 97 through the latest Office 365 versions. Large documents process quickly without quality loss. Embedded images are optionally described or skipped based on your needs.</p>

<h2>Perfect for Data Processing</h2>
<p>Extract text for natural language processing, search indexing, or content analysis. Clean text output integrates seamlessly with data pipelines. Remove Word-specific formatting that interferes with text processing systems. Batch convert multiple documents for large-scale text extraction projects.</p>

<h2>Universal Compatibility</h2>
<p>TXT files open in any text editor on any operating system. No special software required to read converted files. Perfect for archiving, sharing with non-Word users, or preparing content for web publishing. Small file sizes for efficient storage and transmission.</p>\`,
  },
  {
    id: "word-to-html",
    name: "Word to HTML",
    description: "Convert Word documents to clean HTML code",
    icon: "Code",
    type: "word-to-html",
    color: "bg-orange-600",
    emoji: "🌐",
    metaTitle: "Word to HTML Converter Online Free - DOCX to Web | PDF Tools",
    metaDescription: "Convert Word documents to clean HTML code online for free. Transform DOCX files into web-ready HTML with proper formatting and structure.",
    seoArticle: \`<h2>Word to HTML Converter - Create Web-Ready Content</h2>
<p>Transform Microsoft Word documents into clean, semantic HTML code with our free online converter. Perfect for web developers, content managers, and bloggers who need to publish Word content online. Our tool produces standards-compliant HTML that looks great in any web browser.</p>

<h2>Clean, Semantic HTML Output</h2>
<p>Unlike copy-pasting from Word which creates messy markup, our converter generates clean HTML with proper heading hierarchy, paragraph tags, and list structures. No inline styles or Word-specific markup that bloats file size and breaks layouts. Just pure, maintainable HTML code.</p>

<h2>Preserve Document Structure</h2>
<p>Headings become proper H1-H6 tags. Lists convert to UL and OL elements. Tables maintain their structure with proper TR, TH, and TD elements. Bold, italic, and other formatting converts to appropriate HTML tags. Links remain clickable with correct href attributes.</p>

<h2>Image Handling Options</h2>
<p>Choose to extract embedded images as separate files with proper img tags, convert to base64 for self-contained HTML, or skip images entirely. Alt text is preserved where available. Image dimensions are maintained for proper layout rendering.</p>

<h2>Ready for CMS Integration</h2>
<p>Copy generated HTML directly into WordPress, Drupal, or any content management system. Clean markup integrates seamlessly with existing stylesheets. No cleanup needed - our output is production-ready. Perfect for migrating document archives to web platforms.</p>\`,
  },
  {
    id: "txt-to-word",
    name: "TXT to Word",
    description: "Convert plain text files to Word documents",
    icon: "FileUp",
    type: "txt-to-word",
    color: "bg-blue-700",
    emoji: "📝",
    metaTitle: "TXT to Word Converter Online Free - Text to DOCX | PDF Tools",
    metaDescription: "Convert plain text files to Word documents online for free. Transform TXT files into formatted DOCX with customizable styling options.",
    seoArticle: \`<h2>TXT to Word Converter - Add Structure to Plain Text</h2>
<p>Transform plain text files into professionally formatted Word documents with our free online converter. Add structure, styling, and formatting to raw text content. Perfect for converting logs, notes, or exported data into presentable documents.</p>

<h2>Smart Paragraph Detection</h2>
<p>Our converter intelligently identifies paragraph breaks, lists, and structural elements in your text. Double line breaks become paragraph separators. Lines starting with numbers or bullets become formatted lists. Text patterns are recognized and styled appropriately.</p>

<h2>Customizable Formatting</h2>
<p>Choose your preferred font family, size, and line spacing. Apply consistent styling throughout the document. Add headers and footers automatically. Set page margins and orientation to match your needs. Create professional-looking documents from simple text.</p>

<h2>Handle Large Files</h2>
<p>Process text files of any size without limitations. Long documents convert quickly with proper pagination. No file size restrictions - convert entire books or logs in seconds. Memory-efficient processing ensures reliable conversion every time.</p>

<h2>Universal Document Format</h2>
<p>Converted DOCX files open in Microsoft Word, Google Docs, LibreOffice, and other word processors. Edit, format, and enhance your documents after conversion. Share with colleagues who prefer formatted documents over plain text. Archive text content in a rich, searchable format.</p>\`,
  },
  {
    id: "html-to-word",
    name: "HTML to Word",
    description: "Convert HTML pages to Word documents",
    icon: "FileDown",
    type: "html-to-word",
    color: "bg-green-600",
    emoji: "📃",
    metaTitle: "HTML to Word Converter Online Free - Web to DOCX | PDF Tools",
    metaDescription: "Convert HTML files to Word documents online for free. Transform web pages and HTML content into editable DOCX files with preserved formatting.",
    seoArticle: \`<h2>HTML to Word Converter - From Web to Document</h2>
<p>Convert HTML content into fully editable Word documents with our free online converter. Perfect for archiving web pages, creating offline copies of online content, or preparing web material for printing and distribution as documents.</p>

<h2>Preserve Web Formatting</h2>
<p>Our converter maintains the visual appearance of your HTML content. Headings, paragraphs, lists, tables, and text formatting transfer accurately to Word format. Links are preserved as clickable hyperlinks. Colors and basic styling are maintained where possible.</p>

<h2>Clean Conversion</h2>
<p>Unlike browser save-as functions that create cluttered documents, our tool produces clean Word files without unnecessary elements. Navigation menus, ads, and scripts are stripped. Focus on the content that matters while discarding web-only elements.</p>

<h2>Image Support</h2>
<p>Embedded images are extracted and placed inline in the Word document. Image sizing is preserved for proper layout. Alt text becomes image captions where appropriate. Base64 images and linked images are both handled correctly.</p>

<h2>Batch Processing</h2>
<p>Convert multiple HTML files into separate Word documents or combine them into a single document. Process entire website exports efficiently. Maintain folder structure in combined documents with section breaks and bookmarks.</p>\`,
  },
  {
    id: "excel-to-csv",
    name: "Excel to CSV",
    description: "Convert Excel spreadsheets to CSV format",
    icon: "Table",
    type: "excel-to-csv",
    color: "bg-green-700",
    emoji: "📊",
    metaTitle: "Excel to CSV Converter Online Free - XLSX to CSV | PDF Tools",
    metaDescription: "Convert Excel spreadsheets to CSV format online for free. Transform XLSX and XLS files into comma-separated values for data processing.",
    seoArticle: \`<h2>Excel to CSV Converter - Universal Data Format</h2>
<p>Convert Microsoft Excel spreadsheets to CSV format instantly with our free online tool. CSV files are universally compatible with databases, programming languages, and data analysis tools. Perfect for data migration, import/export operations, and system integrations.</p>

<h2>Multiple Sheet Handling</h2>
<p>Excel workbooks with multiple sheets are handled intelligently. Convert all sheets into separate CSV files, select specific sheets to convert, or combine sheets into a single CSV. Each option produces clean, properly formatted output ready for use.</p>

<h2>Preserve Data Integrity</h2>
<p>Numbers, dates, and text are converted with proper formatting. Special characters and Unicode are handled correctly. Quoted values prevent delimiter conflicts. Leading zeros in number fields are optionally preserved. Formula results are converted to static values.</p>

<h2>Customizable Output</h2>
<p>Choose your preferred delimiter: comma, semicolon, tab, or custom character. Select encoding (UTF-8, ASCII, ISO-8859-1) for compatibility with target systems. Include or exclude header rows. Customize date and number formatting for regional preferences.</p>

<h2>Ideal for Data Migration</h2>
<p>CSV is the standard format for importing data into databases, CRM systems, and business applications. Clean conversion ensures successful imports. Compatible with MySQL, PostgreSQL, MongoDB, Salesforce, and virtually any data-driven platform.</p>\`,
  },
  {
    id: "csv-to-excel",
    name: "CSV to Excel",
    description: "Convert CSV files to Excel spreadsheets",
    icon: "Sheet",
    type: "csv-to-excel",
    color: "bg-emerald-600",
    emoji: "📈",
    metaTitle: "CSV to Excel Converter Online Free - CSV to XLSX | PDF Tools",
    metaDescription: "Convert CSV files to Excel spreadsheets online for free. Transform comma-separated data into formatted XLSX files with proper columns and styling.",
    seoArticle: \`<h2>CSV to Excel Converter - Visualize Your Data</h2>
<p>Transform plain CSV data into formatted Excel spreadsheets with our free online converter. Add styling, formulas, and advanced features to your data. Perfect for presenting data professionally, performing analysis, or sharing with Excel users.</p>

<h2>Automatic Column Detection</h2>
<p>Our converter intelligently detects data types in each column. Numbers are formatted as numbers, dates as dates, and text as text. Column widths adjust automatically to fit content. Headers are identified and formatted distinctly from data rows.</p>

<h2>Apply Professional Formatting</h2>
<p>Choose from preset table styles or customize your own. Add alternating row colors for readability. Format headers with bold text and background colors. Apply borders and alignment consistently throughout the spreadsheet.</p>

<h2>Multiple Delimiter Support</h2>
<p>Convert comma-separated, semicolon-separated, tab-separated, or custom-delimited files. Auto-detection identifies the correct delimiter. Handle quoted fields and escaped characters correctly. Support for multiline cell content within quotes.</p>

<h2>Enhanced Excel Features</h2>
<p>Enable filtering and sorting on your data columns. Add freeze panes for header rows. Create named ranges for easy reference. Output is compatible with Excel formulas and pivot tables for immediate analysis.</p>\`,
  },
  {
    id: "excel-to-json",
    name: "Excel to JSON",
    description: "Convert Excel spreadsheets to JSON format",
    icon: "Braces",
    type: "excel-to-json",
    color: "bg-yellow-600",
    emoji: "🔄",
    metaTitle: "Excel to JSON Converter Online Free - XLSX to JSON | PDF Tools",
    metaDescription: "Convert Excel spreadsheets to JSON format online for free. Transform XLSX data into structured JSON for APIs, databases, and web applications.",
    seoArticle: \`<h2>Excel to JSON Converter - Data for Modern Applications</h2>
<p>Convert Microsoft Excel spreadsheets into structured JSON data with our free online tool. JSON is the standard data format for web APIs, NoSQL databases, and modern applications. Transform your spreadsheet data into developer-friendly JSON instantly.</p>

<h2>Flexible JSON Structure</h2>
<p>Choose between array of objects format where each row becomes an object with column headers as keys, or nested structures for hierarchical data. First row headers become property names automatically. Empty cells are handled as null or omitted based on preference.</p>

<h2>Data Type Preservation</h2>
<p>Numbers remain numbers in JSON output, not strings. Boolean values are detected and converted properly. Dates can be formatted as ISO strings, timestamps, or custom formats. Nested data in cells can be parsed into sub-objects or arrays.</p>

<h2>Multiple Sheet Support</h2>
<p>Convert all sheets into a single JSON object with sheet names as keys. Process specific sheets by selection. Each sheet becomes its own array of records. Maintain relationships between sheets in the JSON structure.</p>

<h2>Developer Ready Output</h2>
<p>Generated JSON is properly formatted and validated. Copy directly into code or API payloads. Import into MongoDB, CouchDB, or any document database. Use as configuration files or static data sources. Minified output option for production use.</p>\`,
  },`;

// Find the last closing of a tool definition and add new tools before the final ];
const lastToolEnd = content.lastIndexOf('  },\n];');
if (lastToolEnd !== -1) {
    content = content.slice(0, lastToolEnd + 4) + newTools + '\n];';
    fs.writeFileSync('shared/schema.ts', content);
    console.log("Successfully added new tool definitions!");
} else {
    console.log("Could not find the end of pdfTools array!");
    console.log("Trying alternative approach...");
    
    // Alternative: look for just ];
    const altEnd = content.lastIndexOf('\n];');
    if (altEnd !== -1) {
        content = content.slice(0, altEnd) + ',' + newTools + '\n];';
        fs.writeFileSync('shared/schema.ts', content);
        console.log("Successfully added new tool definitions using alternative approach!");
    } else {
        console.log("Failed to find end of array");
    }
}
