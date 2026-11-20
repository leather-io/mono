import WalletAccountCount
import proofs.JsStringProofs

namespace WalletAccountCount

open Js DerivationPathUtils

/-- A software wallet always exposes at least one account. -/
theorem softwareAccountCountFromHighestIndex_pos (input : IndexInput) :
    1 ≤ softwareAccountCountFromHighestIndex input := by
  cases input <;> simp [softwareAccountCountFromHighestIndex]

theorem softwareAccountCountFromHighestIndex_valid (index : Nat) :
    softwareAccountCountFromHighestIndex (.valid index) = index + 1 := rfl

theorem countWalletAccounts_software_pos {fingerprint : Str} {input : IndexInput}
    {keychains : List KeychainEntry} {count : Nat}
    (h : countWalletAccounts softwareWalletType fingerprint input keychains = .ok count) :
    1 ≤ count := by
  simp only [countWalletAccounts, ite_true, Outcome.ok.injEq] at h
  rw [← h]
  exact softwareAccountCountFromHighestIndex_pos input

def Tally.size (tally : Tally) : Nat :=
  tally.stacks + tally.bitcoin.length

theorem size_tallyKeychain {fingerprint : Str} {tally next : Tally} {entry : KeychainEntry}
    (h : tallyKeychain fingerprint tally entry = .ok next) : next.size ≤ tally.size + 1 := by
  unfold tallyKeychain at h
  repeat' split at h
  all_goals first
    | (injection h with h
       subst h
       simp only [Tally.size]
       split <;> simp only [List.length_cons] <;> omega)
    | (injection h with h
       subst h
       simp only [Tally.size, List.length_cons]
       omega)
    | (injection h with h
       subst h
       simp only [Tally.size]
       omega)
    | injection h

theorem size_tallyKeychains {fingerprint : Str} {tally final : Tally}
    {keychains : List KeychainEntry}
    (h : tallyKeychains fingerprint tally keychains = .ok final) :
    final.size ≤ tally.size + keychains.length := by
  induction keychains generalizing tally with
  | nil =>
    simp only [tallyKeychains, Outcome.ok.injEq] at h
    simp [h]
  | cons entry rest ih =>
    unfold tallyKeychains at h
    obtain ⟨next, hnext, hrest⟩ := Outcome.bind_eq_ok h
    have hstep := size_tallyKeychain hnext
    have hfold := ih hrest
    simp only [List.length_cons]
    omega

/-- A hardware wallet never reports more accounts than it has registered keychains. -/
theorem countWalletAccounts_le_length {walletType fingerprint : Str} {input : IndexInput}
    {keychains : List KeychainEntry} {count : Nat} (hwallet : walletType ≠ softwareWalletType)
    (h : countWalletAccounts walletType fingerprint input keychains = .ok count) :
    count ≤ keychains.length := by
  simp only [countWalletAccounts, hwallet, ite_false] at h
  obtain ⟨tally, htally, hcount⟩ := Outcome.bind_eq_ok h
  simp only [Outcome.pure_eq_ok, Outcome.ok.injEq] at hcount
  have hsize := size_tallyKeychains htally
  simp only [Tally.size, List.length_nil] at hsize
  omega

end WalletAccountCount
