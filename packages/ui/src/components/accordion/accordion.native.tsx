import { ReactNode, useState } from 'react';

import { useTheme } from '@shopify/restyle';

import { ChevronDownIcon, ChevronUpIcon, Text, Theme, TouchableOpacity } from '../../../native';

interface AccordionProps {
  content: ReactNode;
  label: string;
  testID?: string;
}

// TODO: This should use the Cell component?
export function Accordion({ content, label, testID }: AccordionProps) {
  const [showMore, setShowMore] = useState(false);
  const theme = useTheme<Theme>();
  return (
    <>
      <TouchableOpacity
        flexDirection="row"
        justifyContent="space-between"
        onPress={() => setShowMore(!showMore)}
        testID={testID}
      >
        <Text variant="label02">{label}</Text>
        {showMore ? (
          <ChevronUpIcon color={theme.colors['ink.text-primary']} variant="small" />
        ) : (
          <ChevronDownIcon color={theme.colors['ink.text-primary']} variant="small" />
        )}
      </TouchableOpacity>
      {showMore && content}
    </>
  );
}
