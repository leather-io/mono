import { HIRO_EXPLORER_URL } from '@leather.io/constants';
import {
  GetMempoolExplorerLinkArgs,
  MakeActivityArgs,
  getMempoolExplorerLink as getMempoolExplorerLinkUtil,
  makeActivityLink as makeActivityLinkUtil,
} from '@leather.io/models';
import { assertExistence } from '@leather.io/utils';

export function makeActivityLink(args: Omit<MakeActivityArgs, 'explorerUrl'>) {
  return makeActivityLinkUtil({ ...args, explorerUrl: HIRO_EXPLORER_URL });
}
export function getMempoolExplorerLink(args: GetMempoolExplorerLinkArgs) {
  const explorerLink = getMempoolExplorerLinkUtil(args);
  if (explorerLink === null)
    assertExistence(explorerLink, 'Unable to create mempool explorer link');
  return explorerLink;
}
