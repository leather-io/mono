import { styled } from 'leather-styles/jsx';

import {
  ArrowsRepeatLeftRightIcon,
  Button,
  type ButtonProps,
  ChevronDownIcon,
  DropdownMenu,
  ExitIcon,
  Flag,
  WalletSparkleIcon,
} from '@leather.io/ui';
import { truncateMiddle } from '@leather.io/utils';

export function SignInButtonLayout(props: ButtonProps) {
  return <Button alignSelf="center" size="md" {...props} />;
}

interface ActiveAccountButtonLayoutProps {
  address: string;
  onSignout(): void;
  onSwitchAccount(): void;
  onOpenExtension?(): void;
}
export function ActiveAccountButtonLayout({
  address,
  onSignout,
  onSwitchAccount,
  onOpenExtension,
}: ActiveAccountButtonLayoutProps) {
  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>
        <Button textAlign="left" variant="outline" size="md" width="138px" alignSelf="center">
          <Flag reverse spacing="space.01" img={<ChevronDownIcon variant="small" />}>
            {truncateMiddle(address, 4)}
          </Flag>
        </Button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content sideOffset={8} alignOffset={0} align="end">
          <styled.div mx="space.02" py="space.02" width="200px">
            <DropdownMenu.Item onSelect={onSwitchAccount}>
              <Flag textStyle="label.03" img={<ArrowsRepeatLeftRightIcon variant="small" />}>
                Switch account
              </Flag>
            </DropdownMenu.Item>

            {onOpenExtension && (
              <DropdownMenu.Item onSelect={onOpenExtension}>
                <Flag textStyle="label.03" img={<WalletSparkleIcon variant="small" />}>
                  Open extension
                </Flag>
              </DropdownMenu.Item>
            )}
            <DropdownMenu.Item onSelect={onSignout}>
              <Flag
                color="red.action-primary-default"
                textStyle="label.03"
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
