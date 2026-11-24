import { copyToClipboard } from '@app/common/utils/copy-to-clipboard';
import { useToast } from '@app/features/toasts/use-toast';

export function useCopyAddress() {
  const toast = useToast();
  return (address: string) => {
    void copyToClipboard(address);
    toast.success('Address copied to clipboard');
  };
}
