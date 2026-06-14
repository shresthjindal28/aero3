/**
 * Authenticated route performance via Playwright (Lighthouse cannot access localStorage auth).
 * Run: PLAYWRIGHT_BASE_URL=http://localhost:3000 npx tsx e2e/scripts/perf-routes.ts
 */
import { chromium } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const email = process.env.E2E_DOCTOR_EMAIL ?? "shresthjindal28@gmail.com";
const password = process.env.E2E_DOCTOR_PASSWORD ?? "AiroLocalDev123!";

const routes = [
  { name: "Dashboard", path: "/dashboard", ready: "Today's practice" },
  { name: "Patients", path: "/patients", ready: "Patients" },
  { name: "Consultations", path: "/consultations", ready: "Visits" },
];

type PerfRow = {
  route: string;
  path: string;
  ttfbMs: number;
  domContentLoadedMs: number;
  loadMs: number;
  apiCalls: number;
  transferBytes: number;
};

async function login(page: import("@playwright/test").Page) {
  await page.goto(`${baseURL}/doctor/login`);
  await page.getByLabel(/^email$/i).fill(email);
  await page.getByLabel(/^password$/i).fill(password);
  await page.getByRole("button", { name: /^sign in$/i }).click();
  await page.waitForURL(/dashboard/, { timeout: 30_000 });
}

async function measureRoute(
  page: import("@playwright/test").Page,
  route: (typeof routes)[0],
): Promise<PerfRow> {
  const apiCalls: { size: number }[] = [];
  const onResponse = (res: import("@playwright/test").Response) => {
    if (res.url().includes("/api/v1/")) {
      void res.body().then((b) => apiCalls.push({ size: b.length })).catch(() => {
        apiCalls.push({ size: 0 });
      });
    }
  };
  page.on("response", onResponse);

  const start = Date.now();
  await page.goto(`${baseURL}${route.path}`, { waitUntil: "domcontentloaded" });
  await page.getByText(route.ready, { exact: false }).first().waitFor({ timeout: 20_000 });
  const elapsed = Date.now() - start;

  const nav = await page.evaluate(() => {
    const n = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
    return {
      ttfbMs: n.responseStart - n.requestStart,
      domContentLoadedMs: n.domContentLoadedEventEnd - n.startTime,
      loadMs: n.loadEventEnd - n.startTime,
    };
  });

  page.off("response", onResponse);

  return {
    route: route.name,
    path: route.path,
    ttfbMs: Math.round(nav.ttfbMs),
    domContentLoadedMs: Math.round(nav.domContentLoadedMs),
    loadMs: Math.round(nav.loadMs || elapsed),
    apiCalls: apiCalls.length,
    transferBytes: apiCalls.reduce((sum, r) => sum + r.size, 0),
  };
}

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  await login(page);

  const results: PerfRow[] = [];
  for (const route of routes) {
    results.push(await measureRoute(page, route));
  }

  // Session workspace if any session exists
  await page.goto(`${baseURL}/consultations`);
  const sessionLink = page.locator('a[href*="/sessions/"]').first();
  if (await sessionLink.count()) {
    const href = await sessionLink.getAttribute("href");
    if (href) {
      results.push(
        await measureRoute(page, {
          name: "Session Workspace",
          path: href,
          ready: "Transcript",
        }),
      );
    }
  }

  const outDir = path.join(process.cwd(), "e2e-artifacts", "phase-a");
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "perf-routes.json"), JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
  await browser.close();
}

void main();
