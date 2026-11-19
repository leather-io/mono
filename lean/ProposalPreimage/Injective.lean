import ProposalPreimage.Model

namespace ProposalPreimage

theorem u32be_length (n : Nat) : (u32be n).length = 4 := rfl

theorem u32be_injective {m n : Nat} (hm : m < 2 ^ 32) (hn : n < 2 ^ 32)
    (h : u32be m = u32be n) : m = n := by
  simp only [u32be, List.cons.injEq, and_true] at h
  obtain ⟨h0, h1, h2, h3⟩ := h
  have h0 := congrArg UInt8.toNat h0
  have h1 := congrArg UInt8.toNat h1
  have h2 := congrArg UInt8.toNat h2
  have h3 := congrArg UInt8.toNat h3
  simp only [UInt8.toNat_ofNat'] at h0 h1 h2 h3
  omega

theorem u64be_eq_two_u32be (n : Nat) :
    u64be n = u32be (n / 2 ^ 32) ++ u32be (n % 2 ^ 32) := by
  simp only [u64be, u32be, List.cons_append, List.nil_append, List.cons.injEq, and_true]
  and_intros <;> first | trivial | exact congrArg UInt8.ofNat (by omega)

theorem u64be_injective {m n : Nat} (hm : m < 2 ^ 64) (hn : n < 2 ^ 64)
    (h : u64be m = u64be n) : m = n := by
  rw [u64be_eq_two_u32be, u64be_eq_two_u32be] at h
  obtain ⟨hhigh, hlow⟩ := List.append_inj h (by simp [u32be_length])
  have hhigh := u32be_injective (by omega) (by omega) hhigh
  have hlow := u32be_injective (by omega) (by omega) hlow
  omega

/-- A length-prefixed field can be split off the front of a stream unambiguously. -/
theorem lengthPrefixed_append_inj {a b rest rest' : Bytes}
    (ha : a.length < 2 ^ 32) (hb : b.length < 2 ^ 32)
    (h : lengthPrefixed a ++ rest = lengthPrefixed b ++ rest') : a = b ∧ rest = rest' := by
  simp only [lengthPrefixed, List.append_assoc] at h
  obtain ⟨hlen, hrest⟩ := List.append_inj h (by simp [u32be_length])
  exact List.append_inj hrest (u32be_injective ha hb hlen)

theorem encodeFields_injective {f g : Fields}
    (hf : f.domainTag.length < 2 ^ 32 ∧ f.address.length < 2 ^ 32 ∧
      f.payload.length < 2 ^ 32 ∧ f.timestamp < 2 ^ 64)
    (hg : g.domainTag.length < 2 ^ 32 ∧ g.address.length < 2 ^ 32 ∧
      g.payload.length < 2 ^ 32 ∧ g.timestamp < 2 ^ 64)
    (h : encodeFields f = encodeFields g) : f = g := by
  obtain ⟨hf1, hf2, hf3, hf4⟩ := hf
  obtain ⟨hg1, hg2, hg3, hg4⟩ := hg
  obtain ⟨htag, h⟩ := lengthPrefixed_append_inj hf1 hg1 h
  obtain ⟨haddress, h⟩ := lengthPrefixed_append_inj hf2 hg2 h
  obtain ⟨hpayload, h⟩ := lengthPrefixed_append_inj hf3 hg3 h
  have htimestamp := u64be_injective hf4 hg4 h
  cases f
  cases g
  simp_all

theorem byteArray_eq_of_toList_eq {a b : ByteArray} (h : a.data.toList = b.data.toList) :
    a = b := by
  cases a
  cases b
  simp_all

/--
Main theorem. Two well-formed proposals with the same preimage are the same
proposal, so two different proposals can share a hash only through a SHA-256
collision.
-/
theorem encode_injective {p q : Proposal} (hp : p.WellFormed) (hq : q.WellFormed)
    (h : encode p = encode q) : p = q := by
  have hfields : p.fields = q.fields :=
    encodeFields_injective (by simpa [Proposal.fields, Proposal.WellFormed] using hp)
      (by simpa [Proposal.fields, Proposal.WellFormed] using hq) h
  obtain ⟨tag, address, payload, timestamp⟩ := p
  obtain ⟨tag', address', payload', timestamp'⟩ := q
  simp only [Proposal.fields, Fields.mk.injEq] at hfields
  obtain ⟨htag, haddress, hpayload, htimestamp⟩ := hfields
  have htag := String.toByteArray_inj.mp (byteArray_eq_of_toList_eq htag)
  have haddress := String.toByteArray_inj.mp (byteArray_eq_of_toList_eq haddress)
  have hpayload := byteArray_eq_of_toList_eq hpayload
  subst htag haddress hpayload htimestamp
  rfl

theorem encode?_injective {p q : Proposal} {bytes : Bytes}
    (hp : encode? p = some bytes) (hq : encode? q = some bytes) : p = q := by
  unfold encode? at hp hq
  split at hp <;> split at hq <;> simp_all
  exact encode_injective ‹_› ‹_› (hp.trans hq.symm)

/-- The u64 bound is needed: without it 2^64 and 0 share a preimage. -/
theorem encode_not_injective_without_timestamp_bound :
    encode ⟨"", "", ByteArray.empty, 2 ^ 64⟩ = encode ⟨"", "", ByteArray.empty, 0⟩ := by
  decide

/-- The u32 bound is needed: a length of 2^32 gets the same prefix as an empty field. -/
theorem u32be_wraps : u32be (2 ^ 32) = u32be 0 := by
  decide

/-- Every preimage built with a given tag starts with that tag's length-prefixed bytes. -/
theorem encode_domain_separated (p : Proposal) :
    lengthPrefixed p.domainTag.toUTF8.data.toList <+: encode p :=
  List.prefix_append _ _

theorem encode_length (p : Proposal) :
    (encode p).length =
      4 + p.domainTag.toUTF8.size + (4 + p.multisigAddress.toUTF8.size) +
        (4 + p.rawPayload.size) + 8 := by
  simp only [encode, encodeFields, Proposal.fields, lengthPrefixed, u32be, u64be,
    List.length_append, List.length_cons, List.length_nil, Array.length_toList,
    ByteArray.size_data]
  omega

end ProposalPreimage
