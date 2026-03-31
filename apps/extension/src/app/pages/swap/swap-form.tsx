import { useRef } from 'react';
import { useNavigate, useOutletContext } from 'react-router';

import { Box, Divider, Flex } from 'leather-styles/jsx';

import { AccountSwapAsset } from '@leather.io/services';
import { useSwapContext } from '@leather.io/state/swap';
import { Button } from '@leather.io/ui';

import { RouteUrls } from '@shared/route-urls';

import { Card, Content, Page } from '@app/components/layout';
import { PageHeader } from '@app/features/container/headers/page.header';
import { AmountField } from '@app/pages/swap/components/amount-field/amount-field';
import { getAmountErrorMessage } from '@app/pages/swap/components/amount-field/amount-field-error-messages';
import { AssetBalance } from '@app/pages/swap/components/asset-balance';
import { AssetSelectorToggle } from '@app/pages/swap/components/asset-selector-toggle';
import { AssetSelector } from '@app/pages/swap/components/asset-selector/asset-selector';
import { AssetSelectorSheet } from '@app/pages/swap/components/asset-selector/asset-selector-sheet';
import { FlipButton } from '@app/pages/swap/components/flip-button';
import { QuotePreview } from '@app/pages/swap/components/quote-preview/quote-preview';
import { TargetAmountPreview } from '@app/pages/swap/components/target-amount-preview';
import { type SwapOutletContext } from '@app/pages/swap/swap-container';
import { focusAmountField } from '@app/pages/swap/swap-utils';

export function SwapForm() {
  const amountFieldRef = useRef<HTMLInputElement>(null);
  const {
    state,
    actions,
    validation,
    baseAssetsQuery,
    targetAssetsQuery,
    targetMarketDataQuery,
    canSubmit,
  } = useSwapContext();
  const { liveEstimate } = useOutletContext<SwapOutletContext>();
  const navigate = useNavigate();

  function handleAssetSelection(type: 'base' | 'target', asset: AccountSwapAsset) {
    const action = {
      base: actions.setBaseSwapAsset,
      target: actions.setTargetSwapAsset,
    };

    action[type](asset);
  }

  function handleSetToMax() {
    actions.setBaseAmountByPercentage(1);
    focusAmountField(amountFieldRef.current);
  }

  function handleAssetSheetCloseAutoFocus(e: Event) {
    if (state.selectingAsset === 'base') {
      e.preventDefault();
      focusAmountField(amountFieldRef.current);
    }
  }

  return (
    <Box width="100%">
      <PageHeader title="Swap" onBackLocation={RouteUrls.Home} />
      <Content>
        <Page>
          <Card>
            <Flex justifyContent="space-between" alignItems="flex-start">
              <AmountField
                asset={state.baseSwapAsset?.asset}
                value={state.baseAmount}
                onChange={actions.setBaseAmount}
                secondaryAmount={state.secondaryAmount}
                inputCurrencyMode={state.inputCurrencyMode}
                onInputCurrencyModeSwitch={actions.toggleInputCurrencyMode}
                quoteCurrencyPreference="USD"
                inputRef={amountFieldRef}
                errorMessage={getAmountErrorMessage(validation.issues.baseAmount)}
              />

              <Flex direction="column" gap="space.03" alignItems="flex-end">
                <AssetSelectorToggle
                  asset={state.baseSwapAsset?.asset}
                  onPress={() => actions.openAssetSelector('base')}
                />
                <AssetBalance
                  balance={state.baseSwapAsset?.balance}
                  inputCurrencyMode={state.inputCurrencyMode}
                  onSetToMax={handleSetToMax}
                />
              </Flex>
            </Flex>

            <Divider marginY="space.05" borderColor="ink.border-transparent" />

            <Flex justifyContent="space-between" alignItems="flex-start">
              <TargetAmountPreview
                marketData={targetMarketDataQuery.data}
                liveEstimate={liveEstimate}
                baseAmount={state.baseAmount}
                isTargetAssetSet={state.targetSwapAsset !== null}
              />

              <Flex direction="column" gap="space.03" alignItems="flex-end">
                <AssetSelectorToggle
                  asset={state.targetSwapAsset?.asset}
                  onPress={() => actions.openAssetSelector('target')}
                  disabled={state.baseSwapAsset === null}
                />
                <AssetBalance
                  balance={state.targetSwapAsset?.balance}
                  inputCurrencyMode={state.inputCurrencyMode}
                />
              </Flex>
            </Flex>

            <FlipButton isVisible={state.assetFlippingAllowed} onPress={actions.flipAssets} />
          </Card>

          <Flex direction="column" mt="space.04" gap="space.03">
            <Button
              disabled={!canSubmit}
              onClick={() =>
                navigate({ pathname: `${state.targetSwapAsset?.asset.symbol}/review` })
              }
            >
              Continue
            </Button>

            <QuotePreview state={state} liveEstimate={liveEstimate} />
          </Flex>

          <AssetSelectorSheet
            type={state.selectingAsset}
            isOpen={state.selectingAsset !== null}
            onClose={actions.closeAssetSelector}
            onCloseAutoFocus={handleAssetSheetCloseAutoFocus}
          >
            {state.selectingAsset && (
              <AssetSelector
                type={state.selectingAsset}
                selectedBaseAsset={state.baseSwapAsset}
                selectedTargetAsset={state.targetSwapAsset}
                query={{ base: baseAssetsQuery, target: targetAssetsQuery }[state.selectingAsset]}
                onSelectAsset={handleAssetSelection}
              />
            )}
          </AssetSelectorSheet>
        </Page>
      </Content>
    </Box>
  );
}
