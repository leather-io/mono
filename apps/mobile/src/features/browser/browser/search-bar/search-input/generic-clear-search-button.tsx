import { CloseIcon, Pressable, PressableProps } from '@leather.io/ui/native';

export function GenericClearSearchButton(props: PressableProps) {
  return (
    <Pressable
      {...props}
      position="absolute"
      top={2}
      bottom={2}
      py="4"
      px="4"
      justifyContent="center"
      alignItems="center"
      bg="ink.background-primary"
    >
      <CloseIcon width={16} height={16} />
    </Pressable>
  );
}
