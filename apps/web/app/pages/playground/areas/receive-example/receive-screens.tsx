import { useState } from 'react';
import { useSearchParams } from 'react-router';

import { Stack, styled } from 'leather-styles/jsx';

import {
  BtcAvatarIcon,
  Button,
  Caption,
  CheckmarkIcon,
  CopyIcon,
  ItemLayout,
  Pressable,
  StxAvatarIcon,
} from '@leather.io/ui';

import type { ScreenProps } from '../../shared/exploration/exploration-config';
import { HelperText } from '../../shared/recipes/inline-info';
import {
  ReceiveAddressBlock,
  ReceiveAssetIdentity,
} from '../../shared/recipes/receive-asset-identity';
import { FramePage } from '../../shared/recipes/tab-page';

const protocols = {
  segwit: {
    name: 'Native SegWit',
    caption: 'BTC from exchanges and wallets',
    address: 'bc1q530dz4h80kwlzywlhx2qn0k6vdtftd93c499yq',
    reminder: 'Only send Bitcoin to this address.',
  },
  taproot: {
    name: 'Taproot',
    caption: 'Ordinals and Runes',
    address: 'bc1putuzj9lyfcm8fef9jpy85nmh33cxuq9u6wyuk536t9kemdk37yjqmkc0pg',
    reminder: 'Only send Bitcoin to this address.',
  },
  stacks: {
    name: 'Stacks',
    caption: 'STX, sBTC, USDCx and Stacks NFTs',
    address: 'SPS8CKF63P16J28AYF7PXW9E5AACH0NZNTEFWSFE',
    reminder: 'Only send on the Stacks network.',
  },
};

type Protocol = keyof typeof protocols;

function selectedProtocol(value: string | null): Protocol {
  if (value === 'taproot' || value === 'stacks') return value;
  return 'segwit';
}

function accountName(stress: boolean) {
  return stress ? 'Treasury account for operations and long-term reserves' : 'Account 1';
}

function useReceiveNavigation() {
  const [params, setParams] = useSearchParams();
  function go(screen: string, protocol?: Protocol) {
    setParams(
      previous => {
        const next = new URLSearchParams(previous);
        next.set('v', 'fixed');
        next.set('screen', screen);
        if (protocol) next.set('protocol', protocol);
        return next;
      },
      { preventScrollReset: true }
    );
  }
  return { params, go };
}

interface ProtocolRowProps {
  protocol: Protocol;
  stress: boolean;
  onOpen(): void;
}

function ProtocolRow({ protocol, stress, onOpen }: ProtocolRowProps) {
  const entry = protocols[protocol];
  const caption =
    protocol === 'stacks' && stress
      ? 'STX, sBTC, USDCx, Stacks NFTs and other tokens on the Stacks network'
      : entry.caption;
  return (
    <Pressable my="space.02" onClick={onOpen}>
      <ItemLayout
        img={protocol === 'stacks' ? <StxAvatarIcon /> : <BtcAvatarIcon />}
        titleLeft={<ReceiveAssetIdentity protocol={protocol} context="row" />}
        captionLeft={
          <Caption color="ink.text-secondary" whiteSpace="normal">
            {caption}
          </Caption>
        }
        showChevron
      />
    </Pressable>
  );
}

export function ChooseScreen({ frame }: ScreenProps) {
  const { params, go } = useReceiveNavigation();
  const stress = params.get('stress') === 'long';
  return (
    <FramePage
      frame={frame}
      title="Receive"
      onClose={() => go('closed')}
      pinned={
        <styled.p textStyle="label.02" color="ink.text-primary">
          {accountName(stress)}
        </styled.p>
      }
    >
      <Stack gap="space.04">
        <ProtocolRow protocol="segwit" stress={stress} onOpen={() => go('segwit', 'segwit')} />
        <ProtocolRow protocol="taproot" stress={stress} onOpen={() => go('taproot', 'taproot')} />
        <ProtocolRow protocol="stacks" stress={stress} onOpen={() => go('stacks', 'stacks')} />
      </Stack>
    </FramePage>
  );
}

interface DetailScreenProps extends ScreenProps {
  protocol: Protocol;
  copied?: boolean;
}

function DetailScreen({ frame, protocol, copied = false }: DetailScreenProps) {
  const { params, go } = useReceiveNavigation();
  const [copyError, setCopyError] = useState(false);
  const entry = protocols[protocol];
  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(entry.address);
      setCopyError(false);
      go('copied', protocol);
    } catch {
      setCopyError(true);
    }
  }
  return (
    <FramePage
      frame={frame}
      title="Receive"
      onBack={() => go('choose')}
      onClose={() => go('closed')}
      footer={
        <Button
          fullWidth
          iconStart={copied ? <CheckmarkIcon /> : <CopyIcon />}
          onClick={() => void copyAddress()}
        >
          {copied ? 'Copied' : 'Copy address'}
        </Button>
      }
    >
      <ReceiveAddressBlock
        protocol={protocol}
        address={entry.address}
        accountName={accountName(params.get('stress') === 'long')}
        reminder={entry.reminder}
        feedback={
          <>
            {copied ? (
              <styled.span role="status" srOnly>
                Copied
              </styled.span>
            ) : null}
            {copyError ? <HelperText centered>Unable to copy. Try again.</HelperText> : null}
          </>
        }
      />
    </FramePage>
  );
}

export function SegwitScreen(props: ScreenProps) {
  return <DetailScreen {...props} protocol="segwit" />;
}

export function TaprootScreen(props: ScreenProps) {
  return <DetailScreen {...props} protocol="taproot" />;
}

export function StacksScreen(props: ScreenProps) {
  return <DetailScreen {...props} protocol="stacks" />;
}

export function CopiedScreen(props: ScreenProps) {
  const [params] = useSearchParams();
  return <DetailScreen {...props} protocol={selectedProtocol(params.get('protocol'))} copied />;
}

export function ClosedScreen({ frame }: ScreenProps) {
  const { params, go } = useReceiveNavigation();
  return (
    <FramePage
      frame={frame}
      title="Account"
      footer={
        <Button fullWidth onClick={() => go('choose')}>
          Receive
        </Button>
      }
    >
      <styled.p textStyle="label.01" color="ink.text-primary">
        {accountName(params.get('stress') === 'long')}
      </styled.p>
      <HelperText>Receive is closed.</HelperText>
    </FramePage>
  );
}
