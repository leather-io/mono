# Extension UI: platform notes

Read with the root `CLAUDE.md` and the `leather-ui` skill. These notes cover only what differs
on the extension.

- **Two surfaces, one layout.** The toolbar popup is `popupWidth` × `dialogHeight` (390×600,
  `.mode__action-popup` in `theme/global/global.ts`). App-request and approval windows are
  `popupWidth` × `popupHeight` (390×756, `src/background/popup.ts`). The full-page tab centres a
  `pageWidth` (500px) column. The Playground frames read the same tokens: `?frame=popup`
  (390×600), `?frame=request-window` (390×756) and `?frame=tab` (1280×800).
- **Desktop input.** Mouse, trackpad and keyboard only. Don't draw on-screen keypads, swipe
  gestures or pull-to-refresh. Amounts are typed into a field.
- **Hover and focus.** Every clickable surface needs hover, pressed and visible focus states.
  `Button`, `IconButton` and `Pressable` give you all three. Tab reaches every action, Enter
  submits, and Escape closes sheets.
- **Density.** Aim for mobile-wallet density (one column), but with desktop targets: rows can be
  56–64px, and there's no need for 48px touch spacing between them.
- **One gutter.** Page content sits on one 24px rail (`space.05`, card.tsx's content padding):
  rows, inputs, section headers and the footer. Header icon buttons pad 16px so their glyphs land
  on the same rail, on both sides. The shipped `HeaderGrid` adds `ml="space.02"` to the left column
  only, so back sits 8px further in than close or settings; the Playground recipe is symmetric.
  `pnpm design:align <url>` checks a render.
- **Scrolling.** The header stays put. A region the list depends on (the recipient field above a
  contact list, a search field) is pinned under it; only the body scrolls; the footer stays at
  the bottom. Never scroll the header away with a list (`PopupPage pinned` in the Playground).
- **Footer.** The screen's one solid action sits in a sticky footer at the bottom of the popup.
  In the tab, it sits under the content in the column. Every screen-level action (Add, Save,
  Done) lives there; a management screen pairs outline buttons, as the account switcher's
  Add wallet + Manage. Never two competing primaries.
- **No scrollbars.** `theme/global/global.ts` hides them everywhere; content still scrolls. The
  Playground frames do the same. Use the popup and tab page recipes in
  `docs/design/recipes.md`.
- **Sheets.** Use `Sheet` from `@leather.io/ui`. It's full height at popup width and a centred
  dialog in the tab.
- **Verify.** Screenshot the popup (390×600) in light and dark, the request window (390×756) for
  approval screens, and the tab at 1280. Then:
  - Tab through the screen.
  - Check that long amounts and addresses don't wrap the header or the footer.
  - Check that the footer stays pinned when the body scrolls.
