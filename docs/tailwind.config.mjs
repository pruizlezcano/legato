import starlightPlugin from '@astrojs/starlight-tailwind';
import defaultTheme from 'tailwindcss/defaultTheme';
import animations from '@midudev/tailwind-animations';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter\\ Variable', ...defaultTheme.fontFamily.sans],
        news: ['Newsreader\\ Variable', ...defaultTheme.fontFamily.sans],
        mono: [
          'Source\\ Code\\ Pro\\ Variable',
          ...defaultTheme.fontFamily.mono,
        ],
      },
    },
  },
  plugins: [animations, starlightPlugin()],
};
