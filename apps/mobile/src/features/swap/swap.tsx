import { AmountField } from '@/features/swap/components/amount-field';
import { AmountPresets } from '@/features/swap/components/amount-presets';
import { AssetSelector } from '@/features/swap/components/asset-selector/asset-selector';
import { AssetSelectorSheet } from '@/features/swap/components/asset-selector/asset-selector-sheet';
import { AssetSelectorToggle } from '@/features/swap/components/asset-selector/asset-selector-toggle';
import { Balance } from '@/features/swap/components/balance';
import { CurrencyModeSwitcher } from '@/features/swap/components/currency-mode-switcher';
import { FlipButton } from '@/features/swap/components/flip-button';
import { TargetAmountPreview } from '@/features/swap/components/target-amount-preview';
import { AccountSwapAsset } from '@/features/swap/temp/service';
import { useSwapState } from '@/features/swap/use-swap-state';
import { t } from '@lingui/core/macro';
import { doNothing } from 'remeda';

import { Box, Button, Numpad } from '@leather.io/ui/native';
import { createMoneyFromDecimal } from '@leather.io/utils';

import * as Panel from './components/panel';

export function Swap() {
  const {
    baseAssetsQuery,
    targetAssetsQuery,
    state,
    actions: { openAssetSelector, closeAssetSelector, setBaseSwapAsset, setTargetSwapAsset },
  } = useSwapState();

  function handleAssetSelection(type: 'base' | 'target', asset: AccountSwapAsset) {
    const action = {
      base: setBaseSwapAsset,
      target: setTargetSwapAsset,
    };

    action[type](asset);
  }

  return (
    <>
      <Panel.Root>
        <Panel.Card type="pay">
          <Panel.CardRow>
            <AmountField />
            <AssetSelectorToggle
              asset={state.baseSwapAsset?.asset}
              onPress={() => openAssetSelector('base')}
            />
          </Panel.CardRow>
          <Panel.CardRow>
            <CurrencyModeSwitcher value="$0" onModeSwitch={doNothing} />
            <Balance balance={createMoneyFromDecimal(0.00980035, 'BTC')} />
          </Panel.CardRow>
        </Panel.Card>
        <Panel.Card type="receive">
          <Panel.CardRow>
            <TargetAmountPreview />
            <AssetSelectorToggle
              asset={state.targetSwapAsset?.asset}
              onPress={() => openAssetSelector('target')}
            />
          </Panel.CardRow>
        </Panel.Card>
        <FlipButton />
      </Panel.Root>

      <Box flex={1} justifyContent="flex-end" gap="4">
        <AmountPresets />
        <Numpad value="" onChange={doNothing} />
        <Box px="5" mt="3">
          <Button>{t`Review`}</Button>
        </Box>
      </Box>

      <AssetSelectorSheet isOpen={state.selectingAsset !== null} onClose={closeAssetSelector}>
        {state.selectingAsset && (
          <AssetSelector
            type={state.selectingAsset}
            query={{ base: baseAssetsQuery, target: targetAssetsQuery }[state.selectingAsset]}
            onSelectAsset={handleAssetSelection}
          />
        )}
      </AssetSelectorSheet>
    </>
  );
}
