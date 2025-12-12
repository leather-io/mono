# Leather Voice & Format Guide

## Voice Guidelines

### Tone: Warm but Polished

Confident and human, but not casual or slangy. Write like a thoughtful colleague explaining good news—not a press release, but not a group chat either.

**Do:**

- "Getting crypto into your wallet should be straightforward. Now it is."
- "We wanted to fix that properly."
- "We'd love to hear how the new flow works for you."

**Don't:**

- Hype: "We're SO excited to announce..." / "This is a game-changer!"
- Slang: "Real talk..." / "Give it a spin" / "Let's say it had room for improvement"
- Corporate stiffness: "We are pleased to inform users that..."

### Warmth Without Casualness

**Warm (good):**

- "A cleaner path from dollars to crypto."
- "We wanted to fix that properly."
- "Let us know what you think."

**Too casual (avoid):**

- "Real talk: the old thing was broken."
- "Give it a spin!"
- "...let's just say it wasn't great."

**Too cold (avoid):**

- "This release addresses prior deficiencies."
- "Users may now access additional functionality."

### Storytelling Structure

Every announcement follows: **Problem → Solution → Benefit**

1. **Problem/Context** — What limitation or friction existed? (Acknowledge it honestly but professionally)
2. **Solution** — What did we ship?
3. **Benefit** — What can users do now that they couldn't before?

### Word Choice

**Avoid:**

- Hype words: excited, thrilled, proud, game-changing, revolutionary
- Slang: real talk, let's be honest, give it a spin, pretty much
- Overused tech words: seamless, leverage, utilize, simple/simply
- Hedging: just, really, very, actually (when unnecessary)

**Prefer:**

- Direct verbs: supports, enables, adds, improves, fixes
- Concrete nouns: speed, options, accuracy, control
- Specifics over generics: "40% faster" not "much faster"
- Softer closings: "Let us know what you think" / "We'd love to hear how it works"

---

## Format: Changelog Entry

Location: <https://app.leather.io/changelog/>

### Structure

```
[Date in Month D, YYYY format]

### [Feature title — clear and scannable]

![Feature image alt text](image-url)

[Opening paragraph: 1-2 sentences on what shipped and why it matters]

[Optional: "## What's in this release?" section for multi-feature releases]

[Body: Specific improvements, each as a short paragraph or under subheadings]

[Optional: Technical details for developer-facing features]
```

### Example

```
December 12, 2025

### Buy crypto with more options

![Buy crypto with Onramper integration](image-url)

Getting crypto into your wallet should be straightforward. Now it is.

We've partnered with Onramper to bring you more ways to buy BTC and STX—Apple Pay, Google Pay, debit card, Venmo, or bank transfer, depending on what's available in your region.

Onramper connects you to providers like Stripe, Moonpay, and Topper all in one place. Compare rates, pick what works for you, and you're done.

A cleaner path from dollars to crypto.
```

### Example (Multi-feature)

```
October 16, 2025

### Improved wallet balance accuracy, coverage and load times

![Wallet balance improvements](image-url)

Your wallet now shows more accurate fiat values and loads faster.

## What's in this release?

### Fiat balances for more SIP-10s
Tokens like USDh, stSTX, VELAR, and aeUSDC now display accurate fiat equivalents.

### Biggest balances first
Assets are ordered by fiat value. Your highest-value tokens appear at the top.

### Prices, but faster
Backend updates have significantly reduced load times for wallet balance and price data.
```

---

## Format: X Post (Single Tweet)

280 character limit. Attached image referenced in notes.

### Structure

```
[What shipped — one clear statement]

[What users can do now — concrete benefit]

[Link or CTA]

[Image: description for attachment]
```

### Examples

**Feature announcement:**

```
Leather mobile. Now on iOS and Android.

Manage Bitcoin, Stacks, and sBTC from your phone with full self-custody.

iOS: [link]
Android: [link]

[Image: Mobile app screenshot]
```

**Integration/Partnership:**

```
Buying crypto in Leather just got easier.

Apple Pay, Google Pay, Venmo, card—pick what works for you. Multiple providers, one flow.

[Image: Onramp UI screenshot]
```

**Technical update:**

```
Leather now supports SIP-30.

Apps can interact with your wallet through a standard API. No custom JWT payloads, no extra libraries.

Docs: [link]
```

---

## Format: X Thread

For major releases. 3-5 tweets, each stands alone but builds a narrative.

### Structure

```
Tweet 1: The headline — what shipped
Tweet 2: The "why" — problem it solves or context
Tweet 3: The "how" — key capabilities or features
Tweet 4: The details — technical info or additional features (optional)
Tweet 5: The CTA — where to get it, what to do next
```

### Example: Onramper Integration

```
1/
Buying crypto in Leather just got easier.

New integration with @onabordramp. More providers. More payment options.

2/
Our previous onramps had gaps—some payment methods didn't work in certain regions, and the experience wasn't always reliable.

We wanted to fix that properly.

3/
Onramper aggregates providers like Stripe, Moonpay, and Topper into one flow.

You see what's available in your region and choose the best option.

4/
Payment options now include:
• Apple Pay
• Google Pay  
• Debit card
• Venmo
• Bank transfer

More currencies. Better coverage.

5/
A smoother way to get started.

Try the new flow in the extension and let us know what you think.

[Image: Onramp UI screenshot]
```

---

## Format: Community Slack Post

Slightly warmer than changelog, but still professional. Okay to acknowledge past friction honestly. Lead with user value.

### Structure

```
**[Emoji] [Feature Name]**

[1-2 sentence summary of what shipped and why it matters]

[Key details as short bullet points or brief paragraphs]

[Link to changelog or relevant resource]

[Optional: Invite feedback warmly]
```

### Example

```
**💳 New Crypto Onramps**

Buying BTC and STX in Leather is now more reliable and flexible.

We've integrated Onramper, which brings together multiple providers (Stripe, Moonpay, Topper, and more) into one flow:

• More payment options — Apple Pay, Google Pay, Venmo, debit card, bank transfer
• Better regional coverage — see what's actually available where you are
• More consistent experience — fewer issues completing purchases

This replaces our previous onramp setup, which had some rough edges.

Changelog: https://app.leather.io/changelog/onramper-integration

We'd love to hear how the new flow works for you.
```

### Example (Smaller Feature)

```
**⚡ Faster Wallet Loading**

Your wallet now loads faster and shows fiat values for more SIP-10 tokens (USDh, stSTX, VELAR, aeUSDC).

Backend updates reduced load times for balance and price data.

Full changelog: https://app.leather.io/changelog/wallet-balance-improvements
```

---

## Quick Reference: Dos and Don'ts

| Do | Don't |
|----|-------|
| "Buying crypto just got easier" | "We're excited to announce" |
| "We wanted to fix that properly" | "Real talk: it was broken" |
| "Let us know what you think" | "Give it a spin!" |
| "This replaces our previous setup, which had some rough edges" | "Let's just say it wasn't great" |
| "A cleaner path from dollars to crypto" | "Seamlessly purchase digital assets" |
| Lead with user benefit | Lead with company achievement |
| Acknowledge past friction honestly | Overhype or use slang |
| Invite feedback warmly | Corporate sign-offs |
