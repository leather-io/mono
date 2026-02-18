import {
  Outlet,
  Navigate as TanstackNavigate,
  useLocation as useTanstackLocation,
  useNavigate as useTanstackNavigate,
  useParams as useTanstackParams,
} from '@tanstack/react-router';

export { Outlet };

interface NavigateProps {
  to: string;
  replace?: boolean;
}

export function Navigate({ to, replace }: NavigateProps) {
  const NavigateAny = TanstackNavigate as React.ComponentType<NavigateProps>;
  return <NavigateAny to={to} replace={replace} />;
}

export function useNavigate() {
  const nav = useTanstackNavigate();
  return (to: string | number, options?: { replace?: boolean }): void => {
    if (typeof to === 'number') {
      window.history.go(to);
      return;
    }
    void nav({ to, replace: options?.replace });
  };
}

export function useLocation() {
  return useTanstackLocation();
}

export function useParams(): Record<string, string | undefined> {
  return useTanstackParams({ strict: false });
}

export function useMatch(pattern: string) {
  const { pathname } = useTanstackLocation();
  const base = pattern.replace(/\/:[^/]+/g, '');
  return pathname.startsWith(base) ? {} : null;
}
