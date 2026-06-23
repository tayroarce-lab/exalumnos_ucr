const { chromium } = require('playwright-core');
const path = require('path');

async function main() {
  console.log('Launching browser...');
  const browser = await chromium.launch({
    headless: true,
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1200 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err));

  console.log('Navigating to login page...');
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });

  console.log('Filling login form...');
  await page.waitForSelector('#login-email');
  await page.fill('#login-email', 'ana.guerrero@ucr.ac.cr');
  await page.fill('#login-password', 'UCRAlumni2026!');

  console.log('Submitting form...');
  await Promise.all([
    page.click('#login-submit-button'),
    page.waitForNavigation({ waitUntil: 'networkidle' })
  ]);

  console.log('Current URL after login:', page.url());

  const targetUrl = 'http://localhost:3000/network/e8000001-0000-0000-0000-000000000001';
  console.log(`Navigating to profile page: ${targetUrl}...`);
  await page.goto(targetUrl, { waitUntil: 'networkidle' });

  console.log('Waiting 5 seconds for page assets to load...');
  await page.waitForTimeout(5000);

  const screenshotPath = path.join('c:', 'Users', 'fwdco', 'Downloads', 'exalumnos_ucr', 'profile_redesign_preview.png');
  console.log(`Saving screenshot to ${screenshotPath}...`);
  await page.screenshot({ path: screenshotPath, fullPage: true });

  console.log('Done!');
  await browser.close();
}

main().catch(err => {
  console.error('Error during screenshot capture:', err);
  process.exit(1);
});
