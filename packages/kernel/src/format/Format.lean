/-!
Executable model of the text-format kernel in `format.ts`, next to this file.

A format is described by a `Shape`, built only from the constructors below.
One interpreter, `print`, turns a value of that shape into text, and another,
`parse`, reads a whole string back. `none` stands for the TypeScript function
throwing.

Formats are kept unambiguous by delimiters: a part that is followed by a
separator must not be able to contain that separator. `wellFormed` checks this
for a shape, and `FormatProofs.lean` proves the properties of `print` and
`parse` for every well-formed shape.
-/

namespace Format

/-- Text as a list of Unicode code points. -/
abbrev Str := List Char

/-- JavaScript's `Number.MAX_SAFE_INTEGER`. Numbers above it are refused. -/
def maxSafeInteger : Nat := 2 ^ 53 - 1

def digitChars : Str :=
  ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f']

def digitChar (digit : Nat) : Char :=
  digitChars.getD digit '0'

def digitValue (base : Nat) (c : Char) : Option Nat :=
  if digitChars.idxOf c < base ∧ digitChars.idxOf c < 16 then some (digitChars.idxOf c) else none

/-- The `width` least significant digits of `n`, least significant first. -/
def leDigits (base : Nat) : Nat → Nat → Str
  | 0, _ => []
  | width + 1, n => digitChar (n % base) :: leDigits base width (n / base)

def fromLE (base : Nat) : Str → Option Nat
  | [] => some 0
  | c :: rest =>
    match digitValue base c, fromLE base rest with
    | some digit, some higher => some (digit + base * higher)
    | _, _ => none

def fixedDigits (base width n : Nat) : Str :=
  (leDigits base width n).reverse

def digitsValue (base : Nat) (text : Str) : Option Nat :=
  fromLE base text.reverse

/-- More digits than any safe integer needs in any base from 2 up. -/
def maxDigits : Nat := 53

/-- Drops leading zeros, keeping one digit for zero itself. -/
def stripZeros (text : Str) : Str :=
  match text.dropWhile (· == '0') with
  | [] => ['0']
  | stripped => stripped

/-- A number in `base`. With a width it is zero-padded to exactly that many digits. -/
def printNumber (base : Nat) : Option Nat → Nat → Option Str
  | some width, n =>
    if n < base ^ width ∧ n ≤ maxSafeInteger then some (fixedDigits base width n) else none
  | none, n =>
    if n ≤ maxSafeInteger then some (stripZeros (fixedDigits base maxDigits n)) else none

def safeValue (base : Nat) (text : Str) : Option Nat :=
  match digitsValue base text with
  | some n => if n ≤ maxSafeInteger then some n else none
  | none => none

/-- Without a width, only the shortest form of a number is accepted. -/
def parseNumber (base : Nat) : Option Nat → Str → Option Nat
  | some width, text => if text.length = width then safeValue base text else none
  | none, text =>
    if text.length ≤ maxDigits ∧ stripZeros text = text then safeValue base text else none

/-- A set of characters: the code points in any of `ranges`, or all others when `negated`. -/
structure CharSet where
  ranges : List (Nat × Nat)
  negated : Bool

def CharSet.contains (set : CharSet) (c : Char) : Bool :=
  (set.ranges.any fun range => range.1 ≤ c.toNat ∧ c.toNat ≤ range.2) != set.negated

/-- Cuts `text` at every `separator`. -/
def splitAll (separator : Char) : Str → List Str
  | [] => [[]]
  | c :: rest =>
    if c = separator then [] :: splitAll separator rest
    else
      match splitAll separator rest with
      | [] => [[c]]
      | piece :: pieces => (c :: piece) :: pieces

def join (separator : Char) : List Str → Str
  | [] => []
  | [piece] => piece
  | piece :: rest => piece ++ separator :: join separator rest

/-- Cuts `text` at the first `separator`. -/
def splitFirst (separator : Char) : Str → Option (Str × Str)
  | [] => none
  | c :: rest =>
    if c = separator then some ([], rest)
    else
      match splitFirst separator rest with
      | some (left, right) => some (c :: left, right)
      | none => none

/-- `text` without its final character, if that character is `mark`. -/
def stripSuffix (mark : Char) (text : Str) : Option Str :=
  match text.reverse with
  | c :: rest => if c = mark then some rest.reverse else none
  | [] => none

/-- What a format reads and writes. The only way to describe one. -/
inductive Shape where
  /-- A number in `base` (2 to 16, lowercase digits), zero-padded to `width` (1 or more) if given. -/
  | number (base : Nat) (width : Option Nat)
  /-- Text of `minLength` to `maxLength` characters, all from `set`. -/
  | chars (set : CharSet) (minLength maxLength : Nat)
  /-- Fixed text, then the inner format. -/
  | prefixed (text : Str) (inner : Shape)
  /-- The inner format, then `mark` or nothing. The value records which. -/
  | optionalSuffix (mark : Char) (inner : Shape)
  /-- At least `minCount` items (and at least one) with `separator` between them. -/
  | separated (separator : Char) (minCount : Nat) (item : Shape)
  /-- One format, `separator`, then another. Cut at the first `separator`. -/
  | split (separator : Char) (first second : Shape)

inductive Value where
  | nat (n : Nat)
  | text (text : Str)
  | bool (flag : Bool)
  | list (items : List Value)
  | pair (first second : Value)

/-- The characters a shape may print. May include more than it ever does. -/
def alphabet : Shape → Char → Bool
  | .number base _, c => (digitChars.take base).contains c
  | .chars set _ _, c => set.contains c
  | .prefixed text inner, c => text.contains c || alphabet inner c
  | .optionalSuffix mark inner, c => c == mark || alphabet inner c
  | .separated separator _ item, c => c == separator || alphabet item c
  | .split separator first second, c => c == separator || alphabet first c || alphabet second c

/-- Whether every part followed by a delimiter is unable to contain that delimiter. -/
def wellFormed : Shape → Bool
  | .number base width => 2 ≤ base && base ≤ 16 && width != some 0
  | .chars _ _ _ => true
  | .prefixed _ inner => wellFormed inner
  | .optionalSuffix mark inner => !alphabet inner mark && wellFormed inner
  | .separated separator _ item => !alphabet item separator && wellFormed item
  | .split separator first second =>
    !alphabet first separator && wellFormed first && wellFormed second

def printEach (printItem : Value → Option Str) : List Value → Option (List Str)
  | [] => some []
  | item :: items =>
    match printItem item, printEach printItem items with
    | some head, some tail => some (head :: tail)
    | _, _ => none

def parseEach (parseItem : Str → Option Value) : List Str → Option (List Value)
  | [] => some []
  | piece :: pieces =>
    match parseItem piece, parseEach parseItem pieces with
    | some head, some tail => some (head :: tail)
    | _, _ => none

def print : Shape → Value → Option Str
  | .number base width, .nat n => printNumber base width n
  | .chars set minLength maxLength, .text text =>
    if text.all set.contains ∧ minLength ≤ text.length ∧ text.length ≤ maxLength then some text
    else none
  | .prefixed text inner, value =>
    match print inner value with
    | some body => some (text ++ body)
    | none => none
  | .optionalSuffix mark inner, .pair value (.bool flag) =>
    match print inner value with
    | some body => some (if flag then body ++ [mark] else body)
    | none => none
  | .separated separator minCount item, .list items =>
    if items = [] ∨ items.length < minCount then none
    else
      match printEach (print item) items with
      | some pieces => some (join separator pieces)
      | none => none
  | .split separator first second, .pair x y =>
    match print first x, print second y with
    | some left, some right => some (left ++ separator :: right)
    | _, _ => none
  | _, _ => none

/-- Reads a whole string. -/
def parse : Shape → Str → Option Value
  | .number base width, text =>
    match parseNumber base width text with
    | some n => some (.nat n)
    | none => none
  | .chars set minLength maxLength, text =>
    if text.all set.contains ∧ minLength ≤ text.length ∧ text.length ≤ maxLength then
      some (.text text)
    else none
  | .prefixed expected inner, text =>
    if text.take expected.length = expected then parse inner (text.drop expected.length) else none
  | .optionalSuffix mark inner, text =>
    match stripSuffix mark text with
    | some body =>
      match parse inner body with
      | some value => some (.pair value (.bool true))
      | none => none
    | none =>
      match parse inner text with
      | some value => some (.pair value (.bool false))
      | none => none
  | .separated separator minCount item, text =>
    match parseEach (parse item) (splitAll separator text) with
    | some items => if items.length < minCount then none else some (.list items)
    | none => none
  | .split separator first second, text =>
    match splitFirst separator text with
    | some (left, right) =>
      match parse first left, parse second right with
      | some x, some y => some (.pair x y)
      | _, _ => none
    | none => none

end Format
