import { useCallback, useState } from 'react';
import { GestureResponderEvent } from 'react-native';

interface UsePressedStateInputProps {
  onPressIn?: ((event: GestureResponderEvent) => void) | null;
  onPressOut?: ((event: GestureResponderEvent) => void) | null;
}

/**
 * Access pressed state of interactive elements.
 * @example Basic example
 * const { pressed, onPressIn, onPressOut } = usePressedState()
 * return <Pressable onPressIn={onPressIn} onPressOut={onPressOut}/>

 * @example Pass outer props to make sure incoming onPressIn and onPressOut are invoked.
 * function Button(props: ButtonProps) {
 *   const { pressed, onPressIn, onPressOut } = usePressedState(props)
 *   return <Pressable onPressIn={onPressIn} onPressOut={onPressOut}/>
 * }
 * */
export function usePressedState({ onPressIn, onPressOut }: UsePressedStateInputProps = {}) {
  const [pressed, setPressed] = useState(false);

  function handlePressIn(event: GestureResponderEvent) {
    setPressed(true);
    onPressIn?.(event);
  }

  function handlePressOut(event: GestureResponderEvent) {
    setPressed(false);
    onPressOut?.(event);
  }

  return {
    onPressIn: useCallback(handlePressIn, [onPressIn]),
    onPressOut: useCallback(handlePressOut, [onPressOut]),
    pressed,
  };
}
