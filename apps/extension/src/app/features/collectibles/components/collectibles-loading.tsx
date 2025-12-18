import { Box, Stack, styled } from 'leather-styles/jsx';

export function CollectiblesLoading() {
  return (
    <Stack gap="space.04">
      <Box
        // Full-bleed grid on small widths (HomeTabs adds 24px padding)
        width={{ base: 'calc(100% + 48px)', md: '100%' }}
        marginX={{ base: '-24px', md: 0 }}
      >
        <styled.div
          display="grid"
          gridTemplateColumns={{ base: 'repeat(2, 195px)', md: 'repeat(4, 195px)' }}
          justifyContent="center"
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <Box
              key={i}
              width="195px"
              height="195px"
              bg={i % 2 === 0 ? 'ink.component-background-non-interactive' : 'ink.border-default'}
            />
          ))}
        </styled.div>
      </Box>
    </Stack>
  );
}
