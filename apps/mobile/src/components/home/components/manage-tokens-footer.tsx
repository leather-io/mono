import { useMemo } from 'react';

import { useSip10AccountBalance } from '@/queries/balance/sip10-balance.query';
import { plural, t } from '@lingui/core/macro';
import { LinearGradient } from 'expo-linear-gradient';

import { AccountId } from '@leather.io/models';
import { Box, Button, ChevronRightIcon, useTheme } from '@leather.io/ui/native';

function useHiddenSip10Count({ fingerprint, accountIndex }: AccountId) {
  const visible = useSip10AccountBalance(fingerprint, accountIndex, { keepPreviousData: true });
  const all = useSip10AccountBalance(fingerprint, accountIndex, {
    includeHiddenAssets: true,
    keepPreviousData: true,
  });

  return useMemo(() => {
    if (visible.state !== 'success' || all.state !== 'success') return 0;
    const visibleIds = new Set(visible.value.sip10s.map(sip10 => sip10.asset.assetId));
    return all.value.sip10s.filter(
      sip10 =>
        !visibleIds.has(sip10.asset.assetId) && sip10.crypto.totalBalance.amount.isGreaterThan(0)
    ).length;
  }, [visible, all]);
}

interface FadingLineProps {
  direction: 'left' | 'right';
}
function FadingLine({ direction }: FadingLineProps) {
  const { colors } = useTheme();
  const fade: [string, string] = [colors['ink.background-primary'], colors['ink.border-default']];

  return (
    <LinearGradient
      colors={direction === 'left' ? fade : [fade[1], fade[0]]}
      style={{ flex: 1, height: 1 }}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
    />
  );
}

interface ManageTokensFooterProps {
  account: AccountId;
  onPress(): void;
}
export function ManageTokensFooter({ account, onPress }: ManageTokensFooterProps) {
  const { spacing } = useTheme();
  const hiddenCount = useHiddenSip10Count(account);
  if (hiddenCount === 0) return null;

  return (
    // Pull up into the list footer's top padding so the entry reads as the end of the token
    // list, and leave more room before Trending tokens
    <Box flexDirection="row" alignItems="center" px="5" pb="6" style={{ marginTop: -spacing['3'] }}>
      <FadingLine direction="left" />
      <Button variant="outline" size="sm" iconEnd={ChevronRightIcon} onPress={onPress}>
        {t({
          message: plural(hiddenCount, {
            one: '# hidden token',
            other: '# hidden tokens',
          }),
        })}
      </Button>
      <FadingLine direction="right" />
    </Box>
  );
}
