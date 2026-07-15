import { type ChangeEvent, type KeyboardEvent, useState } from 'react';

import { Flex, styled } from 'leather-styles/jsx';

import { Button, CloseIcon, IconButton, Input, PencilIcon, Sheet } from '@leather.io/ui';

interface EditableNameProps {
  value: string;
  onSave(name: string): void;
  title: string;
  label?: string;
  canEdit?: boolean;
}

export function EditableName({
  value,
  onSave,
  title,
  label = 'name',
  canEdit = true,
}: EditableNameProps) {
  const [isShowing, setIsShowing] = useState(false);
  const [draft, setDraft] = useState(value);

  if (!canEdit) return <>{value}</>;

  function open() {
    setDraft(value);
    setIsShowing(true);
  }
  function close() {
    setIsShowing(false);
  }
  function save() {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== value) onSave(trimmed);
    setIsShowing(false);
  }
  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault();
      save();
    }
  }

  return (
    <>
      <Flex alignItems="center" gap="space.02" minWidth={0}>
        <styled.span overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
          {value}
        </styled.span>
        <styled.button
          type="button"
          onClick={open}
          aria-label={`Rename ${label}`}
          display="inline-flex"
          alignItems="center"
          justifyContent="center"
          flexShrink={0}
          bg="transparent"
          border="none"
          cursor="pointer"
          color="ink.text-subdued"
          p="space.01"
          borderRadius="sm"
          _hover={{ color: 'ink.text-primary', bg: 'ink.component-background-hover' }}
        >
          <PencilIcon variant="small" />
        </styled.button>
      </Flex>
      <Sheet
        isShowing={isShowing}
        onClose={close}
        header={
          <Flex
            alignItems="center"
            justifyContent="space-between"
            gap="space.04"
            px="space.05"
            py="space.04"
            width="100%"
            minHeight="headerHeight"
          >
            <styled.h2 textStyle="heading.05">{title}</styled.h2>
            <IconButton icon={<CloseIcon />} onClick={close} />
          </Flex>
        }
      >
        <Flex direction="column" gap="space.04" p="space.05">
          <Input.Root>
            <Input.Field
              autoFocus
              value={draft}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setDraft(event.target.value)}
              onKeyDown={onKeyDown}
              aria-label={`Rename ${label}`}
            />
          </Input.Root>
          <Flex gap="space.03" justifyContent="flex-end">
            <Button variant="ghost" onClick={close}>
              Cancel
            </Button>
            <Button variant="solid" onClick={save} disabled={!draft.trim()}>
              Save
            </Button>
          </Flex>
        </Flex>
      </Sheet>
    </>
  );
}
