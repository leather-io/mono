import ProposalPreimage.Model

/-!
Differential-test oracle. Reads one proposal per line on stdin:

    <tag code points> <address code points> <payload hex> <timestamp decimal>

Code points are comma-separated hex. Prints the model's preimage as hex, or a
line starting with `error` when the line is malformed or outside the model's
preconditions. This file is unverified glue around `ProposalPreimage.encode?`.
-/

open ProposalPreimage

def hexDigitValue (c : Char) : Option Nat :=
  if '0' ≤ c ∧ c ≤ '9' then some (c.toNat - '0'.toNat)
  else if 'a' ≤ c ∧ c ≤ 'f' then some (c.toNat - 'a'.toNat + 10)
  else none

def parseHexNat (s : String) : Option Nat :=
  if s.isEmpty then none
  else s.toList.foldlM (fun acc c => (hexDigitValue c).map (acc * 16 + ·)) 0

def parseText (s : String) : Option String :=
  if s.isEmpty then some ""
  else do
    let codePoints ← (s.splitOn ",").mapM parseHexNat
    let chars ← codePoints.mapM fun n => if n.isValidChar then some (Char.ofNat n) else none
    pure (String.ofList chars)

def parseHexBytes : List Char → Option (List UInt8)
  | [] => some []
  | high :: low :: rest => do
    let h ← hexDigitValue high
    let l ← hexDigitValue low
    let tail ← parseHexBytes rest
    pure (UInt8.ofNat (h * 16 + l) :: tail)
  | [_] => none

def parseProposal (line : String) : Option Proposal :=
  match line.splitOn " " with
  | [tag, address, payload, timestamp] => do
    let domainTag ← parseText tag
    let multisigAddress ← parseText address
    let payloadBytes ← parseHexBytes payload.toList
    let proposalTimestamp ← timestamp.toNat?
    pure { domainTag, multisigAddress, rawPayload := ⟨payloadBytes.toArray⟩, proposalTimestamp }
  | _ => none

def hexDigit (n : Nat) : Char :=
  if n < 10 then Char.ofNat ('0'.toNat + n) else Char.ofNat ('a'.toNat + n - 10)

def toHex (bytes : Bytes) : String :=
  String.ofList (bytes.flatMap fun b => [hexDigit (b.toNat / 16), hexDigit (b.toNat % 16)])

def respond (line : String) : String :=
  match parseProposal line with
  | none => "error malformed input"
  | some proposal =>
    match encode? proposal with
    | none => "error outside model preconditions"
    | some preimage => toHex preimage

partial def loop (stdin stdout : IO.FS.Stream) : IO Unit := do
  let line ← stdin.getLine
  if line.isEmpty then return
  stdout.putStrLn (respond ((line.splitOn "\n").headD ""))
  loop stdin stdout

def main : IO Unit := do
  loop (← IO.getStdin) (← IO.getStdout)
