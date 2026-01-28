import { ReactNode, useState } from 'react';

import { TouchableOpacity } from '../button/touchable-opacity.native';
import { Text } from '../text/text.native';

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
      </TouchableOpacity>
      {showMore && content}
    </>
  );
}
