import { Balance } from '@/components/balance/balance';
import { useGlobalSheets } from '@/core/global-sheet-provider';
import { useAccountUnlockedBalance } from '@/queries/balance/account-balance.query';
import { Account } from '@/store/accounts/accounts';
import { t } from '@lingui/core/macro';

import {
  Box,
  Pressable,
  QuestionCircleIcon,
  Text,
  legacyTouchablePressEffect,
} from '@leather.io/ui/native';

interface AvailableAccountBalanceProps {
  account: Account;
}
export function AvailableAccountBalance({ account }: AvailableAccountBalanceProps) {
  const { descriptionSheetRef } = useGlobalSheets();
  const unlockedBalance = useAccountUnlockedBalance({
    fingerprint: account.fingerprint,
    accountIndex: account.accountIndex,
  });
  return (
    <Box p="5">
      <Box flexDirection="column">
        <Pressable
          pressEffects={legacyTouchablePressEffect}
          onPress={() => {
            descriptionSheetRef.current?.present({
              title: t`Available balance`,
              data: [
                {
                  key: 'paragraph',
                  text: t`Amount of tokens you can actually send or spend right now. We calculate it by taking your total balance and removing:`,
                },
                {
                  key: 'bullet',
                  title: t`Outbound balance:`,
                  text: t`funds already on their way to someone else.`,
                },
                {
                  key: 'bullet',
                  title: t`Protected Bitcoin balance:`,
                  text: t`funds kept safe and unavailable for spending`,
                },
                {
                  key: 'bullet',
                  title: t`Locked Stacks balance:`,
                  text: t`funds temporarily locked in a stacking pool and not yet spendable.`,
                },
                {
                  key: 'bullet',
                  title: t`Uneconomical balance:`,
                  text: t`tiny amounts that cost more to send than they’re worth.`,
                },
              ],
            });
          }}
          flexDirection="row"
          alignItems="center"
          gap="1"
        >
          <Text variant="label03">{t`Available`}</Text>
          <QuestionCircleIcon variant="small" />
        </Pressable>
        {unlockedBalance.state === 'success' && (
          <Balance balance={unlockedBalance.value} variant="heading05" />
        )}
      </Box>
    </Box>
  );
}
