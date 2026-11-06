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
  (props?: Props): Record<string, string>;
  splitVariantProps(props: Props): [Props, Props];
}
type Slot<R extends Recipe> = Extract<keyof ReturnType<R>, string>;
interface Options {
  forwardProps?: string[];
}

function shouldForwardProp(prop: string, variantKeys: string[], options: Options = {}) {
  return (
    options.forwardProps?.includes(prop) || (!variantKeys.includes(prop) && !isCssProperty(prop))
  );
}

function getDisplayName(Component: ElementType) {
  if (typeof Component === 'string') return undefined;
  return Component.displayName || Component.name;
}

export function createStyleContext<R extends Recipe>(recipe: R) {
  const StyleContext = createContext<Record<string, string> | null>(null);

  function withRootProvider(Component: ElementType) {
    function StyledComponent(props: Record<string, unknown>) {
      const [variantProps, otherProps] = recipe.splitVariantProps(props);
      const slotStyles = recipe(variantProps);

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
    const StyledComponent: StyledComponent<ElementType> = styled(
      Component,
      {},
      {
        shouldForwardProp: (prop, variantKeys) => shouldForwardProp(prop, variantKeys, options),
      }
    );
    const StyledSlotProvider = forwardRef<T, P>((props, ref) => {
      const [variantProps, otherProps] = recipe.splitVariantProps(props);
      const slotStyles = recipe(variantProps);

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
    StyledSlotProvider.displayName = getDisplayName(Component);

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
    StyledSlotComponent.displayName = getDisplayName(Component);

    return StyledSlotComponent;
  }

  return {
    withRootProvider,
    withProvider,
    withContext,
  };
}
