import DerivationPathUtils
import proofs.JsStringProofs

namespace DerivationPathUtils

open Js

theorem segments_ne_nil (path : Str) : segments path ≠ [] :=
  List.splitOn_ne_nil '/' path

theorem segments_joinSegments {parts : List Str} (hparts : ∀ part ∈ parts, '/' ∉ part)
    (hne : parts ≠ []) : segments (joinSegments parts) = parts :=
  List.splitOn_intercalate '/' hparts hne

theorem joinSegments_segments (path : Str) : joinSegments (segments path) = path :=
  List.intercalate_splitOn '/'

theorem parseIntOrThrow_decimal {n : Nat} (hn : n ≤ maxSafeInteger) :
    parseIntOrThrow (decimal n) = .ok n := by
  simp [parseIntOrThrow, isDecimalString_decimal, parseDecimal_decimal, hn]

theorem filter_quote_decimal (n : Nat) : (decimal n).filter (· != '\'') = decimal n := by
  rw [List.filter_eq_self]
  intro c hc
  have hquote := quote_not_mem_decimal n
  simp only [bne_iff_ne, ne_eq]
  intro heq
  exact hquote (heq ▸ hc)

/-- A plain decimal segment reads back as its number. -/
theorem extractSection_of_decimal {depth n : Nat} {path : Str} (hn : n ≤ maxSafeInteger)
    (hsegment : (segments path)[depth]? = some (decimal n)) : extractSection depth path = .ok n := by
  unfold extractSection
  rw [hsegment]
  cases hdec : decimal n with
  | nil => exact absurd hdec Nat.toDigits_ne_nil
  | cons c rest =>
    simp only
    rw [← hdec, filter_quote_decimal, parseIntOrThrow_decimal hn]

/-- A hardened segment such as `84'` reads back as its number. -/
theorem extractSection_of_hardened {depth n : Nat} {path : Str} (hn : n ≤ maxSafeInteger)
    (hsegment : (segments path)[depth]? = some (decimal n ++ ['\''])) :
    extractSection depth path = .ok n := by
  unfold extractSection
  rw [hsegment]
  have hfilter : (decimal n ++ ['\'']).filter (· != '\'') = decimal n := by
    simp [List.filter_append, filter_quote_decimal]
  cases hdec : decimal n with
  | nil => exact absurd hdec Nat.toDigits_ne_nil
  | cons c rest =>
    simp only [List.cons_append]
    rw [← List.cons_append, ← hdec, hfilter, parseIntOrThrow_decimal hn]

/-- What `appendAddressIndexToPath` appends is what the extractors read back. -/
theorem extract_appendAddressIndexToPath {path extended : Str} {change addressIndex : Nat}
    (hlength : (segments path).length = 4)
    (h : appendAddressIndexToPath path change addressIndex = .ok extended) :
    extractChangeIndexFromPath extended = .ok change ∧
      extractAddressIndexFromPath extended = .ok addressIndex := by
  unfold appendAddressIndexToPath at h
  split at h
  · rename_i hbounds
    obtain ⟨_, _, hextended⟩ := Outcome.bind_eq_ok h
    simp only [Outcome.pure_eq_ok, Outcome.ok.injEq] at hextended
    have hsegments : segments extended = segments path ++ [decimal change, decimal addressIndex] := by
      rw [← hextended]
      unfold segments
      rw [List.splitOn_append_cons_self,
        List.splitOn_append_cons_self_of_not_mem (slash_not_mem_decimal change),
        List.splitOn_eq_singleton (slash_not_mem_decimal addressIndex)]
    constructor
    · apply extractSection_of_decimal hbounds.1
      rw [hsegments, List.getElem?_append_right (by omega)]
      simp [hlength]
    · apply extractSection_of_decimal hbounds.2
      rw [hsegments, List.getElem?_append_right (by omega)]
      simp [hlength]
  · cases h

theorem slash_not_mem_of_isHexString {s : Str} (h : isHexString s = true) : '/' ∉ s :=
  not_mem_of_isHexString h (by decide)

theorem segments_keyOrigin {fingerprint rest : Str} (h : isHexString fingerprint = true) :
    segments (fingerprint ++ '/' :: rest) = fingerprint :: segments rest :=
  List.splitOn_append_cons_self_of_not_mem (slash_not_mem_of_isHexString h) rest

/-- Building a key origin path and converting it back returns the derivation path. -/
theorem keyOriginToDerivationPath_createKeyOriginPath {fingerprint rest keyOrigin : Str}
    (h : createKeyOriginPath fingerprint ('m' :: '/' :: rest) = .ok keyOrigin) :
    keyOriginToDerivationPath keyOrigin = 'm' :: '/' :: rest := by
  unfold createKeyOriginPath at h
  split at h
  · rename_i hhex
    simp only [removeFirstPair_append, Outcome.ok.injEq] at h
    subst h
    simp [keyOriginToDerivationPath, segments_keyOrigin hhex, joinSegments_segments]
  · cases h

theorem extractFingerprint_createKeyOriginPath {fingerprint path keyOrigin : Str}
    (h : createKeyOriginPath fingerprint path = .ok keyOrigin) :
    extractFingerprintFromKeyOriginPath keyOrigin = .ok fingerprint := by
  unfold createKeyOriginPath at h
  split at h
  · rename_i hhex
    simp only [Outcome.ok.injEq] at h
    subst h
    simp [extractFingerprintFromKeyOriginPath, segments_keyOrigin hhex, hhex]
  · cases h

theorem no_brackets_of_validateKeyOriginPath {keyOriginPath : Str} {result : Bool}
    (h : validateKeyOriginPath keyOriginPath = .ok result) :
    '[' ∉ keyOriginPath ∧ ']' ∉ keyOriginPath := by
  unfold validateKeyOriginPath at h
  split at h
  · cases h
  · rename_i hbrackets
    simpa using hbrackets

theorem descriptor_of_createDescriptor {keyOriginPath key descriptor : Str}
    (h : createDescriptor keyOriginPath key = .ok descriptor) :
    descriptor = '[' :: (keyOriginPath ++ ']' :: key) ∧
      ∃ result, validateKeyOriginPath keyOriginPath = .ok result := by
  unfold createDescriptor at h
  obtain ⟨result, hvalid, hdescriptor⟩ := Outcome.bind_eq_ok h
  simp only [Outcome.pure_eq_ok, Outcome.ok.injEq] at hdescriptor
  exact ⟨hdescriptor.symm, result, hvalid⟩

theorem splitOn_bracket_descriptor {keyOriginPath key : Str} (hclose : ']' ∉ keyOriginPath) :
    ('[' :: (keyOriginPath ++ ']' :: key)).splitOn ']' =
      ('[' :: keyOriginPath) :: key.splitOn ']' := by
  have hprefix : ']' ∉ '[' :: keyOriginPath := by
    simp only [List.mem_cons, not_or]
    exact ⟨by decide, hclose⟩
  rw [← List.cons_append]
  exact List.splitOn_append_cons_self_of_not_mem hprefix key

/-- A descriptor gives back the key origin path it was built from. -/
theorem extractKeyOriginPath_createDescriptor {keyOriginPath key descriptor : Str}
    (h : createDescriptor keyOriginPath key = .ok descriptor) :
    extractKeyOriginPathFromDescriptor descriptor = .ok keyOriginPath := by
  obtain ⟨hdescriptor, result, hvalid⟩ := descriptor_of_createDescriptor h
  obtain ⟨_, hclose⟩ := no_brackets_of_validateKeyOriginPath hvalid
  subst hdescriptor
  simp [extractKeyOriginPathFromDescriptor, splitOn_bracket_descriptor hclose, hvalid]

/-- A descriptor gives back its key, provided the key holds no closing bracket. -/
theorem extractKey_createDescriptor {keyOriginPath key descriptor : Str}
    (h : createDescriptor keyOriginPath key = .ok descriptor) (hkey : ']' ∉ key) :
    extractKeyFromDescriptor descriptor = some key := by
  obtain ⟨hdescriptor, result, hvalid⟩ := descriptor_of_createDescriptor h
  obtain ⟨_, hclose⟩ := no_brackets_of_validateKeyOriginPath hvalid
  subst hdescriptor
  simp [extractKeyFromDescriptor, splitOn_bracket_descriptor hclose,
    List.splitOn_eq_singleton hkey]

theorem extractFingerprint_createDescriptor {fingerprint path keyOrigin key descriptor : Str}
    (hkeyOrigin : createKeyOriginPath fingerprint path = .ok keyOrigin)
    (h : createDescriptor keyOrigin key = .ok descriptor) :
    extractFingerprintFromDescriptor descriptor = .ok fingerprint := by
  simp [extractFingerprintFromDescriptor, extractKeyOriginPath_createDescriptor h,
    extractFingerprint_createKeyOriginPath hkeyOrigin]

theorem extractAccountIndex_createDescriptor {keyOriginPath key descriptor : Str}
    (h : createDescriptor keyOriginPath key = .ok descriptor) :
    extractAccountIndexFromDescriptor descriptor = extractAccountIndexFromPath keyOriginPath := by
  simp [extractAccountIndexFromDescriptor, extractKeyOriginPath_createDescriptor h]

theorem extractDerivationPath_createDescriptor {fingerprint rest keyOrigin key descriptor : Str}
    (hkeyOrigin : createKeyOriginPath fingerprint ('m' :: '/' :: rest) = .ok keyOrigin)
    (h : createDescriptor keyOrigin key = .ok descriptor) :
    extractDerivationPathFromDescriptor descriptor = .ok ('m' :: '/' :: rest) := by
  simp [extractDerivationPathFromDescriptor, extractKeyOriginPath_createDescriptor h,
    keyOriginToDerivationPath_createKeyOriginPath hkeyOrigin]

/-- Cutting a path down to account level a second time changes nothing. -/
theorem extractAccountPathFromFullPath_idempotent (path : Str) :
    extractAccountPathFromFullPath (extractAccountPathFromFullPath path) =
      extractAccountPathFromFullPath path := by
  unfold extractAccountPathFromFullPath
  have hparts : ∀ part ∈ (segments path).take 4, '/' ∉ part :=
    fun part hpart => not_mem_splitOn (List.mem_of_mem_take hpart)
  have hne : (segments path).take 4 ≠ [] := by
    have := segments_ne_nil path
    cases hsegments : segments path with
    | nil => exact absurd hsegments this
    | cons first rest => simp
  rw [segments_joinSegments hparts hne, List.take_take]
  simp

end DerivationPathUtils
