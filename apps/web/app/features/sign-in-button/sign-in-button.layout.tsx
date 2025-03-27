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
  onOpenExtension(): void;
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
        <DropdownMenu.Content sideOffset={1}>
          <styled.div mx="space.02" py="space.02">
            <DropdownMenu.Item onSelect={onSwitchAccount}>
              <Flag textStyle="label.03" img={<ArrowsRepeatLeftRightIcon variant="small" />}>
                Switch account
              </Flag>
            </DropdownMenu.Item>

            <DropdownMenu.Item onSelect={onOpenExtension}>
              <Flag
                textStyle="label.03"
                img={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M20.5 6C20.5 5.72386 20.2761 5.5 20 5.5H4C3.72386 5.5 3.5 5.72386 3.5 6V18C3.5 18.2761 3.72386 18.5 4 18.5H10C10.2761 18.5 10.5 18.7239 10.5 19C10.5 19.2761 10.2761 19.5 10 19.5H4C3.17157 19.5 2.5 18.8284 2.5 18V6C2.5 5.17157 3.17157 4.5 4 4.5H20C20.8284 4.5 21.5 5.17157 21.5 6V8C21.5 8.27614 21.2761 8.5 21 8.5C20.7239 8.5 20.5 8.27614 20.5 8V6ZM18.388 15.1549C18.2931 15.0381 18.1505 14.9702 18 14.9702C17.8495 14.9702 17.7069 15.0381 17.612 15.1549C17.5444 15.2381 17.4722 15.3182 17.3952 15.3952C17.3182 15.4722 17.2381 15.5444 17.1549 15.612C17.0381 15.7069 16.9702 15.8495 16.9702 16C16.9702 16.1505 17.0381 16.2931 17.1549 16.388C17.2381 16.4556 17.3182 16.5278 17.3952 16.6048C17.4722 16.6818 17.5444 16.7619 17.612 16.8451C17.7069 16.9619 17.8495 17.0298 18 17.0298C18.1505 17.0298 18.2931 16.9619 18.388 16.8451C18.4556 16.7619 18.5278 16.6818 18.6048 16.6048C18.6818 16.5278 18.7619 16.4556 18.8451 16.388C18.9619 16.2931 19.0298 16.1505 19.0298 16C19.0298 15.8495 18.9619 15.7069 18.8451 15.612C18.7619 15.5444 18.6818 15.4722 18.6048 15.3952C18.5278 15.3182 18.4556 15.2381 18.388 15.1549ZM18 11.5C18.2761 11.5 18.5 11.7239 18.5 12C18.5 13.3287 18.794 14.1702 19.3119 14.6881C19.8298 15.206 20.6713 15.5 22 15.5C22.2761 15.5 22.5 15.7239 22.5 16C22.5 16.2761 22.2761 16.5 22 16.5C20.6713 16.5 19.8298 16.794 19.3119 17.3119C18.794 17.8298 18.5 18.6713 18.5 20C18.5 20.2761 18.2761 20.5 18 20.5C17.7239 20.5 17.5 20.2761 17.5 20C17.5 18.6713 17.206 17.8298 16.6881 17.3119C16.1702 16.794 15.3287 16.5 14 16.5C13.7239 16.5 13.5 16.2761 13.5 16C13.5 15.7239 13.7239 15.5 14 15.5C15.3287 15.5 16.1702 15.206 16.6881 14.6881C17.206 14.1702 17.5 13.3287 17.5 12C17.5 11.7239 17.7239 11.5 18 11.5ZM6.5 8C6.5 8.27614 6.27614 8.5 6 8.5C5.72386 8.5 5.5 8.27614 5.5 8C5.5 7.72386 5.72386 7.5 6 7.5C6.27614 7.5 6.5 7.72386 6.5 8ZM9.5 8C9.5 8.27614 9.27614 8.5 9 8.5C8.72386 8.5 8.5 8.27614 8.5 8C8.5 7.72386 8.72386 7.5 9 7.5C9.27614 7.5 9.5 7.72386 9.5 8ZM12.5 8C12.5 8.27614 12.2761 8.5 12 8.5C11.7239 8.5 11.5 8.27614 11.5 8C11.5 7.72386 11.7239 7.5 12 7.5C12.2761 7.5 12.5 7.72386 12.5 8Z"
                      fill="black"
                      stroke="#12100F"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                }
              >
                Open extension
              </Flag>
            </DropdownMenu.Item>
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
