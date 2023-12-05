module.exports = {
  content: ['./src/**/*.{tsx,ts}'],
  darkMode: 'class',
  important: true,
  theme: {
    extend: {
      colors: {
        dark: {
          DEFAULT: 'rgb(33,29,38)',
          900: 'rgb(42,39,50)',
          800: 'rgb(56,52,66)',
          700: 'rgb(68,63,80)',
          600: 'rgb(85,79,100)',
        },
        'text-dark': 'rgb(221,221,223)',
      },
    },
  },
  plugins: [],
};
