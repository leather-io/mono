import 'react-native';

interface Argon2ModuleInterface {
  hash(
    password: string,
    salt: string,
    mode: Argon2Mode,
    iterations: number,
    memory: number,
    parallelism: number,
    hashLength: number
  ): Promise<string>;
  verify(hashResult: string, password: string, modeInt: number): Promise<boolean>;
}

declare module 'react-native' {
  interface NativeModulesStatic {
    Argon2Module: Argon2ModuleInterface;
  }
}
