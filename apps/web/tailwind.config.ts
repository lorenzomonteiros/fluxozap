import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#0A0A0A',
          card: '#111111',
          elevated: '#1A1A1A',
          hover: '#1F1F1F',
        },
        gold: {
          DEFAULT: '#D4AF37',
          soft: '#F0C040',
          dark: '#A08020',
          muted: 'rgba(212, 175, 55, 0.15)',
          glow: 'rgba(212, 175, 55, 0.08)',
        },
        text: {
          primary: '#F5F5F0',
          secondary: '#8A8A8A',
          muted: '#555555',
          inverse: '#0A0A0A',
        },
        border: {
          DEFAULT: 'rgba(212, 175, 55, 0.15)',
          subtle: 'rgba(255, 255, 255, 0.06)',
          strong: 'rgba(212, 175, 55, 0.4)',
        },
        success: {
          DEFAULT: '#22C55E',
          muted: 'rgba(34, 197, 94, 0.15)',
        },
        danger: {
          DEFAULT: '#EF4444',
          muted: 'rgba(239, 68, 68, 0.15)',
        },
        warning: {
          DEFAULT: '#F59E0B',
          muted: 'rgba(245, 158, 11, 0.15)',
        },
        info: {
          DEFAULT: '#3B82F6',
          muted: 'rgba(59, 130, 246, 0.15)',
        },
      },
      fontFamily: {
        heading: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
      },
      boxShadow: {
        card: '0 4px 24px rgba(0,0,0,0.6), 0 0 0 1px rgba(212,175,55,0.08)',
        glow: '0 0 20px rgba(212, 175, 55, 0.3)',
        'glow-lg': '0 0 40px rgba(212, 175, 55, 0.2)',
        modal: '0 25px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(212,175,55,0.15)',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #D4AF37, #F0C040)',
        'gold-gradient-subtle': 'linear-gradient(135deg, rgba(212,175,55,0.1), rgba(240,192,64,0.05))',
        'dark-gradient': 'linear-gradient(180deg, #0A0A0A 0%, #111111 100%)',
        'card-gradient': 'linear-gradient(135deg, #111111, #1A1A1A)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'pulse-gold': 'pulseGold 2s infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(212,175,55,0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(212,175,55,0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
