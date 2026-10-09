import { useMemo, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SearchInput } from '@/components/search-input';
import { FullHeightSheet } from '@/components/sheets/full-height-sheet/full-height-sheet';
import { SpinnerIcon } from '@/components/spinner-icon';
import { useSip10Visibility } from '@/features/balances/assets/use-sip10-visibility';
import { useUsdcxBalance } from '@/features/balances/assets/use-usdcx-balance';
import { matchesSip10SearchTerm } from '@/features/balances/assets/utils/search-sip10-balances';
import { sortSip10Balances } from '@/features/balances/assets/utils/sort-sip10-balances';
import { withUsdcxBalance } from '@/features/balances/assets/utils/with-usdcx-balance';
import { useSip10AccountBalance } from '@/queries/balance/sip10-balance.query';
import { useSettings } from '@/store/settings/settings';
import { t } from '@lingui/core/macro';

import { AccountId } from '@leather.io/models';
import { Box, Sheet, SheetRef, Sip10AvatarIcon, Text, useTheme } from '@leather.io/ui/native';
import { getAssetId, serializeAssetId } from '@leather.io/utils';

import { TokenSwitch } from '../token/components/token-switch';

interface ManageTokenSheetProps {
  sheetRef: SheetRef;
  currentAccount: AccountId;
}

export function ManageTokensSheet({ sheetRef, currentAccount }: ManageTokenSheetProps) {
  const { bottom, top } = useSafeAreaInsets();
  const { spacing } = useTheme();
  const { changeAssetVisibility } = useSettings();
  const { isVisible } = useSip10Visibility();
  const [searchTerm, setSearchTerm] = useState('');
  const sip10s = useSip10AccountBalance(currentAccount.fingerprint, currentAccount.accountIndex, {
    includeHiddenAssets: true,
  });
  const usdcx = useUsdcxBalance(currentAccount);

  const isLoading = sip10s.state === 'loading';
  const usdcxBalance = usdcx.balance.state === 'success' ? usdcx.balance.value : undefined;
  const sip10List = sip10s.state === 'success' ? sip10s.value.sip10s : undefined;

  const tokens = useMemo(
    () =>
      withUsdcxBalance(sip10List ?? [], usdcx.assetId, usdcxBalance)
        .sort(sortSip10Balances)
        .filter(sip10 => matchesSip10SearchTerm(sip10.asset, searchTerm)),
    [sip10List, usdcx.assetId, usdcxBalance, searchTerm]
  );

  return (
    <FullHeightSheet sheetRef={sheetRef} handlePlacement="inside">
      {isLoading ? (
        <Box flex={1} justifyContent="center" alignItems="center">
          <Box height={24} width={24}>
            <SpinnerIcon />
          </Box>
        </Box>
      ) : (
        <Sheet.ScrollView
          style={{ paddingTop: top }}
          contentContainerStyle={{
            paddingTop: spacing['5'],
            paddingBottom: bottom,
          }}
        >
          <>
            <Text variant="heading05" px="5">
              {t`Manage tokens`}
            </Text>
            <Box px="5" pt="4">
              <SearchInput
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder={t`Search tokens`}
                TextInputComponent={Sheet.TextInput}
              />
            </Box>
            <Box pt="5">
              {sip10s.state === 'error' && (
                <Text variant="label02" color="red.action-primary-default" px="5">
                  {t`Failed to load tokens`}
                </Text>
              )}
              {sip10s.state === 'success' && tokens.length === 0 && (
                <Text variant="label02" color="ink.text-subdued" px="5">
                  {t`No tokens found`}
                </Text>
              )}
              {tokens.map(sip10 => (
                <TokenSwitch
                  key={sip10.asset.assetId}
                  icon={
                    <Sip10AvatarIcon
                      contractId={sip10.asset.contractId}
                      imageCanonicalUri={sip10.asset.imageCanonicalUri}
                      name={sip10.asset.name}
                    />
                  }
                  tokenName={sip10.asset.name}
                  ticker={sip10.asset.symbol}
                  value={isVisible(sip10.asset.assetId)}
                  onValueChange={val => {
                    changeAssetVisibility(serializeAssetId(getAssetId(sip10.asset)), val);
                  }}
                />
              ))}
            </Box>
          </>
        </Sheet.ScrollView>
      )}
    </FullHeightSheet>
  );
}
