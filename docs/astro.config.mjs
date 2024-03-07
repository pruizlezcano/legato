import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import tailwind from '@astrojs/tailwind';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: 'Legato',
      customCss: ['./src/index.css'],
      editLink: {
        baseUrl: 'https://github.com/pruizlezcano/legato/edit/main/docs',
      },
      social: {
        github: 'https://github.com/pruizlezcano/legato',
      },
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
    tailwind({ applyBaseStyles: false }),
    react(),
  ],
});
