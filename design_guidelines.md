# PDF Tools Web Application - Design Guidelines

## Design Approach

**Reference-Based Approach**: Drawing inspiration from successful PDF tool platforms like Smallpdf and ILovePDF, which prioritize clarity, efficiency, and trust. The design emphasizes accessible tool discovery, straightforward workflows, and professional credibility.

**Core Principle**: Clean, utility-focused design that makes all 10 tools immediately discoverable while maintaining a modern, trustworthy aesthetic.

---

## Typography

**Font Stack**: Google Fonts via CDN
- **Primary**: Inter (headings, UI elements) - weights 500, 600, 700
- **Secondary**: Inter (body text) - weights 400, 500

**Scale**:
- Hero headline: text-5xl font-bold (desktop), text-3xl (mobile)
- Tool card titles: text-xl font-semibold
- Section headings: text-3xl font-bold
- Body text: text-base
- Helper text: text-sm text-gray-600

---

## Layout System

**Spacing Primitives**: Tailwind units of **2, 4, 6, 8, 12, 16**
- Component padding: p-6, p-8
- Section spacing: py-12, py-16, py-20
- Grid gaps: gap-6, gap-8
- Button padding: px-6 py-3

**Container Widths**:
- Main container: max-w-7xl mx-auto px-4
- Tool grid: Full width within container
- Content sections: max-w-4xl for text-heavy areas

---

## Component Library

### Navigation
- Clean header with logo left, navigation center/right
- Sticky on scroll with subtle shadow
- Mobile: Hamburger menu
- Height: h-16 to h-20

### Hero Section
**Layout**: Centered content with supporting visual
- Headline + subheading + CTA button
- Brief tagline: "10 Powerful PDF Tools - All Free, Secure & Easy to Use"
- Single primary CTA: "Choose a Tool Below"
- Height: 60vh with gradient background treatment
- NO large hero image - focus on clarity and quick tool access

### Tool Cards Grid
**Critical Component** - The centerpiece of the homepage:
- Grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-5` (2 rows of 5 tools)
- Each card includes:
  - Large icon (Heroicons or Font Awesome via CDN)
  - Tool name (text-lg font-semibold)
  - Brief description (text-sm, 1-2 lines)
  - Hover state: Subtle lift with shadow
- Card styling: Rounded corners (rounded-xl), border, white background
- Spacing: gap-6 between cards, p-6 internal padding

**10 Tools Layout**:
1. Merge PDF
2. Split PDF  
3. Compress PDF
4. PDF to Images
5. Images to PDF
6. Rotate PDF
7. Delete Pages
8. Merge Alternately
9. Add Page Numbers
10. Add Watermark

### File Upload Interface (Modal/Tool Page)
- Large drag-and-drop zone with dashed border (border-2 border-dashed)
- "Drop files here or click to browse" message
- File list display with remove buttons
- Upload icon (cloud-upload) centered
- Minimum height: min-h-64

### Progress Indicators
- Linear progress bar with percentage
- Animated processing state
- Success checkmark animation on completion

### Action Buttons
- Primary: Solid background, rounded-lg, px-6 py-3, font-medium
- Secondary: Border style with transparent background
- Download button: Prominent styling with download icon
- Processing button: Loading spinner state

### Features Section
**Layout**: 3-column grid below tools
- Icons: Security, Speed, Privacy
- Each with icon + heading + brief description
- Minimal, builds trust without overwhelming

### Footer
- Simple 2-column layout (mobile stacks)
- Left: Tool links (all 10 tools listed)
- Right: About, Privacy Policy, Terms
- Copyright notice centered
- Social links if applicable
- Padding: py-12

---

## Interaction Patterns

**File Upload Flow**:
1. User clicks tool card → Opens tool interface
2. Drag-and-drop or click to select files
3. File preview with thumbnails (for PDFs)
4. Configure options (merge order, compression level, etc.)
5. Process button → Progress indicator
6. Download button appears on completion

**Tool Cards**: 
- Hover: scale-105 transform, shadow-lg
- Click: Navigate to tool page or open modal

**Drag-and-Drop**:
- Visual feedback on drag-over (background change)
- File type validation with error messages

---

## Accessibility
- All interactive elements keyboard navigable
- ARIA labels on file upload zones
- Focus states: ring-2 ring-offset-2
- Error messages clearly announced
- Progress updates communicated

---

## Key Design Decisions

1. **No Hero Image**: Focus users immediately on tool selection rather than decorative imagery
2. **5-Column Grid**: Displays all 10 tools above the fold on desktop (2 rows)
3. **Card-Based Navigation**: Each tool is a clickable card - intuitive and scannable
4. **Trust Indicators**: Small features section emphasizing security/privacy
5. **Minimal Animations**: Subtle hovers and progress indicators only
6. **Modal vs Pages**: Use modals for quick tasks, dedicated pages for complex operations

---

## Visual Hierarchy

**Priority Order**:
1. Tool cards grid (primary focus)
2. Hero section (brief, supportive)
3. Features/trust indicators
4. Footer navigation

**No multi-column layout** except for tool cards grid and footer. Keep all other sections single-column for clarity and focus.