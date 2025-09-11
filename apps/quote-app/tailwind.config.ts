import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        // Semantic tokens (consume via hsl(var(--token)))
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

        // Brand palette
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
        floating: {
          "0%": { transform: "translate(-50%, -50%) translate(0px, 0px)" },
          "50%": { transform: "translate(-50%, -50%) translate(20px, 20px)" },
          "100%": { transform: "translate(-50%, -50%) translate(0px, 0px)" }
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "gradient-slide": "gradient-slide 300ms linear both",
        puff: "puff 240ms ease-out both",
        floating: "floating 6s ease-in-out infinite",
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