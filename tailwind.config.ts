import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Background Colors
        'navy': {
          DEFAULT: '#0D1B2A',
          dark: '#0A1520',
          medium: '#142536',
          light: '#1C3247',
        },
        // Brand Colors
        'cream': {
          DEFAULT: '#E8DCC4',
          soft: '#D4C9B5',
          muted: '#9A9082',
          dim: '#6B6358',
        },
        'gold': {
          DEFAULT: '#C9A962',
          soft: '#D4B896',
        },
        // Semantic Colors
        'success': '#4CAF7A',
        'warning': '#C9A962',
        'error': '#D45B5B',
        'info': '#5B8FD4',
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', 'system-ui', 'sans-serif'],
        display: ['Inter', 'SF Pro Display', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['48px', { lineHeight: '56px', letterSpacing: '-0.02em' }],
        'display': ['40px', { lineHeight: '48px', letterSpacing: '-0.02em' }],
        'h1': ['32px', { lineHeight: '40px', letterSpacing: '-0.01em' }],
        'h2': ['24px', { lineHeight: '32px', letterSpacing: '-0.01em' }],
        'h3': ['20px', { lineHeight: '28px', letterSpacing: '0' }],
        'h4': ['18px', { lineHeight: '24px', letterSpacing: '0' }],
        'body-lg': ['16px', { lineHeight: '24px', letterSpacing: '0' }],
        'body': ['14px', { lineHeight: '20px', letterSpacing: '0.01em' }],
        'caption': ['12px', { lineHeight: '16px', letterSpacing: '0.02em' }],
        'overline': ['10px', { lineHeight: '14px', letterSpacing: '0.1em' }],
      },
      spacing: {
        '4xs': '2px',
        '3xs': '4px',
        '2xs': '8px',
        'xs': '12px',
        'sm': '16px',
        'md': '24px',
        'lg': '32px',
        'xl': '48px',
        '2xl': '64px',
        '3xl': '96px',
        '4xl': '128px',
      },
      borderRadius: {
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        '2xl': '32px',
      },
      boxShadow: {
        'card': '0 4px 24px rgba(0, 0, 0, 0.5)',
        'button': '0 8px 32px rgba(201, 169, 98, 0.3)',
        'glow': '0 0 20px rgba(201, 169, 98, 0.6)',
        'hotspot': '0 0 20px rgba(201, 169, 98, 0.6)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #E8DCC4 0%, #C9A962 100%)',
        'gradient-gold': 'linear-gradient(135deg, #C9A962 0%, #D4B896 100%)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s infinite',
        'float': 'float 3s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.2)', opacity: '0.8' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
