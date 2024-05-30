import { ReactNode } from 'react';

import { Box, Flex, styled } from 'leather-styles/jsx';

import { ChevronDownIcon } from '../../icons/index';
import { SettingsSelectors } from '../../tmp/tests/selectors/settings.selectors';
import { Link } from '../link/link.web';
import { SkeletonLoader } from '../skeleton-loader/skeleton-loader.web';
import { AccountNameLayout } from './account-name.web';

interface AccountCardProps {
  name: string;
  balance: string;
  children: ReactNode;
  toggleSwitchAccount(): void;
  isFetchingBnsName: boolean;
  isLoadingBalance: boolean;
}

export function AccountCard({
  name,
  balance,
  toggleSwitchAccount,
  children,
  isFetchingBnsName,
  isLoadingBalance,
}: AccountCardProps) {
  return (
    <Flex
      direction="column"
      border={{ base: 'active', sm: 'unset' }}
      rounded="md"
      px={{ base: 'space.05', sm: '0' }}
      pt={{ base: 'space.05', md: '0' }}
    >
      <Link
        _before={{ bg: 'transparent' }}
        _hover={{ color: 'ink.action-primary-hover' }}
        data-testid={SettingsSelectors.SwitchAccountTrigger}
        onClick={toggleSwitchAccount}
        variant="text"
      >
        <Flex>
          <AccountNameLayout
            isLoading={isFetchingBnsName}
            data-testid={SettingsSelectors.CurrentAccountDisplayName}
            textStyle="label.01"
          >
            {name}
          </AccountNameLayout>

          <Box mt="space.01" ml="space.02">
            <ChevronDownIcon variant="small" />
          </Box>
        </Flex>
      </Link>
      <Flex flexDir={{ base: 'column', md: 'row' }} justify="space-between">
        <Box mb="space.05" mt="space.04">
          <SkeletonLoader width="200px" height="38px" isLoading={isLoadingBalance}>
            <styled.h1 textStyle="heading.02">{balance}</styled.h1>
          </SkeletonLoader>
        </Box>
        {children}
      </Flex>
    </Flex>
  );
}
