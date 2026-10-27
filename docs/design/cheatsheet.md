# Component cheatsheet

Generated from packages/ui/src/components/\*_/_.meta.shared.ts. Do not edit by hand.

## Button

web: `@leather.io/ui` · native: `@leather.io/ui/native` · live: `/playground/ui-gallery#button`

**Use when**

- An action with a text label: submit, confirm, cancel, continue
- variant="solid" once per view for the primary action, "outline" for secondary, "ghost" for tertiary
- intent="danger" on the confirm step of a destructive action
- aria-busy while the action is in flight (web shows a spinner and disables the button)
- iconStart / iconEnd as a component (CopyIcon) or an element (<CopyIcon />): either way the icon takes the label ink (currentColor) and the small size
- An important action gets a label ("Save to address book"), not a bare icon

**Don't use when**

- The action is an icon with no visible label → `IconButton`
- A whole row, card or custom surface is clickable → `Pressable`
- Navigating to another page inside running text → `Link`

**Replaces** `<button>`, `styled.button`, `styled('button')`, `TouchableOpacity from react-native`

**Secondary and primary pair in a sheet footer** (web, seen in `apps/extension/src/app/features/fee-editor/fee-editor.tsx:68`)

```tsx
<Button variant="outline" fullWidth onClick={onCancel}>Cancel</Button>
<Button fullWidth disabled={!isValid} onClick={onSave}>Save</Button>
```

**Destructive confirm** (web, seen in `apps/extension/src/app/features/dialogs/switch-account-sheet/components/remove-wallet-dialog.tsx:32`)

```tsx
<Button variant="solid" intent="danger" onClick={handleRemove}>
  Remove wallet
</Button>
```

**Ghost action on native** (native, seen in `apps/mobile/src/app/secure-your-wallet.tsx:41`)

```tsx
<Button variant="ghost" onPress={() => sheetRef.current?.present()}>{t`Skip for now`}</Button>
```

---

## Callout

web: `@leather.io/ui` · native: `@leather.io/ui/native` · live: `/playground/recipes?recipe=inline-info`

**Use when**

- A problem or risk the user has to act on, which stays until it is resolved
- Edge to edge: it spans the full width of the screen or sheet (as on the send review), or the full column at the top of a list (as on the home Tokens tab). Square ends, no card around it
- At the top of the region it is about: under the amount on a review, above the list it concerns

**Don't use when**

- A short note between rows, fields or under one value (an inset box mid-layout reads as a stray card) → `HelperText (one line) or the row caption; the explanation goes behind InfoLabel`
- Feedback that confirms an action and goes away → `the app toast`
- Explaining a term or a fee → `InfoLabel (BasicTooltip)`

**Replaces** `a hand-built tinted Box with an icon and text`

**Edge to edge under the amount on a review** (web, seen in `apps/extension/src/app/pages/send/send-crypto-asset-form/form/send-form-confirmation.layout.tsx:78`)

```tsx
<Callout variant="info" title="Sending to an exchange?" px="space.03" mb="space.05">
  Make sure you include the memo so the exchange can credit the STX to your account
</Callout>
```

**Full column at the top of the token list** (web, seen in `apps/extension/src/app/pages/home/components/aeusdc-retirement-callout.tsx:22`)

```tsx
<Callout variant="warning" title="aeUSDC is being retired">
  …
</Callout>
```

---

## IconButton

web: `@leather.io/ui` · native: `@leather.io/ui/native` · live: `/playground/recipes?recipe=list-row`

**Use when**

- An action shown as an icon only: back, close, copy, settings, QR
- Always with aria-label (web) or label (native)
- It is a 40px square (headerContainerHeight) on web, whatever the icon size, so the hover fill is square. Do not pass a width or height to resize it; a different size is a design decision
- Inside a row as a nested action: the row keeps one hover and the IconButton shows its own square hover on top (see the list-row recipe)

**Don't use when**

- The action has a visible text label → `Button`
- The icon decorates text and is not an action → `InlineIcon`
- The whole row is the action → `Pressable (list-row recipe)`

**Replaces** `<button><SomeIcon /></button>`, `a Pressable wrapping only an icon`

**Close in a sheet header** (web, seen in `packages/ui/src/components/sheet/sheet-header.web.tsx:37`)

```tsx
<IconButton icon={<CloseIcon />} aria-label="Close" onClick={onClose} />
```

**Copy inside a receive row** (web, seen in `apps/extension/src/app/pages/receive/components/receive-item.tsx:52`)

```tsx
<IconButton icon={<CopyIcon />} aria-label="Copy address" onClick={onCopyAddress} />
```

---

## InlineIcon

web: `@leather.io/ui` · live: `/playground/recipes?recipe=inline-info`

**Use when**

- An icon that belongs to a run of text: info next to a label, lock next to a locked amount, a user icon before a name, a chevron after a link-like label
- Put it inside the text element. It inherits the text colour (currentColor) and sits centred on the first text line (1lh box)
- tone="inherit" (default) or a lighter step (secondary, subdued). Never darker than its text
- size="small" (16px) with body, label and caption text; "medium" (24px) only beside headings

**Don't use when**

- The icon is the action → `IconButton`
- The icon leads a row (avatar, token logo) → `ItemLayout img / Avatar`
- The icon sits inside a Button label → `Button iconStart / iconEnd`

**Replaces** `<Flex gap="space.01"><span>Label</span><LockIcon /></Flex>`, `a bare *Icon next to text`

**Lock on a locked amount, on the text line** (web)

```tsx
<styled.span textStyle="label.03" color="ink.text-primary">
  <InlineIcon icon={LockIcon} placement="start" tone="secondary" />
  0.045004
</styled.span>
```

**Info after a label, behind a tooltip** (web)

```tsx
<styled.span textStyle="label.02">
  Total balance
  <BasicTooltip label="…" asChild>
    <InlineIcon icon={InfoCircleIcon} placement="end" tone="subdued" tabIndex={0} />
  </BasicTooltip>
</styled.span>
```
