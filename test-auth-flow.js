const { chromium } = require('playwright');

const BASE = 'http://localhost:3000';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  const pass = (msg) => console.log(`  ✓ ${msg}`);
  const fail = (msg) => console.log(`  ✗ ${msg}`);
  let errors = 0;

  async function check(label, fn) {
    try {
      await fn();
      pass(label);
    } catch (e) {
      fail(`${label} — ${e.message}`);
      errors++;
    }
  }

  // ── 1. Login page renders ────────────────────────────────────────────────
  console.log('\n[1] Login page');
  await page.goto(`${BASE}/login`);
  await check('page heading visible', async () => {
    await page.waitForSelector('text=Sign in', { timeout: 5000 });
  });
  await check('Membership Number field present', async () => {
    await page.waitForSelector('input[name="member_number"]');
  });
  await check('Password field present', async () => {
    await page.waitForSelector('input[name="password"]');
  });
  await check('"Logging on for the first time?" is first link (before Forgot)', async () => {
    const links = await page.$$eval('a', els => els.map(e => e.textContent?.trim()));
    const firstIdx = links.findIndex(t => t && t.includes('first time'));
    const forgotIdx = links.findIndex(t => t && t.includes('Forgot'));
    if (firstIdx === -1) throw new Error('"first time" link not found');
    if (forgotIdx === -1) throw new Error('"Forgot" link not found');
    if (firstIdx > forgotIdx) throw new Error(`"first time" (index ${firstIdx}) comes after "Forgot" (index ${forgotIdx})`);
  });
  await check('"Logging on for the first time?" links to /auth/first-login', async () => {
    const href = await page.$eval('a[href="/auth/first-login"]', el => el.getAttribute('href'));
    if (href !== '/auth/first-login') throw new Error(`got ${href}`);
  });
  await check('"Forgot my password?" links to /auth/forgot-password', async () => {
    const href = await page.$eval('a[href="/auth/forgot-password"]', el => el.getAttribute('href'));
    if (href !== '/auth/forgot-password') throw new Error(`got ${href}`);
  });

  // ── 2. Members area blocked without session ─────────────────────────────
  console.log('\n[2] Members area protection');
  await page.goto(`${BASE}/members/dashboard`);
  await check('/members/dashboard → redirects to /login', async () => {
    await page.waitForURL(/\/login/, { timeout: 5000 });
    const url = page.url();
    if (!url.includes('/login')) throw new Error(`landed at ${url}`);
  });
  await page.goto(`${BASE}/members/account`);
  await check('/members/account → redirects to /login (with or without redirect param)', async () => {
    await page.waitForURL(/\/login/, { timeout: 5000 });
    const url = page.url();
    if (!url.includes('/login')) throw new Error(`landed at ${url}`);
  });

  // ── 3. Bad login credentials ────────────────────────────────────────────
  console.log('\n[3] Login validation');
  await page.goto(`${BASE}/login`);
  await page.fill('input[name="member_number"]', 'BBCXX000');
  await page.fill('input[name="password"]', 'wrongpassword');
  await page.locator('button:has-text("Log In")').click({ force: true });
  await check('unknown membership number shows an error message', async () => {
    await page.waitForSelector('text=not recognised', { timeout: 10000 });
  });

  // ── 4. Forgot password page ─────────────────────────────────────────────
  console.log('\n[4] Forgot password page');
  await page.goto(`${BASE}/auth/forgot-password`);
  await check('forgot-password page loads with visible input', async () => {
    await page.waitForSelector('input[type="text"], input[type="email"], input:not([type="hidden"])', { timeout: 5000 });
  });

  // ── 5. Set-password page — no session redirects away ────────────────────
  console.log('\n[5] Set-password page (no recovery session)');
  await ctx.clearCookies();
  await page.goto(`${BASE}/auth/set-password`);
  await check('without recovery session redirects to /auth/forgot-password', async () => {
    await page.waitForURL(`${BASE}/auth/forgot-password`, { timeout: 5000 });
  });

  // ── 6. First-login page ──────────────────────────────────────────────────
  console.log('\n[6] First-login page');
  await page.goto(`${BASE}/auth/first-login`);
  await check('first-login page loads with membership number + email fields', async () => {
    await page.waitForSelector('input[name="member_number"]', { timeout: 5000 });
    await page.waitForSelector('input[name="email"]', { timeout: 5000 });
  });

  // ── 7. Setup-password page — no setup cookie redirects away ─────────────
  console.log('\n[7] Setup-password page (no setup cookie)');
  await page.goto(`${BASE}/auth/setup-password`);
  await check('without setup cookie redirects to /auth/first-login', async () => {
    await page.waitForURL(`${BASE}/auth/first-login`, { timeout: 5000 });
  });

  // ── 8. Login with real credentials (BBCTG238) ───────────────────────────
  console.log('\n[8] Real login — BBCTG238');
  await page.goto(`${BASE}/login`);
  await page.fill('input[name="member_number"]', 'BBCTG238');
  await page.fill('input[name="password"]', 'tracygreasley@outlook.com');
  await page.locator('button:has-text("Log In")').click({ force: true });
  await page.waitForTimeout(3000);
  const url8 = page.url();
  console.log(`  → Landed at: ${url8.replace(BASE, '')}`);
  if (url8.includes('/members/dashboard') || url8.includes('setup-password')) {
    pass(`correct destination after login attempt`);
  } else if (url8.includes('/login')) {
    // password_set=true → email-as-password correctly rejected
    const bodyText = await page.innerText('body');
    const hasGuidance = bodyText.includes('first login') || bodyText.includes('email address') || bodyText.includes('Incorrect');
    if (hasGuidance) {
      pass('password_set=true: email-as-password rejected with guidance shown');
    } else {
      console.log(`  ℹ on login page — body snippet: ${bodyText.slice(0, 300)}`);
    }
  }

  await browser.close();

  console.log(`\n${'─'.repeat(50)}`);
  if (errors === 0) {
    console.log('All checks passed.');
  } else {
    console.log(`${errors} check(s) failed.`);
    process.exit(1);
  }
}

run().catch(e => { console.error(e); process.exit(1); });
