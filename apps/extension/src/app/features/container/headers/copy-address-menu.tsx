import { CopyAddressMenuBtn } from '@tests/selectors/home.selectors';
import { css } from 'leather-styles/css';
import { HStack, Stack, styled } from 'leather-styles/jsx';

import {
  Badge,
  BtcAvatarIcon,
  CopyIcon,
  DropdownMenu,
  Flag,
  StxAvatarIcon,
  pressableCaptionStyles,
} from '@leather.io/ui';

import { analytics } from '@shared/utils/analytics';

import { copyToClipboard } from '@app/common/utils/copy-to-clipboard';
import { useToast } from '@app/features/toasts/use-toast';
import { useCurrentAccountAddresses } from '@app/services/accounts/use-account-addresses';

import { type CopyAddressOption, createCopyAddressOptions } from './copy-address-options';

interface CopyAddressMenuProps {
  options: CopyAddressOption[];
  onCopyAddress(option: CopyAddressOption): Promise<void> | void;
}

function AddressOptionIcon({ chain }: Pick<CopyAddressOption, 'chain'>) {
  if (chain === 'bitcoin') return <BtcAvatarIcon size="md" />;
  return <StxAvatarIcon size="md" />;
}

const menuLabelStyles = css({
  color: 'ink.text-primary',
  px: 'space.04',
  pt: 'space.03',
  pb: 'space.02',
  textStyle: 'label.02',
  width: '100%',
});

const menuGroupStyles = css({
  px: 'space.01',
  pt: 'space.01',
  pb: 'space.02',
});

const menuItemWrapperStyles = css({
  px: 'space.03',
  py: 'space.02',
});

const menuItemStyles = css({
  alignItems: 'center',
  _before: {
    top: '-space.02',
    bottom: '-space.02',
  },
  '&:is(:hover, :focus-visible, [data-highlighted]) [data-copy-address-icon]': {
    opacity: 1,
  },
  '&:is(:hover, :focus-visible, [data-highlighted]) [data-copy-address-text]': {
    color: 'ink.text-primary',
  },
});

const copyIconStyles = css({ opacity: 0 });

const addressTailLength = 5;

interface TruncatedAddressProps {
  address: string;
  id: string;
}

function TruncatedAddress({ address, id }: TruncatedAddressProps) {
  return (
    <styled.span
      aria-label={address}
      className={pressableCaptionStyles}
      data-copy-address-text
      data-testid={id}
      display="flex"
      fontSize="11px"
      lineHeight="16px"
      maxWidth="50%"
      minWidth={0}
      textStyle="caption.01"
      whiteSpace="nowrap"
    >
      <styled.span minWidth={0} overflow="hidden" textOverflow="ellipsis">
        {address.slice(0, -addressTailLength)}
      </styled.span>
      <styled.span data-testid={`${id}-suffix`} flexShrink={0}>
        {address.slice(-addressTailLength)}
      </styled.span>
    </styled.span>
  );
}

function CopyAddressMenu({ options, onCopyAddress }: CopyAddressMenuProps) {
  if (!options.length) return null;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.IconButton aria-label="Copy address" data-testid={CopyAddressMenuBtn}>
        <CopyIcon />
      </DropdownMenu.IconButton>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          collisionPadding={8}
          side="bottom"
          sideOffset={8}
          className={css({
            width: '320px',
            maxWidth: 'calc(100vw - 32px)',
            boxShadow: 'elevation',
          })}
        >
          <DropdownMenu.Label className={menuLabelStyles}>
            <span data-testid="copy-address-menu-title">Copy account address</span>
          </DropdownMenu.Label>
          <DropdownMenu.Group className={menuGroupStyles}>
            {options.map(option => (
              <DropdownMenu.Item
                key={option.id}
                aria-label={`Copy ${option.title} ${option.format} address`}
                className={menuItemStyles}
                data-testid={`copy-address-${option.id}`}
                onSelect={() => void onCopyAddress(option)}
                wrapperClassName={menuItemWrapperStyles}
              >
                <Flag
                  img={<AddressOptionIcon chain={option.chain} />}
                  spacing="space.02"
                  width="100%"
                >
                  <HStack gap="space.02" justifyContent="space-between" width="100%">
                    <Stack
                      alignItems="start"
                      flex={1}
                      gap="space.00"
                      minWidth={0}
                      overflow="hidden"
                    >
                      <HStack alignItems="center" gap="space.01" maxWidth="100%">
                        <styled.span textStyle="label.03">{option.title}</styled.span>
                        {option.chain === 'bitcoin' ? (
                          <Badge
                            flexShrink={0}
                            label={option.format}
                            size="xs"
                            whiteSpace="nowrap"
                          />
                        ) : null}
                      </HStack>
                      <TruncatedAddress
                        address={option.address}
                        id={`copy-address-${option.id}-address`}
                      />
                    </Stack>
                    <styled.span
                      aria-hidden
                      className={copyIconStyles}
                      data-copy-address-icon
                      data-testid={`copy-address-${option.id}-icon`}
                    >
                      <CopyIcon variant="small" />
                    </styled.span>
                  </HStack>
                </Flag>
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Group>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export function CurrentAccountCopyAddressMenu() {
  const account = useCurrentAccountAddresses();
  const toast = useToast();
  const options = createCopyAddressOptions(account);

  async function handleCopyAddress(option: CopyAddressOption) {
    try {
      await copyToClipboard(option.address);
    } catch {
      toast.error('Failed to copy address');
      return;
    }

    if (option.chain === 'bitcoin') {
      const type = option.id === 'btc-taproot' ? 'btc-taproot' : 'btc';
      analytics.track('copy_btc_address_to_clipboard', { type });
    } else {
      analytics.track('copy_stx_address_to_clipboard');
    }
    toast.success('Copied to clipboard!');
  }

  return <CopyAddressMenu options={options} onCopyAddress={handleCopyAddress} />;
}
