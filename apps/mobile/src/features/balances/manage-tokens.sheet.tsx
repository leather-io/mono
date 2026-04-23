import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FullHeightSheet } from '@/components/sheets/full-height-sheet/full-height-sheet';
import { SpinnerIcon } from '@/components/spinner-icon';
import {
  useManagedSip10Tools,
  useSip10AccountBalance,
} from '@/queries/balance/sip10-balance.query';
import { useSettings } from '@/store/settings/settings';
import { t } from '@lingui/core/macro';

import { USDCX_ASSET_ID_MAINNET, USDCX_ASSET_ID_TESTNET } from '@leather.io/constants';
import { AccountId } from '@leather.io/models';
import { Box, Sheet, SheetRef, Sip10AvatarIcon, Text, useTheme } from '@leather.io/ui/native';
import { getAssetId, serializeAssetId } from '@leather.io/utils';

import { TokenSwitch } from '../token/components/token-switch';

function isUsdcxAssetId(assetId: string) {
  return assetId === USDCX_ASSET_ID_MAINNET || assetId === USDCX_ASSET_ID_TESTNET;
}

interface ManageTokenSheetProps {
  sheetRef: SheetRef;
  currentAccount: AccountId;
}

export function ManageTokensSheet({ sheetRef, currentAccount }: ManageTokenSheetProps) {
  const { bottom, top } = useSafeAreaInsets();
  const { spacing } = useTheme();
  const { changeAssetVisibility } = useSettings();
  const sip10s = useSip10AccountBalance(currentAccount.fingerprint, currentAccount.accountIndex, {
    includeHiddenAssets: true,
  });

  const { isEnabled: isSip10Enabled } = useManagedSip10Tools(
    currentAccount.fingerprint,
    currentAccount.accountIndex
  );

  const isLoading = sip10s.state === 'loading';

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
            <Box pt="5">
              {sip10s.value?.sip10s
                ?.filter(sip10 => !isUsdcxAssetId(sip10.asset.assetId))
                .map(sip10 => (
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
                    value={isSip10Enabled(sip10)}
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
