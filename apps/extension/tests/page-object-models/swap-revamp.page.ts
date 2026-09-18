import { Locator, Page, expect } from '@playwright/test';
import { SwapRevampSelectors } from '@tests/selectors/swap-revamp.selectors';

export class SwapRevampPage {
  readonly page: Page;
  readonly amountInput: Locator;
  readonly continueBtn: Locator;
  readonly confirmBtn: Locator;
  readonly reviewSummary: Locator;
  readonly submissionStatus: Locator;
  readonly baseAssetTrigger: Locator;
  readonly targetAssetTrigger: Locator;
  readonly selectedAssetSymbols: Locator;
  readonly assetList: Locator;
  readonly assetItems: Locator;

  constructor(page: Page) {
    this.page = page;
    this.amountInput = page.getByTestId(SwapRevampSelectors.AmountInput);
    this.continueBtn = page.getByTestId(SwapRevampSelectors.ContinueBtn);
    this.confirmBtn = page.getByTestId(SwapRevampSelectors.ConfirmBtn);
    this.reviewSummary = page.getByTestId(SwapRevampSelectors.ReviewSummary);
    this.submissionStatus = page.getByTestId(SwapRevampSelectors.SubmissionStatus);
    this.baseAssetTrigger = page.getByTestId(SwapRevampSelectors.BaseAssetTrigger);
    this.targetAssetTrigger = page.getByTestId(SwapRevampSelectors.TargetAssetTrigger);
    this.selectedAssetSymbols = page.getByTestId(SwapRevampSelectors.SelectedAssetSymbol);
    this.assetList = page.getByTestId(SwapRevampSelectors.AssetList);
    this.assetItems = page.getByTestId(SwapRevampSelectors.AssetItem);
  }

  async waitForFormReady() {
    await this.page
      .getByTestId(SwapRevampSelectors.FormReady)
      .waitFor({ state: 'attached', timeout: 30_000 });
  }

  assetItemBySymbol(symbol: string) {
    return this.assetItems.and(this.page.locator(`[data-symbol="${symbol}"]`));
  }

  async searchAssets(term: string) {
    await this.page.getByPlaceholder('Search for asset').fill(term);
  }

  async selectBaseAsset(symbol: string) {
    await this.baseAssetTrigger.click();
    await this.assetList.waitFor();
    await this.searchAssets(symbol);
    await this.clickAssetItem(symbol);
  }

  async selectTargetAsset(symbol: string) {
    await this.targetAssetTrigger.click();
    await this.assetList.waitFor();
    await this.searchAssets(symbol);
    await this.clickAssetItem(symbol);
  }

  private async clickAssetItem(symbol: string) {
    const item = this.assetItemBySymbol(symbol).first();
    await expect(item).toBeVisible();
    await item.dispatchEvent('click');
  }

  async enterBaseAmount(amount: string) {
    await this.amountInput.fill(amount);
  }
}
