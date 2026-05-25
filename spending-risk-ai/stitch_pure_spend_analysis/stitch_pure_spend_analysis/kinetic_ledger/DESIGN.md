---
name: Kinetic Ledger
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#45464d'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#0058be'
  on-secondary: '#ffffff'
  secondary-container: '#2170e4'
  on-secondary-container: '#fefcff'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#002113'
  on-tertiary-container: '#009668'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004395'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
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
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 14px
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1200px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
---

## Brand & Style

The design system is engineered for a demographic that values financial clarity without the clinical coldness of traditional banking. The brand personality is **Sophisticated, Insightful, and Energetic**. It balances the gravity of financial management with the vibrant pulse of youth culture.

The visual style is **Refined Minimalism**. It leverages heavy whitespace to reduce cognitive load during data entry and analysis. We combine the structural reliability of Corporate Modern design with the "soft-tech" feel of contemporary SaaS, utilizing subtle depth and high-contrast touchpoints to guide the user's journey through their spending habits.

## Colors

The palette is anchored by **Deep Navy** (#0F172A), providing a sense of stability and institutional trust. This is contrasted by **Vibrant Blue** (#3B82F6), used for primary actions and interactive states to maintain a high-energy, youthful feel.

**Mint Green** (#10B981) serves as a specialized accent color, reserved exclusively for "positive" financial indicators: savings growth, income, and budget surpluses. 

The background utilizes a soft off-white/slate neutral to prevent eye strain and allow the data-heavy cards to "pop" via subtle tonal shifts.

## Typography

This design system uses **Inter** exclusively to maintain a systematic, utilitarian aesthetic that feels contemporary and highly legible. 

Headlines use a tight letter-spacing and bold weights to create a strong visual anchor for data sections. Body text is optimized for readability with generous line heights. Labels for data points and chart axes should use the `label-sm` tier to maintain a clean, organized hierarchy without competing with primary financial figures.

## Layout & Spacing

The system follows a **Fixed Grid** philosophy for desktop to maintain a premium, editorial feel for financial dashboards, while transitioning to a **Fluid Grid** for mobile devices.

- **Desktop:** 12-column grid, 1200px max width, centered.
- **Tablet:** 8-column grid, fluid width with 32px side margins.
- **Mobile:** 4-column grid, fluid width with 16px side margins.

A strict 8px spacing scale governs all padding and margins to ensure mathematical harmony. Dashboards should utilize "Spacious" padding (32px+) between major modules to reinforce the minimalist aesthetic.

## Elevation & Depth

Visual hierarchy is established through **Ambient Shadows** and **Tonal Layers**. 

The base canvas is the lightest neutral. Primary cards and containers sit on "Level 1" depth, using a very soft, diffused shadow (15% opacity Deep Navy, 20px blur, 4px Y-offset). 

Interactive elements like buttons or active input fields utilize "Level 2" depth when hovered, increasing the shadow spread to simulate physical lift. We avoid harsh borders, opting instead for thin (1px) low-contrast strokes in a slightly darker neutral to define boundaries where shadows might feel too heavy.

## Shapes

The shape language is defined by **Large Radii** to evoke a friendly, approachable atmosphere. 

Standard components (buttons, inputs) use a `0.5rem` radius. Large structural elements, such as spending analysis cards or modal containers, must use `rounded-xl` (1.5rem) to soften the overall UI. 

Data visualization bars should use fully rounded caps (pill-shape) to differentiate them from functional UI containers and provide a modern, "liquid" feel to the analytics.

## Components

### Buttons
Primary buttons are high-contrast, using Deep Navy or Vibrant Blue with white text. They feature a generous horizontal padding (24px) and bold labels. Secondary buttons use a ghost style with a 1px border or a light grey tonal background.

### Input Fields
Inputs should be large (48px height) with a subtle grey background and no border in their default state. Upon focus, they transition to a white background with a 2px Vibrant Blue border and a soft glow.

### Cards
Cards are the primary container for consumption data. They feature `rounded-xl` corners and a 1px border (#E2E8F0). The background is always pure white to stand out against the off-white page canvas.

### Chips/Tags
Used for transaction categories (e.g., "Food", "Transport"). These use a low-saturation version of the category color with high-saturation text to ensure legibility while remaining secondary to the main price figures.

### Progress Bars & Charts
All data visualizations must use the Primary Blue or Mint Green. Bar charts should have rounded terminals. Use subtle animations (0.3s ease-out) for chart loading to reinforce the "youthful" and "dynamic" brand pillar.