import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "on-tertiary-fixed": "#191c1e",
        "surface-container-high": "#242c24",
        "on-tertiary-container": "#3d4042",
        "background": "#0e150e",
        "on-secondary-fixed-variant": "#3c475a",
        "on-tertiary": "#2d3133",
        "on-background": "#dce5d9",
        "on-primary": "#003915",
        "surface": "#0e150e",
        "inverse-primary": "#006e2f",
        "on-primary-container": "#004b1e",
        "tertiary": "#c5c7c9",
        "secondary": "#bcc7de",
        "primary-container": "#22c55e",
        "secondary-fixed-dim": "#bcc7de",
        "on-tertiary-fixed-variant": "#444749",
        "surface-container": "#1a221a",
        "secondary-container": "#3e495d",
        "secondary-fixed": "#d8e3fb",
        "primary-fixed": "#6bff8f",
        "tertiary-fixed": "#e0e3e5",
        "on-primary-fixed": "#002109",
        "inverse-surface": "#dce5d9",
        "outline": "#869585",
        "primary-fixed-dim": "#4ae176",
        "surface-dim": "#0e150e",
        "on-error": "#690005",
        "primary": "#4be277",
        "surface-tint": "#4ae176",
        "tertiary-container": "#a9acae",
        "on-secondary-container": "#aeb9d0",
        "outline-variant": "#3d4a3d",
        "surface-container-highest": "#2f372e",
        "surface-bright": "#333b33",
        "tertiary-fixed-dim": "#c4c7c9",
        "surface-container-low": "#161d16",
        "surface-variant": "#2f372e",
        "inverse-on-surface": "#2a322a",
        "on-surface": "#dce5d9",
        "error": "#ffb4ab",
        "on-error-container": "#ffdad6",
        "on-primary-fixed-variant": "#005321",
        "on-secondary-fixed": "#111c2d",
        "error-container": "#93000a",
        "on-secondary": "#263143",
        "surface-container-lowest": "#091009",
        "on-surface-variant": "#bccbb9"
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px",
        "2xl": "1rem"
      },
      spacing: {
        "margin-desktop": "64px",
        "container-max": "1280px",
        "section-gap": "120px",
        "gutter": "24px",
        "margin-mobile": "20px"
      },
      fontFamily: {
        "display-lg-mobile": ["Geist", "sans-serif"],
        "label-caps": ["JetBrains Mono", "monospace"],
        "editorial-italic": ["Playfair Display", "serif"],
        "display-lg": ["Geist", "sans-serif"],
        "headline-md": ["Geist", "sans-serif"],
        "body-base": ["Geist", "sans-serif"],
        "data-metric": ["JetBrains Mono", "monospace"]
      },
      fontSize: {
        "display-lg-mobile": ["40px", { "lineHeight": "1.2", "letterSpacing": "-0.02em", "fontWeight": "700" }],
        "label-caps": ["12px", { "lineHeight": "1", "letterSpacing": "0.1em", "fontWeight": "600" }],
        "editorial-italic": ["32px", { "lineHeight": "1.3", "fontWeight": "400" }],
        "display-lg": ["64px", { "lineHeight": "1.1", "letterSpacing": "-0.04em", "fontWeight": "700" }],
        "headline-md": ["32px", { "lineHeight": "1.3", "fontWeight": "600" }],
        "body-base": ["16px", { "lineHeight": "1.6", "fontWeight": "400" }],
        "data-metric": ["24px", { "lineHeight": "1", "letterSpacing": "-0.02em", "fontWeight": "500" }]
      }
    },
  },
  plugins: [],
};

export default config;
