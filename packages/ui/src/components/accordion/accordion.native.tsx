import { ReactNode, useState } from 'react';

import { ChevronDownIcon, ChevronUpIcon, Text, TouchableOpacity } from '../../../native';

interface AccordionProps {
  content: ReactNode;
  label: string;
  testID?: string;
}
export function Accordion({ content, label, testID }: AccordionProps) {
  const [showMore, setShowMore] = useState(false);
  return (
    <>
      <TouchableOpacity
        flexDirection="row"
        justifyContent="space-between"
        onPress={() => setShowMore(!showMore)}
        py="3"
        testID={testID}
      >
        <Text variant="label02">{label}</Text>
        {showMore ? (
          <ChevronUpIcon color="ink.text-primary" variant="small" />
        ) : (
          <ChevronDownIcon color="ink.text-primary" variant="small" />
        )}
      </TouchableOpacity>
      {showMore && content}
    </>
  );
}
