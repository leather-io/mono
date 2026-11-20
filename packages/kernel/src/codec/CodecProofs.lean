import codec.Codec

/-!
Proofs about the codec kernel. The four theorems at the end hold for every
`Shape`, so they hold for every codec the TypeScript kernel can build.
-/

namespace Codec

theorem takeExactly_append (body rest : Bytes) :
    takeExactly body.length (body ++ rest) = some (body, rest) := by
  simp [takeExactly]

theorem takeExactly_eq_some {count : Nat} {bytes body rest : Bytes}
    (h : takeExactly count bytes = some (body, rest)) :
    bytes = body ++ rest ∧ body.length = count := by
  unfold takeExactly at h
  split at h
  · simp only [Option.some.injEq, Prod.mk.injEq] at h
    obtain ⟨rfl, rfl⟩ := h
    exact ⟨(List.take_append_drop _ _).symm, by rw [List.length_take]; omega⟩
  · simp at h

theorem leBytes_length (width n : Nat) : (leBytes width n).length = width := by
  induction width generalizing n with
  | zero => rfl
  | succ width ih => simp [leBytes, ih]

theorem fromLE_leBytes {width n : Nat} (h : n < 256 ^ width) : fromLE (leBytes width n) = n := by
  induction width generalizing n with
  | zero =>
    have hzero : n = 0 := by simpa using h
    subst hzero
    rfl
  | succ width ih =>
    have hdiv : n / 256 < 256 ^ width := by
      rw [Nat.pow_succ] at h
      omega
    simp only [leBytes, fromLE, ih hdiv, UInt8.toNat_ofNat']
    omega

theorem leBytes_fromLE (bytes : Bytes) : leBytes bytes.length (fromLE bytes) = bytes := by
  induction bytes with
  | nil => rfl
  | cons byte rest ih =>
    have hbyte := byte.toNat_lt
    have hmod : (byte.toNat + 256 * fromLE rest) % 256 = byte.toNat := by omega
    have hdiv : (byte.toNat + 256 * fromLE rest) / 256 = fromLE rest := by omega
    simp only [List.length_cons, leBytes, fromLE, hmod, hdiv, ih, UInt8.ofNat_toNat]

theorem fromLE_lt (bytes : Bytes) : fromLE bytes < 256 ^ bytes.length := by
  induction bytes with
  | nil => simp [fromLE]
  | cons byte rest ih =>
    have hbyte := byte.toNat_lt
    simp only [fromLE, List.length_cons, Nat.pow_succ]
    omega

theorem uintBytes_length (width : Nat) (endian : Endian) (n : Nat) :
    (uintBytes width endian n).length = width := by
  cases endian <;> simp [uintBytes, leBytes_length]

theorem uintValue_uintBytes {width n : Nat} (endian : Endian) (h : n < 256 ^ width) :
    uintValue endian (uintBytes width endian n) = n := by
  cases endian <;> simp [uintValue, uintBytes, fromLE_leBytes h]

theorem uintBytes_uintValue (endian : Endian) (bytes : Bytes) :
    uintBytes bytes.length endian (uintValue endian bytes) = bytes := by
  cases endian
  · have hback := leBytes_fromLE bytes.reverse
    simp only [List.length_reverse] at hback
    simp [uintBytes, uintValue, hback]
  · simp [uintBytes, uintValue, leBytes_fromLE]

theorem uintValue_lt (endian : Endian) (bytes : Bytes) :
    uintValue endian bytes < 256 ^ bytes.length := by
  cases endian
  · have hlt := fromLE_lt bytes.reverse
    simpa [uintValue] using hlt
  · exact fromLE_lt bytes

theorem decodeUint_encodeUint {width : Nat} {endian : Endian} {n : Nat} {bytes : Bytes}
    (rest : Bytes) (h : encodeUint width endian n = some bytes) :
    decodeUint width endian (bytes ++ rest) = some (n, rest) := by
  unfold encodeUint at h
  split at h
  · rename_i hn
    simp only [Option.some.injEq] at h
    subst h
    have htake := takeExactly_append (uintBytes width endian n) rest
    rw [uintBytes_length] at htake
    simp [decodeUint, htake, uintValue_uintBytes endian hn.1, hn.2]
  · simp at h

theorem encodeUint_decodeUint {width : Nat} {endian : Endian} {bytes : Bytes} {n : Nat}
    {rest : Bytes} (h : decodeUint width endian bytes = some (n, rest)) :
    ∃ encoded, encodeUint width endian n = some encoded ∧ bytes = encoded ++ rest := by
  unfold decodeUint at h
  split at h
  · rename_i head tail htake
    split at h
    · rename_i hsafe
      simp only [Option.some.injEq, Prod.mk.injEq] at h
      obtain ⟨rfl, rfl⟩ := h
      obtain ⟨hbytes, hlength⟩ := takeExactly_eq_some htake
      have hlt := uintValue_lt endian head
      have hback := uintBytes_uintValue endian head
      rw [hlength] at hlt hback
      exact ⟨head, by simp [encodeUint, hlt, hsafe, hback], hbytes⟩
    · simp at h
  · simp at h

theorem decodeCompactSizeBody_append {width least n : Nat} (rest : Bytes)
    (hwidth : n < 256 ^ width) (hleast : least ≤ n) (hsafe : n ≤ maxSafeInteger) :
    decodeCompactSizeBody width least (leBytes width n ++ rest) = some (n, rest) := by
  have htake := takeExactly_append (leBytes width n) rest
  rw [leBytes_length] at htake
  simp [decodeCompactSizeBody, htake, fromLE_leBytes hwidth, hleast, hsafe]

theorem decodeCompactSizeBody_eq_some {width least : Nat} {bytes : Bytes} {n : Nat}
    {rest : Bytes} (h : decodeCompactSizeBody width least bytes = some (n, rest)) :
    bytes = leBytes width n ++ rest ∧ least ≤ n ∧ n ≤ maxSafeInteger ∧ n < 256 ^ width := by
  unfold decodeCompactSizeBody at h
  split at h
  · rename_i head tail htake
    split at h
    · rename_i hrange
      simp only [Option.some.injEq, Prod.mk.injEq] at h
      obtain ⟨rfl, rfl⟩ := h
      obtain ⟨hbytes, hlength⟩ := takeExactly_eq_some htake
      have hlt := fromLE_lt head
      have hback := leBytes_fromLE head
      rw [hlength] at hlt hback
      exact ⟨by rw [hback]; exact hbytes, hrange.1, hrange.2, hlt⟩
    · simp at h
  · simp at h

theorem decodeCompactSize_encodeCompactSize {n : Nat} {bytes : Bytes} (rest : Bytes)
    (h : encodeCompactSize n = some bytes) : decodeCompactSize (bytes ++ rest) = some (n, rest) := by
  unfold encodeCompactSize at h
  split at h
  · rename_i hsmall
    simp only [Option.some.injEq] at h
    subst h
    have htag : (UInt8.ofNat n).toNat = n := by
      simp only [UInt8.toNat_ofNat']
      omega
    simp [decodeCompactSize, htag, hsmall]
  · split at h
    · simp only [Option.some.injEq] at h
      subst h
      have hbody := decodeCompactSizeBody_append (width := 2) (least := 253) (n := n) rest
        (by omega) (by omega) (by unfold maxSafeInteger; omega)
      simpa [decodeCompactSize] using hbody
    · split at h
      · simp only [Option.some.injEq] at h
        subst h
        have hbody := decodeCompactSizeBody_append (width := 4) (least := 2 ^ 16) (n := n) rest
          (by omega) (by omega) (by unfold maxSafeInteger; omega)
        simpa [decodeCompactSize] using hbody
      · split at h
        · rename_i hsafe
          simp only [Option.some.injEq] at h
          subst h
          have hbody := decodeCompactSizeBody_append (width := 8) (least := 2 ^ 32) (n := n) rest
            (by unfold maxSafeInteger at hsafe; omega) (by omega) hsafe
          simpa [decodeCompactSize] using hbody
        · simp at h

theorem byte_eq_of_toNat_eq {byte : UInt8} {n : Nat} (h : byte.toNat = n) :
    byte = UInt8.ofNat n := by
  rw [← h, UInt8.ofNat_toNat]

theorem encodeCompactSize_decodeCompactSize {bytes : Bytes} {n : Nat} {rest : Bytes}
    (h : decodeCompactSize bytes = some (n, rest)) :
    ∃ encoded, encodeCompactSize n = some encoded ∧ bytes = encoded ++ rest := by
  cases bytes with
  | nil => simp [decodeCompactSize] at h
  | cons tag tail =>
    have htagLt := tag.toNat_lt
    simp only [decodeCompactSize] at h
    split at h
    · rename_i hsmall
      simp only [Option.some.injEq, Prod.mk.injEq] at h
      obtain ⟨rfl, rfl⟩ := h
      exact ⟨[tag], by simp [encodeCompactSize, hsmall, UInt8.ofNat_toNat], rfl⟩
    · split at h
      · rename_i htag
        obtain ⟨rfl, hleast, hsafe, hwidth⟩ := decodeCompactSizeBody_eq_some h
        have htag := byte_eq_of_toNat_eq htag
        subst htag
        refine ⟨253 :: leBytes 2 n, ?_, rfl⟩
        have h1 : ¬ n < 253 := by omega
        have h2 : n < 2 ^ 16 := by omega
        simp [encodeCompactSize, h1, h2]
      · split at h
        · rename_i htag
          obtain ⟨rfl, hleast, hsafe, hwidth⟩ := decodeCompactSizeBody_eq_some h
          have htag := byte_eq_of_toNat_eq htag
          subst htag
          refine ⟨254 :: leBytes 4 n, ?_, rfl⟩
          have h1 : ¬ n < 253 := by omega
          have h2 : ¬ n < 2 ^ 16 := by omega
          have h3 : n < 2 ^ 32 := by omega
          simp [encodeCompactSize, h1, h2, h3]
        · rename_i hnot253 hnot254 hnotSmall
          obtain ⟨rfl, hleast, hsafe, hwidth⟩ := decodeCompactSizeBody_eq_some h
          have htag : tag = UInt8.ofNat 255 := byte_eq_of_toNat_eq (by omega)
          subst htag
          refine ⟨255 :: leBytes 8 n, ?_, rfl⟩
          have h1 : ¬ n < 253 := by omega
          have h2 : ¬ n < 2 ^ 16 := by omega
          have h3 : ¬ n < 2 ^ 32 := by omega
          simp [encodeCompactSize, h1, h2, h3, hsafe]

theorem decodeInt_encodeInt {codec : IntCodec} {n : Nat} {bytes : Bytes} (rest : Bytes)
    (h : encodeInt codec n = some bytes) : decodeInt codec (bytes ++ rest) = some (n, rest) := by
  cases codec with
  | uint width endian => exact decodeUint_encodeUint rest h
  | compactSize => exact decodeCompactSize_encodeCompactSize rest h

theorem encodeInt_decodeInt {codec : IntCodec} {bytes : Bytes} {n : Nat} {rest : Bytes}
    (h : decodeInt codec bytes = some (n, rest)) :
    ∃ encoded, encodeInt codec n = some encoded ∧ bytes = encoded ++ rest := by
  cases codec with
  | uint width endian => exact encodeUint_decodeUint h
  | compactSize => exact encodeCompactSize_decodeCompactSize h

theorem takeLengthPrefixed_lengthPrefixed {length : IntCodec} {body bytes : Bytes}
    (rest : Bytes) (h : lengthPrefixed length body = some bytes) :
    takeLengthPrefixed length (bytes ++ rest) = some (body, rest) := by
  unfold lengthPrefixed at h
  split at h
  · rename_i header hheader
    simp only [Option.some.injEq] at h
    subst h
    have hcount := decodeInt_encodeInt (body ++ rest) hheader
    simp [takeLengthPrefixed, List.append_assoc, hcount, takeExactly_append]
  · simp at h

theorem lengthPrefixed_takeLengthPrefixed {length : IntCodec} {bytes body rest : Bytes}
    (h : takeLengthPrefixed length bytes = some (body, rest)) :
    ∃ encoded, lengthPrefixed length body = some encoded ∧ bytes = encoded ++ rest := by
  unfold takeLengthPrefixed at h
  split at h
  · rename_i count tail hcount
    obtain ⟨header, hheader, rfl⟩ := encodeInt_decodeInt hcount
    obtain ⟨rfl, hlength⟩ := takeExactly_eq_some h
    exact ⟨header ++ body, by simp [lengthPrefixed, hlength, hheader], by simp⟩
  · simp at h

theorem fromUtf8_utf8 (text : String) : fromUtf8 (utf8 text) = some text := by
  simp [fromUtf8, utf8, String.fromUTF8?, text.isValidUTF8]

theorem utf8_of_fromUtf8 {bytes : Bytes} {text : String} (h : fromUtf8 bytes = some text) :
    utf8 text = bytes := by
  unfold fromUtf8 String.fromUTF8? at h
  split at h
  · simp only [Option.some.injEq] at h
    subst h
    simp [utf8]
  · simp at h

theorem decodeCount_encodeEach {encodeItem : Value → Option Bytes}
    {decodeItem : Bytes → Option (Value × Bytes)}
    (hitem : ∀ {item : Value} {bytes : Bytes} (rest : Bytes),
      encodeItem item = some bytes → decodeItem (bytes ++ rest) = some (item, rest)) :
    ∀ {items : List Value} {bytes : Bytes} (rest : Bytes),
      encodeEach encodeItem items = some bytes →
        decodeCount decodeItem items.length (bytes ++ rest) = some (items, rest)
  | [], bytes, rest, h => by
    simp only [encodeEach, Option.some.injEq] at h
    subst h
    simp [decodeCount]
  | item :: items, bytes, rest, h => by
    simp only [encodeEach] at h
    split at h
    · rename_i head tail hhead htail
      simp only [Option.some.injEq] at h
      subst h
      simp [decodeCount, List.append_assoc, hitem (tail ++ rest) hhead,
        decodeCount_encodeEach hitem rest htail]
    · simp at h

theorem encodeEach_decodeCount {encodeItem : Value → Option Bytes}
    {decodeItem : Bytes → Option (Value × Bytes)}
    (hitem : ∀ {bytes : Bytes} {item : Value} {rest : Bytes},
      decodeItem bytes = some (item, rest) →
        ∃ encoded, encodeItem item = some encoded ∧ bytes = encoded ++ rest) :
    ∀ {count : Nat} {bytes : Bytes} {items : List Value} {rest : Bytes},
      decodeCount decodeItem count bytes = some (items, rest) →
        ∃ encoded, encodeEach encodeItem items = some encoded ∧ bytes = encoded ++ rest ∧
          items.length = count
  | 0, bytes, items, rest, h => by
    simp only [decodeCount, Option.some.injEq, Prod.mk.injEq] at h
    obtain ⟨rfl, rfl⟩ := h
    exact ⟨[], rfl, rfl, rfl⟩
  | count + 1, bytes, items, rest, h => by
    simp only [decodeCount] at h
    split at h
    · rename_i item tail hhead
      split at h
      · rename_i others rest' hothers
        simp only [Option.some.injEq, Prod.mk.injEq] at h
        obtain ⟨rfl, rfl⟩ := h
        obtain ⟨head, hencoded, rfl⟩ := hitem hhead
        obtain ⟨body, hbody, rfl, hlength⟩ := encodeEach_decodeCount hitem hothers
        exact ⟨head ++ body, by simp [encodeEach, hencoded, hbody], by simp, by simp [hlength]⟩
      · simp at h
    · simp at h

/--
Round trip. Whatever `encode` writes, `decode` reads back as the same value and
leaves the bytes that follow untouched.
-/
theorem decode_encode (shape : Shape) :
    ∀ {value : Value} {bytes : Bytes} (rest : Bytes),
      encode shape value = some bytes → decode shape (bytes ++ rest) = some (value, rest) := by
  induction shape with
  | int codec =>
    intro value bytes rest h
    cases value <;> simp only [encode, reduceCtorEq] at h
    simp [decode, decodeInt_encodeInt rest h]
  | fixedBytes length =>
    intro value bytes rest h
    cases value <;> simp only [encode, reduceCtorEq] at h
    split at h
    · rename_i hlength
      simp only [Option.some.injEq] at h
      rw [h] at hlength
      have htake := takeExactly_append bytes rest
      rw [hlength] at htake
      simp [decode, htake, h]
    · simp at h
  | bytes length =>
    intro value bytes rest h
    cases value <;> simp only [encode, reduceCtorEq] at h
    simp [decode, takeLengthPrefixed_lengthPrefixed rest h]
  | text length =>
    intro value bytes rest h
    cases value <;> simp only [encode, reduceCtorEq] at h
    simp [decode, takeLengthPrefixed_lengthPrefixed rest h, fromUtf8_utf8]
  | constant expected =>
    intro value bytes rest h
    cases value <;> simp only [encode, reduceCtorEq, Option.some.injEq] at h
    subst h
    simp [decode, takeExactly_append]
  | list count item ih =>
    intro value bytes rest h
    cases value <;> simp only [encode, reduceCtorEq] at h
    split at h
    · rename_i header body hheader hbody
      simp only [Option.some.injEq] at h
      subst h
      simp [decode, List.append_assoc, decodeInt_encodeInt (body ++ rest) hheader,
        decodeCount_encodeEach (encodeItem := encode item) (decodeItem := decode item) ih rest hbody]
    · simp at h
  | pair first second ihFirst ihSecond =>
    intro value bytes rest h
    cases value <;> simp only [encode, reduceCtorEq] at h
    split at h
    · rename_i head tail hhead htail
      simp only [Option.some.injEq] at h
      subst h
      simp [decode, List.append_assoc, ihFirst (tail ++ rest) hhead, ihSecond rest htail]
    · simp at h

/--
Canonical form. Whatever `decode` accepts is exactly what `encode` writes for
the value it returned, so a value has one accepted byte form and no other.
-/
theorem encode_decode (shape : Shape) :
    ∀ {bytes : Bytes} {value : Value} {rest : Bytes},
      decode shape bytes = some (value, rest) →
        ∃ encoded, encode shape value = some encoded ∧ bytes = encoded ++ rest := by
  induction shape with
  | int codec =>
    intro bytes value rest h
    simp only [decode] at h
    split at h
    · rename_i n tail hn
      simp only [Option.some.injEq, Prod.mk.injEq] at h
      obtain ⟨rfl, rfl⟩ := h
      simpa [encode] using encodeInt_decodeInt hn
    · simp at h
  | fixedBytes length =>
    intro bytes value rest h
    simp only [decode] at h
    split at h
    · rename_i body tail htake
      simp only [Option.some.injEq, Prod.mk.injEq] at h
      obtain ⟨rfl, rfl⟩ := h
      obtain ⟨hbytes, hlength⟩ := takeExactly_eq_some htake
      exact ⟨body, by simp [encode, hlength], hbytes⟩
    · simp at h
  | bytes length =>
    intro bytes value rest h
    simp only [decode] at h
    split at h
    · rename_i body tail htake
      simp only [Option.some.injEq, Prod.mk.injEq] at h
      obtain ⟨rfl, rfl⟩ := h
      simpa [encode] using lengthPrefixed_takeLengthPrefixed htake
    · simp at h
  | text length =>
    intro bytes value rest h
    simp only [decode] at h
    split at h
    · rename_i body tail htake
      split at h
      · rename_i text htext
        simp only [Option.some.injEq, Prod.mk.injEq] at h
        obtain ⟨rfl, rfl⟩ := h
        simpa [encode, utf8_of_fromUtf8 htext] using lengthPrefixed_takeLengthPrefixed htake
      · simp at h
    · simp at h
  | constant expected =>
    intro bytes value rest h
    simp only [decode] at h
    split at h
    · rename_i body tail htake
      split at h
      · rename_i hbody
        simp only [Option.some.injEq, Prod.mk.injEq] at h
        obtain ⟨rfl, rfl⟩ := h
        subst hbody
        exact ⟨body, by simp [encode], (takeExactly_eq_some htake).1⟩
      · simp at h
    · simp at h
  | list count item ih =>
    intro bytes value rest h
    simp only [decode] at h
    split at h
    · rename_i n tail hn
      split at h
      · rename_i items rest' hitems
        simp only [Option.some.injEq, Prod.mk.injEq] at h
        obtain ⟨rfl, rfl⟩ := h
        obtain ⟨header, hheader, rfl⟩ := encodeInt_decodeInt hn
        obtain ⟨body, hbody, rfl, hlength⟩ :=
          encodeEach_decodeCount (encodeItem := encode item) (decodeItem := decode item) ih hitems
        exact ⟨header ++ body, by simp [encode, hlength, hheader, hbody], by simp⟩
      · simp at h
    · simp at h
  | pair first second ihFirst ihSecond =>
    intro bytes value rest h
    simp only [decode] at h
    split at h
    · rename_i x tail hx
      split at h
      · rename_i y rest' hy
        simp only [Option.some.injEq, Prod.mk.injEq] at h
        obtain ⟨rfl, rfl⟩ := h
        obtain ⟨head, hhead, rfl⟩ := ihFirst hx
        obtain ⟨body, hbody, rfl⟩ := ihSecond hy
        exact ⟨head ++ body, by simp [encode, hhead, hbody], by simp⟩
      · simp at h
    · simp at h

/--
No two values share an encoding, even with other bytes after it: an encoded
value can be split off the front of a stream in only one way.
-/
theorem encode_append_inj {shape : Shape} {v w : Value} {a b rest rest' : Bytes}
    (hv : encode shape v = some a) (hw : encode shape w = some b)
    (h : a ++ rest = b ++ rest') : v = w ∧ rest = rest' := by
  have hleft := decode_encode shape rest hv
  have hright := decode_encode shape rest' hw
  rw [h, hright] at hleft
  simp only [Option.some.injEq, Prod.mk.injEq] at hleft
  exact ⟨hleft.1.symm, hleft.2.symm⟩

/-- No two values of a shape share an encoding. -/
theorem encode_injective {shape : Shape} {v w : Value} {bytes : Bytes}
    (hv : encode shape v = some bytes) (hw : encode shape w = some bytes) : v = w :=
  (encode_append_inj (rest := []) (rest' := []) hv hw rfl).1

/-- Encoding and then decoding the whole byte string returns the value. -/
theorem decodeExact_encode {shape : Shape} {value : Value} {bytes : Bytes}
    (h : encode shape value = some bytes) : decodeExact shape bytes = some value := by
  have hdecode := decode_encode shape [] h
  rw [List.append_nil] at hdecode
  simp [decodeExact, hdecode]

/--
No two byte strings decode to the same value: `decodeExact` accepts only the
bytes `encode` writes for that value.
-/
theorem encode_decodeExact {shape : Shape} {bytes : Bytes} {value : Value}
    (h : decodeExact shape bytes = some value) : encode shape value = some bytes := by
  unfold decodeExact at h
  split at h
  · rename_i decoded hdecode
    simp only [Option.some.injEq] at h
    subst h
    obtain ⟨encoded, hencoded, rfl⟩ := encode_decode shape hdecode
    simpa using hencoded
  · simp at h

theorem decodeTail_encodeTail {tail : Tail} {rest : Value} {bytes : Bytes}
    (h : encodeTail tail rest = some bytes) : decodeTail tail bytes = some rest := by
  cases tail <;> cases rest <;> simp only [encodeTail, reduceCtorEq, Option.some.injEq] at h
  · subst h
    rfl
  · subst h
    simp [decodeTail, fromUtf8_utf8]

theorem encodeTail_decodeTail {tail : Tail} {bytes : Bytes} {rest : Value}
    (h : decodeTail tail bytes = some rest) : encodeTail tail rest = some bytes := by
  cases tail with
  | bytes =>
    simp only [decodeTail, Option.some.injEq] at h
    subst h
    rfl
  | text =>
    simp only [decodeTail] at h
    split at h
    · rename_i text htext
      simp only [Option.some.injEq] at h
      subst h
      simp [encodeTail, utf8_of_fromUtf8 htext]
    · simp at h

/-- Round trip for a message that ends with a tail. -/
theorem decodeWithTail_encodeWithTail {shape : Shape} {tail : Tail} {value rest : Value}
    {bytes : Bytes} (h : encodeWithTail shape tail value rest = some bytes) :
    decodeWithTail shape tail bytes = some (value, rest) := by
  unfold encodeWithTail at h
  split at h
  · rename_i head body hhead hbody
    simp only [Option.some.injEq] at h
    subst h
    simp [decodeWithTail, decode_encode shape body hhead, decodeTail_encodeTail hbody]
  · simp at h

/-- Canonical form for a message that ends with a tail. -/
theorem encodeWithTail_decodeWithTail {shape : Shape} {tail : Tail} {bytes : Bytes}
    {value rest : Value} (h : decodeWithTail shape tail bytes = some (value, rest)) :
    encodeWithTail shape tail value rest = some bytes := by
  unfold decodeWithTail at h
  split at h
  · rename_i decoded remaining hdecode
    split at h
    · rename_i tailValue htail
      simp only [Option.some.injEq, Prod.mk.injEq] at h
      obtain ⟨rfl, rfl⟩ := h
      obtain ⟨head, hhead, rfl⟩ := encode_decode shape hdecode
      simp [encodeWithTail, hhead, encodeTail_decodeTail htail]
    · simp at h
  · simp at h

/-- No two messages that end with a tail share an encoding. -/
theorem encodeWithTail_injective {shape : Shape} {tail : Tail} {v w rest rest' : Value}
    {bytes : Bytes} (hv : encodeWithTail shape tail v rest = some bytes)
    (hw : encodeWithTail shape tail w rest' = some bytes) : v = w ∧ rest = rest' := by
  have hleft := decodeWithTail_encodeWithTail hv
  rw [decodeWithTail_encodeWithTail hw] at hleft
  simp only [Option.some.injEq, Prod.mk.injEq] at hleft
  exact ⟨hleft.1.symm, hleft.2.symm⟩

end Codec
