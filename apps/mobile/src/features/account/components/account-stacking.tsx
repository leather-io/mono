import { Balance } from '@/components/balance/balance';
import { useGlobalSheets } from '@/core/global-sheet-provider';
import { isStacking } from '@/features/balances/utils';
import { useStxAccountBalance } from '@/queries/balance/stx-balance.query';
import { t } from '@lingui/core/macro';

import { AccountId } from '@leather.io/models';
import {
  Box,
  HasChildren,
  Pressable,
  QuestionCircleIcon,
  SkeletonLoader,
  Text,
  legacyTouchablePressEffect,
} from '@leather.io/ui/native';

interface AccountStacking {
  account: AccountId;
}

export function AccountStacking({ account }: AccountStacking) {
  const stxBalance = useStxAccountBalance(account.fingerprint, account.accountIndex);
  const isLoadingStacking = stxBalance.state === 'loading';
  const userIsStacking = stxBalance.state == 'success' && isStacking(stxBalance);

  if (isLoadingStacking) {
    return (
      <AccountStackingComponent>
        <SkeletonLoader height={16} maxWidth={72} isLoading={isLoadingStacking} />
      </AccountStackingComponent>
    );
  }
  if (!userIsStacking) return null;
  return (
    <AccountStackingComponent>
      <Balance balance={stxBalance.value?.quote.lockedBalance} variant="heading05" />
    </AccountStackingComponent>
  );
}

function AccountStackingComponent({ children }: HasChildren) {
  const { descriptionSheetRef } = useGlobalSheets();
  return (
    <Box px="5" pb="5">
      <Box mb="3" height={1} flex={1} bg="ink.component-background-non-interactive" />
      <Box gap="1">
        <Pressable
          pressEffects={legacyTouchablePressEffect}
          onPress={() => {
            descriptionSheetRef.current?.present({
              title: t`Locked`,
              data: [
                {
                  key: 'paragraph',
                  text: t`Amount you’ve committed to stacking. You won’t be able to move or spend it until the stacking period ends.`,
                },
              ],
            });
          }}
          flexDirection="row"
          gap="1"
          alignItems="center"
        >
          <Text variant="label02">{t`Locked STX`}</Text>
          <QuestionCircleIcon variant="small" />
        </Pressable>
        {children}
      </Box>
    </Box>
  );
}
