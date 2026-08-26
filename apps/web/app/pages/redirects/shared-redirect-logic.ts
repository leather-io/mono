import { redirect } from 'react-router';

function prefixRedirectLoader(request: Request, from: string, to: string) {
  const url = new URL(request.url);
  const newPath = url.pathname.replace(from, to);
  const redirectUrl = `${url.origin}${newPath}${url.search}${url.hash}`;

  return redirect(redirectUrl, 301);
}

export function helpCenterRedirectLoader(request: Request) {
  return prefixRedirectLoader(request, '/help-center', '/support');
}

export function stackingRedirectLoader(request: Request) {
  return prefixRedirectLoader(request, '/stacking', '/staking');
}

const runesDeprecationPostSlug = 'leather-runes-wallet';
const stampsDeprecationPostSlug = 'leather-stamps-src20-wallet';
const ordinalsDeprecationPostSlug = 'deprecation-of-ordinals-inscriptions-support-in-leather';

const runesContentSlugs = [
  'bitcoin-runes',
  'ordinals-vs-runes',
  'see-your-runes-in-usd-with-leather',
  'bitcoin-runes-have-come-to-leather-unpacking-the-runes-protocol',
  'april-partnership-roundup-more-runes-and-more-bitcoin-defi',
  'august-partnerships-roundup-do-more-with-your-bitcoin-runes-and-tokens',
];

const stampsContentSlugs = [
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
];

const deprecatedContentRedirects = new Map<string, string>([
  ...runesContentSlugs.map((slug): [string, string] => [slug, runesDeprecationPostSlug]),
  ...stampsContentSlugs.map((slug): [string, string] => [slug, stampsDeprecationPostSlug]),
  ...ordinalsContentSlugs.map((slug): [string, string] => [slug, ordinalsDeprecationPostSlug]),
]);

export const deprecationPostSlugs = [
  ordinalsDeprecationPostSlug,
  stampsDeprecationPostSlug,
  runesDeprecationPostSlug,
];

export function isDeprecatedContentSlug(slug: string) {
  return deprecatedContentRedirects.has(slug);
}

export function getDeprecationRedirect(slug: string) {
  const target = deprecatedContentRedirects.get(slug);
  if (!target) return null;
  return redirect(`/posts/${target}`, 301);
}
