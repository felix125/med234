/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './_includes/*.html',
    './_includes/**/*.html',
    './_layouts/*.html',
    './_posts/en/*.md',
    './_posts/zh/*.md',
    './en/*.html',
    './zh/*.html',
    './*.html',
  ],
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in',
        'fade-in-slow': 'fadeIn 1s ease-in',
        'fade-in-fast': 'fadeIn 0.3s ease-in',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}

