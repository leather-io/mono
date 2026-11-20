import multisig.ProposalPreimage
import DerivationPathUtils
import Keychain
import WalletAccountCount

/-!
Differential-test oracle. Reads one call per line on stdin, as a function name
followed by space-separated arguments, and prints what the model says the
TypeScript function of that name does:

    ok <value>     it returns this value
    undefined      it returns `undefined`
    throws         it throws
    unsupported    the input is outside the model's domain

Strings travel as comma-separated hex code points, numbers as decimals, bytes
as hex. A line the oracle cannot read prints `error malformed input`. This file
is unverified glue around the models.
-/

open Js

def hexDigitValue (c : Char) : Option Nat :=
  if '0' ≤ c ∧ c ≤ '9' then some (c.toNat - '0'.toNat)
  else if 'a' ≤ c ∧ c ≤ 'f' then some (c.toNat - 'a'.toNat + 10)
  else none

def parseHexNat (s : String) : Option Nat :=
  if s.isEmpty then none
  else s.toList.foldlM (fun acc c => (hexDigitValue c).map (acc * 16 + ·)) 0

def parseText (s : String) : Option Str :=
  if s.isEmpty then some []
  else do
    let codePoints ← (s.splitOn ",").mapM parseHexNat
    codePoints.mapM fun n => if n.isValidChar then some (Char.ofNat n) else none

def parseHexBytes : List Char → Option (List UInt8)
  | [] => some []
  | high :: low :: rest => do
    let h ← hexDigitValue high
    let l ← hexDigitValue low
    let tail ← parseHexBytes rest
    pure (UInt8.ofNat (h * 16 + l) :: tail)
  | [_] => none

def parseIndexInput (s : String) : Option WalletAccountCount.IndexInput :=
  if s = "other" then some .other else s.toNat?.map .valid

def parseKeychains : List String → Option (List WalletAccountCount.KeychainEntry)
  | [] => some []
  | descriptor :: chain :: rest => do
    let entry : WalletAccountCount.KeychainEntry :=
      { descriptor := ← parseText descriptor, chain := ← parseText chain }
    let entries ← parseKeychains rest
    pure (entry :: entries)
  | [_] => none

def hexDigit (n : Nat) : Char :=
  if n < 10 then Char.ofNat ('0'.toNat + n) else Char.ofNat ('a'.toNat + n - 10)

def renderBytes (bytes : ProposalPreimage.Bytes) : String :=
  String.ofList (bytes.flatMap fun b => [hexDigit (b.toNat / 16), hexDigit (b.toNat % 16)])

def renderText (s : Str) : String :=
  ",".intercalate (s.map fun c => String.ofList (Nat.toDigits 16 c.toNat))

def renderOutcome {α : Type} (render : α → String) : Outcome α → String
  | .ok value => s!"ok {render value}"
  | .throws => "throws"
  | .unsupported => "unsupported"

def textResult (outcome : Outcome Str) : Option String :=
  some (renderOutcome renderText outcome)

def natResult (outcome : Outcome Nat) : Option String :=
  some (renderOutcome toString outcome)

def boolResult (outcome : Outcome Bool) : Option String :=
  some (renderOutcome toString outcome)

def call (name : String) (args : List String) : Option String :=
  match name, args with
  | "encodeProposalPreimage", [tag, address, payload, timestamp] => do
    let proposal : ProposalPreimage.Proposal :=
      { domainTag := String.ofList (← parseText tag),
        multisigAddress := String.ofList (← parseText address),
        rawPayload := ⟨(← parseHexBytes payload.toList).toArray⟩,
        proposalTimestamp := ← timestamp.toNat? }
    match ProposalPreimage.encode? proposal with
    | some preimage => pure s!"ok {renderBytes preimage}"
    | none => pure "unsupported"
  | "extractPurposeFromPath", [path] => do
    natResult (DerivationPathUtils.extractPurposeFromPath (← parseText path))
  | "extractAccountIndexFromPath", [path] => do
    natResult (DerivationPathUtils.extractAccountIndexFromPath (← parseText path))
  | "extractChangeIndexFromPath", [path] => do
    natResult (DerivationPathUtils.extractChangeIndexFromPath (← parseText path))
  | "extractAddressIndexFromPath", [path] => do
    natResult (DerivationPathUtils.extractAddressIndexFromPath (← parseText path))
  | "appendAddressIndexToPath", [path, change, addressIndex] => do
    textResult (DerivationPathUtils.appendAddressIndexToPath (← parseText path) (← change.toNat?)
      (← addressIndex.toNat?))
  | "extractFingerprintFromKeyOriginPath", [keyOriginPath] => do
    textResult (DerivationPathUtils.extractFingerprintFromKeyOriginPath (← parseText keyOriginPath))
  | "createKeyOriginPath", [fingerprint, path] => do
    textResult (DerivationPathUtils.createKeyOriginPath (← parseText fingerprint) (← parseText path))
  | "validateKeyOriginPath", [keyOriginPath] => do
    boolResult (DerivationPathUtils.validateKeyOriginPath (← parseText keyOriginPath))
  | "createDescriptor", [keyOriginPath, key] => do
    textResult (DerivationPathUtils.createDescriptor (← parseText keyOriginPath) (← parseText key))
  | "extractKeyOriginPathFromDescriptor", [descriptor] => do
    textResult (DerivationPathUtils.extractKeyOriginPathFromDescriptor (← parseText descriptor))
  | "extractDerivationPathFromDescriptor", [descriptor] => do
    textResult (DerivationPathUtils.extractDerivationPathFromDescriptor (← parseText descriptor))
  | "extractFingerprintFromDescriptor", [descriptor] => do
    textResult (DerivationPathUtils.extractFingerprintFromDescriptor (← parseText descriptor))
  | "extractAccountIndexFromDescriptor", [descriptor] => do
    natResult (DerivationPathUtils.extractAccountIndexFromDescriptor (← parseText descriptor))
  | "extractKeyFromDescriptor", [descriptor] => do
    match DerivationPathUtils.extractKeyFromDescriptor (← parseText descriptor) with
    | some key => pure s!"ok {renderText key}"
    | none => pure "undefined"
  | "extractAccountPathFromFullPath", [path] => do
    textResult (.ok (DerivationPathUtils.extractAccountPathFromFullPath (← parseText path)))
  | "keyOriginToDerivationPath", [keyOrigin] => do
    textResult (.ok (DerivationPathUtils.keyOriginToDerivationPath (← parseText keyOrigin)))
  | "fingerprintAsNumberToHex", [fingerprint] => do
    textResult (.ok (Keychain.fingerprintAsNumberToHex (← fingerprint.toNat?)))
  | "safelyReadPaddedFingerprint", [fingerprintHex] => do
    textResult (.ok (Keychain.safelyReadPaddedFingerprint (← parseText fingerprintHex)))
  | "unpadHex", [value] => do
    textResult (Keychain.unpadHex (← parseText value))
  | "makeAccountIdentifer", [fingerprint, accountIndex] => do
    textResult (.ok (Keychain.makeAccountIdentifer (← parseText fingerprint) (← accountIndex.toNat?)))
  | "isValidAccountIndex", [index] => do
    boolResult (.ok (WalletAccountCount.isValidAccountIndex (← parseIndexInput index)))
  | "softwareAccountCountFromHighestIndex", [index] => do
    natResult (.ok (WalletAccountCount.softwareAccountCountFromHighestIndex (← parseIndexInput index)))
  | "countWalletAccounts", walletType :: fingerprint :: highestAccountIndex :: keychains => do
    natResult (WalletAccountCount.countWalletAccounts (← parseText walletType)
      (← parseText fingerprint) (← parseIndexInput highestAccountIndex) (← parseKeychains keychains))
  | _, _ => none

def respond (line : String) : String :=
  match line.splitOn " " with
  | name :: args => (call name args).getD "error malformed input"
  | [] => "error malformed input"

partial def loop (stdin stdout : IO.FS.Stream) : IO Unit := do
  let line ← stdin.getLine
  if line.isEmpty then return
  stdout.putStrLn (respond ((line.splitOn "\n").headD ""))
  loop stdin stdout

def main : IO Unit := do
  loop (← IO.getStdin) (← IO.getStdout)
