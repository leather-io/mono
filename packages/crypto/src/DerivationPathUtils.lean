import proofs.JsString

/-!
Executable model of `derivation-path-utils.ts`, next to this file.

`parseInt` is modelled only where its result is certain: an all-digit string up
to `Number.MAX_SAFE_INTEGER` parses to that number, and an empty string or one
starting with a visible ASCII character other than a digit or a sign is `NaN`.
Everything else is `unsupported`.
-/

namespace DerivationPathUtils

open Js

def segments (path : Str) : List Str :=
  path.splitOn '/'

def joinSegments (parts : List Str) : Str :=
  ['/'].intercalate parts

def startsNaN (c : Char) : Bool :=
  33 ≤ c.toNat && c.toNat ≤ 126 && !c.isDigit && c != '+' && c != '-'

/-- `parseInt(text, 10)` followed by the `isNaN` check. -/
def parseIntOrThrow (text : Str) : Outcome Nat :=
  if isDecimalString text then
    if parseDecimal text ≤ maxSafeInteger then .ok (parseDecimal text) else .unsupported
  else
    match text with
    | [] => .throws
    | c :: _ => if startsNaN c then .throws else .unsupported

/-- `extractSectionFromDerivationPath`, by segment position. -/
def extractSection (depth : Nat) (path : Str) : Outcome Nat :=
  match (segments path)[depth]? with
  | none => .throws
  | some [] => .throws
  | some segment => parseIntOrThrow (segment.filter (· != '\''))

def extractPurposeFromPath : Str → Outcome Nat := extractSection 1

def extractAccountIndexFromPath : Str → Outcome Nat := extractSection 3

def extractChangeIndexFromPath : Str → Outcome Nat := extractSection 4

def extractAddressIndexFromPath : Str → Outcome Nat := extractSection 5

def appendAddressIndexToPath (path : Str) (change addressIndex : Nat) : Outcome Str :=
  if change ≤ maxSafeInteger ∧ addressIndex ≤ maxSafeInteger then do
    let _ ← extractAccountIndexFromPath path
    pure (path ++ '/' :: (decimal change ++ '/' :: decimal addressIndex))
  else .unsupported

def extractFingerprintFromKeyOriginPath (keyOriginPath : Str) : Outcome Str :=
  let fingerprint := (segments keyOriginPath).headD []
  if isHexString fingerprint then .ok fingerprint else .throws

def createKeyOriginPath (fingerprint path : Str) : Outcome Str :=
  if isHexString fingerprint then .ok (fingerprint ++ '/' :: removeFirstPair 'm' '/' path)
  else .throws

def validateKeyOriginPath (keyOriginPath : Str) : Outcome Bool :=
  if keyOriginPath.contains '[' || keyOriginPath.contains ']' then .throws
  else if !keyOriginPath.contains '/' then .throws
  else do
    let _ ← extractFingerprintFromKeyOriginPath keyOriginPath
    if (segments keyOriginPath).length < 4 then .throws else pure true

def createDescriptor (keyOriginPath key : Str) : Outcome Str := do
  let _ ← validateKeyOriginPath keyOriginPath
  pure ('[' :: (keyOriginPath ++ ']' :: key))

def extractKeyOriginPathFromDescriptor (descriptor : Str) : Outcome Str := do
  let keyOriginPath := ((descriptor.splitOn ']').headD []).erase '['
  let _ ← validateKeyOriginPath keyOriginPath
  pure keyOriginPath

def keyOriginToDerivationPath (keyOrigin : Str) : Str :=
  'm' :: '/' :: joinSegments (segments keyOrigin).tail

def extractDerivationPathFromDescriptor (descriptor : Str) : Outcome Str := do
  let keyOriginPath ← extractKeyOriginPathFromDescriptor descriptor
  pure (keyOriginToDerivationPath keyOriginPath)

def extractFingerprintFromDescriptor (descriptor : Str) : Outcome Str := do
  let keyOriginPath ← extractKeyOriginPathFromDescriptor descriptor
  extractFingerprintFromKeyOriginPath keyOriginPath

def extractAccountIndexFromDescriptor (descriptor : Str) : Outcome Nat := do
  let keyOriginPath ← extractKeyOriginPathFromDescriptor descriptor
  extractAccountIndexFromPath keyOriginPath

/-- `descriptor.split(']')[1]`; `none` is JavaScript's `undefined`. -/
def extractKeyFromDescriptor (descriptor : Str) : Option Str :=
  (descriptor.splitOn ']')[1]?

def extractAccountPathFromFullPath (path : Str) : Str :=
  joinSegments ((segments path).take 4)

end DerivationPathUtils
