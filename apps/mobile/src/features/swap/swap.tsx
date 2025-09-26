import { FullHeightSheetHeader } from '@/components/sheets/full-height-sheet/full-height-sheet-header';
import { FullHeightSheetLayout } from '@/components/sheets/full-height-sheet/full-height-sheet.layout';
import { useAccountRequest } from '@/hooks/use-account-request';
import { useSettings } from '@/store/settings/settings';
import { AssetVisibility } from '@/store/settings/utils';
import { t } from '@lingui/core/macro';

import { FungibleCryptoAsset } from '@leather.io/models';
import { AccountSwapAsset, getMarketDataService, getSwapService } from '@leather.io/services';
import { Box } from '@leather.io/ui/native';
import { createMoneyFromDecimal, getAssetId, serializeAssetId } from '@leather.io/utils';

import { AmountField } from './components/amount-field';
import { AssetSelector } from './components/asset-selector/asset-selector';
import { AssetSelectorSheet } from './components/asset-selector/asset-selector-sheet';
import { AssetSelectorToggle } from './components/asset-selector/asset-selector-toggle';
import { Balance } from './components/balance';
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
              onModeSwitch={toggleInputCurrencyMode}
              secondaryAmount={state.secondaryAmount}
              asset={state.baseSwapAsset?.asset}
              inputCurrencyMode={state.inputCurrencyMode}
              value={state.baseAmount}
            />
            <Box alignItems="flex-end" gap="3" flexShrink={0}>
              <AssetSelectorToggle
                asset={state.baseSwapAsset?.asset}
                onPress={() => openAssetSelector('base')}
              />
              <Balance balance={createMoneyFromDecimal(0.00980035, 'BTC')} />
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

function createAssetVisibilityPredicate(assetVisibility: AssetVisibility) {
  return (asset: FungibleCryptoAsset) =>
    assetVisibility[serializeAssetId(getAssetId(asset))] !== false;
}
