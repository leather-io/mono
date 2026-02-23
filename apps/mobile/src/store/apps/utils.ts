interface BaseApp {
  origin: string;
  screenshot: string | null;
  name: string;
}

interface ConnectedApp extends BaseApp {
  status: 'connected';
  accountId: string;
}

interface RecentlyVisitedApp extends BaseApp {
  status: 'recently_visited';
}

export type AppStatus = App['status'];

export type App = ConnectedApp | RecentlyVisitedApp;

export function assertAppIsConnected(app: App): asserts app is ConnectedApp {
  if (app.status !== 'connected') throw new Error('App is not connected');
}
