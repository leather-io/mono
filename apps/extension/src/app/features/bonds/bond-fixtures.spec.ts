import { filterFixturePositions, getBondFixture } from './bond-fixtures';
import { bondScenarios } from './bond-scenarios';

describe('bond fixtures', () => {
  it.each(bondScenarios)('%s reports locked sats equal to its unspent outputs', scenario => {
    const fixture = getBondFixture(scenario);
    const unspentSats = fixture.positions
      .flatMap(position => position.outputs)
      .filter(output => !output.spent)
      .reduce((sum, output) => sum + output.amount.amount.toNumber(), 0);
    expect(fixture.lockedSats).toBe(unspentSats);
  });

  it('hides spent positions unless asked for them', () => {
    const fixture = getBondFixture('with-history');
    expect(filterFixturePositions(fixture)).toHaveLength(1);
    expect(filterFixturePositions(fixture, true)).toHaveLength(3);
  });

  it('places the ending-soon scenarios six days before unlock', () => {
    const { positions, burnTip } = getBondFixture('ending-soon');
    expect(positions[0]?.unlockBurnHeight).toBe(burnTip + 6 * 144);
  });

  it('keeps the registered renewal out of the locked total', () => {
    const fixture = getBondFixture('renewal-set');
    const upcoming = fixture.positions.find(position => position.bond.status === 'upcoming');
    expect(upcoming?.outputs).toHaveLength(0);
    expect(fixture.lockedSats).toBe(200_000_000);
  });
});
