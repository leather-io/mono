import { useEffect } from 'react';
import { MetaDescriptor, useNavigate } from 'react-router';

export function meta() {
  return [{ httpEquiv: 'refresh', content: '0;url=/staking' }] satisfies MetaDescriptor[];
}

export default function IndexRoute() {
  const navigate = useNavigate();

  useEffect(() => {
    void navigate('/staking', { replace: true });
  }, [navigate]);

  return null;
}
