import { FullHeightSheetHeader } from '@/components/sheets/full-height-sheet/full-height-sheet-header';
import { FullHeightSheetLayout } from '@/components/sheets/full-height-sheet/full-height-sheet.layout';
import { AmountPresets } from '@/features/swap/components/amount-presets';
import { ErrorMessage } from '@/features/swap/components/error-message';
import { useAccountRequest } from '@/hooks/use-account-request';
import { useSettings } from '@/store/settings/settings';
import { AssetVisibility } from '@/store/settings/utils';
import { whenInputCurrencyMode } from '@/utils/when-currency-input-mode';
import { t } from '@lingui/core/macro';

import { currencyDecimalsMap } from '@leather.io/constants';
import { SwappableFungibleCryptoAsset } from '@leather.io/models';
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
  baseAsset?: SwappableFungibleCryptoAsset;
  targetAsset?: SwappableFungibleCryptoAsset;
}

export function Swap({ baseAsset, targetAsset }: SwapProps) {
  const { assetVisibility, fiatCurrencyPreference } = useSettings();
  const accountRequest = useAccountRequest();
  const { state, actions, validation, baseAssetsQuery, targetAssetsQuery, quoteQuery } =
    useSwapState({
      accountRequest,
      marketDataService: getMarketDataService(),
      swapService: getSwapService(),
      quoteCurrencyPreference: fiatCurrencyPreference,
      isAssetAllowed: createAssetVisibilityPredicate(assetVisibility),
      baseAsset,
      targetAsset,
    });
  const validateDecimalPlaces = createDecimalPlaceValidator(
    whenInputCurrencyMode(state.inputCurrencyMode)({
      crypto: state.baseSwapAsset?.asset.decimals,
      quote: currencyDecimalsMap[state.quoteCurrencyPreference],
    })
  );

  function handleAssetSelection(type: 'base' | 'target', asset: AccountSwapAsset) {
    const action = {
      base: actions.setBaseSwapAsset,
      target: actions.setTargetSwapAsset,
    };

    action[type](asset);
  }

  return (
    <FullHeightSheetLayout header={<FullHeightSheetHeader title={t`Swap`} />}>
      <Panel.Root>
        <Panel.Card type="pay">
          <Panel.CardRow>
            <AmountField
              invalid={!!validation.issues.baseAmount}
              asset={state.baseSwapAsset?.asset}
              secondaryAmount={state.secondaryAmount}
              inputCurrencyMode={state.inputCurrencyMode}
              onInputCurrencyModeSwitch={actions.toggleInputCurrencyMode}
              value={state.baseAmount}
              quoteCurrencyPreference={state.quoteCurrencyPreference}
            />
            <Box alignItems="flex-end" gap="3" flexShrink={0}>
              <AssetSelectorToggle
                asset={state.baseSwapAsset?.asset}
                onPress={() => actions.openAssetSelector('base')}
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
            <TargetAmountPreview quoteQuery={quoteQuery} baseAmount={state.baseAmount} />
            <AssetSelectorToggle
              asset={state.targetSwapAsset?.asset}
              onPress={() => actions.openAssetSelector('target')}
              disabled={state.baseSwapAsset === null}
            />
          </Panel.CardRow>
        </Panel.Card>
        <FlipButton isVisible={state.assetFlippingAllowed} onPress={actions.flipAssets} />
      </Panel.Root>

      <ErrorMessage amount={state.baseAmount} issue={validation.issues.baseAmount} />

      <Box flex={1} justifyContent="flex-end" gap="4">
        <AmountPresets onSelectPercentage={actions.setBaseAmountByPercentage} />
        <Numpad
          value={state.baseAmount}
          onChange={actions.setBaseAmount}
          allowNextValue={validateDecimalPlaces}
        />
        <Box px="5" mt="3">
          <Button>{t`Review`}</Button>
        </Box>
      </Box>

      <AssetSelectorSheet
        isOpen={state.selectingAsset !== null}
        onClose={actions.closeAssetSelector}
      >
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
  return (asset: SwappableFungibleCryptoAsset) =>
    assetVisibility[serializeAssetId(getAssetId(asset))] !== false;
}
