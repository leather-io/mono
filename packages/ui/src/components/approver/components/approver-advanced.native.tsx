import { ChevronDownIcon, ChevronUpIcon, Pressable, Text } from 'native';
import { HasChildren } from 'src/utils/has-children.shared';

import { useApproverContext, useRegisterApproverChild } from '../approver-context.shared';

interface ApproverAdvancedProps extends HasChildren {
  titleOpened: string;
  titleClosed: string;
}
export function ApproverAdvanced({ children, titleOpened, titleClosed }: ApproverAdvancedProps) {
  const { isDisplayingAdvancedView, setIsDisplayingAdvancedView } = useApproverContext();
  useRegisterApproverChild('advanced');
  const buttonTitle = isDisplayingAdvancedView ? titleOpened : titleClosed;
  const chevron = isDisplayingAdvancedView ? <ChevronUpIcon /> : <ChevronDownIcon />;

  return (
    <>
      <Pressable
        flexDirection="row"
        py="3"
        my="3"
        px="5"
        justifyContent="space-between"
        bg="ink.background-secondary"
        onPress={() => setIsDisplayingAdvancedView(!isDisplayingAdvancedView)}
      >
        <Text variant="label01">{buttonTitle}</Text>
        {chevron}
      </Pressable>

      {isDisplayingAdvancedView && children}
    </>
  );
}
