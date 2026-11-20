import proofs.JsString

namespace Js

theorem unitLength_append (a b : Str) : unitLength (a ++ b) = unitLength a + unitLength b := by
  induction a with
  | nil => simp [unitLength]
  | cons c rest ih => simp [unitLength, ih]; omega

theorem unitLength_replicate_zero (k : Nat) : unitLength (List.replicate k '0') = k := by
  induction k with
  | zero => rfl
  | succ k ih => simp [List.replicate_succ, unitLength, ih]; omega

theorem unitLength_eq_length {s : Str} (h : ∀ c ∈ s, c.toNat < 65536) :
    unitLength s = s.length := by
  induction s with
  | nil => rfl
  | cons c rest ih =>
    have hc := h c (by simp)
    have hrest := ih (fun d hd => h d (by simp [hd]))
    simp [unitLength, hc, hrest]; omega

theorem unitLength_padStartZero (width : Nat) (s : Str) :
    unitLength (padStartZero width s) = max width (unitLength s) := by
  simp [padStartZero, unitLength_append, unitLength_replicate_zero]; omega

theorem parseHex_append (a b : Str) :
    parseHex (a ++ b) = b.foldl (fun sofar c => 16 * sofar + hexValue c) (parseHex a) := by
  simp [parseHex]

theorem parseHex_replicate_zero (k : Nat) : parseHex (List.replicate k '0') = 0 := by
  induction k with
  | zero => rfl
  | succ k ih =>
    rw [List.replicate_succ']
    rw [parseHex_append, ih]
    rfl

theorem parseHex_padStartZero (width : Nat) (s : Str) :
    parseHex (padStartZero width s) = parseHex s := by
  unfold padStartZero
  rw [parseHex_append, parseHex_replicate_zero]
  rfl

theorem hexValue_digitChar {d : Nat} (h : d < 16) : hexValue (Nat.digitChar d) = d := by
  have all : ∀ i : Fin 16, hexValue (Nat.digitChar i.val) = i.val := by decide
  exact all ⟨d, h⟩

theorem isHexChar_digitChar {d : Nat} (h : d < 16) : isHexChar (Nat.digitChar d) = true := by
  have all : ∀ i : Fin 16, isHexChar (Nat.digitChar i.val) = true := by decide
  exact all ⟨d, h⟩

theorem toNat_digitChar_lt {d : Nat} (h : d < 16) : (Nat.digitChar d).toNat < 65536 := by
  have all : ∀ i : Fin 16, (Nat.digitChar i.val).toNat < 65536 := by decide
  exact all ⟨d, h⟩

theorem parseHex_hex (n : Nat) : parseHex (hex n) = n := by
  induction n using Nat.strongRecOn with
  | _ n ih =>
    unfold hex
    rw [Nat.toDigits_eq_ite (by decide)]
    split
    · rename_i hlt
      simp [parseHex, hexValue_digitChar hlt]
    · rename_i hge
      have hdiv := ih (n / 16) (by omega)
      unfold hex at hdiv
      rw [parseHex_append, hdiv]
      simp [hexValue_digitChar (Nat.mod_lt n (by decide : 0 < 16))]
      omega

theorem hex_injective {m n : Nat} (h : hex m = hex n) : m = n := by
  rw [← parseHex_hex m, ← parseHex_hex n, h]

theorem forall_mem_hex (n : Nat) : ∀ c ∈ hex n, isHexChar c = true ∧ c.toNat < 65536 := by
  induction n using Nat.strongRecOn with
  | _ n ih =>
    unfold hex
    rw [Nat.toDigits_eq_ite (by decide)]
    split
    · rename_i hlt
      intro c hc
      simp at hc
      subst hc
      exact ⟨isHexChar_digitChar hlt, toNat_digitChar_lt hlt⟩
    · intro c hc
      have hmod : n % 16 < 16 := Nat.mod_lt n (by decide)
      simp at hc
      cases hc with
      | inl hc => exact ih (n / 16) (by omega) c hc
      | inr hc => subst hc; exact ⟨isHexChar_digitChar hmod, toNat_digitChar_lt hmod⟩

theorem hex_ne_nil (n : Nat) : hex n ≠ [] := Nat.toDigits_ne_nil

theorem isHexString_hex (n : Nat) : isHexString (hex n) = true := by
  have hne := hex_ne_nil n
  have hall : (hex n).all isHexChar = true := by
    simp only [List.all_eq_true]
    exact fun c hc => (forall_mem_hex n c hc).1
  cases hhex : hex n with
  | nil => exact absurd hhex hne
  | cons c rest => simpa [isHexString, hhex] using hall

theorem unitLength_hex (n : Nat) : unitLength (hex n) = (hex n).length :=
  unitLength_eq_length fun c hc => (forall_mem_hex n c hc).2

theorem parseDecimal_decimal (n : Nat) : parseDecimal (decimal n) = n :=
  Nat.ofDigitChars_ten_toDigits

theorem decimal_injective {m n : Nat} (h : decimal m = decimal n) : m = n := by
  rw [← parseDecimal_decimal m, ← parseDecimal_decimal n, h]

theorem isDigit_of_mem_decimal {n : Nat} {c : Char} (h : c ∈ decimal n) : c.isDigit = true :=
  Nat.isDigit_of_mem_toDigits (by decide) (by decide) h

theorem slash_not_mem_decimal (n : Nat) : '/' ∉ decimal n :=
  fun h => absurd (isDigit_of_mem_decimal h) (by decide)

theorem quote_not_mem_decimal (n : Nat) : '\'' ∉ decimal n :=
  fun h => absurd (isDigit_of_mem_decimal h) (by decide)

theorem isDecimalString_decimal (n : Nat) : isDecimalString (decimal n) = true := by
  have hall : (decimal n).all Char.isDigit = true := by
    simp only [List.all_eq_true]
    exact fun c hc => isDigit_of_mem_decimal hc
  cases hdec : decimal n with
  | nil => exact absurd hdec Nat.toDigits_ne_nil
  | cons c rest => simpa [isDecimalString, hdec] using hall

theorem not_mem_of_isHexString {s : Str} {c : Char} (h : isHexString s = true)
    (hc : isHexChar c = false) : c ∉ s := by
  intro hmem
  simp only [isHexString, Bool.and_eq_true, List.all_eq_true] at h
  have := h.2 c hmem
  simp [hc] at this

theorem not_mem_splitOn {a : Char} {s l : Str} (h : l ∈ s.splitOn a) : a ∉ l := by
  induction s generalizing l with
  | nil => simp [List.splitOn_nil] at h; simp [h]
  | cons x rest ih =>
    rw [List.splitOn_cons_eq_ite_modifyHead] at h
    split at h
    · simp only [List.mem_cons] at h
      cases h with
      | inl h => simp [h]
      | inr h => exact ih h
    · rename_i hne
      have hnil := List.splitOn_ne_nil a rest
      cases hsplit : rest.splitOn a with
      | nil => exact absurd hsplit hnil
      | cons first others =>
        rw [hsplit] at h ih
        simp only [List.modifyHead_cons, List.mem_cons] at h
        cases h with
        | inl h =>
          subst h
          have hfirst := ih (l := first) (by simp)
          simp only [List.mem_cons, not_or]
          exact ⟨fun heq => hne (by simp [heq]), hfirst⟩
        | inr h => exact ih (by simp [h])

theorem removeFirstPair_append (a b : Char) (rest : Str) :
    removeFirstPair a b (a :: b :: rest) = rest := by
  simp [removeFirstPair]

end Js
