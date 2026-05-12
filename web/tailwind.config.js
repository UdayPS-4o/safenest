

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary:       '#E63946',
        primaryDark:   '#C1121F',
        primaryLight:  '#FF6B6B',
        accent:        '#457B9D',
        accentLight:   '#A8DADC',
        success:       '#2A9D8F',
        successLight:  '#94D2BD',
        warning:       '#E9C46A',
        warningDark:   '#F4A261',
        danger:        '#E63946',
        surface:       '#FFFFFF',
        surfaceAlt:    '#F8F9FB',
        background:    '#F1F3F6',
        card:          '#FFFFFF',
        textPrimary:   '#1A1A2E',
        textSecondary: '#5C6780',
        textMuted:     '#9AA3B2',
        border:        '#E8EBF0',
        borderDark:    '#D1D9E6',
        // role colors
        guardBlue:     '#1B4F72',
        guardLight:    '#EBF5FB',
        residentGreen: '#1E6F5C',
        residentLight: '#E8F8F5',
        adminPurple:   '#4A235A',
        adminLight:    '#F4ECF7',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'card': '0 2px 12px rgba(0,0,0,0.07)',
        'card-hover': '0 8px 30px rgba(0,0,0,0.12)',
        'glow-primary': '0 0 20px rgba(230,57,70,0.25)',
        'glow-success': '0 0 20px rgba(42,157,143,0.25)',
        'glow-guard': '0 0 20px rgba(27,79,114,0.25)',
        'bottom-nav': '0 -4px 20px rgba(0,0,0,0.08)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1)',
        'slide-in-right': 'slideInRight 0.35s cubic-bezier(0.16,1,0.3,1)',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'badge-pop': 'badgePop 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        'spin-slow': 'spin 3s linear infinite',
        'shimmer': 'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(30px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        badgePop: {
          '0%': { transform: 'scale(0.5)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'shimmer-gradient': 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
      },
    },
  },
  plugins: [],
};
