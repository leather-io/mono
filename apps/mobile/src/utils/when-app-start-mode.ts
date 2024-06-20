const appStartModes = ['prelaunch', 'live'] as const;

export type AppStartMode = (typeof appStartModes)[number];

type AppStartModeMap<T = any> = Record<AppStartMode, T>;

export function whenAppStartMode<K extends AppStartMode>(mode: K) {
  if (!appStartModes.includes(mode))
    throw new Error('App start mode must be one of: ' + appStartModes.join(', '));

  return <M extends AppStartModeMap>(appStartModeMap: M): M[K] => appStartModeMap[mode];
}
