---
name: slush-design-system
description: >-
  Official design system and implementation rules for Slush: "Inflatable sticker universe on pastel paper".
  Enforces crushed Lateral 800 display headlines, 6-color sticker palette, hand-cut 1px solid black outlines,
  1600px pill controls, 20-40px soft card surfaces, and alternating pastel section bands (#dceeff, #ffffff, #cccccc).
  Prohibits box-shadows, gradients, blue CTAs, and semantic green states.
  Activate this skill whenever building or styling UI pages, components, buttons, stickers, or marketing sections for Slush.
---

# Slush Design System: Inflatable Sticker Universe on Pastel Paper

> **Design Theme**: Light, Physical Sticker-Book Collage on Pale Canvas  
> **Aesthetic Core**: Massive crushed display typography (Lateral 800), electric blue 3D inflatable ribbons, vivid multi-color sticker accents, 1px solid `#000000` hand-cut outlines, ultra-soft rounded corners (1600px pills / 20–40px cards), and alternating pastel section grounds.  
> **Key Mantra**: *"Reads less like a fintech landing page and more like a physical collage pinned to a pale wall."*

---

## 1. Design Tokens Reference

### 1.1. Color Tokens (`@theme` & CSS Variables)
All surfaces use solid flat fills. Gradients are **strictly prohibited**.

| Token Name | Hex Code | Role in UI | Hard Rules |
| :--- | :--- | :--- | :--- |
| `carbon` (`--color-carbon`) | `#000000` | Text, 1px borders, filled CTA background, logo mark. | Creates hand-cut sticker outlines against pastel grounds. |
| `paper-white` (`--color-paper-white`) | `#ffffff` | Page canvas, card surfaces, ghost button fills, text on dark fills. | Primary clean ground for cards & pills. |
| `sky-wash` (`--color-sky-wash`) | `#dceeff` | Hero & primary section background. | Pale blue pastel ground. |
| `concrete-gray` (`--color-concrete-gray`) | `#cccccc` | Secondary section background. | Neutral interlude ground band. |
| `soft-mist` (`--color-soft-mist`) | `#e9e9e9` | Subtle button and surface tints, disabled states. | Secondary neutral tint. |
| `electric-blue` (`--color-electric-blue`) | `#4da2ff` | 3D ribbon sculptures, body backgrounds, card washes. | **NEVER** use as CTA or button fill. Purely brand/decorative surface! |
| `mint-pop` (`--color-mint-pop`) | `#55db9c` | Green sticker accent, decorative checkmarks. | **NEVER** use as semantic "success" color. It is a sticker accent. |
| `lavender` (`--color-lavender`) | `#e9ccff` | Soft accent wash for cards, tags, sticker fills. | The gentlest color in the palette. |
| `ember` (`--color-ember`) | `#fb4903` | Hot sticker accent (rocket, badge fills). | Warmest hit in the palette. |
| `sunburst` (`--color-sunburst`) | `#ffd731` | Coin sticker fills, yellow sticker decorations. | **NEVER** use for text backgrounds (contrast violation). |
| `voltage-violet` (`--color-voltage-violet`) | `#5c4ade` | Deep accent (wallet stickers, QR download card, secondary CTAs). | Anchor purple in sticker set. |

### 1.2. Typography System
Pairing anti-conventional crushed display headlines with clean modern sans-serif UI type.

#### Lateral (Display Headlines Only)
* **Font Family**: `'Lateral', 'Druk', 'Bowlby One', 'Antonio', sans-serif` (`font-lateral`)
* **Weight**: `800`
* **Sizes**: `70px`, `110px`, `160px`, `200px`, `281px`, `640px` (use arbitrary Tailwind values `text-[200px]` or `--text-display`)
* **Line Height**: **`0.75`–`0.80`** (**NON-NEGOTIABLE**). The crushed leading makes words behave as monolithic sculptural blocks wrapping behind 3D ribbons.
* **Letter Spacing**: Normal.

#### Aeonik Pro (All UI, Body, Nav, Buttons, Subheads)
* **Font Family**: `'Aeonik Pro', 'Inter', 'Satoshi', 'General Sans', sans-serif` (`font-aeonik`)
* **Weights**: `500` (Body, metadata), `700` (Subheads, nav labels, buttons)
* **Sizes & Scale**:
  * `caption`: 12px (leading 1.56, tracking -0.01em)
  * `body-lg`: 15px (leading 1.39, tracking -0.01em)
  * `subheading`: 24px (leading 1.2, tracking -0.01em)
  * `heading-sm`: 30px (leading 1.1, tracking -0.01em)
  * `heading`: 64px (leading 1.0, tracking -0.01em)
* **Letter Spacing Rules**:
  * Body text: `-0.010em` (tight)
  * Nav & Button labels: `+0.030em` to `+0.032em` (open, giving pill controls breathing room).

### 1.3. Border Radius & Shape Architecture
Extreme softness is the system default. Sharp corners break the sticker-book illusion:

| Element | Radius | Tailwind Class |
| :--- | :--- | :--- |
| Nav bar container & links | `1600px` | `rounded-nav` / `rounded-full` |
| Buttons & Pills | `1600px` | `rounded-buttons` / `rounded-pills` |
| Standard Cards | `20px` | `rounded-cards` / `rounded-[20px]` |
| Elevated / Focal Cards | `40px` | `rounded-cards-elevated` / `rounded-[40px]` |
| Section Body Wrappers | `30px` | `rounded-body` / `rounded-[30px]` |
| Wallet / Sticker Icons | `16px` | `rounded-wallet-icon` / `rounded-[16px]` |

### 1.4. Spacing & Layout Rhythm
* **Base Unit**: `4px`
* **Section Gap**: `48px`
* **Card Internal Padding**: `24px`
* **Page Max-Width**: `1440px` (Never constrain below `1280px` — display type and 3D ribbons require wide horizontal room).
* **Section Rhythm**: Three alternating full-bleed horizontal bands:
  1. `bg-sky-wash` (`#dceeff`) - Hero Section
  2. `bg-paper-white` (`#ffffff`) - Content Section
  3. `bg-concrete-gray` (`#cccccc`) - Secondary / Feature Section

---

## 2. Strict Do's and Don'ts (Hard System Rules)

### DO
1. **Always use 1px solid `#000000` outlines** (`border border-carbon`) on all cards, buttons, nav pills, QR blocks, and floating stickers. This creates the signature hand-cut physical sticker outline.
2. **Crushed Leading on Headlines**: Keep `line-height` strictly between `0.75` and `0.80` on `font-lateral` 800 display text.
3. **Multi-Color Shared Rainbow**: Treat the six colors (`electric-blue`, `mint-pop`, `lavender`, `ember`, `sunburst`, `voltage-violet`) as a collaborative sticker set. Scatter multiple colors across every screen; never restrict UI to a single accent.
4. **Pill Shapes Everywhere**: Nav items, action buttons, filter tags must use `rounded-[1600px]` (`rounded-full`).
5. **Pair Display Headlines with 3D Ribbons or Stickers**: Display text must never sit alone on a blank background. Always overlay/underlay with a 3D blue ribbon graphic or overlapping rotated stickers.
6. **Open Letter Spacing on Controls**: Add `tracking-[0.032em]` on button and nav labels.

### DON'T (Violations break the Slush aesthetic)
1. ❌ **NO Box Shadows**: Elevation is communicated solely through color bands and 1px black outlines. Never add `shadow-*`.
2. ❌ **NO Gradients**: All surfaces (cards, buttons, backgrounds, stickers) must be flat solid colors. Only the 3D ribbon renders carry dimensional lighting.
3. ❌ **NO Electric Blue (#4da2ff) CTAs**: Blue is a brand/sculptural surface color, **not** an action color. CTAs must be either solid `#000000` (Carbon) or outlined `#ffffff` (Paper White).
4. ❌ **NO Semantic Green**: `#55db9c` (Mint Pop) is a decorative sticker color, not a success/error state.
5. ❌ **NO Sharp Corners**: Any border-radius below `16px` for cards or below `1600px` for buttons is strictly banned.
6. ❌ **NO Kinetic Overkill**: Only the marquee banner scrolls continuously. Stickers and ribbons remain static collage items with gentle button tap/hover feedback.

---

## 3. Core Component Blueprints

### 3.1. Navigation & Header
```tsx
import Link from "next/link";

export function SlushNav() {
  return (
    <header className="sticky top-4 z-50 flex items-center justify-between max-w-[1440px] mx-auto px-6">
      {/* Circular Logo Mark */}
      <div className="flex h-11 w-11 items-center justify-center rounded-full border border-carbon bg-paper-white font-lateral text-xl font-extrabold text-carbon">
        S
      </div>

      {/* Pill Nav Bar */}
      <nav className="flex items-center gap-1 rounded-full border border-carbon bg-paper-white p-1">
        {["Home", "Ecosystem", "Docs", "Community"].map((link) => (
          <Link
            key={link}
            href="#"
            className="rounded-full px-4 py-2 text-[13px] font-bold tracking-[0.032em] text-carbon transition-colors hover:bg-soft-mist"
          >
            {link}
          </Link>
        ))}
      </nav>

      {/* Primary Action Button */}
      <button className="rounded-full border border-carbon bg-carbon px-5 py-2.5 text-[13px] font-bold tracking-[0.032em] text-paper-white transition-transform hover:scale-105 active:scale-95">
        Launch App
      </button>
    </header>
  );
}
```

### 3.2. Marquee Announcement Strip
```tsx
export function SlushMarquee({ text = "ALL THINGS SUI • DOWNLOAD SLUSH NOW • THE STICKER UNIVERSE •" }: { text?: string }) {
  return (
    <div className="w-full overflow-hidden border-y border-carbon bg-carbon py-2 text-paper-white select-none">
      <div className="flex w-max animate-marquee">
        <span className="text-[12px] font-bold uppercase tracking-[0.032em] whitespace-nowrap px-4">
          {text.repeat(8)}
        </span>
      </div>
    </div>
  );
}
```

### 3.3. Hero Section with Crushed Display & Asymmetric Stickers
```tsx
import Image from "next/image";

export function SlushHero() {
  return (
    <section className="relative min-h-[90vh] w-full bg-sky-wash px-6 pt-20 pb-32 overflow-hidden flex flex-col items-center text-center">
      {/* Floating 2D Stickers (Asymmetrically Positioned & Rotated) */}
      <div className="absolute top-28 left-[10%] -rotate-12 rounded-[20px] border border-carbon bg-ember p-3 text-paper-white text-2xl select-none">
        🚀
      </div>
      <div className="absolute top-40 right-[12%] rotate-12 rounded-[20px] border border-carbon bg-sunburst p-3 text-carbon text-2xl select-none">
        🪙
      </div>
      <div className="absolute bottom-32 left-[15%] rotate-6 rounded-[16px] border border-carbon bg-voltage-violet p-3 text-paper-white text-2xl select-none">
        👛
      </div>
      <div className="absolute bottom-28 right-[18%] -rotate-6 rounded-[20px] border border-carbon bg-mint-pop p-3 text-carbon text-2xl select-none">
        ✓
      </div>

      {/* Crushed Sculptural Display Headline (Lateral 800) */}
      <h1 className="relative z-10 font-lateral text-[clamp(90px,18vw,240px)] font-extrabold uppercase leading-[0.78] tracking-normal text-carbon select-none">
        SLUSH
      </h1>

      {/* Tagline directly under display block */}
      <p className="mt-8 max-w-2xl font-aeonik text-[20px] sm:text-[24px] font-medium leading-[1.2] tracking-[-0.01em] text-carbon">
        Inflatable sticker universe on pastel paper. Designed for fearless explorers of all things Sui.
      </p>

      {/* Action Buttons: Outlined Ghost Buttons */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <button className="rounded-full border border-carbon bg-carbon px-6 py-3 text-[14px] font-bold tracking-[0.032em] text-paper-white transition-transform hover:scale-105 active:scale-95">
          Launch Web App
        </button>
        <button className="rounded-full border border-carbon bg-paper-white px-6 py-3 text-[14px] font-bold tracking-[0.032em] text-carbon transition-transform hover:bg-soft-mist active:scale-95">
          Download for Chrome
        </button>
      </div>
    </section>
  );
}
```

### 3.4. Split QR Download Card
```tsx
import { QrCode } from "lucide-react";

export function SlushQRCard() {
  return (
    <div className="flex w-full max-w-[340px] items-stretch rounded-[20px] border border-carbon bg-voltage-violet overflow-hidden">
      {/* Left QR Square (Paper White) */}
      <div className="flex items-center justify-center bg-paper-white p-4 border-r border-carbon">
        <QrCode className="h-16 w-16 text-carbon" />
      </div>

      {/* Right Label (Voltage Violet) */}
      <div className="flex flex-1 flex-col justify-center px-5 py-4 text-paper-white">
        <span className="text-[11px] font-bold uppercase tracking-[0.032em] opacity-80">Mobile App</span>
        <span className="text-[16px] font-bold tracking-[0.032em]">DOWNLOAD</span>
      </div>
    </div>
  );
}
```

---

## 4. Agent Checklist Before Outputting Slush UI Code

- [ ] **1px Black Outlines**: Are all cards, buttons, nav, and stickers outlined in `1px solid #000000` (`border border-carbon`)?
- [ ] **No Shadows**: Have all `shadow-*` utility classes been completely eliminated?
- [ ] **No Gradients**: Are all surfaces flat solid colors from the token set?
- [ ] **Crushed Display Leading**: Is `leading-[0.75]` to `leading-[0.80]` applied to all `font-lateral` display headlines?
- [ ] **Pills & Soft Radii**: Are buttons set to `rounded-full` (`1600px`) and cards set to `rounded-[20px]` or `rounded-[40px]`?
- [ ] **No Blue CTA**: Is `#4da2ff` (Electric Blue) used **only** for surfaces/ribbons, and **never** as a CTA fill?
- [ ] **Section Rhythm**: Do sections alternate between `bg-sky-wash`, `bg-paper-white`, and `bg-concrete-gray`?
