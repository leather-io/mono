# I need to…

Look up the job you're doing and use the component listed next to it. Every snippet below compiles
against the current `@leather.io/ui` and local recipe APIs. The **Seen in** paths point at real usages you can copy.

On web (extension and web app), import from `@leather.io/ui`. On native (mobile), import from
`@leather.io/ui/native`. Layout primitives (`Box`, `Flex`, `Stack`, `styled`) come from
`leather-styles/jsx` on web, and from `@leather.io/ui/native` on native.
Recipes under `~/pages/playground/shared/recipes/` are local to the web Playground, not package
exports; move them with a promoted composition when needed.

If an intent is missing, or the answer is "it depends", that's a gap in the system. Raise it in
`#design-system` instead of building something one-off.

| I need to…                                                                      | Use                                                       |
| ------------------------------------------------------------------------------- | --------------------------------------------------------- |
| [Notify the user that something happened](#notify-the-user)                     | `useToast` (each app's own hook)                          |
| [Confirm a risky or irreversible action](#confirm-a-risky-action)               | `Sheet` + `Button intent="danger"` / `WarningSheetLayout` |
| [Show loading](#show-loading)                                                   | `SkeletonLoader`, `Button aria-busy`                      |
| [Show an empty state](#show-an-empty-state)                                     | Caption plus illustration (no shared component yet)       |
| [Flag something that stays wrong](#flag-something-that-stays-wrong)             | `Callout`                                                 |
| [Show a money amount](#show-a-money-amount)                                     | `Balance` and `formatCurrency`                            |
| [Pick a text colour](#pick-a-text-colour)                                       | The ink ladder                                            |
| [Pick a text style](#pick-a-text-style)                                         | `textStyle` / `Text variant`                              |
| [Choose primary or secondary action](#choose-primary-or-secondary-action)       | `Button variant`                                          |
| [Offer an icon-only action](#offer-an-icon-only-action)                         | `IconButton`                                              |
| [Offer an important action](#offer-an-important-action)                         | A labelled `Button`                                       |
| [Take text input](#take-text-input)                                             | `Input` (floating label); amount field for amounts        |
| [Badge an avatar](#badge-an-avatar)                                             | `Avatar indicator` with a filled-circle icon              |
| [Identify a Receive asset and protocol](#identify-a-receive-asset-and-protocol) | `ReceiveAssetIdentity` recipe                             |
| [Show an address](#show-an-address)                                             | `AddressDisplayer`, `truncateMiddle`                      |
| [Let someone copy a value](#let-someone-copy-a-value)                           | `useClipboard` + `BasicTooltip`                           |
| [Explain a term or a fee](#explain-a-term-or-a-fee)                             | `BasicTooltip` (web), info sheet (native)                 |
| [Put an icon next to text](#put-an-icon-next-to-text)                           | `InlineIcon` (web)                                        |
| [Show which asset a screen is about](#show-which-asset-a-screen-is-about)       | Token avatar icons, `AddressQr` recipe                    |
| [Place the screen's actions](#place-the-screens-actions)                        | Typed `PageActions` in the page or `Sheet` footer         |
| [Show a row in a list](#show-a-row-in-a-list)                                   | `ListItemBox` / `ItemLayout` (web), `Cell` (native)       |
| [Open a focused task](#open-a-focused-task)                                     | `Sheet`                                                   |
| [Ask someone to approve or sign](#ask-someone-to-approve-or-sign)               | `Approver`                                                |
| [Make a custom surface clickable](#make-a-custom-surface-clickable)             | `Pressable`                                               |

---

## Notify the user

Use a toast for short feedback after something the user did: "Copied", "Network changed", "Broadcast
failed". Each app has its own hook.

```tsx
// extension
import { toastDurations, useToast } from '@app/features/toasts/use-toast';

const toast = useToast();
toast.success('Diagnostic logs cleared', { duration: toastDurations.standard });
toast.error('Transaction failed to broadcast');
```

- **Web:** `useToast` from `~/features/toasts/use-toast`. It has `success`, `error` and `info`, and
  none of them take options.
- **Native:** `const { displayToast } = useToastContext()` from `@/components/toast/toast-context`,
  then `displayToast({ title: t\`Changed network\`, type: 'success' })`.
- Toasts disappear on their own. If the user has to act on the problem, use a [Callout](#flag-something-that-stays-wrong).
- **Seen in:** `apps/extension/src/app/features/settings/components/advanced-menu-items.tsx:44` and
  `apps/mobile/src/app/settings/networks/index.tsx:40`.

## Confirm a risky action

```tsx
import { PageActions } from '~/pages/playground/shared/recipes/page-actions';

import { Sheet, SheetHeader } from '@leather.io/ui';

<Sheet
  title="Remove wallet"
  description="Confirm wallet removal"
  header={<SheetHeader title="Remove wallet" />}
  isShowing={isShowing}
  onClose={onClose}
  footer={
    <PageActions
      secondary={{ label: 'Cancel', onClick: onClose }}
      primary={{
        label: 'Remove wallet',
        intent: 'danger',
        onClick: handleRemove,
        pending: isRemoving,
      }}
    />
  }
>
  {/* body copy in ink.text-secondary: what happens, and that it cannot be undone */}
</Sheet>;
```

- `PageActions` is a web Playground recipe. Move it with a promoted composition, or use the
  app's existing confirmation composition when it already fits. The real `Sheet` supplies modal
  focus behavior; inline `ReviewSheet` is a visual demo only.
- **Native:** `WarningSheetLayout` from `@/components/sheets/warning-sheet.layout`. Pass `sheetRef`,
  `title`, `description`, `onSubmit` and `variant="critical"`.
- The confirm label repeats the verb ("Remove wallet"). Avoid "OK" and "Yes".
- **Seen in:** `apps/extension/src/app/features/dialogs/switch-account-sheet/components/remove-wallet-dialog.tsx:32`
  and `apps/mobile/src/features/settings/wallet-and-accounts/remove-wallet-sheet.tsx:15`.

## Show loading

```tsx
import { SkeletonLoader } from '@leather.io/ui';

<SkeletonLoader isLoading={isLoading} height="14px" width="80px">
  <Balance balance={balance} formatCurrency={formatCurrency} textStyle="label.02" />
</SkeletonLoader>;
```

- Size the skeleton to match the content that replaces it, so nothing jumps when it loads.
- For a button that is waiting on a result, use `<Button aria-busy={isSubmitting}>`. It shows a
  spinner and disables itself.
- For typed `PageActions`, set `pending` on the descriptor. Either action pending disables
  both, preventing a competing submission or cancel while the result is pending.
- For a whole panel loading on web, use `LoadingSpinner`. Native has no spinner, so use skeletons.
- **Seen in:** `apps/mobile/src/features/token/token.tsx:73` and
  `apps/extension/src/app/features/token/collectible-details-loading.tsx:16`.

## Show an empty state

There's no shared component yet, so this is a known gap. Until one exists, follow the activity
pattern: an illustration, then one line in `caption.01` / `ink.text-subdued`, centred.

```tsx
import { Stack } from 'leather-styles/jsx';

import { Caption } from '@leather.io/ui';

<Stack alignItems="center" gap="space.04" py="space.07">
  <img src={emptyIllustration} width="106" alt="" />
  <Caption maxWidth="23ch" textAlign="center">
    No activity yet
  </Caption>
</Stack>;
```

- **Web app:** reuse `ActivityEmptyState` from `apps/web/app/pages/multisig/components/activity-empty-state.tsx`.
  It takes `title`, `description` and `minHeight`.
- **Seen in:** `apps/extension/src/app/features/activity-list/components/activity-empty.tsx:8` and
  `apps/mobile/src/features/activity/activity-empty.tsx:13`.

## Flag something that stays wrong

```tsx
import { Callout } from '@leather.io/ui';

<Callout variant="error" title="Unable to read transaction details">
  Leather could not parse the amounts for this transaction. Check them on your hardware device.
</Callout>;
```

- The variants are `default`, `info`, `success`, `warning` and `error`. Put the fix in the body copy.
- **Edge to edge, at the top of its region:** the full width of the sheet or screen (as under the
  amount on the send review), or the full column above the list it concerns. Never an inset box
  between rows or fields: a mid-layout note is `HelperText` or a row caption. See
  `docs/design/cheatsheet.md#callout`.
- In Playground page shells, use the typed `notice={{ variant, message }}` prop; in
  `ReviewSheet`, use `callout={{ variant, message }}`. Their `PageNotice` cancels the shared
  gutter for full width. Don't add an inset wrapper. See [Page notice](./recipes.md#page-notice).
- **Native:** the API is the same, but layout props are ignored, so wrap it in a `Box` if you need spacing.
- **Seen in:** `apps/extension/src/app/features/psbt-signer/components/psbt-descriptor-policy.tsx:157`.

## Show a money amount

```tsx
import { Balance } from '@app/components/balance/balance'; // ~/components/… on web, @/components/… on native
import { formatCurrency } from '@app/common/currency-formatter';

<Balance balance={money} formatCurrency={formatCurrency} textStyle="label.02" />
<Balance balance={fiat} formatCurrency={formatCurrency} textStyle="caption.01" color="ink.text-subdued" />
```

- `balance` is a `Money` from `@leather.io/models`. Don't format numbers by hand.
- To render a direction, pass `operator="+"` or `operator="−"`.
- Formatting presets are `price`, `shorthand-balance` and `pad-decimals`, passed as
  `formattingOptions={{ preset }}`.
- Put the fiat or secondary value next to the amount in `ink.text-subdued`.
- Never mono: no `textStyle="code"` / `"address"` and, on web, no `tabular-nums` on an amount
  (lint: `no-mono-amount`). Mono is for full addresses and code.
- The amount a screen leads with is the `AmountDisplay` recipe in the Playground, so the amount →
  fiat gap is the same on send, review and sent.
- **Seen in:** `apps/extension/src/app/features/activity-list/components/activity-row.tsx:106`.

## Pick a text colour

Pick the step on the ink ladder by how much the reader depends on the text, not by how much
visual weight you want:

| Token                      | For                                                                                      |
| -------------------------- | ---------------------------------------------------------------------------------------- |
| `ink.text-primary`         | The content itself: titles, amounts, names                                               |
| `ink.text-secondary`       | Text that informs a decision: dialog body, warnings, fee notes, approval details         |
| `ink.text-subdued`         | Glanceable metadata: captions, fiat values, timestamps. Only on `ink.background-primary` |
| `ink.text-non-interactive` | Disabled states only                                                                     |

```tsx
<styled.span textStyle="caption.01" color="ink.text-secondary">
  This fee is paid to the Bitcoin network, not to Leather.
</styled.span>
```

If you're not sure, use `ink.text-secondary`. Never use opacity to create a shade in between (see
[never.md](./never.md#text-opacity)). The full rules are in `packages/tokens/README.md`.

## Pick a text style

| Style                                   | Use                                                                      |
| --------------------------------------- | ------------------------------------------------------------------------ |
| `heading.05`                            | Sheet and section titles                                                 |
| `label.01`                              | List row titles (`Title`), primary amounts                               |
| `label.02`                              | Button labels, key-value values, secondary row titles                    |
| `label.03`                              | Small labels, badges                                                     |
| `body.01` / `body.02`                   | Paragraphs                                                               |
| `caption.01` / `caption.02`             | Row captions (`Caption`), helper text                                    |
| `address` / `code`                      | Addresses and hashes, code                                               |
| `display.*`, `heading.02`, `heading.03` | Marche display. Already uppercase. Use only for marketing-weight moments |

- On native, use `<Text variant="label01">`, with the same names minus the dot.

## Choose primary or secondary action

```tsx
import { Button } from '@leather.io/ui';

<Button variant="outline" fullWidth onClick={onCancel}>Cancel</Button>
<Button fullWidth disabled={!isValid} onClick={onSave}>Save</Button>
```

- Use one `solid` (primary) per view, then `outline` for secondary and `ghost` for tertiary.
  For page or sheet footer actions, prefer the [typed action recipe](#place-the-screens-actions)
  so the composition owns hierarchy, spacing and pending behavior.
- `intent="danger"` is only for destructive confirms. `intent="success"` exists on web only.
- Sizes are `sm` (32px), `md` (36px) and `lg` (48px, the default). Icons go in `iconStart` and
  `iconEnd`, as a component (`iconEnd={CopyIcon}`) or an element (`iconEnd={<CopyIcon />}`); both
  take the label's ink and the small size. Don't set the icon's `color`.
- One solid per screen is checked on the render: `pnpm design:words <url>` lists frames with more.
- **Native:** `<Button variant="solid" onPress={…}>`. The variants match web and the intents are
  `default` and `danger`.
- **Seen in:** `apps/extension/src/app/features/fee-editor/fee-editor.tsx:68`.

## Offer an icon-only action

```tsx
import { IconButton, SettingsSliderIcon } from '@leather.io/ui';

<IconButton
  icon={<SettingsSliderIcon variant="small" />}
  aria-label="Manage collectibles"
  onClick={onOpen}
/>;
```

- On web, set `aria-label` when you don't pass `label`. Passing `label` shows a caption under the icon.
- An icon-only `IconButton` is a 40px square, so its hover is square. Don't pass `width` or `height`.
- Inside a row, it's a nested action: the row keeps one hover (list-row recipe `actions`).
- **Native:** `<IconButton label={t\`Close\`} icon={<ArrowLeftIcon />} onPress={onClose} />`. Here
`label` is required and becomes the accessibility label.

## Offer an important action

```tsx
<Button variant="outline" size="md" fullWidth iconStart={PlusIcon} onClick={onSave}>
  Save to address book
</Button>
```

- An action the reader must not miss gets words. A bare `+` or bookmark `IconButton` on a row
  ("Not saved [+]") is too easy to miss. Use a labelled Button in the block it acts on.
- `IconButton` stays right for small, repeated, well-known actions: copy, QR, close, settings.

## Take text input

```tsx
import { Input } from '@leather.io/ui';

import { ErrorLabel } from '@app/components/error-label';

// extension

<Input.Root hasError={Boolean(error)}>
  <Input.Label>Name</Input.Label>
  <Input.Field value={name} onChange={onChange} />
</Input.Root>;
{
  error ? <ErrorLabel>{error}</ErrorLabel> : null;
}
```

How the extension uses inputs today, and so what to reach for:

| Input                                   | Use when                                                                                                            | Seen in (apps/extension/src/app/…)                                                                   |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `Input` with a floating label (default) | Any typed value in a form or sheet: name, password, memo, secret-key word, custom fee, network URL                  | `rename-entity-dialog.tsx`, `memo-field.tsx`, `request-password.tsx`, `bitcoin-custom-fee-input.tsx` |
| `Input` with `shrink`                   | The value is set by code (picked from a list, pasted by a button) or a placeholder must show, so the label stays up | `recipient-address-type-field.tsx` (recipient, BNS)                                                  |
| Amount field (borderless, large)        | The amount a send or swap is about; never a floating-label `Input`                                                  | `pages/send/…/amount-field.tsx`, `pages/swap/…/amount-field-primary-value.tsx`                       |
| Search field (placeholder, no label)    | Filtering a list in place                                                                                           | `components/search-input.tsx` (swap asset selector)                                                  |
| `NumericInput`                          | Stepping a small number (slippage), not typing                                                                      | `pages/swap/components/review/slippage-selector-sheet.tsx`                                           |

- The floating label is the label: it starts inside the 64px field and moves up on focus or value.
  Don't add a second label above it, and don't use a placeholder instead of it.
- Errors: `hasError` on `Input.Root` (red border and label) plus one message under the field
  (`ErrorLabel`). Don't set `data-has-error` by hand.
- There is one size (64px). There is no Textarea and no search field in `@leather.io/ui` yet.
- **Designer decisions (open):**
  - A compact 40px input exists only as inline overrides (nonce editor, fee editor). Make it a
    real size, or drop it?
  - Custom fee has four treatments (floating label, label-less 40px, raw 32px right-aligned, raw
    with placeholder) and nonce two. Which one is the fee and nonce field?
  - Search: promote `search-input.tsx` into ui (it uses a different focus colour), and is it the
    pattern for filtering an address book?
  - Recipient: `shrink` + placeholder keeps the label pinned; should a pinned recipient field
    above a list (B's "Send to") be this `Input`, or a search-style field?
  - Multi-line (memo, pasting a seed phrase): add a Textarea, or keep single-line?

## Badge an avatar

```tsx
<StxAvatarIcon size="xl" indicator={<StacksFilledCircleIcon variant="small" />} />
<Avatar fallback="SR" indicator={<StxAvatarIcon size="xs" />} />
```

- The badge is a 20px circle (on `lg`/`xl` avatars) holding a 16px mark. Use a
  `*FilledCircleIcon variant="small"`, as the asset lists do, or a token avatar at `size="xs"`.
- Token avatars draw their logo at the avatar's full size; don't pass `width`/`height` or a
  glyph `variant`. (Before this fix an `xs` token avatar rendered a 7px logo.)
- **Seen in:** `apps/extension/src/app/features/asset-list/token-list.tsx:90`.

## Show an address

```tsx
import { AddressDisplayer } from '@leather.io/ui';
import { truncateMiddle } from '@leather.io/utils';

<AddressDisplayer address={address} />                 {/* full address, grouped by four */}
<Caption>{truncateMiddle(address, 4)}</Caption>        {/* compact, in a row */}
```

- Never slice an address by hand. `truncateMiddle` handles `0x…` and `contract.name` correctly.
- Use the full `AddressDisplayer` wherever the user is checking where funds go: send review, receive, approvals.

## Let someone copy a value

```tsx
import { BasicTooltip, CopyIcon, IconButton, useClipboard } from '@leather.io/ui';

const { onCopy, hasCopied } = useClipboard(address);
<BasicTooltip label={hasCopied ? 'Copied!' : 'Copy address'} side="bottom" asChild>
  <IconButton
    icon={<CopyIcon variant="small" />}
    aria-label="Copy address"
    onClick={() => void onCopy()}
  />
</BasicTooltip>;
```

- **Web app:** use `CopyAddress` from `~/components/copy-address`, which takes `addr` plus
  `compact`, `wide`, `grouped` and `full`. It already wires `useClipboard` and the copied state.
- Today the extension uses its own `useClipboard` from `@app/common/hooks/use-copy-to-clipboard`,
  which is a known duplicate. On native, use `useCopyToClipboard` from `@/hooks/use-copy-to-clipboard`
  and confirm with a toast.

## Explain a term or a fee

```tsx
import { styled } from 'leather-styles/jsx';

import { BasicTooltip, InfoCircleIcon, InlineIcon } from '@leather.io/ui';

<styled.span textStyle="body.02" color="ink.text-secondary">
  Fee
  <BasicTooltip label="Paid to miners to include your transaction" side="top" asChild>
    <InlineIcon icon={InfoCircleIcon} tone="subdued" placement="end" tabIndex={0} />
  </BasicTooltip>
</styled.span>;
```

- `InlineIcon` is the span the tooltip needs (the icons don't forward a ref to `asChild`), and it
  keeps the icon on the label's line, at the label's size, no darker than the label.
- Keep required decision and safety context visible, concise and in `ink.text-secondary`.
  A tooltip or disclosure is for optional background, never a way to meet a sentence quota.
- Keep a tooltip to one sentence. If the explanation needs a link or a paragraph, use `HoverCard`
  on web, or the web app's `InfoTooltipIcon`, which takes `title`, `explanation`, `learnMoreUrl`
  and `ariaLabel`.
- **Native:** there are no tooltips. Open an info sheet instead (see `apps/mobile/src/features/swap/components/info-sheet`).

## Show a row in a list

```tsx
import { Caption, ItemLayout, Pressable, Title } from '@leather.io/ui';

<Pressable onClick={onSelect}>
  <ItemLayout
    titleLeft={<Title>{name}</Title>}
    captionLeft={<Caption>{symbol}</Caption>}
    titleRight={<Balance balance={balance} formatCurrency={formatCurrency} />}
  />
</Pressable>;
```

- In the Playground, use the list-row recipe presets: they mirror the shipped rows type for type,
  keep one hover per row with nested actions, and have no chevron unless the row opens a deeper
  view that exists (`navigates` + `onClick`; lint `no-dead-chevron`). Pick rows have no chevron.
- For new web rows, prefer `ListItemBox`, which takes `title`, `caption`, `leading`, `trailing`,
  `trailingCaption`, `density`, `onClick` and `href`.
- **Native:** `<Cell.Root pressable onPress={…}><Cell.Content><Cell.Label variant="primary">…`.

## Put an icon next to text

```tsx
import { styled } from 'leather-styles/jsx';

import { InlineIcon, LockIcon } from '@leather.io/ui';

<styled.span textStyle="label.03" color="ink.text-primary">
  <InlineIcon icon={LockIcon} placement="start" />
  1,000.00 STX locked
</styled.span>;
```

- Put it inside the text element. It inherits the text's ink (`currentColor`), is 16px beside
  body, label and caption text (`size="medium"` only beside headings), and sits on the first
  text line.
- Same ink as the text or lighter (`tone="secondary"`, `"subdued"`), never darker. A bare icon
  defaults to `ink.action-primary-default` and outweighs secondary text.
- Not for actions (`IconButton`) or a row's leading image (`ItemLayout img`).

## Show which asset a screen is about

```tsx
import { BtcAvatarIcon } from '@leather.io/ui';

<AddressQr address={address} icon={<BtcAvatarIcon />} />  {/* recipe: shared/recipes/address-qr */}
```

- When an asset is the subject (receive, token details, a send of one asset), show its token
  icon: `BtcAvatarIcon`, `StxAvatarIcon`, `SbtcAvatarIcon`, `UsdcxAvatarIcon`, `Sip10AvatarIcon`,
  `AssetAvatarIcon`. Lead a row with it, or put it in the QR centre.
- **Seen in:** `apps/extension/src/app/pages/receive/components/receive-tokens.layout.tsx` (QR size and ink).

## Place the screen's actions

Use `actions` on `FramePage`, `PopupPage` or `TabPage`. The typed recipe owns the button hierarchy,
equal columns, `space.04` gap and wrapping; don't rebuild the footer per screen.

```tsx
import { FramePage } from '~/pages/playground/shared/recipes/tab-page';

import { PlusIcon } from '@leather.io/ui';

<FramePage
  frame={frame}
  title="Address book"
  actions={{
    mode: 'management',
    secondary: { label: 'Add address', iconStart: PlusIcon, onClick: onAdd },
    primary: { label: 'Manage', onClick: onManage },
  }}
>
  {content}
</FramePage>;
```

- Default task mode has one solid `primary` and an optional outline `secondary`.
  Management mode has outline actions only. Never pair competing finishers such as Save and Done.
- Descriptors accept `label`, `onClick`, `disabled`, `pending` and `iconStart`; the primary also
  accepts `intent: 'danger'`. If either action is pending, both are disabled.
- For forms, a descriptor with `type: 'submit'` and `form: 'form-id'` uses the form's `onSubmit`,
  native validation and Enter behavior. Command actions keep the default `type="button"` and
  require `onClick`; a submit descriptor need not have a click callback.
- `customFooter` is a deliberate escape hatch for a different composition, mutually exclusive
  with `actions`. Ordinary actions use descriptors.
- These are web Playground imports. Promote the shared recipe with the composition, or retain
  the existing app footer when it better fits the production workflow.
- **Seen in:** `apps/extension/src/app/features/dialogs/switch-account-sheet/switch-account-sheet.tsx:324`.

## Open a focused task

Use the real `Sheet` for modal behavior, keyboard focus management and dismissal. Its footer can
use the same `PageActions` directly, without another `PageFooter` wrapper:

```tsx
import { PageActions } from '~/pages/playground/shared/recipes/page-actions';

import { Sheet, SheetHeader } from '@leather.io/ui';

<Sheet
  title="Edit fee"
  description="Choose the transaction fee"
  isShowing={isShowing}
  onClose={onClose}
  header={<SheetHeader title="Edit fee" onClose={onClose} />}
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

- `ReviewSheet` in the Playground draws inside a frame and keeps a bounded scrolling body with
  reachable header and actions. It is a visual demo; it does not replace `Sheet`'s modal focus
  behavior in product code.
- **Native:** `const sheetRef = useRef<SheetInstance>(null)`, then `<Sheet ref={sheetRef}>`, then
  call `sheetRef.current?.present()` to open it and `dismiss()` to close it.

## Ask someone to approve or sign

```tsx
import { Approver, Button } from '@leather.io/ui';

<Approver requester={origin}>
  <Approver.Header title="Sign transaction" />
  <Approver.Section>{details}</Approver.Section>
  <Approver.Actions
    actions={[
      <Button key="deny" variant="outline" onClick={onDeny}>
        Deny
      </Button>,
      <Button key="sign" onClick={onSign}>
        Sign
      </Button>,
    ]}
  />
</Approver>;
```

- Fee rows, post-conditions and contract details sit in `Approver.Section`. Their labels use
  `ink.text-secondary`, because the reader is deciding.
- **Native:** `Approver` has `.Container`, `.Header`, `.Section`, `.Advanced` and `.Footer`. See
  `apps/mobile/src/features/psbt-signer/psbt-signer.tsx:281`.

## Make a custom surface clickable

```tsx
import { Pressable } from '@leather.io/ui';

<Pressable display="flex" alignItems="center" gap="space.03" py="space.03" onClick={onAction}>
  {children}
</Pressable>;
```

- `Pressable` adds hover and pressed states only when it has an `onClick` and isn't `disabled`.
- **Native:** `<Pressable onPress={…} haptics="soft">`. The default press effect is an opacity
  fade on the whole surface.

## Identify a Receive asset and protocol

Use `ReceiveAssetIdentity` from `apps/web/app/pages/playground/shared/recipes/receive-asset-identity`.
It renders Bitcoin with a Native SegWit/Taproot chip, or Stacks alone. Pass `context="row"` in
`ItemLayout.titleLeft`, and `context="detail"` below a single “Receive” page header.
Do not add category headings to the three-option chooser.
[Pattern and review incident](./recipes.md#receive-asset-identity).
