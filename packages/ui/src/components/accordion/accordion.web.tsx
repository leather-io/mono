import { forwardRef } from 'react';

import { css } from 'leather-styles/css';
import { Accordion as RadixAccordion } from 'radix-ui';

const Root = forwardRef<HTMLDivElement, RadixAccordion.AccordionSingleProps>((props, ref) => (
  <RadixAccordion.Root ref={ref} className={css({ textStyle: 'label.02' })} {...props}>
    {props.children}
  </RadixAccordion.Root>
));

Root.displayName = 'Accordion';

export const Item = forwardRef<HTMLDivElement, RadixAccordion.AccordionItemProps>((props, ref) => (
  <RadixAccordion.Item
    ref={ref}
    {...props}
    className={css({
      '&[data-state="open"] + &[data-state="closed"]': {
        borderTop: 'default',
      },
    })}
  />
));
Item.displayName = 'AccordionItem';

const Trigger = forwardRef<HTMLButtonElement, RadixAccordion.AccordionTriggerProps>(
  (props, ref) => (
    <RadixAccordion.Header>
      <RadixAccordion.Trigger
        ref={ref}
        className={css({
          textAlign: 'left',
          width: '100%',
          position: 'relative',
          py: 'space.02',
          cursor: 'pointer',
          pl: 'space.08',
          _before: {
            position: 'absolute',
            left: 0,
          },
          '&[data-state="open"]': {
            _before: {
              content: '"+"',
            },
          },
          '&[data-state="closed"]': {
            borderBottom: 'default',
            _before: {
              content: '"−"',
            },
          },
        })}
        {...props}
      >
        {props.children}
      </RadixAccordion.Trigger>
    </RadixAccordion.Header>
  )
);

Trigger.displayName = 'AccordionTrigger';

const Content = forwardRef<HTMLDivElement, RadixAccordion.AccordionContentProps>((props, ref) => (
  <RadixAccordion.Content
    ref={ref}
    className={css({
      overflow: 'hidden',
      color: 'ink.text-subdued',
      pl: 'space.08',
      pt: 'space.01',
      pb: 'space.05',
    })}
    {...props}
  />
));

Content.displayName = 'AccordionContent';

export const Accordion = {
  Root,
  Item,
  Trigger,
  Content,
};
