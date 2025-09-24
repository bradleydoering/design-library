const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://cloudrenovation.ca/packages';
const SITEMAP_PATH = path.join(__dirname, '..', 'packages', 'sitemap.xml');
const APP_DIR = path.join(__dirname, '..', 'apps', 'design-library', 'app');
const DATA_PATH = path.join(__dirname, '..', 'apps', 'design-library', 'data.json');

// Get all page routes from the Next.js app directory
// Convert package name to slug format (same logic as in [slug]/page.tsx)
function nameToSlug(name) {
  return name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+$/, '');
}

// Get package slugs from data.json
function getPackageSlugs() {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
    return data.packages?.map(pkg => nameToSlug(pkg.NAME)) || [];
  } catch (error) {
    console.warn('Could not read package data:', error.message);
    return [];
  }
}

function getRoutes(dir, basePath = '') {
  const routes = [];
  const items = fs.readdirSync(dir);

  // Routes to exclude from sitemap
  const excludedRoutes = ['test', 'admin'];

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // Skip special Next.js directories and dynamic routes
      if (item.startsWith('(') || item.startsWith('_') || item.startsWith('[')) {
        continue;
      }

      const routePath = basePath + '/' + item;

      // Skip excluded routes
      if (excludedRoutes.includes(item)) {
        continue;
      }

      // Check if directory has a page.tsx file
      const pagePath = path.join(fullPath, 'page.tsx');
      if (fs.existsSync(pagePath)) {
        routes.push(routePath);
      }

      // Recursively check subdirectories
      routes.push(...getRoutes(fullPath, routePath));
    }
  }

  return routes;
}

function generateSitemap() {
  const staticRoutes = getRoutes(APP_DIR);
  const packageSlugs = getPackageSlugs();

  // Add root route and static routes
  const allRoutes = ['', ...staticRoutes];

  // Add all package routes
  const packageRoutes = packageSlugs.map(slug => `/${slug}`);
  allRoutes.push(...packageRoutes);

  const currentDate = new Date().toISOString();

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  for (const route of allRoutes) {
    const url = BASE_URL + route;
    let priority, changefreq;

    if (route === '') {
      // Home page
      priority = '1.0';
      changefreq = 'weekly';
    } else if (packageRoutes.includes(route)) {
      // Package pages
      priority = '0.9';
      changefreq = 'monthly';
    } else {
      // Other static pages
      priority = '0.8';
      changefreq = 'monthly';
    }

    sitemap += `
  <url>
    <loc>${url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  }

  sitemap += `
</urlset>`;

  fs.writeFileSync(SITEMAP_PATH, sitemap);
  console.log(`Sitemap generated with ${allRoutes.length} URLs (${packageSlugs.length} packages, ${staticRoutes.length + 1} static pages) at ${SITEMAP_PATH}`);
}

// Run the generator
generateSitemap();