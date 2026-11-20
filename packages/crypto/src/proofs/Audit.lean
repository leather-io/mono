import Lean
import multisig.ProposalPreimageProofs
import DerivationPathUtilsProofs
import KeychainProofs
import WalletAccountCountProofs

/-!
Build-time gate: every theorem listed here may rest only on Lean's standard
axioms. A `sorry` shows up as `sorryAx` and an added `axiom` under its own
name, so either one fails `lake build`. `proof-coverage.spec.ts` checks that
every theorem it cites for an exported function is in this list.
-/

open Lean Elab Command in
run_cmd do
  let allowed : Array Name := #[``propext, ``Quot.sound, ``Classical.choice]
  let audited : Array Name := #[
    ``ProposalPreimage.encode_injective,
    ``ProposalPreimage.encode?_injective,
    ``ProposalPreimage.encodeFields_injective,
    ``ProposalPreimage.encode_not_injective_without_timestamp_bound,
    ``ProposalPreimage.u32be_wraps,
    ``ProposalPreimage.encode_domain_separated,
    ``ProposalPreimage.encode_length,
    ``DerivationPathUtils.extractSection_of_decimal,
    ``DerivationPathUtils.extractSection_of_hardened,
    ``DerivationPathUtils.extract_appendAddressIndexToPath,
    ``DerivationPathUtils.keyOriginToDerivationPath_createKeyOriginPath,
    ``DerivationPathUtils.extractFingerprint_createKeyOriginPath,
    ``DerivationPathUtils.no_brackets_of_validateKeyOriginPath,
    ``DerivationPathUtils.extractKeyOriginPath_createDescriptor,
    ``DerivationPathUtils.extractKey_createDescriptor,
    ``DerivationPathUtils.extractFingerprint_createDescriptor,
    ``DerivationPathUtils.extractAccountIndex_createDescriptor,
    ``DerivationPathUtils.extractDerivationPath_createDescriptor,
    ``DerivationPathUtils.extractAccountPathFromFullPath_idempotent,
    ``Keychain.unitLength_fingerprintAsNumberToHex,
    ``Keychain.fingerprintAsNumberToHex_injective,
    ``Keychain.parseHex_safelyReadPaddedFingerprint,
    ``Keychain.safelyReadPaddedFingerprint_idempotent,
    ``Keychain.parseHex_unpadHex,
    ``Keychain.unpadHex_idempotent,
    ``Keychain.makeAccountIdentifer_injective,
    ``WalletAccountCount.softwareAccountCountFromHighestIndex_pos,
    ``WalletAccountCount.countWalletAccounts_software_pos,
    ``WalletAccountCount.countWalletAccounts_le_length]
  for theoremName in audited do
    for axiomName in ← collectAxioms theoremName do
      unless allowed.contains axiomName do
        throwError "{theoremName} depends on disallowed axiom {axiomName}"
