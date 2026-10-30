import { type ReactNode, useEffect, useRef, useState } from 'react';

import { css } from 'leather-styles/css';
import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

import { ArrowRotateClockwiseIcon } from '@leather.io/ui';

import type { ApprovalHeaderRadius, ApprovalHeaderSurface } from '../pattern/approval-options';
import { useCanvasNavigation } from './canvas-navigation';
import {
  type CanvasFormFactor,
  type CanvasThumbSize,
  type CanvasView,
  useActiveDirections,
  useCanvasSettings,
  useComparedDirections,
} from './canvas-settings';
import { Kbd } from './kbd';

const toolbarHeightVariable = '--canvas-toolbar-height';

const hiddenScrollbar = css({
  scrollbarWidth: 'none',
  '&::-webkit-scrollbar': { display: 'none' },
});

interface ToggleOption<T extends string> {
  value: T;
  label: string;
  title?: string;
}

interface ToggleGroupProps<T extends string> {
  label: string;
  value: T;
  options: ToggleOption<T>[];
  isLabelHidden?: boolean;
  onChange(value: T): void;
}

function ToggleGroup<T extends string>({
  label,
  value,
  options,
  isLabelHidden = false,
  onChange,
}: ToggleGroupProps<T>) {
  return (
    <Flex alignItems="center" gap="space.02" minWidth="0" maxWidth="100%">
      {!isLabelHidden && (
        <styled.span textStyle="caption.02" color="ink.text-subdued" flexShrink={0}>
          {label}
        </styled.span>
      )}
      <Flex
        role="group"
        aria-label={label}
        className={hiddenScrollbar}
        minWidth="0"
        overflowX="auto"
        borderWidth={1}
        borderColor="ink.border-default"
        borderRadius="round"
        p="2px"
        gap="2px"
        bg="ink.background-primary"
      >
        {options.map(option => (
          <styled.button
            key={option.value}
            type="button"
            aria-pressed={option.value === value}
            title={option.title}
            onClick={() => onChange(option.value)}
            textStyle="caption.01"
            px="space.02"
            py="2px"
            borderRadius="round"
            cursor="pointer"
            whiteSpace="nowrap"
            bg={option.value === value ? 'ink.action-primary-default' : 'transparent'}
            color={option.value === value ? 'ink.background-primary' : 'ink.text-subdued'}
            _hover={{
              color: option.value === value ? 'ink.background-primary' : 'ink.text-primary',
            }}
          >
            {option.label}
          </styled.button>
        ))}
      </Flex>
    </Flex>
  );
}

interface SelectFieldProps<T extends string> {
  label: string;
  value: T;
  options: ToggleOption<T>[];
  onChange(value: T): void;
}

function SelectField<T extends string>({ label, value, options, onChange }: SelectFieldProps<T>) {
  return (
    <styled.label display="flex" alignItems="center" justifyContent="space-between" gap="space.03">
      <styled.span textStyle="caption.02" color="ink.text-subdued">
        {label}
      </styled.span>
      <styled.select
        value={value}
        onChange={event => {
          const next = options.find(option => option.value === event.target.value);
          if (next) onChange(next.value);
        }}
        textStyle="caption.01"
        color="ink.text-primary"
        bg="ink.background-primary"
        borderWidth={1}
        borderColor="ink.border-default"
        borderRadius="round"
        px="space.02"
        py="2px"
        cursor="pointer"
        minWidth="180px"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </styled.select>
    </styled.label>
  );
}

const viewOptions: ToggleOption<CanvasView>[] = [
  { value: 'screens', label: 'Screens', title: 'Every screen as a thumbnail' },
  { value: 'viewer', label: 'Viewer', title: 'One screen, big' },
  { value: 'about', label: 'About', title: 'What this proposal is and why' },
  {
    value: 'journeys',
    label: 'Launch prototype',
    title: 'App to wallet to Activity, using the same live views',
  },
  {
    value: 'activity',
    label: 'Activity list row',
    title: 'Unmapped rows beside mapped shapes, linked to activity details',
  },
  { value: 'primitives', label: 'Primitives', title: 'The live approval building blocks' },
];

function ViewSwitcher() {
  const { view } = useCanvasSettings();
  const { setView } = useCanvasNavigation();
  return (
    <Flex
      role="group"
      aria-label="View"
      flexWrap="wrap"
      maxWidth="100%"
      borderWidth={1}
      borderColor="ink.border-default"
      borderRadius="sm"
      p="2px"
      gap="2px"
      bg="ink.background-secondary"
      flexShrink={0}
    >
      {viewOptions.map(option => (
        <styled.button
          key={option.value}
          type="button"
          aria-pressed={option.value === view}
          title={option.title}
          onClick={() => setView(option.value)}
          textStyle="label.03"
          px="space.03"
          py="space.01"
          borderRadius="xs"
          cursor="pointer"
          whiteSpace="nowrap"
          bg={option.value === view ? 'ink.background-primary' : 'transparent'}
          color={option.value === view ? 'ink.text-primary' : 'ink.text-subdued'}
          boxShadow={option.value === view ? '0 1px 2px rgba(18, 16, 15, 0.12)' : 'none'}
          _hover={{ color: 'ink.text-primary' }}
        >
          {option.label}
        </styled.button>
      ))}
    </Flex>
  );
}

function CompareDirectionPicker() {
  const { hiddenDirections, showToday, update } = useCanvasSettings();
  const activeDirections = useActiveDirections();
  const visibleCount = useComparedDirections().length;
  function toggle(id: string) {
    const isHidden = hiddenDirections.includes(id);
    if (!isHidden && visibleCount <= 1) return;
    update({
      hiddenDirections: isHidden
        ? hiddenDirections.filter(hiddenId => hiddenId !== id)
        : [...hiddenDirections, id],
    });
  }
  return (
    <Flex
      role="group"
      aria-label="Directions in the comparison"
      alignItems="center"
      gap="space.02"
      flexWrap="wrap"
      minWidth="0"
      data-compare-summary
    >
      <CompareChip
        label="Today"
        title="The real capture of the extension, where one exists"
        isOn={showToday}
        onToggle={() => update({ showToday: !showToday })}
      />
      {activeDirections.map(direction => {
        const isOn = !hiddenDirections.includes(direction.id);
        return (
          <CompareChip
            key={direction.id}
            label={direction.name}
            title={
              isOn && visibleCount <= 1
                ? 'Keep at least one direction'
                : `${isOn ? 'Remove' : 'Add'} ${direction.name}. ${direction.description}`
            }
            isOn={isOn}
            isLocked={isOn && visibleCount <= 1}
            onToggle={() => toggle(direction.id)}
          />
        );
      })}
    </Flex>
  );
}

interface CompareChipProps {
  label: string;
  title: string;
  isOn: boolean;
  isLocked?: boolean;
  onToggle(): void;
}

function CompareChip({ label, title, isOn, isLocked = false, onToggle }: CompareChipProps) {
  return (
    <styled.button
      type="button"
      aria-pressed={isOn}
      aria-disabled={isLocked}
      title={title}
      onClick={onToggle}
      display="flex"
      alignItems="center"
      gap="space.01"
      textStyle="caption.01"
      px="space.02"
      py="2px"
      borderWidth={1}
      borderStyle={isOn ? 'solid' : 'dashed'}
      borderColor={isOn ? 'ink.text-primary' : 'ink.border-default'}
      borderRadius="round"
      bg="ink.background-primary"
      color={isOn ? 'ink.text-primary' : 'ink.text-subdued'}
      whiteSpace="nowrap"
      cursor={isLocked ? 'not-allowed' : 'pointer'}
      _hover={{ color: 'ink.text-primary', borderColor: 'ink.text-primary' }}
    >
      <styled.span aria-hidden textStyle="caption.02">
        {isOn ? '✓' : '+'}
      </styled.span>
      {label}
    </styled.button>
  );
}

function CompareToggle() {
  const { isCompare } = useCanvasSettings();
  const { setCompare } = useCanvasNavigation();
  return (
    <styled.button
      type="button"
      aria-pressed={isCompare}
      onClick={() => setCompare(!isCompare)}
      title="Show every direction side by side, one column each"
      display="flex"
      alignItems="center"
      gap="space.02"
      flexShrink={0}
      textStyle="label.03"
      px="space.03"
      py="space.01"
      borderWidth={1}
      borderColor={isCompare ? 'ink.action-primary-default' : 'ink.border-default'}
      borderRadius="round"
      bg={isCompare ? 'ink.action-primary-default' : 'ink.background-primary'}
      color={isCompare ? 'ink.background-primary' : 'ink.text-primary'}
      whiteSpace="nowrap"
      cursor="pointer"
      _hover={{ borderColor: isCompare ? 'ink.action-primary-default' : 'ink.text-primary' }}
    >
      Compare {isCompare ? 'on' : 'off'} <Kbd>c</Kbd>
    </styled.button>
  );
}

function ReplayButton() {
  const { replay } = useCanvasSettings();
  return (
    <styled.button
      type="button"
      onClick={replay}
      aria-keyshortcuts="r"
      title="Replay the visible screens (r)"
      display="flex"
      alignItems="center"
      gap="space.02"
      flexShrink={0}
      textStyle="caption.01"
      color="ink.text-primary"
      px="space.02"
      py="2px"
      borderWidth={1}
      borderColor="ink.border-default"
      borderRadius="round"
      bg="ink.background-primary"
      cursor="pointer"
      _hover={{ borderColor: 'ink.text-primary' }}
    >
      <ArrowRotateClockwiseIcon variant="small" aria-hidden />
      Replay <Kbd>r</Kbd>
    </styled.button>
  );
}

function ThemeToggle() {
  const { theme, update } = useCanvasSettings();
  return (
    <ToggleGroup
      label="Theme"
      value={theme}
      isLabelHidden
      options={[
        { value: 'light', label: 'Light' },
        { value: 'dark', label: 'Dark' },
      ]}
      onChange={next => update({ theme: next })}
    />
  );
}

const headerSurfaceOptions: ToggleOption<ApprovalHeaderSurface>[] = [
  { value: 'divider', label: 'Divider' },
  { value: 'plain', label: 'Plain' },
  { value: 'card', label: 'Card' },
];

const headerRadiusOptions: ToggleOption<ApprovalHeaderRadius>[] = [
  { value: 'sm', label: 'S' },
  { value: 'md', label: 'M' },
  { value: 'lg', label: 'L' },
  { value: 'xl', label: 'XL' },
];

interface OptionRowProps {
  label: string;
  children: ReactNode;
}

function OptionRow({ label, children }: OptionRowProps) {
  return (
    <Flex alignItems="center" justifyContent="space-between" gap="space.03">
      <styled.span textStyle="caption.02" color="ink.text-subdued">
        {label}
      </styled.span>
      {children}
    </Flex>
  );
}

function OptionsPopover() {
  const { titleStyle, headerSurface, headerRadius, update } = useCanvasSettings();
  const [isOpen, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isCard = headerSurface === 'card';
  const changedCount = [
    titleStyle !== 'current',
    headerSurface !== 'divider',
    isCard && headerRadius !== 'md',
  ].filter(Boolean).length;

  useEffect(() => {
    if (!isOpen) return;
    function onPointerDown(event: PointerEvent) {
      const container = containerRef.current;
      if (container && event.target instanceof Node && !container.contains(event.target)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;
      event.stopPropagation();
      setOpen(false);
    }
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  return (
    <Box ref={containerRef} position="relative" flexShrink={0}>
      <styled.button
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        onClick={() => setOpen(current => !current)}
        display="flex"
        alignItems="center"
        gap="space.02"
        textStyle="label.03"
        color="ink.text-primary"
        px="space.03"
        py="space.01"
        borderWidth={1}
        borderColor={isOpen ? 'ink.text-primary' : 'ink.border-default'}
        borderRadius="sm"
        bg="ink.background-primary"
        cursor="pointer"
        _hover={{ borderColor: 'ink.text-primary' }}
      >
        Options
        {changedCount > 0 && (
          <styled.span
            textStyle="caption.02"
            color="ink.background-primary"
            bg="ink.action-primary-default"
            borderRadius="round"
            px="6px"
          >
            {changedCount}
          </styled.span>
        )}
      </styled.button>
      {isOpen && (
        <Stack
          role="dialog"
          aria-label="Screen options"
          position="absolute"
          right="0"
          top="calc(100% + 6px)"
          zIndex={30}
          gap="space.03"
          p="space.04"
          bg="ink.background-primary"
          borderWidth={1}
          borderColor="ink.border-default"
          borderRadius="sm"
          boxShadow="0 12px 32px rgba(18, 16, 15, 0.14)"
          minWidth="340px"
        >
          <styled.span textStyle="label.03">Screen options</styled.span>
          <SelectField
            label="Title"
            value={titleStyle}
            options={[
              { value: 'current', label: 'heading.03 (today)' },
              { value: 'proposed', label: 'heading.05' },
              { value: 'large', label: 'heading.04' },
              { value: 'marche', label: 'Marche, sentence case' },
            ]}
            onChange={next => update({ titleStyle: next })}
          />
          <OptionRow label="Header">
            <ToggleGroup
              label="Header"
              isLabelHidden
              value={headerSurface}
              options={headerSurfaceOptions}
              onChange={next => update({ headerSurface: next })}
            />
          </OptionRow>
          {isCard && (
            <OptionRow label="Corners">
              <ToggleGroup
                label="Corners"
                isLabelHidden
                value={headerRadius}
                options={headerRadiusOptions}
                onChange={next => update({ headerRadius: next })}
              />
            </OptionRow>
          )}
        </Stack>
      )}
    </Box>
  );
}

const thumbSizeOptions: ToggleOption<CanvasThumbSize>[] = [
  { value: 's', label: 'S' },
  { value: 'm', label: 'M' },
  { value: 'l', label: 'L' },
];

export function ThumbSizeToggle() {
  const { thumbSize, update } = useCanvasSettings();
  return (
    <Flex alignItems="center" gap="space.02" flexShrink={0}>
      <ToggleGroup
        label="Size"
        value={thumbSize}
        options={thumbSizeOptions}
        onChange={next => update({ thumbSize: next })}
      />
    </Flex>
  );
}

const formFactorOptions: ToggleOption<CanvasFormFactor>[] = [
  { value: 'extension', label: 'Extension', title: '390 × 756' },
  { value: 'phone', label: 'Phone', title: '390 × 844' },
  { value: 'small-phone', label: 'Small phone', title: '360 × 640' },
  { value: 'web', label: 'Web panel', title: '560 × 756' },
];

function FormFactorToggle() {
  const { formFactor, update } = useCanvasSettings();
  return (
    <Stack gap="space.01" minWidth="0">
      <ToggleGroup
        label="Form factor"
        value={formFactor}
        options={formFactorOptions}
        onChange={next => update({ formFactor: next })}
      />
      {formFactor !== 'extension' && (
        <styled.span textStyle="caption.02" color="ink.text-subdued">
          Layout preview · native safe areas, navigation and device signing need validation.
        </styled.span>
      )}
    </Stack>
  );
}

function ToolbarSettings() {
  return (
    <Flex gap="space.03" rowGap="space.02" alignItems="center" flexShrink={0} ml="auto">
      <ThemeToggle />
      <OptionsPopover />
    </Flex>
  );
}

function useToolbarHeightVariable() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const root = document.documentElement;
    const observer = new ResizeObserver(() => {
      root.style.setProperty(
        toolbarHeightVariable,
        `${Math.round(element.getBoundingClientRect().height)}px`
      );
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
      root.style.removeProperty(toolbarHeightVariable);
    };
  }, []);
  return ref;
}

interface CanvasToolbarProps {
  navigation?: ReactNode;
}

export function CanvasToolbar({ navigation }: CanvasToolbarProps) {
  const { view } = useCanvasSettings();
  const ref = useToolbarHeightVariable();
  const isStandalone = view === 'primitives' || view === 'activity';
  return (
    <Stack
      ref={ref}
      data-canvas-sticky
      position="sticky"
      top={0}
      zIndex={20}
      bg="ink.background-primary"
      borderBottomWidth={1}
      borderColor="ink.border-default"
      px={{ base: 'space.05', lg: 'space.08' }}
      py="space.03"
      gap="space.02"
    >
      {navigation}
      <Flex gap="space.04" rowGap="space.02" flexWrap="wrap" alignItems="center" minWidth="0">
        <ViewSwitcher />
        {view === 'viewer' && <FormFactorToggle />}
        {!isStandalone && <ReplayButton />}
        {isStandalone ? <ThemeToggle /> : <ToolbarSettings />}
      </Flex>
    </Stack>
  );
}

export function ConceptControls() {
  const { isCompare } = useCanvasSettings();
  return (
    <Flex gap="space.03" rowGap="space.02" flexWrap="wrap" alignItems="center">
      <CompareToggle />
      {isCompare && <CompareDirectionPicker />}
    </Flex>
  );
}
