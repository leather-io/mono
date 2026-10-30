import { type ReactNode, createContext, useContext, useState } from 'react';

export type ApprovalTitleStyle = 'proposed' | 'large' | 'marche' | 'current';
type ApprovalAccountPlacement = 'body' | 'header';
export type ApprovalHeaderSurface = 'divider' | 'plain' | 'card';
export type ApprovalHeaderRadius = 'sm' | 'md' | 'lg' | 'xl';
export type ApprovalContainers = 'groups' | 'interactive';

interface ApprovalOptions {
  titleStyle: ApprovalTitleStyle;
  accountPlacement: ApprovalAccountPlacement;
  hasLaunch: boolean;
  headerSurface: ApprovalHeaderSurface;
  headerRadius: ApprovalHeaderRadius;
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
  accountPlacement: 'header',
  hasLaunch: false,
  headerSurface: 'divider',
  headerRadius: 'md',
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
  hasLaunch?: boolean;
  headerSurface?: ApprovalHeaderSurface;
  headerRadius?: ApprovalHeaderRadius;
  containers?: ApprovalContainers;
  isConnect?: boolean;
  isSolo?: boolean;
  children: ReactNode;
}

export function ApprovalOptionsProvider({
  titleStyle,
  hasLaunch = false,
  headerSurface = 'divider',
  headerRadius = 'md',
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
        accountPlacement: 'header',
        hasLaunch,
        headerSurface,
        headerRadius,
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
  hasLaunch: boolean;
  children: ReactNode;
}

export function ApprovalOptionsOverride({
  accountPlacement,
  hasLaunch,
  children,
}: ApprovalOptionsOverrideProps) {
  const options = useApprovalOptions();
  return (
    <ApprovalOptionsContext.Provider value={{ ...options, accountPlacement, hasLaunch }}>
      {children}
    </ApprovalOptionsContext.Provider>
  );
}
