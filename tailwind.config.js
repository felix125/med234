/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './_includes/*.html',
    './_layouts/*.html',
    './_posts/en/*.md',
    './_posts/zh/*.md',
    './en/*.html',
    './zh/*.html',
    './*.html',
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}

