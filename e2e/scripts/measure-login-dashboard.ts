/**
 * Browser-level Login → Dashboard waterfall measurement.
 * Run: PLAYWRIGHT_BASE_URL=http://localhost:3000 npx tsx e2e/scripts/measure-login-dashboard.ts
 */
import { chromium, type Request, type Response } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const email = process.env.E2E_DOCTOR_EMAIL ?? "shresthjindal28@gmail.com";
const password = process.env.E2E_DOCTOR_PASSWORD ?? "AiroLocalDev123!";
const SAMPLES = 3;

type ApiEvent = {
  url: string;
  method: string;
  startMs: number;
  endMs: number;
  durationMs: number;
  status: number;
};

type RunResult = {
  loginClickToDashboardMs: number;
  loginClickToLoginApiEndMs: number;
  loginApiEndToPostAuthEndMs: number;
  postAuthEndToDashboardUrlMs: number;
  dashboardUrlToContentMs: number;
  apiEvents: ApiEvent[];
  navigationTiming: Record<string, number>;
};

function percentile(values: number[], p: number): number {
  if (!values.length) return 0;
  const s = [...values].sort((a, b) => a - b);
  const idx = Math.floor(p * (s.length - 1));
  return s[idx];
}

function normalizeUrl(url: string): string {
  return url.split("?")[0].replace(/.*\/api\/v1/, "/api/v1");
}

async function measureOnce(): Promise<RunResult> {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const apiEvents: ApiEvent[] = [];
  const requestStarts = new Map<Request, number>();
  const flowStart = Date.now();

  page.on("request", (req) => {
    if (req.url().includes("/api/v1/")) {
      requestStarts.set(req, Date.now() - flowStart);
    }
  });

  page.on("response", (res: Response) => {
    const req = res.request();
    if (!req.url().includes("/api/v1/")) return;
    const startMs = requestStarts.get(req) ?? 0;
    const endMs = Date.now() - flowStart;
    apiEvents.push({
      url: normalizeUrl(req.url()),
      method: req.method(),
      startMs,
      endMs,
      durationMs: endMs - startMs,
      status: res.status(),
    });
  });

  await page.goto(`${baseURL}/doctor/login`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /^sign in$/i }).waitFor({ state: "visible" });

  const loginClickAt = Date.now() - flowStart;
  await page.getByLabel(/^email$/i).fill(email);
  await page.getByLabel(/^password$/i).fill(password);

  const loginResponsePromise = page.waitForResponse(
    (res) =>
      res.url().includes("/api/v1/doctors/login") && res.request().method() === "POST",
    { timeout: 90_000 },
  );
  await page.getByRole("button", { name: /^sign in$/i }).click();
  await loginResponsePromise;

  await page.waitForURL(/dashboard/, { timeout: 90_000 });
  const dashboardUrlAt = Date.now() - flowStart;

  await page.getByRole("heading", { name: /today's practice/i }).waitFor({ timeout: 60_000 });
  const contentVisibleAt = Date.now() - flowStart;

  const loginClickToDashboardMs = contentVisibleAt - loginClickAt;

  const loginEvent = apiEvents.find(
    (e) => e.method === "POST" && e.url.includes("/doctors/login"),
  );
  const postAuthEvents = apiEvents.filter(
    (e) =>
      e.method === "GET" &&
      (e.url.endsWith("/doctors/me") || e.url.includes("/doctors/me/onboarding-status")),
  );
  const postAuthEndMs = postAuthEvents.length
    ? Math.max(...postAuthEvents.map((e) => e.endMs))
    : loginEvent?.endMs ?? loginClickAt;

  const loginClickToLoginApiEndMs = (loginEvent?.endMs ?? contentVisibleAt) - loginClickAt;
  const loginApiEndToPostAuthEndMs = Math.max(0, postAuthEndMs - (loginEvent?.endMs ?? loginClickAt));
  const postAuthEndToDashboardUrlMs = Math.max(0, dashboardUrlAt - postAuthEndMs);
  const dashboardUrlToContentMs = Math.max(0, contentVisibleAt - dashboardUrlAt);

  const navigationTiming = await page.evaluate(() => {
    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
    return {
      ttfbMs: nav.responseStart - nav.requestStart,
      domContentLoadedMs: nav.domContentLoadedEventEnd - nav.startTime,
      loadMs: nav.loadEventEnd - nav.startTime,
    };
  });

  await browser.close();

  return {
    loginClickToDashboardMs,
    loginClickToLoginApiEndMs,
    loginApiEndToPostAuthEndMs,
    postAuthEndToDashboardUrlMs,
    dashboardUrlToContentMs,
    apiEvents,
    navigationTiming,
  };
}

async function main() {
  const runs: RunResult[] = [];
  for (let i = 0; i < SAMPLES; i++) {
    console.log(`Run ${i + 1}/${SAMPLES}...`);
    runs.push(await measureOnce());
    if (i < SAMPLES - 1) {
      await new Promise((r) => setTimeout(r, 8000));
    }
  }

  const totals = runs.map((r) => r.loginClickToDashboardMs);
  const byEndpoint = new Map<string, number[]>();

  for (const run of runs) {
    for (const ev of run.apiEvents) {
      const key = `${ev.method} ${ev.url}`;
      if (!byEndpoint.has(key)) byEndpoint.set(key, []);
      byEndpoint.get(key)!.push(ev.durationMs);
    }
  }

  const phaseStats = (key: keyof RunResult) => {
    const vals = runs.map((r) => r[key] as number);
    return { p50: percentile(vals, 0.5), p95: percentile(vals, 0.95), p99: percentile(vals, 0.99), values: vals };
  };

  const report = {
    samples: SAMPLES,
    measuredAt: new Date().toISOString(),
    environment: "localhost:3000 → localhost:8000 → Neon Postgres",
    loginClickToDashboard: phaseStats("loginClickToDashboardMs"),
    phases: {
      loginClickToLoginApiEnd: phaseStats("loginClickToLoginApiEndMs"),
      loginApiEndToPostAuthEnd: phaseStats("loginApiEndToPostAuthEndMs"),
      postAuthEndToDashboardUrl: phaseStats("postAuthEndToDashboardUrlMs"),
      dashboardUrlToContent: phaseStats("dashboardUrlToContentMs"),
    },
    apiEndpoints: Object.fromEntries(
      [...byEndpoint.entries()].map(([k, v]) => [
        k,
        { p50: percentile(v, 0.5), p95: percentile(v, 0.95), p99: percentile(v, 0.99), samples: v },
      ]),
    ),
    avgNavigationTiming: {
      ttfbMs: runs.reduce((s, r) => s + r.navigationTiming.ttfbMs, 0) / runs.length,
      domContentLoadedMs:
        runs.reduce((s, r) => s + r.navigationTiming.domContentLoadedMs, 0) / runs.length,
    },
    runs,
  };

  const outDir = path.join(process.cwd(), "e2e-artifacts", "login-latency");
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "browser-waterfall.json"), JSON.stringify(report, null, 2));

  console.log("\n=== Login → Dashboard (browser) ===");
  console.log(`p50: ${report.loginClickToDashboard.p50}ms`);
  console.log(`p95: ${report.loginClickToDashboard.p95}ms`);
  console.log(`p99: ${report.loginClickToDashboard.p99}ms`);
  console.log("\n=== Phases ===");
  for (const [k, v] of Object.entries(report.phases)) {
    console.log(`${k}: p50=${v.p50}ms p95=${v.p95}ms`);
  }
  console.log("\n=== API endpoints ===");
  for (const [k, v] of Object.entries(report.apiEndpoints)) {
    const stats = v as { p50: number; p95: number };
    console.log(`${k}: p50=${stats.p50}ms p95=${stats.p95}ms`);
  }
}

void main();
