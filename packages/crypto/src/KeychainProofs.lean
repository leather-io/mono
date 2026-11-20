import Keychain
import proofs.JsStringProofs

namespace Keychain

open Js

/-- A 32-bit fingerprint always prints as exactly eight characters. -/
theorem unitLength_fingerprintAsNumberToHex {fingerprint : Nat} (h : fingerprint < 2 ^ 32) :
    unitLength (fingerprintAsNumberToHex fingerprint) = 8 := by
  have hlength : (hex fingerprint).length ≤ 8 :=
    (Nat.length_toDigits_le_iff (by decide) (by decide)).mpr (by simpa using h)
  rw [fingerprintAsNumberToHex, unitLength_padStartZero, unitLength_hex]
  omega

/-- Different fingerprints never print the same, padded or not. -/
theorem fingerprintAsNumberToHex_injective {a b : Nat}
    (h : fingerprintAsNumberToHex a = fingerprintAsNumberToHex b) : a = b := by
  have hparse := congrArg parseHex h
  simpa [fingerprintAsNumberToHex, parseHex_padStartZero, parseHex_hex] using hparse

theorem parseHex_fingerprintAsNumberToHex (fingerprint : Nat) :
    parseHex (fingerprintAsNumberToHex fingerprint) = fingerprint := by
  simp [fingerprintAsNumberToHex, parseHex_padStartZero, parseHex_hex]

theorem safelyReadPaddedFingerprint_eq (fingerprintHex : Str) :
    safelyReadPaddedFingerprint fingerprintHex = padStartZero 8 fingerprintHex := by
  unfold safelyReadPaddedFingerprint
  split
  · rfl
  · rename_i hlong
    have : 8 - unitLength fingerprintHex = 0 := by omega
    simp [padStartZero, this]

theorem unitLength_safelyReadPaddedFingerprint (fingerprintHex : Str) :
    8 ≤ unitLength (safelyReadPaddedFingerprint fingerprintHex) := by
  rw [safelyReadPaddedFingerprint_eq, unitLength_padStartZero]
  omega

/-- Padding only adds leading zeros: the number read back is unchanged. -/
theorem parseHex_safelyReadPaddedFingerprint (fingerprintHex : Str) :
    parseHex (safelyReadPaddedFingerprint fingerprintHex) = parseHex fingerprintHex := by
  rw [safelyReadPaddedFingerprint_eq, parseHex_padStartZero]

theorem safelyReadPaddedFingerprint_idempotent (fingerprintHex : Str) :
    safelyReadPaddedFingerprint (safelyReadPaddedFingerprint fingerprintHex) =
      safelyReadPaddedFingerprint fingerprintHex := by
  have hlong := unitLength_safelyReadPaddedFingerprint fingerprintHex
  generalize safelyReadPaddedFingerprint fingerprintHex = padded at hlong
  unfold safelyReadPaddedFingerprint
  split
  · omega
  · rfl

theorem safelyReadPaddedFingerprint_fingerprintAsNumberToHex (fingerprint : Nat) :
    safelyReadPaddedFingerprint (fingerprintAsNumberToHex fingerprint) =
      fingerprintAsNumberToHex fingerprint := by
  have hlong : 8 ≤ unitLength (fingerprintAsNumberToHex fingerprint) := by
    rw [fingerprintAsNumberToHex, unitLength_padStartZero]
    omega
  unfold safelyReadPaddedFingerprint
  split
  · omega
  · rfl

/-- Stripping leading zeros keeps the number. -/
theorem parseHex_unpadHex {value unpadded : Str} (h : unpadHex value = .ok unpadded) :
    parseHex unpadded = parseHex value := by
  unfold unpadHex at h
  split at h
  · cases h
  · split at h
    · simp only [Outcome.ok.injEq] at h
      rw [← h, parseHex_hex]
    · cases h

theorem unpadHex_hex (n : Nat) : unpadHex (hex n) = .ok (hex n) := by
  have hall : (hex n).all isHexChar = true := by
    simp only [List.all_eq_true]
    exact fun c hc => (forall_mem_hex n c hc).1
  unfold unpadHex
  split
  · rename_i hnil
    exact absurd hnil (hex_ne_nil n)
  · simp [hall, parseHex_hex]

theorem unpadHex_idempotent {value unpadded : Str} (h : unpadHex value = .ok unpadded) :
    unpadHex unpadded = .ok unpadded := by
  unfold unpadHex at h
  split at h
  · cases h
  · split at h
    · simp only [Outcome.ok.injEq] at h
      rw [← h]
      exact unpadHex_hex _
    · cases h

/-- Two account identifiers are equal only for the same fingerprint and account index. -/
theorem makeAccountIdentifer_injective {fingerprint fingerprint' : Str} {index index' : Nat}
    (h : makeAccountIdentifer fingerprint index = makeAccountIdentifer fingerprint' index') :
    fingerprint = fingerprint' ∧ index = index' := by
  unfold makeAccountIdentifer at h
  have hsplit := congrArg (fun s => (s.splitOn '/').getLast?) h
  simp only [List.splitOn_append_cons_self,
    List.splitOn_eq_singleton (slash_not_mem_decimal index),
    List.splitOn_eq_singleton (slash_not_mem_decimal index'),
    List.getLast?_append, List.getLast?_singleton, Option.some_or, Option.some.injEq] at hsplit
  have hindex := decimal_injective hsplit
  subst hindex
  exact ⟨List.append_cancel_right h, rfl⟩

end Keychain
