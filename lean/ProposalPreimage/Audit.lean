import Lean
import ProposalPreimage.Injective

/-!
Build-time gate: every theorem listed here may rest only on Lean's standard
axioms. A `sorry` shows up as `sorryAx` and an added `axiom` under its own
name, so either one fails `lake build`.
-/

open Lean Elab Command in
run_cmd do
  let allowed : Array Name := #[``propext, ``Quot.sound]
  let audited : Array Name := #[
    ``ProposalPreimage.encode_injective,
    ``ProposalPreimage.encode?_injective,
    ``ProposalPreimage.encodeFields_injective,
    ``ProposalPreimage.encode_not_injective_without_timestamp_bound,
    ``ProposalPreimage.u32be_wraps,
    ``ProposalPreimage.encode_domain_separated,
    ``ProposalPreimage.encode_length]
  for theoremName in audited do
    for axiomName in ← collectAxioms theoremName do
      unless allowed.contains axiomName do
        throwError "{theoremName} depends on disallowed axiom {axiomName}"
