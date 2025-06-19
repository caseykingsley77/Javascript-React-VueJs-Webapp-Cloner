const { chromium } = require('playwright');
const fs = require('fs-extra');
const path = require('path');
const url = require('url');

const BASE_URL = 'https://erp.osllc.us';
const START_URL = `${BASE_URL}/admin/auth/login`;
const ROUTES = [
  '/admin/dashboard',
  '/admin/inventory',
  '/admin/purchase',
  '/admin/sale',
  '/admin/account',
  '/admin/report',
  '/admin/pos',
  '/admin/setting'
];

const downloadFolder = path.join(__dirname, 'offline-app');
const downloadedResources = new Set();

(async () => {
  await fs.ensureDir(downloadFolder);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Download static assets
  page.on('response', async (response) => {
    try {
      const requestUrl = response.url();
      const parsed = url.parse(requestUrl);
      const pathname = parsed.pathname || '';
      const ext = path.extname(pathname).split('?')[0];
      const isAsset = /\.(css|js|png|jpe?g|gif|svg|ico|woff2?|ttf|otf|json|webp|map)$/i.test(pathname);

      if (isAsset && !downloadedResources.has(requestUrl)) {
        downloadedResources.add(requestUrl);
        const buffer = await response.body();
        const filePath = path.join(downloadFolder, pathname);
        await fs.ensureDir(path.dirname(filePath));
        await fs.writeFile(filePath, buffer);
        console.log('⬇️  Saved:', pathname);
      }
    } catch (err) {
      console.error('❌ Error saving resource:', err);
    }
  });

  // Step 1: Go to login page
  await page.goto(START_URL, { waitUntil: 'networkidle' });

  // Step 2: Login
  await page.fill('input[type="text"]', 'demo');
  await page.fill('input[type="password"]', '5555');
  await Promise.all([
    page.click('button:has-text("Login")'),
    page.waitForNavigation({ waitUntil: 'networkidle' })
  ]);
  console.log('✅ Logged in');

  // Step 3: Visit and save each route
  for (const route of ROUTES) {
    const fullUrl = `${BASE_URL}${route}`;
    await page.goto(fullUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000); // Let dynamic content load
    const html = await page.content();
    const routeFile = route.replace(/^\/admin\/?/, '') || 'dashboard';
    const filePath = path.join(downloadFolder, `${routeFile}.html`);
    await fs.writeFile(filePath, html);
    console.log(`✅ Saved ${routeFile}.html`);
  }

  await browser.close();
  console.log('🎉 All done!');
})();
