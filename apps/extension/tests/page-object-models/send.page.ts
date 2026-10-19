import { type Locator, type Page, expect } from '@playwright/test';
import {
  CoreAssetSelectors,
  MockedTokensSelectors,
} from '@tests/selectors/mocked-tokens.selectors';
import { SendCryptoAssetSelectors } from '@tests/selectors/send.selectors';
import { SharedComponentsSelectors } from '@tests/selectors/shared-component.selectors';

import { RouteUrls } from '@shared/route-urls';

const loadedAvailableBalance = /[1-9]/;
const loadedFeeEstimate = /\d/;

export class SendPage {
  readonly page: Page;
  readonly amountInput: Locator;
  readonly amountInputErrorLabel: Locator;
  readonly confirmationDetails: Locator;
  readonly confirmationDetailsRecipient: Locator;
  readonly formInputErrorLabel: Locator;
  readonly memoInput: Locator;
  readonly previewSendTxButton: Locator;
  readonly recipientChooseAccountButton: Locator;
  readonly recipientSelectRecipientTypeDropdown: Locator;
  readonly recipientSelectFieldAddress: Locator;
  readonly recipientSelectFieldBnsName: Locator;
  readonly recipientInput: Locator;
  readonly recipientBnsAddressLabel: Locator;
  readonly sendMaxButton: Locator;
  readonly feesRow: Locator;
  readonly memoRow: Locator;
  readonly feesListItem: Locator;
  readonly feeToBePaid: Locator;
  readonly infoCardButton: Locator;
  readonly broadcastErrorTitle: Locator;

  constructor(page: Page) {
    this.page = page;
    this.amountInput = this.page.getByTestId(SendCryptoAssetSelectors.AmountFieldInput);
    this.amountInputErrorLabel = this.page.getByTestId(
      SendCryptoAssetSelectors.AmountFieldInputErrorLabel
    );
    this.confirmationDetails = this.page.getByTestId(SendCryptoAssetSelectors.ConfirmationDetails);
    this.confirmationDetailsRecipient = this.page.getByTestId(
      SendCryptoAssetSelectors.ConfirmationDetailsRecipient
    );
    this.formInputErrorLabel = page.getByTestId(SendCryptoAssetSelectors.FormFieldInputErrorLabel);
    this.memoInput = this.page.getByTestId(SendCryptoAssetSelectors.MemoFieldInput);
    this.previewSendTxButton = page.getByTestId(SendCryptoAssetSelectors.PreviewSendTxBtn);
    this.recipientChooseAccountButton = page.getByTestId(
      SendCryptoAssetSelectors.RecipientChooseAccountButton
    );
    this.recipientSelectRecipientTypeDropdown = this.page.getByTestId(
      SendCryptoAssetSelectors.RecipientSelectRecipientTypeDropdown
    );
    this.recipientSelectFieldAddress = this.page.getByTestId(
      SendCryptoAssetSelectors.RecipientSelectFieldAddress
    );
    this.recipientSelectFieldBnsName = this.page.getByTestId(
      SendCryptoAssetSelectors.RecipientSelectFieldBnsName
    );
    this.recipientInput = this.page.getByTestId(SendCryptoAssetSelectors.RecipientFieldInput);
    this.recipientBnsAddressLabel = this.page.getByTestId(
      SendCryptoAssetSelectors.RecipientBnsAddressLabel
    );
    this.feesRow = page.getByTestId(SendCryptoAssetSelectors.ConfirmationDetailsFee);
    this.memoRow = page.getByTestId(SendCryptoAssetSelectors.ConfirmationDetailsMemo);

    this.sendMaxButton = page.getByTestId(SendCryptoAssetSelectors.SendMaxBtn);
    this.feesListItem = page.getByTestId(SharedComponentsSelectors.FeesListItem);
    this.feeToBePaid = page.getByTestId(SharedComponentsSelectors.FeeToBePaidLabel);
    this.infoCardButton = page.getByTestId(SharedComponentsSelectors.InfoCardButton);
    this.broadcastErrorTitle = page.getByTestId(SharedComponentsSelectors.BroadcastErrorTitle);
  }

  async selectBtcAndGoToSendForm(expectedAvailableBalance = loadedAvailableBalance) {
    await this.page.waitForURL('**' + RouteUrls.SendCryptoAsset);
    await expect(
      this.page.getByTestId(SendCryptoAssetSelectors.ChooseAssetToSendPage)
    ).toBeVisible();
    await this.page.getByTestId(CoreAssetSelectors.BtcAsset).click();
    await this.page.waitForURL('**' + `${RouteUrls.SendCryptoAsset}/btc`);

    await this.page.getByTestId(SendCryptoAssetSelectors.SendForm).waitFor();
    await this.waitForAvailableBalance(expectedAvailableBalance);
    await this.waitForSpendableUtxos();
  }

  private async waitForSpendableUtxos() {
    await expect(this.sendMaxButton).toBeVisible();
  }

  async selectStxAndGoToSendForm() {
    await this.page.waitForURL('**' + RouteUrls.SendCryptoAsset);
    await expect(
      this.page.getByTestId(SendCryptoAssetSelectors.ChooseAssetToSendPage)
    ).toBeVisible();
    await this.page.getByTestId(CoreAssetSelectors.StxAsset).click();
    await this.page.waitForURL('**' + `${RouteUrls.SendCryptoAsset}/stx`);
    await this.waitForFeeEstimate();
    await this.page.getByTestId(SendCryptoAssetSelectors.SendForm).waitFor();
  }

  async selectSip10AndGoToSendForm(tokenTestId: string = MockedTokensSelectors.Sip10TokenTestId) {
    await this.page.waitForURL('**' + RouteUrls.SendCryptoAsset);
    await this.page.getByTestId(tokenTestId).click();
    await this.page.getByTestId(SendCryptoAssetSelectors.SendForm).waitFor();
    await this.waitForFeeEstimate();
  }

  async waitForSendPageReady() {
    await this.page
      .getByTestId(SendCryptoAssetSelectors.SendPageReady)
      .waitFor({ state: 'attached' });
  }

  async goBack() {
    await this.page.getByTestId(SharedComponentsSelectors.HeaderBackBtn).click();
  }

  async goBackSelectStx() {
    await this.goBack();
    await this.selectStxAndGoToSendForm();
  }

  async clickInfoCardButton() {
    await this.infoCardButton.click();
  }

  private async waitForAvailableBalance(expectedBalance: RegExp) {
    await expect(this.page.getByTestId(SharedComponentsSelectors.CardAvailableBalance)).toHaveText(
      expectedBalance
    );
  }

  private async waitForFeeEstimate() {
    await expect(this.feeToBePaid).toHaveText(loadedFeeEstimate);
  }

  async waitForFeeRow() {
    await this.page.getByTestId(SharedComponentsSelectors.FeeRow).waitFor({ state: 'attached' });
  }

  async previewBitcoinTransaction() {
    await this.previewSendTxButton.click();
    await expect(this.feesListItem.first()).toBeVisible();
  }

  async confirmSendTransaction() {
    await this.page.getByTestId(SendCryptoAssetSelectors.ConfirmSendTxBtn).click();
  }
}
