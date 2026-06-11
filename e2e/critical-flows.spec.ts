import { expect, test } from "@playwright/test";

const doctorEmail = process.env.E2E_DOCTOR_EMAIL;
const doctorPassword = process.env.E2E_DOCTOR_PASSWORD;

test.describe("Doctor critical flows", () => {
  test.skip(!doctorEmail || !doctorPassword, "Set E2E_DOCTOR_EMAIL and E2E_DOCTOR_PASSWORD");

  test.beforeEach(async ({ page }) => {
    await page.goto("/doctor/login");
    await page.getByLabel(/email/i).fill(doctorEmail!);
    await page.getByLabel(/password/i).fill(doctorPassword!);
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page).toHaveURL(/dashboard/);
  });

  test("navigate patients list", async ({ page }) => {
    await page.goto("/patients");
    await expect(page.getByRole("heading", { name: /patients/i })).toBeVisible();
  });

  test("open command palette", async ({ page }) => {
    await page.keyboard.press(process.platform === "darwin" ? "Meta+K" : "Control+K");
    await expect(page.getByRole("dialog", { name: /command palette/i })).toBeVisible();
  });
});
