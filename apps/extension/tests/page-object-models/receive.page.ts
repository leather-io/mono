import { Page } from '@playwright/test';
import { HomePageSelectors } from '@tests/selectors/home.selectors';

export class ReceivePage {
  constructor(readonly page: Page) {}

  get receiveBtcButton() {
    return this.page.getByTestId(HomePageSelectors.ReceiveBtcNativeSegwitQrCodeBtn);
  }

  get receiveStxButton() {
    return this.page.getByTestId(HomePageSelectors.ReceiveStxQrCodeBtn);
  }

  async goToReceiveDialog() {
    await this.page.getByTestId(HomePageSelectors.ReceiveCryptoAssetBtn).click();
  }
}
