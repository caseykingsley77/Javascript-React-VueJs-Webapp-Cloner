const { chromium } = require('playwright');
const fs = require('fs-extra');
const path = require('path');
const url = require('url');

const downloadFolder = path.join(__dirname, 'offline-site');

(async () => {
  await fs.ensureDir(downloadFolder);
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const downloadedResources = new Set();

  // Intercept and save all assets
  page.on('response', async (response) => {
    try {
      const requestUrl = response.url();
      const contentType = response.headers()['content-type'] || '';
      const parsedUrl = url.parse(requestUrl);
      const isAsset = /\.(css|js|png|jpe?g|gif|svg|ico|woff2?|ttf|otf|json|webp|map)$/i.test(parsedUrl.pathname || '');

      if (isAsset && !downloadedResources.has(requestUrl)) {
        downloadedResources.add(requestUrl);
        const buffer = await response.body();
        const assetPath = path.join(downloadFolder, parsedUrl.pathname || '');
        await fs.ensureDir(path.dirname(assetPath));
        await fs.writeFile(assetPath, buffer);
        console.log('⬇️  Saved:', parsedUrl.pathname);
      }
    } catch (err) {
      console.error('❌ Error saving resource:', err);
    }
  });

  // Step 1: Go to login page
  await page.goto('https://erp.osllc.us/admin/auth/login', { waitUntil: 'networkidle' });

  // Step 2: Fill login form
  await page.fill('input[placeholder="Enter username"]', 'demo');
  await page.fill('input[placeholder="Enter password"]', '5555');
  await Promise.all([
    page.click('button:has-text("Login")'),
    page.waitForNavigation({ waitUntil: 'networkidle' }),
  ]);

  // Step 3: Save each dashboard section
  const sections = [
    { name: 'dashboard', url: 'https://erp.osllc.us/dashboard' },
    { name: 'inventory', url: 'https://erp.osllc.us/inventory' },
    { name: 'sale', url: 'https://erp.osllc.us/sale' },
    { name: 'report', url: 'https://erp.osllc.us/report' },
    { name: 'purchase', url: 'https://erp.osllc.us/purchase' },
    { name: 'accounts', url: 'https://erp.osllc.us/accounts' },
    { name: 'pos', url: 'https://erp.osllc.us/pos' },
    { name: 'settings', url: 'https://erp.osllc.us/settings' }
  ];

  for (const section of sections) {
    await page.goto(section.url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(4000); // Wait for data to render
    const content = await page.content();
    const filePath = path.join(downloadFolder, `${section.name}.html`);
    await fs.writeFile(filePath, content);
    console.log(`✅ Saved ${section.name}.html`);
  }

  await browser.close();
})();
