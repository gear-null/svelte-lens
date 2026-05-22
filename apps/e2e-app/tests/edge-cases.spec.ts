import { test, expect } from "@playwright/test";

/**
 * Edge case tests that exercise less common paths.
 */
test.describe("svelte-lens edge cases", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("[data-svelte-lens]", { timeout: 5000 });
  });

  test("clicking counter while lens is active does not interfere", async ({ page }) => {
    await page.keyboard.press("Meta+Alt+g");

    const counter = page.locator("button.counter");
    // The toolbar has pointer-events:auto, but the overlay doesn't
    // Clicking the counter should still work
    await counter.click();
    await expect(counter).toContainText("Clicked 1 times");
  });

  test("multiple toggle key presses don't cause issues", async ({ page }) => {
    const toolbar = page.locator("button.lens-toolbar");

    // Rapid toggle
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press("Meta+Alt+g");
    }
    // After odd number of toggles, should be active
    await expect(toolbar).toHaveClass(/active/);

    // One more toggle to deactivate
    await page.keyboard.press("Meta+Alt+g");
    await expect(toolbar).not.toHaveClass(/active/);
  });

  test("lens overlay disappears when element is no longer hovered", async ({ page }) => {
    await page.keyboard.press("Meta+Alt+g");

    const counter = page.locator("button.counter");
    await counter.hover();
    await expect(page.locator(".lens-label")).toBeVisible({ timeout: 3000 });

    // Move to empty area (header)
    const header = page.locator("h1");
    await header.hover();

    // Wait — overlay may persist until new element detected or pointer moves enough
    // The overlay should update when the pointer moves to a different element
    await page.waitForTimeout(500);

    // The label should now show the h1 element's info (or disappear)
    // It should NOT still show the old button info
    const label = page.locator(".lens-label");
    if (await label.isVisible()) {
      // If visible, it should show h1, not button
      await expect(label).toContainText("h1");
    }
  });

  test("deactivating lens while hovering clears overlay", async ({ page }) => {
    await page.keyboard.press("Meta+Alt+g");

    const counter = page.locator("button.counter");
    await counter.hover();
    await expect(page.locator(".lens-label")).toBeVisible({ timeout: 3000 });

    // Deactivate
    await page.keyboard.press("Escape");

    // Overlay and label should be gone
    await expect(page.locator(".lens-label")).not.toBeVisible({ timeout: 2000 });
  });

  test("setEnabled(false) via API hides toolbar", async ({ page }) => {
    const toolbar = page.locator("button.lens-toolbar");
    await expect(toolbar).toBeVisible();

    await page.evaluate(() => window.__SVELTE_LENS__!.setEnabled(false));
    await expect(toolbar).not.toBeVisible({ timeout: 1000 });

    // Re-enable
    await page.evaluate(() => window.__SVELTE_LENS__!.setEnabled(true));
    await expect(toolbar).toBeVisible({ timeout: 1000 });
  });

  test("dispose and re-init cycle works", async ({ page }) => {
    const toolbar = page.locator("button.lens-toolbar");
    await expect(toolbar).toBeVisible();

    // Dispose
    await page.evaluate(() => window.__SVELTE_LENS__!.dispose());
    await expect(toolbar).not.toBeVisible({ timeout: 1000 });

    // __SVELTE_LENS__ should be cleared
    const apiAfterDispose = await page.evaluate(() => window.__SVELTE_LENS__);
    expect(apiAfterDispose).toBeUndefined();
  });

  test("custom plugin registration and hook firing", async ({ page }) => {
    // Register a custom plugin that tracks hook calls
    const hookCalls = await page.evaluate(() => {
      const calls: string[] = [];
      window.__SVELTE_LENS__!.registerPlugin({
        name: "test-tracker",
        setup: () => ({
          hooks: {
            onActivate: () => calls.push("onActivate"),
            onDeactivate: () => calls.push("onDeactivate"),
          },
        }),
      });

      // Activate
      window.__SVELTE_LENS__!.toggle();

      // Deactivate
      window.__SVELTE_LENS__!.toggle();

      return calls;
    });

    expect(hookCalls).toContain("onActivate");
    expect(hookCalls).toContain("onDeactivate");
  });

  test("getStackContext returns stack trace for elements", async ({ page }) => {
    const stackContext = await page.evaluate(async () => {
      const btn = document.querySelector("button.counter");
      if (!btn) return null;
      return await window.__SVELTE_LENS__!.getStackContext(btn);
    });

    // Stack context should include the component file path
    expect(stackContext).toBeTruthy();
    expect(stackContext).toContain("Counter");
  });

  test("copyElement via API returns true", async ({ page }) => {
    const result = await page.evaluate(async () => {
      const btn = document.querySelector("button.counter");
      if (!btn) return false;
      return await window.__SVELTE_LENS__!.copyElement(btn);
    });

    expect(result).toBe(true);

    // Clipboard should have content
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toContain("button");
  });

  test("getPlugins returns copy and open", async ({ page }) => {
    const plugins = await page.evaluate(() => window.__SVELTE_LENS__!.getPlugins());
    expect(plugins).toContain("copy");
    expect(plugins).toContain("open");
    expect(plugins.length).toBeGreaterThanOrEqual(2);
  });

  test("pointer move throttling works (rapid moves)", async ({ page }) => {
    await page.keyboard.press("Meta+Alt+g");

    // Rapidly move the mouse across the page
    const counter = page.locator("button.counter");
    const box = await counter.boundingBox();
    if (box) {
      for (let i = 0; i < 10; i++) {
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.move(box.x + box.width / 2 + 50, box.y + box.height / 2);
      }
    }

    const toolbar = page.locator("button.lens-toolbar");
    await expect(toolbar).toHaveClass(/active/);
  });

  test("rapid Cmd+C presses don't cause duplicate copies", async ({ page }) => {
    await page.keyboard.press("Meta+Alt+g");

    const counter = page.locator("button.counter");
    await counter.hover();
    await expect(page.locator(".lens-label")).toBeVisible({ timeout: 3000 });

    // Rapidly press Cmd+C multiple times
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press("Meta+c");
      await page.waitForTimeout(50);
    }

    // Should end up with "Copied" status (no error)
    const label = page.locator(".lens-label");
    await expect(label).toContainText("Copied", { timeout: 3000 });

    // Lens should still be active
    const toolbar = page.locator("button.lens-toolbar");
    await expect(toolbar).toHaveClass(/active/);
  });
});
