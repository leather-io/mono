import CoinsHammockImage from '@assets/images/coins-hammock.png';
import { TokenDetailsSelectors } from '@tests/selectors/token-details.selectors';
import { Stack } from 'leather-styles/jsx';

import { Caption } from '@leather.io/ui';

interface TokenActivityEmptyProps {
  hasBalance: boolean;
}

export function TokenActivityEmpty({ hasBalance }: TokenActivityEmptyProps) {
  return (
    <Stack
      gap="space.04"
      py="space.06"
      alignItems="center"
      justifyContent="center"
      data-testid={TokenDetailsSelectors.TokenDetailsActivityEmpty}
    >
      <img src={CoinsHammockImage} width="160px" alt="" />
      <Caption maxWidth="26ch" textAlign="center">
        {hasBalance ? 'No recent activity for this token' : 'No activity for this token yet'}
      </Caption>
    </Stack>
  );
}
