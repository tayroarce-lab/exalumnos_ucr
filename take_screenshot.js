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

  const url = 'https://stitch.withgoogle.com/preview/5082321616940231714?node-id=eb1ec0e2fda345d7911a6761f6031b88&raw=1';
  console.log(`Navigating to ${url}...`);
  await page.goto(url, { waitUntil: 'networkidle' });

  console.log('Waiting 10 seconds for dynamic content...');
  await page.waitForTimeout(10000);

  const screenshotPath = path.join('c:', 'Users', 'fwdco', 'Downloads', 'exalumnos_ucr', 'stitch_preview.png');
  console.log(`Saving screenshot to ${screenshotPath}...`);
  await page.screenshot({ path: screenshotPath, fullPage: true });

  console.log('Done!');
  await browser.close();
}

main().catch(err => {
  console.error('Error during screenshot capture:', err);
  process.exit(1);
});
