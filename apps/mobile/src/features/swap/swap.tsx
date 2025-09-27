import { FullHeightSheetHeader } from '@/components/sheets/full-height-sheet/full-height-sheet-header';
import { FullHeightSheetLayout } from '@/components/sheets/full-height-sheet/full-height-sheet.layout';
import { AmountPresets } from '@/features/swap/components/amount-presets';
import { useAccountRequest } from '@/hooks/use-account-request';
import { useSettings } from '@/store/settings/settings';
import { AssetVisibility } from '@/store/settings/utils';
import { t } from '@lingui/core/macro';

import { currencyDecimalsMap } from '@leather.io/constants';
import { FungibleCryptoAsset } from '@leather.io/models';
import { AccountSwapAsset, getMarketDataService, getSwapService } from '@leather.io/services';
import { Box, Button, Numpad } from '@leather.io/ui/native';
import { getAssetId, serializeAssetId } from '@leather.io/utils';

import { AmountField } from './components/amount-field/amount-field';
import { AssetSelector } from './components/asset-selector/asset-selector';
import { AssetSelectorSheet } from './components/asset-selector/asset-selector-sheet';
import { AssetSelectorToggle } from './components/asset-selector/asset-selector-toggle';
import { BaseAssetBalance } from './components/base-asset-balance';
import { FlipButton } from './components/flip-button';
import * as Panel from './components/panel';
import { TargetAmountPreview } from './components/target-amount-preview';
import { useSwapState } from './swap-state/use-swap-state';

interface SwapProps {
  baseAsset?: FungibleCryptoAsset;
  targetAsset?: FungibleCryptoAsset;
}

export function Swap({ baseAsset, targetAsset }: SwapProps) {
  const { assetVisibility, fiatCurrencyPreference } = useSettings();
  const accountRequest = useAccountRequest();
  const {
    baseAssetsQuery,
    targetAssetsQuery,
    state,
    actions: {
      openAssetSelector,
      closeAssetSelector,
      setBaseSwapAsset,
      setTargetSwapAsset,
      setBaseAmount,
      setBaseAmountByPercentage,
      flipAssets,
      toggleInputCurrencyMode,
    },
  } = useSwapState({
    marketDataService: getMarketDataService(),
    swapService: getSwapService(),
    accountRequest,
    quoteCurrencyPreference: fiatCurrencyPreference,
    isAssetAllowed: createAssetVisibilityPredicate(assetVisibility),
    baseAsset,
    targetAsset,
  });

  function handleAssetSelection(type: 'base' | 'target', asset: AccountSwapAsset) {
    const action = {
      base: setBaseSwapAsset,
      target: setTargetSwapAsset,
    };

    action[type](asset);
  }

  return (
    <FullHeightSheetLayout header={<FullHeightSheetHeader title={t`Swap`} />}>
      <Panel.Root>
        <Panel.Card type="pay">
          <Panel.CardRow>
            <AmountField
              secondaryAmount={state.secondaryAmount}
              inputCurrencyMode={state.inputCurrencyMode}
              onInputCurrencyModeSwitch={toggleInputCurrencyMode}
              value={state.baseAmount}
              quoteCurrencyPreference={state.quoteCurrencyPreference}
            />
            <Box alignItems="flex-end" gap="3" flexShrink={0}>
              <AssetSelectorToggle
                asset={state.baseSwapAsset?.asset}
                onPress={() => openAssetSelector('base')}
              />
              <BaseAssetBalance
                balance={state.baseSwapAsset?.balance}
                inputCurrencyMode={state.inputCurrencyMode}
              />
            </Box>
          </Panel.CardRow>
        </Panel.Card>
        <Panel.Card type="receive">
          <Panel.CardRow>
            <TargetAmountPreview />
            <AssetSelectorToggle
              asset={state.targetSwapAsset?.asset}
              onPress={() => openAssetSelector('target')}
              disabled={state.baseSwapAsset === null}
            />
          </Panel.CardRow>
        </Panel.Card>
        <FlipButton isVisible={state.assetFlippingAllowed} onPress={flipAssets} />
      </Panel.Root>

      <Box flex={1} justifyContent="flex-end" gap="4">
        <AmountPresets onSelectPercentage={setBaseAmountByPercentage} />
        <Numpad
          value={state.baseAmount}
          onChange={setBaseAmount}
          allowNextValue={createDecimalPlaceValidator(
            state.inputCurrencyMode === 'crypto'
              ? state.baseSwapAsset?.asset.decimals
              : currencyDecimalsMap[state.quoteCurrencyPreference]
          )}
        />
        <Box px="5" mt="3">
          <Button>{t`Review`}</Button>
        </Box>
      </Box>

      <AssetSelectorSheet isOpen={state.selectingAsset !== null} onClose={closeAssetSelector}>
        {state.selectingAsset && (
          <AssetSelector
            selectedBaseAsset={state.baseSwapAsset}
            selectedTargetAsset={state.targetSwapAsset}
            type={state.selectingAsset}
            query={{ base: baseAssetsQuery, target: targetAssetsQuery }[state.selectingAsset]}
            onSelectAsset={handleAssetSelection}
          />
        )}
      </AssetSelectorSheet>
    </FullHeightSheetLayout>
  );
}

function createDecimalPlaceValidator(decimals = Infinity) {
  return function (value: string) {
    return (value.split('.')[1] ?? '').length <= decimals;
  };
}

function createAssetVisibilityPredicate(assetVisibility: AssetVisibility) {
  return (asset: FungibleCryptoAsset) =>
    assetVisibility[serializeAssetId(getAssetId(asset))] !== false;
}
