# Tokens

This library contains shared Leather design tokens.

## Text colors

Ink text colors form a ladder from strongest to weakest. Pick the step by how much the reader depends on the text, not by how much visual weight you want.

| Token                      | Light     | Dark      | Use for                                                       |
| -------------------------- | --------- | --------- | ------------------------------------------------------------- |
| `ink.text-primary`         | `#12100F` | `#F9F9F8` | The content itself: titles, amounts, names, values            |
| `ink.text-secondary`       | `#5A5552` | `#EDEBE9` | Supporting text the reader needs to read to understand or act |
| `ink.text-subdued`         | `#7B7572` | `#D9D6D4` | Supporting text the reader can safely skip                    |
| `ink.text-non-interactive` | `#9E9996` | `#9E9996` | Disabled states only                                          |

### `ink.text-secondary`

Use it for text that informs a decision or explains consequences:

- Body copy in dialogs, sheets, empty states and errors
- Warnings, disclaimers and "this cannot be undone" copy
- Approval and signing details: post-conditions, spending conditions, contract and function info
- Fee explanations and helper text that states a requirement or limit
- Labels in key-value rows on review and confirmation screens
- Any supporting text on a tinted surface (see below)

### `ink.text-subdued`

Use it for glanceable metadata that adds context but isn't required:

- Captions under a title in list rows
- Fiat or secondary values next to an amount
- Timestamps, block heights and other metadata
- Table headers, section overlines and breadcrumbs
- Placeholders, inactive tabs and decorative icons

### Rules

- **Decision test:** if skipping the text could lead the reader to a wrong or irreversible choice, use `ink.text-secondary`.
- **Surface test:** only use `ink.text-subdued` on `ink.background-primary`. On `ink.background-secondary`, `ink.component-background-default` or any colored background, use `ink.text-secondary`. Subdued drops below WCAG AA (4.5:1) on those surfaces; secondary stays above 6:1.
- **No in-between hacks:** don't use opacity, `ink.action-primary-hover` or `ink.text-non-interactive` to create intermediate text shades. Use the ladder above.
- **When unsure:** prefer `ink.text-secondary`. Over-emphasised supporting text is a smaller problem than unreadable important text.
