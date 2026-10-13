// Copied from Panda docs. This logic is needed when composing together sva
// components, so they can share style state between slots.
// https://panda-css.com/docs/concepts/slot-recipes#styling-jsx-compound-components
import {
  type ElementType,
  type ForwardRefExoticComponent,
  type PropsWithoutRef,
  type RefAttributes,
  createContext,
  forwardRef,
  useContext,
} from 'react';

import { cx } from 'leather-styles/css';
import { type StyledComponent, isCssProperty, styled } from 'leather-styles/jsx';

type Props = Record<string, unknown>;
interface Recipe {
  (props?: Props): Props;
  splitVariantProps: (props: Props) => [Props, Props];
}
type Slot<R extends Recipe> = keyof ReturnType<R>;
interface Options {
  forwardProps?: string[];
}

function shouldForwardProp(prop: string, variantKeys: string[], options: Options = {}) {
  return (
    options.forwardProps?.includes(prop) || (!variantKeys.includes(prop) && !isCssProperty(prop))
  );
}

export function createStyleContext<R extends Recipe>(recipe: R) {
  const StyleContext = createContext<Record<Slot<R>, string> | null>(null);

  function withRootProvider<P extends Record<string, unknown>>(Component: ElementType) {
    function StyledComponent(props: P) {
      const [variantProps, otherProps] = recipe.splitVariantProps(props);
      const slotStyles = recipe(variantProps) as Record<Slot<R>, string>;

      return (
        <StyleContext.Provider value={slotStyles}>
          <Component {...otherProps} />
        </StyleContext.Provider>
      );
    }
    return StyledComponent;
  }

  function withProvider<T, P extends { className?: string | undefined }>(
    Component: ElementType,
    slot: Slot<R>,
    options?: Options
  ): ForwardRefExoticComponent<PropsWithoutRef<P> & RefAttributes<T>> {
    const StyledComponent = styled(
      Component,
      {},
      {
        shouldForwardProp: (prop, variantKeys) => shouldForwardProp(prop, variantKeys, options),
      }
    ) as StyledComponent<ElementType>;
    const StyledSlotProvider = forwardRef<T, P>((props, ref) => {
      const [variantProps, otherProps] = recipe.splitVariantProps(props);
      const slotStyles = recipe(variantProps) as Record<Slot<R>, string>;

      return (
        <StyleContext.Provider value={slotStyles}>
          <StyledComponent
            {...otherProps}
            ref={ref}
            className={cx(slotStyles?.[slot], props.className)}
          />
        </StyleContext.Provider>
      );
    });
    // eslint-disable-next-line
    // @ts-expect-error
    StyledSlotProvider.displayName = Component.displayName || Component.name;

    return StyledSlotProvider;
  }

  function withContext<T, P extends { className?: string | undefined }>(
    Component: ElementType,
    slot: Slot<R>
  ): ForwardRefExoticComponent<PropsWithoutRef<P> & RefAttributes<T>> {
    const StyledComponent = styled(Component);
    const StyledSlotComponent = forwardRef<T, P>((props, ref) => {
      const slotStyles = useContext(StyleContext);
      return (
        <StyledComponent {...props} ref={ref} className={cx(slotStyles?.[slot], props.className)} />
      );
    });
    // eslint-disable-next-line
    // @ts-expect-error
    StyledSlotComponent.displayName = Component.displayName || Component.name;

    return StyledSlotComponent;
  }

  return {
    withRootProvider,
    withProvider,
    withContext,
  };
}
