
export default {
  content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        ivory: '#FFFEF9',
        champagne: '#F5E6D3',
        'warm-beige': '#E8DDD3',
        gold: '#C9A96E',
        dark: '#3D3529',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['"Cormorant Garamond"', 'serif'],
      },
      animation: {
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        shimmer: {
          from: { backgroundPosition: '200% 0' },
          to: { backgroundPosition: '-200% 0' },
        }
      }
    },
  },
  plugins: [],
}
