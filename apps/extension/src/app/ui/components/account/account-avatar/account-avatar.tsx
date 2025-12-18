import { memo } from 'react';

import { Box, CircleProps } from 'leather-styles/jsx';

import { Avatar, getAvatarUrl } from '@leather.io/ui';

function getAccountNumber(index: number) {
  // Always return account number in the Account Circle
  return String(index + 1);
}

interface AccountAvatarProps extends CircleProps {
  publicKey: string;
  index: number;
}
export const AccountAvatar = memo(function AccountAvatar({
  publicKey,
  index,
  ...props
}: AccountAvatarProps) {
  const gradient = `${publicKey}-${index}`;
  const text = getAccountNumber(index);

  return (
    <Box position="relative" width="48px" height="48px" {...props}>
      <Avatar image={getAvatarUrl(gradient)} size="xl" />
      <Box
        position="absolute"
        top={0}
        left={0}
        width="100%"
        height="100%"
        display="flex"
        alignItems="center"
        justifyContent="center"
        textStyle="label.01"
      >
        {text}
      </Box>
    </Box>
  );
});
