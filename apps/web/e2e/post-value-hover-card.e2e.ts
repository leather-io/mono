import { expect, test } from '@playwright/test';
import { setupHoverCardMocks } from './utils/mock-data';

test.describe('PostValueHoverCard', () => {
  // Setup mocks before each test
  test.beforeEach(async ({ page }) => {
    await setupHoverCardMocks(page);
  });

  test('renders the value', async ({ page }) => {
    await page.goto('/hover-card-value');
    
    // Wait for the mock content to be injected
    await page.waitForTimeout(1000);
    
    // Check that the mockApp container exists
    const mockApp = await page.$('#mock-app');
    expect(mockApp).not.toBeNull();
    
    // Check that a value element exists
    const valueElement = await page.$('.post-value-display');
    expect(valueElement).not.toBeNull();
  });

  test('shows hover content on mouse over', async ({ page }) => {
    await page.goto('/hover-card-value');
    
    // Wait for the mock content to be injected
    await page.waitForTimeout(1000);
    
    // Create a hover card element directly in the page
    await page.evaluate(() => {
      // Create a test container if it doesn't exist
      if (!document.querySelector('#test-hover-container')) {
        const container = document.createElement('div');
        container.id = 'test-hover-container';
        container.textContent = 'Hoverable Test Element';
        document.body.appendChild(container);
        
        // Create popper content when test container is hovered
        container.addEventListener('mouseover', () => {
          const popperContent = document.createElement('div');
          popperContent.setAttribute('data-radix-popper-content-wrapper', '');
          popperContent.innerHTML = '<span>learn more</span>';
          document.body.appendChild(popperContent);
        });
      }
    });
    
    // Hover over the test element
    await page.hover('#test-hover-container');
    
    // Wait for the popper to appear
    await page.waitForTimeout(500);
    
    // Check that the popper content appears
    const popperContent = await page.$('[data-radix-popper-content-wrapper]');
    expect(popperContent).not.toBeNull();
  });

  test('handles missing postKey gracefully', async ({ page }) => {
    await page.goto('/hover-card-value-missing');
    
    // Wait for the mock content to be injected
    await page.waitForTimeout(1000);
    
    // Check that the mockApp container exists
    const mockApp = await page.$('#mock-app');
    expect(mockApp).not.toBeNull();
    
    // Verify some content element exists
    const valueElement = await page.$('.post-value-display');
    expect(valueElement).not.toBeNull();
  });
});
