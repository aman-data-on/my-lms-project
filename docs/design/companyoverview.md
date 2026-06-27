---
name: Kinetic Enterprise
colors:
  surface: '#f6faff'
  surface-dim: '#d2dbe4'
  surface-bright: '#f6faff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#ecf5fe'
  surface-container: '#e6eff8'
  surface-container-high: '#e0e9f2'
  surface-container-highest: '#dbe4ed'
  on-surface: '#141d23'
  on-surface-variant: '#5b403f'
  inverse-surface: '#293138'
  inverse-on-surface: '#e9f2fb'
  outline: '#8f6f6e'
  outline-variant: '#e4bebc'
  surface-tint: '#bb152c'
  primary: '#b7102a'
  on-primary: '#ffffff'
  primary-container: '#db313f'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb3b1'
  secondary: '#5f5e60'
  on-secondary: '#ffffff'
  secondary-container: '#e2dfe1'
  on-secondary-container: '#636264'
  tertiary: '#5a5c5d'
  on-tertiary: '#ffffff'
  tertiary-container: '#737576'
  on-tertiary-container: '#fcfdfe'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad8'
  primary-fixed-dim: '#ffb3b1'
  on-primary-fixed: '#410007'
  on-primary-fixed-variant: '#92001c'
  secondary-fixed: '#e4e2e4'
  secondary-fixed-dim: '#c8c6c8'
  on-secondary-fixed: '#1b1b1d'
  on-secondary-fixed-variant: '#474649'
  tertiary-fixed: '#e1e3e4'
  tertiary-fixed-dim: '#c5c7c8'
  on-tertiary-fixed: '#191c1d'
  on-tertiary-fixed-variant: '#454748'
  background: '#f6faff'
  on-background: '#141d23'
  surface-variant: '#dbe4ed'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
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
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 24px
  margin-page: 40px
  margin-mobile: 16px
  container-max: 1440px
---

## Brand & Style

This design system is engineered for a high-performance, enterprise-grade Learning Management System (LMS). It prioritizes **clarity, efficiency, and authority**. The aesthetic is a fusion of **Modern Corporate** and **Functional Minimalism**, designed to handle high information density without overwhelming the user.

The brand personality is professional yet energetic, utilizing a high-contrast palette to drive focus. The goal is to evoke a sense of progress and accomplishment. Key visual principles include:
- **Precision:** Tight alignment and clean, low-contrast borders for structural integrity.
- **Velocity:** Subtle use of the primary red to indicate action, momentum, and critical paths.
- **Focus:** Generous use of white and neutral grays to provide a "quiet" environment for complex learning material.

## Colors

The palette is rooted in the high-contrast tension between deep blacks, crisp whites, and a vibrant "Action Red."

- **Primary (Action Red):** Used sparingly for primary calls-to-action (CTAs), progress indicators, and active states. It represents the "kinetic" energy of the learning process.
- **Secondary (Obsidian):** The foundation for text, navigation bars, and deep structural elements. It provides a premium, grounded feel.
- **Tertiary (Surface):** Light gray backgrounds used to differentiate content zones and dashboard modules.
- **Functional Grays:** A range of neutrals used for borders, secondary text, and disabled states to ensure maximum legibility and a sophisticated hierarchy.

## Typography

The typography system uses a tri-font strategy to balance character with utility. 

- **Hanken Grotesk** is the primary typeface for headlines. Its contemporary, sharp geometry provides the "enterprise" feel and maintains readability even at high weights.
- **Inter** is used for all body copy and UI elements. Its neutral, systematic nature is perfect for long-form educational content and dense data tables.
- **JetBrains Mono** is introduced for labels, metadata (e.g., "Module 1", "4 Topics"), and status indicators. This monospaced choice adds a technical, "dashboard" precision to the UI.

All typography follows a strict vertical rhythm to maintain a sense of order in information-heavy layouts.

## Layout & Spacing

The layout utilizes a **12-column fixed grid** for desktop, ensuring content remains readable and focused. For an LMS, the layout must accommodate a persistent side-navigation (sidebar) and a content stage.

- **The Content Stage:** Uses a "nested container" approach. Core instructional content is restricted to an 8-column center-span to prevent excessive line lengths, while dashboard overviews utilize the full 12 columns.
- **Information Density:** High density is achieved through consistent 4px/8px increments. Gutters are kept at 24px to provide clear separation between cards and modules without wasting space.
- **Reflow:** On Tablet, the sidebar collapses into a rail or hamburger menu. On Mobile, the layout shifts to a single-column fluid stack with reduced horizontal margins (16px).

## Elevation & Depth

This design system avoids heavy shadows in favor of **Tonal Layers and Clean Outlines**. This creates a flatter, more modern "SaaS" aesthetic that feels part of the browser.

1.  **Level 0 (Base):** The main background (`#F8F9FA` or white).
2.  **Level 1 (Cards/Modules):** Pure white surfaces with a 1px solid border (`#E5E7EB`). No shadow.
3.  **Level 2 (Interactive/Floating):** Subtle, tight shadows (4px blur, 10% opacity) used only for dropdowns, modals, or active card states to indicate "lift."
4.  **The Sidebar:** Utilizes the secondary Obsidian color to create a hard vertical "anchor" for the application, visually separating navigation from content.

## Shapes

The shape language is **Soft (0.25rem/4px)**. This choice strikes a balance between the clinical feel of sharp corners and the overly casual nature of fully rounded elements.

- Small components (Buttons, Inputs, Badges) use a 4px radius.
- Larger containers (Cards, Sidebar segments) use an 8px radius (`rounded-lg`) to soften the overall interface.
- Progress bars and purely decorative elements may use pill-shapes to provide visual variety and emphasize "flow."

## Components

- **Buttons:** Primary buttons are solid "Action Red" with white text. Secondary buttons use a transparent background with an Obsidian border. "Start Lesson" buttons should include a directional icon (e.g., arrow-right) to imply progression.
- **Module Cards:** Use a 1px border. On hover, the border color should shift to a slightly darker gray or include a 2px "Action Red" left-accent.
- **Progress Indicators:** Use thin, high-contrast lines. Completed states should use a green success checkmark, while the "Active" state is always signaled by the Primary Red.
- **Navigation Sidebar:** The "Active" state in the sidebar uses a vertical red pill indicator on the left or right edge of the list item, paired with a subtle background tint.
- **Input Fields:** Minimalist design with a 1px border. Focus state should use a 2px "Action Red" border to ensure clear accessibility and user focus.
- **Chips/Badges:** Use JetBrains Mono for the text. Use a light gray background for neutral data and a light red tint for high-priority alerts.