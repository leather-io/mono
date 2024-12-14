import { forwardRef } from 'react';

import * as RadixAccordion from '@radix-ui/react-accordion';
import { css } from 'leather-styles/css';

import { ChevronDownIcon } from '../../icons/index.web';

const accordionTriggerStyles = css({
  position: 'relative',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  py: 'space.04',
  textStyle: 'label.02',
  transition: 'all 0.2s',
  "&[data-state='open']": {
    '& > .accordion-icon': {
      transform: 'rotate(180deg)',
    },
  },
  '& > .accordion-icon': {
    transition: 'transform 0.2s',
  },

  _hover: {
    color: 'ink.action-primary-hover',
  },
});

const Trigger: typeof RadixAccordion.Trigger = forwardRef((props, ref) => (
  <RadixAccordion.Header>
    <RadixAccordion.Trigger className={accordionTriggerStyles} ref={ref} {...props}>
      {props.children}
      <ChevronDownIcon variant="small" className="accordion-icon" aria-hidden />
    </RadixAccordion.Trigger>
  </RadixAccordion.Header>
));

Trigger.displayName = 'Accordion.Trigger';

const accordionContentStyles = css({
  willChange: 'max-height',
  py: 'space.03',
  overflowY: 'hidden',
  "&[data-state='open']": {
    animation: 'slideDown 300ms ease-in',
  },
  "&[data-state='closed']": {
    animation: 'slideUp 150ms',
  },
});

const Content: typeof RadixAccordion.Content = forwardRef(({ className, ...props }, ref) => (
  <RadixAccordion.Content
    className={`${accordionContentStyles} ${className}`}
    ref={ref}
    {...props}
  />
));

Content.displayName = 'Accordion.Content';

const Item: typeof RadixAccordion.Item = forwardRef((props, ref) => (
  <RadixAccordion.Item {...props} ref={ref} />
));

Item.displayName = 'Accordion.Item';

export const Accordion = {
  Root: RadixAccordion.Root,
  Item,
  Content,
  Trigger,
};
