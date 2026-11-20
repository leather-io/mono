import DerivationPathUtils

/-!
Executable model of `wallet-account-count.ts`, next to this file.
-/

namespace WalletAccountCount

open Js DerivationPathUtils

/-- The `highestAccountIndex` argument: a non-negative safe integer, or any other value. -/
inductive IndexInput where
  | valid (index : Nat)
  | other

def isValidAccountIndex : IndexInput → Bool
  | .valid _ => true
  | .other => false

def softwareAccountCountFromHighestIndex : IndexInput → Nat
  | .valid index => index + 1
  | .other => 1

structure KeychainEntry where
  descriptor : Str
  chain : Str

structure Tally where
  stacks : Nat
  bitcoin : List Nat

def stacksChain : Str := "stacks".toList

def bitcoinChain : Str := "bitcoin".toList

def softwareWalletType : Str := "software".toList

/-- One pass of the loop body in `countWalletAccounts`. -/
def tallyKeychain (fingerprint : Str) (tally : Tally) (entry : KeychainEntry) : Outcome Tally :=
  if entry.descriptor.isEmpty then .ok tally
  else
    match extractKeyOriginPathFromDescriptor entry.descriptor with
    | .unsupported => .unsupported
    | .throws => .ok tally
    | .ok keyOrigin =>
      if (segments keyOrigin).headD [] != fingerprint then .ok tally
      else if entry.chain = stacksChain then .ok { tally with stacks := tally.stacks + 1 }
      else if entry.chain = bitcoinChain then
        match extractAccountIndexFromDescriptor entry.descriptor with
        | .unsupported => .unsupported
        | .throws => .ok tally
        | .ok index =>
          .ok { tally with
            bitcoin := if index ∈ tally.bitcoin then tally.bitcoin else index :: tally.bitcoin }
      else .ok tally

def tallyKeychains (fingerprint : Str) (tally : Tally) : List KeychainEntry → Outcome Tally
  | [] => .ok tally
  | entry :: rest => do
    let next ← tallyKeychain fingerprint tally entry
    tallyKeychains fingerprint next rest

def countWalletAccounts (walletType fingerprint : Str) (highestAccountIndex : IndexInput)
    (keychains : List KeychainEntry) : Outcome Nat :=
  if walletType = softwareWalletType then
    .ok (softwareAccountCountFromHighestIndex highestAccountIndex)
  else do
    let tally ← tallyKeychains fingerprint { stacks := 0, bitcoin := [] } keychains
    pure (max tally.stacks tally.bitcoin.length)

end WalletAccountCount
