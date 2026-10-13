import { SharedComponentsSelectors } from '@tests/selectors/shared-component.selectors';
import { HStack } from 'leather-styles/jsx';

import type { Money } from '@leather.io/models';
import { AddressDisplayer, Approver, Avatar, ItemLayout, UserIcon } from '@leather.io/ui';

import type { TransferRecipient } from '@shared/models/form.model';

import { formatCurrency } from '@app/common/currency-formatter';
import { Divider } from '@app/components/layout/divider';

interface TransactionRecipientsLayoutProps {
  avatar: React.ReactNode;
  caption: string;
  recipients: TransferRecipient[];
  title: string;
  convertToFiatAmount(value: Money): Money;
}
export function TransactionRecipientsLayout({
  avatar,
  caption,
  recipients,
  title,
  convertToFiatAmount,
}: TransactionRecipientsLayoutProps) {
  return recipients.map(({ address, amount }) => {
    const fiatAmount = convertToFiatAmount(amount);

    const titleRight = formatCurrency(amount);
    const captionRight = formatCurrency(fiatAmount);

    return (
      <Approver.Section key={address}>
        <Approver.Subheader>You'll send</Approver.Subheader>

        <ItemLayout
          img={avatar}
          titleLeft={title}
          captionLeft={caption}
          titleRight={titleRight}
          captionRight={captionRight}
        />

        <Divider mt="space.05" mb="space.04" />

        <Approver.Subheader>To address</Approver.Subheader>
        <HStack key={address} alignItems="center" gap="space.04" pb="space.03">
          <Avatar
            size="lg"
            bg="ink.component-background-hover"
            outlineColor="ink.component-background-hover"
            icon={<UserIcon />}
          />
          <AddressDisplayer
            data-testid={SharedComponentsSelectors.AddressDisplayer}
            address={address}
          />
        </HStack>
      </Approver.Section>
    );
  });
}
