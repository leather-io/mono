import { ConnectAccountSelectors } from '@tests/selectors/requests.selectors';
import { Box, Stack } from 'leather-styles/jsx';

import { Caption, Flag, Logo } from '@leather.io/ui';

import { useSwitchAccountSheet } from '@app/common/switch-account/use-switch-account-sheet-context';
import { Header } from '@app/components/layout/headers/header';
import { HeaderGrid, HeaderGridRightCol } from '@app/components/layout/headers/header-grid';
import { CurrentAccountAvatar } from '@app/features/current-account/current-account-avatar';
import { CurrentAccountName } from '@app/features/current-account/current-account-name';
import { TotalBalance } from '@app/features/total-balance/total-balance';
import { useCurrentAccountId } from '@app/store/accounts/account';
import { useWalletEntities } from '@app/store/wallets/wallet.selectors';

interface PopupHeaderProps {
  showSwitchAccount?: boolean;
  balance?: 'all' | 'stx';
}

export function PopupHeader({ showSwitchAccount, balance }: PopupHeaderProps) {
  const { isShowingSwitchAccount, setIsShowingSwitchAccount } = useSwitchAccountSheet();
  const current = useCurrentAccountId();
  const walletEntities = useWalletEntities();
  const walletName = walletEntities[current.fingerprint]?.name;

  return (
    <Header>
      <HeaderGrid
        gridTemplateColumns="auto auto"
        leftCol={
          <>
            {showSwitchAccount ? (
              <Flag
                align="middle"
                img={<CurrentAccountAvatar />}
                onClick={() => setIsShowingSwitchAccount(!isShowingSwitchAccount)}
                cursor="pointer"
                width="100%"
              >
                <Stack gap="space.01" alignItems="flex-start">
                  <CurrentAccountName />
                  {walletName ? (
                    <Caption data-testid={ConnectAccountSelectors.WalletName}>{walletName}</Caption>
                  ) : null}
                </Stack>
              </Flag>
            ) : (
              <Box height="headerPopupHeight" margin="auto" px="space.02">
                <Logo />
              </Box>
            )}
          </>
        }
        rightCol={
          <HeaderGridRightCol>
            {balance && <TotalBalance displayAddresssBalanceOf={balance} />}
          </HeaderGridRightCol>
        }
      />
    </Header>
  );
}
