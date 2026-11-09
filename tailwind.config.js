/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ios: {
          blue: '#007AFF',
          'blue-dark': '#0A84FF',
          green: '#34C759',
          'green-dark': '#30D158',
          orange: '#FF9500',
          'orange-dark': '#FF9F0A',
          purple: '#AF52DE',
          'purple-dark': '#BF5AF2',
          teal: '#5AC8FA',
          'teal-dark': '#64D2FF',
          red: '#FF3B30',
          'red-dark': '#FF453A',
          yellow: '#FFCC00',
          'yellow-dark': '#FFD60A',
          bg: '#F2F2F7',
          'bg-dark': '#000000',
          card: '#FFFFFF',
          'card-dark': '#1C1C1E',
          secondary: '#E5E5EA',
          'secondary-dark': '#2C2C2E',
          tertiary: '#D1D1D6',
          'tertiary-dark': '#3A3A3C',
          muted: '#8E8E93',
          subtext: '#636366'
        }
      },
      borderRadius: {
        'ios-sm': '10px',
        'ios-md': '16px',
        'ios-lg': '22px',
        'ios-xl': '28px',
        'ios-2xl': '36px'
      },
      boxShadow: {
        'ios-card': '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.02)',
        'ios-float': '0 12px 36px -4px rgba(0, 122, 255, 0.2), 0 4px 12px -2px rgba(0, 0, 0, 0.06)',
        'ios-glow-blue': '0 0 25px -3px rgba(0, 122, 255, 0.35)',
        'ios-glow-green': '0 0 25px -3px rgba(52, 199, 89, 0.35)',
        'ios-glow-orange': '0 0 25px -3px rgba(255, 149, 0, 0.35)',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif'
        ]
      }
    },
  },
  plugins: [],
}
