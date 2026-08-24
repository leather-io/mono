import { useState } from 'react';

import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

import {
  type CriterionId,
  type FactValue,
  criteria,
  screenLayouts,
  shotUrl,
} from './extension-approval-screens.data';

const marks: Record<FactValue, string> = { yes: '✓', no: '✕', partial: '~', na: '–' };

const factColors: Record<FactValue, { bg: string; color: string }> = {
  yes: { bg: 'green.background-primary', color: 'green.text-primary' },
  no: { bg: 'red.background-primary', color: 'red.text-primary' },
  partial: { bg: 'yellow.background-primary', color: 'yellow.text-primary' },
  na: { bg: 'ink.background-secondary', color: 'ink.text-subdued' },
};

const scales = [1, 0.72, 0.5];

const popupWidth = 390;
const popupHeight = 756;

interface ChipProps {
  isActive: boolean;
  onClick(): void;
  children: React.ReactNode;
}
function Chip({ isActive, onClick, children }: ChipProps) {
  return (
    <styled.button
      type="button"
      onClick={onClick}
      textStyle="label.03"
      px="space.03"
      py="space.01"
      borderRadius="xs"
      borderWidth="1px"
      borderColor={isActive ? 'ink.text-primary' : 'ink.border-default'}
      bg={isActive ? 'ink.text-primary' : 'ink.background-primary'}
      color={isActive ? 'ink.background-primary' : 'ink.text-primary'}
      cursor="pointer"
    >
      {children}
    </styled.button>
  );
}

export function ExtensionApprovalScreensPage() {
  const [activeCriterion, setActiveCriterion] = useState<CriterionId | null>(null);
  const [scale, setScale] = useState(1);

  const allScreens = screenLayouts.flatMap(layout =>
    layout.screens.map(screen => ({ screen, layoutTitle: layout.title }))
  );

  return (
    <Box p="space.05" maxWidth="100%">
      <styled.h1 textStyle="heading.04" mb="space.02">
        dApp approval screens — what each one displays
      </styled.h1>

      <Stack gap="space.02" maxWidth="84ch" mb="space.05">
        <styled.p textStyle="body.02" color="ink.text-subdued">
          Every screen the extension shows a website when it asks for something, grouped by the
          three layouts they're built on. These are real captures, not mockups: a real extension
          build, real RPC requests fired through the in-repo test dApp, driven by Playwright at the
          true popup viewport of {popupWidth}×{popupHeight}. Each image is a full-page shot, so
          anything below the dashed line is content the user has to scroll to.
        </styled.p>
        <styled.p textStyle="body.02" color="ink.text-subdued">
          Fixture noise rather than design: the requesting site is the repo's test dApp
          (localhost:3000, calling itself "Testing App"), balances and fees come from the test
          suite's network mocks — so a fee reading $18.00 or an account reading 0.000000 STX is mock
          data — and contract arguments read "unknown" because the mocked API returns no ABI.
          Layout, copy, which fields appear and how numbers are formatted are all real.
        </styled.p>
      </Stack>

      <Flex
        gap="space.02"
        alignItems="center"
        flexWrap="wrap"
        mb="space.05"
        pb="space.03"
        borderBottomWidth="1px"
        borderBottomColor="ink.border-default"
      >
        <styled.span textStyle="label.03" color="ink.text-subdued" mr="space.01">
          Highlight screens missing:
        </styled.span>
        {criteria.map(criterion => (
          <Chip
            key={criterion.id}
            isActive={activeCriterion === criterion.id}
            onClick={() =>
              setActiveCriterion(activeCriterion === criterion.id ? null : criterion.id)
            }
          >
            {criterion.short}
          </Chip>
        ))}
        <styled.span textStyle="label.03" color="ink.text-subdued" ml="auto" mr="space.01">
          Size:
        </styled.span>
        {scales.map(option => (
          <Chip key={option} isActive={scale === option} onClick={() => setScale(option)}>
            {Math.round(option * 100)}%
          </Chip>
        ))}
      </Flex>

      {screenLayouts.map(layout => (
        <Box key={layout.title} mb="space.06">
          <styled.h2 textStyle="heading.05" mb="space.01">
            {layout.title}
          </styled.h2>
          <styled.p textStyle="code" color="ink.text-subdued" mb="space.04">
            {layout.source}
          </styled.p>

          <Flex gap="space.05" overflowX="auto" alignItems="flex-start" pb="space.04">
            {layout.screens.map(screen => {
              const value = activeCriterion ? screen.facts[activeCriterion] : null;
              const isDimmed = Boolean(activeCriterion) && value !== 'no';
              return (
                <Stack
                  key={`${screen.method}-${screen.detail}`}
                  gap="space.02"
                  flexShrink={0}
                  style={{ width: `${popupWidth * scale}px` }}
                >
                  <Box minHeight="62px">
                    <styled.span textStyle="code" display="block">
                      {screen.method}
                    </styled.span>
                    <styled.span textStyle="caption.01" color="ink.text-non-interactive">
                      {screen.detail}
                    </styled.span>
                    <Box
                      display="inline-block"
                      mt="space.01"
                      px="space.02"
                      borderRadius="xs"
                      textStyle="label.03"
                      bg={
                        screen.status === 'live'
                          ? 'green.background-primary'
                          : 'yellow.background-primary'
                      }
                      color={
                        screen.status === 'live' ? 'green.text-primary' : 'yellow.text-primary'
                      }
                    >
                      {screen.status === 'live' ? 'live' : 'live · deprecated'}
                    </Box>
                  </Box>

                  <Box position="relative" style={{ opacity: isDimmed ? 0.3 : 1 }}>
                    <styled.img
                      src={shotUrl(screen.shot)}
                      alt={`${screen.method} ${screen.detail}`}
                      display="block"
                      width="100%"
                      height="auto"
                      borderWidth="1px"
                      borderColor={
                        value === 'no' ? 'blue.action-primary-default' : 'ink.border-default'
                      }
                      borderRadius="sm"
                    />
                    <Box
                      position="absolute"
                      left={0}
                      right={0}
                      borderTopWidth="1px"
                      borderTopColor="red.border"
                      borderTopStyle="dashed"
                      pointerEvents="none"
                      style={{ top: `${popupHeight * scale}px` }}
                    />
                  </Box>

                  <Box
                    bg="ink.background-secondary"
                    borderWidth="1px"
                    borderColor="ink.border-default"
                    borderRadius="xs"
                    p="space.03"
                  >
                    <styled.p textStyle="caption.01">{screen.note}</styled.p>
                  </Box>

                  <Stack gap="space.01">
                    {criteria.map(criterion => {
                      const factValue = screen.facts[criterion.id];
                      const colors = factColors[factValue];
                      const isMatch = activeCriterion === criterion.id;
                      return (
                        <Flex
                          key={criterion.id}
                          gap="space.01"
                          px="space.02"
                          py="space.01"
                          borderRadius="xs"
                          bg={colors.bg}
                          color={colors.color}
                          textStyle="caption.01"
                          style={{ opacity: activeCriterion && !isMatch ? 0.2 : 1 }}
                        >
                          <styled.span width="14px">{marks[factValue]}</styled.span>
                          <styled.span>{criterion.label}</styled.span>
                        </Flex>
                      );
                    })}
                  </Stack>
                </Stack>
              );
            })}

            {layout.missing?.map(item => (
              <Stack
                key={item.title}
                gap="space.02"
                flexShrink={0}
                p="space.04"
                borderWidth="1px"
                borderStyle="dashed"
                borderColor="ink.border-default"
                borderRadius="sm"
                style={{ width: `${popupWidth * scale}px` }}
              >
                <styled.p textStyle="label.03">{item.title}</styled.p>
                <styled.p textStyle="caption.01" color="ink.text-subdued">
                  {item.body}
                </styled.p>
              </Stack>
            ))}
          </Flex>
        </Box>
      ))}

      <Box mb="space.06">
        <styled.h2 textStyle="heading.05" mb="space.03">
          The matrix
        </styled.h2>
        <Box overflowX="auto">
          <styled.table width="100%" style={{ borderCollapse: 'collapse' }}>
            <styled.thead>
              <styled.tr>
                <styled.th
                  textAlign="left"
                  p="space.02"
                  textStyle="label.03"
                  color="ink.text-subdued"
                >
                  Screen
                </styled.th>
                {criteria.map(criterion => (
                  <styled.th
                    key={criterion.id}
                    textAlign="left"
                    p="space.02"
                    textStyle="label.03"
                    color="ink.text-subdued"
                  >
                    {criterion.label}
                  </styled.th>
                ))}
              </styled.tr>
            </styled.thead>
            <styled.tbody>
              {allScreens.map(({ screen }) => (
                <styled.tr key={`${screen.method}-${screen.detail}`}>
                  <styled.td
                    p="space.02"
                    textStyle="caption.01"
                    borderBottomWidth="1px"
                    borderBottomColor="ink.border-default"
                  >
                    {screen.method}{' '}
                    <styled.span color="ink.text-subdued">{screen.detail}</styled.span>
                  </styled.td>
                  {criteria.map(criterion => {
                    const factValue = screen.facts[criterion.id];
                    const colors = factColors[factValue];
                    return (
                      <styled.td
                        key={criterion.id}
                        p="space.02"
                        textAlign="center"
                        textStyle="label.03"
                        bg={colors.bg}
                        color={colors.color}
                        borderBottomWidth="1px"
                        borderBottomColor="ink.border-default"
                      >
                        {marks[factValue]}
                      </styled.td>
                    );
                  })}
                </styled.tr>
              ))}
            </styled.tbody>
          </styled.table>
        </Box>
        <styled.p textStyle="caption.01" color="ink.text-subdued" mt="space.03" maxWidth="84ch">
          On the fee column: ✓ means the wallet built the transaction, so the fee on screen is the
          fee signed. ~ means the request arrived with its own fee, the wallet replaced it with its
          own estimate and signed that — the number shown is correct, but the requested one is
          discarded without saying so. ✕ means the number on screen is not the fee being signed.
        </styled.p>
      </Box>

      <Box mb="space.06">
        <styled.h2 textStyle="heading.05" mb="space.03">
          The live version
        </styled.h2>
        <Stack gap="space.02" maxWidth="84ch" mb="space.04">
          <styled.p textStyle="body.02" color="ink.text-subdued">
            Everything above is a screenshot — the right format for comparing what ships today,
            useless for trying a change. The same screens also exist as a page inside the extension
            that renders the real components with fake props: edit Approver.Header or the fee row
            and every frame there updates.
          </styled.p>
          <styled.p textStyle="body.02" color="ink.text-subdued">
            Build with WALLET_ENVIRONMENT=development, load the extension unpacked, and open
            index.html#/approval-screens-preview. It lives in the extension because these layout
            components are extension-local; as they move into @leather.io/ui for the consolidation
            they can move here instead.
          </styled.p>
        </Stack>
        <styled.img
          src={shotUrl('preview-live-components.png')}
          alt="The live component preview page inside the extension"
          display="block"
          width="100%"
          maxWidth="1720px"
          height="auto"
          borderWidth="1px"
          borderColor="ink.border-default"
          borderRadius="sm"
        />
      </Box>

      <Box
        bg="ink.background-secondary"
        borderRadius="sm"
        p="space.05"
        maxWidth="92ch"
        mb="space.06"
      >
        <styled.h2 textStyle="heading.05" mb="space.03">
          Which of these are actually in use
        </styled.h2>
        <Stack gap="space.03">
          <styled.p textStyle="body.02">
            Every screen above is registered and reachable in the current build — none of it is
            stale code sitting unused. Two distinctions worth knowing:
          </styled.p>
          <styled.ul pl="space.05" textStyle="body.02">
            <styled.li mb="space.02">
              Flag-gated: btc_addAccount and stx_addAccount are the only approval screens behind a
              flag (releaseAddAccount), plus an origin allowlist. No other approval screen reads a
              flag.
            </styled.li>
            <styled.li mb="space.02">
              Live but undeclared: the wallet's own supportedMethods response lists six methods and
              omits every stx_* method, including ones that are fully live.
            </styled.li>
          </styled.ul>
          <styled.p textStyle="body.02">
            The legacy request flows used to be a third category — live but deprecated — and they
            are now gone: #2612 deleted /transaction, /signature, legacy /psbt and /choose-account
            along with the shared components behind them. That removed three of the sharpest
            problems in this set outright, so what remains to fix is entirely in the Approver
            family: rounded amounts, a fee that is not the one being signed, no network anywhere,
            and a domain with its port stripped.
          </styled.p>
          <styled.p textStyle="body.02">
            For what is left, real usage is still measurable rather than guessable.
            rpc_request_successful fires for every method when its popup opens — it counts opens
            rather than approvals, and over-counts the two flag-gated methods because the rejection
            happens after the popup opens.
          </styled.p>
        </Stack>
      </Box>
    </Box>
  );
}
