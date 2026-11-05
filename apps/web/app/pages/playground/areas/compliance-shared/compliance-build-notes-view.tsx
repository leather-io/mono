import { type ReactNode } from 'react';

import { Stack, styled } from 'leather-styles/jsx';

import { type BuildNotes } from './compliance-build-notes';

function BuildNotesSection({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Stack gap="space.01">
      <styled.h3 textStyle="label.03" color="ink.text-subdued">
        {label}
      </styled.h3>
      {children}
    </Stack>
  );
}

function BuildNotesList({ items }: { items: string[] }) {
  return (
    <styled.ul
      display="flex"
      flexDirection="column"
      gap="space.01"
      pl="space.04"
      listStyleType="disc"
    >
      {items.map(item => (
        <styled.li key={item} textStyle="caption.01" color="ink.text-secondary">
          {item}
        </styled.li>
      ))}
    </styled.ul>
  );
}

// Trigger / screens / result / today / code / open, as siblings so the parent's gap spaces
// them. Used by the demo's side panel and the board's note cards.
export function BuildNotesContent({ notes }: { notes: BuildNotes }) {
  return (
    <>
      <BuildNotesSection label="Trigger">
        <styled.p textStyle="caption.01" color="ink.text-secondary">
          {notes.trigger}
        </styled.p>
      </BuildNotesSection>
      <BuildNotesSection label="Screens">
        <styled.p textStyle="caption.01" color="ink.text-secondary">
          {notes.screens}
        </styled.p>
      </BuildNotesSection>
      <BuildNotesSection label="Result">
        <styled.p textStyle="caption.01" color="ink.text-secondary">
          {notes.result}
        </styled.p>
      </BuildNotesSection>
      {notes.today ? (
        <BuildNotesSection label="Today">
          <styled.p textStyle="caption.01" color="ink.text-secondary">
            {notes.today}
          </styled.p>
        </BuildNotesSection>
      ) : null}
      {notes.code?.length ? (
        <BuildNotesSection label="Code">
          <BuildNotesList items={notes.code} />
        </BuildNotesSection>
      ) : null}
      {notes.open?.length ? (
        <BuildNotesSection label="Open">
          <BuildNotesList items={notes.open} />
        </BuildNotesSection>
      ) : null}
    </>
  );
}
