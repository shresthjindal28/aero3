import { expect, test } from "@playwright/test";

test.describe("Public auth pages", () => {
  test("doctor login page loads", async ({ page }) => {
    await page.goto("/doctor/login");
    await expect(
      page.getByRole("heading", { name: /sign in to your workspace/i }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  test("admin login page loads", async ({ page }) => {
    await page.goto("/admin/login");
    await expect(page.getByRole("heading", { name: /admin sign in/i })).toBeVisible();
  });
});

test.describe("Protected routes redirect", () => {
  test("dashboard redirects unauthenticated users", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/login/);
  });

  test("patients redirects unauthenticated users", async ({ page }) => {
    await page.goto("/patients");
    await expect(page).toHaveURL(/login/);
  });
});
