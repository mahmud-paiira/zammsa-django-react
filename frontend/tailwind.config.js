/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        zammsa: {
          green: '#008542',
          'green-dark': '#006b35',
          'green-light': '#00a352',
          orange: '#EF7E1A',
          'orange-dark': '#d66d12',
          'orange-light': '#f2943d',
          black: '#000000',
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
          },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
