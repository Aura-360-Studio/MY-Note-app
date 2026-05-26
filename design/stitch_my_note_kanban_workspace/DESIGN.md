---
name: Cyanide Premium Hardware
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
  on-surface-variant: '#b9cacb'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#849495'
  outline-variant: '#3b494b'
  surface-tint: '#00dbe9'
  primary: '#dbfcff'
  on-primary: '#00363a'
  primary-container: '#00f0ff'
  on-primary-container: '#006970'
  inverse-primary: '#006970'
  secondary: '#c6c6c7'
  on-secondary: '#2f3131'
  secondary-container: '#454747'
  on-secondary-container: '#b4b5b5'
  tertiary: '#fff5de'
  on-tertiary: '#3b2f00'
  tertiary-container: '#fed639'
  on-tertiary-container: '#715d00'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#7df4ff'
  primary-fixed-dim: '#00dbe9'
  on-primary-fixed: '#002022'
  on-primary-fixed-variant: '#004f54'
  secondary-fixed: '#e2e2e2'
  secondary-fixed-dim: '#c6c6c7'
  on-secondary-fixed: '#1a1c1c'
  on-secondary-fixed-variant: '#454747'
  tertiary-fixed: '#ffe179'
  tertiary-fixed-dim: '#eac324'
  on-tertiary-fixed: '#231b00'
  on-tertiary-fixed-variant: '#554500'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  display:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '500'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.0'
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.0'
    letterSpacing: 0.03em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  base: 8px
  container-padding-mobile: 20px
  container-padding-desktop: 64px
  gutter: 24px
  section-gap: 80px
---

## Brand & Style
The design system transitions from a cold, technical terminal into a premium, approachable hardware store aesthetic. It targets tech-conscious consumers who value precision but desire a tactile, inviting interface. 

The style is **Modern/Corporate with Google-inspired Softness**. It utilizes generous whitespace, expansive rounded corners, and subtle tonal shifts to move away from "software-only" visuals toward a "physical product" feel. The emotional response is one of high-end reliability: the interface should feel as polished as a piece of premium consumer electronics.

## Colors
The palette is anchored in a deep, dark environment to maintain the core identity, but introduces softer surface transitions to mimic hardware finishes.

- **Primary (#00f0ff):** Used sparingly for high-intent actions, active states, and focal points.
- **Secondary (#ffffff):** Reserved for high-contrast typography and icon reinforces.
- **Neutral/Surface:** The background uses a true dark (#121212), while containers use a softer charcoal (#1e1e1e) to create "pillows" of content rather than sharp divisions.
- **Accent States:** All interactive states should use low-opacity overlays of the primary color rather than harsh borders.

## Typography
We utilize **Geist** to maintain a modern, technical soul while softening its implementation. Headlines should be set with tighter tracking and generous leading to create an editorial feel. Body text remains highly legible with increased line height to emphasize the premium, airy nature of the design. Small labels are slightly tracked out and set in Medium weight for a structured, organized appearance.

## Layout & Spacing
The layout follows a **Fluid Grid** model with high internal breathing room. 

- **Desktop:** 12-column grid with 64px side margins. Elements are grouped into large, distinct "modules" with 80px vertical spacing to prevent visual clutter.
- **Mobile:** 4-column grid with 20px margins. 
- **Rhythm:** Spacing is strictly based on an 8px scale. Padding inside cards should be significantly larger than the gutter (typically 32px or 40px) to enhance the "premium hardware" feel.

## Elevation & Depth
Depth is achieved through **Tonal Layers** and subtle **Ambient Shadows**. Instead of traditional drop shadows, we use:

1.  **Surface Tiering:** The background is the lowest level. Cards and containers sit one tone higher (#1e1e1e).
2.  **Soft Shadows:** For elevated elements like modals or primary buttons, use a large-radius (30px+), very low-opacity (10-15%) shadow tinted with the primary color or pure black to create a natural lift.
3.  **Interaction:** On hover, elements should not move "up" via shadow alone; instead, they should subtly scale or lighten in tone to feel like a responsive physical surface.

## Shapes
The shape language is the defining characteristic of the design system. We use **Extra Large (Pill-shaped)** rounding across the board. 

- **Buttons:** Must be fully pill-shaped (height/2 radius).
- **Cards/Containers:** Use a minimum of 24px-32px (rounded-xl) to create a soft, friendly silhouette.
- **Inputs:** Softened to match the button radius.
- **Icons:** Should be housed within circular or highly rounded backgrounds to maintain the "Pixel" hardware aesthetic.

## Components
- **Buttons:** High-contrast primary buttons are fully pill-shaped. Secondary buttons use a subtle tonal border or a ghost style with 10% primary color fill.
- **Cards:** Large, expansive radius (32px). Content inside should be centered or have significant 32px-40px inset padding.
- **Inputs:** Search bars and text fields must be pill-shaped. Focus states use a 2px solid #00f0ff ring with a subtle outer glow.
- **Chips/Badges:** Small, fully rounded capsules. Use them for categorization or status indicators with low-opacity background fills.
- **Lists:** Items are separated by generous vertical space rather than horizontal lines. Selection states use a rounded-rect background with a 16px radius.
- **Product Tiles:** Focus on large imagery or iconography with minimal text, emphasizing the "Hardware Store" feel.