---
name: NurseDx Clinical System
colors:
  surface: '#f5fbf5'
  surface-dim: '#d6dbd6'
  surface-bright: '#f5fbf5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff5ef'
  surface-container: '#eaefea'
  surface-container-high: '#e4eae4'
  surface-container-highest: '#dee4de'
  on-surface: '#171d1a'
  on-surface-variant: '#3d4943'
  inverse-surface: '#2c322e'
  inverse-on-surface: '#ecf2ed'
  outline: '#6d7a73'
  outline-variant: '#bccac1'
  surface-tint: '#006c4e'
  primary: '#00694c'
  on-primary: '#ffffff'
  primary-container: '#008560'
  on-primary-container: '#f5fff7'
  inverse-primary: '#68dbae'
  secondary: '#1960a6'
  on-secondary: '#ffffff'
  secondary-container: '#7ab3ff'
  on-secondary-container: '#00447e'
  tertiary: '#993f3a'
  on-tertiary: '#ffffff'
  tertiary-container: '#b85751'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#86f8c9'
  primary-fixed-dim: '#68dbae'
  on-primary-fixed: '#002115'
  on-primary-fixed-variant: '#00513a'
  secondary-fixed: '#d4e3ff'
  secondary-fixed-dim: '#a4c9ff'
  on-secondary-fixed: '#001c39'
  on-secondary-fixed-variant: '#004883'
  tertiary-fixed: '#ffdad6'
  tertiary-fixed-dim: '#ffb3ad'
  on-tertiary-fixed: '#410003'
  on-tertiary-fixed-variant: '#7e2a27'
  background: '#f5fbf5'
  on-background: '#171d1a'
  surface-variant: '#dee4de'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  clinical-code:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
  margin-mobile: 16px
  touch-target-min: 48px
---

## Brand & Style
The design system is engineered for high-stakes clinical environments where clarity, speed of cognition, and trust are paramount. It follows a **Corporate / Modern** aesthetic with a heavy emphasis on medical utility. The visual language is intentionally restrained to reduce cognitive load for healthcare professionals.

- **Personality:** Clinical, authoritative, and precise.
- **Target Audience:** Nurses, clinicians, and medical administrators within the TICOS health ecosystem.
- **Style:** A flat, high-fidelity approach utilizing structured containers, generous whitespace, and a strict adherence to a logic-driven hierarchy. It avoids decorative elements like gradients or heavy shadows in favor of crisp borders and purposeful color application.

## Colors
The palette is rooted in medical safety. **Teal (#1D9E75)** serves as the primary brand and action color, associated with growth and healing. **Blue (#185FA5)** provides a secondary anchor for administrative tasks and technical depth.

- **Primary:** Actions, progress indicators, and nurse-specific roles.
- **Secondary:** Navigation accents, administrative roles, and secondary information tiers.
- **Neutral:** A cool-toned background (#F8FAFB) ensures that white surface cards pop with clarity.
- **Semantic:** Success (Teal), Information (Blue), Warning (Amber), and Error (Red) should follow WCAG 2.1 AA contrast requirements against white backgrounds.

## Typography
This design system utilizes **Inter** for all UI elements to ensure maximum legibility and a neutral, professional tone. To differentiate clinical metadata, **JetBrains Mono** is employed specifically for NANDA codes and technical identifiers, creating a distinct visual "texture" for data-heavy sections.

- **Scale:** Keep mobile headers compact (max 24px) to preserve screen real estate for clinical data.
- **Weights:** Use Medium (500) for interactive labels and Semibold (600) for section headers.
- **Clinical Codes:** Always rendered in the monospace font, typically using the Primary Teal color to signify their status as core diagnostic data points.

## Layout & Spacing
The layout follows a **Fluid Grid** model optimized for mobile handsets. A 4px baseline grid ensures vertical rhythm.

- **Margins:** 16px horizontal margins for mobile screens.
- **Touch Targets:** A strict minimum of 48px height for all interactive elements (buttons, list items, inputs) to accommodate use in fast-paced or gloved environments.
- **Density:** While whitespace is generous, related clinical data points (e.g., vital signs) should use "sm" (12px) spacing to maintain grouping, while sections are separated by "lg" (24px) spacing.

## Elevation & Depth
This design system rejects heavy shadows in favor of **Tonal Layers and Crisp Outlines**. Depth is communicated through structural stacking rather than faux-lighting.

- **Cards:** White surfaces with a 1px solid border (#E5E7EB). No shadow is used for standard cards.
- **Active State:** A subtle 2px "Soft" shadow (8% opacity, 4px blur) may be applied only to floating action buttons or elevated modals to indicate they sit above the primary content plane.
- **Separators:** Use subtle hairline dividers (1px) within cards to separate data fields without adding visual bulk.

## Shapes
The shape language balances modern approachability with structured order. 

- **Containers:** All cards and primary containers use a **12px (0.75rem)** corner radius.
- **Input Fields:** Use a **8px (0.5rem)** radius for a more precise, technical feel.
- **Badges/Chips:** Use **Pill-shaped (999px)** radii to distinguish role and status indicators from structural layout blocks.

## Components

### Buttons
- **Primary:** Solid Teal (#1D9E75) with white text. 48px height.
- **Secondary:** Outlined Blue (#185FA5) with 1px border.
- **Typography:** Bold Inter, 14px, uppercase or sentence case depending on priority.

### Diagnosis Cards
- **Structure:** White background, 1px #E5E7EB border, 12px radius.
- **Content:** Headline for the diagnosis name. The NANDA code must be displayed in a dedicated slot using the **Clinical-Code** typography style (JetBrains Mono, Teal).

### Role Badges
- **"Enfermero":** Teal background (10% opacity) with Teal solid text, pill-shaped.
- **"Administrador":** Blue background (10% opacity) with Blue solid text, pill-shaped.

### Patient List Items
- **Avatar:** Circular initials avatar using secondary blue background with white text.
- **Layout:** 16px padding, horizontal arrangement: Avatar | Name & Details | Chevron.
- **Touch Area:** Entire row must be at least 64px tall to ensure ease of tapping.

### Inputs
- **Style:** 1px #E5E7EB border, 8px radius. 
- **Focus:** 2px solid Teal border. 
- **Labels:** Small, bold labels positioned above the input field, never inside as placeholders for accessibility.

### Navigation
- **Bottom Bar:** Fixed height 64px, white background, 1px top border.
- **Active State:** Teal icon and label; inactive state #9CA3AF (Gray).