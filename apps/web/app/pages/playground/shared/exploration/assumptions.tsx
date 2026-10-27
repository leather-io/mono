// Notes and assumptions: the product unknowns behind the screens, always in
// the right rail. Never render this inside a screen; assumptions are reviewer
// notes, not product UI. READ-ONLY for variant builders.
import { Stack, styled } from 'leather-styles/jsx';

import { ColumnLabel, RailDisclosure } from './section';

interface NoteListProps {
  label?: string;
  items: string[];
}

function NoteList({ label, items }: NoteListProps) {
  return (
    <Stack gap="space.01">
      {label ? <ColumnLabel>{label}</ColumnLabel> : null}
      <styled.ul listStyleType="disc" pl="space.04" display="flex" flexDir="column" gap="space.01">
        {items.map(item => (
          <styled.li key={item} textStyle="body.02" color="ink.text-primary">
            {item}
          </styled.li>
        ))}
      </styled.ul>
    </Stack>
  );
}

interface AssumptionsProps {
  // This variant's own notes, listed first.
  notes?: string[];
  assumptions?: string[];
}

export function Assumptions({ notes = [], assumptions = [] }: AssumptionsProps) {
  const count = notes.length + assumptions.length;
  if (count === 0) return null;
  return (
    <RailDisclosure title="Notes & assumptions" meta={`${count} items`} defaultOpen>
      <Stack gap="space.04">
        {notes.length ? <NoteList label="This variant" items={notes} /> : null}
        {assumptions.length ? (
          <NoteList label={notes.length ? 'Every variant' : undefined} items={assumptions} />
        ) : null}
      </Stack>
    </RailDisclosure>
  );
}
