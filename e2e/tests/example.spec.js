const { test, expect } = require("@playwright/test");

test("frontend is reachable", async ({ page }) => {
  await page.goto("http://localhost:3000");
  await expect(page).toHaveTitle(/frontend/); // замените на реальный title
});
