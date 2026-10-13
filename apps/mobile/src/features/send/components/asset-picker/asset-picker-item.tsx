import { ReactElement, ReactNode, cloneElement, useRef } from 'react';
import { View } from 'react-native';

interface AssetPickerItemProps {
  onPress(top: number | null): void;
  children: ReactNode;
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
      {cloneElement(children as ReactElement<Partial<{ onPress(): void }>>, {
        onPress: handlePress,
      })}
    </View>
  );
}
