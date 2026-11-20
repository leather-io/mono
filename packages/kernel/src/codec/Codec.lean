/-!
Executable model of the codec kernel in `codec.ts`, next to this file.

A codec is described by a `Shape`, built only from the constructors below. One
interpreter, `encode`, turns a value of that shape into bytes, and another,
`decode`, reads it back off the front of a byte stream. `none` stands for the
TypeScript function throwing.

`CodecProofs.lean` proves properties of `encode` and `decode` for every shape,
so a codec assembled from these constructors needs no proof of its own.
-/

namespace Codec

abbrev Bytes := List UInt8

/-- JavaScript's `Number.MAX_SAFE_INTEGER`. Numbers above it are refused. -/
def maxSafeInteger : Nat := 2 ^ 53 - 1

/-- The `width` least significant bytes of `n`, least significant first. -/
def leBytes : Nat → Nat → Bytes
  | 0, _ => []
  | width + 1, n => UInt8.ofNat (n % 256) :: leBytes width (n / 256)

def fromLE : Bytes → Nat
  | [] => 0
  | byte :: rest => byte.toNat + 256 * fromLE rest

inductive Endian where
  | big
  | little

def uintBytes (width : Nat) : Endian → Nat → Bytes
  | .little, n => leBytes width n
  | .big, n => (leBytes width n).reverse

def uintValue : Endian → Bytes → Nat
  | .little, bytes => fromLE bytes
  | .big, bytes => fromLE bytes.reverse

def takeExactly (count : Nat) (bytes : Bytes) : Option (Bytes × Bytes) :=
  if count ≤ bytes.length then some (bytes.take count, bytes.drop count) else none

/-- Ways to write a number. Also used for the length or count in front of other data. -/
inductive IntCodec where
  | uint (width : Nat) (endian : Endian)
  /-- Bitcoin's variable-length integer. Only the shortest form of a number is accepted. -/
  | compactSize

def encodeUint (width : Nat) (endian : Endian) (n : Nat) : Option Bytes :=
  if n < 256 ^ width ∧ n ≤ maxSafeInteger then some (uintBytes width endian n) else none

def decodeUint (width : Nat) (endian : Endian) (bytes : Bytes) : Option (Nat × Bytes) :=
  match takeExactly width bytes with
  | some (head, rest) =>
    if uintValue endian head ≤ maxSafeInteger then some (uintValue endian head, rest) else none
  | none => none

def encodeCompactSize (n : Nat) : Option Bytes :=
  if n < 253 then some [UInt8.ofNat n]
  else if n < 2 ^ 16 then some (253 :: leBytes 2 n)
  else if n < 2 ^ 32 then some (254 :: leBytes 4 n)
  else if n ≤ maxSafeInteger then some (255 :: leBytes 8 n)
  else none

/-- Reads the `width`-byte body of a compact size, refusing a number that had a shorter form. -/
def decodeCompactSizeBody (width least : Nat) (bytes : Bytes) : Option (Nat × Bytes) :=
  match takeExactly width bytes with
  | some (head, rest) =>
    if least ≤ fromLE head ∧ fromLE head ≤ maxSafeInteger then some (fromLE head, rest) else none
  | none => none

def decodeCompactSize : Bytes → Option (Nat × Bytes)
  | [] => none
  | tag :: rest =>
    if tag.toNat < 253 then some (tag.toNat, rest)
    else if tag.toNat = 253 then decodeCompactSizeBody 2 253 rest
    else if tag.toNat = 254 then decodeCompactSizeBody 4 (2 ^ 16) rest
    else decodeCompactSizeBody 8 (2 ^ 32) rest

def encodeInt : IntCodec → Nat → Option Bytes
  | .uint width endian, n => encodeUint width endian n
  | .compactSize, n => encodeCompactSize n

def decodeInt : IntCodec → Bytes → Option (Nat × Bytes)
  | .uint width endian, bytes => decodeUint width endian bytes
  | .compactSize, bytes => decodeCompactSize bytes

def utf8 (text : String) : Bytes :=
  text.toUTF8.data.toList

def fromUtf8 (bytes : Bytes) : Option String :=
  String.fromUTF8? ⟨bytes.toArray⟩

/-- `body` with its length in front. -/
def lengthPrefixed (length : IntCodec) (body : Bytes) : Option Bytes :=
  match encodeInt length body.length with
  | some header => some (header ++ body)
  | none => none

def takeLengthPrefixed (length : IntCodec) (bytes : Bytes) : Option (Bytes × Bytes) :=
  match decodeInt length bytes with
  | some (count, rest) => takeExactly count rest
  | none => none

/-- What a codec reads and writes. The only way to describe one. -/
inductive Shape where
  | int (codec : IntCodec)
  /-- Exactly `length` bytes, with nothing in front. -/
  | fixedBytes (length : Nat)
  /-- Bytes with their length in front. -/
  | bytes (length : IntCodec)
  /-- UTF-8 text with its byte length in front. -/
  | text (length : IntCodec)
  /-- Fixed bytes that carry no value, such as a magic number or version tag. -/
  | constant (bytes : Bytes)
  /-- Items of one shape with their count in front. -/
  | list (count : IntCodec) (item : Shape)
  /-- One shape followed by another. Longer sequences nest to the right. -/
  | pair (first second : Shape)

inductive Value where
  | int (n : Nat)
  | bytes (bytes : Bytes)
  | text (text : String)
  | unit
  | list (items : List Value)
  | pair (first second : Value)

def encodeEach (encodeItem : Value → Option Bytes) : List Value → Option Bytes
  | [] => some []
  | item :: items =>
    match encodeItem item, encodeEach encodeItem items with
    | some head, some tail => some (head ++ tail)
    | _, _ => none

def decodeCount (decodeItem : Bytes → Option (Value × Bytes)) :
    Nat → Bytes → Option (List Value × Bytes)
  | 0, bytes => some ([], bytes)
  | count + 1, bytes =>
    match decodeItem bytes with
    | some (item, rest) =>
      match decodeCount decodeItem count rest with
      | some (items, rest) => some (item :: items, rest)
      | none => none
    | none => none

def encode : Shape → Value → Option Bytes
  | .int codec, .int n => encodeInt codec n
  | .fixedBytes length, .bytes bytes => if bytes.length = length then some bytes else none
  | .bytes length, .bytes bytes => lengthPrefixed length bytes
  | .text length, .text text => lengthPrefixed length (utf8 text)
  | .constant bytes, .unit => some bytes
  | .list count item, .list items =>
    match encodeInt count items.length, encodeEach (encode item) items with
    | some header, some body => some (header ++ body)
    | _, _ => none
  | .pair first second, .pair x y =>
    match encode first x, encode second y with
    | some head, some tail => some (head ++ tail)
    | _, _ => none
  | _, _ => none

/-- Reads one value off the front of `bytes` and returns it with what is left. -/
def decode : Shape → Bytes → Option (Value × Bytes)
  | .int codec, bytes =>
    match decodeInt codec bytes with
    | some (n, rest) => some (.int n, rest)
    | none => none
  | .fixedBytes length, bytes =>
    match takeExactly length bytes with
    | some (body, rest) => some (.bytes body, rest)
    | none => none
  | .bytes length, bytes =>
    match takeLengthPrefixed length bytes with
    | some (body, rest) => some (.bytes body, rest)
    | none => none
  | .text length, bytes =>
    match takeLengthPrefixed length bytes with
    | some (body, rest) =>
      match fromUtf8 body with
      | some text => some (.text text, rest)
      | none => none
    | none => none
  | .constant expected, bytes =>
    match takeExactly expected.length bytes with
    | some (body, rest) => if body = expected then some (.unit, rest) else none
    | none => none
  | .list count item, bytes =>
    match decodeInt count bytes with
    | some (n, rest) =>
      match decodeCount (decode item) n rest with
      | some (items, rest) => some (.list items, rest)
      | none => none
    | none => none
  | .pair first second, bytes =>
    match decode first bytes with
    | some (x, rest) =>
      match decode second rest with
      | some (y, rest) => some (.pair x y, rest)
      | none => none
    | none => none

/-- Decodes a whole byte string, refusing leftover bytes. -/
def decodeExact (shape : Shape) (bytes : Bytes) : Option Value :=
  match decode shape bytes with
  | some (value, []) => some value
  | _ => none

/--
What may follow a shape as the last thing in a message: every remaining byte,
taken as raw bytes or as UTF-8 text. It has no length in front, so it can only
come last and a message that ends with one cannot be nested in another shape.
-/
inductive Tail where
  | bytes
  | text

def encodeTail : Tail → Value → Option Bytes
  | .bytes, .bytes bytes => some bytes
  | .text, .text text => some (utf8 text)
  | _, _ => none

def decodeTail : Tail → Bytes → Option Value
  | .bytes, bytes => some (.bytes bytes)
  | .text, bytes =>
    match fromUtf8 bytes with
    | some text => some (.text text)
    | none => none

/-- A value of `shape`, then the tail. -/
def encodeWithTail (shape : Shape) (tail : Tail) (value rest : Value) : Option Bytes :=
  match encode shape value, encodeTail tail rest with
  | some head, some body => some (head ++ body)
  | _, _ => none

def decodeWithTail (shape : Shape) (tail : Tail) (bytes : Bytes) : Option (Value × Value) :=
  match decode shape bytes with
  | some (value, remaining) =>
    match decodeTail tail remaining with
    | some rest => some (value, rest)
    | none => none
  | none => none

end Codec
