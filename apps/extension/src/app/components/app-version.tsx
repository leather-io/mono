import { css } from 'leather-styles/css';
import { styled } from 'leather-styles/jsx';

import { BRANCH_NAME, COMMIT_SHA } from '@shared/environment';

import { openInNewTab } from '@app/common/utils/open-in-new-tab';
import { useIsLatestPullRequestBuild } from '@app/query/common/outdated-pr/outdated-pr.query';
import { BasicTooltip } from '@app/ui/components/tooltip/basic-tooltip';

interface AppVersionLabelProps {
  isLatestVersion: boolean;
  children: string;
}
function AppVersionLabel({ isLatestVersion, children }: AppVersionLabelProps) {
  return (
    <styled.p
      textStyle="caption.01"
      color="ink.text-subdued"
      textDecorationLine={isLatestVersion ? 'none' : 'line-through'}
    >
      {children}
    </styled.p>
  );
}

function useAppVersion() {
  const { pullRequestLink, isLatestBuild } = useIsLatestPullRequestBuild();

  function getVersion() {
    switch (process.env.WALLET_ENVIRONMENT) {
      case 'development':
        return BRANCH_NAME;
      case 'feature':
        return `${BRANCH_NAME}#${COMMIT_SHA?.slice(0, 8)}`;
      default:
        return `v${VERSION}`;
    }
  }

  return {
    version: getVersion(),
    shouldUpdatePRBuild: !isLatestBuild && process.env.WALLET_ENVIRONMENT === 'feature',
    openPullRequestLink() {
      openInNewTab(pullRequestLink ?? '');
    },
  };
}

export function AppVersion() {
  const { version, shouldUpdatePRBuild, openPullRequestLink } = useAppVersion();

  if (shouldUpdatePRBuild) {
    return (
      <BasicTooltip
        className={css({ width: 'fit-content' })}
        side="right"
        label="Outdated PR build, download the latest version"
        onClick={openPullRequestLink}
      >
        <AppVersionLabel isLatestVersion={false}>{version}</AppVersionLabel>
      </BasicTooltip>
    );
  }

  return <AppVersionLabel isLatestVersion>{version}</AppVersionLabel>;
}
