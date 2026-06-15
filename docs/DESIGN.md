# Design System Inspired by Netflix

## 1. Visual Theme & Atmosphere

Netflix's design system embodies bold simplicity with cinematic gravitas. The interface prioritizes content discovery through a dark, immersive backdrop that makes vibrant imagery pop while maintaining user focus. The aesthetic is modern and accessible, balancing premium streaming service sophistication with intuitive navigation. Deep blacks and charcoals create visual depth, while the iconic Netflix red delivers high-contrast call-to-action moments that demand attention. Typography is confident and substantial, reflecting a brand that understands entertainment as a culturally significant experience. Whitespace is generous, breathing room is intentional, and every interactive element is precisely crafted for quick, friction-free engagement.

**Key Characteristics**

- Deep, dark backgrounds (near-black neutrals) that serve as a canvas for content imagery
- Striking primary red (`#E50914`) reserved for critical CTAs and brand moments
- Generous whitespace and breathing room throughout layouts
- Bold, heavy typography (weights 500–900) that conveys confidence and clarity
- Minimal shadows; flat design with strategic color contrast for depth
- Responsive card-based grid system for content discovery
- High accessibility contrast for white text on dark backgrounds
- Smooth, purposeful interaction patterns with clear visual feedback

## 2. Color Palette & Roles

### Primary
- **Netflix Red** (`#E50914`): Primary brand color used for critical CTAs, sign-in buttons, error states, and brand moments; highest visual priority

### Interactive
- **Button Default** (`#232323`): Dark button backgrounds for secondary and card-based interactions; provides contrast against dark backgrounds
- **Input Active** (`#FFFFFF`): Text input foreground for user-entered content; clear visibility on transparent or dark surfaces

### Neutral Scale
- **White** (`#FFFFFF`): Primary text color, body copy, and high-contrast content on dark backgrounds; most frequently used (951 instances)
- **Light Gray** (`#A9A9A9`): Tertiary text, disabled states, and subtle supporting information
- **Medium Gray** (`#808080`): Fine dividers, icon strokes, and secondary UI accents
- **Dark Gray** (`#414141`): Mid-tone text and secondary content labels; used sparingly
- **Charcoal** (`#2D2D2D`): Section backgrounds and card foundations; lighter than pure black for legibility
- **Near Black** (`#232323`): Primary UI backgrounds, card containers, and structural elements
- **Deep Black** (`#161616`): Page background and lowest-level depth planes

### Surface & Borders
- **Card Surface** (`#232323`): Container backgrounds for content cards and feature blocks; provides visual separation
- **Border Neutral** (`#414141`): Subtle dividers and input underlines; visible but not prominent

### Semantic / Status
- **Error / Danger** (`#E50914`): Error messages, validation failures, and warning states; shares red primary color for consistency

## 3. Typography Rules

### Font Family
**Primary**: Netflix Sans (custom font family)
**Fallback Stack**: `Netflix Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif`

**Secondary**: system sans-serif
**Fallback Stack**: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|----------------|-------|
| Display / H1 | Netflix Sans | 56px | 900 | 70px | 0px | Hero headlines; maximum impact; used sparingly for page titles |
| Heading / H2 | Netflix Sans | 24px | 500 | normal | 0px | Section headers; feature titles; establishes visual breaks |
| Subheading / H3 | Netflix Sans | 16px | 400 | 24px | 0px | Card titles; secondary headlines; content labels |
| Body / Paragraph | Netflix Sans | 20px | 500 | normal | 0px | Long-form descriptions; feature explanations; primary content |
| Label / Button | sans-serif | 14px | 700 | 18.2px | 0px | UI labels; button text; compact information |
| Link / Secondary | Netflix Sans | 14px | 500 | 14px | 0px | Inline links; navigation items; footer links |
| Tertiary Link | Netflix Sans | 16px | 400 | normal | 0px | Tertiary navigation; lighter weight navigation items |
| Input Placeholder | Netflix Sans | 16px | 400 | 24px | 0px | Form input text; user-entered content |
| Code / Monospace | monospace | 12px | 400 | normal | 0px | Code blocks; technical content (if used) |

### Principles
- **Weight as hierarchy**: Heavy weights (900, 700) for primary content; lighter weights (400, 500) for supporting information
- **Size increments**: Jump from 14px to 16px to 20px to 24px to 56px; avoids excessive intermediate sizes
- **Line height breathing**: Larger headlines use tighter line heights (normal); body and tertiary use explicit values (24px, 18.2px) for readability
- **Contrast for accessibility**: White text on dark backgrounds ensures WCAG AA compliance; secondary text uses light gray for distinction
- **Netflix Sans dominance**: Custom font used for primary and secondary content; system sans-serif reserved for compact UI labels and tertiary navigation
- **No letter spacing**: All tracked at 0px; natural character spacing from font metrics

## 4. Component Stylings

### Buttons

#### Primary Button
- **Background**: `#E50914`
- **Text Color**: `#FFFFFF`
- **Font**: Netflix Sans, 24px, weight 500
- **Padding**: `12px 24px`
- **Border Radius**: `4px`
- **Border**: none
- **Height**: `56px`
- **Box Shadow**: none
- **Line Height**: `24px`
- **Hover State**: Background `#B20710` (darkened red)
- **Active State**: Background `#831008` (deeper red)
- **Disabled State**: Background `#414141`, Text Color `#A9A9A9`
- **Usage**: "Get Started," sign-in, primary CTAs, subscription actions

#### Secondary Button
- **Background**: `#232323`
- **Text Color**: `#FFFFFF`
- **Font**: Netflix Sans, 16px, weight 400
- **Padding**: `0px`
- **Border Radius**: `8px`
- **Border**: none
- **Height**: `252px`
- **Box Shadow**: none
- **Line Height**: normal
- **Hover State**: Background `#414141`, slight scale up (1.02x)
- **Active State**: Background `#2D2D2D`
- **Usage**: Content cards, carousel items, trending tiles; acts as a card container with internal content

#### Ghost / Tertiary Link Button
- **Background**: transparent (rgba(0, 0, 0, 0))
- **Text Color**: `rgba(255, 255, 255, 0.7)`
- **Font**: Netflix Sans, 16px, weight 400
- **Padding**: `0px`
- **Border Radius**: `2px`
- **Border**: none
- **Box Shadow**: none
- **Line Height**: normal
- **Hover State**: Text Color `#FFFFFF` (full opacity)
- **Active State**: Text Color `#FFFFFF`, underline `1px solid #FFFFFF`
- **Usage**: Footer links, navigation breadcrumbs, secondary actions

### Cards & Containers

#### Feature Card
- **Background**: `#232323`
- **Border Radius**: `8px`
- **Padding**: `0px` (for image cards); `24px` (for text content cards)
- **Border**: none
- **Box Shadow**: none
- **Hover State**: Slight scale up (1.03x), background remains `#232323`
- **Usage**: Trending content tiles, featured shows, carousel items

#### Content Section Container
- **Background**: `#161616`
- **Padding**: `64px 0px` (top/bottom), `100px` (left/right on large screens)
- **Margin**: `0px`
- **Border Radius**: `0px` (full-width sections)
- **Usage**: Page sections, "Trending Now," "More Reasons to Join," FAQ sections

#### Benefit / Feature Card (4-up grid)
- **Background**: `#2D2D2D`
- **Padding**: `24px`
- **Border Radius**: `8px`
- **Width**: calc(25% - 20px) on large screens
- **Height**: auto
- **Box Shadow**: none
- **Hover State**: Background `#414141`, icon scale up (1.1x)
- **Usage**: "More Reasons to Join" feature blocks

### Inputs & Forms

#### Email Input (Text Field)
- **Background**: transparent (rgba(0, 0, 0, 0))
- **Text Color**: `#FFFFFF`
- **Font**: Netflix Sans, 16px, weight 400
- **Padding**: `24px 16px 8px 16px`
- **Border Radius**: `0px`
- **Border**: `0px solid` (no visible border; underline added via pseudo-element)
- **Border Bottom**: `1px solid #FFFFFF` (underline effect)
- **Height**: `56px`
- **Line Height**: `24px`
- **Focus State**: Border Bottom `2px solid #FFFFFF`, background remains transparent
- **Placeholder Color**: `rgba(255, 255, 255, 0.5)`
- **Hover State**: Border Bottom `1px solid rgba(255, 255, 255, 0.8)`
- **Usage**: Email signup form, login form inputs

#### Language / Dropdown Select Input
- **Background**: `#FFFFFF`
- **Text Color**: `#000000`
- **Font**: sans-serif, 12.8px, weight 400
- **Padding**: `6px 35px 6px 15px`
- **Border Radius**: `50px` (fully rounded pill shape)
- **Border**: `1px solid #707070`
- **Height**: `32px`
- **Line Height**: normal
- **Focus State**: Border `1px solid #FFFFFF`, outline none
- **Hover State**: Border `1px solid #A9A9A9`
- **Usage**: Language selector, region picker, top-level navigation dropdowns

### Navigation

#### Top Navigation Bar
- **Background**: transparent (rgba(0, 0, 0, 0)) with optional semi-transparent dark overlay (rgba(0, 0, 0, 0.4)) on scroll
- **Height**: `64px` (typical Netflix header)
- **Padding**: `0px 100px` (left/right)
- **Display**: flex, align-items center, justify-content space-between
- **Position**: fixed or sticky
- **Z-Index**: `1000`
- **Usage**: Primary site header with logo, language selector, sign-in button

#### Navigation Link
- **Font**: sans-serif, 16px, weight 400
- **Text Color**: `#000000` (on light backgrounds) or `#FFFFFF` (on dark backgrounds)
- **Padding**: `8px 16px`
- **Border Radius**: `0px`
- **Border**: none
- **Background**: transparent
- **Hover State**: Text Color `#E50914` or underline `2px solid #E50914`
- **Active State**: Text Color `#E50914`, underline `2px solid #E50914`
- **Usage**: Main navigation items, breadcrumb navigation

### Badges & Tags (Inferred)

#### Status Badge
- **Background**: `#E50914`
- **Text Color**: `#FFFFFF`
- **Font**: sans-serif, 12px, weight 700
- **Padding**: `4px 12px`
- **Border Radius**: `4px`
- **Usage**: "New," trending indicators, episode counts (numbered overlays on cards)

## 5. Layout Principles

### Spacing System

**Base Unit**: `4px`

**Scale**:
- `4px`: Micro-spacing; icon padding, tight button groups
- `8px`: Extra-small; minor margins between adjacent elements
- `12px`: Small; spacing within compact components
- `16px`: Small-medium; input padding, card gaps, section dividers
- `20px`: Medium; consistent margin between elements
- `24px`: Medium-large; card padding, content blocks
- `28px`: Large; section spacers
- `32px`: Large; footer padding, major breaks
- `36px`: Extra-large; section separators
- `64px`: Huge; top/bottom page section padding
- `96px`: Massive; hero section padding (desktop)
- `100px`: Hero horizontal padding (desktop)

**Context**:
- **Micro interactions**: `4px` spacing for icon buttons, radio/checkbox groups
- **Component internals**: `8px–16px` for padding within cards, inputs, buttons
- **Section spacing**: `24px–64px` for vertical rhythm between major content blocks
- **Horizontal margins**: `100px` on desktop for maximum content width; scales down to `20px` on mobile

### Grid & Container

- **Max Width**: No hard max; full-bleed sections are common; content typically centers with `100px` left/right padding on desktop
- **Column Strategy**: 
  - Desktop: 5-column flexible grid for content cards (252px wide cards with `16px` gaps)
  - Tablet: 3–4 columns
  - Mobile: 1–2 columns (stacked)
- **Section Patterns**: Full-width background sections with centered content padding; alternating backgrounds (`#161616` and `#000000`) for visual variety
- **Container Alignment**: Center-aligned for text-heavy sections; grid-based for content discovery

### Whitespace Philosophy

Netflix prioritizes generous whitespace to avoid visual clutter and reduce cognitive load. Large padding around content sections creates breathing room; vertical rhythm is maintained through consistent `24px–64px` section margins. Card-based layouts naturally introduce whitespace through gaps. Text-heavy sections use line heights of `24px–70px` to prevent dense blocks. The philosophy emphasizes that empty space is not wasted; it directs user attention and improves scannability.

### Border Radius Scale

- `0px`: Full-width sections, input underlines, header bars (no rounding)
- `2px`: Subtle accent lines, tertiary link underlines (minimal rounding)
- `4px`: Primary button radius, status badges, compact UI elements
- `8px`: Card containers, secondary buttons, feature blocks (prominent but not extreme)
- `50px`: Language selector, fully rounded pill-shaped inputs (maximum rounding)

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| L0 (Flat) | No shadow; `box-shadow: none` | Primary backgrounds, sections, large containers |
| L1 (Raised) | `box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3)` | Hover state on secondary buttons, floating elements |
| L2 (Floating) | `box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5)` | Modals, dropdowns, expanded navigation |
| L3 (Modal Overlay) | `box-shadow: 0 16px 48px rgba(0, 0, 0, 0.6)` | Modal dialogs, stacked overlays, maximum emphasis |

Netflix uses minimal shadow elevation. Most UI elements are flat (`box-shadow: none`) or use subtle 2px shadows on hover. The design philosophy prioritizes color contrast and scale changes over shadow depth. Dark backgrounds naturally create visual separation; shadows would reduce contrast rather than enhance depth. Shadows are reserved for interactive hover states and modal dialogs where floating is necessary. Depth is primarily communicated through color gradation (dark → light gray) and scale, not shadow.

## 7. Do's and Don'ts

### Do
- **Use Netflix Sans for all primary content** (headings, body text, buttons). Falls back gracefully to system sans-serif.
- **Leverage the red (`#E50914`) sparingly** for maximum impact—reserve it for CTAs, errors, and brand moments.
- **Maintain dark backgrounds** (`#161616`, `#232323`) as the foundation; they reduce eye strain and make content imagery pop.
- **Prioritize white text on dark backgrounds** for WCAG AA contrast compliance (7:1+ ratio).
- **Use consistent `16px` gaps between card grids** and `24px–64px` between sections for visual rhythm.
- **Scale interactive elements on hover** (1.02x–1.03x) rather than relying solely on color changes.
- **Keep input fields minimal**: transparent backgrounds with underlines or rounded pill shapes (language selector only).
- **Group related actions horizontally** with `8px–12px` spacing; separate major action groups with `20px+` spacing.
- **Test all interactions for focus states** to ensure keyboard navigation is accessible; use outline: `2px solid #E50914` for focus rings.
- **Wrap long text in descriptive sections** at line-height 24px+ to maintain readability on dark backgrounds.

### Don't
- **Avoid overusing shadows**; the design is flat-first. Shadows dilute contrast on dark backgrounds.
- **Don't apply the red color to non-critical UI** (secondary navigation, disabled states). It loses emphasis when overused.
- **Avoid custom fonts outside Netflix Sans** for body copy; maintain consistency and performance.
- **Don't use mid-tone grays** (`#808080`, `#A9A9A9`) for primary interactive elements; reserve them for secondary labels and disabled states.
- **Don't create input fields with solid colored backgrounds** except for the language selector (which uses white on dark context).
- **Avoid rounded corners** beyond `8px` except for the language picker (`50px` pill shape).
- **Don't reduce font weight below 400**; Netflix favors bold, readable text.
- **Don't add borders to cards**; use background color contrast and shadows (sparingly) instead.
- **Don't apply transparency to text colors** except for secondary/tertiary links (`rgba(255, 255, 255, 0.7)`).
- **Avoid horizontal scrolling** on mobile; stack cards vertically and reduce grid columns instead.

## 8. Responsive Behavior

### Breakpoints

| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile | 320px–767px | 1–2 column grid, `20px` padding, font size reductions (body 18px), stacked layout for all sections |
| Tablet | 768px–1023px | 3–4 column grid, `48px` padding, section margin `32px`, preserved hierarchy |
| Desktop | 1024px–1919px | 5-column grid, `100px` padding, full spacing scale, hero sizes optimized |
| Large Desktop | 1920px+ | 5+ column grid, capped content width with centered container, increased padding percentages |

### Touch Targets

- **Minimum size**: `44px × 44px` (WCAG AAA recommendation)
- **Button height**: Primary buttons `56px` (desktop); `48px` (mobile)
- **Card touch area**: `252px × 252px` (desktop); `180px × 180px` (mobile) for content cards
- **Input fields**: `56px` height for text inputs (accommodates finger input comfortably)
- **Icon buttons**: `40px × 40px` minimum for navigation icons, info buttons
- **Link padding**: `8px` around text links to increase tap area
- **Spacing between touch targets**: Minimum `8px` gap to prevent accidental triggers

### Collapsing Strategy

- **Header**: Navigation items collapse into hamburger menu (`24px × 24px` icon) below `1024px`
- **Content cards**: 5-column grid → 4-column (tablet) → 2-column (mobile portrait) → 1-column (small mobile)
- **Section padding**: `100px` (desktop) → `48px` (tablet) → `20px` (mobile)
- **Typography**: H1 `56px` → `40px` (tablet) → `28px` (mobile); body `20px` → `18px` (mobile)
- **Hero section**: Full viewport height (desktop) → 70% height (tablet) → 50% height (mobile) with text overlays repositioned
- **Feature blocks** ("More Reasons to Join"): 4 columns → 2 columns (tablet) → 1 column (mobile)
- **FAQ section**: 1-column layout on all sizes; card width adjusts to container

## 9. Agent Prompt Guide

### Quick Color Reference
- **Primary CTA**: Netflix Red (`#E50914`)
- **Background**: Deep Black (`#161616`) or Near Black (`#232323`)
- **Heading text**: White (`#FFFFFF`)
- **Body text**: White (`#FFFFFF`)
- **Secondary text**: Light Gray (`#A9A9A9`)
- **Secondary button**: Charcoal (`#232323`)
- **Error state**: Netflix Red (`#E50914`)
- **Input underline**: White (`#FFFFFF`)
- **Language selector background**: White (`#FFFFFF`)
- **Language selector text**: Black (`#000000`)

### Iteration Guide

1. **Start with dark backgrounds**: All page sections default to `#161616` or `#232323`; use deep black (`#000000`) only for hero overlays or premium moments.

2. **Apply Netflix Sans for typography**: Headlines, body, buttons use Netflix Sans; fall back to system sans-serif for compact UI labels and selects.

3. **Reserve red (`#E50914`) for critical CTAs only**: Sign-in, "Get Started," error states, validation failures; not for secondary navigation or disabled states.

4. **Use white text** (`#FFFFFF`) for all primary content on dark backgrounds; accessibility contrast must be ≥7:1.

5. **Build spacing with multiples of `4px`**: Section padding `64px–100px`, card gaps `16px`, button padding `12px–24px`, input padding `16px–24px`.

6. **Implement cards with `8px` border-radius** and transparent shadows (`none` on flat state; subtle `0 2px 8px rgba(0, 0, 0, 0.3)` on hover).

7. **Scale interactive elements on hover** (`transform: scale(1.03)`) instead of heavy shadow depth; reduces visual clutter.

8. **Make input fields minimal**: Transparent backgrounds with white underlines (`border-bottom: 1px solid #FFFFFF`); exception is language selector (white background with `50px` border-radius).

9. **Test responsive breakpoints**: 5-column grid (desktop) → 4-column (tablet `768px+`) → 2-column (mobile `520px+`) → 1-column (small mobile `<320px`).

10. **Ensure keyboard accessibility**: All interactive elements must have `:focus` state with `outline: 2px solid #E50914`; visible focus ring is non-negotiable.