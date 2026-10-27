// Recipe: a row in a list of assets, accounts or addresses. Pressable +
// ItemLayout, as the extension's asset and account lists do, so hover, pressed
// and focus-visible come with it. Each preset mirrors one shipped row, type and
// ink included (see `mirrors` below). Not for key-value facts on a review:
// that is ReviewRow.
//
// Interaction rules the base row enforces:
// - One hover per row. Nested actions (copy, QR) sit inside the row's hover and
//   show their own square IconButton hover on top. Never a split hover.
// - The hover bleeds space.03 (12px) around the content; rows keep space.02
//   above and below, so content stays 16px apart and a hover never covers the
//   next row. Don't stack rows with a smaller gap, or other content closer than
//   space.04 to a row.
// - The left title is centred vertically against two-line right content
//   (ItemLayout does this).
// - No chevron by default. A chevron means "opens a deeper view": pass
//   `navigates` together with the onClick that opens it. Pick rows that select
//   and return, display rows and rows with nested actions have none. A row with
//   `navigates` but no onClick draws no chevron, and lint
//   (design-system/no-dead-chevron) flags it, as on round 3's address books.
import type { ReactElement, ReactNode } from 'react';

import { Box, HStack, styled } from 'leather-styles/jsx';

import {
  Avatar,
  IconButton,
  InlineIcon,
  type InlineIconProps,
  ItemLayout,
  Pressable,
  UserIcon,
} from '@leather.io/ui';
import { truncateMiddle } from '@leather.io/utils';

import { defineRecipeMeta } from './recipe-meta';

export const listRowMeta = defineRecipeMeta({
  name: 'List row (AssetRow, AccountRow, AddressRow)',
  mirrors:
    'apps/extension/src/app/components/crypto-asset-item/crypto-asset-item.layout.tsx, components/account/account-list-item.layout.tsx, pages/receive/components/receive-item.tsx',
  useWhen: [
    'A pickable or openable asset, account or address in a list',
    'Default: no chevron. navigates + onClick: the row opens a deeper view that exists in the flow (token details, a contact page). Only then it shows a chevron',
    'actions: up to two icon actions (copy, QR) inside the row; the row keeps one hover',
  ],
  dontUseWhen: [
    {
      situation: 'A pick row that selects and returns',
      use: 'the same row without navigates (no chevron)',
    },
    {
      situation: 'A list whose detail view is not designed yet (address book entry)',
      use: 'no navigates until the detail screen exists; say so in NOTES.md',
    },
    {
      situation: 'An important action on a row (Save this address)',
      use: 'a labelled Button under the row or in the footer (LabelledAction / PostActionPrompt), not a bare + icon',
    },
    { situation: 'Key-value facts on a review', use: 'ReviewRow' },
    { situation: 'A primary screen action such as Add or Save', use: 'the page footer, not a row' },
  ],
});

interface RowAction {
  label: string;
  icon: ReactElement;
  onClick(): void;
}

interface ListRowProps {
  title: ReactNode;
  caption?: ReactNode;
  leading?: ReactNode;
  value?: ReactNode;
  valueCaption?: ReactNode;
  isSelected?: boolean;
  // Opens a deeper view: shows the chevron. Needs onClick.
  navigates?: boolean;
  actions?: RowAction[];
  onClick?(): void;
}

// IconButton is a 40px square; actions sit space.01 apart. The group hangs
// space.02 (the button's inner space) past the row's right edge, so the last
// glyph lands on the page rail like a value or a chevron would; its square
// hover bleeds into the gutter, as the row's hover does.
function actionsWidth(count: number) {
  return `calc(${count} * 40px + ${count - 1} * 4px - 8px)`;
}

function ListRow({
  title,
  caption,
  leading,
  value,
  valueCaption,
  isSelected,
  navigates = false,
  actions,
  onClick,
}: ListRowProps) {
  const rowActions = actions ?? [];
  const hasActions = rowActions.length > 0;
  const content = (
    <ItemLayout
      img={leading}
      titleLeft={title}
      captionLeft={caption ?? null}
      titleRight={hasActions ? null : value}
      captionRight={hasActions ? null : valueCaption}
      isSelected={isSelected}
      showChevron={navigates && Boolean(onClick) && !hasActions}
    />
  );
  if (!hasActions) {
    if (!onClick) return <Box my="space.02">{content}</Box>;
    return (
      <Pressable my="space.02" onClick={onClick}>
        {content}
      </Pressable>
    );
  }
  // Nested actions are siblings drawn over the row's right edge (a button
  // can't contain buttons). The row's hover stays on while the pointer is on
  // an action, through the wrapper's group hover.
  return (
    <Box className="group" position="relative" my="space.02">
      {onClick ? (
        <Pressable
          onClick={onClick}
          pr={actionsWidth(rowActions.length)}
          _groupHover={{ _before: { bg: 'ink.component-background-hover' } }}
        >
          {content}
        </Pressable>
      ) : (
        <Box pr={actionsWidth(rowActions.length)}>{content}</Box>
      )}
      <HStack
        gap="space.01"
        position="absolute"
        right="-space.02"
        top="50%"
        transform="translateY(-50%)"
        zIndex={1}
      >
        {rowActions.map(action => (
          <IconButton
            key={action.label}
            icon={action.icon}
            aria-label={action.label}
            onClick={action.onClick}
          />
        ))}
      </HStack>
    </Box>
  );
}

interface AssetRowProps {
  icon: ReactNode;
  name: string;
  symbol: string;
  balance: string;
  fiat: string;
  // An icon on the balance line (LockIcon for a partly locked balance). It
  // inherits the line's ink and sits on the text line.
  balanceIcon?: InlineIconProps['icon'];
  navigates?: boolean;
  onClick?(): void;
}

// Asset: fiat on the right, the balance under it. Mirrors CryptoAssetItemLayout:
// title and fiat label.01; symbol and balance label.03 in ink.text-primary
// (not a subdued caption).
export function AssetRow({
  icon,
  name,
  symbol,
  balance,
  fiat,
  balanceIcon,
  navigates,
  onClick,
}: AssetRowProps) {
  return (
    <ListRow
      leading={icon}
      title={
        <styled.span textStyle="label.01" overflow="hidden" textOverflow="ellipsis">
          {name}
        </styled.span>
      }
      caption={
        <styled.span textStyle="label.03" color="ink.text-primary">
          {symbol}
        </styled.span>
      }
      value={<styled.span textStyle="label.01">{fiat}</styled.span>}
      valueCaption={
        <styled.span textStyle="label.03" color="ink.text-primary">
          {balanceIcon ? <InlineIcon icon={balanceIcon} placement="start" /> : null}
          {balance}
        </styled.span>
      }
      navigates={navigates}
      onClick={onClick}
    />
  );
}

interface AccountRowProps {
  avatar: ReactNode;
  name: string;
  address: string;
  balance?: string;
  isSelected?: boolean;
  onClick?(): void;
}

// Account: mirrors AccountListItemLayout. Strings go to ItemLayout as they are,
// so its own defaults apply: name and balance label.02, address caption.01 in
// ink.text-subdued.
export function AccountRow({
  avatar,
  name,
  address,
  balance,
  isSelected,
  onClick,
}: AccountRowProps) {
  return (
    <ListRow
      leading={avatar}
      title={name}
      caption={truncateMiddle(address, 4)}
      value={balance}
      isSelected={isSelected}
      onClick={onClick}
    />
  );
}

interface AddressRowProps {
  address: string;
  name?: string;
  leading?: ReactNode;
  // A second-line note after the address ("Last sent 2 Oct").
  note?: string;
  // Opens a deeper view (contact details). A pick row leaves it off.
  navigates?: boolean;
  actions?: RowAction[];
  onClick?(): void;
}

// Address: a contact name with the truncated address under it, or the
// truncated address alone. Same type as AccountRow. Never slice an address by hand.
export function AddressRow({
  address,
  name,
  leading,
  note,
  navigates,
  actions,
  onClick,
}: AddressRowProps) {
  const short = truncateMiddle(address, 4);
  const caption = name ? [short, note].filter(Boolean).join(' · ') : note;
  return (
    <ListRow
      leading={leading ?? <Avatar icon={<UserIcon />} />}
      title={name ?? short}
      caption={caption}
      navigates={navigates}
      actions={actions}
      onClick={onClick}
    />
  );
}
