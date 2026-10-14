// Local acceptance server only. Reuse the canonical server and fixtures,
// adding observation before application hydration; built output is unchanged.
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const root = resolve(process.cwd());
let server = await readFile(resolve(root, 'scripts/serve-static.mjs'), 'utf8');
const observer = await readFile(resolve(root, 'evidence/runtime-continuation-2026-10-14/observe.js'), 'utf8');
server = server.replace("const root = resolve(dirname(fileURLToPath(import.meta.url)),'..');", `const root = ${JSON.stringify(root)};`);
server = server.replace("'<head><script src=\"/__acceptance/browser-platform-fixtures.js\"></script>'", JSON.stringify('<head><script>' + observer + '</script><script src="/__acceptance/browser-platform-fixtures.js"></script>'));
await import('data:text/javascript;base64,' + Buffer.from(server).toString('base64'));
