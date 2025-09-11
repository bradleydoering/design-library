# CloudReno Unified Design Spec (v1.0)

> **Purpose**: One source of truth so **all apps (Next.js or Vite/React)** render identically. Copy this spec into a `design-spec.md` and mirror the file structure and tokens below in each repo.

---

## 0) Compatibility & File Map

- Works with **Next.js** (via `next/font`) **and** **Vite/React** (via CSS `@import`).
- Standardize the following shared files (identical content across apps):

```
src/styles/
  base.css              // CSS variables (HSL + brand), fonts, resets
  components.css        // buttons, CTA utilities
  layout.css            // container, glass, hero spacing
  grid-patterns.css     // dotted and blueprint overlays
  navigation.css        // sticky nav behavior & mobile sticky CTA
  utilities.css         // focus ring, responsive text, safe-area, inputs
  animations.css        // floating, accordion, gradient-slide, puff, dot-*

tailwind.config.ts      // tokens and shadcn theme glue
src/components/ui/button.tsx   // shadcn Button variants (clipped corners)
```

> **Rule**: If you add a new utility/animation, add it to this spec + the shared files in all apps.

---

## 1) Brand Assets (canonical URLs)

- **Navbar/Primary Logo (PNG)**\
  `https://img.cloudrenovation.ca/Cloud%20Renovation%20logos/Cloud_Renovation_Logo-removebg-preview.png`
- **Favicon/OG/Twitter**\
  `https://img.cloudrenovation.ca/Cloud%20Renovation%20logos/Cloud%20Logo.png`
- **Horizontal logo** (optional path standard): `/logo-hr.png`
- **SVG logo** (optional path standard): `/logo.svg`
- **Email logo (JPG)**\
  `https://img.cloudrenovation.ca/Cloud%20Renovation%20logos/Cloud%20Renovation%20Logo.jpg`

> If `/logo-hr.png` or `/logo.svg` aren’t hosted in an app, either add them or remove their references there.

---

## 2) Typography

### 2.1 Families & weights

- **Headings:** Space Grotesk — 400, 500, 600, 700
- **Body:** Inter — 400, 500, 600
- **Mono:** JetBrains Mono — 400, 500

### 2.2 Loading

**Next.js (**``**):**

```ts
// src/lib/fonts.ts
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";

export const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["400", "500", "600", "700"],
});

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600"],
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  weight: ["400", "500"],
});
```

```tsx
// app/layout.tsx
import { spaceGrotesk, inter, jetbrainsMono } from "@/lib/fonts";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-inter">{children}</body>
    </html>
  );
}
```

**Vite/React (CSS import):**

```css
/* src/styles/base.css (top of file) */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@400;500;600;700&display=swap');

:root {
  --font-space-grotesk: "Space Grotesk";
  --font-inter: "Inter";
  --font-jetbrains-mono: "JetBrains Mono";
}
```

### 2.3 Type scale & classes

```css
/* src/styles/base.css (excerpt) */
h1 { font-family: var(--font-space-grotesk); font-weight: 600; font-size: 2.5rem; line-height: 1.1; letter-spacing: -0.01em; }
h2 { font-family: var(--font-space-grotesk); font-weight: 600; font-size: 2rem;   line-height: 1.1; letter-spacing: -0.01em; }
h3 { font-family: var(--font-space-grotesk); font-weight: 500; font-size: 1.5rem; line-height: 1.1; letter-spacing: -0.01em; }

body, p { font-family: var(--font-inter); font-weight: 400; font-size: 1rem; line-height: 1.5; }
.caption { font-family: var(--font-inter); font-weight: 500; font-size: 0.875rem; }

/* utility font classes for Tailwind mapping */
.font-space { font-family: var(--font-space-grotesk), ui-sans-serif, system-ui, sans-serif; }
.font-inter { font-family: var(--font-inter), ui-sans-serif, system-ui, sans-serif; }
.font-mono  { font-family: var(--font-jetbrains-mono), ui-monospace, SFMono-Regular, Menlo, monospace; }
```

---

## 3) Tokens — Semantic HSL + Brand Palette

> Apps should consume **semantic tokens** for UI and **brand palette** for decorative elements.

```css
/* src/styles/base.css */
:root {
  /* Semantic (HSL values only) */
  --background: 220 33% 98%;
  --foreground: 222 47% 9%;

  --card: 0 0% 100%;
  --card-foreground: 222 47% 9%;

  --popover: 0 0% 100%;
  --popover-foreground: 222 47% 9%;

  --primary: 14 100% 62%;          /* Coral */
  --primary-foreground: 0 0% 100%;

  --secondary: 220 23% 97%;
  --secondary-foreground: 222 47% 9%;

  --muted: 220 23% 97%;
  --muted-foreground: 216 16% 47%;

  --accent: 220 23% 97%;
  --accent-foreground: 222 47% 9%;

  --destructive: 0 84% 60%;
  --destructive-foreground: 210 40% 98%;

  --border: 216 32% 91%;
  --input: 216 32% 91%;
  --ring: 222 47% 9%;

  --radius: 0rem; /* squared by default (clip-path handles corners) */

  /* Brand (HEX for convenience) */
  --coral: #FF693E;        /* Primary brand */
  --coral-light: #FF7348;  /* Light */
  --coral-dark: #FF5C39;   /* Dark */
  --navy: #0E1220;         /* Primary text/dark */
  --offwhite: #F3F6F9;     /* Background */
  --cloudwhite: #FFFFFF;   /* Pure white */
  --blueprintgrey: rgba(45,51,64,0.08);
}

/* Derivative gradients */
:root {
  --gradient-coral: linear-gradient(140deg, #FF5C39 0%, #FF693E 50%, #FF7348 100%);
  --gradient-coral-horizontal: linear-gradient(90deg, #FF5C39 0%, #FF7348 100%);
}
```

### Tailwind config tokens

```ts
// tailwind.config.ts
import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx,mdx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        /* semantic (consume via hsl(var(--token))) */
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        popover: "hsl(var(--popover))",
        "popover-foreground": "hsl(var(--popover-foreground))",
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        secondary: "hsl(var(--secondary))",
        "secondary-foreground": "hsl(var(--secondary-foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        accent: "hsl(var(--accent))",
        "accent-foreground": "hsl(var(--accent-foreground))",
        destructive: "hsl(var(--destructive))",
        "destructive-foreground": "hsl(var(--destructive-foreground))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",

        /* brand palette */
        coral: { DEFAULT: "#FF693E", light: "#FF7348", dark: "#FF5C39" },
        navy: "#0E1220",
        offwhite: "#F3F6F9",
        cloudwhite: "#FFFFFF",
        blueprintgrey: "rgba(45,51,64,0.08)",
      },
      backgroundImage: {
        "coral-gradient": "var(--gradient-coral)",
        "coral-gradient-horizontal": "var(--gradient-coral-horizontal)",
      },
      boxShadow: {
        glass: "0 4px 30px rgba(0,0,0,0.1)",
      },
      backdropBlur: {
        glass: "16px",
      },
      container: {
        center: true,
        padding: "2rem",
        screens: {
          "2xl": "1120px", // unified container max width
        },
      },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
        "gradient-slide": { from: { backgroundPosition: "left" }, to: { backgroundPosition: "right" } },
        puff: { from: { transform: "scale(0.96)", opacity: "0" }, to: { transform: "scale(1)", opacity: "1" } },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "gradient-slide": "gradient-slide 300ms linear both",
        puff: "puff 240ms ease-out both",
      },
      fontFamily: {
        sans: ["var(--font-inter)", ...fontFamily.sans],
        inter: ["var(--font-inter)", ...fontFamily.sans],
        space: ["var(--font-space-grotesk)", ...fontFamily.sans],
        mono: ["var(--font-jetbrains-mono)", ...fontFamily.mono],
      },
    },
  },
  plugins: [],
} satisfies Config;
```

---

## 4) Global Base Styles

```css
/* src/styles/base.css */
:root { scroll-behavior: smooth; }

body {
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

---

## 5) Layout System

```css
/* src/styles/layout.css */
.container-custom { max-width: 1120px; margin-left: auto; margin-right: auto; padding-left: 1rem; padding-right: 1rem; }
@media (min-width: 640px) { .container-custom { padding-left: 1.5rem; padding-right: 1.5rem; } }

.section-padding { padding-top: 2rem; padding-bottom: 2rem; }
@media (min-width: 640px) { .section-padding { padding-top: 3rem; padding-bottom: 3rem; } }
@media (min-width: 768px) { .section-padding { padding-top: 4rem; padding-bottom: 4rem; } }

.hero-section { padding-top: 7rem; padding-bottom: 3rem; }
@media (min-width: 768px) { .hero-section { padding-top: 9rem; padding-bottom: 4rem; } }
@media (min-width: 1024px) { .hero-section { padding-bottom: 6rem; } }

/* Glass surfaces */
.glass { background: rgba(255,255,255,0.15); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.25); box-shadow: 0 4px 30px rgba(0,0,0,0.1); }

/* Navy section overlay */
.bg-navy { position: relative; background-color: var(--navy); color: var(--cloudwhite); }
.bg-navy::after { content: ""; position: absolute; inset: 0; pointer-events: none; background-image: url('/path/to/8pt-blueprint-grid.png'); opacity: 0.20; }
```

> Replace `'/path/to/8pt-blueprint-grid.png'` with your hosted grid asset (R2 URL recommended).

---

## 6) Background Patterns

```css
/* src/styles/grid-patterns.css */
.dotted-pattern {
  background-image: radial-gradient(circle, #333333 1.15px, transparent 1.15px);
  background-size: 20px 20px; opacity: 0.10;
}

/* By default, apply the dotted pattern on light sections (except hero) */
.section-default { background-color: var(--offwhite); }
.section-default::before { content: ""; position: absolute; inset: 0; background: radial-gradient(circle, #333333 1.15px, transparent 1.15px); background-size: 20px 20px; opacity: .10; pointer-events: none; }
```

---

## 7) Navigation & Sticky Behavior

```css
/* src/styles/navigation.css */
.navbar { position: fixed; top: 0; left: 0; right: 0; z-index: 50; transition: background-color .3s ease, box-shadow .3s ease, border-color .3s ease; }
.navbar--glass { background: rgba(255,255,255,.50); backdrop-filter: blur(16px); border-bottom: 1px solid rgba(255,255,255,.25); }
.navbar--solid { background: #fff; box-shadow: 0 1px 2px rgba(0,0,0,0.06); }

/* Example: toggle after scrollY > 100 */
```

```ts
// minimal toggle (framework-agnostic)
function onScroll() {
  const nav = document.querySelector('.navbar');
  if (!nav) return;
  if (window.scrollY > 100) { nav.classList.add('navbar--solid'); nav.classList.remove('navbar--glass'); }
  else { nav.classList.add('navbar--glass'); nav.classList.remove('navbar--solid'); }
}
window.addEventListener('scroll', onScroll); onScroll();
```

**Navbar contents**

- Container: `.container-custom py-3 md:py-4`
- Logo heights: `h-8 md:h-14`
- Desktop links: `hidden md:flex space-x-6`
- Mobile right: `md:hidden flex items-center space-x-2`

**Desktop “Services” dropdown snippets**

```html
<!-- trigger -->
<a class="text-navy hover:text-coral transition bg-transparent hover:bg-transparent data-[state=open]:text-coral">Services</a>

<!-- content panel -->
<div class="z-50 bg-white border shadow-lg rounded-md">
  <ul class="grid gap-3 p-5 md:w-[420px] lg:w-[520px] lg:grid-cols-2">
    <!-- left feature card -->
    <a class="flex flex-col justify-end rounded-none bg-coral-gradient p-5 text-white [clip-path:polygon(0.6rem_0%,100%_0%,100%_calc(100%-0.6rem),calc(100%-0.6rem)_100%,0%_100%,0%_0.6rem)]">
      ...
    </a>
    <!-- right list items ... -->
  </ul>
</div>
```

**Login hover (desktop/mobile)**

```html
<button class="rounded-xl text-navy hover:text-coral hover:bg-coral/10 transition-colors">Log in</button>
```

**Mobile sticky CTA bar (optional)**

```css
.mobile-book-bar { position: fixed; bottom: 0; left: 0; right: 0; z-index: 999; background: #0E1220; padding: 12px 16px; display: flex; justify-content: center; }
.mobile-book-bar a { background: var(--gradient-coral-horizontal); color: #fff; font-family: var(--font-space-grotesk); font-weight: 600; padding: 12px 24px; border-radius: 40px; display: inline-block; text-align: center; width: 100%; max-width: 560px; }
```

---

## 8) Buttons (shadcn + utilities)

### 8.1 shadcn base (clipped corners)

```ts
// src/components/ui/button.tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> { asChild?: boolean }

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
```

### 8.2 CTA utility

```css
/* src/styles/components.css */
.btn-coral { background: var(--gradient-coral-horizontal); color: #fff; font-weight: 500; padding: 12px 24px; }
/* Animated sweep when desired */
.btn-coral-animated { background-size: 200% 100%; background-position: left; animation: gradient-slide 300ms linear both; }
```

**Usage**

```tsx
import { Button } from "@/components/ui/button";

<Button className="btn-coral">Get started</Button>
```

> **Note**: Avoid `!important` in utilities so shadcn variants continue to work.

---

## 9) Inputs & UI Utilities

```css
/* src/styles/utilities.css */
/* Focus ring */
:root { --focus-ring-color: #FF5C39; }
.focus-ring { outline: 2px solid var(--focus-ring-color); outline-offset: 2px; }

/* Digit inputs */
.digit-input { font-family: var(--font-jetbrains-mono); font-weight: 500; background: rgba(14,18,32,0.10); padding: 0.5rem 0.75rem; }

/* Icon square */
.square-container { display: inline-flex; align-items: center; justify-content: center; background: var(--coral); color: #fff; padding: 0.75rem; }

/* Mobile touch targets */
@media (max-width: 767px) { button, a, input, select, textarea { min-height: 44px; } input, select, textarea { font-size: 16px; } }

/* Responsive text helpers */
.text-responsive { font-size: clamp(1rem, 1vw + 0.8rem, 1.125rem); }
.heading-responsive { font-size: clamp(2rem, 5vw + 1rem, 2.5rem); }

/* Safe area */
.pt-safe { padding-top: env(safe-area-inset-top); }
.pb-safe { padding-bottom: env(safe-area-inset-bottom); }
```

---

## 10) Animations

```css
/* src/styles/animations.css */
@keyframes floating {
  0%   { transform: translate(-50%, -50%) translate(0px, 0px) }
  50%  { transform: translate(-50%, -50%) translate(20px, 20px) }
  100% { transform: translate(-50%, -50%) translate(0px, 0px) }
}
.animate-floating { animation: floating 6s ease-in-out infinite; }

/* Dot animations */
@keyframes dot-squeeze-right { 0% { transform: translateX(0) scaleX(1) } 50% { transform: translateX(6px) scaleX(0.85) } 100% { transform: translateX(0) scaleX(1) } }
@keyframes dot-squeeze-left  { 0% { transform: translateX(0) scaleX(1) } 50% { transform: translateX(-6px) scaleX(0.85) } 100% { transform: translateX(0) scaleX(1) } }
@keyframes dot-move { 0% { transform: translateX(0) } 100% { transform: translateX(10px) } }
.animate-dot-squeeze-right { animation: dot-squeeze-right 1s ease-in-out infinite; }
.animate-dot-squeeze-left  { animation: dot-squeeze-left 1s ease-in-out infinite; }
.animate-dot-move { animation: dot-move 600ms ease-in-out infinite alternate; }

/* shadcn helpers */
@keyframes accordion-down { from { height: 0 } to { height: var(--radix-accordion-content-height) } }
@keyframes accordion-up   { from { height: var(--radix-accordion-content-height) } to { height: 0 } }

@keyframes gradient-slide { from { background-position: left } to { background-position: right } }
@keyframes puff { from { transform: scale(.96); opacity: 0 } to { transform: scale(1); opacity: 1 } }
```

---

## 11) Exact Class Snippets (must match across apps)

- **Services trigger**: `"text-navy hover:text-coral transition bg-transparent hover:bg-transparent data-[state=open]:text-coral"`
- **Services content**: `"z-50 bg-white border shadow-lg rounded-md"`
- **Services grid**: `"grid gap-3 p-5 md:w-[420px] lg:w-[520px] lg:grid-cols-2"`
- **Services feature card**: `"flex flex-col justify-end rounded-none bg-coral-gradient p-5 text-white [clip-path:polygon(0.6rem_0%,100%_0%,100%_calc(100%-0.6rem),calc(100%-0.6rem)_100%,0%_100%,0%_0.6rem)]"`
- **Login hover**: `"rounded-xl text-navy hover:text-coral hover:bg-coral/10 transition-colors"`
- **CTA**: use shadcn `<Button>` + `.btn-coral` utility
- **Button sizes**: default `h-10 px-4 py-2`; sm `h-9 px-3`; lg `h-11 px-8`; icon `h-10 w-10`
- **Logo sizes**: `h-8 md:h-14`

---

## 12) Pages & SEO (HTML head)

Ensure each app sets:

- Title: `Cloud Renovation — Structured, stress-free kitchen & bath renovations`
- Meta description + canonical + OG/Twitter tags
- JSON-LD `LocalBusiness` schema
- Viewport: `<meta name="viewport" content="width=device-width, initial-scale=1.0">`

Optional preloads (if used in the app):

```html
<link rel="preload" href="/lovable-uploads/8bb5c4d4-5c2b-451a-b162-a993e93c2d89.png" as="image">
<link rel="preload" href="https://pub-15e1a6b274ef4e41a5380e81c8c21972.r2.dev/CloudReno-removebg-preview.png" as="image">
```

---

## 13) Implementation Checklist (per repo)

1. **Copy shared files** into `src/styles/*`, `tailwind.config.ts`, and `src/components/ui/button.tsx`.
2. **Fonts**: Next.js — wire `next/font` variables to `<html>`; Vite — ensure `@import` exists and `:root` font vars set.
3. **Tailwind**: Point `content` to `./src/**/*` and `index.html`; restart dev server.
4. **Container**: Keep `container-custom` and Tailwind container `2xl:1120px` consistent.
5. **Buttons**: Use shadcn `Button` everywhere; add `.btn-coral` to apply brand gradient; remove any `!important` from legacy styles.
6. **Navbar**: Add `.navbar` toggle script; apply `navbar--glass` on load.
7. **Patterns & Glass**: Import `grid-patterns.css` and `layout.css` in your global CSS entry.
8. **Accessibility**: Include `.focus-ring` and mobile input sizing.
9. **Assets**: Use the canonical logo URLs above; verify `/logo-hr.png` and `/logo.svg` availability or remove references.
10. **QA**: Compare button clip-path, gradient hue, container width, focus ring, and dotted/blueprint overlays across apps.

---

## 14) Visual Parity Tests (do these screenshots match?)

- **Navbar** at 0px and 120px scroll.
- **Primary CTA** hover state vs focus state.
- **Services dropdown** at md and lg widths.
- **Hero** with `.hero-section` spacing at sm/md/lg.
- **Navy section** with blueprint overlay opacity.
- **Container** max width at ≥1440px.

---

## 15) Notes & Governance

- **Radius** stays at `0rem`; clipped corners are handled by `clip-path`.
- **Gradients** use the tokens in `:root` — do **not** inline brand gradients.
- **Do not** introduce `!important` in shared utilities.
- **When adding new tokens/components**, update this spec and all three apps in the same PR.

---

**End of spec.**

