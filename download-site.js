const { chromium } = require('playwright');
const fs = require('fs-extra');
const path = require('path');
const url = require('url');

const downloadFolder = path.join(__dirname, 'offline-site');
const baseUrl = 'https://erp.osllc.us';

const urls = [
  'admin/dashboard',
  'admin/product',
  'admin/product-sort-list',
  'admin/purchase',
  'admin/supplier',
  'admin/purchase-return-list',
  'admin/purchase-reorder-invoice',
  'admin/sale',
  'admin/customer',
  'admin/sale-return-list',
  'admin/account/',
  'admin/transaction/',
  'admin/account/trial-balance',
  'admin/account/balance-sheet',
  'admin/account/income',
  'admin/product-report',
  'admin/purchase-report',
  'admin/sale-report',
  'admin/supplier-report',
  'admin/customer-report',
  'admin/payment-report',
  'admin/pos',
  'admin/company-setting',
  'admin/app-settings',
  'admin/hr/staffs',
  'admin/role',
  'admin/designation/',
  'admin/department/',
  'admin/shift/',
  'admin/employment-status/',
  'admin/product-category',
  'admin/product-subcategory',
  'admin/product-brand',
  'admin/product-color',
  'admin/product-attribute',
  'admin/uom',
  'admin/import-product',
  'admin/print-page-setting',
  'admin/discount',
  'admin/currency',
  'admin/vat-tax',
  'admin/hr/staffs/1',
  'admin/pos',
];

(async () => {
  await fs.ensureDir(downloadFolder);
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  const downloadedResources = new Set();

  // Intercept and save static resources (CSS, JS, fonts, images)
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

    // Step 1: Login with fallback and screenshot for debugging
  await page.goto(`${baseUrl}/admin/auth/login`, { waitUntil: 'domcontentloaded' });

  try {
    // await page.waitForSelector('input[name="username"]
    await page.fill('input[placeholder="Enter username"]', 'demo');
    await page.fill('input[placeholder="Enter password"]', '5555');

    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle' }),
    ]);

    console.log('✅ Logged in successfully.');
  } catch (err) {
    await page.screenshot({ path: 'login-error.png' });
    console.error('❌ Failed to login, screenshot saved as login-error.png');
    throw err;
  }


  // Step 2: Visit each page and save HTML
  for (const route of urls) {
    const fullUrl = `${baseUrl}/${route}`;
    console.log(`🌐 Visiting: ${fullUrl}`);
    await page.goto(fullUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(10000); // allow content and dynamic JS to finish loading
    await page.waitForSelector('#root'); // Wait for root render

    const html = await page.content();
    const safeFilename = route.replace(/\//g, '_').replace(/_$/, '') || 'index';
    const filePath = path.join(downloadFolder, `${safeFilename}.html`);
    await fs.writeFile(filePath, html);
    console.log(`✅ Saved HTML: ${filePath}`);
  }

  await browser.close();
  console.log('🎉 All done.');
})();
