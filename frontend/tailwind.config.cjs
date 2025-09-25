/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        severity: {
          uns: '#EF4444',
          res: '#F59E0B',
          cau: '#3B82F6',
          info: '#9CA3AF',
        },
      },
      boxShadow: {
        focus: '0 0 0 3px rgba(59, 130, 246, 0.5)',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
