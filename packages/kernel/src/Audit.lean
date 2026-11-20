import Lean
import codec.CodecProofs
import format.FormatProofs

/-!
Build-time gate: every theorem listed here may rest only on Lean's standard
axioms. A `sorry` shows up as `sorryAx` and an added `axiom` under its own
name, so either one fails `lake build`.
-/

open Lean Elab Command in
run_cmd do
  let allowed : Array Name := #[``propext, ``Quot.sound, ``Classical.choice]
  let audited : Array Name := #[
    ``Codec.decode_encode,
    ``Codec.encode_decode,
    ``Codec.encode_append_inj,
    ``Codec.encode_injective,
    ``Codec.decodeExact_encode,
    ``Codec.encode_decodeExact,
    ``Codec.decodeWithTail_encodeWithTail,
    ``Codec.encodeWithTail_decodeWithTail,
    ``Codec.encodeWithTail_injective,
    ``Format.alphabet_of_print,
    ``Format.parse_print,
    ``Format.print_parse,
    ``Format.print_injective,
    ``Format.parse_injective]
  for theoremName in audited do
    for axiomName in ← collectAxioms theoremName do
      unless allowed.contains axiomName do
        throwError "{theoremName} depends on disallowed axiom {axiomName}"
