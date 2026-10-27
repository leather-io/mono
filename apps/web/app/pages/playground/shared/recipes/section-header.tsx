// Recipe: a section label above a group of rows, with an optional trailing
// action ("View all", "Edit"). Use it to split a list or a review into groups.
// Not a page title: that lives in the page header.
import { Flex, styled } from 'leather-styles/jsx';

import { Button } from '@leather.io/ui';

interface SectionHeaderProps {
  title: string;
  action?: { label: string; onClick(): void };
}

export function SectionHeader({ title, action }: SectionHeaderProps) {
  return (
    <Flex justifyContent="space-between" alignItems="center" gap="space.03" minHeight="lg">
      <styled.h2 textStyle="label.02" color="ink.text-secondary">
        {title}
      </styled.h2>
      {action ? (
        // The ghost button's padding hangs outside the column so its label lines up
        // with the values in the rows below.
        <Button size="sm" variant="ghost" mr="-space.03" onClick={action.onClick}>
          {action.label}
        </Button>
      ) : null}
    </Flex>
  );
}
