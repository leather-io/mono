import { TooltipProvider } from '@radix-ui/react-tooltip';
import { Box, Circle, styled } from 'leather-styles/jsx';

import { InfoCircleIcon } from '../../../icons/index.web';
import { Button } from '../../button/button.web';
import { Callout } from '../../callout/callout.web';
import { Flag } from '../../flag/flag.web';
import { ItemLayout } from '../../item-layout/item-layout.web';
import { Pressable } from '../../pressable/pressable.web';
import { BasicTooltip } from '../../tooltip';
import { Approver } from '../approver.web';

export function ApproverDemo() {
  return (
    <styled.div minH="100vh">
      <Approver>
        <Approver.Header
          title="Some prompt that bre"
          requester="gamma.io"
          iconTooltip={
            <TooltipProvider delayDuration={300}>
              <BasicTooltip label="Some tooltip">
                <InfoCircleIcon color="ink.action-primary-default" variant="small" />
              </BasicTooltip>
            </TooltipProvider>
          }
        />
        <Callout title="Some callout">Hey watch out for this sketchy app</Callout>
        <Approver.Section>
          <Approver.Subheader>Demo section 1</Approver.Subheader>
          <Flag
            img={<Circle size="40px" backgroundColor="ink.border-default" />}
            align="top"
            mb="space.03"
          >
            <Box width="90%" height="16px" backgroundColor="ink.border-default" />
            <Box width="75%" height="12px" backgroundColor="ink.border-default" mt="space.02" />
          </Flag>
        </Approver.Section>
        <Approver.Section>
          <Approver.Subheader>Demo section 2</Approver.Subheader>
          <ItemLayout
            titleLeft="Example"
            titleRight="Example"
            captionLeft="Example"
            captionRight="Example"
            flagImg={<Circle size="40px" backgroundColor="ink.border-default" />}
          />
        </Approver.Section>
        <Approver.Advanced>
          <Approver.Section>
            Section 3
            <Pressable onClick={() => {}} mt="space.03">
              <ItemLayout
                captionLeft="Example"
                captionRight="Example"
                flagImg={<Circle size="40px" backgroundColor="ink.border-default" />}
                titleLeft="Example"
                titleRight="Example"
                // mb="space.03"
              />
            </Pressable>
          </Approver.Section>
          <Approver.Section>
            <Approver.Subheader>Demo section 1</Approver.Subheader>
            <Flag img={<Circle size="40px" backgroundColor="ink.border-default" />}>
              <Box width="100%" height="20px" backgroundColor="ink.border-default" />
            </Flag>
          </Approver.Section>
          <Approver.Section>
            <Approver.Subheader>Demo section 1</Approver.Subheader>
            <Flag img={<Circle size="40px" backgroundColor="ink.border-default" />}>
              <Box width="100%" height="20px" backgroundColor="ink.border-default" />
            </Flag>
          </Approver.Section>
          <Approver.Section>
            <Approver.Subheader>Demo section 1</Approver.Subheader>
            <Flag img={<Circle size="40px" backgroundColor="ink.border-default" />}>
              <Box width="100%" height="20px" backgroundColor="ink.border-default" />
            </Flag>
          </Approver.Section>
          <Approver.Section>
            <Approver.Subheader>Demo section 1</Approver.Subheader>
            <Flag img={<Circle size="40px" backgroundColor="ink.border-default" />}>
              <Box width="100%" height="20px" backgroundColor="ink.border-default" />
            </Flag>
          </Approver.Section>
          <Approver.Section>
            <Approver.Subheader>Demo section 1</Approver.Subheader>
            <Flag img={<Circle size="40px" backgroundColor="ink.border-default" />}>
              <Box width="100%" height="20px" backgroundColor="ink.border-default" />
            </Flag>
          </Approver.Section>
          <Approver.Section>
            <Approver.Subheader>Demo section 1</Approver.Subheader>
            <Flag img={<Circle size="40px" backgroundColor="ink.border-default" />}>
              <Box width="100%" height="20px" backgroundColor="ink.border-default" />
            </Flag>
          </Approver.Section>
          <Approver.Section>
            <Approver.Subheader>Demo section 1</Approver.Subheader>
            <Flag img={<Circle size="40px" backgroundColor="ink.border-default" />}>
              <Box width="100%" height="20px" backgroundColor="ink.border-default" />
            </Flag>
          </Approver.Section>
        </Approver.Advanced>
        <Approver.Actions
          actions={[
            <Button key={0} variant="outline">
              Cancel
            </Button>,
            <Button key={1}>Approve</Button>,
          ]}
        />
      </Approver>
    </styled.div>
  );
}
