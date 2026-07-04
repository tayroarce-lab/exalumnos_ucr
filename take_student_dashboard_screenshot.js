const { chromium } = require('playwright-core');
const path = require('path');

async function main() {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1200 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  });
  const page = await context.newPage();

  // Login
  console.log('Navigating to login...');
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForSelector('#login-email', { timeout: 10000 });
  await page.fill('#login-email', 'estudiante1@ucr.ac.cr');
  await page.fill('#login-password', 'UCRAlumni2026!');
  
  console.log('Submitting login...');
  await page.click('#login-submit-button');
  await page.waitForTimeout(4000);

  // Navigate to student dashboard
  console.log('Navigating to student-dashboard...');
  await page.goto('http://localhost:3000/student-dashboard', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(5000);

  console.log('Current URL:', page.url());

  const screenshotPath = path.join(__dirname, 'student_redesign_preview.png');
  console.log(`Saving screenshot to ${screenshotPath}...`);
  await page.screenshot({ path: screenshotPath, fullPage: true });

  console.log('Done!');
  await browser.close();
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
