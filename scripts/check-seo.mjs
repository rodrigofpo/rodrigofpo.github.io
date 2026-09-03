import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { extname, join, relative, sep } from 'node:path';

const dist = new URL('../dist/', import.meta.url);
const origin = 'https://rodrigofpo.github.io';
const errors = [];

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

function routeFor(file) {
  const path = relative(dist.pathname, file).split(sep).join('/');
  if (path === 'index.html') return '/';
  if (path.endsWith('/index.html')) return `/${path.slice(0, -'index.html'.length)}`;
  if (path === '404.html') return '/404/';
  return `/${path}`;
}

function attribute(tag, name) {
  return tag.match(new RegExp(`${name}=["']([^"']*)["']`, 'i'))?.[1];
}

function targetExists(pathname) {
  const decoded = decodeURIComponent(pathname);
  const relativePath = decoded.replace(/^\//, '');
  if (decoded === '/') return existsSync(new URL('index.html', dist));
  if (decoded.endsWith('/')) return existsSync(new URL(`${relativePath}index.html`, dist));
  if (extname(decoded)) return existsSync(new URL(relativePath, dist));
  return false;
}

const htmlFiles = walk(dist.pathname).filter((file) => file.endsWith('.html'));
const canonicalUrls = new Map();

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  const route = routeFor(file);
  const canonicalTags = html.match(/<link\b[^>]*\brel=["']canonical["'][^>]*>/gi) ?? [];
  const robots = html.match(/<meta\b[^>]*\bname=["']robots["'][^>]*>/i)?.[0];
  const noindex = robots?.toLowerCase().includes('noindex') ?? false;

  if (canonicalTags.length !== 1) errors.push(`${route}: deve ter exatamente um canonical`);
  else {
    const canonical = attribute(canonicalTags[0], 'href');
    if (!canonical?.startsWith(origin)) errors.push(`${route}: canonical fora do domínio oficial`);
    if (canonical && new URL(canonical).pathname !== '/' && !new URL(canonical).pathname.endsWith('/')) errors.push(`${route}: canonical sem barra final`);
    if (canonical) {
      const previous = canonicalUrls.get(canonical);
      if (previous) errors.push(`${route}: canonical duplicado com ${previous}`);
      canonicalUrls.set(canonical, route);
    }
  }

  if (route === '/404/' && !noindex) errors.push('/404/: deve usar noindex');
  if (route !== '/404/' && noindex) errors.push(`${route}: noindex não permitido`);

  if (!noindex) {
    if (!/<title>[^<]+<\/title>/i.test(html)) errors.push(`${route}: title ausente`);
    if (!/<meta\b[^>]*\bname=["']description["'][^>]*\bcontent=["'][^"']+["'][^>]*>/i.test(html)) errors.push(`${route}: description ausente`);
    const headings = html.match(/<h1\b/gi) ?? [];
    if (headings.length !== 1) errors.push(`${route}: esperado um H1, encontrado ${headings.length}`);
    const jsonLdBlocks = [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
    if (jsonLdBlocks.length === 0) errors.push(`${route}: JSON-LD ausente`);
    for (const block of jsonLdBlocks) {
      try { JSON.parse(block[1]); } catch { errors.push(`${route}: JSON-LD inválido`); }
    }
  }

  for (const image of html.match(/<img\b[^>]*>/gi) ?? []) {
    if (!/\balt=["'][^"']*["']/i.test(image)) errors.push(`${route}: imagem sem alt`);
  }

  for (const anchor of html.match(/<a\b[^>]*\bhref=["'][^"']+["'][^>]*>/gi) ?? []) {
    const href = attribute(anchor, 'href');
    if (!href || /^(mailto:|tel:|#)/i.test(href)) continue;
    const url = new URL(href, origin);
    if (url.origin !== origin) continue;
    const pathname = url.pathname;
    if (!extname(pathname) && pathname !== '/' && !pathname.endsWith('/')) errors.push(`${route}: link interno sem barra final (${href})`);
    if (!targetExists(pathname)) errors.push(`${route}: link interno inexistente (${href})`);
  }
}

for (const required of ['robots.txt', 'sitemap-index.xml', 'og.png']) {
  if (!existsSync(new URL(required, dist))) errors.push(`dist/${required} ausente`);
}

const png = readFileSync(new URL('og.png', dist));
if (png.readUInt32BE(16) !== 1200 || png.readUInt32BE(20) !== 630) errors.push('og.png deve medir 1200 × 630');

if (errors.length) {
  console.error(`Auditoria SEO encontrou ${errors.length} problema(s):\n- ${errors.join('\n- ')}`);
  process.exit(1);
}

console.log(`Auditoria SEO concluída: ${htmlFiles.length} páginas verificadas.`);
