import { test, expect } from "@playwright/test";

/**
 * Visual/manual verification tests that capture screenshots
 * to verify the overlay UI renders correctly.
 */
test.describe("svelte-lens visual verification", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("[data-svelte-lens]", { timeout: 5000 });
  });

  test("toolbar renders in bottom-right corner", async ({ page }) => {
    const toolbar = page.locator("button.lens-toolbar");
    await expect(toolbar).toBeVisible();

    // Take screenshot of the toolbar area
    await page.screenshot({
      path: "test-results/toolbar-idle.png",
      clip: { x: 1100, y: 600, width: 180, height: 80 },
    });
  });

  test("active toolbar shows green dot", async ({ page }) => {
    await page.keyboard.press("Meta+Alt+g");

    const toolbar = page.locator("button.lens-toolbar");
    await expect(toolbar).toHaveClass(/active/);

    await page.screenshot({
      path: "test-results/toolbar-active.png",
      clip: { x: 1100, y: 600, width: 180, height: 80 },
    });
  });

  test("overlay renders on hover over button", async ({ page }) => {
    await page.keyboard.press("Meta+Alt+g");

    const counter = page.locator("button.counter");
    await counter.hover();
    await page.waitForTimeout(200);

    // Take screenshot of the main content area with overlay
    const box = await counter.boundingBox();
    if (box) {
      await page.screenshot({
        path: "test-results/overlay-on-button.png",
        clip: {
          x: Math.max(box.x - 20, 0),
          y: Math.max(box.y - 40, 0),
          width: box.width + 40,
          height: box.height + 60,
        },
      });
    }

    // Label should show tag name and component name
    const label = page.locator(".lens-label");
    await expect(label).toBeVisible({ timeout: 3000 });
  });

  test("overlay renders on hover over card", async ({ page }) => {
    await page.keyboard.press("Meta+Alt+g");

    const card = page.locator("article.card").first();
    await card.hover();
    await page.waitForTimeout(200);

    const box = await card.boundingBox();
    if (box) {
      await page.screenshot({
        path: "test-results/overlay-on-card.png",
        clip: {
          x: Math.max(box.x - 20, 0),
          y: Math.max(box.y - 40, 0),
          width: box.width + 40,
          height: box.height + 60,
        },
      });
    }

    const label = page.locator(".lens-label");
    await expect(label).toBeVisible({ timeout: 3000 });
  });

  test("copied status shows green indicator", async ({ page }) => {
    await page.keyboard.press("Meta+Alt+g");

    const counter = page.locator("button.counter");
    await counter.hover();
    await expect(page.locator(".lens-label")).toBeVisible({ timeout: 3000 });

    await page.keyboard.press("Meta+c");

    // Wait for "Copied" status
    await expect(page.locator(".lens-label")).toContainText("Copied", { timeout: 3000 });

    await page.screenshot({
      path: "test-results/copied-status.png",
      clip: { x: 0, y: 0, width: 400, height: 200 },
    });
  });

  test("context menu renders with Copy and Open actions", async ({ page }) => {
    await page.keyboard.press("Meta+Alt+g");

    const counter = page.locator("button.counter");
    await counter.hover();
    await expect(page.locator(".lens-label")).toBeVisible({ timeout: 3000 });

    await counter.click({ button: "right" });

    const menu = page.locator(".lens-menu");
    await expect(menu).toBeVisible({ timeout: 3000 });

    await page.screenshot({
      path: "test-results/context-menu.png",
      clip: { x: 0, y: 0, width: 300, height: 300 },
    });

    // Menu should have Copy and Open items
    await expect(menu.locator("text=Copy")).toBeVisible();
    await expect(menu.locator("text=Open")).toBeVisible();
  });
});
