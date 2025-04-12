import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import react from '@astrojs/react';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://pruizlezcano.github.io',
  base: '/legato',

  integrations: [
    starlight({
      title: 'Legato',
      customCss: ['./src/index.css'],
      editLink: {
        baseUrl: 'https://github.com/pruizlezcano/legato/edit/main/docs',
      },
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/pruizlezcano/legato',
        },
      ],
      sidebar: [
        {
          label: 'Getting started',
          link: 'getting-started',
        },
        {
          label: 'Guides',
          items: [
            {
              label: 'Scanning projects',
              link: 'scanning-projects',
            },
            {
              label: 'Managing projects',
              link: 'managing-projects',
            },
            {
              label: 'Search Filters',
              link: 'search-filters',
            },
            {
              label: 'Application Behavior',
              link: 'application-behavior',
            },
          ],
        },
        {
          label: 'Extra',
          items: [
            { label: 'Changelog', link: 'changelog' },
            { label: 'Contributing', link: 'contributing' },
            { label: 'License', link: 'license' },
          ],
        },
      ],
      expressiveCode: {
        styleOverrides: { borderRadius: '0.4rem' },
      },
    }),
    react(),
  ],

  vite: {
    plugins: [tailwindcss()],
  },
});
