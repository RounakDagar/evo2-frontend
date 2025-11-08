// @ts-check
const defaultTheme = require("tailwindcss/defaultTheme");
const tailwindcssAnimate = require("tailwindcss-animate");

/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", ...defaultTheme.fontFamily.sans],
        mono: ["var(--font-jetbrains-mono)", ...defaultTheme.fontFamily.mono],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // --- CUSTOM BIOLUMINESCENT COLORS ---
        neon: {
          teal: "hsl(178, 100%, 50%)",
          violet: "hsl(270, 100%, 60%)",
          magenta: "hsl(331, 100%, 50%)", // Pathogenic
          cyan: "hsl(165, 100%, 50%)",    // Benign
          // Nucleotides
          A: "#39FF14", // Neon Green
          T: "#1F51FF", // Neon Blue
          C: "#FF9100", // Neon Orange
          G: "#FFFF00", // Neon Yellow
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      // --- CUSTOM GLOW SHADOWS ---
      boxShadow: {
        'glow-primary': '0 0 20px -5px hsl(var(--primary) / 0.5)',
        'glow-destructive': '0 0 20px -5px hsl(var(--destructive) / 0.5)',
        'glow-c': '0 0 15px -5px #FF9100', // Cytosine glow
        'glow-g': '0 0 15px -5px #FFFF00', // Guanine glow
        'glow-a': '0 0 15px -5px #39FF14', // Adenine glow
        'glow-t': '0 0 15px -5px #1F51FF', // Thymine glow
      },
      // --- CUSTOM GRADIENTS ---
      backgroundImage: {
        'gradient-bio': 'linear-gradient(135deg, hsl(178, 100%, 50%) 0%, hsl(270, 100%, 60%) 100%)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "1", filter: "brightness(100%) drop-shadow(0 0 0px transparent)" },
          "50%": { opacity: "0.8", filter: "brightness(150%) drop-shadow(0 0 10px currentColor)" },
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-glow": "pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

module.exports = config;