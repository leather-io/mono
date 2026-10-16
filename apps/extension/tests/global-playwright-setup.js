import { chromium } from '@playwright/test';
import dotenv from 'dotenv';

const testAppUrl = 'http://localhost:3000';

async function warmUpTestApp() {
  const browser = await chromium.launch({ channel: 'chromium' });
  const page = await browser.newPage();
  await page.goto(testAppUrl, { waitUntil: 'networkidle' });
  await browser.close();
}

export default async function globalSetup() {
  dotenv.config({
    path: '.env',
    override: true,
  });
  await warmUpTestApp();
}
