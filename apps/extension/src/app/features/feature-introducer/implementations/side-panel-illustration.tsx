import { Box, Flex, Stack } from 'leather-styles/jsx';

function PageLine({ width }: { width: string }) {
  return <Box width={width} height="8px" borderRadius="sm" bg="ink.border-default" />;
}

function PanelLine({ width }: { width: string }) {
  return <Box width={width} height="6px" borderRadius="sm" bg="ink.border-default" />;
}

export function SidePanelIllustration() {
  return (
    <Flex
      width="100%"
      aspectRatio="125/84"
      bg="ink.background-secondary"
      alignItems="center"
      justifyContent="center"
      p="space.05"
    >
      <Flex
        width="100%"
        height="100%"
        bg="ink.background-primary"
        borderRadius="md"
        border="default"
        overflow="hidden"
      >
        <Stack gap="space.02" flexGrow={1} p="space.04" justifyContent="center">
          <PageLine width="70%" />
          <PageLine width="90%" />
          <PageLine width="55%" />
        </Stack>
        <Stack
          gap="space.02"
          width="38%"
          p="space.03"
          bg="ink.background-secondary"
          borderLeft="default"
          alignItems="center"
          justifyContent="center"
        >
          <Box width="20px" height="20px" borderRadius="round" bg="ink.action-primary-default" />
          <PanelLine width="80%" />
          <PanelLine width="60%" />
          <Box
            width="80%"
            height="12px"
            borderRadius="round"
            bg="ink.action-primary-default"
            mt="space.01"
          />
        </Stack>
      </Flex>
    </Flex>
  );
}
