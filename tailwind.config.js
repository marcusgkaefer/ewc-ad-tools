/** @type {import('tailwindcss').Config} */
import forms from '@tailwindcss/forms';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // EWC-Inspired Professional Primary Colors (Burgundy/Wine)
        primary: {
          50: '#fdf2f2',
          100: '#fce7e7',
          200: '#f9c4c4',
          300: '#f5a0a0',
          400: '#ee5a5a',
          500: '#8B0000',  // Deep burgundy - main brand color
          600: '#7a0000',
          700: '#6b0000',
          800: '#5c0000',
          900: '#4d0000',
          950: '#3e0000',
        },
        // Elegant Gray Scale for Secondary
        secondary: {
          50: '#ffffff',   // Pure white
          100: '#f8fafc',  // Soft pearl
          200: '#e2e8f0',  // Subtle gray
          300: '#cbd5e1',  // Interactive elements
          400: '#94a3b8',  // Hover states
          500: '#64748b',  // Mid-tone gray
          600: '#475569',  // Active states
          700: '#334155',  // Professional text
          800: '#1e293b',  // Dark elements
          900: '#0f172a',  // High contrast
          950: '#020617',
        },
        // Professional Support Colors (Gold/Champagne)
        accent: {
          50: '#fffbeb',   // Light champagne
          100: '#fef3c7',  // Gold highlights
          200: '#fde68a',  // Warm accents
          300: '#fcd34d',  // Interactive warmth
          400: '#fbbf24',  // Hover warmth
          500: '#d4af37',  // Warm gold accent
          600: '#b8941f',  // Active warmth
          700: '#9c7a18',  // Text on light
          800: '#806112',  // Dark mode accents
          900: '#64490e',  // High contrast accent
          950: '#48320a',
        },
        // Professional Neutrals
        neutral: {
          50: '#ffffff',   // Pure white pages
          100: '#fafafa',  // Off white cards
          200: '#e5e5e5',  // Subtle borders
          300: '#d4d4d4',  // Disabled states
          400: '#a3a3a3',  // Placeholder text
          500: '#737373',  // Secondary text
          600: '#525252',  // Primary text
          700: '#404040',  // Headings
          800: '#262626',  // High contrast
          900: '#171717',  // Maximum contrast
          950: '#0a0a0a',
        },
        // Refined Semantic Colors
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#16a34a',  // Refined green
          600: '#15803d',
          700: '#166534',
          800: '#14532d',
          900: '#14532d',
          950: '#052e16',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',  // Elegant amber
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#dc2626',  // Sophisticated red
          600: '#b91c1c',
          700: '#991b1b',
          800: '#7f1d1d',
          900: '#450a0a',
          950: '#450a0a',
        },
        info: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#2563eb',  // Professional blue
          600: '#1d4ed8',
          700: '#1e40af',
          800: '#1e3a8a',
          900: '#1e3a8a',
          950: '#172554',
        },
        // New Waxcenter color palette
        wax: {
          // Primary reds from waxcenter.com
          red: {
            50: '#fef2f2',
            100: '#fee2e2',
            200: '#fecaca',
            300: '#fca5a5',
            400: '#f87171',
            500: '#ef4444', // Main red
            600: '#dc2626', // Waxcenter primary red
            700: '#b91c1c',
            800: '#991b1b',
            900: '#7f1d1d',
            950: '#450a0a',
          },
          // Elegant whites and grays
          white: {
            50: '#ffffff',
            100: '#fefefe',
            200: '#fdfdfd',
            300: '#fcfcfc',
            400: '#fafafa',
            500: '#f8f8f8',
            600: '#f5f5f5',
            700: '#f2f2f2',
            800: '#eeeeee',
            900: '#e8e8e8',
          },
          // Supporting grays for sophistication
          gray: {
            50: '#f9fafb',
            100: '#f3f4f6',
            200: '#e5e7eb',
            300: '#d1d5db',
            400: '#9ca3af',
            500: '#6b7280',
            600: '#4b5563',
            700: '#374151',
            800: '#1f2937',
            900: '#111827',
            950: '#030712',
          },
          // Accent colors for status and highlights
          gold: {
            50: '#fffbeb',
            100: '#fef3c7',
            200: '#fde68a',
            300: '#fcd34d',
            400: '#fbbf24',
            500: '#f59e0b',
            600: '#d97706',
            700: '#b45309',
            800: '#92400e',
            900: '#78350f',
          },
        },
      },
      // Custom gradients for the new design
      backgroundImage: {
        'wax-gradient': 'linear-gradient(135deg, #dc2626 0%, #ef4444 50%, #f87171 100%)',
        'wax-subtle': 'linear-gradient(135deg, #fef2f2 0%, #ffffff 50%, #fef2f2 100%)',
        'wax-elegant': 'linear-gradient(135deg, #ffffff 0%, #fef2f2 25%, #ffffff 50%, #fef2f2 75%, #ffffff 100%)',
      },
      // Enhanced shadows for premium feel
      boxShadow: {
        'wax-sm': '0 2px 4px 0 rgba(220, 38, 38, 0.05)',
        'wax': '0 4px 6px -1px rgba(220, 38, 38, 0.1), 0 2px 4px -1px rgba(220, 38, 38, 0.06)',
        'wax-md': '0 10px 15px -3px rgba(220, 38, 38, 0.1), 0 4px 6px -2px rgba(220, 38, 38, 0.05)',
        'wax-lg': '0 20px 25px -5px rgba(220, 38, 38, 0.1), 0 10px 10px -5px rgba(220, 38, 38, 0.04)',
        'wax-xl': '0 25px 50px -12px rgba(220, 38, 38, 0.25)',
        'wax-2xl': '0 25px 50px -12px rgba(220, 38, 38, 0.25)',
        'wax-inner': 'inset 0 2px 4px 0 rgba(220, 38, 38, 0.06)',
      },
      // Enhanced animations
      animation: {
        'wax-pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'wax-bounce': 'bounce 1s infinite',
        'wax-fade-in': 'fadeIn 0.5s ease-in-out',
        'wax-slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundSize: {
        '400%': '400% 400%',
      },
      animation: {
        'gradient-shift': 'gradientShift 20s ease infinite',
        'fade-in': 'fadeIn 0.6s ease-out',
        'fade-in-elegant': 'fadeInElegant 0.8s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'slide-up-premium': 'slideUpPremium 0.8s ease-out',
        'scale-in': 'scaleIn 0.4s ease-out',
        'scale-in-smooth': 'scaleInSmooth 0.6s ease-out',
        'bounce-gentle': 'bounceGentle 2s ease-in-out infinite',
        'pulse-slow': 'pulseSlow 4s ease-in-out infinite',
        'glow-gentle': 'glowGentle 3s ease-in-out infinite',
        'float-soft': 'floatSoft 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        fadeInElegant: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideUpPremium: {
          from: { opacity: '0', transform: 'translateY(40px) scale(0.95)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.9)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        scaleInSmooth: {
          from: { opacity: '0', transform: 'scale(0.85) translateY(20px)' },
          to: { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        pulseSlow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        glowGentle: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(139, 0, 0, 0.1)' },
          '50%': { boxShadow: '0 0 40px rgba(139, 0, 0, 0.2)' },
        },
        floatSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      fontSize: {
        'xs': '0.75rem',
        'sm': '0.875rem',
        'base': '1rem',
        'lg': '1.125rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
        '6xl': '3.75rem',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      screens: {
        'xs': '475px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
        'glass-premium': '0 20px 60px 0 rgba(0, 0, 0, 0.08)',
        'glow': '0 0 20px rgba(139, 0, 0, 0.15)',
        'glow-lg': '0 0 40px rgba(139, 0, 0, 0.2)',
        'professional': '0 10px 40px rgba(0, 0, 0, 0.05)',
        'elegant': '0 25px 50px rgba(0, 0, 0, 0.08)',
        '3xl': '0 35px 60px rgba(0, 0, 0, 0.12)',
      },
      backdropBlur: {
        'xs': '2px',
        '3xl': '64px',
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
    },
  },
  plugins: [forms],
} 