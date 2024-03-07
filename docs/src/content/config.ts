/* eslint-disable */

import { defineCollection } from 'astro:content';
import { docsSchema } from '@astrojs/starlight/schema';

// eslint-disable-next-line import/prefer-default-export
export const collections = {
  docs: defineCollection({ schema: docsSchema() }),
};
