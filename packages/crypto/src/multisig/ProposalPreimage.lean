/-!
Executable model of the multisig proposal-hash preimage built by
`encodeProposalPreimage` in `proposal-preimage.ts`, next to this file.

    preimage = u32be(len tag) ‖ tag ‖ u32be(len address) ‖ address
             ‖ u32be(len payload) ‖ payload ‖ u64be(timestamp)

Text fields are UTF-8. SHA-256 over the preimage is out of scope.
-/

namespace ProposalPreimage

abbrev Bytes := List UInt8

def u32be (n : Nat) : Bytes :=
  [ UInt8.ofNat (n / 2 ^ 24 % 256),
    UInt8.ofNat (n / 2 ^ 16 % 256),
    UInt8.ofNat (n / 2 ^ 8 % 256),
    UInt8.ofNat (n % 256) ]

def u64be (n : Nat) : Bytes :=
  [ UInt8.ofNat (n / 2 ^ 56 % 256),
    UInt8.ofNat (n / 2 ^ 48 % 256),
    UInt8.ofNat (n / 2 ^ 40 % 256),
    UInt8.ofNat (n / 2 ^ 32 % 256),
    UInt8.ofNat (n / 2 ^ 24 % 256),
    UInt8.ofNat (n / 2 ^ 16 % 256),
    UInt8.ofNat (n / 2 ^ 8 % 256),
    UInt8.ofNat (n % 256) ]

def lengthPrefixed (bytes : Bytes) : Bytes :=
  u32be bytes.length ++ bytes

/-- The proposal as bytes: what the encoding sees once text is UTF-8 encoded. -/
structure Fields where
  domainTag : Bytes
  address : Bytes
  payload : Bytes
  timestamp : Nat

def encodeFields (f : Fields) : Bytes :=
  lengthPrefixed f.domainTag ++
    (lengthPrefixed f.address ++ (lengthPrefixed f.payload ++ u64be f.timestamp))

/-- The proposal as the TypeScript caller supplies it. -/
structure Proposal where
  domainTag : String
  multisigAddress : String
  rawPayload : ByteArray
  proposalTimestamp : Nat

def Proposal.fields (p : Proposal) : Fields where
  domainTag := p.domainTag.toUTF8.data.toList
  address := p.multisigAddress.toUTF8.data.toList
  payload := p.rawPayload.data.toList
  timestamp := p.proposalTimestamp

/-- Every length fits its u32 prefix and the timestamp fits its u64 slot. -/
def Proposal.WellFormed (p : Proposal) : Prop :=
  p.domainTag.toUTF8.size < 2 ^ 32 ∧
    p.multisigAddress.toUTF8.size < 2 ^ 32 ∧
      p.rawPayload.size < 2 ^ 32 ∧ p.proposalTimestamp < 2 ^ 64

instance (p : Proposal) : Decidable p.WellFormed := by
  unfold Proposal.WellFormed
  infer_instance

def encode (p : Proposal) : Bytes :=
  encodeFields p.fields

/-- `encode`, refusing inputs outside the preconditions of the injectivity theorem. -/
def encode? (p : Proposal) : Option Bytes :=
  if p.WellFormed then some (encode p) else none

end ProposalPreimage
