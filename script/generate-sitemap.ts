
import fs from 'fs';
import path from 'path';
import { pdfToolTypes } from '../shared/schema';

const DOMAIN = 'https://pdf-converters.online';
const SITEMAP_PATH = path.resolve(process.cwd(), 'client/public/sitemap.xml');

const generateSitemap = () => {
    const tools = pdfToolTypes;
    const currentDate = new Date().toISOString();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${DOMAIN}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${DOMAIN}/tools</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;

    tools.forEach((toolId) => {
        xml += `  <url>
    <loc>${DOMAIN}/tool/${toolId}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
    });

    xml += `</urlset>`;

    fs.writeFileSync(SITEMAP_PATH, xml);
    console.log(`Sitemap generated with ${tools.length + 2} URLs at ${SITEMAP_PATH}`);
};

generateSitemap();
