
import { test, expect } from '@playwright/test';

test('verify image only mode', async ({ page }) => {
    // 1. Navigate to the app
    await page.goto('http://localhost:3000');

    // 2. Create a new campaign (Modal)
    // Wait for the "Create Campaign" button or similar entry point
    await page.waitForSelector('button:has-text("Create Campaign")', { timeout: 10000 });
    await page.click('button:has-text("Create Campaign")');

    // Select "Modal" nudge type
    await page.waitForSelector('text=Modal', { timeout: 5000 });
    await page.click('text=Modal');

    // 3. Wait for the editor to load
    await page.waitForSelector('text=Modal Mode', { timeout: 10000 });

    // 4. Select "Image Only" mode
    // The button has "Image Only" text inside it
    const imageOnlyBtn = page.locator('button:has-text("Image Only")');
    await imageOnlyBtn.click();

    // 5. Verify the modal container styles
    // The modal container is the div with ref={containerRef} in ModalRenderer
    // It has z-index: 1 and position: absolute
    // We can find it by its style properties or by adding a data-testid if needed.
    // For now, let's look for the element that has the modal content.

    // Wait for a moment for state to update
    await page.waitForTimeout(1000);

    // We need to find the modal container. It's likely the one with z-index: 1 and fixed/absolute position in the preview area.
    // The preview area is usually an iframe or a specific container.
    // Based on DesignStep.tsx, it renders ModalRenderer directly.

    // Let's try to find the element that *should* be transparent.
    // It's the one containing the "No Modal Layer Found" text if it fails, or the child layers.
    // But we just created it, so it should have layers.

    // Let's look for the container that has 'box-shadow: none' and 'background-color: transparent'.
    // We can evaluate the styles of the modal container.

    // We'll select the element that looks like the modal container.
    // It has `transform: translate(-50%, -50%)`
    const modalContainer = page.locator('div[style*="translate(-50%, -50%)"]');

    await expect(modalContainer).toBeVisible();

    const backgroundColor = await modalContainer.evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor;
    });

    const boxShadow = await modalContainer.evaluate((el) => {
        return window.getComputedStyle(el).boxShadow;
    });

    console.log('Background Color:', backgroundColor);
    console.log('Box Shadow:', boxShadow);

    // Expect transparent (rgba(0, 0, 0, 0)) and none
    expect(backgroundColor).toBe('rgba(0, 0, 0, 0)');
    expect(boxShadow).toBe('none');

});
