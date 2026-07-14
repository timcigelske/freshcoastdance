/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#eff3fb',
          100: '#dce6f5',
          200: '#b9cde9',
          300: '#8cafd9',
          400: '#5e8fc6',
          500: '#3d71b3',
          600: '#2c5897',
          700: '#1e4a7a',
          800: '#1E3A5F',
          900: '#162d4a',
          950: '#0a1628',
        },
        sapphire: {
          400: '#3b82f6',
          500: '#2563eb',
          600: '#1d4ed8',
          700: '#1e40af',
        },
        cream: {
          50: '#fdfaf6',
          100: '#f9f4ed',
          200: '#f0e8d8',
        },
        accent: {
          warm: '#c8893a',
          gold: '#d4a644',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Crimson Pro', 'Georgia', 'serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
        'studio': '0 0 0 1px rgba(30,58,95,0.08), 0 2px 8px rgba(30,58,95,0.06)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
    },
  },
  plugins: [],
};
