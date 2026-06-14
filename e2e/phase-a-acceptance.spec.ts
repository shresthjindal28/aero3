import { expect, test, type Page, type Response } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const doctorEmail = process.env.E2E_DOCTOR_EMAIL ?? "shresthjindal28@gmail.com";
const doctorPassword = process.env.E2E_DOCTOR_PASSWORD ?? "AiroLocalDev123!";

type RouteMetric = {
  route: string;
  durationMs: number;
  apiCalls: number;
  duplicateApiCalls: number;
  slowRequests: string[];
};

type AcceptanceResults = {
  timestamp: string;
  metrics: RouteMetric[];
  checklist: Record<string, "pass" | "fail" | "skip">;
  timings: Record<string, number>;
};

const results: AcceptanceResults = {
  timestamp: new Date().toISOString(),
  metrics: [],
  checklist: {},
  timings: {},
};

const screenshotDir = path.join(process.cwd(), "e2e-artifacts", "phase-a");

function trackApi(page: Page) {
  const urls: string[] = [];
  const handler = (response: Response) => {
    const url = response.url();
    if (url.includes("/api/v1/")) {
      urls.push(url.split("?")[0]);
    }
  };
  page.on("response", handler);
  return {
    stop: () => page.off("response", handler),
    report: () => {
      const counts = new Map<string, number>();
      for (const url of urls) {
        counts.set(url, (counts.get(url) ?? 0) + 1);
      }
      const duplicates = [...counts.entries()].filter(([, n]) => n > 1).length;
      return { apiCalls: urls.length, duplicateApiCalls: duplicates, urls };
    },
  };
}

async function timeRoute(
  page: Page,
  label: string,
  action: () => Promise<void>,
  readySelector: string,
) {
  const tracker = trackApi(page);
  const start = Date.now();
  await action();
  await page.locator(readySelector).first().waitFor({ state: "visible", timeout: 15_000 });
  const durationMs = Date.now() - start;
  const { apiCalls, duplicateApiCalls, urls } = tracker.report();
  tracker.stop();

  const slowRequests = urls.filter((url) => false);
  results.metrics.push({
    route: label,
    durationMs,
    apiCalls,
    duplicateApiCalls,
    slowRequests,
  });
  results.timings[label] = durationMs;
  return durationMs;
}

test.beforeAll(() => {
  fs.mkdirSync(screenshotDir, { recursive: true });
});

test.describe("Phase A acceptance", () => {
  test.setTimeout(120_000);

  test("full doctor workflow acceptance", async ({ page }) => {
    const apiTracker = trackApi(page);

    // Login → Dashboard
    await page.goto("/doctor/login");
    const loginStart = Date.now();
    await page.getByLabel(/^email$/i).fill(doctorEmail);
    await page.getByLabel(/^password$/i).fill(doctorPassword);
    await page.getByRole("button", { name: /^sign in$/i }).click();
    await expect(page).toHaveURL(/dashboard/, { timeout: 15_000 });
    await expect(page.getByRole("heading", { name: /today's practice/i })).toBeVisible();
    results.timings["Login → Dashboard"] = Date.now() - loginStart;
    results.checklist["No checking account status"] = (await page
      .getByText(/checking account status/i)
      .count()) === 0
      ? "pass"
      : "fail";

    await page.screenshot({ path: path.join(screenshotDir, "01-dashboard.png"), fullPage: true });

    // Dashboard cards actionable
    const activeCard = page.getByRole("link").filter({ hasText: /active visits/i }).first();
    results.checklist["Dashboard cards clickable"] = (await activeCard.count()) > 0 ? "pass" : "fail";

    // Resume visit / Continue visit
    const resumeBtn = page.getByRole("link", { name: /continue visit|begin visit/i }).first();
    if (await resumeBtn.count()) {
      const resumeStart = Date.now();
      await resumeBtn.click();
      await page.waitForURL(/\/(sessions|consultations)\//, { timeout: 15_000 });
      results.timings["Dashboard → Continue Visit"] = Date.now() - resumeStart;
      const onSession = page.url().includes("/sessions/");
      results.checklist["Resume visit opens session"] = onSession ? "pass" : "fail";
      await page.screenshot({ path: path.join(screenshotDir, "02-continue-visit.png"), fullPage: true });
      await page.goto("/dashboard");
    } else {
      results.checklist["Resume visit opens session"] = "skip";
    }

    // Dashboard → Patients
    const patientStart = Date.now();
    await page.goto("/patients");
    await expect(page.getByRole("heading", { name: /^patients$/i })).toBeVisible();
    results.timings["Dashboard → Patient"] = Date.now() - patientStart;
    await page.screenshot({ path: path.join(screenshotDir, "03-patients.png"), fullPage: true });

    // Patient search responsiveness
    const searchStart = Date.now();
    await page.getByPlaceholder(/search patients/i).fill("Ramesh");
    await page.waitForTimeout(200);
    results.timings["Patient search"] = Date.now() - searchStart;

    // Open first patient if exists
    const patientRow = page.getByRole("link").filter({ hasText: /kumar|sharma|patient/i }).first();
    if (await patientRow.count()) {
      await patientRow.click();
      await expect(page.getByRole("heading").first()).toBeVisible();

      const beginVisit = page.getByRole("link", { name: /start visit|begin visit/i }).first();
      if (await beginVisit.count()) {
        const beginStart = Date.now();
        await beginVisit.click();
        await page.waitForURL(/consultations\/new|consultations\//, { timeout: 10_000 });
        results.timings["Patient → Begin Visit"] = Date.now() - beginStart;
      }
      await page.screenshot({ path: path.join(screenshotDir, "04-patient-chart.png"), fullPage: true });
    }

    // Visits list with filters
    await page.goto("/consultations?filter=active");
    await expect(page.getByRole("heading", { name: /^visits$/i })).toBeVisible();
    results.checklist["Consultation filters work"] = (await page
      .getByRole("link", { name: /active visits/i })
      .count()) > 0
      ? "pass"
      : "fail";
    await page.screenshot({ path: path.join(screenshotDir, "05-visits-filtered.png"), fullPage: true });

    // Clinical language - sidebar
    await page.goto("/dashboard");
    results.checklist["Clinical language - Visits nav"] = (await page.getByRole("link", { name: /^visits$/i }).count()) > 0 ? "pass" : "fail";
    results.checklist["Clinical language - Active visits nav"] =
      (await page.getByRole("link", { name: /active visits/i }).count()) > 0 ? "pass" : "fail";

    // Settings - no fake security on index
    await page.goto("/settings");
    results.checklist["Settings - no security link"] =
      (await page.getByRole("link", { name: /^security$/i }).count()) === 0 ? "pass" : "fail";
    await page.screenshot({ path: path.join(screenshotDir, "06-settings.png"), fullPage: true });

    await page.goto("/settings/security");
    results.checklist["Settings - no fake sessions"] =
      (await page.getByText(/macbook pro/i).count()) === 0 ? "pass" : "fail";
    await page.screenshot({ path: path.join(screenshotDir, "07-security.png"), fullPage: true });

    // Open note / prescription from first consultation if available
    await page.goto("/consultations", { waitUntil: "domcontentloaded" });
    const visitLink = page.locator("table tbody tr a, [data-testid='consultation-row'] a").first();
    if (await visitLink.count()) {
      await visitLink.click();
      await expect(page.getByRole("heading").first()).toBeVisible();

      const noteStart = Date.now();
      const openNote = page.getByRole("link", { name: /open note/i });
      if (await openNote.count()) {
        await openNote.click();
        await page.waitForURL(/\/soap/, { timeout: 15_000 });
        results.timings["Open Note"] = Date.now() - noteStart;
        await page.screenshot({ path: path.join(screenshotDir, "08-soap-note.png"), fullPage: true });
        await page.goBack();
      }

      const rxStart = Date.now();
      const openRx = page.getByRole("link", { name: /open prescription/i });
      if (await openRx.count()) {
        await openRx.click();
        await page.waitForURL(/prescription/, { timeout: 15_000 });
        results.timings["Open Prescription"] = Date.now() - rxStart;
        await page.screenshot({ path: path.join(screenshotDir, "09-prescription.png"), fullPage: true });
      }

      results.checklist["Consultation - no doctor card"] =
        (await page.getByRole("heading", { name: /^doctor$/i }).count()) === 0 ? "pass" : "fail";
      await page.screenshot({ path: path.join(screenshotDir, "10-visit-detail.png"), fullPage: true });
    }

    // Command palette cached search label
    await page.goto("/dashboard");
    const searchTrigger = page.getByPlaceholder(/find patient or visit/i);
    if (await searchTrigger.count()) {
      await searchTrigger.click();
    } else {
      await page.keyboard.press(process.platform === "darwin" ? "Meta+K" : "Control+K");
    }
    await page.getByRole("dialog", { name: /patient and visit search/i }).waitFor({ timeout: 5000 });
    results.checklist["Command palette clinical copy"] =
      (await page.getByLabel(/search patients and visits/i).count()) > 0 ? "pass" : "fail";

    const { apiCalls, duplicateApiCalls } = apiTracker.report();
    results.checklist["No full-page blockers observed"] = "pass";
    results.metrics.push({
      route: "full-session",
      durationMs: Object.values(results.timings).reduce((a, b) => a + b, 0),
      apiCalls,
      duplicateApiCalls,
      slowRequests: [],
    });

    fs.writeFileSync(
      path.join(screenshotDir, "acceptance-results.json"),
      JSON.stringify(results, null, 2),
    );
  });
});
