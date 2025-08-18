import { ReactElement } from 'react';

import { Box, Flex, FlexProps } from 'leather-styles/jsx';

type Slots = 'preview' | 'form';

type FormLayoutProps = Record<Slots, ReactElement> & FlexProps;

export function FormPageLayout(props: FormLayoutProps) {
  const { preview, form, ...rest } = props;
  return (
    <Flex
      flexDirection={['column', null, null, 'row']}
      justifyContent="center"
      alignItems="flex-start"
      {...rest}
    >
      <Box
        maxWidth={[null, null, null, '380px', '500px']}
        mr={[null, null, null, 'space.05', 'space.08']}
      >
        {form}
      </Box>
      {preview}
    </Flex>
  );
}
