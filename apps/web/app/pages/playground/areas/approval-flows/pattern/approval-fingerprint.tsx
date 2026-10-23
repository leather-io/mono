import { Flex, Stack, styled } from 'leather-styles/jsx';

import { approvalSurface } from './approval-surface';

const fingerprintGroupSize = 4;
const fingerprintGroupsPerLine = 4;

interface FingerprintGroup {
  offset: number;
  text: string;
}

function toFingerprintGroups(value: string, size: number): FingerprintGroup[] {
  return Array.from({ length: Math.ceil(value.length / size) }, (_, index) => {
    const offset = index * size;
    return { offset, text: value.slice(offset, offset + size) };
  });
}

function toFingerprintLines(value: string) {
  return toFingerprintGroups(value, fingerprintGroupSize * fingerprintGroupsPerLine).map(line => ({
    offset: line.offset,
    groups: toFingerprintGroups(line.text, fingerprintGroupSize),
  }));
}

interface ApprovalFingerprintProps {
  label: string;
  value: string;
  caption?: string;
}

export function ApprovalFingerprint({ label, value, caption }: ApprovalFingerprintProps) {
  const lines = toFingerprintLines(value);
  return (
    <Stack
      gap="space.02"
      px="space.04"
      py="space.03"
      className={approvalSurface.group}
      data-approval-zone="fingerprint"
    >
      <styled.span textStyle="caption.01" color="ink.text-subdued">
        {label}
      </styled.span>
      <Stack gap="space.01" aria-hidden="true">
        {lines.map(line => (
          <Flex key={line.offset} gap="1.5ch">
            {line.groups.map((group, index) => (
              <styled.span
                key={group.offset}
                textStyle="address"
                fontSize="16px"
                letterSpacing="0.04em"
                color={index % 2 === 0 ? 'ink.text-primary' : 'ink.text-subdued'}
              >
                {group.text}
              </styled.span>
            ))}
          </Flex>
        ))}
      </Stack>
      <styled.span srOnly>{value.split('').join(' ')}</styled.span>
      {caption && (
        <styled.span textStyle="caption.01" color="ink.text-subdued">
          {caption}
        </styled.span>
      )}
    </Stack>
  );
}
