import { Box, styled } from 'leather-styles/jsx';

import { DropdownMenu, Flag } from '@leather.io/ui';

import { ChainAvatar } from '../chain-avatar';
import type { ChainConnection } from './use-chain-connection';

interface SignInItemProps {
  connection: ChainConnection;
  detailed?: boolean;
}

function signInItemTitle(label: string, isPending: boolean, detailed: boolean): string {
  if (isPending) return `Connecting to ${label}…`;
  if (detailed) return label;
  return `Sign in to ${label}`;
}

export function SignInItem({ connection, detailed = false }: SignInItemProps) {
  const { label, description, signIn } = connection;
  return (
    <DropdownMenu.Item
      disabled={signIn.isPending}
      onSelect={event => {
        event.preventDefault();
        signIn.mutate();
      }}
    >
      <Flag textStyle="label.03" img={<ChainAvatar chain={connection.chain} boxSize="32px" />}>
        <Box>
          <styled.span display="block" textStyle="label.03">
            {signInItemTitle(label, signIn.isPending, detailed)}
          </styled.span>
          {detailed && (
            <styled.span display="block" textStyle="caption.01" color="ink.text-subdued">
              {description}
            </styled.span>
          )}
          {signIn.error && (
            <styled.span display="block" textStyle="caption.01" color="red.action-primary-default">
              {signIn.error.message}
            </styled.span>
          )}
        </Box>
      </Flag>
    </DropdownMenu.Item>
  );
}
