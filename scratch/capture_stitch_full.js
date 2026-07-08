const { chromium } = require('playwright-core');
const path = require('path');

async function main() {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 3000 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  const url = 'https://stitch.withgoogle.com/preview/2772129476818210181?node-id=10e2f142ad464244933423f5331c531d';
  console.log(`Navigating to ${url}...`);
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });

  console.log('Waiting 15 seconds...');
  await page.waitForTimeout(15000);

  // Try to scroll within the preview iframe or container
  await page.evaluate(() => {
    const containers = document.querySelectorAll('iframe');
    containers.forEach(iframe => {
      try {
        iframe.contentWindow.scrollTo(0, 5000);
      } catch(e) {}
    });
    // Also try scrolling any overflow container
    document.querySelectorAll('*').forEach(el => {
      if (el.scrollHeight > el.clientHeight + 100) {
        el.scrollTo(0, el.scrollHeight);
      }
    });
  });

  await page.waitForTimeout(2000);

  const screenshotPath = path.join(__dirname, '..', 'stitch_student_design_full.png');
  console.log(`Saving screenshot to ${screenshotPath}...`);
  await page.screenshot({ path: screenshotPath, fullPage: true });

  console.log('Done!');
  await browser.close();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
