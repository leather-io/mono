import type { ComponentType } from 'react';
import { useSearchParams } from 'react-router';

import { Stack, styled } from 'leather-styles/jsx';

import {
  AddressDisplayer,
  Avatar,
  BtcAvatarIcon,
  CopyIcon,
  ItemLayout,
  PlusIcon,
  Pressable,
  StxAvatarIcon,
} from '@leather.io/ui';

import type { FrameId } from '../../shared/exploration/frame';
import { AddressQr, addressQrMeta } from '../../shared/recipes/address-qr';
import { AmountDisplay, amountDisplayMeta } from '../../shared/recipes/amount-display';
import { HelperText, InfoLabel, inlineInfoMeta } from '../../shared/recipes/inline-info';
import { AccountRow, AddressRow, AssetRow, listRowMeta } from '../../shared/recipes/list-row';
import { footerActionsMeta } from '../../shared/recipes/page-header';
import { PopupPage, popupPageMeta } from '../../shared/recipes/popup-page';
import {
  ReceiveAddressBlock,
  ReceiveAssetIdentity,
  receiveAssetIdentityMeta,
} from '../../shared/recipes/receive-asset-identity';
import type { RecipeMeta } from '../../shared/recipes/recipe-meta';
import {
  ReviewDivider,
  ReviewRow,
  ReviewSection,
  ReviewSheet,
  reviewSheetMeta,
} from '../../shared/recipes/review-sheet';
import { SectionHeader } from '../../shared/recipes/section-header';
import { FramePage, TabPage } from '../../shared/recipes/tab-page';
import { recipesMock as mock } from './recipes-mock';

interface DemoProps {
  frame: FrameId;
}

function noop() {
  return undefined;
}

function PopupPageDemo() {
  return (
    <PopupPage
      title="Addresses"
      onClose={noop}
      actions={{ primary: { label: 'Add address', onClick: noop } }}
    >
      <AddressRow name="Alex" address={mock.recipient.address} onClick={noop} />
    </PopupPage>
  );
}

function TabPageDemo() {
  return (
    <TabPage title="Addresses" onBack={noop}>
      <AddressRow name="Alex" address={mock.recipient.address} />
    </TabPage>
  );
}

function ListRowDemo({ frame }: DemoProps) {
  return (
    <FramePage frame={frame} title="Choose account" onBack={noop}>
      <AssetRow
        icon={<BtcAvatarIcon />}
        name="Bitcoin"
        symbol="BTC"
        balance="0.0421"
        fiat="$2,736.50"
        onClick={noop}
      />
      <AccountRow
        avatar={<Avatar fallback="A1" />}
        name={mock.account.name}
        address={mock.account.address}
        balance={mock.account.balance}
        isSelected
        onClick={noop}
      />
      <AddressRow
        name="Alex"
        address={mock.recipient.address}
        note="Last sent 2 Oct"
        onClick={noop}
      />
    </FramePage>
  );
}

function ReviewSheetDemo({ frame }: DemoProps) {
  const [params] = useSearchParams();
  const stress = params.get('stress') === 'long';
  const pending = params.get('state') === 'pending';
  return (
    <ReviewSheet
      frame={frame}
      title="Review"
      onClose={noop}
      amount={{ amount: mock.send.amount, symbol: mock.send.symbol, fiat: mock.send.fiat }}
      actions={{ primary: { label: 'Send', onClick: noop, pending } }}
      callout={
        stress
          ? {
              variant: 'error',
              message:
                'Unable to send to this destination. Check the address and network before trying again.',
            }
          : undefined
      }
    >
      <ReviewSection>
        <ReviewRow label="To" value={<AddressDisplayer address={mock.recipient.address} />} />
        {stress ? (
          <ReviewRow
            label="Account"
            value="Treasury account for operations, payments, and long-term reserves held for the next financial year"
          />
        ) : null}
      </ReviewSection>
      <ReviewDivider />
      <ReviewSection>
        <ReviewRow label="Fee" value={mock.send.fee} caption={mock.send.feeFiat} />
        <ReviewRow label="Total" value={mock.send.total} caption={mock.send.totalFiat} />
        {stress ? <ReviewRow label="Available" value={mock.send.available} /> : null}
        {stress ? <ReviewRow label="Arrival" value={mock.send.time} /> : null}
      </ReviewSection>
    </ReviewSheet>
  );
}

function AmountDisplayDemo({ frame }: DemoProps) {
  return (
    <FramePage frame={frame} title="Send" onBack={noop}>
      <AmountDisplay amount={mock.send.amount} symbol={mock.send.symbol} fiat={mock.send.fiat} />
      <HelperText centered>Available: 0.015 sBTC</HelperText>
    </FramePage>
  );
}

function InlineInfoDemo({ frame }: DemoProps) {
  return (
    <FramePage frame={frame} title="Network fee" onBack={noop}>
      <InfoLabel label="Arrives in about 10 minutes" info="Bitcoin blocks take about 10 minutes." />
      <HelperText>The network sets the final confirmation time.</HelperText>
    </FramePage>
  );
}

function SectionHeaderDemo({ frame }: DemoProps) {
  return (
    <FramePage frame={frame} title="Address book" onBack={noop}>
      <SectionHeader title="Saved" action={{ label: 'Edit', onClick: noop }} />
      <AddressRow name="Alex" address={mock.recipient.address} />
    </FramePage>
  );
}

function FooterActionsDemo({ frame }: DemoProps) {
  const [params] = useSearchParams();
  const stress = params.get('stress') === 'long';
  const pending = params.get('state') === 'pending';
  return (
    <FramePage
      frame={frame}
      title="Address book"
      onClose={noop}
      actions={{
        mode: 'management',
        primary: { label: stress ? 'Manage saved addresses' : 'Manage', onClick: noop, pending },
        secondary: {
          label: stress ? 'Add another saved address' : 'Add address',
          onClick: noop,
          iconStart: <PlusIcon />,
        },
      }}
      notice={
        stress
          ? {
              variant: 'error',
              message: 'Unable to save this address. Check the address and try again.',
            }
          : undefined
      }
    >
      {stress ? (
        mock.contacts.map(contact => (
          <AddressRow key={contact.address} name={contact.name} address={contact.address} />
        ))
      ) : (
        <AddressRow name="Alex" address={mock.recipient.address} />
      )}
    </FramePage>
  );
}

function AddressQrDemo({ frame }: DemoProps) {
  return (
    <FramePage frame={frame} title="Receive" onBack={noop}>
      <Stack alignItems="center" gap="space.04">
        <AddressQr address={mock.newAddress} icon={<BtcAvatarIcon />} />
        <AddressDisplayer address={mock.newAddress} justifyContent="center" />
      </Stack>
    </FramePage>
  );
}

interface ReceiveOption {
  protocol: 'segwit' | 'taproot' | 'stacks';
  caption: string;
}
const receiveOptions: ReceiveOption[] = [
  { protocol: 'segwit', caption: 'BTC from exchanges and wallets' },
  { protocol: 'taproot', caption: 'Ordinals and Runes' },
  { protocol: 'stacks', caption: 'STX, sBTC, USDCx and Stacks NFTs' },
];

function ReceiveChooserDemo({ frame }: DemoProps) {
  return (
    <FramePage frame={frame} title="Receive" onClose={noop}>
      <Stack gap="space.04">
        {receiveOptions.map(option => (
          <Pressable key={option.protocol} my="space.02" onClick={noop}>
            <ItemLayout
              img={option.protocol === 'stacks' ? <StxAvatarIcon /> : <BtcAvatarIcon />}
              titleLeft={<ReceiveAssetIdentity protocol={option.protocol} context="row" />}
              captionLeft={
                <styled.span textStyle="caption.01" color="ink.text-secondary">
                  {option.caption}
                </styled.span>
              }
              showChevron
            />
          </Pressable>
        ))}
      </Stack>
    </FramePage>
  );
}

function ReceiveAssetIdentityDemo({ frame }: DemoProps) {
  return (
    <FramePage
      frame={frame}
      title="Receive"
      onBack={noop}
      actions={{ primary: { label: 'Copy address', iconStart: <CopyIcon />, onClick: noop } }}
    >
      <ReceiveAddressBlock
        protocol="segwit"
        address={mock.newAddress}
        accountName={mock.account.name}
        reminder="Only send Bitcoin to this address."
      />
    </FramePage>
  );
}

export const recipeIds = [
  'popup-page',
  'tab-page',
  'list-row',
  'review-sheet',
  'amount-display',
  'inline-info',
  'section-header',
  'footer-actions',
  'address-qr',
  'receive-chooser',
  'receive-asset-identity',
] as const;
export type RecipeId = (typeof recipeIds)[number];

export const recipeDemos: Record<
  RecipeId,
  { label: string; Demo: ComponentType<DemoProps>; meta?: RecipeMeta }
> = {
  'popup-page': { label: 'Popup page shell', Demo: PopupPageDemo, meta: popupPageMeta },
  'tab-page': { label: 'Tab page shell', Demo: TabPageDemo },
  'list-row': { label: 'List row', Demo: ListRowDemo, meta: listRowMeta },
  'review-sheet': { label: 'Review sheet', Demo: ReviewSheetDemo, meta: reviewSheetMeta },
  'amount-display': { label: 'Amount display', Demo: AmountDisplayDemo, meta: amountDisplayMeta },
  'inline-info': { label: 'Inline information', Demo: InlineInfoDemo, meta: inlineInfoMeta },
  'section-header': { label: 'Section header', Demo: SectionHeaderDemo },
  'footer-actions': { label: 'Footer actions', Demo: FooterActionsDemo, meta: footerActionsMeta },
  'address-qr': { label: 'Address QR', Demo: AddressQrDemo, meta: addressQrMeta },
  'receive-chooser': {
    label: 'Receive chooser',
    Demo: ReceiveChooserDemo,
    meta: receiveAssetIdentityMeta,
  },
  'receive-asset-identity': {
    label: 'Receive address',
    Demo: ReceiveAssetIdentityDemo,
    meta: receiveAssetIdentityMeta,
  },
};
