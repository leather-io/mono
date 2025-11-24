import { memo } from 'react';

import { Box, CircleProps } from 'leather-styles/jsx';

import { DynamicColorCircle } from '@leather.io/ui';

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
  const gradient = publicKey + index.toString();
  const text = getAccountNumber(index);

  return (
    <DynamicColorCircle sizeParam="40" value={gradient} {...props}>
      <Box position="absolute">{text}</Box>
    </DynamicColorCircle>
  );
});
