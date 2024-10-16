export function getChainName(chain: string) {
  if (chain === 'Stacks blockchain' || chain === 'Bitcoin blockchain') return '';
  return chain;
}
