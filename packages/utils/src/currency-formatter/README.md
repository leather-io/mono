# Currency Formatter

Currency formatting utility that handles fiat and cryptocurrency display.

`formatter` is a resilient wrapper around `Intl.NumberFormat` with baked in sensible defaults,
presets, and few custom options.

## Setup

The formatter isn’t tied to our domain model and expects a numeric decimal input; therefore, it
needs a one-time setup at the app-level to adapt the app’s currency to its input:

```ts
import { FormatAmountOptions, createCurrencyFormatter } from '@leather.io/utils';

const formatter = createCurrencyFormatter({ locale: 'en-US' });

function formatCurrencyAmount(money: Money, options?: FormatAmountOptions) {
  return formatter.formatAmount(
    {
      amount: money.amount.shiftedBy(-money.decimals).toNumber(),
      currencyCode: money.symbol,
      decimals: money.decimals,
    },
    options
  );
}
```

### Usage

The formatter comes with sensible defaults that work for most scenarios.
Defaults are resolution-dependent and slightly vary between cryptocurrency and fiat.

```ts
// Fiat currencies show currency symbols
formatAmount(usdBalance); // "$1,234.56"
formatAmount(jpyBalance); // "¥1,235" (no decimal places)
formatAmount(eurBalance); // "1.234,56 €" (locale 'de')

// Currency code for crypto is always appended regardless of locale
formatAmount(btcBalance); // "12.3456789 BTC"
formatAmount(ethBalance); // "456.123456 ETH"

// Large amounts use compact notation (≥1M by default)
formatAmount(millionDollarBalance); // "$1.23M"
formatAmount(billionDollarBalance); // "$1.23B"

// Small fiat amounts show approximation
formatAmount(dustAmount); // "< $0.01"
```

### Presets

Presets are a set of named configurations covering common formatting scenarios.
While these scenarios can be easily achieved by configuring the formatter, presets serve a
purpose of enforcing consistency across different apps.

#### Price preset

```ts
// up to 6 decimals for small amounts 0-99
formatAmount(smallPrice, { preset: 'price' }); // $0.000001
formatAmount(mediumPrice, { preset: 'price' }); // $12.345679

// 2 decimals for amounts ≥100
formatAmount(largePrice, { preset: 'price' }); // $3,587.02
formatAmount(btcPrice, { preset: 'price' }); // $122,838.46
```

#### Shorthand balances

Meant to be used in listing items and other areas with scarce real estate.

```ts
formatAmount(btcBalance, { preset: 'shorthand-balance' }); // "12.3457 BTC"
formatAmount(usdBalance, { preset: 'shorthand-balance' }); // "$12.35"
```

### Custom options:

The following custom options are available when calling `formatAmount`:

- `compactThreshold` (default: 1_000_000)  
  Sets the minimum absolute value at which compact notation (e.g., `$1.2M`) is applied. Use `Infinity` to disable compaction entirely.

- `showCurrency` (default: true)  
  Determines whether the currency is displayed. For fiat, this is the symbol (e.g., `$`), and for crypto, the code is appended (e.g., `BTC`).

- `approximateDust` (default: true)  
  When enabled, very small fiat values below the currency’s minor unit (e.g., <$0.01 for USD)
  are formatted with an approximation like `"< $0.01"`.

- `meta` (default: false)  
   When enabled, returns an object instead of a string with additional metadata:
  - `result`: the formatted string
  - `parts`: output of [`formatToParts`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/formatToParts)
  - `resolvedOptions`: output of [`resolvedOptions`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/resolvedOptions)

Custom options will override relevant preset options:

```ts
// Override the 'price' preset to use only 2 decimals
formatAmount(price, { preset: 'price', showCurrency: false }); // 123.54
```

`### Raw NumberFormat Options`

You can pass low-level `Intl.NumberFormat` options via `numberFormatOptions`. This is intended
as an escape hatch when presets or custom options aren’t enough.  
These options override both presets and custom options.

```ts
// Override the 'price' preset to use only 2 decimals
formatAmount(price, { preset: 'price', numberFormatOptions: { maximumFractionDigits: 0 } });
// $123
```

### Handling errors

`Intl.NumberFormat` can throw exceptions for variety of options combinations. The formatter
tries to circumvent common scenarios by adjusting properties in a way to prevent this from
happening. Additionaly, the internal implementation is wrapped in `try/catch` to ensure
exceptions are never thrown—a fallback empty string is returned instead.

These instances are rare and typically don’t need to be handled manually at usage point, but
it's recommended to log those errors for observability, using built in `onCurrencyFormatterError` when
creating a formatter
instance:

```ts
const formatter = createCurrencyFormatter({
  locale: 'en-US',
  onCurrencyFormatterError: (error, context) => {
    const { locale, options } = context;
    captureError(error, { locale, options });
  },
});
```
