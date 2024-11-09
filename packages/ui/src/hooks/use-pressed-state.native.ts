import { useState } from 'react';
import { GestureResponderEvent } from 'react-native';

interface UsePressedStateInputProps {
  onPressIn?: (event: GestureResponderEvent) => void;
  onPressOut?: (event: GestureResponderEvent) => void;
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
export function usePressedState(props: UsePressedStateInputProps = {}) {
  const [pressed, setPressed] = useState(false);

  function onPressIn(event: GestureResponderEvent) {
    setPressed(true);
    props.onPressIn?.(event);
  }

  function onPressOut(event: GestureResponderEvent) {
    setPressed(false);
    props.onPressOut?.(event);
  }

  return {
    onPressIn,
    onPressOut,
    pressed,
  };
}
