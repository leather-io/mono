import { Link, useNavigate } from 'react-router';

import { useLeatherConnect } from '~/store/addresses';

import { AdvancedTool as Tool } from './advanced-tool';

interface AdvancedToolItemWithAuthProps {
  name: string;
  description: string;
  to: string;
}
export function AdvancedToolItemWithAuth({ name, description, to }: AdvancedToolItemWithAuthProps) {
  const { whenExtensionState, setShowInstallLeatherDialog, connect } = useLeatherConnect();
  const navigate = useNavigate();

  return whenExtensionState({
    connected: (
      <Link to={to}>
        <Tool.Item name={name} description={description} />
      </Link>
    ),
    missing: (
      <Tool.Item
        name={name}
        description={description}
        onClick={() => setShowInstallLeatherDialog(true)}
      />
    ),
    detected: (
      <Tool.Item
        name={name}
        description={description}
        onClick={async () => {
          await connect();
          setTimeout(() => navigate(to), 100);
        }}
      />
    ),
  });
}
