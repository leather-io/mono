/-!
Shared vocabulary for modelling the string-handling TypeScript in this package.

A JavaScript string is modelled as a list of Unicode characters. That matches
`split`, `join`, `includes`, `replace` and `startsWith` exactly for well-formed
strings; `unitLength` gives the UTF-16 length that `String.prototype.length`
and `padStart` use. Strings holding lone surrogates are outside the model.
-/

namespace Js

abbrev Str := List Char

/-- What a modelled TypeScript call does: return, throw, or leave the model's domain. -/
inductive Outcome (α : Type) where
  | ok (value : α)
  | throws
  | unsupported
  deriving DecidableEq, Repr

namespace Outcome

def bind {α β : Type} (outcome : Outcome α) (next : α → Outcome β) : Outcome β :=
  match outcome with
  | ok value => next value
  | throws => throws
  | unsupported => unsupported

instance : Monad Outcome where
  pure := ok
  bind := bind

@[simp] theorem ok_bind {α β : Type} (value : α) (next : α → Outcome β) :
    (ok value >>= next) = next value := rfl

@[simp] theorem throws_bind {α β : Type} (next : α → Outcome β) :
    ((throws : Outcome α) >>= next) = throws := rfl

@[simp] theorem unsupported_bind {α β : Type} (next : α → Outcome β) :
    ((unsupported : Outcome α) >>= next) = unsupported := rfl

@[simp] theorem pure_eq_ok {α : Type} (value : α) : (pure value : Outcome α) = ok value := rfl

theorem bind_eq_ok {α β : Type} {outcome : Outcome α} {next : α → Outcome β} {result : β}
    (h : (outcome >>= next) = ok result) : ∃ value, outcome = ok value ∧ next value = ok result := by
  cases outcome with
  | ok value => exact ⟨value, rfl, h⟩
  | throws => cases h
  | unsupported => cases h

end Outcome

/-- `String.prototype.length`: UTF-16 code units. -/
def unitLength : Str → Nat
  | [] => 0
  | c :: rest => (if c.toNat < 65536 then 1 else 2) + unitLength rest

/-- `value.padStart(width, '0')`. -/
def padStartZero (width : Nat) (s : Str) : Str :=
  List.replicate (width - unitLength s) '0' ++ s

def isHexChar (c : Char) : Bool :=
  (48 ≤ c.toNat && c.toNat ≤ 57) || (97 ≤ c.toNat && c.toNat ≤ 102) ||
    (65 ≤ c.toNat && c.toNat ≤ 70)

/-- `isHexString` from `@leather.io/utils`: `/^[0-9a-fA-F]+$/`. -/
def isHexString (s : Str) : Bool :=
  !s.isEmpty && s.all isHexChar

def hexValue (c : Char) : Nat :=
  if 48 ≤ c.toNat ∧ c.toNat ≤ 57 then c.toNat - 48
  else if 97 ≤ c.toNat ∧ c.toNat ≤ 102 then c.toNat - 87
  else if 65 ≤ c.toNat ∧ c.toNat ≤ 70 then c.toNat - 55
  else 0

def parseHex (s : Str) : Nat :=
  s.foldl (fun sofar c => 16 * sofar + hexValue c) 0

def isDecimalString (s : Str) : Bool :=
  !s.isEmpty && s.all Char.isDigit

def parseDecimal (s : Str) : Nat :=
  Nat.ofDigitChars 10 s 0

/-- `` `${n}` `` for a non-negative safe integer. -/
def decimal (n : Nat) : Str :=
  Nat.toDigits 10 n

/-- `n.toString(16)` for a non-negative safe integer. -/
def hex (n : Nat) : Str :=
  Nat.toDigits 16 n

def maxSafeInteger : Nat := 2 ^ 53 - 1

/-- `value.replace('ab', '')`: drop the first occurrence of a two-character pattern. -/
def removeFirstPair (a b : Char) : Str → Str
  | [] => []
  | [c] => [c]
  | c :: d :: rest => if c = a ∧ d = b then rest else c :: removeFirstPair a b (d :: rest)

end Js
