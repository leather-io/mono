import { requireNativeModule } from 'expo-modules-core';

import { Argon2Mode } from './Argon2Module.types';
import type { Argon2ModuleType } from './Argon2Module.types';

const Argon2Module = requireNativeModule<Argon2ModuleType>('Argon2Module');

const DEFAULTS = {
  MODE: Argon2Mode.ARGON2_ID,
  ITERATIONS: 11,
  MEMORY: 32 * 1024,
  PARALLELISM: 2,
  HASH_LENGTH: 32,
};

// TODO: add checks for integers?

function hash({
  password,
  salt,
  mode = DEFAULTS.MODE,
  iterations = DEFAULTS.ITERATIONS,
  memory = DEFAULTS.MEMORY,
  parallelism = DEFAULTS.PARALLELISM,
  hashLength = DEFAULTS.HASH_LENGTH,
}: {
  password: string;
  salt: string;
  mode?: Argon2Mode;
  iterations?: number;
  memory?: number;
  parallelism?: number;
  hashLength?: number;
}) {
  return Argon2Module.hash(password, salt, mode, iterations, memory, parallelism, hashLength);
}

function verify({
  password,
  hash,
  mode = DEFAULTS.MODE,
}: {
  password: string;
  hash: string;
  mode?: Argon2Mode;
}) {
  return Argon2Module.verify(hash, password, mode);
}

export const Argon2 = {
  hash,
  verify,
};
