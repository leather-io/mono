import { styled } from 'leather-styles/jsx';

import {
  ArrowsRepeatLeftRightIcon,
  Button,
  type ButtonProps,
  ChevronDownIcon,
  DropdownMenu,
  ExitIcon,
  Flag,
} from '@leather.io/ui';
import { truncateMiddle } from '@leather.io/utils';

export function SignInButtonLayout(props: ButtonProps) {
  return <Button height="60px !important" borderRadius="0" width="120px" fullWidth {...props} />;
}

interface ActiveAccountButtonLayoutProps {
  address: string;
  onSignout(): void;
  onSwitchAccount(): void;
}
export function ActiveAccountButtonLayout({
  address,
  onSignout,
  onSwitchAccount,
}: ActiveAccountButtonLayoutProps) {
  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>
        <styled.button
          userSelect="none"
          textAlign="left"
          px="space.05"
          height="100%"
          textStyle="label.03"
          outline="none"
          appearance="none"
          borderLeft="default"
          _focusVisible={{ textDecoration: 'underline' }}
        >
          <Flag reverse img={<ChevronDownIcon variant="small" />}>
            {truncateMiddle(address, 4)}
          </Flag>
        </styled.button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content sideOffset={2}>
          <styled.div mx="space.02" py="space.02">
            <DropdownMenu.Item onSelect={onSwitchAccount}>
              <Flag textStyle="label.02" img={<ArrowsRepeatLeftRightIcon variant="small" />}>
                Switch account
              </Flag>
            </DropdownMenu.Item>
            <DropdownMenu.Item onSelect={onSignout}>
              <Flag
                color="red.action-primary-default"
                textStyle="label.02"
                img={
                  <styled.div filter="invert(18%) sepia(94%) saturate(7491%) hue-rotate(359deg);">
                    <ExitIcon variant="small" />
                  </styled.div>
                }
              >
                Sign out
              </Flag>
            </DropdownMenu.Item>
          </styled.div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
