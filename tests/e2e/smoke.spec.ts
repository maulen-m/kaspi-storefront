import { expect, test } from "@playwright/test";

test("home loads without console errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(err.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });

  await page.goto("/");
  await expect(page.getByRole("link", { name: "ACMEWEAR home" })).toBeVisible();
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

test("landing has Kaspi CTA and countdown", async ({ page }) => {
  await page.goto("/l/launch");
  const cta = page.locator("a[href^='/go/kaspi/']");
  await expect(cta.first()).toBeVisible();
  await expect(page.locator("[data-countdown]")).toBeVisible();
});
