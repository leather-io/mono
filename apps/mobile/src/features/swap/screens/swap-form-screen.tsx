import { LayoutAnimationConfig } from 'react-native-reanimated';

import { FullHeightSheetHeader } from '@/components/sheets/full-height-sheet/full-height-sheet-header';
import { FullHeightSheetLayout } from '@/components/sheets/full-height-sheet/full-height-sheet.layout';
import { getAmountErrorMessage } from '@/features/swap/components/amount-field/amount-field-error-messages';
import { AmountPresets } from '@/features/swap/components/amount-presets';
import { QuotePreview } from '@/features/swap/components/quote-preview/quote-preview';
import { UseSwapStateResult } from '@/features/swap/swap-state/swap-state.types';
import { whenInputCurrencyMode } from '@/utils/when-currency-input-mode';
import { t } from '@lingui/core/macro';

import { currencyDecimalsMap } from '@leather.io/constants';
import { AccountSwapAsset } from '@leather.io/services';
import { Box, Button, Numpad } from '@leather.io/ui/native';

import { AmountField } from '../components/amount-field/amount-field';
import { AssetBalance } from '../components/asset-balance';
import { AssetSelector } from '../components/asset-selector/asset-selector';
import { AssetSelectorSheet } from '../components/asset-selector/asset-selector-sheet';
import { AssetSelectorToggle } from '../components/asset-selector/asset-selector-toggle';
import { FlipButton } from '../components/flip-button';
import * as Panel from '../components/panel';
import { TargetAmountPreview } from '../components/target-amount-preview';
import { LiveSwapEstimate } from '../hooks/use-live-swap-estimate';

interface SwapFormScreenProps {
  swapStateResult: UseSwapStateResult;
  liveEstimate: LiveSwapEstimate;
  onPressReview(): void;
}

export function SwapFormScreen({
  swapStateResult,
  liveEstimate,
  onPressReview,
}: SwapFormScreenProps) {
  const {
    state,
    actions,
    validation,
    baseAssetsQuery,
    targetAssetsQuery,
    targetMarketDataQuery,
    canSubmit,
  } = swapStateResult;

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
      <LayoutAnimationConfig skipEntering>
        <Panel.Root>
          <Panel.Card type="pay">
            <AmountField
              asset={state.baseSwapAsset?.asset}
              secondaryAmount={state.secondaryAmount}
              inputCurrencyMode={state.inputCurrencyMode}
              onInputCurrencyModeSwitch={actions.toggleInputCurrencyMode}
              value={state.baseAmount}
              quoteCurrencyPreference={state.quoteCurrencyPreference}
              errorMessage={getAmountErrorMessage(validation.issues.baseAmount)}
            />
            <Box alignItems="flex-end" gap="3" flexShrink={0}>
              <AssetSelectorToggle
                asset={state.baseSwapAsset?.asset}
                onPress={() => actions.openAssetSelector('base')}
              />
              <AssetBalance
                balance={state.baseSwapAsset?.balance}
                inputCurrencyMode={state.inputCurrencyMode}
              />
            </Box>
          </Panel.Card>

          <Panel.Card type="receive">
            <TargetAmountPreview
              marketData={targetMarketDataQuery.data}
              liveEstimate={liveEstimate}
              baseAmount={state.baseAmount}
              isTargetAssetSet={state.targetSwapAsset !== null}
            />
            <Box alignItems="flex-end" gap="3" flexShrink={0}>
              <AssetSelectorToggle
                asset={state.targetSwapAsset?.asset}
                onPress={() => actions.openAssetSelector('target')}
                disabled={state.baseSwapAsset === null}
              />
              <AssetBalance
                balance={state.targetSwapAsset?.balance}
                inputCurrencyMode={state.inputCurrencyMode}
              />
            </Box>
          </Panel.Card>
          <FlipButton isVisible={state.assetFlippingAllowed} onPress={actions.flipAssets} />
        </Panel.Root>
      </LayoutAnimationConfig>

      <Box mt="4" px="5" flexGrow={1}>
        <QuotePreview state={state} liveEstimate={liveEstimate} />
      </Box>

      <Box marginTop="auto" gap="3">
        <AmountPresets onSelectPercentage={actions.setBaseAmountByPercentage} />
        <Numpad
          value={state.baseAmount}
          onChange={actions.setBaseAmount}
          allowNextValue={validateDecimalPlaces}
        />
        <Box px="5" mt="2">
          <Button disabled={!canSubmit} onPress={onPressReview}>{t`Review`}</Button>
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
