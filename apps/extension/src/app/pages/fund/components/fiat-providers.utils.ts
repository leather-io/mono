import BinanceIcon from '@assets/images/fund/fiat-providers/binance-icon.png';
import BlockchainComIcon from '@assets/images/fund/fiat-providers/blockchain.com-icon.png';
import ByBitIcon from '@assets/images/fund/fiat-providers/bybit-icon.png';
import CoinbaseIcon from '@assets/images/fund/fiat-providers/coinbase-icon.png';
import CryptoComIcon from '@assets/images/fund/fiat-providers/crypto.com-icon.png';
import GateIoIcon from '@assets/images/fund/fiat-providers/gate.io-icon.png';
import KuCoinIcon from '@assets/images/fund/fiat-providers/kucoin-icon.png';
import MoonPayIcon from '@assets/images/fund/fiat-providers/moonpay-icon.png';
import OkxIcon from '@assets/images/fund/fiat-providers/okx-icon.png';
import TransakIcon from '@assets/images/fund/fiat-providers/transak-icon.png';
import { type ActiveFiatProvider } from '@leather.io/query';

// Keys are set in wallet-config.json
enum ActiveFiatProviders {
  Binance = 'binance',
  BlockchainCom = 'blockchainCom',
  ByBit = 'byBit',
  Coinbase = 'coinbase',
  CryptoCom = 'cryptoCom',
  GateIo = 'gateIo',
  KuCoin = 'kuCoin',
  MoonPay = 'moonPay',
  Okx = 'okx',
  Transak = 'transak',
}

export const activeFiatProviderIcons: Record<ActiveFiatProvider['name'], string> = {
  [ActiveFiatProviders.Binance]: BinanceIcon,
  [ActiveFiatProviders.BlockchainCom]: BlockchainComIcon,
  [ActiveFiatProviders.ByBit]: ByBitIcon,
  [ActiveFiatProviders.Coinbase]: CoinbaseIcon,
  [ActiveFiatProviders.CryptoCom]: CryptoComIcon,
  [ActiveFiatProviders.GateIo]: GateIoIcon,
  [ActiveFiatProviders.KuCoin]: KuCoinIcon,
  [ActiveFiatProviders.MoonPay]: MoonPayIcon,
  [ActiveFiatProviders.Okx]: OkxIcon,
  [ActiveFiatProviders.Transak]: TransakIcon,
};

function makeFiatProviderFaqUrl(address: string, provider: string) {
  // TODO: Add FAQ for BTC
  return `https://hiro.so/wallet-faq/how-do-i-buy-stx-from-an-exchange?provider=${provider}&address=${address}`;
}

interface GetProviderNameArgs {
  address: string;
  hasFastCheckoutProcess: boolean;
  name: string;
}

export function getProviderUrl({
  address,
  hasFastCheckoutProcess,
  name,
}: GetProviderNameArgs) {
  if (!hasFastCheckoutProcess) {
    return makeFiatProviderFaqUrl(address, name);
  }
  // Direct integration URLs for specific providers have been removed.
  // For now, always fall back to the FAQ link.
  return makeFiatProviderFaqUrl(address, name);
}
