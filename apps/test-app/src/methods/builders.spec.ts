// Builder combinations are built on demand, so their ids ARE the addressing
// scheme: `findSpec` reconstructs a spec from one. If the round trip breaks,
// every id in a report or a script stops resolving — silently.
import { describe, expect, test } from 'vitest';

import {
  buildFromSelection,
  builderSpecId,
  normalizeSelection,
  parseBuilderSpecId,
  visibleFields,
} from '../builders/spec-builder';
import { SIGHASH } from '../constants';
import { findSpec } from '../rpc-methods';
import { builderCombinationSpecs, specBuilders } from './builders';
import { psbtBuilder } from './psbt-builder';
import { stxOptionsBuilder } from './stx-options-builder';

describe.each(specBuilders.map(builder => [builder.id, builder] as const))(
  '%s builder',
  (_id, builder) => {
    test('every combination round-trips through its id', () => {
      for (const combination of builder.combinations()) {
        const selection = normalizeSelection(builder, combination);
        expect(parseBuilderSpecId(builder, builderSpecId(builder, selection))).toEqual(selection);
      }
    });

    test('every combination builds a distinct spec', () => {
      const ids = builder.combinations().map(c => buildFromSelection(builder, c).id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    test('the default selection is the bare builder id', () => {
      expect(builderSpecId(builder, normalizeSelection(builder, {}))).toBe(builder.id);
    });

    test('findSpec rebuilds a combination that is not in the catalog', () => {
      const [combination] = builder.combinations();
      const id = buildFromSelection(builder, combination).id;
      expect(findSpec(id)?.id).toBe(id);
    });
  }
);

describe('normalizeSelection', () => {
  test('drops a flag that the chosen input kind cannot carry', () => {
    // DEFAULT is taproot-only; switching to p2wpkh must not leave it selected.
    const selection = normalizeSelection(psbtBuilder, {
      inputs: 'p2wpkh',
      sighash: SIGHASH.DEFAULT,
    });
    expect(selection.sighash).not.toBe(SIGHASH.DEFAULT);
  });

  test('keeps DEFAULT for taproot', () => {
    const selection = normalizeSelection(psbtBuilder, {
      inputs: 'p2tr',
      sighash: SIGHASH.DEFAULT,
    });
    expect(selection.sighash).toBe(SIGHASH.DEFAULT);
  });

  test('resets a field that does not apply, so the id cannot encode it', () => {
    // `whitelist` only means something once a flag is set.
    const selection = normalizeSelection(psbtBuilder, {
      sighash: 'unset',
      whitelist: 'mismatched',
    });
    expect(selection.whitelist).toBe(psbtBuilder.defaults.whitelist);
    expect(builderSpecId(psbtBuilder, selection)).toBe('psbt');
  });

  test('hides signAtIndex until there is more than one input', () => {
    const single = normalizeSelection(psbtBuilder, { count: 1 });
    const double = normalizeSelection(psbtBuilder, { count: 2 });
    expect(visibleFields(psbtBuilder, single).map(f => f.field.key)).not.toContain('signAt');
    expect(visibleFields(psbtBuilder, double).map(f => f.field.key)).toContain('signAt');
  });
});

describe('psbt builder', () => {
  test('a value containing a hyphen survives the id round trip', () => {
    // `wsh-pk` and `single-acp` both contain the field separator's neighbour.
    const selection = normalizeSelection(psbtBuilder, {
      inputs: 'wsh-pk',
      sighash: SIGHASH.SINGLE_ANYONECANPAY,
      whitelist: 'mismatched',
    });
    const id = builderSpecId(psbtBuilder, selection);
    expect(id).toBe('psbt.inputs_wsh-pk.sighash_single-acp.whitelist_mismatched');
    expect(parseBuilderSpecId(psbtBuilder, id)).toEqual(selection);
  });

  test('the first sighash panel’s ids still resolve', () => {
    const spec = findSpec('sighash-p2tr-default-mismatched');
    expect(spec).toBeDefined();
    expect(spec?.method).toBe('signPsbt');
    expect(spec?.tags).toContain('divergent');
  });

  test('a foreign input is never expected to be signed', () => {
    const spec = buildFromSelection(psbtBuilder, { inputs: 'with-foreign' });
    expect(spec.description).toContain('foreign');
    expect(spec.tags).toContain('psbt');
  });

  test('broadcasting is unjudged — the outpoints are fictitious', () => {
    expect(buildFromSelection(psbtBuilder, { broadcast: true }).expect).toBe('manual');
    expect(buildFromSelection(psbtBuilder, {}).expect).toBe('success');
  });

  test('covers the sighash product plus the structural cases', () => {
    const combinations = psbtBuilder.combinations();
    const sighashCells = combinations.filter(c => c.sighash !== 'unset');
    // 6 ECDSA flags on three kinds, 7 on taproot, times three whitelist modes.
    expect(sighashCells).toHaveLength((6 + 7 + 6 + 6) * 3);
    expect(combinations.length).toBeGreaterThan(sighashCells.length);
  });
});

describe('stx options builder', () => {
  test('omits postConditionMode when the wallet should choose', () => {
    const spec = buildFromSelection(stxOptionsBuilder, {});
    expect(spec.id).toBe('stx-options');
    expect(spec.description).toContain('leaving the post-condition mode to the wallet');
  });

  test('names the mode it asked for', () => {
    const spec = buildFromSelection(stxOptionsBuilder, { mode: 'originator' });
    expect(spec.id).toBe('stx-options.mode_originator');
    expect(spec.description).toContain('ORIGINATOR');
  });
});

describe('builderCombinationSpecs', () => {
  test('scopes to one builder when asked', () => {
    const psbtOnly = builderCombinationSpecs('psbt');
    expect(psbtOnly.length).toBe(psbtBuilder.combinations().length);
    expect(psbtOnly.every(spec => spec.id.startsWith('psbt'))).toBe(true);
  });

  test('returns every builder when not', () => {
    expect(builderCombinationSpecs().length).toBe(
      specBuilders.reduce((total, builder) => total + builder.combinations().length, 0)
    );
  });
});
