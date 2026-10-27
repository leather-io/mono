// Recipe: a label with its explanation behind an info icon, and the one helper
// line a screen may show. Use InfoLabel wherever a term or a fee needs
// explaining; the explanation goes in the tooltip, not on the screen. A problem
// the user has to act on is an edge-to-edge Callout instead (see recipes.md):
// never a Callout dropped between rows as a note.
//
// Inline icons use InlineIcon from @leather.io/ui, inside the text element: the
// icon takes the text's ink (or a lighter step, never darker) and sits on the
// text line at the text's size. Mirrors the extension's "Total balance ⓘ"
// (apps/extension/src/app/pages/home/components/account-card.tsx).
import type { ReactNode } from 'react';

import { styled } from 'leather-styles/jsx';

import { BasicTooltip, InfoCircleIcon, InlineIcon } from '@leather.io/ui';

import { defineRecipeMeta } from './recipe-meta';

export const inlineInfoMeta = defineRecipeMeta({
  name: 'Inline info (InfoLabel, HelperText)',
  mirrors: 'apps/extension/src/app/pages/home/components/account-card.tsx (Total balance ⓘ)',
  useWhen: [
    'InfoLabel: optional background explanation behind a label; decision-critical facts remain visible',
    'HelperText: concise context needed for the current decision; prioritize useful information rather than a sentence quota',
    'Any icon next to words (info, lock, user, chevron): InlineIcon inside the text, same ink or lighter',
  ],
  dontUseWhen: [
    {
      situation: 'A problem the user has to act on',
      use: 'the shell notice descriptor, or PageNotice inside a padded product region',
    },
    {
      situation: 'A note between rows or fields',
      use: 'HelperText or the row caption, not a Callout',
    },
    { situation: 'An icon that is the action', use: 'IconButton' },
  ],
});

interface InfoLabelProps {
  label: string;
  // One sentence. Longer explanations belong behind "Learn more".
  info?: string;
  // The label's type and ink. Review labels: body.02 in ink.text-secondary.
  textStyle?: 'body.02' | 'label.02' | 'caption.01';
}

export function InfoLabel({ label, info, textStyle = 'body.02' }: InfoLabelProps) {
  return (
    <styled.span textStyle={textStyle} color="ink.text-secondary">
      {label}
      {info ? (
        <BasicTooltip label={info} side="top" asChild>
          <InlineIcon
            icon={InfoCircleIcon}
            tone="subdued"
            placement="end"
            aria-label={info}
            tabIndex={0}
          />
        </BasicTooltip>
      ) : null}
    </styled.span>
  );
}

// The one helper sentence a screen may show (about 60 characters at 360px).
interface HelperTextProps {
  children: ReactNode;
  // Centre it under a centred AmountDisplay.
  centered?: boolean;
}

export function HelperText({ children, centered = false }: HelperTextProps) {
  return (
    <styled.p
      textStyle="caption.01"
      color="ink.text-secondary"
      textAlign={centered ? 'center' : 'start'}
    >
      {children}
    </styled.p>
  );
}
