````markdown
# Design System Document: The Ethereal Event System

## 1. Overview & Creative North Star

**The Creative North Star: "The Digital Keepsake"**

This design system is crafted to transform a functional SaaS into an emotional experience. Moving away from the rigid, utilitarian layouts of traditional photo-sharing apps, we embrace an **Editorial Glassmorphism** aesthetic. Our goal is to make every event feel like a curated gallery and every interaction feel like a soft tactile touch.

To break the "template" look, we prioritize **intentional asymmetry** and **tonal depth**. We don't just "place" content on a grid; we suspend it in a multi-layered, dark-mode environment where depth is communicated through light and blur rather than lines and boxes. It is inspired by the precision of Linear and the warmth of Luma, designed exclusively for a high-end dark-mode experience.

---

## 2. Colors & Surface Philosophy

Our palette is rooted in a deep, midnight foundation, punctuated by a singular, high-energy violet.

### Color Tokens (Material Design Mapping)

- **Background:** `#0e0e13` (The Foundation)
- **Primary (Electric Violet):** `#bd9dff` (Accent/Action)
- **Primary Dim:** `#8a4cfc` (Pressed/Active)
- **Surface Container (Low/Mid/High):** `#131318` / `#19191f` / `#1f1f26`
- **On-Surface (Text):** `#f8f5fd` (High Contrast)
- **On-Surface Variant (Secondary Text):** `#acaab1` (Muted)

### The "No-Line" Rule

**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning or layout containment. Traditional "dividers" are an artifact of the past.

- **Boundary Definition:** Separate sections only through background color shifts (e.g., a `surface-container-high` card sitting on a `surface-container-low` section).
- **Tonal Transitions:** Use the 8px grid to create generous breathing room, allowing negative space to act as the primary separator.

### The Glass & Gradient Rule

To achieve a "Signature" feel, we treat the UI as a series of physical layers:

- **Glassmorphism:** All floating overlays (modals, dropdowns, navigation bars) must use a semi-transparent `surface-container` color with a `backdrop-filter: blur(20px)`. This allows the vibrant hues of shared photos to "bleed" into the UI, making the system feel integrated with the content.
- **Signature Textures:** Use a subtle linear gradient (from `primary` to `primary-container`) for main CTAs. This provides a "soul" and professional polish that flat fills cannot achieve.

---

## 3. Typography: Editorial Authority

We use a dual-font strategy to balance geometric precision with human warmth.

- **Display & Headlines (Plus Jakarta Sans):** Used for "The Big Moments"—event titles and high-level marketing headers. The generous x-height and geometric curves feel modern and trustworthy.
  - _Scale:_ `display-lg` (3.5rem) to `headline-sm` (1.5rem).
- **Body & Labels (Inter):** Used for functional reading and metadata. Inter provides maximum legibility at small scales against dark backgrounds.
  - _Scale:_ `body-lg` (1rem) to `label-sm` (0.6875rem).

**Editorial Hint:** Use wide letter-spacing (tracking) on `label-sm` elements and transform them to uppercase to create a "premium metadata" look often found in luxury fashion or high-end architectural journals.

---

## 4. Elevation & Depth: Tonal Layering

Traditional drop shadows are too "heavy" for this system. We achieve lift through **Tonal Layering** and **Ambient Light**.

### The Layering Principle

Hierarchy is achieved by "stacking" surface tiers.

1.  **Level 0 (Base):** `surface` (`#0e0e13`)
2.  **Level 1 (Sections):** `surface-container-low` (`#131318`)
3.  **Level 2 (Cards):** `surface-container` (`#19191f`)
4.  **Level 3 (Interactive Elements):** `surface-container-high` (`#1f1f26`)

### Ambient Shadows & Ghost Borders

- **Ambient Shadows:** When a card needs to "float" (e.g., an event preview), use a shadow with a 32px to 48px blur at only 4% opacity. The shadow color must be tinted with the `primary` hue to mimic light refraction.
- **The Ghost Border:** If accessibility requires a stroke, use the `outline-variant` token at **10% opacity**. It should be barely felt, not seen. This creates a "soft Neumorphic" edge that catches light rather than boxing in content.

---

## 5. Signature Components

### Cards (The "Keepsake" Container)

- **Style:** `rounded-2xl` (1.5rem).
- **Treatment:** Background should be a subtle gradient or a glass-morphed surface. Never use dividers inside a card; use 16px or 24px of vertical space to separate the header from the image.
- **Interaction:** On hover, a card should shift from `surface-container` to `surface-container-highest` with a subtle 2px vertical lift.

### Buttons (The "Electric" Touch)

- **Primary:** `rounded-xl` with a gradient fill (`primary` to `primary-dim`). No border.
- **Secondary (Glass):** `backdrop-filter: blur(10px)`, `surface-container-high` at 40% opacity, with a "Ghost Border."
- **Sizing:** Generous padding. A standard button should be 48px high to feel substantial and "premium."

### Input Fields

- **Style:** `surface-container-lowest` (pure black) with a `rounded-lg` corner.
- **Focus State:** The "Ghost Border" becomes `primary` at 40% opacity, and a soft primary glow (ambient shadow) appears behind the field.

### Event Chips

- **Style:** Small, `rounded-full` pills using `surface-container-high`. Text should be `label-md` in `on-surface-variant`.

---

## 6. Do’s and Don’ts

### Do

- **DO** use "Breathing Room." If you think there’s enough margin, add 8px more. Space is a luxury.
- **DO** overlap elements. Let an image card slightly overlap a text header to create a sense of three-dimensional space.
- **DO** use `Electric Violet` sparingly. It is a high-energy laser; too much of it ruins the "Soft" vibe.

### Don’t

- **DON'T** use pure white (`#FFFFFF`) for text. Use `on-surface` (`#f8f5fd`) to prevent eye strain and "blooming" on dark backgrounds.
- **DON'T** use 90-degree corners. Everything must feel soft to the touch (minimum `rounded-md`).
- **DON'T** use traditional list dividers. If you must separate list items, use a 1px gap that reveals the `surface-container-lowest` color behind it.

---

## Director’s Closing Note

This system is not about "utility"—it’s about **atmosphere**. When building layouts, ask yourself: _"Does this feel like a generic dashboard, or does it feel like a high-end physical gallery?"_ If it feels like a dashboard, remove a border, increase your blur, and add more space.```
````
