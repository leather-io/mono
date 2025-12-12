import { useState } from 'react';

import { Box, Flex, styled } from 'leather-styles/jsx';

import { InfoCircleIcon } from '@leather.io/ui';

interface AllocationSegment {
  id: string;
  label: string;
  percentage: number;
  color: string;
  icon?: string;
}

interface AllocationBarProps {
  segments: AllocationSegment[];
  isEmpty?: boolean;
}

function EmptyAllocationBar() {
  return (
    <Flex position="relative" gap="1px" height="32px" borderRadius="xs">
      <Box flex={1} background="#f59300" opacity={0.3} borderLeftRadius="xs" />
      <Box
        flex={1}
        style={{
          background:
            'repeating-linear-gradient(135deg, #d8cec4 0px, #d8cec4 2px, #eae5e0 2px, #eae5e0 6px)',
        }}
      />
      <Box
        flex={1}
        style={{
          background:
            'repeating-linear-gradient(135deg, #d8cec4 0px, #d8cec4 2px, #eae5e0 2px, #eae5e0 6px)',
        }}
      />
      <Box
        flex={0.5}
        style={{
          background:
            'repeating-linear-gradient(135deg, #d8cec4 0px, #d8cec4 2px, #eae5e0 2px, #eae5e0 6px)',
        }}
      />
      <Box
        flex={0.3}
        borderRightRadius="xs"
        style={{
          background:
            'repeating-linear-gradient(135deg, #d8cec4 0px, #d8cec4 2px, #eae5e0 2px, #eae5e0 6px)',
        }}
      />
      <Flex
        position="absolute"
        left="50%"
        top="50%"
        transform="translate(-50%, -50%)"
        alignItems="center"
        gap="space.01"
        px="space.02"
        py="space.01"
        background="ink.text-primary"
        borderRadius="100px"
        whiteSpace="nowrap"
      >
        <InfoCircleIcon variant="small" color="ink.background-primary" />
        <styled.span textStyle="label.03" color="ink.background-primary">
          Your allocation breakdown will appear here
        </styled.span>
      </Flex>
    </Flex>
  );
}

interface SegmentProps {
  segment: AllocationSegment;
  isFirst: boolean;
  isLast: boolean;
}

function Segment({ segment, isFirst, isLast }: SegmentProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Box
      position="relative"
      borderLeftRadius={isFirst ? 'xs' : 'none'}
      borderRightRadius={isLast ? 'xs' : 'none'}
      minWidth="4px"
      cursor="pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      transition="opacity 0.15s"
      _hover={{ opacity: 0.85 }}
      style={{ flex: segment.percentage, background: segment.color }}
    >
      {isHovered && (
        <Flex
          position="absolute"
          bottom="calc(100% + 8px)"
          left="50%"
          transform="translateX(-50%)"
          alignItems="center"
          gap="space.01"
          pl="space.01"
          pr="space.02"
          py="space.01"
          background="ink.text-primary"
          borderRadius="100px"
          whiteSpace="nowrap"
          zIndex={10}
        >
          {segment.icon && (
            <styled.img
              src={segment.icon}
              alt=""
              width="16px"
              height="16px"
              borderRadius="full"
              objectFit="cover"
            />
          )}
          {!segment.icon && (
            <Box
              width="16px"
              height="16px"
              borderRadius="full"
              flexShrink={0}
              style={{ background: segment.color }}
            />
          )}
          <styled.span textStyle="label.03" color="ink.background-primary">
            {segment.label}
          </styled.span>
        </Flex>
      )}
    </Box>
  );
}

function PopulatedAllocationBar({ segments }: { segments: AllocationSegment[] }) {
  return (
    <Flex gap="1px" height="32px" borderRadius="xs">
      {segments.map((segment, index) => (
        <Segment
          key={segment.id}
          segment={segment}
          isFirst={index === 0}
          isLast={index === segments.length - 1}
        />
      ))}
    </Flex>
  );
}

export function AllocationBar({ segments, isEmpty = false }: AllocationBarProps) {
  if (isEmpty || segments.length === 0) {
    return <EmptyAllocationBar />;
  }

  return <PopulatedAllocationBar segments={segments} />;
}

export type { AllocationSegment };
