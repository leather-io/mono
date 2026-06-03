import { SettingsSelectors } from '@tests/selectors/settings.selectors';
import { Box, Flex } from 'leather-styles/jsx';

import { ChevronDownIcon, Link } from '@leather.io/ui';

import { AccountNameLayout } from '@app/components/account/account-name';
import { useHomePageState } from '@app/pages/home/use-home-page-state';

export function HeaderAccountSelector() {
  const { isFetchingBnsName, name, toggleSwitchAccount } = useHomePageState();
  return (
    <Flex flexDir="row" justify="space-between" align="center" minWidth={0}>
      <Link
        _before={{ bg: 'transparent' }}
        _hover={{ color: 'ink.action-primary-hover' }}
        data-testid={SettingsSelectors.SigningAccountCard}
        onClick={toggleSwitchAccount}
        variant="text"
        maxWidth="100%"
        minWidth={0}
        overflow="hidden"
      >
        <Flex align="center" overflow="hidden" minWidth={0}>
          <AccountNameLayout
            isLoading={isFetchingBnsName}
            data-testid={SettingsSelectors.CurrentAccountDisplayName}
            textStyle="label.01"
          >
            {name}
          </AccountNameLayout>

          <Box mt="space.01" ml="space.02" flexShrink={0}>
            <ChevronDownIcon variant="small" />
          </Box>
        </Flex>
      </Link>
    </Flex>
  );
}
