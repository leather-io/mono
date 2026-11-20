import format.Format

/-!
Proofs about the text-format kernel. The theorems at the end hold for every
well-formed `Shape`, so they hold for every format the TypeScript kernel can
build.
-/

namespace Format

/-! ### Cutting and joining text -/

theorem splitAll_ne_nil (sep : Char) (s : Str) : splitAll sep s ≠ [] := by
  cases s with
  | nil => simp [splitAll]
  | cons c rest =>
    simp only [splitAll]
    split
    · simp
    · split <;> simp

theorem join_cons_cons (sep : Char) (a b : Str) (rest : List Str) :
    join sep (a :: b :: rest) = a ++ sep :: join sep (b :: rest) := rfl

theorem join_splitAll (sep : Char) (s : Str) : join sep (splitAll sep s) = s := by
  induction s with
  | nil => rfl
  | cons c rest ih =>
    cases hsplit : splitAll sep rest with
    | nil => exact absurd hsplit (splitAll_ne_nil sep rest)
    | cons piece pieces =>
      rw [hsplit] at ih
      simp only [splitAll, hsplit]
      split
      · rename_i hc
        rw [join_cons_cons, ih, hc]
        rfl
      · cases pieces with
        | nil =>
          simp only [join] at ih ⊢
          rw [ih]
        | cons next more =>
          rw [join_cons_cons] at ih ⊢
          rw [List.cons_append, ih]

theorem splitAll_of_not_mem {sep : Char} {a : Str} (h : sep ∉ a) : splitAll sep a = [a] := by
  induction a with
  | nil => rfl
  | cons c a ih =>
    have hc : c ≠ sep := fun heq => h (by simp [heq])
    have ha : sep ∉ a := fun hmem => h (List.mem_cons_of_mem _ hmem)
    simp [splitAll, hc, ih ha]

theorem splitAll_append_separator {sep : Char} {a : Str} (b : Str) (h : sep ∉ a) :
    splitAll sep (a ++ sep :: b) = a :: splitAll sep b := by
  induction a with
  | nil => simp [splitAll]
  | cons c a ih =>
    have hc : c ≠ sep := fun heq => h (by simp [heq])
    have ha : sep ∉ a := fun hmem => h (List.mem_cons_of_mem _ hmem)
    simp [splitAll, hc, ih ha]

theorem splitAll_join {sep : Char} :
    ∀ (pieces : List Str), pieces ≠ [] → (∀ p ∈ pieces, sep ∉ p) →
      splitAll sep (join sep pieces) = pieces
  | [], h, _ => absurd rfl h
  | [p], _, hmem => by
    simpa [join] using splitAll_of_not_mem (hmem p (by simp))
  | p :: q :: rest, _, hmem => by
    rw [join_cons_cons, splitAll_append_separator _ (hmem p (by simp)),
      splitAll_join (q :: rest) (by simp) (fun x hx => hmem x (List.mem_cons_of_mem _ hx))]

theorem not_mem_of_mem_splitAll {sep : Char} {s p : Str} (h : p ∈ splitAll sep s) : sep ∉ p := by
  induction s generalizing p with
  | nil =>
    simp only [splitAll, List.mem_singleton] at h
    simp [h]
  | cons c rest ih =>
    cases hsplit : splitAll sep rest with
    | nil => exact absurd hsplit (splitAll_ne_nil sep rest)
    | cons piece pieces =>
      rw [hsplit] at ih
      simp only [splitAll, hsplit] at h
      split at h
      · simp only [List.mem_cons] at h
        cases h with
        | inl h => simp [h]
        | inr h => exact ih (by simpa using h)
      · rename_i hc
        simp only [List.mem_cons] at h
        cases h with
        | inl h =>
          subst h
          have hpiece := ih (p := piece) (by simp)
          simp only [List.mem_cons, not_or]
          exact ⟨fun heq => hc heq.symm, hpiece⟩
        | inr h => exact ih (by simp [h])

theorem splitFirst_append {sep : Char} {a : Str} (b : Str) (h : sep ∉ a) :
    splitFirst sep (a ++ sep :: b) = some (a, b) := by
  induction a with
  | nil => simp [splitFirst]
  | cons c a ih =>
    have hc : c ≠ sep := fun heq => h (by simp [heq])
    have ha : sep ∉ a := fun hmem => h (List.mem_cons_of_mem _ hmem)
    simp [splitFirst, hc, ih ha]

theorem splitFirst_eq_some {sep : Char} {s a b : Str} (h : splitFirst sep s = some (a, b)) :
    s = a ++ sep :: b ∧ sep ∉ a := by
  induction s generalizing a with
  | nil => simp [splitFirst] at h
  | cons c rest ih =>
    simp only [splitFirst] at h
    split at h
    · rename_i hc
      simp only [Option.some.injEq, Prod.mk.injEq] at h
      obtain ⟨rfl, rfl⟩ := h
      exact ⟨by simp [hc], by simp⟩
    · rename_i hc
      split at h
      · rename_i left right hrest
        simp only [Option.some.injEq, Prod.mk.injEq] at h
        obtain ⟨rfl, rfl⟩ := h
        obtain ⟨hsplit, hnot⟩ := ih hrest
        refine ⟨by rw [hsplit]; rfl, ?_⟩
        simp only [List.mem_cons, not_or]
        exact ⟨fun heq => hc heq.symm, hnot⟩
      · simp at h

theorem stripSuffix_append (mark : Char) (body : Str) :
    stripSuffix mark (body ++ [mark]) = some body := by
  simp [stripSuffix]

theorem stripSuffix_eq_some {mark : Char} {s body : Str} (h : stripSuffix mark s = some body) :
    s = body ++ [mark] := by
  unfold stripSuffix at h
  split at h
  · rename_i c rest hreverse
    split at h
    · rename_i hc
      simp only [Option.some.injEq] at h
      subst h hc
      have hback := congrArg List.reverse hreverse
      simpa using hback
    · simp at h
  · simp at h

theorem stripSuffix_eq_none_of_not_mem {mark : Char} {s : Str} (h : mark ∉ s) :
    stripSuffix mark s = none := by
  unfold stripSuffix
  split
  · rename_i c rest hreverse
    split
    · rename_i hc
      have hmem : c ∈ s.reverse := by rw [hreverse]; simp
      exact absurd (by simpa [hc] using hmem) h
    · rfl
  · rfl

/-! ### Digits -/

theorem digitValue_digitChar {base digit : Nat} (hbase : base ≤ 16) (h : digit < base) :
    digitValue base (digitChar digit) = some digit := by
  have hindex : ∀ d, d < 16 → digitChars.idxOf (digitChar d) = d := by decide
  have hdigit := hindex digit (by omega)
  simp only [digitValue, hdigit]
  split
  · rfl
  · rename_i hnot
    exact absurd ⟨h, by omega⟩ hnot

theorem mem_of_idxOf_lt {c : Char} {l : Str} (h : l.idxOf c < l.length) : c ∈ l := by
  induction l with
  | nil => simp at h
  | cons x rest ih =>
    by_cases hx : x = c
    · simp [hx]
    · have hrest : rest.idxOf c < rest.length := by
        simp only [List.idxOf_cons, List.length_cons] at h
        have hbeq : (x == c) = false := by simp [hx]
        rw [hbeq] at h
        simpa using h
      exact List.mem_cons_of_mem _ (ih hrest)

theorem digitChar_of_digitValue {base : Nat} {c : Char} {digit : Nat}
    (h : digitValue base c = some digit) : digitChar digit = c ∧ digit < base := by
  unfold digitValue at h
  split at h
  · rename_i hlt
    simp only [Option.some.injEq] at h
    subst h
    refine ⟨?_, hlt.1⟩
    have hmem : c ∈ digitChars := mem_of_idxOf_lt (by simpa [digitChars] using hlt.2)
    simp only [digitChars, List.mem_cons, List.not_mem_nil, or_false] at hmem
    obtain rfl | rfl | rfl | rfl | rfl | rfl | rfl | rfl | rfl | rfl | rfl | rfl | rfl | rfl | rfl | rfl :=
      hmem <;> rfl
  · simp at h

theorem leDigits_length (base width n : Nat) : (leDigits base width n).length = width := by
  induction width generalizing n with
  | zero => rfl
  | succ width ih => simp [leDigits, ih]

theorem fromLE_leDigits {base : Nat} (hlow : 2 ≤ base) (hhigh : base ≤ 16) {width n : Nat}
    (h : n < base ^ width) : fromLE base (leDigits base width n) = some n := by
  induction width generalizing n with
  | zero =>
    have hzero : n = 0 := by simpa using h
    subst hzero
    rfl
  | succ width ih =>
    have hmod : n % base < base := Nat.mod_lt _ (by omega)
    have hdiv : n / base < base ^ width := by
      rw [Nat.pow_succ, Nat.mul_comm] at h
      exact Nat.div_lt_of_lt_mul h
    simp only [leDigits, fromLE, digitValue_digitChar hhigh hmod, ih hdiv]
    rw [Nat.mod_add_div]

theorem leDigits_zero (base count : Nat) : leDigits base count 0 = List.replicate count '0' := by
  induction count with
  | zero => rfl
  | succ count ih =>
    simp only [leDigits, Nat.zero_mod, Nat.zero_div, ih, List.replicate_succ]
    rfl

theorem leDigits_fromLE {base : Nat} (hlow : 2 ≤ base) (padding : Nat) :
    ∀ {digits : Str} {n : Nat}, fromLE base digits = some n →
      leDigits base (digits.length + padding) n = digits ++ List.replicate padding '0'
  | [], n, h => by
    simp only [fromLE, Option.some.injEq] at h
    subst h
    simpa using leDigits_zero base padding
  | c :: rest, n, h => by
    simp only [fromLE] at h
    split at h
    · rename_i digit higher hdigit hhigher
      simp only [Option.some.injEq] at h
      subst h
      obtain ⟨hchar, hlt⟩ := digitChar_of_digitValue hdigit
      have hmod : (digit + base * higher) % base = digit := by
        rw [Nat.add_mul_mod_self_left]
        exact Nat.mod_eq_of_lt hlt
      have hdiv : (digit + base * higher) / base = higher := by
        rw [Nat.add_mul_div_left _ _ (by omega : 0 < base), Nat.div_eq_of_lt hlt, Nat.zero_add]
      have ih := leDigits_fromLE hlow padding hhigher
      rw [show (c :: rest).length + padding = (rest.length + padding) + 1 by
        simp only [List.length_cons]; omega]
      simp only [leDigits, hmod, hdiv, hchar, ih, List.cons_append]
    · simp at h

theorem fromLE_lt {base : Nat} :
    ∀ {digits : Str} {n : Nat}, fromLE base digits = some n → n < base ^ digits.length
  | [], n, h => by
    simp only [fromLE, Option.some.injEq] at h
    subst h
    simp
  | c :: rest, n, h => by
    simp only [fromLE] at h
    split at h
    · rename_i digit higher hdigit hhigher
      simp only [Option.some.injEq] at h
      subst h
      obtain ⟨_, hlt⟩ := digitChar_of_digitValue hdigit
      have hhigherLt := fromLE_lt hhigher
      have hmul : base * (higher + 1) ≤ base * base ^ rest.length :=
        Nat.mul_le_mul_left _ hhigherLt
      rw [Nat.mul_succ] at hmul
      rw [List.length_cons, Nat.pow_succ, Nat.mul_comm (base ^ rest.length) base]
      omega
    · simp at h

theorem fromLE_replicate_zero {base : Nat} (hlow : 2 ≤ base) (count : Nat) :
    fromLE base (List.replicate count '0') = some 0 := by
  induction count with
  | zero => rfl
  | succ count ih =>
    have hzero : digitValue base '0' = some 0 := by
      have hindex : digitChars.idxOf '0' = 0 := by decide
      simp only [digitValue, hindex]
      split
      · rfl
      · rename_i hnot
        exact absurd ⟨by omega, by omega⟩ hnot
    simp [List.replicate_succ, fromLE, hzero, ih]

theorem fromLE_append_zeros {base : Nat} (hlow : 2 ≤ base) (count : Nat) (digits : Str) :
    fromLE base (digits ++ List.replicate count '0') = fromLE base digits := by
  induction digits with
  | nil => simpa [fromLE] using fromLE_replicate_zero hlow count
  | cons c rest ih => simp [fromLE, ih]

/-! ### Numbers -/

theorem dropWhile_zero_replicate_append (count : Nat) (s : Str) :
    (List.replicate count '0' ++ s).dropWhile (· == '0') = s.dropWhile (· == '0') := by
  induction count with
  | zero => rfl
  | succ count ih => simp [List.replicate_succ, ih]

theorem stripZeros_replicate_append (count : Nat) (s : Str) :
    stripZeros (List.replicate count '0' ++ s) = stripZeros s := by
  simp only [stripZeros, dropWhile_zero_replicate_append]

theorem eq_replicate_append_dropWhile (s : Str) :
    ∃ count, s = List.replicate count '0' ++ s.dropWhile (· == '0') := by
  induction s with
  | nil => exact ⟨0, rfl⟩
  | cons c rest ih =>
    by_cases hc : c = '0'
    · obtain ⟨count, hcount⟩ := ih
      refine ⟨count + 1, ?_⟩
      subst hc
      have hdrop : ('0' :: rest).dropWhile (· == '0') = rest.dropWhile (· == '0') := by
        simp
      rw [hdrop, List.replicate_succ, List.cons_append, ← hcount]
    · exact ⟨0, by simp [hc]⟩

theorem dropWhile_dropWhile_zero (s : Str) :
    (s.dropWhile (· == '0')).dropWhile (· == '0') = s.dropWhile (· == '0') := by
  induction s with
  | nil => rfl
  | cons c rest ih =>
    by_cases hc : c = '0'
    · subst hc
      simpa using ih
    · simp [hc]

theorem stripZeros_stripZeros (s : Str) : stripZeros (stripZeros s) = stripZeros s := by
  have hdropTwice := dropWhile_dropWhile_zero s
  unfold stripZeros
  cases hdrop : s.dropWhile (· == '0') with
  | nil => rfl
  | cons c rest =>
    rw [hdrop] at hdropTwice
    simp only [hdropTwice]

theorem stripZeros_length_le (s : Str) (h : 1 ≤ s.length) : (stripZeros s).length ≤ s.length := by
  obtain ⟨count, hcount⟩ := eq_replicate_append_dropWhile s
  have hlength := congrArg List.length hcount
  simp only [List.length_append, List.length_replicate] at hlength
  unfold stripZeros
  cases hdrop : s.dropWhile (· == '0') with
  | nil => simpa using h
  | cons c rest =>
    rw [hdrop] at hlength
    simp only [List.length_cons] at hlength ⊢
    omega

theorem mem_stripZeros {s : Str} {c : Char} (h : c ∈ stripZeros s) : c = '0' ∨ c ∈ s := by
  obtain ⟨count, hcount⟩ := eq_replicate_append_dropWhile s
  unfold stripZeros at h
  cases hdrop : s.dropWhile (· == '0') with
  | nil =>
    rw [hdrop] at h
    exact Or.inl (by simpa using h)
  | cons d rest =>
    rw [hdrop] at h hcount
    exact Or.inr (by rw [hcount]; exact List.mem_append_right _ h)

theorem digitsValue_stripZeros {base : Nat} (hlow : 2 ≤ base) {s : Str} {n : Nat}
    (h : digitsValue base s = some n) : digitsValue base (stripZeros s) = some n := by
  obtain ⟨count, hcount⟩ := eq_replicate_append_dropWhile s
  have hvalue : fromLE base (s.dropWhile (· == '0')).reverse = some n := by
    unfold digitsValue at h
    rw [hcount, List.reverse_append, List.reverse_replicate, fromLE_append_zeros hlow] at h
    exact h
  unfold digitsValue stripZeros
  cases hdrop : s.dropWhile (· == '0') with
  | nil =>
    rw [hdrop] at hvalue
    simp only [List.reverse_nil, fromLE, Option.some.injEq] at hvalue
    subst hvalue
    exact fromLE_replicate_zero hlow 1
  | cons c rest =>
    rw [hdrop] at hvalue
    exact hvalue

theorem digitsValue_fixedDigits {base : Nat} (hlow : 2 ≤ base) (hhigh : base ≤ 16)
    {width n : Nat} (h : n < base ^ width) :
    digitsValue base (fixedDigits base width n) = some n := by
  simp [digitsValue, fixedDigits, fromLE_leDigits hlow hhigh h]

theorem fixedDigits_digitsValue {base : Nat} (hlow : 2 ≤ base) (padding : Nat) {s : Str}
    {n : Nat} (h : digitsValue base s = some n) :
    fixedDigits base (s.length + padding) n = List.replicate padding '0' ++ s := by
  have hdigits := leDigits_fromLE hlow padding (digits := s.reverse) h
  rw [List.length_reverse] at hdigits
  simp [fixedDigits, hdigits]

theorem safeValue_eq_some {base : Nat} {s : Str} {n : Nat} :
    safeValue base s = some n ↔ digitsValue base s = some n ∧ n ≤ maxSafeInteger := by
  unfold safeValue
  cases hvalue : digitsValue base s with
  | none => simp
  | some m =>
    by_cases hsafe : m ≤ maxSafeInteger
    · simp only [hsafe, ite_true, Option.some.injEq]
      exact ⟨fun h => ⟨h, h ▸ hsafe⟩, fun h => h.1⟩
    · simp only [hsafe, ite_false, Option.some.injEq]
      exact ⟨fun h => by simp at h, fun h => absurd (h.1 ▸ h.2) hsafe⟩

theorem parseNumber_printNumber {base : Nat} (hlow : 2 ≤ base) (hhigh : base ≤ 16)
    {width : Option Nat} {n : Nat} {s : Str} (h : printNumber base width n = some s) :
    parseNumber base width s = some n := by
  cases width with
  | some width =>
    simp only [printNumber] at h
    split at h
    · rename_i hn
      simp only [Option.some.injEq] at h
      subst h
      have hvalue := safeValue_eq_some.mpr ⟨digitsValue_fixedDigits hlow hhigh hn.1, hn.2⟩
      have hlength : (fixedDigits base width n).length = width := by
        simp [fixedDigits, leDigits_length]
      simp [parseNumber, hlength, hvalue]
    · simp at h
  | none =>
    simp only [printNumber] at h
    split at h
    · rename_i hsafe
      simp only [Option.some.injEq] at h
      subst h
      have hpow : n < base ^ maxDigits := by
        have hle : 2 ^ maxDigits ≤ base ^ maxDigits := Nat.pow_le_pow_left hlow _
        unfold maxSafeInteger at hsafe
        unfold maxDigits at hle ⊢
        omega
      have hvalue := safeValue_eq_some.mpr
        ⟨digitsValue_stripZeros hlow (digitsValue_fixedDigits hlow hhigh hpow), hsafe⟩
      have hlength : (stripZeros (fixedDigits base maxDigits n)).length ≤ maxDigits := by
        have hle := stripZeros_length_le (fixedDigits base maxDigits n)
          (by simp [fixedDigits, leDigits_length, maxDigits])
        simpa [fixedDigits, leDigits_length] using hle
      simp [parseNumber, hlength, stripZeros_stripZeros, hvalue]
    · simp at h

theorem printNumber_parseNumber {base : Nat} (hlow : 2 ≤ base) {width : Option Nat} {s : Str}
    {n : Nat} (h : parseNumber base width s = some n) : printNumber base width n = some s := by
  cases width with
  | some width =>
    simp only [parseNumber] at h
    split at h
    · rename_i hlength
      obtain ⟨hvalue, hsafe⟩ := safeValue_eq_some.mp h
      have hlt := fromLE_lt (digits := s.reverse) hvalue
      have hfixed := fixedDigits_digitsValue hlow 0 hvalue
      simp only [List.length_reverse, Nat.add_zero, List.replicate_zero, List.nil_append]
        at hlt hfixed
      rw [hlength] at hlt hfixed
      simp [printNumber, hlt, hsafe, hfixed]
    · simp at h
  | none =>
    simp only [parseNumber] at h
    split at h
    · rename_i hcanonical
      obtain ⟨hvalue, hsafe⟩ := safeValue_eq_some.mp h
      have hfixed := fixedDigits_digitsValue hlow (maxDigits - s.length) hvalue
      rw [show s.length + (maxDigits - s.length) = maxDigits by omega] at hfixed
      simp [printNumber, hsafe, hfixed, stripZeros_replicate_append, hcanonical.2]
    · simp at h

theorem digitChar_mem_take {base digit : Nat} (hhigh : base ≤ 16) (h : digit < base) :
    (digitChars.take base).contains (digitChar digit) = true := by
  have hall : ∀ b, b < 17 → ∀ d, d < b → (digitChars.take b).contains (digitChar d) = true := by
    decide
  exact hall base (by omega) digit h

theorem mem_leDigits {base : Nat} (hlow : 2 ≤ base) {width n : Nat} {c : Char}
    (h : c ∈ leDigits base width n) : ∃ digit, digit < base ∧ c = digitChar digit := by
  induction width generalizing n with
  | zero => simp [leDigits] at h
  | succ width ih =>
    simp only [leDigits, List.mem_cons] at h
    cases h with
    | inl h => exact ⟨n % base, Nat.mod_lt _ (by omega), h⟩
    | inr h => exact ih h

theorem alphabet_printNumber {base : Nat} (hlow : 2 ≤ base) (hhigh : base ≤ 16)
    {width : Option Nat} {n : Nat} {s : Str} (h : printNumber base width n = some s) :
    ∀ c ∈ s, (digitChars.take base).contains c = true := by
  have hfixed : ∀ (width : Nat) (c : Char), c ∈ fixedDigits base width n →
      (digitChars.take base).contains c = true := by
    intro width c hc
    obtain ⟨digit, hdigit, rfl⟩ := mem_leDigits hlow (List.mem_reverse.mp hc)
    exact digitChar_mem_take hhigh hdigit
  intro c hc
  cases width with
  | some width =>
    simp only [printNumber] at h
    split at h
    · simp only [Option.some.injEq] at h
      subst h
      exact hfixed width c hc
    · simp at h
  | none =>
    simp only [printNumber] at h
    split at h
    · simp only [Option.some.injEq] at h
      subst h
      cases mem_stripZeros hc with
      | inl hzero =>
        subst hzero
        exact digitChar_mem_take (digit := 0) hhigh (by omega)
      | inr hmem => exact hfixed maxDigits c hmem
    · simp at h

/-! ### Lists of items -/

theorem parseEach_printEach {printItem : Value → Option Str} {parseItem : Str → Option Value}
    (hitem : ∀ {item : Value} {text : Str}, printItem item = some text → parseItem text = some item) :
    ∀ {items : List Value} {pieces : List Str}, printEach printItem items = some pieces →
      parseEach parseItem pieces = some items ∧ pieces.length = items.length
  | [], pieces, h => by
    simp only [printEach, Option.some.injEq] at h
    subst h
    exact ⟨rfl, rfl⟩
  | item :: items, pieces, h => by
    simp only [printEach] at h
    split at h
    · rename_i head tail hhead htail
      simp only [Option.some.injEq] at h
      subst h
      obtain ⟨hrest, hlength⟩ := parseEach_printEach hitem htail
      exact ⟨by simp [parseEach, hitem hhead, hrest], by simp [hlength]⟩
    · simp at h

theorem printEach_parseEach {printItem : Value → Option Str} {parseItem : Str → Option Value}
    (hitem : ∀ {text : Str} {item : Value}, parseItem text = some item → printItem item = some text) :
    ∀ {pieces : List Str} {items : List Value}, parseEach parseItem pieces = some items →
      printEach printItem items = some pieces ∧ items.length = pieces.length
  | [], items, h => by
    simp only [parseEach, Option.some.injEq] at h
    subst h
    exact ⟨rfl, rfl⟩
  | piece :: pieces, items, h => by
    simp only [parseEach] at h
    split at h
    · rename_i head tail hhead htail
      simp only [Option.some.injEq] at h
      subst h
      obtain ⟨hrest, hlength⟩ := printEach_parseEach hitem htail
      exact ⟨by simp [printEach, hitem hhead, hrest], by simp [hlength]⟩
    · simp at h

theorem exists_of_mem_printEach {printItem : Value → Option Str} :
    ∀ {items : List Value} {pieces : List Str}, printEach printItem items = some pieces →
      ∀ piece ∈ pieces, ∃ item, printItem item = some piece
  | [], pieces, h => by
    simp only [printEach, Option.some.injEq] at h
    subst h
    simp
  | item :: items, pieces, h => by
    simp only [printEach] at h
    split at h
    · rename_i head tail hhead htail
      simp only [Option.some.injEq] at h
      subst h
      intro piece hpiece
      simp only [List.mem_cons] at hpiece
      cases hpiece with
      | inl hpiece => exact ⟨item, hpiece ▸ hhead⟩
      | inr hpiece => exact exists_of_mem_printEach htail piece hpiece
    · simp at h

theorem mem_join {sep c : Char} :
    ∀ {pieces : List Str}, c ∈ join sep pieces → c = sep ∨ ∃ piece ∈ pieces, c ∈ piece
  | [], h => by simp [join] at h
  | [piece], h => Or.inr ⟨piece, by simp, by simpa [join] using h⟩
  | piece :: next :: rest, h => by
    rw [join_cons_cons, List.mem_append, List.mem_cons] at h
    rcases h with h | h | h
    · exact Or.inr ⟨piece, by simp, h⟩
    · exact Or.inl h
    · rcases mem_join h with hsep | ⟨other, hother, hc⟩
      · exact Or.inl hsep
      · exact Or.inr ⟨other, List.mem_cons_of_mem _ hother, hc⟩

/-! ### Every well-formed shape -/

/-- A format prints only characters from its alphabet. -/
theorem alphabet_of_print (shape : Shape) :
    wellFormed shape = true → ∀ {value : Value} {text : Str},
      print shape value = some text → ∀ c ∈ text, alphabet shape c = true := by
  induction shape with
  | number base width =>
    intro hwf value text h c hc
    simp only [wellFormed, Bool.and_eq_true, decide_eq_true_eq] at hwf
    cases value <;> simp only [print, reduceCtorEq] at h
    exact alphabet_printNumber hwf.1.1 hwf.1.2 h c hc
  | chars set minLength maxLength =>
    intro _ value text h c hc
    cases value <;> simp only [print, reduceCtorEq] at h
    split at h
    · rename_i hvalid
      simp only [Option.some.injEq] at h
      subst h
      exact List.all_eq_true.mp hvalid.1 c hc
    · simp at h
  | prefixed expected inner ih =>
    intro hwf value text h c hc
    simp only [wellFormed] at hwf
    simp only [print] at h
    split at h
    · rename_i body hbody
      simp only [Option.some.injEq] at h
      subst h
      simp only [alphabet, Bool.or_eq_true, List.contains_iff_mem]
      cases List.mem_append.mp hc with
      | inl hleft => exact Or.inl hleft
      | inr hright => exact Or.inr (ih hwf hbody c hright)
    · simp at h
  | optionalSuffix mark inner ih =>
    intro hwf value text h c hc
    simp only [wellFormed, Bool.and_eq_true] at hwf
    cases value with
    | pair first second =>
      cases second with
      | bool flag =>
        simp only [print] at h
        split at h
        · rename_i body hbody
          simp only [Option.some.injEq] at h
          subst h
          simp only [alphabet, Bool.or_eq_true, beq_iff_eq]
          cases flag with
          | true =>
            simp only [↓reduceIte, List.mem_append, List.mem_singleton] at hc
            cases hc with
            | inl hleft => exact Or.inr (ih hwf.2 hbody c hleft)
            | inr hright => exact Or.inl hright
          | false => exact Or.inr (ih hwf.2 hbody c (by simpa using hc))
        · simp at h
      | _ => simp [print] at h
    | _ => simp [print] at h
  | separated separator minCount item ih =>
    intro hwf value text h c hc
    simp only [wellFormed, Bool.and_eq_true] at hwf
    cases value <;> simp only [print, reduceCtorEq] at h
    split at h
    · simp at h
    · split at h
      · rename_i pieces hpieces
        simp only [Option.some.injEq] at h
        subst h
        simp only [alphabet, Bool.or_eq_true, beq_iff_eq]
        rcases mem_join hc with hsep | ⟨piece, hpiece, hmem⟩
        · exact Or.inl hsep
        · obtain ⟨element, helement⟩ := exists_of_mem_printEach hpieces piece hpiece
          exact Or.inr (ih hwf.2 helement c hmem)
      · simp at h
  | split separator first second ihFirst ihSecond =>
    intro hwf value text h c hc
    simp only [wellFormed, Bool.and_eq_true] at hwf
    cases value <;> simp only [print, reduceCtorEq] at h
    split at h
    · rename_i left right hleft hright
      simp only [Option.some.injEq] at h
      subst h
      simp only [alphabet, Bool.or_eq_true, beq_iff_eq]
      rw [List.mem_append, List.mem_cons] at hc
      rcases hc with hc | hc | hc
      · exact Or.inl (Or.inr (ihFirst hwf.1.2 hleft c hc))
      · exact Or.inl (Or.inl hc)
      · exact Or.inr (ihSecond hwf.2 hright c hc)
    · simp at h

theorem not_mem_of_alphabet_false {shape : Shape} (hwf : wellFormed shape = true) {value : Value}
    {text : Str} (h : print shape value = some text) {c : Char} (hc : alphabet shape c = false) :
    c ∉ text := by
  intro hmem
  rw [alphabet_of_print shape hwf h c hmem] at hc
  exact Bool.noConfusion hc

/-- Round trip. Whatever `print` writes, `parse` reads back as the same value. -/
theorem parse_print (shape : Shape) :
    wellFormed shape = true → ∀ {value : Value} {text : Str},
      print shape value = some text → parse shape text = some value := by
  induction shape with
  | number base width =>
    intro hwf value text h
    simp only [wellFormed, Bool.and_eq_true, decide_eq_true_eq] at hwf
    cases value <;> simp only [print, reduceCtorEq] at h
    simp [parse, parseNumber_printNumber hwf.1.1 hwf.1.2 h]
  | chars set minLength maxLength =>
    intro _ value text h
    cases value <;> simp only [print, reduceCtorEq] at h
    split at h
    · rename_i hvalid
      simp only [Option.some.injEq] at h
      subst h
      simp only [parse]
      split
      · rfl
      · rename_i hnot
        exact absurd hvalid hnot
    · simp at h
  | prefixed expected inner ih =>
    intro hwf value text h
    simp only [wellFormed] at hwf
    simp only [print] at h
    split at h
    · rename_i body hbody
      simp only [Option.some.injEq] at h
      subst h
      simp [parse, ih hwf hbody]
    · simp at h
  | optionalSuffix mark inner ih =>
    intro hwf value text h
    simp only [wellFormed, Bool.and_eq_true, Bool.not_eq_true'] at hwf
    cases value with
    | pair first second =>
      cases second with
      | bool flag =>
        simp only [print] at h
        split at h
        · rename_i body hbody
          simp only [Option.some.injEq] at h
          subst h
          cases flag with
          | true => simp [parse, stripSuffix_append, ih hwf.2 hbody]
          | false =>
            have hnone := stripSuffix_eq_none_of_not_mem
              (not_mem_of_alphabet_false hwf.2 hbody hwf.1)
            simp [parse, hnone, ih hwf.2 hbody]
        · simp at h
      | _ => simp [print] at h
    | _ => simp [print] at h
  | separated separator minCount item ih =>
    intro hwf value text h
    simp only [wellFormed, Bool.and_eq_true, Bool.not_eq_true'] at hwf
    cases value <;> simp only [print, reduceCtorEq] at h
    split at h
    · simp at h
    · rename_i items hcount
      split at h
      · rename_i pieces hpieces
        simp only [Option.some.injEq] at h
        subst h
        obtain ⟨hparsed, hlength⟩ :=
          parseEach_printEach (printItem := print item) (parseItem := parse item) (ih hwf.2) hpieces
        have hnonempty : pieces ≠ [] := by
          intro hnil
          rw [hnil] at hlength
          exact hcount (Or.inl (List.length_eq_zero_iff.mp hlength.symm))
        have hclean : ∀ piece ∈ pieces, separator ∉ piece := by
          intro piece hpiece
          obtain ⟨element, helement⟩ := exists_of_mem_printEach hpieces piece hpiece
          exact not_mem_of_alphabet_false hwf.2 helement hwf.1
        have hsmall : ¬ items.length < minCount := fun hlt => hcount (Or.inr hlt)
        simp [parse, splitAll_join pieces hnonempty hclean, hparsed, hsmall]
      · simp at h
  | split separator first second ihFirst ihSecond =>
    intro hwf value text h
    simp only [wellFormed, Bool.and_eq_true, Bool.not_eq_true'] at hwf
    cases value <;> simp only [print, reduceCtorEq] at h
    split at h
    · rename_i left right hleft hright
      simp only [Option.some.injEq] at h
      subst h
      have hcut := splitFirst_append right (not_mem_of_alphabet_false hwf.1.2 hleft hwf.1.1)
      simp [parse, hcut, ihFirst hwf.1.2 hleft, ihSecond hwf.2 hright]
    · simp at h

/--
Canonical form. Whatever `parse` accepts is exactly what `print` writes for
the value it returned, so a value has one accepted text form and no other.
-/
theorem print_parse (shape : Shape) :
    wellFormed shape = true → ∀ {text : Str} {value : Value},
      parse shape text = some value → print shape value = some text := by
  induction shape with
  | number base width =>
    intro hwf text value h
    simp only [wellFormed, Bool.and_eq_true, decide_eq_true_eq] at hwf
    simp only [parse] at h
    split at h
    · rename_i n hn
      simp only [Option.some.injEq] at h
      subst h
      simpa [print] using printNumber_parseNumber hwf.1.1 hn
    · simp at h
  | chars set minLength maxLength =>
    intro _ text value h
    simp only [parse] at h
    split at h
    · rename_i hvalid
      simp only [Option.some.injEq] at h
      subst h
      simp only [print]
      split
      · rfl
      · rename_i hnot
        exact absurd hvalid hnot
    · simp at h
  | prefixed expected inner ih =>
    intro hwf text value h
    simp only [wellFormed] at hwf
    simp only [parse] at h
    split at h
    · rename_i hprefix
      have hbody := ih hwf h
      have htext : expected ++ text.drop expected.length = text := by
        have hsplit := List.take_append_drop expected.length text
        rw [hprefix] at hsplit
        exact hsplit
      simp [print, hbody, htext]
    · simp at h
  | optionalSuffix mark inner ih =>
    intro hwf text value h
    simp only [wellFormed, Bool.and_eq_true, Bool.not_eq_true'] at hwf
    simp only [parse] at h
    split at h
    · rename_i body hstrip
      split at h
      · rename_i inner' hinner
        simp only [Option.some.injEq] at h
        subst h
        simp [print, ih hwf.2 hinner, stripSuffix_eq_some hstrip]
      · simp at h
    · split at h
      · rename_i inner' hinner
        simp only [Option.some.injEq] at h
        subst h
        simp [print, ih hwf.2 hinner]
      · simp at h
  | separated separator minCount item ih =>
    intro hwf text value h
    simp only [wellFormed, Bool.and_eq_true, Bool.not_eq_true'] at hwf
    simp only [parse] at h
    split at h
    · rename_i items hitems
      split at h
      · simp at h
      · rename_i hcount
        simp only [Option.some.injEq] at h
        subst h
        obtain ⟨hprinted, hlength⟩ :=
          printEach_parseEach (printItem := print item) (parseItem := parse item) (ih hwf.2) hitems
        have hnonempty : items ≠ [] := by
          intro hnil
          rw [hnil] at hlength
          exact splitAll_ne_nil separator text (List.length_eq_zero_iff.mp hlength.symm)
        simp [print, hnonempty, hcount, hprinted, join_splitAll]
    · simp at h
  | split separator first second ihFirst ihSecond =>
    intro hwf text value h
    simp only [wellFormed, Bool.and_eq_true, Bool.not_eq_true'] at hwf
    simp only [parse] at h
    split at h
    · rename_i left right hcut
      split at h
      · rename_i x y hx hy
        simp only [Option.some.injEq] at h
        subst h
        simp [print, ihFirst hwf.1.2 hx, ihSecond hwf.2 hy, (splitFirst_eq_some hcut).1]
      · simp at h
    · simp at h

/-- No two values of a format share a text form. -/
theorem print_injective {shape : Shape} (hwf : wellFormed shape = true) {v w : Value} {text : Str}
    (hv : print shape v = some text) (hw : print shape w = some text) : v = w := by
  have hleft := parse_print shape hwf hv
  rw [parse_print shape hwf hw] at hleft
  exact (Option.some.inj hleft).symm

/-- No two strings parse to the same value. -/
theorem parse_injective {shape : Shape} (hwf : wellFormed shape = true) {s t : Str} {value : Value}
    (hs : parse shape s = some value) (ht : parse shape t = some value) : s = t := by
  have hleft := print_parse shape hwf hs
  rw [print_parse shape hwf ht] at hleft
  exact (Option.some.inj hleft).symm

end Format
