/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0B0F19', // Deeper background
          800: '#151C2C', // Panel background
          700: '#1E293B', // Lighter panel / borders
        },
        neon: {
          blue: '#00F0FF',   // Cyberpunk blue
          green: '#00FF66',  // Neon green
          rose: '#FF0055',   // Neon red/pink for high traffic/delayed
          yellow: '#FFDE00', // Neon yellow for busy
          purple: '#B500FF', // Special VIP
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'neon-blue': '0 0 10px rgba(0, 240, 255, 0.5), 0 0 20px rgba(0, 240, 255, 0.3)',
        'neon-green': '0 0 10px rgba(0, 255, 102, 0.5)',
        'neon-rose': '0 0 10px rgba(255, 0, 85, 0.5)',
      }
    },
  },
  plugins: [],
}
