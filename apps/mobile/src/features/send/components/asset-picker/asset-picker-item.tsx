import { type ReactElement, cloneElement, useRef } from 'react';
import { View } from 'react-native';

interface AssetPickerItemProps {
  onPress(top: number | null): void;
  children: ReactElement<Partial<{ onPress(): void }>> | null;
  canAnimate?: boolean;
}

export function AssetPickerItem({ onPress, children, canAnimate }: AssetPickerItemProps) {
  const ref = useRef<View>(null);

  function handlePress() {
    if (canAnimate) {
      ref.current?.measureInWindow((...measurements) => {
        onPress(Math.min(measurements[1], 200));
      });
    } else {
      onPress(null);
    }
  }

  return (
    <View ref={ref}>
      {children &&
        cloneElement(children, {
          onPress: handlePress,
        })}
    </View>
  );
}
