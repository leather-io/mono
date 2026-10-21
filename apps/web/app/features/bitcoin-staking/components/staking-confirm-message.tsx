import { useState } from 'react';

import { styled } from 'leather-styles/jsx';

interface StakingConfirmMessageProps {
  message?: string;
}

export function StakingConfirmMessage({ message }: StakingConfirmMessageProps) {
  const [lastMessage, setLastMessage] = useState(message);
  const isVisible = Boolean(message);

  if (message && message !== lastMessage) {
    setLastMessage(message);
  }

  return (
    <>
      <styled.span role="alert" srOnly>
        {message}
      </styled.span>
      <styled.div
        aria-hidden
        display="grid"
        gridTemplateRows={isVisible ? '1fr' : '0fr'}
        transition="grid-template-rows 200ms cubic-bezier(0.2, 0, 0, 1)"
        _motionReduce={{ transition: 'none' }}
      >
        <styled.div overflow="hidden" minHeight="0">
          <styled.p
            pt="space.02"
            textStyle="caption.02"
            color="red.action-primary-default"
            textAlign="center"
            opacity={isVisible ? 1 : 0}
            transform={isVisible ? 'translateY(0)' : 'translateY(-4px)'}
            transition="opacity 160ms ease-out, transform 200ms cubic-bezier(0.2, 0, 0, 1)"
            _motionReduce={{ transform: 'none' }}
          >
            {lastMessage}
          </styled.p>
        </styled.div>
      </styled.div>
    </>
  );
}
