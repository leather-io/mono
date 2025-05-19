import { Error } from '@/components/error/error';
import { t } from '@lingui/macro';

export default function NotFound() {
  const error = {
    message: t({ id: 'error_boundary.title', message: 'Something went wrong' }),
    name: '',
  };

  return <Error error={error} />;
}
