/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#6366f1",
        secondary: "#8b5cf6",
      },
      keyframes: {
        orbPulse: {
          '0%, 100%': { transform: 'scale(0.95)', opacity: '0.85' },
          '50%': { transform: 'scale(1.08)', opacity: '1' },
        },
        soundBar: {
          '0%, 100%': { height: '8px' },
          '50%': { height: '32px' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        aiSpeak: {
          '0%, 100%': { transform: 'scale(1) rotate(0deg)' },
          '25%': { transform: 'scale(1.15) rotate(-3deg) scaleY(1.05)' },
          '50%': { transform: 'scale(1.05) rotate(3deg)' },
          '75%': { transform: 'scale(1.15) rotate(-3deg) scaleY(1.05)' }
        }
      },
      animation: {
        orbPulse: 'orbPulse 2s infinite ease-in-out',
        soundBar: 'soundBar 1.2s infinite ease-in-out',
        fadeInUp: 'fadeInUp 0.5s ease-out forwards',
        aiSpeak: 'aiSpeak 1.5s infinite ease-in-out',
      }
    },
  },
  plugins: [],
}
