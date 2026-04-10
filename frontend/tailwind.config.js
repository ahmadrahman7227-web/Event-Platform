/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // UPGRADE 1: Animasi Gradien Bergerak
      animation: {
        'gradient-x': 'gradient-x 15s ease infinite',
        'gradient-slow': 'gradient-slow 8s linear infinite',
        'pulse-slow': 'pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': { 'background-size': '200% 200%', 'background-position': 'left center' },
          '50%': { 'background-size': '200% 200%', 'background-position': 'right center' },
        },
        'gradient-slow': {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
        },
      },
      // UPGRADE 2: Shadow Glow Khusus (Untuk Tombol & Card)
      boxShadow: {
        'neon-purple': '0 0 20px rgba(168, 85, 247, 0.4)',
        'neon-pink': '0 0 20px rgba(236, 72, 153, 0.4)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      // UPGRADE 3: Warna Kustom (Optional, agar lebih konsisten)
      colors: {
        'maestro-dark': '#050505', // Hitam yang lebih pekat dari default
        'maestro-purple': '#A855F7',
        'maestro-pink': '#EC4899',
      }
    },
  },
  plugins: [
    // Plugin untuk membantu efek masking pada grid pattern
    function ({ addUtilities }) {
      addUtilities({
        '.mask-image-gradient': {
          maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)',
        },
      })
    },
  ],
}








// /** @type {import('tailwindcss').Config} */
// export default {
//   content: [
//     "./index.html",
//     "./src/**/*.{js,jsx,ts,tsx}",
//   ],
//   theme: {
//     extend: {},
//   },
//   plugins: [],
// }