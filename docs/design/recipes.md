# Composition recipes

These recipes define the shared compositions agents and people reuse for Leather UI. Every Playground
variant composes its screens from them, and from `@leather.io/ui` for anything smaller. If no
recipe fits, don't invent a one-off: follow the escalation step in [explore.md](./explore.md).

The recipes live in `apps/web/app/pages/playground/shared/recipes/` and render live at
`/playground/recipes`. Each one is built only from `@leather.io/ui`, `leather-styles/jsx` and
tokens, and mirrors how the extension composes the same thing today.

| Recipe                            | Import from `shared/recipes/…`              | Use for                                              |
| --------------------------------- | ------------------------------------------- | ---------------------------------------------------- |
| [Popup page shell](#popup-page)   | `popup-page` → `PopupPage`                  | Any full screen in the 390×600 popup                 |
| [Tab page shell](#tab-page)       | `tab-page` → `TabPage`, `FramePage`         | The same screen in a full tab or on web              |
| [List row](#list-row)             | `list-row` → `AssetRow`, `AccountRow`, …    | A pickable asset, account or address                 |
| [Review sheet](#review-sheet)     | `review-sheet` → `ReviewSheet`, `ReviewRow` | Confirming a task: headline, rows, action            |
| [Amount display](#amount-display) | `amount-display` → `AmountDisplay`          | The one hero amount on a screen (send, review, sent) |
| [Section header](#section-header) | `section-header` → `SectionHeader`          | Splitting a list or review into groups               |
| [Inline info](#inline-info)       | `inline-info` → `InfoLabel`, `HelperText`   | Optional background and visible decision context     |
| [Footer actions](#footer-actions) | `page-actions` → `PageActions`              | Add, Save, Continue, Done: the screen's actions      |
| [Page notice](#page-notice)       | `page-notice` → `PageNotice`                | A persistent problem at the top of its region        |
| [Address QR](#address-qr)         | `address-qr` → `AddressQr`                  | Receive QR with the asset's token icon               |

Documented recipe metadata (`listRowMeta`, `reviewSheetMeta`, …) provides `mirrors` (the
extension file it copies), `useWhen` and `dontUseWhen`. Small recipe parts such as `PageActions`
and `PageNotice` are used through their parent compositions. `/playground/recipes` prints it under
the demo. Product mirrors are copied type for type: when one disagrees with the extension,
the recipe is the bug. Owner-reviewed new directions are explicitly labelled; they are not
evidence of what ships today.

Links: `/playground/recipes?recipe=<id>&frame=popup|request-window|tab&theme=light|dark`.

**Frames.** Screens render inside `DeviceFrame` from `shared/exploration/frame.tsx`. The popup
sizes come from the tokens: popup = the toolbar popup, `popupWidth` × `dialogHeight` (390×600);
request-window = the app-request window, `popupWidth` × `popupHeight` (390×756), laid out like
the popup; tab = 1280×800 with a 500px column. The frame is the scroll container, so a sticky footer
pins to its bottom edge. Anything `@leather.io/ui` portals (`Sheet`, `Popover`, `DropdownMenu`,
tooltips) escapes the frame and its theme. That's why `ReviewSheet` draws inline. In product code,
use the real `Sheet`.

## Popup page

Header with back, an optional title and close (or `trailing`, e.g. Send's settings); an optional
`pinned` region; a body; a footer with typed `actions`. Task mode has one solid action;
management mode uses outline actions. Use it for every full popup screen. A focused sub-task over the current screen is a sheet instead.

- **Scrolling.** The header and `pinned` (the recipient field over a contact list, a search field)
  stay fixed; only the body scrolls; the footer stays at the bottom. Never scroll the header away
  with the list (Phantom's send keeps "To" in place; so does this shell).
- **One gutter.** `pageGutter` (space.05, 24px) is the only horizontal padding: rows, inputs,
  section headers and the footer sit on it, and the header's back and trailing glyphs land on it
  (16px header inset + the 40px IconButton's 8px). Both header slots are 40px, so the header stays
  symmetric with one icon. Check a render with `pnpm design:align <url>`.

```tsx
<PopupPage
  title="Send"
  onBack={onBack}
  actions={{ primary: { label: 'Continue', onClick: onContinue } }}
>
  <SectionHeader title="From" />
  <AccountRow avatar={avatar} name="Account 1" address={address} balance="$4,212.80" />
</PopupPage>
```

`/playground/recipes?recipe=popup-page` · `popup-page-popup-light.png`, `-popup-dark`, `-tab-light`, `-tab-dark`

## Tab page

The same header, body and footer in a bordered card, in a centred 500px column (the extension's
full-page tab). The footer sits under the content. Variants that get a `frame` prop use
`FramePage`, which picks the popup or tab shell. All three accept `actions` and a `notice`
descriptor. Use `actions` for ordinary screen actions; `customFooter` is a deliberate escape
hatch for a composition those descriptors cannot express. The types prevent passing both.

```tsx
<FramePage frame={frame} title="Choose asset" onBack={onBack}>
  {children}
</FramePage>
```

`/playground/recipes?recipe=tab-page` · `tab-page-tab-light.png`, `-tab-dark`, `-popup-light`, `-popup-dark`

## List row

`Pressable` + `ItemLayout`, as the extension's asset and account lists. Hover, pressed and
focus-visible come with it. The presets share one internal base row and mirror the shipped rows
type for type: `AssetRow` = `CryptoAssetItemLayout` (second lines `label.03` in
`ink.text-primary`, not a subdued caption), `AccountRow` = `AccountListItemLayout`. If you need a
new kind of row, add a preset here rather than building a row in a variant. Addresses are
truncated with `truncateMiddle`.

- **One hover per row.** Copy or QR inside a row are `actions`: square `IconButton`s drawn over
  the row, which keeps its hover while the pointer is on them. Never split a row into two hovers.
- **Hovers never overlap.** A `Pressable`'s hover bleeds `space.03` (12px) around its content.
  Rows keep `space.02` above and below, so content stays 16px apart; keep other content (a title,
  a total) at least `space.04` from any `Pressable`, or the hover covers it.
- **Left title centred** against two-line right content (ItemLayout does it).
- **No chevron by default.** Pass `navigates` with the `onClick` that opens another screen (token
  details, a contact page) that exists in the flow. Pick rows, display rows and rows with actions
  have none; `navigates` without a real `onClick` draws nothing and lint (`no-dead-chevron`) and
  the promote report flag it.
- **Row actions on the rail.** The action group hangs 8px past the row, so its last glyph lines up
  with the rail like a chevron or value. An important action is not a bare `+`: use a labelled
  `Button` in its block or the footer.
- **Second-line notes** ("Last sent 2 Oct") go in the caption (`note`), not under a section label.

```tsx
<AssetRow icon={<SbtcAvatarIcon />} name="sBTC" symbol="sBTC" balance="0.015" fiat="$975.00" navigates onClick={onOpen} />
<AssetRow icon={<StxAvatarIcon />} name="Stacks" symbol="STX" balance="1,204.50" fiat="$903.38" balanceIcon={LockIcon} onClick={onOpen} />
<AccountRow avatar={<Avatar fallback="A1" />} name="Account 1" address={address} isSelected onClick={onPick} />
<AddressRow name="Alex Huth" address={address} note="Last sent 2 Oct" onClick={onPick} />
<AddressRow leading={<BtcAvatarIcon />} name="Native Segwit" address={address} actions={[
  { label: 'Copy address', icon: <CopyIcon />, onClick: onCopy },
  { label: 'Show QR code', icon: <QrCodeIcon />, onClick: onQr },
]} />
```

`/playground/recipes?recipe=list-row` · `list-row-popup-light.png`, `-popup-dark`, `-tab-light`, `-tab-dark`

## Review sheet

The amount, key-value rows and typed `actions`. This inline Playground demo draws a bottom
sheet in popup and a centred dialog in tab. It keeps the header and actions in reach while the
bounded body scrolls. It does not provide production modal focus management or focus trapping:
use `Sheet` + `SheetHeader` from `@leather.io/ui` in product code, with `PageActions` in its
`footer` (see [Footer actions](#footer-actions)). Labels
are `ink.text-secondary` because the reader is deciding; values are `label.02` (never mono, no
`tabular-nums`). Fiat goes in the row caption. The amount goes in `amount` (drawn by
`AmountDisplay`, so it matches the send form); the recipient uses `AddressDisplayer`. `ReviewRow`
also works on a review page.

```tsx
<ReviewSheet
  frame={frame}
  title="Review"
  onClose={onClose}
  amount={{ amount: '0.00500000', symbol: 'sBTC', fiat: '~ $325.00' }}
  actions={{ primary: { label: 'Send', onClick: onSend, pending: isSending } }}
  callout={warningMessage ? { variant: 'warning', message: warningMessage } : undefined}
>
  <ReviewRow
    label="Fee"
    value="0.00002000 sBTC"
    caption="$1.30"
    info="Paid to the network, not to Leather."
  />
  <ReviewRow label="Total" value="0.00502000 sBTC" caption="$326.30" />
</ReviewSheet>
```

`/playground/recipes?recipe=review-sheet` · `review-sheet-popup-light.png`, `-popup-dark`, `-tab-light`, `-tab-dark`

## Amount display

The amount the screen is about with fiat under it in `ink.text-subdued`, once per screen. One
recipe everywhere: `size="entry"` on the send form (`heading.02`), `summary` on review and sent
(`heading.03`). The amount → fiat gap is the recipe's `amountFiatGap` (space.02) on every screen;
never rebuild the markup with your own `mt`/`mb` (round 3 had 12px on send, 4px on review).
`ReviewSheet amount` uses it. Product code formats `Money` with `Balance` and
`formatCurrency`.

```tsx
<AmountDisplay size="entry" amount="0.00500000" symbol="sBTC" fiat="~ $325.00" />
```

`/playground/recipes?recipe=amount-display` · `amount-display-popup-light.png`, `-popup-dark`, `-tab-light`, `-tab-dark`

## Section header

A `label.02` label in `ink.text-secondary` above a group of rows, with an optional ghost action
whose label lines up with the row values. Not a page title.

```tsx
<SectionHeader title="Contacts" action={{ label: 'View all', onClick: onViewAll }} />
```

`/playground/recipes?recipe=section-header` · `section-header-popup-light.png`, `-popup-dark`, `-tab-light`, `-tab-dark`

## Inline info

`InfoLabel` puts the explanation behind an info icon (a `BasicTooltip`, focusable by keyboard).
`HelperText` keeps concise decision or safety context visible; there is no fixed sentence
quota. Only optional background belongs behind the tooltip or disclosure. Required information
must remain visible. It is a `p`, so it wraps with `text-wrap: pretty` (no single word alone on
the last line; set globally by the panda preset, headings get `balance`). A sentence in a `span` needs `textWrap="pretty"`.

**Icons next to words** use `InlineIcon` from `@leather.io/ui`, placed inside the text element:
it inherits the text's ink through `currentColor` (or takes a lighter step with `tone`), is 16px
beside body, label and caption text, and sits centred on the first text line. A bare `*Icon`
defaults to `ink.action-primary-default`, darker than secondary or subdued text: that is how
round 2 got info icons, chevrons, locks and user icons heavier than their words.

A problem the user has to act on is a `Callout`, **edge to edge** at the top of the region it is
about: the full sheet width under a review's amount (`ReviewSheet callout`), or the full column
above a list. Never a Callout dropped between rows as a note: use `HelperText` or the row caption.

```tsx
<InfoLabel label="Fee" info="Paid to the network, not to Leather." />
<HelperText centered>Available: 0.01500000 sBTC</HelperText>
<styled.span textStyle="label.03" color="ink.text-primary">
  <InlineIcon icon={LockIcon} placement="start" />
  1,000.00 STX locked
</styled.span>
```

`/playground/recipes?recipe=inline-info` · `inline-info-popup-light.png`, `-popup-dark`, `-tab-light`, `-tab-dark`

## Footer actions

The screen's actions (Continue, Send, Save, Add address, Done) live in the footer. Import
`PageActions` from `shared/recipes/page-actions`; page shells render it from `actions`.

- `primary` is required; `secondary` is optional and renders before it. Each descriptor takes
  `label`, `onClick`, optional `disabled`, `pending` and `iconStart`. Only `primary` takes
  `intent: 'danger'` for a destructive confirm.
- The default `mode="task"` renders one solid primary and an outline secondary. Never pair
  competing finishers such as Save and Done; choose the action that finishes the task.
- `mode="management"` renders both as outline actions. For Add address + Manage, the labelled
  Add action includes `PlusIcon`; the recipe owns equal columns and the `space.04` gap.
- If either descriptor is `pending`, both actions are disabled while that action shows its busy
  state. Long labels wrap without changing the shared action hierarchy.
- For a native form, use `type: 'submit'` and `form: 'form-id'` on the primary and handle
  submission on that form. The button can remain in the footer outside the form body; Enter
  and native validation still work. Ordinary command actions require `onClick` and remain
  `type="button"`. Do not submit manually from both `onClick` and the form's `onSubmit`.
- Use `customFooter` only when a deliberate composition cannot use the descriptors. It is
  mutually exclusive with `actions`, rather than the default way to add buttons.

```tsx
<FramePage
  frame={frame}
  title="Address book"
  onBack={onBack}
  actions={{
    mode: 'management',
    secondary: { label: 'Add address', iconStart: PlusIcon, onClick: onAdd },
    primary: { label: 'Manage', onClick: onManage },
  }}
>
  {children}
</FramePage>
```

Use the same `PageActions` as a real `Sheet` footer. `Sheet` supplies the modal behavior and
footer placement; don't add a second `PageFooter` around the actions.

```tsx
import { PageActions } from '~/pages/playground/shared/recipes/page-actions';

import { Sheet, SheetHeader } from '@leather.io/ui';

<Sheet
  title="Edit fee"
  description="Choose the transaction fee"
  isShowing={isShowing}
  onClose={onClose}
  header={<SheetHeader title="Edit fee" />}
  footer={
    <PageActions
      secondary={{ label: 'Cancel', onClick: onClose }}
      primary={{ label: 'Save', onClick: onSave, disabled: !isValid, pending: isSaving }}
    />
  }
>
  {content}
</Sheet>;
```

The import above is for the web Playground. When moving a composition into product code, move
its shared action recipe with it or use the existing app composition that fits the workflow.

`/playground/recipes?recipe=footer-actions`

## Page notice

Pass `notice={{ variant: 'error', message: '…' }}` to `FramePage`, `PopupPage` or `TabPage` for a
persistent issue at the start of the body. In `ReviewSheet`, use the same descriptor as `callout`;
it renders under the amount or headline. Variants match `Callout`: `default`, `info`, `success`,
`warning`, `error`.

`PageNotice` cancels the recipe's `space.05` gutter to reach the full region width. Let the shell
place it; don't wrap it in more padding or inset it between rows. Direct use requires a parent
with that same gutter. Errors use `role="alert"`; the other variants use `role="status"`.

```tsx
<FramePage
  frame={frame}
  title="Send"
  notice={{ variant: 'error', message: 'Unable to estimate the fee. Try again.' }}
  actions={{ primary: { label: 'Continue', onClick: onContinue, disabled: true } }}
>
  {children}
</FramePage>
```

## Address QR

When an asset is the subject of a screen, show its token icon: `BtcAvatarIcon`,
`StxAvatarIcon`, `SbtcAvatarIcon`, `UsdcxAvatarIcon`, or `Sip10AvatarIcon` / `AssetAvatarIcon`
(all `@leather.io/ui`). `AddressQr` puts it in the QR centre (error correction H, so it still
scans), at the extension's QR size and ink.

```tsx
<AddressQr address={address} icon={<BtcAvatarIcon />} />
```

`/playground/recipes?recipe=address-qr`

## Adding or changing a recipe

A recipe is added when a second exploration needs the same composition. Build it from
`@leather.io/ui` and tokens only, mirror the extension's composition (cite it in the meta's
`mirrors`), add a demo and its meta in `areas/recipes/recipe-demos.tsx`, take the four
screenshots, and add a section here. When a variant is promoted, the recipes it uses move with it
into the app (or into `packages/ui` with a meta file).

## Receive asset identity

**Incident:** Receive review, 26 Oct 2026; the corrected pattern is shown in
[`receive-example`](../../apps/web/app/pages/playground/areas/receive-example/README.md).
both independent attempts repeated “Receive” in the top bar and again in a large body heading,
with parenthesized protocol names. Their three-row chooser added Bitcoin and Stacks section
headings that supplied no useful grouping. Fab approved the following direction. This is a new
pattern, not a literal mirror of the extension.

Import `ReceiveAssetIdentity` from `shared/recipes/receive-asset-identity`.
Its `protocol` is `segwit | taproot | stacks`; `context` is `row | detail`.
It owns the display strings rather than taking an arbitrary task title:

- Keep “Receive” once in the page header. The body identifies the asset; don't repeat the task
  verb in a second heading. More generally, a body heading below a task title must add distinct
  information, rather than restate the same task.
- “Bitcoin” is followed by the existing `Badge`: “Native SegWit” or “Taproot”, `size="sm"`,
  `textColor="primary"`. Use the same chip and wording in chooser and detail, without brackets.
- “Stacks” stands alone. For this three-option chooser, use one flat list without category
  headings. Purpose captions and account context remain; they are not extra section headings.
- Use the existing row spacing and one gutter. Receive detail spacing is fixed by
  `ReceiveAddressBlock`, not a choice between A and B.

```tsx
<FramePage frame={frame} title="Receive" onBack={onBack}>
  <ReceiveAddressBlock
    protocol="taproot"
    address={address}
    accountName="Account 1"
    reminder="Only send Bitcoin to this address."
  />
</FramePage>
```

`ReceiveAddressBlock` takes `protocol`, `address`, `accountName`, `reminder` and optional
`feedback` (a React node for success/error announcements). The caller keeps clipboard and
navigation behavior. There are no spacing props to vary per concept:

- `space.05` (24px) between the identity, QR, account/address group and reminder.
- `space.04` (16px) between account name and address.
- Full address centered at a maximum measure of 300px; no extra top padding inside the block.
- The existing page gutter remains `space.05` (24px).

The source for this grouping is
[`receive-tokens.layout.tsx`](../../apps/extension/src/app/pages/receive/components/receive-tokens.layout.tsx):
account name has `mt="space.05"`, address has `mt="space.04"` and `maxWidth="300px"`.
The task title/chip treatment remains the owner-reviewed new direction. This combines the
shipped relationships in one shared composition; it does not select an A/B aesthetic winner.

The same identity goes in `ItemLayout.titleLeft` with `context="row"`.
Live example: `/playground/recipes?recipe=receive-asset-identity`.

**Review check:** compare chooser and all three detail screens in light/dark and narrow/long
states. “Receive” appears once per screen; asset and protocol match across navigation; no
parenthesized protocol or redundant group headings. The typed recipe prevents free-form duplicate
titles within this composition. Semantic repetition elsewhere still needs visual review; no
static lint guarantee is claimed.

**Checks from the Receive review:** repeating the task verb in the body; placing the protocol in
brackets; differing chooser/detail protocol labels; adding headings to the three-row list;
recomposing the shared address block with different gaps or address width.
The post-review A/B edits demonstrate the approved pattern, not fresh-agent adherence to it.
