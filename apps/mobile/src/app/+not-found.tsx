import { Error } from '@/components/error';
import { t } from '@lingui/macro';

const error = {
  message: t({ id: 'error_boundary.title', message: 'Something went wrong' }),
  name: 'RouteNotFound',
};
export default function NotFound() {
  return <Error error={error} />;
}
