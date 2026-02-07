import { KeyboardEvent, useId } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import { Flex, VisuallyHidden, styled } from 'leather-styles/jsx';

import { CloseIcon, IconButton, SearchIcon, useDebouncedValue } from '@leather.io/ui';

const statusDebounceMs = 500;

interface SearchInputProps {
  value: string;
  onChange(value: string): void;
  placeholder: string;
  label?: string;
  autoFocus?: boolean;
  resultsId?: string;
  statusMessage?: string;
  onNavigateToResults?(): void;
}

export function SearchInput({
  value,
  onChange,
  placeholder,
  label = placeholder,
  autoFocus,
  resultsId,
  statusMessage,
  onNavigateToResults,
}: SearchInputProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const hasResultsRegion = resultsId !== undefined;
  const debouncedStatus = useDebouncedValue(statusMessage, statusDebounceMs);

  function clearValue() {
    onChange('');
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') clearValue();
    if (e.key === 'ArrowDown' && onNavigateToResults) {
      e.preventDefault();
      onNavigateToResults();
    }
  }

  return (
    <Flex role="search" alignItems="center" position="relative">
      <Flex position="absolute" left="12px" zIndex={1} aria-hidden="true">
        <SearchIcon color="ink.text-subdued" transform="scale(0.8)" />
      </Flex>

      {hasResultsRegion && <VisuallyHidden id={hintId}>Results update as you type</VisuallyHidden>}

      <styled.input
        type="search"
        aria-label={label}
        aria-controls={resultsId}
        aria-describedby={hasResultsRegion ? hintId : undefined}
        width="100%"
        px="space.07"
        height="inputHeight"
        textStyle="body.02"
        border="1px solid"
        borderColor="ink.border-transparent"
        borderRadius="sm"
        bg="transparent"
        color="ink.text-primary"
        placeholder={placeholder}
        autoFocus={autoFocus}
        autoComplete="off"
        autoCapitalize="none"
        spellCheck={false}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        _focus={{ outline: 'none', borderColor: 'ink.action-primary-default' }}
        _placeholder={{ color: 'ink.text-subdued' }}
      />

      <VisuallyHidden role="status" aria-atomic="true">
        {debouncedStatus}
      </VisuallyHidden>

      <AnimatePresence>
        {value.length > 0 && (
          <motion.div
            key="clear-button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.25, duration: 0.1 } }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
            style={{ position: 'absolute', right: 8 }}
          >
            <IconButton
              aria-label="Clear search"
              onClick={clearValue}
              icon={<CloseIcon variant="small" color="ink.text-subdued" />}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </Flex>
  );
}
