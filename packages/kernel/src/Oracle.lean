import codec.Codec
import format.Format

/-!
Differential-test oracle. Reads one call per line on stdin, as space-separated
tokens, and prints what the model says the TypeScript kernel does.

    encode <shape> <value>     prints `ok <hex>` or `throws`
    decode <shape> <hex>       prints `ok <value>` or `throws`

Shapes are written prefix-first:

    int <int>   fixed <n>   bytes <int>   text <int>   const <hex>
    list <int> <shape>      pair <shape> <shape>

where `<int>` is `uint <width> be`, `uint <width> le` or `compact`. A value
follows its shape: a decimal for `int`, hex for `fixed` and `bytes`,
comma-separated hex code points for `text`, nothing for `const`, a count and
then that many items for `list`, and one value after the other for `pair`.
Empty hex and empty text are written `-`.

A message that ends with every remaining byte uses

    encodetail <bytes or text> <shape> <value> <rest>    prints `ok <hex>` or `throws`
    decodetail <bytes or text> <shape> <hex>             prints `ok <value> <rest>` or `throws`

The text-format kernel answers three more calls:

    print <shape> <value>      prints `ok <text>` or `throws`
    parse <shape> <text>       prints `ok <value>` or `throws`
    check <shape>              prints `ok` if the shape is well formed, else `rejected`

with shapes

    number <base> <width or ->          chars <0 or 1> <ranges> <min> <max>
    prefixed <text> <shape>             suffix <char> <shape>
    separated <char> <min> <shape>      split <char> <shape> <shape>

A character is one hex code point, text is comma-separated hex code points,
and `<ranges>` is `lo-hi` pairs of decimal code points joined by `;`, after a
flag saying whether the set is negated. A value follows its shape: a decimal
for `number`, text for `chars`, the inner value and then `1` or `0` for
`suffix`, a count and then that many items for `separated`, and one value after
the other for `split`.

`version` prints `ok` and a fingerprint of the model sources this binary was
built from, so a test can tell when the binary is out of date.

A line the oracle cannot read prints `error malformed input`. This file is
unverified glue around the models.
-/

namespace Oracle

open Codec

abbrev Parser (α : Type) := List String → Option (α × List String)

def hexDigitValue (c : Char) : Option Nat :=
  if '0' ≤ c ∧ c ≤ '9' then some (c.toNat - '0'.toNat)
  else if 'a' ≤ c ∧ c ≤ 'f' then some (c.toNat - 'a'.toNat + 10)
  else none

def parseHexNat (s : String) : Option Nat :=
  if s.isEmpty then none
  else s.toList.foldlM (fun acc c => (hexDigitValue c).map (acc * 16 + ·)) 0

def parseHexPairs : List Char → Option Bytes
  | [] => some []
  | high :: low :: rest => do
    let h ← hexDigitValue high
    let l ← hexDigitValue low
    let tail ← parseHexPairs rest
    pure (UInt8.ofNat (h * 16 + l) :: tail)
  | [_] => none

def parseBytes (s : String) : Option Bytes :=
  if s = "-" then some [] else parseHexPairs s.toList

def parseText (s : String) : Option String :=
  if s = "-" then some ""
  else do
    let codePoints ← (s.splitOn ",").mapM parseHexNat
    let chars ← codePoints.mapM fun n => if n.isValidChar then some (Char.ofNat n) else none
    pure (String.ofList chars)

def parseIntCodec : Parser IntCodec
  | "uint" :: width :: "be" :: rest => width.toNat?.map fun w => (.uint w .big, rest)
  | "uint" :: width :: "le" :: rest => width.toNat?.map fun w => (.uint w .little, rest)
  | "compact" :: rest => some (.compactSize, rest)
  | _ => none

partial def parseShape : Parser Shape
  | "int" :: rest => do
    let (codec, rest) ← parseIntCodec rest
    pure (.int codec, rest)
  | "fixed" :: length :: rest => length.toNat?.map fun n => (.fixedBytes n, rest)
  | "bytes" :: rest => do
    let (codec, rest) ← parseIntCodec rest
    pure (.bytes codec, rest)
  | "text" :: rest => do
    let (codec, rest) ← parseIntCodec rest
    pure (.text codec, rest)
  | "const" :: hex :: rest => (parseBytes hex).map fun bytes => (.constant bytes, rest)
  | "list" :: rest => do
    let (codec, rest) ← parseIntCodec rest
    let (item, rest) ← parseShape rest
    pure (.list codec item, rest)
  | "pair" :: rest => do
    let (first, rest) ← parseShape rest
    let (second, rest) ← parseShape rest
    pure (.pair first second, rest)
  | _ => none

mutual

partial def parseValue : Shape → Parser Value
  | .int _, n :: rest => n.toNat?.map fun n => (.int n, rest)
  | .fixedBytes _, hex :: rest => (parseBytes hex).map fun bytes => (.bytes bytes, rest)
  | .bytes _, hex :: rest => (parseBytes hex).map fun bytes => (.bytes bytes, rest)
  | .text _, text :: rest => (parseText text).map fun text => (.text text, rest)
  | .constant _, rest => some (.unit, rest)
  | .list _ item, count :: rest => do
    let (items, rest) ← parseValues item (← count.toNat?) rest
    pure (.list items, rest)
  | .pair first second, rest => do
    let (x, rest) ← parseValue first rest
    let (y, rest) ← parseValue second rest
    pure (.pair x y, rest)
  | _, _ => none

partial def parseValues (item : Shape) : Nat → Parser (List Value)
  | 0, rest => some ([], rest)
  | count + 1, rest => do
    let (value, rest) ← parseValue item rest
    let (values, rest) ← parseValues item count rest
    pure (value :: values, rest)

end

def hexDigit (n : Nat) : Char :=
  if n < 10 then Char.ofNat ('0'.toNat + n) else Char.ofNat ('a'.toNat + n - 10)

def renderBytes (bytes : Bytes) : String :=
  if bytes.isEmpty then "-"
  else String.ofList (bytes.flatMap fun b => [hexDigit (b.toNat / 16), hexDigit (b.toNat % 16)])

def renderText (text : String) : String :=
  if text.isEmpty then "-"
  else ",".intercalate (text.toList.map fun c => String.ofList (Nat.toDigits 16 c.toNat))

partial def renderValue : Value → List String
  | .int n => [toString n]
  | .bytes bytes => [renderBytes bytes]
  | .text text => [renderText text]
  | .unit => []
  | .list items => toString items.length :: items.flatMap renderValue
  | .pair first second => renderValue first ++ renderValue second

namespace Text

open Format

def parseChar (s : String) : Option Char := do
  let n ← parseHexNat s
  if n.isValidChar then some (Char.ofNat n) else none

def parseStr (s : String) : Option Str :=
  if s = "-" then some [] else (s.splitOn ",").mapM parseChar

def parseRange (s : String) : Option (Nat × Nat) :=
  match s.splitOn "-" with
  | [low, high] => do pure (← low.toNat?, ← high.toNat?)
  | _ => none

def parseRanges (s : String) : Option (List (Nat × Nat)) :=
  if s = "-" then some [] else (s.splitOn ";").mapM parseRange

partial def parseShape : Parser Format.Shape
  | "number" :: base :: width :: rest => do
    let width ← if width = "-" then pure none else width.toNat?.map some
    pure (.number (← base.toNat?) width, rest)
  | "chars" :: negated :: ranges :: minLength :: maxLength :: rest => do
    let set : CharSet := { ranges := ← parseRanges ranges, negated := negated = "1" }
    pure (.chars set (← minLength.toNat?) (← maxLength.toNat?), rest)
  | "prefixed" :: text :: rest => do
    let (inner, rest) ← parseShape rest
    pure (.prefixed (← parseStr text) inner, rest)
  | "suffix" :: mark :: rest => do
    let (inner, rest) ← parseShape rest
    pure (.optionalSuffix (← parseChar mark) inner, rest)
  | "separated" :: separator :: minCount :: rest => do
    let (item, rest) ← parseShape rest
    pure (.separated (← parseChar separator) (← minCount.toNat?) item, rest)
  | "split" :: separator :: rest => do
    let (first, rest) ← parseShape rest
    let (second, rest) ← parseShape rest
    pure (.split (← parseChar separator) first second, rest)
  | _ => none

mutual

partial def parseValue : Format.Shape → Parser Format.Value
  | .number _ _, n :: rest => n.toNat?.map fun n => (.nat n, rest)
  | .chars _ _ _, text :: rest => (parseStr text).map fun text => (.text text, rest)
  | .prefixed _ inner, rest => parseValue inner rest
  | .optionalSuffix _ inner, rest => do
    let (value, rest) ← parseValue inner rest
    match rest with
    | "1" :: rest => pure (.pair value (.bool true), rest)
    | "0" :: rest => pure (.pair value (.bool false), rest)
    | _ => none
  | .separated _ _ item, count :: rest => do
    let (items, rest) ← parseValues item (← count.toNat?) rest
    pure (.list items, rest)
  | .split _ first second, rest => do
    let (x, rest) ← parseValue first rest
    let (y, rest) ← parseValue second rest
    pure (.pair x y, rest)
  | _, _ => none

partial def parseValues (item : Format.Shape) : Nat → Parser (List Format.Value)
  | 0, rest => some ([], rest)
  | count + 1, rest => do
    let (value, rest) ← parseValue item rest
    let (values, rest) ← parseValues item count rest
    pure (value :: values, rest)

end

def renderStr (text : Str) : String :=
  if text.isEmpty then "-"
  else ",".intercalate (text.map fun c => String.ofList (Nat.toDigits 16 c.toNat))

partial def renderValue : Format.Value → List String
  | .nat n => [toString n]
  | .text text => [renderStr text]
  | .bool flag => [if flag then "1" else "0"]
  | .list items => toString items.length :: items.flatMap renderValue
  | .pair first second => renderValue first ++ renderValue second

def respond : List String → Option String
  | "print" :: tokens => do
    let (shape, tokens) ← parseShape tokens
    let (value, tokens) ← parseValue shape tokens
    if !tokens.isEmpty then none
    match Format.print shape value with
    | some text => pure s!"ok {renderStr text}"
    | none => pure "throws"
  | "parse" :: tokens => do
    let (shape, tokens) ← parseShape tokens
    match tokens with
    | [text] =>
      match Format.parse shape (← parseStr text) with
      | some value => pure (" ".intercalate ("ok" :: renderValue value))
      | none => pure "throws"
    | _ => none
  | "check" :: tokens => do
    let (shape, tokens) ← parseShape tokens
    if !tokens.isEmpty then none
    pure (if Format.wellFormed shape then "ok" else "rejected")
  | _ => none

end Text

def parseTail : String → Option Tail
  | "bytes" => some .bytes
  | "text" => some .text
  | _ => none

def parseTailValue : Tail → String → Option Value
  | .bytes, token => (parseBytes token).map .bytes
  | .text, token => (parseText token).map .text

def respondWithTail : List String → Option String
  | "encodetail" :: tail :: tokens => do
    let tail ← parseTail tail
    let (shape, tokens) ← parseShape tokens
    let (value, tokens) ← parseValue shape tokens
    match tokens with
    | [rest] =>
      match encodeWithTail shape tail value (← parseTailValue tail rest) with
      | some bytes => pure s!"ok {renderBytes bytes}"
      | none => pure "throws"
    | _ => none
  | "decodetail" :: tail :: tokens => do
    let tail ← parseTail tail
    let (shape, tokens) ← parseShape tokens
    match tokens with
    | [hex] =>
      match decodeWithTail shape tail (← parseBytes hex) with
      | some (value, rest) =>
        pure (" ".intercalate ("ok" :: renderValue value ++ renderValue rest))
      | none => pure "throws"
    | _ => none
  | _ => none

def fnv1a (text : String) : UInt32 :=
  text.toUTF8.foldl (fun hash byte => (hash ^^^ byte.toUInt32) * 16777619) 2166136261

def sourceFingerprint : String :=
  toString
    (fnv1a
      ((include_str "codec/Codec.lean") ++ (include_str "format/Format.lean") ++
        (include_str "Oracle.lean"))).toNat

def respond (line : String) : String :=
  let answer : Option String :=
    match line.splitOn " " with
    | ["version"] => some s!"ok {sourceFingerprint}"
    | "encode" :: tokens => do
      let (shape, tokens) ← parseShape tokens
      let (value, tokens) ← parseValue shape tokens
      if !tokens.isEmpty then none
      match encode shape value with
      | some bytes => pure s!"ok {renderBytes bytes}"
      | none => pure "throws"
    | "decode" :: tokens => do
      let (shape, tokens) ← parseShape tokens
      match tokens with
      | [hex] =>
        match decodeExact shape (← parseBytes hex) with
        | some value => pure (" ".intercalate ("ok" :: renderValue value))
        | none => pure "throws"
      | _ => none
    | tokens => (respondWithTail tokens).orElse fun _ => Text.respond tokens
  answer.getD "error malformed input"

partial def loop (stdin stdout : IO.FS.Stream) : IO Unit := do
  let line ← stdin.getLine
  if line.isEmpty then return
  stdout.putStrLn (respond ((line.splitOn "\n").headD ""))
  loop stdin stdout

end Oracle

def main : IO Unit := do
  Oracle.loop (← IO.getStdin) (← IO.getStdout)
