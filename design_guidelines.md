# Homeopathy Patient Management System - Design Guidelines

## Design Approach
**System-Based Approach**: Using Material Design principles for healthcare applications, emphasizing clarity, accessibility, and professional medical interface standards. This approach ensures consistency across the multi-tenant platform while maintaining scalability for 1000+ doctors.

## Core Design Elements

### A. Color Palette
**Primary Colors:**
- Light Mode: 14 78% 45% (Medical Blue)
- Dark Mode: 14 78% 35% (Darker Medical Blue)

**Secondary Colors:**
- Light Mode: 158 64% 52% (Medical Green)
- Dark Mode: 158 64% 42% (Darker Medical Green)

**Neutral Colors:**
- Background Light: 0 0% 98%
- Background Dark: 222 84% 5%
- Text Light: 222 84% 15%
- Text Dark: 210 40% 90%

**Status Colors:**
- Success: 142 76% 36%
- Warning: 38 92% 50%
- Error: 0 84% 60%
- Info: 217 91% 60%

### B. Typography
**Primary Font**: Inter (Google Fonts)
**Secondary Font**: Roboto (Google Fonts)

**Hierarchy:**
- H1: 2.5rem, font-bold (Dashboard titles)
- H2: 2rem, font-semibold (Section headers)
- H3: 1.5rem, font-medium (Card titles)
- Body: 1rem, font-normal (Content text)
- Small: 0.875rem, font-normal (Labels, captions)

### C. Layout System
**Tailwind Spacing Units**: 2, 4, 6, 8, 12, 16
- Micro spacing: p-2, m-2 (8px)
- Standard spacing: p-4, m-4 (16px)
- Section spacing: p-6, m-6 (24px)
- Large spacing: p-8, m-8 (32px)
- Extra large: p-12, m-12 (48px)
- Maximum: p-16, m-16 (64px)

### D. Component Library

**Navigation:**
- Collapsible sidebar with role-based menu items
- Top navigation bar with clinic branding area
- Breadcrumb navigation for deep pages
- Mobile-responsive hamburger menu

**Forms:**
- Consistent form layouts with label-above-input pattern
- Multi-step forms for patient registration
- Inline validation with clear error states
- File upload areas with drag-and-drop support

**Data Displays:**
- Clean table designs with sortable headers
- Patient cards with quick action buttons
- Appointment calendar with color-coded time slots
- Dashboard widgets with key metrics

**Overlays:**
- Modal dialogs for confirmations and forms
- Slide-over panels for detailed patient information
- Toast notifications for success/error messages
- Loading states with skeleton screens

**Medical-Specific Components:**
- Prescription builder with medicine search
- Patient timeline for case history
- Appointment scheduling grid
- Billing invoice generator

### E. Multi-Tenant Customization
- Clinic logo area in top navigation (max height: h-12)
- Customizable primary color scheme per clinic
- White-label branding options
- Consistent layout regardless of customization

## Layout Structure
**Desktop**: Sidebar + main content area
**Tablet**: Collapsible sidebar overlay
**Mobile**: Bottom navigation + hamburger menu

## Accessibility
- WCAG 2.1 AA compliance
- High contrast mode support
- Keyboard navigation throughout
- Screen reader optimized labels
- Focus indicators on all interactive elements

## Images
No large hero images needed for this medical application. Use:
- Small clinic logos (max 48px height)
- Patient avatar placeholders (circular, 40px)
- Medical icons from Heroicons for features
- Document preview thumbnails for uploaded files