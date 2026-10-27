# Never

Each item here is backed by a lint rule in `eslint-rules/design-system/`, or is waiting on a token
before it can be. The lint message is the fix: it names the replacement and links back to the
matching section of this page. If you want to add an item, follow
[updating-the-system.md](./updating-the-system.md). Start with a type or a lint rule, and only
write prose when neither can work.

This release automatically enforces these rules on its owned recipes, gallery and example,
with no new suppressions. Run `pnpm design:check <feature-path>` to check another web/extension
feature explicitly. Existing product lint baselines are unchanged; mobile rollout is separate.

| #   | Never                                                 | Rule                                 | Status                    |
| --- | ----------------------------------------------------- | ------------------------------------ | ------------------------- |
| 1   | [Raw colour](#raw-colour)                             | `design-system/no-raw-color`         | lint                      |
| 2   | [Undefined text style](#undefined-text-style)         | `design-system/valid-text-style`     | lint                      |
| 3   | [Raw button](#raw-button)                             | `design-system/no-raw-interactive`   | lint                      |
| 4   | [Radix imports](#radix-imports)                       | `design-system/no-primitive-imports` | lint                      |
| 5   | [Text opacity](#text-opacity)                         | `design-system/no-text-opacity`      | lint                      |
| 6   | [Local duplicates](#local-duplicates)                 | `design-system/no-local-duplicate`   | lint                      |
| 6b  | [Mono amount](#mono-amount)                           | `design-system/no-mono-amount`       | lint                      |
| 6c  | [Dead chevron](#dead-chevron)                         | `design-system/no-dead-chevron`      | lint (Playground)         |
| 7   | [Raw shadows](#raw-shadows)                           | `no-raw-color` with `checkShadows`   | waits on `shadows` tokens |
| 8   | [Motion literals](#motion-literals)                   | planned `no-raw-motion`              | waits on motion tokens    |
| 9   | [Uppercase outside Marche](#uppercase-outside-marche) | planned `no-text-transform`          | lint next                 |

---

## Raw colour

**Rule:** Don't use hex, `rgb()`, `rgba()`, `hsl()` or `hsla()` values in style props, `css()`,
`cva()`, `styled()` or React Native style objects.

**Why:** Raw values don't switch with the dark theme, and they drift away from the palette in
`@leather.io/tokens`. For example, `#DCDDE2` in the PSBT input list is not a Leather colour.

**Lint message:**

```
Use a semantic colour token (ink.*, red.*, green.*, yellow.*, blue.*) instead of the raw value '<value>' — docs/design/never.md#raw-colour
```

**Use instead:** Pick a semantic token from `packages/tokens/src/semantic-tokens.ts`.

- Text colour: follow the ink ladder in [`packages/tokens/README.md`](../../packages/tokens/README.md).
- Borders: `border="default"` or `borderColor="ink.border-default"`.
- Overlays: `ink.background-overlay`.
- Transparent: write `transparent`, not `#FFFFFF00`.

**Exempt:** `packages/tokens/**`. Brand colours of third parties, such as pool logos, go in one
`brand-colors.ts` file per app, and that file is listed in the config.

## Undefined text style

**Rule:** `textStyle` must be one of the names defined in `packages/tokens/src/typography.ts`.

**Why:** `strictTokens` is off, so Panda accepts any string. An unknown name falls back to the
browser default and there is no error. The [caption.02 drift in #2658](https://github.com/leather-io/mono/issues/2658)
went unnoticed in 14 places. Two cases remain today: `heading.06` and `caption`.

**Lint message:**

```
Use a defined text style (<same-family names>) instead of '<value>' — docs/design/never.md#undefined-text-style
```

**Use instead:** Pick from the defined styles:

- Display: `display.01`, `display.02`
- Heading: `heading.01` to `heading.05`
- Label: `label.01` to `label.03`
- Body: `body.01`, `body.02`
- Caption: `caption.01`, `caption.02`
- Monospace: `code`, `address`

The rule reads this list from `getWebTextVariants()`, so a new style becomes valid as soon as it
is added to tokens. Mobile `Text variant` is already typed by Restyle.

## Raw button

**Rule:** Don't use `<button>`, `styled.button` or `styled('button')` in apps. Don't import
`TouchableOpacity`, `TouchableHighlight`, `TouchableWithoutFeedback`, `Pressable` or `Button` from
`react-native` either.

**Why:** The ui components give you the focus ring, hover and pressed states, `aria-busy` loading,
disabled styling and, on native, haptics. A raw button drops some of these, and which ones it
drops depends on who wrote it.

**Lint messages:**

```
Use Button, IconButton or Pressable from @leather.io/ui instead of a raw <button> — docs/design/never.md#raw-button
Use Button, IconButton or Pressable from @leather.io/ui instead of styled.button — docs/design/never.md#raw-button
Use Pressable, Button or IconButton from @leather.io/ui/native instead of <Name> from 'react-native' — docs/design/never.md#raw-button
```

**Use instead:**

- A labelled action: `Button`.
- An icon on its own: `IconButton`.
- A whole row, card or custom surface that is clickable: `Pressable`. It keeps your layout props.
- An inline text action, such as "Max" or "Retry": use `Pressable` with
  `className={link({ variant: 'underlined' })}`. Don't use `Link`, because it renders an `<a>` and
  isn't keyboard-focusable without an `href`. A `link` variant on `Button` would make this a
  ladder-1 fix, so it's a known gap.

See [i-need-to.md](./i-need-to.md#make-a-custom-surface-clickable).

**Exempt:** `packages/ui/src/**`, where the primitives are built.

## Radix imports

**Rule:** Don't import `radix-ui` or `@radix-ui/*` outside `packages/ui`.

**Why:** The ui wrappers own focus handling, motion, portals and theming in one place. A second
wrapper in an app forks those behaviours. The extension's local tooltip already differs from the ui
one: it opens after 300ms instead of 400ms, and it adds a `variant="sm"` and `textWrap: pretty`.

**Lint message:**

```
Use <Wrapper> from @leather.io/ui instead of importing '<source>' — docs/design/never.md#radix-imports
```

**Use instead:** Each Radix primitive maps to a ui component:

| Radix primitive | Use from `@leather.io/ui`   |
| --------------- | --------------------------- |
| `tooltip`       | `BasicTooltip` or `Tooltip` |
| `dialog`        | `Sheet`                     |
| `dropdown-menu` | `DropdownMenu`              |
| `popover`       | `Popover`                   |
| `tabs`          | `Tabs`                      |
| `select`        | `Select`                    |
| `switch`        | `Switch`                    |
| `accordion`     | `Accordion`                 |
| `hover-card`    | `HoverCard`                 |
| `slider`        | `Slider`                    |
| `toast`         | `Toast`                     |

If a primitive has no wrapper yet, add one to `packages/ui` and export it.

## Text opacity

**Rule:** Don't set an `opacity` between 0 and 1 on text, whether as a prop on `Text`,
`styled.span`, `Caption` or `Title`, or alongside `color` or `textStyle` in a style object.

**Why:** Opacity lowers contrast by different amounts on different surfaces and in dark mode. The
ink ladder is tuned to stay above WCAG AA on each surface it's allowed on.

**Lint message:**

```
Use a step on the ink text ladder (ink.text-secondary, ink.text-subdued or ink.text-non-interactive) instead of opacity on text — docs/design/never.md#text-opacity
```

**Use instead:** Use the ink ladder in [`packages/tokens/README.md`](../../packages/tokens/README.md#text-colors).

- If the text helps someone decide, use `ink.text-secondary`.
- If the text is glanceable metadata, use `ink.text-subdued`.
- If the text is disabled, use `ink.text-non-interactive`.

**Not covered:** Opacity used to fade an element in or out (`0` or `1`), and opacity on a surface
that has a background, such as a hover state.

## Local duplicates

**Rule:** Don't import an app-local copy of a component that `@leather.io/ui` already provides.

**Why:** Forks drift apart. Today 22 extension files import the local `BasicTooltip` and 21 import
the ui one. The local one opens after 300ms and the ui one after 400ms, so tooltips on the same screen
open at different speeds.

**Lint message:**

```
Use BasicTooltip or Tooltip from @leather.io/ui instead of the local copy '@app/ui/components/tooltip/basic-tooltip' — docs/design/never.md#local-duplicates
```

**Use instead:** Use the ui component. If it's missing a prop you need, add the prop in
`packages/ui` rather than keeping the fork. Each duplicate is configured as one entry
(`pattern`, `replacement`) in the rule options, so adding the next one is a one-line change.

## Mono amount

**Rule:** Monospace is for full addresses and code only. Never set an amount, total, fee, balance
or fiat value in mono: no `textStyle="code"` / `"address"`, no mono `fontFamily`. In
`apps/web` the rule also rejects `fontVariant` / `fontVariantNumeric` `tabular-nums` on an
amount.

**Why:** Mono makes money read as raw data. In the web build Diatype's tabular figures come from
its semi-mono cut, so `tabular-nums` turns the whole value ("120.0004 STX", letters too) mono. That
is how round 3's review rows (Total spend, Sending, Fee) went mono: the review-sheet recipe copied
`fontVariant="tabular-nums"` from the extension's `InfoCardRow`. The extension uses mono only for
`AddressDisplayer` (`address`) and the broadcast error's code block (`code`).

**Lint message:**

```
Use a Diatype text style (label.02 for a value, heading.03 for a hero amount) instead of textStyle="code" on an amount; mono is for full addresses and code — docs/design/never.md#mono-amount
```

**Use instead:** `label.02` for a value in a row (`ReviewRow`), `AmountDisplay` for the amount a
screen is about, `Balance` + `formatCurrency` in product code. A full address is
`AddressDisplayer`.

**Not covered:** The rule reads names and literals (`{fee}`, `{send.totalSpend}`, `"0.0004 STX"`,
`<Balance balance=… />`). An amount behind a generic name it can't see is a review item.

## Dead chevron

**Rule:** A list row with `navigates` (a chevron) needs an `onClick` that opens a deeper view. No
`onClick`, `noop` or `() => undefined` is a chevron that goes nowhere.

**Why:** A chevron promises a detail view. Round 3's address books showed chevrons on every saved
row although no contact screen existed. The list-row recipe has no chevron by default.

**Lint message:**

```
Use navigates only with an onClick that opens a deeper view, instead of a chevron on a row that goes nowhere; drop navigates for a pick or display row — docs/design/never.md#dead-chevron
```

**Use instead:** Drop `navigates` on pick rows (select and return), display rows and rows with
nested actions. Add it back with the screen it opens. The promote report lists each hit.

## Raw shadows

**Rule:** Don't use raw `boxShadow` values. This is not enforced until `tokens.shadows` exists.

**Why:** The same three-layer `rgba(18, 16, 15, …)` shadow is copied by hand into toast, select,
hover-card, connect-card and three extension layouts, and the copies have already diverged.

**Next step:** Add elevation tokens to `packages/tokens/src/tokens.ts`, then turn on
`no-raw-color` with `{ checkShadows: true }`. That reports 17 call sites today.

## Motion literals

**Rule:** Don't use `cubic-bezier()` or millisecond values in `transition` or `animation`. This is
not enforced until motion tokens exist.

**Why:** There is only one transition token today (`all 0.2s cubic-bezier(0.23, 1, 0.32, 1)`).
Toasts use `160ms cubic-bezier(0, 0.45, 0.6, 1)`, and about 40 other literals exist.

**Next step:** Add duration and easing tokens, then write `no-raw-motion` with the message
`Use a duration and easing token instead of …`.

## Uppercase outside Marche

**Rule:** Only the Marche display styles (`display.*`, `heading.02`, `heading.03`) are set in
uppercase, and they do it themselves. Don't add `textTransform="uppercase"` anywhere else.

**Why:** Uppercase Diatype reads as shouting and breaks the type pairing. There are 2 call sites
today.

**Next step:** Add a small `no-text-transform` rule with the message
`Use heading.02 or heading.03 instead of textTransform uppercase — …`.
