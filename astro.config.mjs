import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
const mallId = process.env.MALL_ID ?? 'saigon-centre';
if (!['saigon-centre', 'vincom-dong-khoi'].includes(mallId)) throw new Error('Unknown MALL_ID');
export default defineConfig({
  vite: { cacheDir: `./.vite-atlas-${mallId}`, define: { 'import.meta.env.PUBLIC_CONTENT_FIXTURES': JSON.stringify(process.env.INCLUDE_TEST_FIXTURES === '1' ? '1' : '0') } },
  integrations: [react()],
  output: 'static',
  outDir: process.env.INCLUDE_TEST_FIXTURES === 'research' ? `./dist/research/${mallId}` : process.env.INCLUDE_TEST_FIXTURES === '1' ? `./dist/fixtures/${mallId}` : `./dist/${mallId}`,
  trailingSlash: 'never',
});
