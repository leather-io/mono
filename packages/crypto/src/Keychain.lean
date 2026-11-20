import proofs.JsString

/-!
Executable model of the pure helpers in `keychain.ts`, next to this file.
Numbers are non-negative safe integers. The key derivation and mnemonic
functions in that file wrap `@scure/bip32` and `@scure/bip39` and are not
modelled.
-/

namespace Keychain

open Js

/-- `fingerprint.toString(16).padStart(8, '0')`. -/
def fingerprintAsNumberToHex (fingerprint : Nat) : Str :=
  padStartZero 8 (hex fingerprint)

def safelyReadPaddedFingerprint (fingerprintHex : Str) : Str :=
  if unitLength fingerprintHex < 8 then padStartZero 8 fingerprintHex else fingerprintHex

/-- `BigInt('0x' + hex).toString(16)`, for hex digits only. -/
def unpadHex (value : Str) : Outcome Str :=
  match value with
  | [] => .throws
  | _ => if value.all isHexChar then .ok (hex (parseHex value)) else .unsupported

/-- `[fingerprint, accountIndex].join('/')`. -/
def makeAccountIdentifer (fingerprint : Str) (accountIndex : Nat) : Str :=
  fingerprint ++ '/' :: decimal accountIndex

end Keychain
