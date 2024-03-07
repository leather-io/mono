import { ProxyNativeModule } from 'expo-modules-core';

export enum Argon2Mode {
  ARGON2_D = 0,
  ARGON2_I = 1,
  ARGON2_ID = 2,
}

export interface Argon2ModuleType extends ProxyNativeModule {
  hash: (
    password: string,
    salt: string,
    mode: Argon2Mode,
    iterations: number,
    memory: number,
    parallelism: number,
    hashLength: number
  ) => Promise<string>;
  verify: (password: string, hash: string, mode: Argon2Mode) => Promise<boolean>;
}
