import { forwardRef } from 'react';

import * as RadixSlider from '@radix-ui/react-slider';
import { css } from 'leather-styles/css';

const sliderRootStyles = css({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  userSelect: 'none',
  touchAction: 'none',
  width: '100%',
});

const sliderTrackStyles = css({
  backgroundColor: 'ink.component-background-default',
  position: 'relative',
  flexGrow: 1,
  height: '4px',
  borderRadius: '0 9999px 9999px 0',
});

const sliderRangeStyles = css({
  position: 'absolute',
  backgroundColor: 'ink.text-primary',
  height: '100%',
});

const sliderThumbStyles = css({
  display: 'block',
  width: '24px',
  height: '24px',
  backgroundColor: 'ink.background-primary',
  borderRadius: '14px',
  boxShadow: 'lg',
  cursor: 'pointer',
  transition: 'transform 0.2s',
  border: '1px solid',
  borderColor: 'ink.border-primary',

  '&:hover': {
    transform: 'scale(1.1)',
  },
  '&:focus': {
    outline: 'none',
    boxShadow: 'focus',
  },
});

const Root = forwardRef<HTMLDivElement, RadixSlider.SliderProps>((props, ref) => (
  <RadixSlider.Root className={sliderRootStyles} ref={ref} {...props} />
));

Root.displayName = 'Slider.Root';

const Track = forwardRef<HTMLDivElement, RadixSlider.SliderTrackProps>((props, ref) => (
  <RadixSlider.Track className={sliderTrackStyles} ref={ref} {...props} />
));

Track.displayName = 'Slider.Track';

const Range = forwardRef<HTMLDivElement, RadixSlider.SliderRangeProps>((props, ref) => (
  <RadixSlider.Range className={sliderRangeStyles} ref={ref} {...props} />
));

Range.displayName = 'Slider.Range';

const Thumb = forwardRef<HTMLDivElement, RadixSlider.SliderThumbProps>((props, ref) => (
  <RadixSlider.Thumb className={sliderThumbStyles} ref={ref} {...props} />
));

Thumb.displayName = 'Slider.Thumb';

export const Slider = {
  Root,
  Track,
  Range,
  Thumb,
};
