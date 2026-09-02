import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://rodrigofpo.github.io',
  output: 'static',
  markdown: { shikiConfig: { theme: 'github-dark' } },
});
