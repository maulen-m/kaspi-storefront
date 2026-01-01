import { expect, test } from "@playwright/test";

test("home loads without console errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(err.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });

  await page.goto("/");
  await expect(page.locator("text=ACMEWEAR")).toBeVisible();
  expect(errors).toEqual([]);
});

test("shop has Kaspi CTA", async ({ page }) => {
  await page.goto("/shop");
  const cta = page.locator("a[href^='/go/kaspi/']");
  await expect(cta.first()).toBeVisible();
});

test("product page has Kaspi CTA", async ({ page }) => {
  await page.goto("/p/performance-training-tee");
  const cta = page.locator("a[href^='/go/kaspi/']");
  await expect(cta.first()).toBeVisible();
});
