import { styled } from 'leather-styles/jsx';
import { getUiPackageAssetUrl } from '~/helpers/utils';

import { Button, type ButtonProps, DropdownMenu, Flag, type HasChildren } from '@leather.io/ui';
import { truncateMiddle } from '@leather.io/utils';

export function SignInButtonContainer({ children }: HasChildren) {
  return (
    <styled.div mt="auto" mb="space.04" mx="space.04">
      {children}
    </styled.div>
  );
}

export function SignInButtonLayout(props: ButtonProps) {
  return <Button variant="outline" fullWidth {...props} />;
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
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <styled.button
          userSelect="none"
          mt="auto"
          textAlign="left"
          px="space.04"
          height="56px"
          textStyle="label.03"
          outline="none"
          appearance="none"
          borderTop="default"
          _focusVisible={{ textDecoration: 'underline' }}
        >
          <Flag reverse img={<img src={getUiPackageAssetUrl('icons/chevron-down-16-16.svg')} />}>
            {truncateMiddle(address, 4)}
          </Flag>
        </styled.button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content sideOffset={2}>
          <styled.div mx="space.02" py="space.02">
            <DropdownMenu.Item onSelect={onSwitchAccount}>
              <Flag
                textStyle="label.02"
                img={
                  <img
                    src={getUiPackageAssetUrl('icons/arrow-right-left-16-16.svg')}
                    width="16"
                    height="16"
                  />
                }
              >
                Switch account
              </Flag>
            </DropdownMenu.Item>
            <DropdownMenu.Item onSelect={onSignout}>
              <Flag
                color="red.action-primary-default"
                textStyle="label.02"
                img={
                  <styled.img
                    // Hack to make icon red while icons don't work
                    filter="invert(18%) sepia(94%) saturate(7491%) hue-rotate(359deg);"
                    src={getUiPackageAssetUrl('icons/exit-16-16.svg')}
                    width="16"
                    height="16"
                  />
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
