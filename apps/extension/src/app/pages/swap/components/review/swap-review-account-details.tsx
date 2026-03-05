import { Flex, styled } from 'leather-styles/jsx';

import { useCurrentAccountDisplayName } from '@app/common/hooks/account/use-account-names';

export function SwapReviewAccountDetails() {
  const { data: name = 'Account' } = useCurrentAccountDisplayName();

  return (
    <Flex alignItems="center" justifyContent="space-between" py="space.03">
      <styled.span textStyle="label.02" color="ink.text-subdued">
        From
      </styled.span>

      <Flex gap="space.02" alignItems="center">
        <styled.span textStyle="label.02">{name}</styled.span>
      </Flex>
    </Flex>
  );
}
