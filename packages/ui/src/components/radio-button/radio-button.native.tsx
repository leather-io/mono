import { Box } from 'native';

interface RadioButtonProps {
  isSelected: boolean;
}
export function RadioButton({ isSelected }: RadioButtonProps) {
  return (
    <>
      <Box
        alignItems="center"
        borderRadius="round"
        borderColor="ink.text-primary"
        borderWidth={1}
        backgroundColor="ink.background-primary"
        height={20}
        justifyContent="center"
        width={20}
      >
        <Box
          backgroundColor={isSelected ? 'ink.text-primary' : 'ink.background-primary'}
          borderRadius="round"
          height={10}
          width={10}
        />
      </Box>
    </>
  );
}
