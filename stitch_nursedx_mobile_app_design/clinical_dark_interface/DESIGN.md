---
name: Clinical Dark Interface
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#bbcac1'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#86948b'
  outline-variant: '#3c4a43'
  surface-tint: '#4edeaa'
  primary: '#4edeaa'
  on-primary: '#003827'
  primary-container: '#23c18f'
  on-primary-container: '#004933'
  inverse-primary: '#006c4d'
  secondary: '#a2c9ff'
  on-secondary: '#00315c'
  secondary-container: '#0274cb'
  on-secondary-container: '#f7f8ff'
  tertiary: '#ffb4a8'
  on-tertiary: '#61120b'
  tertiary-container: '#ff8978'
  on-tertiary-container: '#752118'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#6efbc4'
  primary-fixed-dim: '#4edeaa'
  on-primary-fixed: '#002115'
  on-primary-fixed-variant: '#005139'
  secondary-fixed: '#d3e4ff'
  secondary-fixed-dim: '#a2c9ff'
  on-secondary-fixed: '#001c38'
  on-secondary-fixed-variant: '#004881'
  tertiary-fixed: '#ffdad5'
  tertiary-fixed-dim: '#ffb4a8'
  on-tertiary-fixed: '#410000'
  on-tertiary-fixed-variant: '#80291f'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  display-lg:
    fontFamily: Manrope
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-md:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  code-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
---

## Brand & Style
The design system establishes a high-performance, clinical environment optimized for low-light medical settings and reduced eye strain during extended shifts. The brand personality is authoritative, precise, and reassuring. It bridges the gap between critical medical data and intuitive software.

The aesthetic follows a **Corporate / Modern** approach with a "Clinical Tech" edge. It prioritizes information density without sacrificing clarity. Every element is designed to feel like a calibrated instrument—reliable, responsive, and distraction-free. The dark mode implementation focuses on "luminous data," where critical clinical indicators pop against a deep, stable background, ensuring that diagnostic codes and patient vitals are the primary focus.

## Colors
This design system utilizes a layered dark palette to create depth and hierarchy.
- **Background (#0A0F0D):** A deep, charcoal-tinted navy that serves as the base canvas.
- **Surface (#1E2521):** A slightly elevated dark gray with a hint of forest green to ground the clinical feel. This is used for cards, sidebars, and navigational elements.
- **Primary Teal (#23C18F):** An adjusted version of the TICOS teal, shifted slightly brighter and more saturated to ensure AA/AAA accessibility compliance against dark backgrounds. Used for primary actions and "active" clinical states.
- **Secondary Blue (#3088E0):** A vibrant accent blue used for secondary navigation, links, and informative callouts.
- **Typography:** Pure White (#FFFFFF) is reserved for high-priority headers, while Silver-Gray (#E0E0E0) is used for standard body text to prevent "halation" or visual vibration on OLED screens.

## Typography
The typographic hierarchy is built for rapid scanning. 
- **Headlines (Manrope):** Chosen for its modern, balanced geometry which remains legible even at smaller display sizes.
- **Body (Inter):** A systematic, utilitarian font designed for high readability in digital interfaces.
- **NANDA/Clinical Codes (JetBrains Mono):** Monospaced fonts are used for all clinical diagnostic codes (e.g., NANDA-I, ICD-10) to ensure character distinction (O vs 0) and vertical alignment in data tables.

All text should maintain a contrast ratio of at least 4.5:1. For interactive labels, use `label-caps` in uppercase to distinguish from patient data.

## Layout & Spacing
The layout follows a **Fluid Grid** model with a consistent 4px baseline.
- **Desktop:** 12-column grid with 16px gutters and 32px outer margins.
- **Tablet:** 8-column grid with 16px gutters.
- **Mobile:** 4-column grid with 16px gutters.

Spacing is used to group related clinical observations. Use `md` (16px) for internal card padding and `lg` (24px) for separation between distinct diagnostic sections. Data-heavy tables may use a "compact" mode with `sm` (8px) vertical padding to maximize visible rows on-screen.

## Elevation & Depth
In this dark-themed system, depth is conveyed through **Tonal Layers** and subtle **Inner Glows** rather than heavy shadows.
- **Level 0 (Background):** #0A0F0D (Base layer).
- **Level 1 (Cards/Panels):** #1E2521 (Surface).
- **Level 2 (Modals/Pop-overs):** #2A322D (Elevated surface).
- **Interactive States:** Hovering over a card should apply a 1px solid border using the Primary Teal at 30% opacity, rather than a shadow, to maintain the clean clinical feel.
- **Overlays:** Use a 60% black scrim for modals to focus the user's attention on the critical input task.

## Shapes
Following the "rounded_eight" philosophy, the system uses a standard 8px (0.5rem) radius for most UI components.
- **Small Elements (Checkboxes, Tags):** 4px (rounded-sm)
- **Standard Elements (Buttons, Inputs, Cards):** 8px (rounded-md)
- **Large Containers (Modals, Feature Sections):** 16px (rounded-lg)

This level of rounding softens the technical nature of the software, making it feel more approachable and modern while maintaining enough structure for professional medical use.

## Components
- **Buttons:** Primary buttons use a solid Teal fill with white text. Secondary buttons use a Teal outline with Teal text. All buttons have an 8px radius and a minimum height of 44px for touch-target safety.
- **NANDA Chips:** Displayed using `code-sm` typography inside a subtly filled container (#2A322D) with a high-contrast Teal or Blue left-border (2px) to denote category.
- **Input Fields:** Background uses the base background color (#0A0F0D) with a 1px border of #3A443F. On focus, the border transitions to Primary Teal. Labels are `body-sm` in Silver-Gray.
- **Data Tables:** Row headers use `label-caps`. Zebra-striping is discouraged; use subtle 1px dividers in #2A322D to separate entries.
- **Cards:** Utilize a consistent 16px padding. Titles should be `headline-md` in White.
- **Status Indicators:** Use circular dots alongside text for alerts (e.g., Critical, Stable, Pending). Use the defined status colors (Red, Orange, Blue) to ensure immediate cognitive recognition.