import { Box, Flex, HTMLStyledProps, styled } from 'leather-styles/jsx';
import { ExternalLink } from '~/components/external-link';

import { Input, usePressable } from '@leather.io/ui';

import { PoolName } from '../utils/types-preset-pools';

interface PoolSelectItemProps extends Omit<HTMLStyledProps<'label'>, 'onChange'> {
  name: PoolName;
  description: string;
  url: string;
  icon: JSX.Element;
  activePoolName: PoolName;
  onChange(poolName: PoolName): void;
}

export function PoolSelectItem(props: PoolSelectItemProps) {
  const { name, description, url, icon, activePoolName, onChange, ...rest } = props;
  const [isFocused, bind] = usePressable();
  return (
    <Box
      borderRadius={isFocused ? '12px' : undefined}
      borderWidth="2px"
      borderColor={isFocused ? '#cedafa' /*figmaTheme.borderFocused*/ : '#00000000'}
      _hover={{ cursor: 'pointer' }}
      borderStyle="solid"
    >
      <styled.label
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        minHeight="72px"
        p="space.05"
        border="1px solid"
        borderColor="ink.border-default"
        borderRadius="12px"
        _hover={{ cursor: 'pointer' }}
        position="relative"
        {...rest}
      >
        <Flex width="100%">
          <Box position="relative" top="-3px">
            {icon}
          </Box>
          <Flex ml="space.02" width="100%" flexDirection={['column', 'row']}>
            <Box>
              <styled.p
                textStyle="body.02"
                fontWeight={500}
                display="block"
                style={{ wordBreak: 'break-all' }}
              >
                {name}
              </styled.p>
              <styled.p
                textStyle="body.02"
                color="ink.text-subdued"
                mt="tight"
                display="inline-block"
                lineHeight="18px"
              >
                {description}
              </styled.p>

              {name === 'Custom Pool' ? (
                <Input.Root>
                  <Input.Field />
                </Input.Root>
              ) : (
                url && <ExternalLink href={url}>Learn more</ExternalLink>
              )}
            </Box>
          </Flex>
          <Flex ml="space.03" alignItems="center">
            <input
              type="radio"
              id={name}
              name="poolName"
              value={name}
              checked={name === activePoolName}
              style={{ transform: 'scale(1.2)', outline: 0 }}
              onChange={e => onChange(e.target.value as PoolName)}
              {...bind}
            />
          </Flex>
        </Flex>
      </styled.label>
    </Box>
  );
}
