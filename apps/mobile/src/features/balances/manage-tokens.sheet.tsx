import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SearchInput } from '@/components/search-input';
import { FullHeightSheet } from '@/components/sheets/full-height-sheet/full-height-sheet';
import { SpinnerIcon } from '@/components/spinner-icon';
import { useUsdcxBalance } from '@/features/balances/assets/use-usdcx-balance';
import { sortSip10Balances } from '@/features/balances/assets/utils/sort-sip10-balances';
import {
  useManagedSip10Tools,
  useSip10AccountBalance,
} from '@/queries/balance/sip10-balance.query';
import { useSettings } from '@/store/settings/settings';
import { t } from '@lingui/core/macro';

import { AccountId } from '@leather.io/models';
import { Sip10Balance } from '@leather.io/services';
import { Box, Sheet, SheetRef, Sip10AvatarIcon, Text, useTheme } from '@leather.io/ui/native';
import { getAssetId, isDefined, serializeAssetId } from '@leather.io/utils';

import { TokenSwitch } from '../token/components/token-switch';

function matchesSearchTerm(sip10: Sip10Balance, searchTerm: string) {
  const normalizedTerm = searchTerm.trim().toLowerCase();
  if (normalizedTerm.length === 0) return true;
  return (
    sip10.asset.name.toLowerCase().includes(normalizedTerm) ||
    sip10.asset.symbol.toLowerCase().includes(normalizedTerm)
  );
}

interface ManageTokenSheetProps {
  sheetRef: SheetRef;
  currentAccount: AccountId;
}

export function ManageTokensSheet({ sheetRef, currentAccount }: ManageTokenSheetProps) {
  const { bottom, top } = useSafeAreaInsets();
  const { spacing } = useTheme();
  const { assetVisibility, changeAssetVisibility } = useSettings();
  const [searchTerm, setSearchTerm] = useState('');
  const sip10s = useSip10AccountBalance(currentAccount.fingerprint, currentAccount.accountIndex, {
    includeHiddenAssets: true,
  });
  const usdcx = useUsdcxBalance(currentAccount);

  const { isEnabled: isSip10Enabled } = useManagedSip10Tools(
    currentAccount.fingerprint,
    currentAccount.accountIndex
  );

  const isLoading = sip10s.state === 'loading';

  const allSip10s = [...(sip10s.value?.sip10s ?? [])];
  const hasUsdcxInSip10s = allSip10s.some(sip10 => sip10.asset.assetId === usdcx.assetId);
  if (!hasUsdcxInSip10s && usdcx.balance.state === 'success') {
    allSip10s.push(usdcx.balance.value);
  }
  const tokens = allSip10s
    .sort(sortSip10Balances)
    .filter(sip10 => matchesSearchTerm(sip10, searchTerm));

  function isEnabled(sip10: Sip10Balance) {
    const userSetting = assetVisibility[serializeAssetId(getAssetId(sip10.asset))];
    if (isDefined(userSetting)) return userSetting;
    if (sip10.asset.assetId === usdcx.assetId) return true;
    return isSip10Enabled(sip10);
  }

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
              {tokens.length === 0 && (
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
                  value={isEnabled(sip10)}
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
