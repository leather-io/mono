import { redirect } from 'react-router';

import { leatherDocsDiscontinuedUrl } from './leather-docs-guides';

function prefixRedirectLoader(request: Request, from: string, to: string) {
  const url = new URL(request.url);
  const newPath = url.pathname.replace(from, to);
  const redirectUrl = `${url.origin}${newPath}${url.search}${url.hash}`;

  return redirect(redirectUrl, 301);
}

export function stackingRedirectLoader(request: Request) {
  return prefixRedirectLoader(request, '/stacking', '/staking');
}

const runesContentSlugs = [
  'leather-runes-wallet',
  'bitcoin-runes',
  'ordinals-vs-runes',
  'see-your-runes-in-usd-with-leather',
  'bitcoin-runes-have-come-to-leather-unpacking-the-runes-protocol',
  'april-partnership-roundup-more-runes-and-more-bitcoin-defi',
  'august-partnerships-roundup-do-more-with-your-bitcoin-runes-and-tokens',
];

const stampsContentSlugs = [
  'leather-stamps-src20-wallet',
  'bitcoin-stamps-src20',
  'receive-stamps',
  'receive-src20',
  'may-partnerships-roundup-new-sources-for-ordinals-stamps-and-more',
];

const ordinalsContentSlugs = [
  'send-ordinals',
  'receive-ordinals',
  'create-ordinals-gamma',
  'migrating-ordinals-sparrow-leather',
  'what-are-bitcoin-ordinals',
  'what-are-bitcoin-ordinals-wallets',
  'ordinals-vs-nft',
  'what-are-recursive-inscriptions',
  'parent-child-inscriptions',
  'what-are-digital-artifacts-bitcoin',
  'bitcoin-nfts',
  'native-segwit-inscriptions-support-goes-live-on-leather',
  'how-do-i-unprotect-bitcoin-utxo-s-with-inscriptions-so-it-becomes-available',
  'what-are-brc20-tokens',
  'what-is-the-brc-20-token-standard',
  'buy-brc20',
  'receive-brc20',
  'send-brc-20-tokens',
  'mint-brc20-magic-eden',
  'leather-ordinalsbot',
  'leather-magic-eden',
  'leather-unisat',
  'leather-luminex',
  'deprecation-of-ordinals-inscriptions-support-in-leather',
  'watch-your-recursive-inscriptions-come-to-life-in-leather',
  'break-out-your-ledger-device-to-securely-manage-bitcoin-and-ordinals-transactions',
  'what-are-rare-sats',
  'what-are-audionals',
  'node-monkes',
  'ordinal-fusion',
  'the-royals',
  'guide-to-bitcoin-ordinal-collections-quantum-cats',
  'guide-to-ordinal-collections-what-are-runestones',
  'guide-to-ordinal-collections-what-are-taproot-wizards',
  'guide-to-bitcoin-ordinals-collections-what-is-birds-of-a-feather',
  'guide-to-bitcoin-ordinals-collections-what-is-bitcoin-boos',
  'guide-to-bitcoin-ordinals-collections-what-is-bitcoin-burials',
  'guide-to-bitcoin-ordinals-collections-what-is-bitcoin-frogs',
  'guide-to-bitcoin-ordinals-collections-what-is-blob',
  'guide-to-bitcoin-ordinals-collections-what-is-frucks',
  'guide-to-bitcoin-ordinals-collections-what-is-honey-badgers',
  'guide-to-bitcoin-ordinals-collections-what-is-n0-ordinary-kind',
  'guide-to-bitcoin-ordinals-collections-what-is-nodemonkes',
  'guide-to-bitcoin-ordinals-collections-what-is-ocm-dimensions',
  'guide-to-bitcoin-ordinals-collections-what-is-ordinal-maxi-biz',
  'guide-to-bitcoin-ordinals-collections-what-is-pizza-ninjas',
  'guide-to-bitcoin-ordinals-collections-what-is-prometheans',
];

const deprecatedContentRedirects = new Map<string, string>([
  ...runesContentSlugs.map((slug): [string, string] => [slug, leatherDocsDiscontinuedUrl('runes')]),
  ...stampsContentSlugs.map((slug): [string, string] => [
    slug,
    leatherDocsDiscontinuedUrl('stamps'),
  ]),
  ...ordinalsContentSlugs.map((slug): [string, string] => [
    slug,
    leatherDocsDiscontinuedUrl('ordinals'),
  ]),
]);

export function isDeprecatedContentSlug(slug: string) {
  return deprecatedContentRedirects.has(slug);
}

export function getDeprecationTarget(slug: string) {
  return deprecatedContentRedirects.get(slug) ?? null;
}
