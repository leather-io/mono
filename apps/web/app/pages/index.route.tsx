import { useEffect } from 'react';
import { MetaDescriptor, useNavigate } from 'react-router';

export function meta() {
  return [{ httpEquiv: 'refresh', content: '0;url=/stacking' }] satisfies MetaDescriptor[];
}

export default function IndexRoute() {
  const navigate = useNavigate();

  useEffect(() => {
    void navigate('/stacking', { replace: true });
  }, [navigate]);

  return null;
}
