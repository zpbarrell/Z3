import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  trailingSlash: 'always',
  redirects: { '/resources/': '/schedule/', '/contact/': '/support-us/' },
});