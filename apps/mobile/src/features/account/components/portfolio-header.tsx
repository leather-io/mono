import { useGlobalSheets } from '@/core/global-sheet-provider';
import { TotalBalance } from '@/features/balances/total-balance';
import { t } from '@lingui/core/macro';

import {
  Box,
  Pressable,
  QuestionCircleIcon,
  Text,
  legacyTouchablePressEffect,
} from '@leather.io/ui/native';

export function PortfolioHeader() {
  const { descriptionSheetRef } = useGlobalSheets();
  return (
    <Box gap="1">
      <Pressable
        pressEffects={legacyTouchablePressEffect}
        onPress={() => {
          descriptionSheetRef.current?.present({
            title: t`Portfolio`,
            data: [
              {
                key: 'paragraph',
                text: t`Your total tokens across all your accounts.`,
              },
            ],
          });
        }}
        flexDirection="row"
        gap="1"
        alignItems="center"
      >
        <Text variant="label01">{t`Portfolio`}</Text>
        <QuestionCircleIcon variant="small" />
      </Pressable>

      <TotalBalance variant="heading04" />
    </Box>
  );
}
