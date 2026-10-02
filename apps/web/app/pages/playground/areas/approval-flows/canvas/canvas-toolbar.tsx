import { type ReactNode, useEffect, useRef, useState } from 'react';

import { css } from 'leather-styles/css';
import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

import { findApprovalDirection } from '../directions/direction-registry';
import type {
  ApprovalAccountPlacement,
  ApprovalContainers,
  ApprovalFooterEdge,
  ApprovalHeaderRadius,
  ApprovalHeaderSurface,
  ApprovalLaunch,
} from '../pattern/approval-options';
import { useCanvasNavigation } from './canvas-navigation';
import {
  type CanvasThumbSize,
  type CanvasView,
  useActiveDirections,
  useCanvasSettings,
  useComparedDirections,
  useDiscardedDirections,
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
  { value: 'primitives', label: 'Primitives', title: 'The live building blocks of Handshake' },
];

function ViewSwitcher() {
  const { view } = useCanvasSettings();
  const { setView } = useCanvasNavigation();
  return (
    <Flex
      role="group"
      aria-label="View"
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

function DirectionSwitcher() {
  const { direction, update } = useCanvasSettings();
  const activeDirections = useActiveDirections();
  const active = findApprovalDirection(direction);
  return (
    <Flex alignItems="center" gap="space.02" minWidth="0" maxWidth="100%">
      <Flex
        role="group"
        aria-label="Direction"
        className={hiddenScrollbar}
        minWidth="0"
        overflowX="auto"
        borderWidth={1}
        borderColor="ink.border-default"
        borderRadius="round"
        p="2px"
        gap="2px"
        bg="ink.background-secondary"
      >
        {activeDirections.map((item, index) => (
          <styled.button
            key={item.id}
            type="button"
            aria-pressed={item.id === active.id}
            title={`${index + 1} · ${item.description}`}
            onClick={() => update({ direction: item.id })}
            textStyle="label.03"
            px="space.03"
            py="space.01"
            borderRadius="round"
            cursor="pointer"
            whiteSpace="nowrap"
            bg={item.id === active.id ? 'ink.action-primary-default' : 'transparent'}
            color={item.id === active.id ? 'ink.background-primary' : 'ink.text-subdued'}
            _hover={{
              color: item.id === active.id ? 'ink.background-primary' : 'ink.text-primary',
            }}
          >
            {item.name}
          </styled.button>
        ))}
      </Flex>
      <DiscardedMenu />
    </Flex>
  );
}

function DiscardedMenu() {
  const { direction, isCompare, update, setDirectionDiscarded } = useCanvasSettings();
  const { setCompare } = useCanvasNavigation();
  const discarded = useDiscardedDirections();
  const [isOpen, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isViewingDiscarded = !isCompare && discarded.some(item => item.id === direction);

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

  if (discarded.length === 0) return null;

  function view(id: string) {
    setOpen(false);
    if (isCompare) setCompare(false, { direction: id });
    else update({ direction: id });
  }

  return (
    <Box ref={containerRef} position="relative" flexShrink={0}>
      <styled.button
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        onClick={() => setOpen(current => !current)}
        display="flex"
        alignItems="center"
        gap="space.01"
        textStyle="caption.01"
        px="space.02"
        py="2px"
        borderWidth={1}
        borderStyle="dashed"
        borderColor={isOpen || isViewingDiscarded ? 'ink.text-primary' : 'ink.border-default'}
        borderRadius="round"
        bg="ink.background-primary"
        color={isViewingDiscarded ? 'ink.text-primary' : 'ink.text-subdued'}
        whiteSpace="nowrap"
        cursor="pointer"
        _hover={{ color: 'ink.text-primary', borderColor: 'ink.text-primary' }}
      >
        Discarded · {discarded.length}
      </styled.button>
      {isOpen && (
        <Stack
          role="dialog"
          aria-label="Discarded directions"
          position="absolute"
          left="0"
          top="calc(100% + 6px)"
          zIndex={30}
          gap="space.01"
          p="space.03"
          bg="ink.background-primary"
          borderWidth={1}
          borderColor="ink.border-default"
          borderRadius="sm"
          boxShadow="0 12px 32px rgba(18, 16, 15, 0.14)"
          minWidth="280px"
        >
          <styled.span textStyle="caption.02" color="ink.text-subdued" px="space.02" pb="space.01">
            Out of the running. Still here to look back at.
          </styled.span>
          {discarded.map(item => (
            <Flex
              key={item.id}
              alignItems="center"
              gap="space.03"
              px="space.02"
              py="space.02"
              borderRadius="xs"
              _hover={{ bg: 'ink.component-background-hover' }}
            >
              <styled.button
                type="button"
                onClick={() => view(item.id)}
                title={item.description}
                flex="1"
                minWidth="0"
                textAlign="left"
                cursor="pointer"
              >
                <styled.span display="block" textStyle="label.03" color="ink.text-primary">
                  {item.name}
                </styled.span>
                <styled.span
                  display="block"
                  textStyle="caption.01"
                  color="ink.text-subdued"
                  truncate
                >
                  {item.inspiration}
                </styled.span>
              </styled.button>
              <styled.button
                type="button"
                onClick={() => setDirectionDiscarded(item.id, false)}
                textStyle="caption.01"
                color="ink.text-primary"
                px="space.02"
                py="2px"
                borderWidth={1}
                borderColor="ink.border-default"
                borderRadius="round"
                cursor="pointer"
                flexShrink={0}
                _hover={{ borderColor: 'ink.text-primary' }}
              >
                Restore
              </styled.button>
            </Flex>
          ))}
        </Stack>
      )}
    </Box>
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
      <DiscardedMenu />
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

const accountOptions: ToggleOption<ApprovalAccountPlacement>[] = [
  { value: 'body', label: 'After what moves' },
  { value: 'footer', label: 'Above buttons' },
  { value: 'header', label: 'In header' },
];

function AccountToggle() {
  const { accountPlacement, update } = useCanvasSettings();
  return (
    <ToggleGroup
      label="Account"
      isLabelHidden
      value={accountPlacement}
      options={accountOptions}
      onChange={next => update({ accountPlacement: next })}
    />
  );
}

const launchOptions: ToggleOption<ApprovalLaunch>[] = [
  { value: 'off', label: 'Off' },
  { value: 'mark', label: 'L mark' },
  { value: 'draw', label: 'L drawing' },
  {
    value: 'handshake',
    label: 'Handshake',
    title: 'Connect plays the handshake; other approvals open with a brief L mark',
  },
];

const containerOptions: ToggleOption<ApprovalContainers>[] = [
  {
    value: 'groups',
    label: 'Fill groups',
    title: 'Grouped rows sit on a light fill, sections are divided by lines',
  },
  {
    value: 'interactive',
    label: 'Fill means interactive',
    title: 'Only what you can act on is filled; read-only groups are outlined, no divider lines',
  },
];

function LaunchControl() {
  const { launch, update, replay } = useCanvasSettings();
  return (
    <Flex alignItems="center" gap="space.02" flexShrink={0}>
      <ToggleGroup
        label="Launch"
        isLabelHidden
        value={launch}
        options={launchOptions}
        onChange={next => update({ launch: next })}
      />
      <styled.button
        type="button"
        onClick={replay}
        title="Remount the visible screens so the launch plays again"
        display="flex"
        alignItems="center"
        gap="space.02"
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
        Replay <Kbd>r</Kbd>
      </styled.button>
    </Flex>
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

const footerEdgeOptions: ToggleOption<ApprovalFooterEdge>[] = [
  { value: 'gradient', label: 'Gradient' },
  { value: 'line', label: 'Line' },
  { value: 'fade', label: 'Fade' },
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
  const {
    titleStyle,
    networkLabel,
    headerSurface,
    headerRadius,
    footerEdge,
    accountPlacement,
    launch,
    containers,
    update,
  } = useCanvasSettings();
  const [isOpen, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isCard = headerSurface === 'card';
  const changedCount = [
    titleStyle !== 'current',
    networkLabel !== 'always',
    headerSurface !== 'divider',
    isCard && headerRadius !== 'md',
    footerEdge !== 'gradient',
    accountPlacement !== 'body',
    launch !== 'off',
    containers !== 'groups',
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
          <OptionRow label="Account">
            <AccountToggle />
          </OptionRow>
          <OptionRow label="Launch">
            <LaunchControl />
          </OptionRow>
          <OptionRow label="Containers">
            <ToggleGroup
              label="Containers"
              isLabelHidden
              value={containers}
              options={containerOptions}
              onChange={next => update({ containers: next })}
            />
          </OptionRow>
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
          <SelectField
            label="Network"
            value={networkLabel}
            options={[
              { value: 'always', label: 'Always' },
              { value: 'non-mainnet', label: 'Only off mainnet' },
            ]}
            onChange={next => update({ networkLabel: next })}
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
          <OptionRow label="Footer edge">
            <ToggleGroup
              label="Footer edge"
              isLabelHidden
              value={footerEdge}
              options={footerEdgeOptions}
              onChange={next => update({ footerEdge: next })}
            />
          </OptionRow>
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
  const { view, isCompare } = useCanvasSettings();
  const ref = useToolbarHeightVariable();
  const isScreens = view === 'screens';
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
      py="space.03"
      gap="space.02"
    >
      {navigation}
      {isScreens ? (
        <>
          <Flex gap="space.04" rowGap="space.02" flexWrap="wrap" alignItems="center" minWidth="0">
            <ViewSwitcher />
            <CompareToggle />
            {isCompare ? <CompareDirectionPicker /> : <DirectionSwitcher />}
            <ToolbarSettings />
          </Flex>
        </>
      ) : (
        <Flex gap="space.04" rowGap="space.02" flexWrap="wrap" alignItems="center" minWidth="0">
          <ViewSwitcher />
          {view === 'primitives' ? <ThemeToggle /> : <ToolbarSettings />}
        </Flex>
      )}
    </Stack>
  );
}
