import { t } from '@lingui/macro';

import { Box, Button, Text } from '@leather.io/ui/native';

interface EarnCardProps {
  title: string;
  minYield: string;
  maxYield: string;
  image: React.ReactNode;
  description: string;
  onPress: () => void;
}
export function EarnCard({
  title,
  minYield,
  maxYield,
  image,
  description,
  onPress,
}: EarnCardProps) {
  //  TODO: this box wrapper is almost identical to Card but not pressable
  return (
    <Box
      width={308}
      height={448}
      borderRadius="sm"
      p="0"
      justifyContent="space-between"
      bg="ink.background-primary"
      borderWidth={1}
      borderStyle="solid"
      borderColor="ink.border-transparent"
    >
      <Box
        flexDirection="column"
        justifyContent="space-between"
        backgroundColor="ink.background-secondary"
        height={368}
        px="3"
        py="4"
      >
        <Box width={196}>
          <Text variant="heading03">{title}</Text>
        </Box>
        {image}
        <Box
          justifyContent="space-between"
          alignItems="flex-end"
          alignSelf="stretch"
          flexDirection="row"
        >
          <Text variant="caption01" color="ink.text-subdued">
            {t({
              id: 'earn.historical-yield',
              message: 'Historical yield',
            })}
          </Text>
          <Box flexDirection="row" gap="1" alignItems="baseline">
            <Text variant="heading04">{minYield}</Text>
            <Text variant="label01">
              {t({
                id: 'earn.sbtc.yield-description-to',
                message: 'to',
              })}
            </Text>
            <Text variant="heading04">{maxYield}</Text>
          </Box>
        </Box>
      </Box>
      <EarnFooter description={description} onPress={onPress} />
    </Box>
  );
}

interface EarnFooterProps {
  description: string;
  onPress: () => void;
}
function EarnFooter({ description, onPress }: EarnFooterProps) {
  return (
    <Box
      flexDirection="row"
      alignItems="center"
      alignSelf="stretch"
      backgroundColor="ink.component-background-hover"
      p="4"
      gap="5"
      height={80}
    >
      <Box width={201} height={48}>
        <Text variant="caption01" fontSize={13} letterSpacing={0.065} lineHeight={16}>
          {description}
        </Text>
      </Box>
      <Box width={51} height={36}>
        <Button
          p="2"
          justifyContent="center"
          alignItems="center"
          gap="1"
          onPress={onPress}
          title={t({
            id: 'earn.sbtc.button',
            message: 'Enroll',
          })}
        />
      </Box>
    </Box>
  );
}
