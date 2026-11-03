import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createSitemapXml } from './public-routes.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDirectory = path.join(root, 'frontend', 'public');

await mkdir(publicDirectory, { recursive: true });
await writeFile(path.join(publicDirectory, 'sitemap.xml'), createSitemapXml(), 'utf8');
console.log('Generated frontend/public/sitemap.xml from the public route allow-list.');
