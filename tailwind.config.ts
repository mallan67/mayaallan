import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    // Responsive breakpoints (mobile-first)
    screens: {
      'xs': '375px',    // Small phones
      'sm': '640px',    // Large phones / small tablets
      'md': '768px',    // Tablets
      'lg': '1024px',   // Laptops / small desktops
      'xl': '1280px',   // Desktops
      '2xl': '1536px',  // Large desktops
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-space-grotesk)', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        serif: ['var(--font-fraunces)', 'Georgia', 'Cambria', 'Times New Roman', 'Times', 'serif'],
      },
      colors: {
        navy: {
          DEFAULT: '#0F1322',
          light: '#1A1F35',
        },
        'liquid-blue': {
          DEFAULT: '#0D6EBF',
          bright: '#1488E0',
          wash: 'rgba(13,110,191,0.07)',
        },
        gold: {
          DEFAULT: '#D4A520',
          deep: '#B8910A',
          wash: 'rgba(212,165,32,0.12)',
        },
        surface: '#F4F4F5',
        charcoal: {
          DEFAULT: '#0A0A0D',
          body: '#141418',
          mid: '#2A2A30',
          soft: '#484850',
        },
      },
      // Fluid typography
      fontSize: {
        'fluid-xs': 'clamp(0.75rem, 2vw, 0.875rem)',
        'fluid-sm': 'clamp(0.875rem, 2.5vw, 1rem)',
        'fluid-base': 'clamp(1rem, 3vw, 1.125rem)',
        'fluid-lg': 'clamp(1.125rem, 3.5vw, 1.25rem)',
        'fluid-xl': 'clamp(1.25rem, 4vw, 1.5rem)',
        'fluid-2xl': 'clamp(1.5rem, 5vw, 2rem)',
        'fluid-3xl': 'clamp(1.875rem, 6vw, 2.5rem)',
        'fluid-4xl': 'clamp(2.25rem, 7vw, 3rem)',
      },
      // Spacing for touch targets (44px minimum)
      spacing: {
        '11': '2.75rem', // 44px - minimum touch target
        '13': '3.25rem',
        '15': '3.75rem',
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      // Minimum heights for touch targets
      minHeight: {
        'touch': '44px',
      },
      minWidth: {
        'touch': '44px',
      },
      // Animation with reduced motion support
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      // Container padding
      padding: {
        'container-mobile': '1rem',
        'container-tablet': '1.5rem',
        'container-desktop': '2rem',
      },
    },
  },
  plugins: [],
  // Future-proofing
  future: {
    hoverOnlyWhenSupported: true, // Only apply hover styles on devices that support hover
  },
}

export default config
