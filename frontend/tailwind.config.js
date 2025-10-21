/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {},
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.break-inside-avoid': { 'break-inside': 'avoid' },
        '.page-break': { 'page-break-before': 'always' },
        '.table-header-repeat': { 'display': 'table-header-group' },
      }, ['responsive', 'print']);
    },
  ],
}



// /** @type {import('tailwindcss').Config} */
// export default {
//   darkMode: 'class',
//   content: [
//     "./index.html",
//     "./src/**/*.{js,jsx,ts,tsx}",
//   ],
//   theme: {},
//   plugins: [],
// }
