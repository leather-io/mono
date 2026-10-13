import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

export type NormalizeScrollContainerProps<Props> = Omit<
  Props,
  'onScrollBeginDrag' | 'onScrollEndDrag' | 'onMomentumScrollBegin' | 'onMomentumScrollEnd'
> & {
  onScrollBeginDrag?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onScrollEndDrag?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onMomentumScrollBegin?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onMomentumScrollEnd?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
};
