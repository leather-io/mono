import { useRef } from 'react';

import { HeaderBackButton } from '@/components/screen/screen-header/components/header-back-button';
import { FullHeightSheetHeader } from '@/components/sheets/full-height-sheet/full-height-sheet-header';
import { FullHeightSheetLayout } from '@/components/sheets/full-height-sheet/full-height-sheet.layout';
import { SlippageSelectorSheet } from '@/features/swap/components/slippage-selector/slippage-selector-sheet';
import { UseSwapStateResult } from '@/features/swap/swap-state/swap-state.types';
import { t } from '@lingui/core/macro';

import { Box, SheetInstance } from '@leather.io/ui/native';

interface SwapReviewScreenProps {
  swapState: UseSwapStateResult;
  onPressBack: () => void;
}

export function SwapReviewScreen({ swapState, onPressBack }: SwapReviewScreenProps) {
  const slippageSheetRef = useRef<SheetInstance>(null);

  function handleBackPress() {
    onPressBack();
  }

  if (!swapState.quoteQuery.data?.selected) {
    return null;
  }

  return (
    <FullHeightSheetLayout
      header={
        <FullHeightSheetHeader
          title={t`Confirm Swap`}
          leftElement={<HeaderBackButton onPress={handleBackPress} />}
        />
      }
    >
      <Box flex={1} px="5"></Box>
      <SlippageSelectorSheet
        ref={slippageSheetRef}
        value={swapState.state.slippage}
        onSave={swapState.actions.setSlippage}
      />
    </FullHeightSheetLayout>
  );
}
