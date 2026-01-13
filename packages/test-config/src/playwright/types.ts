export interface MockHandler<T = unknown> {
  path: string | RegExp;
  method: 'get' | 'post' | 'put' | 'delete';
  resp: T;
  status?: number;
  delay?: number;
}
