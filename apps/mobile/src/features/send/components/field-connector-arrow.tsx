import { ArrowDownIcon, Box } from '@leather.io/ui/native';

export function FieldConnectorArrow() {
  return (
    <Box
      width={32}
      height={32}
      alignItems="center"
      justifyContent="center"
      bg="ink.background-primary"
      borderColor="ink.border-default"
      borderWidth={1}
      borderRadius="sm"
      alignSelf="center"
      position="absolute"
      bottom={-22}
    >
      <ArrowDownIcon color="ink.text-subdued" variant="small" />
    </Box>
  );
}
