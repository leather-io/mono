import { useRef } from 'react';

import { Box, Flex } from 'leather-styles/jsx';

import { AccountSwapAsset } from '@leather.io/services';
import { useSwapContext } from '@leather.io/state/swap';

import { RouteUrls } from '@shared/route-urls';

import { Card, Content, Page } from '@app/components/layout';
import { PageHeader } from '@app/features/container/headers/page.header';
import { AmountField } from '@app/pages/swap/components/amount-field/amount-field';
import { getAmountErrorMessage } from '@app/pages/swap/components/amount-field/amount-field-error-messages';
import { AssetBalance } from '@app/pages/swap/components/asset-balance';
import { AssetSelectorToggle } from '@app/pages/swap/components/asset-selector-toggle';
import { AssetSelector } from '@app/pages/swap/components/asset-selector/asset-selector';
import { AssetSelectorSheet } from '@app/pages/swap/components/asset-selector/asset-selector-sheet';

export function SwapForm() {
  const amountFieldRef = useRef<HTMLInputElement>(null);
  const { state, actions, validation, baseAssetsQuery, targetAssetsQuery } = useSwapContext();

  function handleAssetSelection(type: 'base' | 'target', asset: AccountSwapAsset) {
    const action = {
      base: actions.setBaseSwapAsset,
      target: actions.setTargetSwapAsset,
    };

    action[type](asset);
  }

  function handleSheetCloseAutoFocus(e: Event) {
    if (!amountFieldRef.current) return;

    e.preventDefault();
    amountFieldRef.current.focus();
    const length = amountFieldRef.current.value.length;
    amountFieldRef.current.setSelectionRange(length, length);
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
                />
              </Flex>
            </Flex>
          </Card>

          <AssetSelectorSheet
            type={state.selectingAsset}
            isOpen={state.selectingAsset !== null}
            onClose={actions.closeAssetSelector}
            onCloseAutoFocus={handleSheetCloseAutoFocus}
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
