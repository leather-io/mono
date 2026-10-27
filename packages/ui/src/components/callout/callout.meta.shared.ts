import { defineComponentMeta } from '../../utils/component-meta.shared';

export const calloutMeta = defineComponentMeta({
  name: 'Callout',
  importFrom: { web: '@leather.io/ui', native: '@leather.io/ui/native' },
  useWhen: [
    'A problem or risk the user has to act on, which stays until it is resolved',
    'Edge to edge: it spans the full width of the screen or sheet (as on the send review), or the full column at the top of a list (as on the home Tokens tab). Square ends, no card around it',
    'At the top of the region it is about: under the amount on a review, above the list it concerns',
  ],
  dontUseWhen: [
    {
      situation:
        'A short note between rows, fields or under one value (an inset box mid-layout reads as a stray card)',
      use: 'HelperText (one line) or the row caption; the explanation goes behind InfoLabel',
    },
    { situation: 'Feedback that confirms an action and goes away', use: 'the app toast' },
    { situation: 'Explaining a term or a fee', use: 'InfoLabel (BasicTooltip)' },
  ],
  replaces: ['a hand-built tinted Box with an icon and text'],
  examples: [
    {
      title: 'Edge to edge under the amount on a review',
      platform: 'web',
      code: '<Callout variant="info" title="Sending to an exchange?" px="space.03" mb="space.05">\n  Make sure you include the memo so the exchange can credit the STX to your account\n</Callout>',
      seenIn:
        'apps/extension/src/app/pages/send/send-crypto-asset-form/form/send-form-confirmation.layout.tsx:78',
    },
    {
      title: 'Full column at the top of the token list',
      platform: 'web',
      code: '<Callout variant="warning" title="aeUSDC is being retired">…</Callout>',
      seenIn: 'apps/extension/src/app/pages/home/components/aeusdc-retirement-callout.tsx:22',
    },
  ],
  playground: '/playground/recipes?recipe=inline-info',
});
