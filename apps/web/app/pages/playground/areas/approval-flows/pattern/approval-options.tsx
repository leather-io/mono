import { type ReactNode, createContext, useContext, useState } from 'react';

export type ApprovalTitleStyle = 'proposed' | 'large' | 'marche' | 'current';
export type ApprovalNetworkLabel = 'always' | 'non-mainnet';
export type ApprovalAccountPlacement = 'body' | 'footer' | 'header';
export type ApprovalLaunch = 'off' | 'mark' | 'draw' | 'handshake';
export type ApprovalHeaderSurface = 'divider' | 'plain' | 'card';
export type ApprovalHeaderRadius = 'sm' | 'md' | 'lg' | 'xl';
export type ApprovalFooterEdge = 'line' | 'gradient' | 'fade';
export type ApprovalContainers = 'groups' | 'interactive';

interface ApprovalOptions {
  titleStyle: ApprovalTitleStyle;
  networkLabel: ApprovalNetworkLabel;
  accountPlacement: ApprovalAccountPlacement;
  launch: ApprovalLaunch;
  headerSurface: ApprovalHeaderSurface;
  headerRadius: ApprovalHeaderRadius;
  footerEdge: ApprovalFooterEdge;
  containers: ApprovalContainers;
  isConnect: boolean;
  isSolo: boolean;
  isDetailsOpen: boolean;
  setDetailsOpen(isOpen: boolean): void;
}

const detailsOpenStorageKey = 'leather.approval.details-open';

function readDetailsOpen() {
  try {
    return window.localStorage.getItem(detailsOpenStorageKey) === 'true';
  } catch {
    return false;
  }
}

function writeDetailsOpen(isOpen: boolean) {
  try {
    window.localStorage.setItem(detailsOpenStorageKey, String(isOpen));
  } catch {
    return undefined;
  }
  return undefined;
}

const defaultApprovalOptions: ApprovalOptions = {
  titleStyle: 'current',
  networkLabel: 'always',
  accountPlacement: 'body',
  launch: 'off',
  headerSurface: 'divider',
  headerRadius: 'md',
  footerEdge: 'gradient',
  containers: 'groups',
  isConnect: false,
  isSolo: false,
  isDetailsOpen: false,
  setDetailsOpen() {
    return undefined;
  },
};

const ApprovalOptionsContext = createContext<ApprovalOptions>(defaultApprovalOptions);

interface ApprovalOptionsProviderProps {
  titleStyle: ApprovalTitleStyle;
  networkLabel: ApprovalNetworkLabel;
  accountPlacement?: ApprovalAccountPlacement;
  launch?: ApprovalLaunch;
  headerSurface?: ApprovalHeaderSurface;
  headerRadius?: ApprovalHeaderRadius;
  footerEdge?: ApprovalFooterEdge;
  containers?: ApprovalContainers;
  isConnect?: boolean;
  isSolo?: boolean;
  children: ReactNode;
}

export function ApprovalOptionsProvider({
  titleStyle,
  networkLabel,
  accountPlacement = 'body',
  launch = 'off',
  headerSurface = 'divider',
  headerRadius = 'md',
  footerEdge = 'gradient',
  containers = 'groups',
  isConnect = false,
  isSolo = false,
  children,
}: ApprovalOptionsProviderProps) {
  const [isDetailsOpen, setDetailsOpenState] = useState(readDetailsOpen);
  return (
    <ApprovalOptionsContext.Provider
      value={{
        titleStyle,
        networkLabel,
        accountPlacement,
        launch,
        headerSurface,
        headerRadius,
        footerEdge,
        containers,
        isConnect,
        isSolo,
        isDetailsOpen,
        setDetailsOpen(isOpen) {
          setDetailsOpenState(isOpen);
          writeDetailsOpen(isOpen);
        },
      }}
    >
      {children}
    </ApprovalOptionsContext.Provider>
  );
}

export function useApprovalOptions() {
  return useContext(ApprovalOptionsContext);
}

interface ApprovalOptionsOverrideProps {
  accountPlacement: ApprovalAccountPlacement;
  launch: ApprovalLaunch;
  children: ReactNode;
}

export function ApprovalOptionsOverride({
  accountPlacement,
  launch,
  children,
}: ApprovalOptionsOverrideProps) {
  const options = useApprovalOptions();
  return (
    <ApprovalOptionsContext.Provider value={{ ...options, accountPlacement, launch }}>
      {children}
    </ApprovalOptionsContext.Provider>
  );
}
