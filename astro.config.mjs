import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
const mallId = process.env.MALL_ID ?? 'saigon-centre';
if (!['saigon-centre', 'vincom-dong-khoi'].includes(mallId)) throw new Error('Unknown MALL_ID');
export default defineConfig({
  integrations: [react()],
  output: 'static',
  outDir: `./dist/${mallId}`,
  trailingSlash: 'never',
});
