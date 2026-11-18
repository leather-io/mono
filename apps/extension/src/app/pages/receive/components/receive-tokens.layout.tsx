import QRCode from 'react-qr-code';

import { HomePageSelectors } from '@tests/selectors/home.selectors';
import { SharedComponentsSelectors } from '@tests/selectors/shared-component.selectors';
import { Box, Flex, styled } from 'leather-styles/jsx';
import { token } from 'leather-styles/tokens';

import { AddressDisplayer, Button, Sheet, SheetHeader, ShieldIcon } from '@leather.io/ui';

import { ButtonRow } from '@app/components/layout';

interface ReceiveTokensLayoutProps {
  address: string;
  accountName?: string;
  onClose(): void;
  onCopyAddressToClipboard(address: string): void;
  onVerifyAddress?(): void;
  title: string;
  warning?: React.JSX.Element;
}
export function ReceiveTokensLayout(props: ReceiveTokensLayoutProps) {
  const {
    address,
    accountName,
    onClose,
    onCopyAddressToClipboard,
    onVerifyAddress,
    title,
    warning,
  } = props;

  return (
    <Sheet
      header={
        <SheetHeader
          variant="large"
          title={
            <>
              Receive <br /> {title}
            </>
          }
          onClose={onClose}
        />
      }
      isShowing
      onClose={onClose}
      footer={
        onVerifyAddress ? (
          <ButtonRow flexDirection="row">
            <Button
              data-testid={HomePageSelectors.ReceiveSheetVerifyAddressBtn}
              flexGrow={1}
              iconStart={ShieldIcon}
              onClick={onVerifyAddress}
              variant="outline"
            >
              Verify
            </Button>
            <Button flexGrow={1} onClick={() => onCopyAddressToClipboard(address)}>
              Copy address
            </Button>
          </ButtonRow>
        ) : (
          <Button fullWidth onClick={() => onCopyAddressToClipboard(address)}>
            Copy address
          </Button>
        )
      }
    >
      {warning && warning}
      <Flex
        alignItems="center"
        flexDirection="column"
        pb={['space.05', 'space.08']}
        px="space.05"
        style={{ marginBottom: token('sizes.footerHeight') }}
      >
        <Box mt="space.06" mx="auto">
          <Flex alignItems="center" justifyContent="center" mx="auto" position="relative">
            <QRCode
              bgColor={token('colors.ink.background-primary')}
              fgColor={token('colors.ink.text-primary')}
              size={132}
              style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
              value={address}
              viewBox="0 0 132 132"
            />
          </Flex>
        </Box>
        <Flex alignItems="center" flexDirection="column">
          {accountName && (
            <styled.span mt="space.05" textStyle="label.01">
              {accountName}
            </styled.span>
          )}
          <AddressDisplayer
            data-testid={SharedComponentsSelectors.AddressDisplayer}
            address={address}
            justifyContent="center"
            maxWidth="300px"
            mt="space.04"
          />
        </Flex>
      </Flex>
    </Sheet>
  );
}
